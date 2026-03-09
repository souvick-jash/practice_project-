import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { memo, type ReactNode } from 'react';
import { clsx } from 'clsx';
interface AppModalProps {
  children: ReactNode;
  title?: string;
  description?: string;
  allowOutsideClick?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  modalClass?: string;
}

const AppModal = ({
  children,
  title = 'Some Title',
  description = '',
  allowOutsideClick = false,
  open,
  setOpen,
  modalClass = 'sm:max-w-4xl',
}: AppModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={clsx(modalClass)}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (allowOutsideClick) return;
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ?? (
            <DialogDescription className="mt-1 text-sm">{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex max-h-[80vh] flex-col overflow-y-auto p-4 pt-0 pb-5 md:p-5 md:pt-3 md:pb-7">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(AppModal);
