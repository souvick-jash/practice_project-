import { Button } from '@/components/ui/button';
import StoreManagementDataTable from './StoreManagementDataTable';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
// import { useSyncProductVendors, useUpsertVendors } from '@/hooks/extraHooks';

const StoreManagementMainComp = () => {
  // const { mutate: upsertVendorMutation } = useUpsertVendors();
  // const { mutate: syncProductVendorsMutation } = useSyncProductVendors();

  const handleUpsertVendor = () => {
    // upsertVendorMutation();
  };

  const handleSyncProductVendors = () => {
    // syncProductVendorsMutation();
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="link" className="mr-5 hidden font-bold" onClick={handleUpsertVendor}>
          Add Vendors
        </Button>

        <Button variant="link" className="mr-5 hidden font-bold" onClick={handleSyncProductVendors}>
          Sync Vendors
        </Button>

        <Link to={'/superadmin/store-management/manufacturers'}>
          <Button variant="link" className="font-bold">
            All Manufacturers <ArrowRight />
          </Button>
        </Link>
      </div>

      <div className="dashboard-content-wrap">
        <div className="d-full-card-wrap">
          <div className="data-table-wrap">
            <StoreManagementDataTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreManagementMainComp;
