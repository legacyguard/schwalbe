import React from 'react';
import { Slot } from '@radix-ui/react-slot';

const baseClass = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variantClass: Record<'primary' | 'secondary' | 'outline' | 'ghost', string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400 focus-visible:ring-offset-slate-900 px-4 py-2',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-400 focus-visible:ring-offset-slate-900 px-4 py-2',
  outline: 'border border-slate-600 text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400 focus-visible:ring-offset-slate-900 px-4 py-2',
  ghost: 'text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400 focus-visible:ring-offset-slate-900'
};

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = 'primary', size = 'md', className = '', children, disabled, isLoading = false, loadingText, ...rest }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const content = isLoading ? (loadingText ?? 'Loading…') : children;

    return (
      <Comp
        ref={ref}
        className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
        disabled={disabled || isLoading}
        {...rest}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
