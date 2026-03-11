import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import supabase from '@/configs/supabse';
import logger from '@/utils/logger';

type LoginWithEmailPasswordCredentials = {
  email: string;
  password: string;
};

// type LoginWithEmailOTPCredentials = {
//   email: string;
// };

// type VerifyEmailOTPCredentials = {
//   email: string;
//   token: string; // The OTP code
// };

// type LoginWithPhoneOTPCredentials = {
//   phone: string;
// };

// type VerifyPhoneOTPCredentials = {
//   phone: string;
//   token: string; // The OTP code
// };

// * ====================== Login Functionality [Email & Password] ====================== *
const loginWithEmailPassword = async (credentials: LoginWithEmailPasswordCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
};

export const useLoginWithEmailPassword = () => {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    mutationFn: loginWithEmailPassword,

    onSuccess: (responseData) => {
      logger.log('Login success:', responseData);

      // Invalidate user profile query to trigger refetch
      if (responseData.user) {
        queryClient.invalidateQueries({
          queryKey: ['userProfile', responseData.user.id],
        });
      }
    },
  });

  return mutate;
};

// * ====================== Logout Functionality ====================== *
const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  const mutate = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      logger.log('Logout success');
      clearAuth();
      useAuthStore.persist.clearStorage();
      // Clear all cached queries
      queryClient.clear();
    },
  });

  return mutate;
};
