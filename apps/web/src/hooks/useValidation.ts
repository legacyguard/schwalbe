import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean | string;
  message?: string;
  when?: (formData: any) => boolean;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface ValidationConfig<T> {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value != null && value !== '';
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value == null || value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value == null || value <= max,
    message: message || `Must be no more than ${max}`
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    },
    message
  }),

  custom: <T>(
    validator: (value: T, formData?: any) => boolean | string,
    message = 'Invalid value'
  ): ValidationRule<T> => ({
    validate: validator,
    message
  }),

  when: <T>(condition: (formData: any) => boolean, rule: ValidationRule<T>): ValidationRule<T> => ({
    ...rule,
    when: condition
  })
};

/**
 * Hook for form validation
 */
export function useValidation<T extends Record<string, any>>(
  initialData: T,
  validationConfig: ValidationConfig<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationConfig[field];
      if (!rules) return undefined;

      for (const rule of rules) {
        // Check conditional validation
        if (rule.when && !rule.when(data)) {
          continue;
        }

        const result = rule.validate(value);
        if (result === false) {
          return rule.message || 'Invalid value';
        }
        if (typeof result === 'string') {
          return result;
        }
      }

      return undefined;
    },
    [validationConfig, data]
  );

  const validateAll = useCallback((): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};

    for (const field in validationConfig) {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    return newErrors;
  }, [data, validateField, validationConfig]);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Validate on change if field was already touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [touched, validateField]);

  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));

    // Validate on touch
    if (isTouched) {
      const error = validateField(field, data[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [data, validateField]);

  const resetField = useCallback((field: keyof T) => {
    setData(prev => ({ ...prev, [field]: initialData[field] }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setTouched(prev => ({ ...prev, [field]: false }));
  }, [initialData]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && Object.keys(touched).length > 0;
  }, [errors, touched]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== undefined);
  }, [errors]);

  return {
    data,
    errors,
    touched,
    isValid,
    hasErrors,
    setValue,
    setTouched,
    validateField,
    validateAll,
    resetField,
    reset,
    setData,
    setErrors
  };
}

/**
 * Hook for async validation (e.g., server-side validation)
 */
export function useAsyncValidation<T extends Record<string, any>>(
  validateFn: (data: T) => Promise<FormErrors<T>>
) {
  const [isValidating, setIsValidating] = useState(false);
  const [asyncErrors, setAsyncErrors] = useState<FormErrors<T>>({});

  const validateAsync = useCallback(async (data: T): Promise<FormErrors<T>> => {
    setIsValidating(true);
    try {
      const errors = await validateFn(data);
      setAsyncErrors(errors);
      return errors;
    } catch (error) {
      console.error('Async validation error:', error);
      const genericError = { _form: 'Validation failed' } as FormErrors<T>;
      setAsyncErrors(genericError);
      return genericError;
    } finally {
      setIsValidating(false);
    }
  }, [validateFn]);

  const clearAsyncErrors = useCallback(() => {
    setAsyncErrors({});
  }, []);

  return {
    isValidating,
    asyncErrors,
    validateAsync,
    clearAsyncErrors
  };
}

/**
 * Hook that combines sync and async validation
 */
export function useCombinedValidation<T extends Record<string, any>>(
  initialData: T,
  validationConfig: ValidationConfig<T> = {},
  asyncValidateFn?: (data: T) => Promise<FormErrors<T>>
) {
  const {
    data,
    errors: syncErrors,
    touched,
    isValid: isSyncValid,
    hasErrors: hasSyncErrors,
    setValue,
    setTouched,
    validateField,
    validateAll,
    resetField,
    reset,
    setData,
    setErrors
  } = useValidation(initialData, validationConfig);

  const {
    isValidating,
    asyncErrors,
    validateAsync,
    clearAsyncErrors
  } = useAsyncValidation(asyncValidateFn || (() => Promise.resolve({})));

  const allErrors = useMemo(() => ({
    ...syncErrors,
    ...asyncErrors
  }), [syncErrors, asyncErrors]);

  const isValid = useMemo(() => {
    return isSyncValid && Object.keys(asyncErrors).length === 0 && !isValidating;
  }, [isSyncValid, asyncErrors, isValidating]);

  const hasErrors = useMemo(() => {
    return hasSyncErrors || Object.keys(asyncErrors).length > 0;
  }, [hasSyncErrors, asyncErrors]);

  const handleSubmit = useCallback(async (
    onSubmit: (data: T) => void | Promise<void>
  ) => {
    const syncValidationErrors = validateAll();

    if (Object.keys(syncValidationErrors).length > 0) {
      return false;
    }

    if (asyncValidateFn) {
      const asyncValidationErrors = await validateAsync(data);
      if (Object.keys(asyncValidationErrors).length > 0) {
        return false;
      }
    }

    try {
      await onSubmit(data);
      return true;
    } catch (error) {
      console.error('Submit error:', error);
      return false;
    }
  }, [data, validateAll, validateAsync, asyncValidateFn]);

  return {
    data,
    errors: allErrors,
    touched,
    isValid,
    hasErrors,
    isValidating,
    setValue,
    setTouched,
    validateField,
    validateAll,
    validateAsync,
    resetField,
    reset,
    setData,
    setErrors,
    clearAsyncErrors,
    handleSubmit
  };
}