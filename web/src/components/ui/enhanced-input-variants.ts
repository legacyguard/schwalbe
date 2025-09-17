
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-1 focus-visible:ring-ring',
        success:
          'border-green-500 focus-visible:ring-1 focus-visible:ring-green-500',
        error: 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500',
        warning:
          'border-yellow-500 focus-visible:ring-1 focus-visible:ring-yellow-500',
      },
      size: {
        default: 'h-9 px-3 py-1',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-11 px-4 py-2 text-base',
        xl: 'h-12 px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
