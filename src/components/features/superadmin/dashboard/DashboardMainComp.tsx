import { lazy, useMemo } from 'react';
import DashboardCard from '@/components/reusables/dashboard/DashboardCard';
import SearchAndFilter from '@/components/reusables/dashboard/SearchAndFilter';
import { CircleDollarSign, ReceiptText, UserRound, UserRoundPlus } from 'lucide-react';

import {
  useFetchFailedImportCount,
  useFetchTotalOnboardedCount,
  useFetchTotalRevenue,
  useFetchTotalSubscribersCount,
} from '@/hooks/dashboardHooks';

const SubscriptionsBarChart = lazy(() => import('./SubscriptionBarChart'));
const MapSection = lazy(() => import('./MapSection'));

const DashboardMainComp = () => {
  const { data: totalSubscriberCount } = useFetchTotalSubscribersCount();

  const { data: totalOnboardedCount } = useFetchTotalOnboardedCount();

  const { data: totalRevenue } = useFetchTotalRevenue();
  const { data: failedImportCount } = useFetchFailedImportCount();

  const dashboardCards = useMemo(
    () => [
      {
        title: 'Total Subscribers',
        value: totalSubscriberCount ?? 0,
        icon: UserRound,
        leadingIcon: '',
      },
      {
        title: 'Monthly Onboarded',
        value: totalOnboardedCount ?? 0,
        icon: UserRoundPlus,
        leadingIcon: '',
      },
      {
        title: 'Monthly Revenue',
        value: totalRevenue?.toFixed(2) ?? 0.0,
        icon: CircleDollarSign,
        leadingIcon: '$',
      },
      {
        title: 'Failed Imports',
        value: failedImportCount ?? 0,
        icon: ReceiptText,
        leadingIcon: '',
      },
    ],
    [totalSubscriberCount, totalOnboardedCount, totalRevenue, failedImportCount]
  );

  return (
    <div className="dashboard-content-wrap">
      <div className="mb-6 grid grid-cols-4 gap-5">
        {dashboardCards?.map((card, idx) => (
          <div className="d-card-item" key={idx}>
            <DashboardCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              leadingIcon={card?.leadingIcon}
            />
          </div>
        ))}
      </div>
      <div className="map-section relative overflow-hidden rounded-2xl">
        <div className="absolute top-7 right-7 z-10">
          <SearchAndFilter placeholder="Search by store name or location" />
        </div>

        <div className="mb-6 w-full">
          <SubscriptionsBarChart />
        </div>

        <div className="map-holder relative pb-15">
          <MapSection />
        </div>
      </div>
    </div>
  );
};

export default DashboardMainComp;
