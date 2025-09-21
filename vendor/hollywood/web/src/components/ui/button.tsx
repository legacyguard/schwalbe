
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { buttonVariants } from './button-variants';

/**
 * Button component props interface
 * Extends native button attributes with variant and size options
 * Uses asChild pattern for flexible composition with Radix UI
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Memoized Button component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 * Supports Radix UI's asChild pattern for flexible composition
 */
const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
      // Use Slot component when asChild is true, otherwise use native button
      const Comp = asChild ? Slot : 'button';
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
