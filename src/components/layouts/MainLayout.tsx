import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="auth-page-wrap bg-auth-bg">
      <Outlet />
    </div>
  );
};

export default MainLayout;
