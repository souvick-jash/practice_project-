import useAuthStore from "@/store/authStore";
import { Navigate, Outlet } from "react-router";

const GuestRoute = () => {
  const session = useAuthStore((state) => state.session);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const userProfile = useAuthStore((state) => state.userProfile);
  const userRole = userProfile?.role;

  if (isAuthInitialized && session?.access_token) {
    switch (userRole) {
      case "superadmin":
        return <Navigate to="/superadmin/dashboard" replace />;
      case "owner":
        return <Navigate to="/store-owner/dashboard" replace />;
      case "manager":
        return <Navigate to="/store-manager/dashboard" replace />;
      case "employee":
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/404" replace />;
    }
  }

  return <Outlet />;
};

export default GuestRoute;
