import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface IconTitleProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
}

const IconTitle: React.FC<IconTitleProps> = ({ title, icon: Icon, className }) => {
  return (
    <div className={cn('icon-title flex items-center gap-4', className)}>
      {Icon && (
        <div className="it-icon bg-primary flex size-12 items-center justify-center rounded-full text-white">
          <Icon className="size-5" />
        </div>
      )}
      <h5>{title}</h5>
    </div>
  );
};

export default IconTitle;
