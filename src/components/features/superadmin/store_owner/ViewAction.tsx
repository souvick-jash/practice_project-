import { Button } from '@/components/ui/button';
import type { StoreOwner } from '@/types/types';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import actionMenuItems from './customizer';
import AppModal from '@/components/reusables/modal/AppModal';
import { errorTransformer } from '@/utils/error';
import Spinner from '@/components/reusables/Spinner';
import { useFetchSingleOwner } from '@/hooks/storeOwnerHooks';
import { Chip } from '@/components/reusables/dashboard/Chip';
// import DeleteAction from './DeleteAction';
// import UpdateAction from './UpdateAction';

const ViewAction = ({ row, text }: { row: StoreOwner; text?: string }) => {
  const { viewOptions } = actionMenuItems;
  const [open, setOpen] = useState(false);
  const handleModalOpen = () => {
    setOpen(true);
  };

  // ? Atore Owner Details Fetching
  const {
    isError: isSingleFetchError,
    error: singleFetchError,
    data: storeOwnerData,
    isLoading: isSingleFetchLoading,
  } = useFetchSingleOwner(row.id);

  return (
    <div>
      {text ? (
        <p className="text-primary cursor-pointer font-semibold" onClick={handleModalOpen}>
          {text}
        </p>
      ) : (
        <Button variant="iconButtonOrange" size="icon" onClick={handleModalOpen}>
          <Eye />
        </Button>
      )}

      <AppModal
        open={open}
        setOpen={setOpen}
        title={viewOptions?.title}
        description={viewOptions?.description}
        modalClass="small-modal"
      >
        <>
          <div className="absolute top-5 right-11 flex items-center justify-end gap-2 sm:top-3 sm:right-15">
            {/* <DeleteAction row={row} />
            <UpdateAction row={row} setParentOpen={setOpen} /> */}
          </div>

          {isSingleFetchLoading ? (
            <div className="itemcenter flex justify-center">
              <Spinner />
            </div>
          ) : isSingleFetchError ? (
            <p>Error: {errorTransformer(singleFetchError)}</p>
          ) : (
            <div className="details-wrap">
              <section className="space-y-3">
                {' '}
                <div className="flex items-start justify-between">
                  <p className="text-gray-600">Unique ID:</p>
                  <p className="text-black">
                    {storeOwnerData?.unique_id ? storeOwnerData.unique_id : '----'}
                  </p>
                </div>
                <div className="flex items-start justify-between">
                  <p className="text-gray-600">Owner Name:</p>
                  <p className="text-black">
                    {storeOwnerData?.name ? storeOwnerData.name : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Owner Email:</p>
                  <p className="text-black">
                    {storeOwnerData?.email ? storeOwnerData.email : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Owner Phone Number:</p>
                  <p className="text-black">
                    {storeOwnerData?.phone ? storeOwnerData.phone : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Address:</p>
                  <p className="text-black">
                    {storeOwnerData?.address ? storeOwnerData.address : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Street:</p>
                  <p className="text-black">
                    {storeOwnerData?.street ? storeOwnerData.street : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Country:</p>
                  <p className="text-black">
                    {storeOwnerData?.country ? storeOwnerData.country : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">State:</p>
                  <p className="text-black">
                    {storeOwnerData?.state ? storeOwnerData.state : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">City:</p>
                  <p className="text-black">
                    {storeOwnerData?.city ? storeOwnerData.city : '----'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Zip:</p>
                  <p className="text-black">{storeOwnerData?.zip ? storeOwnerData.zip : '----'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Status:</p>

                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label={storeOwnerData?.status === 'active' ? 'Active' : 'Inactive'}
                      variant={storeOwnerData?.status === 'active' ? 'active' : 'danger'}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      </AppModal>
    </div>
  );
};

export default ViewAction;
