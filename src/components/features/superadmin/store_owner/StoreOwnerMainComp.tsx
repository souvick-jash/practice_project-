import { memo } from 'react';
import StoreOwnersDataTable from './StoreOwnersDataTable';

const StoreOwnerMainComp = () => {
  return (
    <>
      <div className="data-table-wrap">
        <StoreOwnersDataTable />
      </div>
    </>
  );
};

export default memo(StoreOwnerMainComp);

// const StoreOwnerMainComp = () => {
//   return <div>StoreOwnerMainComp</div>;
// };

// export default StoreOwnerMainComp;
