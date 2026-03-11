/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import supabase from '@/configs/supabse';
import { useLogout } from './userAuthHooks';
import { errorTransformer } from '@/utils/error';
import { toast } from 'react-toastify';

// Auto Kickout Inactive User
export const useActiveUserGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate: logoutMutaion } = useLogout();

  const { data, isFetching } = useQuery({
    queryKey: ['active-user-check', location.pathname], // force change
    queryFn: getLoggedInUser,
  });

  useEffect(() => {
    if (data && data.status === 'inactive') {
      logoutMutaion(undefined, {
        onSuccess: () => {
          navigate('/');
        },
        onError: (error) => {
          const message = errorTransformer(error);
          toast.error(message);
        },
      });
    }
  }, [data?.status]);

  return {
    isChecking: isFetching,
  };
};

// Get the logged in user information
export const getLoggedInUser = async () => {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userData.user.id)
    .maybeSingle();

  if (error) throw error;
  return profile;
};

// Utility function to check if the current user is active
export const isCurrentUserActive = async () => {
  const data = await getLoggedInUser();
  return data?.status === 'active';
};
