import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import supabase from "@/configs/supabse";
import logger from "@/utils/logger";

type LoginWithEmailPasswordCredentials = {
  email: string;
  password: string;
};

type LoginWithEmailOTPCredentials = {
  email: string;
};

type VerifyEmailOTPCredentials = {
  email: string;
  token: string; // The OTP code
};

type LoginWithPhoneOTPCredentials = {
  phone: string;
};

type VerifyPhoneOTPCredentials = {
  phone: string;
  token: string; // The OTP code
};

// * ====================== Login Functionality [Email & Password] ====================== *
const loginWithEmailPassword = async (
  credentials: LoginWithEmailPasswordCredentials,
) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
};

export const useLoginWithEmailPassword = () => {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    mutationFn: loginWithEmailPassword,

    onSuccess: (responseData) => {
      logger.log("Login success:", responseData);

      // Invalidate user profile query to trigger refetch
      if (responseData.user) {
        queryClient.invalidateQueries({
          queryKey: ["userProfile", responseData.user.id],
        });
      }
    },
  });

  return mutate;
};

// * ====================== Login Functionality [Email & OTP] ====================== *
const loginWithEmailOTP = async (credentials: LoginWithEmailOTPCredentials) => {
  const email = credentials.email;

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("id, status, role")
    .eq("email", email)
    .maybeSingle();

  if (!userData) throw new Error("The provided Email is not registered");
  if (userDataError) throw userDataError;
  if (userData.status === "inactive")
    throw new Error("Your account is Inactive");

  // if (userData.role === 'owner') {
  //   const { data: staxCustomerData, error: staxCustomerError } = await supabase
  //     .from('stax_customers')
  //     .select(
  //       `
  //       id, user_id,
  //       stax_subscriptions(
  //         id, active
  //       )
  //     `
  //     )
  //     .eq('user_id', userData?.id)
  //     .maybeSingle();

  //   if (!staxCustomerData) throw new Error('Your Billing Account has not been created yet');
  //   if (staxCustomerError) throw staxCustomerError;
  //   if (staxCustomerData?.stax_subscriptions?.length === 0)
  //     throw new Error("You dont't have any active subscriptions. Contact your administrator");
  // }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: credentials.email,
    options: {
      emailRedirectTo: import.meta.env.VITE_APP_URL,
      shouldCreateUser: false,
    },
  });

  if (error) throw error;
  return data;
};

export const useLoginWithEmailOTP = () => {
  return useMutation({
    mutationFn: loginWithEmailOTP,

    onSuccess: (data) => {
      logger.log("OTP sent to your email successfully:", data);
    },
  });
};

// * ====================== Login Functionality [Email OTP Verification] ====================== *
const verifyEmailOTP = async (credentials: VerifyEmailOTPCredentials) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: credentials.email,
    token: credentials.token,
    type: "email",
  });

  if (error) throw error;
  return data;
};

export const useVerifyEmailOTP = () => {
  return useMutation({
    mutationFn: verifyEmailOTP,

    onSuccess: (data) => {
      logger.log("OTP verified successfully:", data);
    },
  });
};

// * ====================== Login Functionality [Phone & OTP] ====================== *
const loginWithPhoneOTP = async (credentials: LoginWithPhoneOTPCredentials) => {
  const phone = credentials.phone;

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("id, status, role")
    .eq("phone", phone)
    .maybeSingle();

  if (!userData) throw new Error("The provided Phone is not registered");
  if (userDataError) throw userDataError;
  if (userData.status === "inactive")
    throw new Error("Your account is Inactive");

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: credentials.phone,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) throw error;
  return data;
};

export const useLoginWithPhoneOTP = () => {
  return useMutation({
    mutationFn: loginWithPhoneOTP,

    onSuccess: (data) => {
      logger.log("OTP sent to phone successfully:", data);
    },
  });
};

// * ====================== Login Functionality [OTP Verification] ====================== *
const verifyPhoneOTP = async (credentials: VerifyPhoneOTPCredentials) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: credentials.phone,
    token: credentials.token,
    type: "sms",
  });

  if (error) throw error;
  return data;
};

export const useVerifyPhoneOTP = () => {
  return useMutation({
    mutationFn: verifyPhoneOTP,

    onSuccess: (data) => {
      logger.log("Phone OTP verified successfully:", data);
    },
  });
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
      logger.log("Logout success");
      clearAuth();
      useAuthStore.persist.clearStorage();
      // Clear all cached queries
      queryClient.clear();
    },
  });

  return mutate;
};
