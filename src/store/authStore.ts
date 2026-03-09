import type { AuthState } from "@/types/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      userProfile: null,
      isAuthInitialized: false,
      _hasHydrated: false,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setUserProfile: (userProfile) => set({ userProfile }),
      setIsAuthInitialized: (isAuthInitialized) => set({ isAuthInitialized }),
      clearAuth: () => set({ session: null, user: null, userProfile: null }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
export default useAuthStore;
