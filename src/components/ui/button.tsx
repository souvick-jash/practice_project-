/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-base rounded-full",
  {
    variants: {
      variant: {
        default: 'bg-primary text-background hover:bg-primary-light hover:text-primary',
        disabled: 'bg-gray-200 text-gray-600 cursor-not-allowed',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary font-extrabold underline-offset-5 underline rounded-none !p-0',
        headerIcon: 'header-icon bg-muted rounded-full hover:bg-primary hover:text-white',
        light: 'bg-primary-light hover:bg-primary hover:text-background',
        light2: 'bg-[#DEE8D5] border-1 border-primary hover:bg-primary hover:text-background',
        iconButton:
          'icon-button bg-primary text-background hover:bg-primary-light hover:text-primary btn-res-fix',
        iconButtonMuted:
          'icon-button bg-milk text-primary hover:bg-primary-light hover:text-primary btn-res-fix',
        iconButtonOrange:
          'icon-button border-2 border-orange bg-orange text-background hover:bg-transparent hover:text-orange',
        iconButtonGreen:
          'icon-button border-2 border-green bg-green text-background hover:bg-transparent hover:text-green',
        iconButtonGreenDark:
          'icon-button border-2 border-primary bg-primary text-background hover:bg-transparent hover:text-primary',
        iconButtonRed:
          'icon-button border-2 border-red bg-red text-background hover:bg-transparent hover:text-red',
        iconButtonBlue:
          'icon-button border-2 border-cyan-400 bg-cyan-400 text-background hover:bg-transparent hover:text-cyan-400',
        iconButtonPurple:
          'icon-button border-2 border-purple-400 bg-purple-400 text-background hover:bg-transparent hover:text-purple-400',
        inline: 'text-primary p-0 underline font-bold',
        pagination:
          'text-foreground bg-milk font-bold hover:bg-primary hover:text-background rounded-lg',
        filterChip: 'bg-milk hover:bg-primary hover:text-background',
      },
      size: {
        default: 'px-5 py-3 ',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-10',
        iconLg: 'size-15',
        sizeInline: 'p-0',
        sizePagination: 'p-0 size-12',
        sizeFilterChip: 'py-2 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
