// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from '@/components/ui/alert-dialog';
// import { type ReactNode } from 'react';

// interface AppConfirmationProps {
//   trigger: ReactNode;
//   title?: string;
//   description?: string;
//   confirmLabel?: string;
//   cancelLabel?: string;
//   onConfirm: () => void;
// }

// const AppConfirmation = ({
//   trigger,
//   title = 'Are you sure?',
//   description = 'This action cannot be undone.',
//   confirmLabel = 'Confirm',
//   cancelLabel = 'Cancel',
//   onConfirm,
// }: AppConfirmationProps) => {
//   return (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
//       <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
//         <AlertDialogHeader>
//           <AlertDialogTitle>{title}</AlertDialogTitle>
//           <AlertDialogDescription>{description}</AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogAction
//             onClick={() => {
//               onConfirm();
//             }}
//           >
//             {confirmLabel}
//           </AlertDialogAction>
//           <AlertDialogCancel className="bg-destructive hover:text-destructive border-destructive border text-white hover:bg-transparent">
//             {cancelLabel}
//           </AlertDialogCancel>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };

// export default AppConfirmation;
