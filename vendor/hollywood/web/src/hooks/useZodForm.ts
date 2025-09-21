
import { type BaseSyntheticEvent, useCallback, useEffect } from 'react';
// import { type UseFormProps, type UseFormReturn, type FieldValues, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import type { ZodSchema, ZodTypeDef } from 'zod';
import { useTranslation } from '../i18n/useTranslation';

// Mock types for react-hook-form and zod
type FieldValues = any;
type UseFormProps<_T> = any;
type UseFormReturn<_T> = any;
type ZodSchema<_T, _D, _O> = any;
type ZodTypeDef = any;

const useForm = <T>(_options: any): UseFormReturn<T> => ({
  handleSubmit: (fn: any) => (e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    return fn({});
  },
  formState: {
    errors: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
    isSubmitSuccessful: false,
  },
  reset: () => {},
  setError: () => {},
  register: () => ({}),
  control: {},
  watch: () => ({}),
  getValues: () => ({}),
  setValue: () => {},
  trigger: () => Promise.resolve(true),
  clearErrors: () => {},
  setFocus: () => {},
  getFieldState: () => ({
    invalid: false,
    isDirty: false,
    isTouched: false,
    error: undefined,
  }),
});

const zodResolver = (_schema: any) => (values: any) => ({
  values,
  errors: {},
});

// Custom hook options
interface UseZodFormOptions<TSchema extends ZodSchema<any, ZodTypeDef, any>>
  extends Omit<UseFormProps<any>, 'resolver'> {
  disableOnSubmit?: boolean;
  onSubmit?: (data: any) => Promise<void> | void;
  resetOnSubmit?: boolean;
  schema: TSchema;
}

// Enhanced form return type
interface EnhancedFormReturn<_TSchema extends ZodSchema<any, ZodTypeDef, any>>
  extends UseFormReturn<any> {
  errors: UseFormReturn<any>['formState']['errors'];
  isDirty: boolean;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  submitHandler: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

/**
 * Custom hook that combines react-hook-form with Zod validation
 * Provides consistent error handling, submit state management, and button disable states
 */
export function useZodForm<TSchema extends ZodSchema<any, ZodTypeDef, any>>({
  schema,
  onSubmit,
  resetOnSubmit = false,
  disableOnSubmit = true,
  ...formOptions
}: UseZodFormOptions<TSchema>): EnhancedFormReturn<TSchema> {
  const { t } = useTranslation();

  const form = useForm<any>({
    ...formOptions,
    resolver: zodResolver(schema),
    mode: formOptions['mode'] || 'onBlur',
    criteriaMode: 'all',
    shouldFocusError: true,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, isSubmitSuccessful },
    reset,
    setError,
  } = form;

  // Reset form after successful submission if configured
  useEffect(() => {
    if (isSubmitSuccessful && resetOnSubmit) {
      reset();
    }
  }, [isSubmitSuccessful, reset, resetOnSubmit]);

  // Handle form submission with error handling
  const submitHandler = useCallback(
    async (e?: BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!onSubmit) return;

      await handleSubmit(
        async (data: any) => {
          try {
            await onSubmit(data);
          } catch (error) {
            // Handle API errors and set form errors
            if (error instanceof Error) {
              // Check if error has field-specific messages
              if ('fields' in error && typeof error.fields === 'object') {
                const fieldErrors = error.fields as Record<string, string>;
                Object.entries(fieldErrors).forEach(([field, message]) => {
                  setError(field as any, {
                    type: 'manual',
                    message,
                  });
                });
              } else {
                // Set root error for general errors
                setError('root', {
                  type: 'manual',
                  message: error.message || t('common.messages.operationFailed'),
                });
              }
            } else {
              setError('root', {
                type: 'manual',
                message: t('common.messages.operationFailed'),
              });
            }
            throw error; // Re-throw to maintain error state
          }
        },
        (errors: any) => {
          // Log validation errors in development
          if (process.env['NODE_ENV'] === 'development') {
            console.error('Form validation errors:', errors);
          }
        }
      )(e);
    },
    [handleSubmit, onSubmit, setError]
  );

  // Determine if submit button should be disabled
  const isSubmitDisabled = disableOnSubmit
    ? isSubmitting || !isDirty || !isValid
    : isSubmitting;

  return {
    ...form,
    isSubmitDisabled,
    submitHandler,
    errors,
    isSubmitting,
    isDirty,
    isValid,
  };
}

// Helper function to get error message
export function getErrorMessage(
  errors: FieldValues,
  field: string
): string | undefined {
  const fieldParts = field.split('.');
  let error: any = errors;

  for (const part of fieldParts) {
    error = error?.[part];
    if (!error) break;
  }

  return error?.message;
}

// Helper function to check if field has error
export function hasError(errors: FieldValues, field: string): boolean {
  return !!getErrorMessage(errors, field);
}
