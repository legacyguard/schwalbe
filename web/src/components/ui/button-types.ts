
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from './button-variants';
import type React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
