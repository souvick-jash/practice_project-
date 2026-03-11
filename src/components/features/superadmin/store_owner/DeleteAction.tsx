// import AppConfirmation from '@/components/reusables/confirmation/AppConfirmation';
// import actionMenuItems from './customizer';
// import Spinner from '@/components/reusables/Spinner';
// import type { StoreOwner } from '@/types/types';
// import { toast } from 'react-toastify';
// import { errorTransformer } from '@/utils/error';
// import { Button } from '@/components/ui/button';
// import { Trash2 } from 'lucide-react';
// import { useDeleteStoreOwner } from '@/hooks/storeOwnerHooks';

// const DeleteAction = ({ row }: { row: StoreOwner }) => {
//   const { deleteConfirmationOptions } = actionMenuItems;
//   const { mutate: deleteStoreOwnerMutation, isPending } = useDeleteStoreOwner();

//   const handleDelete = () => {
//     deleteStoreOwnerMutation(row.id, {
//       onSuccess: () => {
//         toast.success('Store Owner deleted successfully');
//       },
//       onError: (error) => {
//         const message = errorTransformer(error);
//         toast.error(message);
//       },
//     });
//   };

//   if (isPending) {
//     return (
//       <Button variant="iconButtonRed" size="icon">
//         <Spinner classes="fill-destructive!" />
//       </Button>
//     );
//   }

//   return (
//     <div>
//       <AppConfirmation
//         trigger={
//           <Button variant="iconButtonRed" size="icon" className="size-7 sm:size-10">
//             <Trash2 className="size-4 sm:size-5" />
//           </Button>
//         }
//         title={deleteConfirmationOptions?.title}
//         description={deleteConfirmationOptions?.description}
//         confirmLabel={deleteConfirmationOptions?.confirmLabel}
//         onConfirm={handleDelete}
//       />
//     </div>
//   );
// };

// export default DeleteAction;
