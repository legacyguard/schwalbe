import React from 'react';

// Base interface for error message components
export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | string[] | null;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export interface FormErrorProps extends ErrorMessageProps {
  field?: string;
  errors?: Record<string, string | string[]>;
}

export interface InlineErrorProps extends ErrorMessageProps {
  inline?: boolean;
}

// ErrorMessage - displays error messages with proper styling and accessibility
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  variant = 'destructive',
  showIcon = true,
  children,
  className,
  ...props
}) => {
  if (!error && !children) return null;

  const errorText = Array.isArray(error) ? error.join(', ') : error;
  const content = children || errorText;

  return React.createElement('div', {
    className: `error-message variant-${variant} ${className || ''}`,
    role: 'alert',
    'aria-live': 'polite',
    ...props
  }, [
    showIcon && React.createElement('span', {
      key: 'icon',
      className: 'error-icon',
      'aria-hidden': 'true'
    }, '⚠️'),
    React.createElement('span', {
      key: 'content',
      className: 'error-content'
    }, content)
  ]);
};

// FormError - specialized error component for form fields
export const FormError: React.FC<FormErrorProps> = ({
  field,
  errors,
  error,
  ...props
}) => {
  const fieldError = field && errors ? errors[field] : error;

  return React.createElement(ErrorMessage, {
    error: fieldError,
    ...props
  });
};

// InlineError - compact error display for inline validation
export const InlineError: React.FC<InlineErrorProps> = ({
  inline = true,
  className,
  ...props
}) => {
  return React.createElement(ErrorMessage, {
    className: `${inline ? 'inline-error' : ''} ${className || ''}`,
    showIcon: false,
    variant: 'destructive',
    ...props
  });
};

// ValidationError - for validation-specific errors
export interface ValidationErrorProps extends ErrorMessageProps {
  field?: string;
  message?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({
  field,
  message,
  error,
  ...props
}) => {
  const errorMessage = message || error;

  return React.createElement(ErrorMessage, {
    error: errorMessage,
    ['data-field']: field,
    ...props
  });
};

// Default export for the module
export default {
  ErrorMessage,
  FormError,
  InlineError,
  ValidationError
};