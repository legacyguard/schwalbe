import React, { forwardRef } from 'react';

// Base interfaces for accessible form components
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
  description?: string;
}

export interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'danger' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children?: React.ReactNode;
}

export interface SubmitButtonProps extends AccessibleButtonProps {
  isSubmitting?: boolean;
}

// FormField component - wrapper for form controls with label and error
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  description,
  className,
  ...props
}) => {
  return React.createElement('div', {
    className: `form-field ${className || ''}`,
    ...props
  }, [
    label && React.createElement('label', {
      key: 'label',
      className: 'form-label'
    }, label, required && React.createElement('span', {
      key: 'required',
      className: 'required-indicator'
    }, ' *')),
    description && React.createElement('p', {
      key: 'description',
      className: 'form-description'
    }, description),
    React.createElement('div', { key: 'children' }, children),
    error && React.createElement('div', {
      key: 'error',
      className: 'form-error',
      role: 'alert'
    }, error)
  ]);
};

// AccessibleInput - enhanced input with accessibility features
export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, description, className, ...props }, ref) => {
    return React.createElement('input', {
      ref,
      className: `accessible-input ${className || ''}`,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': description ? 'input-description' : undefined,
      ...props
    });
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// AccessibleButton - enhanced button with accessibility features
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ variant = 'default', size = 'default', loading, children, disabled, className, ...props }, ref) => {
    return React.createElement('button', {
      ref,
      className: `accessible-button variant-${variant} size-${size} ${className || ''}`,
      disabled: disabled || loading,
      'aria-busy': loading ? 'true' : 'false',
      ...props
    }, loading ? 'Loading...' : children);
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// SubmitButton - specialized button for form submission
export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isSubmitting, children, ...props }, ref) => {
    return React.createElement(AccessibleButton, {
      ref,
      type: 'submit',
      loading: isSubmitting,
      variant: 'primary',
      ...props
    }, children);
  }
);

SubmitButton.displayName = 'SubmitButton';

// Default export for the module
export default {
  FormField,
  AccessibleInput,
  AccessibleButton,
  SubmitButton
};