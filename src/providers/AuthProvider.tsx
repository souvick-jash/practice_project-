import FullPageSpinner from "@/components/reusables/FullPageSpinner";
import supabase from "@/configs/supabse";
import { useFetchUserProfile } from "@/hooks/profileHooks";
import useAuthStore from "@/store/authStore";
import type React from "react";
import { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const setIsAuthInitialized = useAuthStore(
    (state) => state.setIsAuthInitialized,
  );
  const user = useAuthStore((state) => state.user);

  // Fetch user profile when authenticated
  const { data: userProfile, isLoading: isProfileLoading } =
    useFetchUserProfile();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setUserProfile(userProfile ?? null);
      setIsAuthInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setIsAuthInitialized, setUserProfile, userProfile]);

  // Show loading while auth is initializing or profile is loading (for authenticated users)
  if (!isAuthInitialized || (user && isProfileLoading)) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
};

export default AuthProvider;
