
import React from 'react';
import { FormField } from './FormField';
import { Select, type SelectProps } from '../..';

export interface FormSelectProps extends Omit<SelectProps, 'error' | 'label'> {
  error?: boolean | string;
  hint?: string;
  label?: string;
  required?: boolean;
  success?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  success,
  hint,
  required,
  ...selectProps
}) => {
  // Convert error to appropriate types for each component
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;

  return (
    <FormField
      label={label}
      errorMessage={errorMessage}
      successMessage={success}
      hint={hint}
      required={required}
    >
      <Select {...selectProps} error={hasError} errorText={errorMessage} />
    </FormField>
  );
};
