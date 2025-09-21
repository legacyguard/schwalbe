import React from 'react';
import { clsx } from 'clsx';

export interface ErrorMessageProps {
  error?: string | string[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'toast';
  showIcon?: boolean;
  role?: 'alert' | 'status';
  id?: string;
}

export function ErrorMessage({
  error,
  className = '',
  size = 'md',
  variant = 'block',
  showIcon = true,
  role = 'alert',
  id
}: ErrorMessageProps) {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    inline: 'inline-flex items-center gap-2',
    block: 'flex items-start gap-2',
    toast: 'flex items-center gap-3 p-4 rounded-lg border'
  };

  const baseClasses = clsx(
    'text-red-300',
    sizeClasses[size],
    variantClasses[variant],
    {
      'bg-red-900/20 border-red-700': variant === 'toast'
    },
    className
  );

  if (variant === 'inline' && errors.length === 1) {
    return (
      <span className={baseClasses} role={role} aria-live="polite" id={id}>
        {showIcon && <span className="text-red-400 flex-shrink-0" aria-hidden="true">⚠</span>}
        <span>{errors[0]}</span>
      </span>
    );
  }

  return (
    <div className={baseClasses} role={role} aria-live="polite" id={id}>
      {showIcon && (
        <span className="text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true">
          {variant === 'toast' ? '⚠' : '⚠'}
        </span>
      )}

      {errors.length === 1 ? (
        <span>{errors[0]}</span>
      ) : (
        <div className="space-y-1">
          {errors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Specialized error components
export function FieldError({ error, ...props }: Omit<ErrorMessageProps, 'variant'>) {
  return <ErrorMessage error={error} variant="block" {...props} />;
}

export function InlineError({ error, ...props }: Omit<ErrorMessageProps, 'variant'>) {
  return <ErrorMessage error={error} variant="inline" {...props} />;
}

export function FormError({ error, title = 'Please fix the following errors:', ...props }: ErrorMessageProps & { title?: string }) {
  if (!error) return null;

  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4" role="alert">
      <h3 className="text-red-300 font-medium text-sm mb-2">
        <span aria-hidden="true">⚠</span> {title}
      </h3>
      <ErrorMessage error={error} showIcon={false} className="text-red-200" {...props} />
    </div>
  );
}

// Success message component
export interface SuccessMessageProps {
  message?: string | string[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'toast';
  showIcon?: boolean;
  role?: 'alert' | 'status';
  id?: string;
}

export function SuccessMessage({
  message,
  className = '',
  size = 'md',
  variant = 'block',
  showIcon = true,
  role = 'status',
  id
}: SuccessMessageProps) {
  if (!message) return null;

  const messages = Array.isArray(message) ? message : [message];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    inline: 'inline-flex items-center gap-2',
    block: 'flex items-start gap-2',
    toast: 'flex items-center gap-3 p-4 rounded-lg border'
  };

  const baseClasses = clsx(
    'text-green-300',
    sizeClasses[size],
    variantClasses[variant],
    {
      'bg-green-900/20 border-green-700': variant === 'toast'
    },
    className
  );

  return (
    <div className={baseClasses} role={role} aria-live="polite" id={id}>
      {showIcon && (
        <span className="text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
      )}

      {messages.length === 1 ? (
        <span>{messages[0]}</span>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Warning message component
export interface WarningMessageProps {
  message?: string | string[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'toast';
  showIcon?: boolean;
  role?: 'alert' | 'status';
  id?: string;
}

export function WarningMessage({
  message,
  className = '',
  size = 'md',
  variant = 'block',
  showIcon = true,
  role = 'status',
  id
}: WarningMessageProps) {
  if (!message) return null;

  const messages = Array.isArray(message) ? message : [message];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    inline: 'inline-flex items-center gap-2',
    block: 'flex items-start gap-2',
    toast: 'flex items-center gap-3 p-4 rounded-lg border'
  };

  const baseClasses = clsx(
    'text-yellow-300',
    sizeClasses[size],
    variantClasses[variant],
    {
      'bg-yellow-900/20 border-yellow-700': variant === 'toast'
    },
    className
  );

  return (
    <div className={baseClasses} role={role} aria-live="polite" id={id}>
      {showIcon && (
        <span className="text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true">ℹ</span>
      )}

      {messages.length === 1 ? (
        <span>{messages[0]}</span>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic status message component
export interface StatusMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message?: string | string[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'toast';
  showIcon?: boolean;
  role?: 'alert' | 'status';
  id?: string;
}

export function StatusMessage({ type, ...props }: StatusMessageProps) {
  switch (type) {
    case 'error':
      return <ErrorMessage error={props.message} {...props} />;
    case 'success':
      return <SuccessMessage message={props.message} {...props} />;
    case 'warning':
      return <WarningMessage message={props.message} {...props} />;
    case 'info':
      return (
        <div className={clsx(
          'text-blue-300 flex items-start gap-2',
          props.variant === 'toast' && 'bg-blue-900/20 border-blue-700 p-4 rounded-lg border',
          props.className
        )} role={props.role || 'status'} aria-live="polite" id={props.id}>
          {props.showIcon !== false && (
            <span className="text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true">ℹ</span>
          )}
          <span>{props.message}</span>
        </div>
      );
    default:
      return null;
  }
}