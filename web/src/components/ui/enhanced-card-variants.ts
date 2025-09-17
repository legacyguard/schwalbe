
import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-lg hover:shadow-xl',
        outlined: 'border-2 border-border',
        ghost: 'border-transparent shadow-none',
        // Personality variants
        empathetic:
          'border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50',
        pragmatic: 'border-gray-300 bg-gray-50',
        adaptive: 'border-blue-200 bg-gradient-to-br from-blue-50 to-green-50',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        none: '',
        hover: 'hover:shadow-md cursor-default',
        clickable: 'hover:shadow-md cursor-pointer active:scale-[0.98]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: 'none',
    },
  }
);
