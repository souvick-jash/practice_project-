import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import GuestRoute from '../components/authenticators/GuestRoute';
import ProtectedRoute from '../components/authenticators/ProtectedRoute';
import ErrorPage from '../components/pages/ErrorPage';
import FullPageSpinner from '@/components/reusables/FullPageSpinner';
import DashboardPage from '@/components/pages/superadmin/DashboardPage';
import SomethingWentWrong from '@/components/reusables/error/SomethingWentWrong';

const StoreManagementPage = lazy(() => import('@/components/pages/superadmin/StoreManagementPage'));
const NotificationsAlertsPage = lazy(
  () => import('@/components/pages/superadmin/NotificationsAlerts')
);
const GenieRequestsPage = lazy(() => import('@/components/pages/superadmin/GenieRequestsPage'));
const UploadedFilesPage = lazy(() => import('@/components/pages/superadmin/UploadedFilesPage'));
const LoginPage = lazy(() => import('@/components/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/components/pages/superadmin/ProfilePage'));
const OwnerManagement = lazy(() => import('@/components/pages/superadmin/OwnerManagement'));
const router = createBrowserRouter([
  {
    Component: () => <Suspense fallback={<FullPageSpinner />}>{<MainLayout />}</Suspense>,
    children: [
      // Guest Routes
      {
        Component: GuestRoute,
        children: [
          {
            index: true,
            Component: LoginPage,
            errorElement: <SomethingWentWrong />,
          },
        ],
      },
    ],
  },
  {
    Component: () => (
      <Suspense fallback={<FullPageSpinner />}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      {
        Component: ProtectedRoute,
        children: [
          {
            path: 'superadmin',
            children: [
              {
                path: 'dashboard',
                Component: DashboardPage,
                errorElement: <SomethingWentWrong />,
              },
              {
                path: 'profile',
                Component: ProfilePage,
                errorElement: <SomethingWentWrong />,
              },
              {
                path: 'owner-management',
                Component: OwnerManagement,
                errorElement: <SomethingWentWrong />,
              },
              {
                path: 'store-management',
                children: [
                  {
                    index: true,
                    Component: StoreManagementPage,
                    errorElement: <SomethingWentWrong />,
                  },
                  // {
                  //   path: 'manufacturers',
                  //   Component: ManufacturerPage,
                  //   errorElement: <SomethingWentWrong />,
                  // },
                ],
              },
              {
                path: 'alerts',
                Component: NotificationsAlertsPage,
                errorElement: <SomethingWentWrong />,
              },
              {
                path: 'genie-requests',
                Component: GenieRequestsPage,
                errorElement: <SomethingWentWrong />,
              },
              {
                path: 'uploaded-files',
                Component: UploadedFilesPage,
                errorElement: <SomethingWentWrong />,
              },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', Component: ErrorPage },
]);

export default router;
