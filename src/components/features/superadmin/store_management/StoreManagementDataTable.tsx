import { useEffect } from 'react';
import { errorTransformer } from '@/utils/error';
import { toast } from 'react-toastify';
// import { DataTable } from '@/components/reusables/datatable/data-table';
// import actionMenuItems from './customizer';
// import columns from './columns';
import { useFetchAllStores } from '@/hooks/storeManagementHooks';

const StoreManagementDataTable = () => {
  const { data, isError, error } = useFetchAllStores();
  const content = data ?? [];

  useEffect(() => {
    if (isError) {
      const message = errorTransformer(error);
      toast.error(message);
    }
  }, [isError, error]);

  return (
    <>{/* <DataTable columns={columns} data={content} actionMenuItems={actionMenuItems} /> */}</>
  );
};

export default StoreManagementDataTable;
