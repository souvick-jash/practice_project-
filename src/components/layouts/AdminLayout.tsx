import { Outlet } from 'react-router';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../partials/AppSidebar';
import Navbar from '../partials/Navbar';
import { useActiveUserGuard } from '@/hooks/enforceUserHooks';
import { LoadScriptNext } from '@react-google-maps/api';
// import HelpTicketForm from "../features/generic/HelpTicketForm";

const libraries: 'places'[] = ['places'];
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

const AdminLayout = () => {
  useActiveUserGuard();

  return (
    <LoadScriptNext googleMapsApiKey={GOOGLE_PLACES_API_KEY} libraries={libraries}>
      <div className="flex">
        <SidebarProvider>
          <AppSidebar />
          <main className="main-content flex-1 overflow-hidden px-8">
            <Navbar />
            <div className="admin-content-wrap pt-1 sm:pt-5">
              <Outlet />
              {/* <HelpTicketForm /> */}
            </div>
          </main>
        </SidebarProvider>
      </div>
    </LoadScriptNext>
  );
};

export default AdminLayout;
