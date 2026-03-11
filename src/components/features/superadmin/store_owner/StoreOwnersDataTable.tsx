import { memo, useEffect } from 'react';
import { errorTransformer } from '@/utils/error';
import { toast } from 'react-toastify';
import { DataTable } from '@/components/reusables/datatable/data-table';
import actionMenuItems from './customizer';
import columns from './columns';
import { useFetchAllOwners } from '@/hooks/storeOwnerHooks';

const StoreOwnersDataTable = () => {
  const { data, isError, error } = useFetchAllOwners();
  const content = data ?? [];

  console.log('content', content);

  useEffect(() => {
    if (isError) {
      const message = errorTransformer(error);
      toast.error(message);
    }
  }, [isError, error]);

  return (
    <>
      <DataTable columns={columns} data={content} actionMenuItems={actionMenuItems} />
    </>
  );
};

export default memo(StoreOwnersDataTable);
