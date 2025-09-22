import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 rounded border border-slate-600 bg-slate-900 text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`.trim()}
      {...props}
    />
  )
);

Checkbox.displayName = 'Checkbox';
