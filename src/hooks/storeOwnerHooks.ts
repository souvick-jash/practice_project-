import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timeConverter } from '@/utils/time';
import supabase from '@/configs/supabse';
import useAuthStore from '@/store/authStore';
import type { StoreOwner } from '@/types/types';
import { generateRandomId } from '@/utils/strings';

interface CreateOwnerInput {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  address: string;
  street: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
  zip: string;
  lat: string;
  lng: string;
}

interface UpdateOwnerInput {
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  address: string;
  street: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
  zip: string;
  lat: string;
  lng: string;
}

// * ====================== Fetch All Store Owners ====================== *
const fetchAllOwners = async () => {
  // Step 1: Fetch store owners + related user data
  const { data: storeOwners, error } = await supabase
    .from('store_owners')
    .select(
      `
      id,
      user:users (
        *
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Step 2: Fetch all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({});

  if (authError) throw authError;

  // Step 3: Merge auth data (last_sign_in_at) with your store owner records
  const result = storeOwners.map((owner) => {
    const user: any = owner.user;
    const authUser = authUsers.users.find((authU) => authU.id === user.auth_user_id);
    return {
      store_owner_id: owner.id,
      ...user,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
    };
  });

  return result;
};

export const useFetchAllOwners = () => {
  return useQuery({
    queryKey: ['owners'],
    queryFn: fetchAllOwners,
    staleTime: timeConverter(20, 'minute'),
  });
};

// * ====================== Fetch Single Store Owner ====================== *
const fetchSingleOwner = async (ownerId: string): Promise<StoreOwner | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'owner')
    .eq('id', ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const useFetchSingleOwner = (ownerId?: string) => {
  return useQuery({
    queryKey: ['owner', ownerId],
    queryFn: () => fetchSingleOwner(ownerId!),
    enabled: !!ownerId,
    staleTime: timeConverter(10, 'minute'),
  });
};

// * ====================== Create Store Owner ====================== *
export const createOwner = async (ownerData: CreateOwnerInput) => {
  const userProfile = useAuthStore.getState().userProfile;
  const {
    name,
    email,
    phone,
    status,
    address,
    street,
    city,
    state,
    state_code,
    country,
    country_code,
    zip,
    lat,
    lng,
  } = ownerData;
  const password = `Password@${new Date().getFullYear()}`;
  const uniqueId = generateRandomId();

  // Check if user with same email or phone number already exists
  const { data: existingUsers, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (fetchError) {
    throw fetchError;
  }

  if (existingUsers && existingUsers.length > 0) {
    throw new Error('User with the same email or phone number already exists');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    phone,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });

  if (authError || !authData?.user) {
    throw authError || new Error('User creation failed');
  }

  const authUserId = authData.user.id;

  // Insert into users table
  const { error: dbError, data: insertedUserData } = await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      unique_id: uniqueId,
      name,
      email,
      phone,
      role: 'owner',
      status,
      address,
      street,
      city,
      state,
      state_code,
      country,
      country_code,
      zip,
      lat,
      lng,
      created_by_user_id: userProfile?.id,
      updated_by_user_id: userProfile?.id,
    })
    .select();

  if (dbError || !insertedUserData?.length) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback
    throw dbError || new Error('Failed to insert user record');
  }

  const insertedUserId = insertedUserData[0].id;

  // Insert into store_owners table
  const { error: storeOwnerError } = await supabase.from('store_owners').insert({
    user_id: insertedUserId,
  });

  if (storeOwnerError) {
    await supabase.auth.admin.deleteUser(authUserId); // rollback again
    throw storeOwnerError;
  }

  return { success: true, userId: authUserId };
};

export const useCreateOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'], exact: false });
    },
  });
};

// * ====================== Delete Store Owner ====================== *
export const deleteStoreOwner = async (userId: string) => {
  if (!userId) throw new Error('User cannot be fetched');

  // Get auth_user_id for Auth deletion
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('auth_user_id')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError || !userData?.auth_user_id) {
    throw fetchError || new Error('User not found');
  }

  const authUserId = userData.auth_user_id;

  // Delete from store_owners
  const { error: storeOwnerDeleteError } = await supabase
    .from('store_owners')
    .delete()
    .eq('user_id', userId);

  if (storeOwnerDeleteError) throw storeOwnerDeleteError;

  // Delete from users table
  const { error: userDeleteError } = await supabase.from('users').delete().eq('id', userId);

  if (userDeleteError) throw userDeleteError;

  // Delete from Supabase Auth
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUserId);

  if (authDeleteError) throw authDeleteError;

  return { success: true };
};

export const useDeleteStoreOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStoreOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'], exact: false });
    },
  });
};

// * ====================== Update Store Owner ====================== *
export const updateOwner = async (updateInputData: UpdateOwnerInput) => {
  const {
    userId,
    name,
    email,
    phone,
    status,
    address,
    street,
    city,
    state,
    state_code,
    country,
    country_code,
    zip,
    lat,
    lng,
  } = updateInputData;

  const userProfile = useAuthStore.getState().userProfile;

  // Optional: check for duplicates if email/phone changed (excluding self)
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .neq('id', userId);

  if (checkError) throw checkError;
  if (existingUsers?.length) {
    throw new Error('Store owner with this email or phone number already exists');
  }

  const { data: storeOwner, error: fetchStoreOwnerError } = await supabase
    .from('users')
    .select('auth_user_id')
    .eq('role', 'owner')
    .eq('id', userId)
    .maybeSingle();

  if (!storeOwner) throw new Error('Store owner not found');

  if (status === 'inactive') {
    const storeLocationIds =
      (storeOwner as any)?.store_owner?.[0]?.store_location?.map((location: any) => location.id) ||
      [];

    const userIds =
      (storeOwner as any)?.store_owner?.[0]?.store_location?.flatMap(
        (location: any) => location.store_employees?.map((employee: any) => employee.user_id) || []
      ) || [];

    if (userIds && userIds.length > 0) {
      const { error: updateUsersError } = await supabase
        .from('users')
        .update({
          status,
          updated_by_user_id: userProfile?.id,
          updated_at: new Date().toISOString(),
        })
        .in('id', userIds);

      if (updateUsersError) throw updateUsersError;
    }

    if (storeLocationIds && storeLocationIds.length > 0) {
      const { error: updateLocationsError } = await supabase
        .from('store_locations')
        .update({
          status,
          updated_by_user_id: userProfile?.id,
          updated_at: new Date().toISOString(),
        })
        .in('id', storeLocationIds);

      if (updateLocationsError) throw updateLocationsError;
    }
  }

  if (fetchStoreOwnerError) throw fetchStoreOwnerError;

  const auth_user_id = storeOwner?.auth_user_id;

  // Update Supabase Auth email & metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(auth_user_id, {
    email,
    phone,
    user_metadata: {
      display_name: name,
    },
  });
  if (authError) throw authError;

  // Update in users table
  const { error: dbError } = await supabase
    .from('users')
    .update({
      name,
      email,
      phone,
      status,
      address,
      street,
      city,
      state,
      state_code,
      country,
      country_code,
      zip,
      lat,
      lng,
      updated_by_user_id: userProfile?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (dbError) throw dbError;

  return { success: true };
};

export const useUpdateOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['owner'], exact: false });
    },
  });
};
