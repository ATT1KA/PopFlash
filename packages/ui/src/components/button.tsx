import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import * as React from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-[12px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#2EFF9D] text-[#0A0A0F] hover:bg-[#0BFF85] focus-visible:outline-[#3FD7FF]',
        secondary:
          'border border-[#2EFF9D] text-[#2EFF9D] hover:bg-[#2EFF9D] hover:text-[#0A0A0F] focus-visible:outline-[#3FD7FF]',
        ghost: 'text-[#F7F9FA] hover:bg-white/5 focus-visible:outline-[#3FD7FF]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={ref as never}
        className={clsx(buttonStyles({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
