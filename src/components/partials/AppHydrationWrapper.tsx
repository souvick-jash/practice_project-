// components/AppHydrationWrapper.tsx
import useAuthStore from "@/store/authStore";
import React, { useEffect, useState } from "react";
import Spinner from "../reusables/Spinner";

interface AppHydrationWrapperProps {
  children: React.ReactNode;
}

const AppHydrationWrapper = ({ children }: AppHydrationWrapperProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onHydrate(() =>
      setIsHydrated(false),
    );
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() =>
      setIsHydrated(true),
    );

    // Check if already hydrated
    setIsHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  if (!isHydrated) {
    return <Spinner />;
  }

  return <>{children}</>;
};

export default AppHydrationWrapper;
