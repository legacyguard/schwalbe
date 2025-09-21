import React, { forwardRef, useId } from 'react';
import { useDescribedBy } from '@/hooks/useAccessibility';

interface FormFieldProps {
  label: string;
  error?: string;
  help?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline' | 'floating';
}

export function FormField({
  label,
  error,
  help,
  required = false,
  children,
  className = '',
  labelClassName = '',
  size = 'md',
  variant = 'default'
}: FormFieldProps) {
  const id = useId();
  const { addDescriptor, getDescribedBy, createDescriptorId } = useDescribedBy(id);

  const helpId = help ? createDescriptorId('help') : undefined;
  const errorId = error ? createDescriptorId('error') : undefined;

  React.useEffect(() => {
    if (helpId) addDescriptor(helpId);
    if (errorId) addDescriptor(errorId);
  }, [helpId, errorId, addDescriptor]);

  const fieldId = children.props.id || id;

  const enhancedChild = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': getDescribedBy(),
    'aria-invalid': error ? 'true' : undefined,
    'aria-required': required ? 'true' : undefined,
  });

  const sizeClasses = {
    sm: 'space-y-0.5',
    md: 'space-y-1',
    lg: 'space-y-2'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const helpSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm'
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <label
          htmlFor={fieldId}
          className={`text-sm font-medium text-white whitespace-nowrap ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>

        <div className="flex-1">
          {enhancedChild}
          {error && (
            <div
              id={errorId}
              className="text-xs text-red-300 flex items-center gap-1 mt-1"
              role="alert"
              aria-live="polite"
            >
              <span className="text-red-400" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {help && (
          <div id={helpId} className="text-xs text-slate-400 max-w-xs">
            {help}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {enhancedChild}
        <label
          htmlFor={fieldId}
          className={`absolute left-3 transition-all duration-200 pointer-events-none
            ${labelSizeClasses[size]} font-medium text-slate-400
            ${children.props.value || children.props.defaultValue
              ? '-top-2 bg-slate-900 px-1 text-xs text-slate-300'
              : 'top-1/2 -translate-y-1/2'
            } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>

        {help && (
          <div id={helpId} className={`${helpSizeClasses[size]} text-slate-300`}>
            {help}
          </div>
        )}

        {error && (
          <div
            id={errorId}
            className={`${helpSizeClasses[size]} text-red-300 flex items-start gap-2`}
            role="alert"
            aria-live="polite"
          >
            <span className="text-red-400 mt-0.5" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <label
        htmlFor={fieldId}
        className={`block ${labelSizeClasses[size]} font-medium text-white ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>

      {enhancedChild}

      {help && (
        <div id={helpId} className={`${helpSizeClasses[size]} text-slate-300`}>
          {help}
        </div>
      )}

      {error && (
        <div
          id={errorId}
          className={`${helpSizeClasses[size]} text-red-300 flex items-start gap-2`}
          role="alert"
          aria-live="polite"
        >
          <span className="text-red-400 mt-0.5" aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ options, placeholder, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-slate-500 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(({ value, label, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-slate-500 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:text-slate-400
          ${className}
        `}
        {...props}
      />
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    className = '',
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-md
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
      outline: 'border border-slate-600 hover:border-slate-500 text-white focus:ring-slate-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';