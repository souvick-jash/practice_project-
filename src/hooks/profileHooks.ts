import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import type { UpdateUserData, UserProfile } from '@/types/types';
import logger from '@/utils/logger';
import { timeConverter } from '@/utils/time';
import { nanoid } from 'nanoid';

// * ====================== Fetch User Profile ====================== *
const fetchUserProfile = async (authUserId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    logger.error('Error fetching user profile:', error);
    throw error;
  }

  if (!data) {
    throw new Error('User profile not found');
  }

  return data as UserProfile;
};

export const useFetchUserProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  const query = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user?.id, // Only run when user is authenticated
    staleTime: timeConverter(1, 'week'),
  });

  // Handle success and error cases with useEffect
  useEffect(() => {
    if (query.data) {
      setUserProfile(query.data);
      // logger.log('User profile fetched');
    }
  }, [query.data, setUserProfile]);

  useEffect(() => {
    if (query.error) {
      logger.error('Failed to fetch user profile:', query.error);
    }
  }, [query.error]);

  return query;
};

// * ====================== Update User Profile ====================== *
const updateUser = async (userUpdateData: UpdateUserData, imageFile: File | null) => {
  let avatar_url: string | null = null;

  // --- Upload Image if Provided ---
  if (imageFile) {
    const uniqueId = nanoid();
    const fileName = `profile/${uniqueId}-${imageFile.name}`;
    const { error: uploadImageError } = await supabase.storage
      .from('store-bucket')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadImageError) throw uploadImageError;

    const { data: imageData } = supabase.storage.from('store-bucket').getPublicUrl(fileName);
    avatar_url = imageData.publicUrl;
  }

  // --- Get Authenticated User ---
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw userError || new Error('No authenticated user');

  const user = userData.user;

  // --- Update Supabase Auth table ---
  const { authData, userTableData } = userUpdateData;

  const updatePayload: Parameters<typeof supabase.auth.updateUser>[0] = {};

  if (authData?.email) updatePayload.email = authData.email;
  if (authData?.phone) updatePayload.phone = authData.phone;

  const metadata = {
    ...(authData?.display_name && { display_name: authData.display_name }),
    ...(avatar_url && { avatar_url }),
  };

  if (Object.keys(metadata).length > 0) {
    updatePayload.data = metadata;
  }

  const { error: authUpdateError } = await supabase.auth.updateUser(updatePayload);
  if (authUpdateError) throw authUpdateError;

  // --- Update users table ---
  const updatedUserFields = {
    ...userTableData,
    ...(avatar_url && { avatar_url }),
  };

  const { error: dbUpdateError } = await supabase
    .from('users')
    .update(updatedUserFields)
    .eq('auth_user_id', user.id);

  if (dbUpdateError) throw dbUpdateError;

  return { success: true, userId: user.id };
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incomingData: { userUpdateData: UpdateUserData; imageFile: File | null }) => {
      return updateUser(incomingData.userUpdateData, incomingData.imageFile);
    },

    onSuccess: () => {
      // logger.log('User update success:', data);

      // Invalidate user profile query
      queryClient.invalidateQueries({
        queryKey: ['userProfile'],
        exact: false,
      });
    },
    onError: (error) => {
      logger.error('User update failed:', error);
    },
  });
};

// * ====================== Fetch Single User Details ====================== *
const fetchUserDetails = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

  if (error) {
    logger.error('Error fetching user details:', error);
    throw error;
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data as UserProfile;
};

export const useFetchUserDetails = (userId: string, options = {}) => {
  const query = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => fetchUserDetails(userId),
    staleTime: timeConverter(20, 'minute'),
    ...options,
  });

  return query;
};
