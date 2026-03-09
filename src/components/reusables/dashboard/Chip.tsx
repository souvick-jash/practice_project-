import React from 'react';
import clsx from 'clsx';

export type ChipVariant = 'success' | 'danger' | 'warning' | 'info' | 'active' | 'muted';

type ChipProps = {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'active' | 'muted';
};

type ChipHolderProps = {
  children: React.ReactNode;
};

const variantClasses: Record<NonNullable<ChipProps['variant']>, string> = {
  success: 'bg-chip-success text-primary',
  active: 'bg-chip-active text-green',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-50 text-chip-text-warning',
  info: 'bg-blue-200 text-blue-800',
  muted: 'bg-neutral-200 text-neutral-500',
};

export const Chip: React.FC<ChipProps> = ({ label, variant = 'success' }) => {
  return (
    <span
      className={clsx(
        'chip-text inline-flex min-w-19 justify-center rounded-3xl px-3.5 py-1.5 text-sm font-medium',
        variantClasses[variant]
      )}
    >
      {label}
    </span>
  );
};

export const ChipHolder: React.FC<ChipHolderProps> = ({ children }) => {
  return <div className="flex flex-wrap gap-1">{children}</div>;
};
