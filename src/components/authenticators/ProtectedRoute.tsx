import permissions from "@/configs/permissions";
import useAuthStore from "@/store/authStore";
import { Navigate, Outlet, useLocation } from "react-router";

const ProtectedRoute = () => {
  const userProfile = useAuthStore((state) => state.userProfile);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const location = useLocation();

  // Show loading spinner while Zustand is rehydrating
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // After hydration, check if user is authenticated
  if (!userProfile) return <Navigate to="/" />;

  const role = userProfile.role;
  const rolePerms = permissions[role]?.routePaths || [];

  const path = location.pathname.toLowerCase();
  const baseSegment = path.split("/")[1];

  const roleBasePaths: Record<typeof role, string> = {
    superadmin: "superadmin",
    owner: "store-owner",
    manager: "store-manager",
    employee: "employee",
  };

  const isCorrectBasePath = baseSegment === roleBasePaths[role];
  const isAllowedMenu = rolePerms.some((routePath) => path.includes(routePath));
  const isAllowed = isCorrectBasePath && isAllowedMenu;

  return isAllowed ? <Outlet /> : <Navigate to="/403" />;
};

export default ProtectedRoute;
