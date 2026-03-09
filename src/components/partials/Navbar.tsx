import AvatarDropdown from "./AvatarDropdown";
import { SidebarTrigger } from "../ui/sidebar";
// import { Button } from '../ui/button';
// import { Bell, Search } from 'lucide-react';
import { useLocation } from "react-router";
import { getPageTitle } from "@/utils/getPageTitle";
import useAuthStore from "@/store/authStore";
import { capitalize } from "@/utils/strings";

const Navbar = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname || "");
  const userProfile = useAuthStore((state) => state.userProfile);

  return (
    <nav className="header-row flex items-center justify-between gap-x-5 py-5">
      {/* Left Side */}
      <div className="nav-left flex items-center">
        <div className="sidebar-toggle">
          <SidebarTrigger />
        </div>
        <div className="page-title d-header-title">
          <h1>{pageTitle}</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* <Button variant="headerIcon" size="iconLg">
          <Search />
        </Button>
        <Button variant="headerIcon" size="iconLg" className="header-noti-icon">
          <Bell />
        </Button> */}

        <div className="header-profile">
          <AvatarDropdown
            avatarTmage={userProfile?.avatar_url}
            userRole={userProfile?.role}
          />
        </div>
        <div className="header-user-name">
          <p className="font-semiboldame">{userProfile?.name ?? "User"}</p>
          <p className="text-foreground text-sm font-semibold">
            {userProfile?.role ? capitalize(userProfile.role) : ""}
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
