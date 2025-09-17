
// Form Field Components
export {
  FormField,
  type FormFieldProps,
  FormInput,
  type FormInputProps,
  FormTextArea,
  type FormTextAreaProps,
} from './FormField';

// Form Section Components
export {
  FormRow,
  type FormRowProps,
  FormSection,
  type FormSectionProps,
} from './FormSection';

// Form Select Component
export { FormSelect, type FormSelectProps } from './FormSelect';

// Re-export validation utilities if needed
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s()-]+$/,
  postalCode: /^[A-Z0-9\s-]+$/i,
  url: /^https?:\/\/.+\..+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
};

// Translation keys for validation messages - to be used with i18n system
export const ValidationMessages = {
  required: 'forms.validation.required',
  email: 'forms.validation.email',
  minLength: 'forms.validation.minLength',
  maxLength: 'forms.validation.maxLength',
  pattern: 'forms.validation.pattern',
  numeric: 'forms.validation.numeric',
  positive: 'forms.validation.positive',
  integer: 'forms.validation.integer',
  dateFormat: 'forms.validation.dateFormat',
  passwordStrength: 'forms.validation.passwordStrength',
  passwordsMatch: 'forms.validation.passwordsMatch',
  phoneFormat: 'forms.validation.phoneFormat',
  urlFormat: 'forms.validation.urlFormat',
};

// Helper function for form validation with translation support
export const validateField = (
  value: string,
  rules: {
    custom?: (value: string) => string | undefined;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    required?: boolean;
  },
  t?: (key: string, params?: Record<string, any>) => string
): string | undefined => {
  // Use translation function if provided, otherwise fallback to English
  const translate = t || ((key: string, params?: Record<string, any>) => {
    // Simple fallback translations for when i18n is not available
    const fallbacks: Record<string, string> = {
      'forms.validation.required': 'This field is required',
      'forms.validation.minLength': `Must be at least ${params?.min || 'N'} characters`,
      'forms.validation.maxLength': `Must be no more than ${params?.max || 'N'} characters`,
      'forms.validation.pattern': 'Invalid format',
    };
    return fallbacks[key] || key;
  });

  if (rules.required && !value.trim()) {
    return translate(ValidationMessages.required);
  }

  if (rules.minLength && value.length < rules.minLength) {
    return translate(ValidationMessages.minLength, { min: rules.minLength });
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return translate(ValidationMessages.maxLength, { max: rules.maxLength });
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return translate(ValidationMessages.pattern);
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};
