import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuthStore from "@/store/authStore";
import { menuItems } from "@/configs/menu";

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const userProfile = useAuthStore((state) => state.userProfile);
  const role = userProfile?.role;

  // Filter menus based on user role
  const filteredMenus = menuItems.filter((item) =>
    item.roles.includes(role || ""),
  );

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="pt-9 pb-9">
        <div className="sidebar-logo text-center">
          <img
            src="/assets/images/logo.webp"
            alt="Logo"
            className="mx-auto"
            fetchPriority="high"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {filteredMenus.map((menuItem) => {
            const isActive = location.pathname.startsWith(menuItem.url);
            return (
              <SidebarMenuItem key={menuItem.title}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive
                      ? "bg-sidebar-foreground text-sidebar-primary-foreground"
                      : ""
                  }
                >
                  <Link to={menuItem.url}>
                    <menuItem.icon />
                    <span>{menuItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {state === "expanded" && (
          <div className="px-2 py-4 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} QR Floor Genie. All Rights
              Reserved.
            </p>
            <ul className="mt-2 flex items-center justify-center gap-4 text-xs">
              <li>
                <Link
                  to={import.meta.env.VITE_PRIVACY_POLICY_URL}
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={import.meta.env.VITE_TERMS_AND_CONDITIONS_URL}
                  target="_blank"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
