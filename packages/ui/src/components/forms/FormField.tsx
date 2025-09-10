
import React, { type ReactNode } from 'react';
import {
  Input,
  type InputProps,
  Label,
  Stack,
  TextArea,
  type TextAreaProps,
} from '../..';
import { Paragraph } from '../Typography';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { View } from 'tamagui';
// Note: Translation hook would typically be imported from a shared location
// For now using a mock implementation until proper i18n setup

export interface FormFieldProps {
  children?: ReactNode;
  errorMessage?: string;
  hint?: string;
  label?: string;
  required?: boolean;
  successMessage?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  errorMessage,
  successMessage,
  hint,
  required,
  children,
}) => {
  return (
    <Stack gap='$2' width='100%'>
      {label && (
        <Label>
          {label}
          {required && (
            <Paragraph color='danger' style={{ display: 'inline' }}>
              {' '}
              *
            </Paragraph>
          )}
        </Label>
      )}

      {children}

      {hint && !errorMessage && !successMessage && (
        <Paragraph fontSize="$3" color="muted">
          {hint}
        </Paragraph>
      )}

      {errorMessage && (
        <View flexDirection='row' alignItems='center' gap='$1'>
          <AlertCircle size={14} color='$error' />
          <Paragraph fontSize="$3" color="danger">
            {errorMessage}
          </Paragraph>
        </View>
      )}

      {successMessage && !errorMessage && (
        <View flexDirection='row' alignItems='center' gap='$1'>
          <CheckCircle size={14} color='$success' />
          <Paragraph fontSize="$3" color="success">
            {successMessage}
          </Paragraph>
        </View>
      )}
    </Stack>
  );
};

// FormInput - Input with FormField wrapper
export type FormInputProps = InputProps & { field?: FormFieldProps };

export const FormInput: React.FC<FormInputProps> = ({
  field,
  ...inputProps
}) => {
  const { label, errorMessage, successMessage, hint, required } = field || {};
  return (
    <FormField
      label={label}
      errorMessage={errorMessage}
      successMessage={successMessage}
      hint={hint}
      required={required}
    >
      <Input
        {...inputProps}
        variant={
          errorMessage
            ? 'error'
            : successMessage
              ? 'success'
              : inputProps.variant
        }
      />
    </FormField>
  );
};

// FormTextArea - TextArea with FormField wrapper
export type FormTextAreaProps = TextAreaProps & { field?: FormFieldProps };

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  field,
  ...textAreaProps
}) => {
  const { label, errorMessage, successMessage, hint, required } = field || {};
  return (
    <FormField
      label={label}
      errorMessage={errorMessage}
      successMessage={successMessage}
      hint={hint}
      required={required}
    >
      <TextArea
        {...textAreaProps}
        variant={
          errorMessage
            ? 'error'
            : successMessage
              ? 'success'
              : textAreaProps.variant
        }
      />
    </FormField>
  );
};
