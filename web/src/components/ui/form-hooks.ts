
import * as React from 'react';
// import {
//   useFormContext,
//   type FieldValues,
//   type FieldPath,
// } from 'react-hook-form';

// Mock types for react-hook-form
type FieldValues = any;
type FieldPath<_T> = string;
const useFormContext = () => ({
  getFieldState: (_name: string, _formState: any) => ({
    invalid: false,
    isDirty: false,
    isTouched: false,
    error: undefined,
  }),
  formState: {},
});

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export { FormFieldContext, FormItemContext };
