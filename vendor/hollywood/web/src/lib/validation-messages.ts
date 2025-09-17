// Validation message keys for consistent schema validation
// This utility provides translation keys for form validation in schemas

export const ValidationMessages = {
  // Password validation
  password: {
    minLength: (min: number) => ({ key: 'forms.auth.password.minLength', params: { min } }),
    maxLength: (max: number) => ({ key: 'forms.auth.password.maxLength', params: { max } }),
    uppercase: () => ({ key: 'forms.auth.password.uppercase' }),
    lowercase: () => ({ key: 'forms.auth.password.lowercase' }),
    number: () => ({ key: 'forms.auth.password.number' }),
    specialChar: () => ({ key: 'forms.auth.password.specialChar' }),
    required: () => ({ key: 'forms.auth.password.required' }),
    confirm: () => ({ key: 'forms.auth.password.confirm' }),
    noMatch: () => ({ key: 'forms.auth.password.noMatch' }),
    current: () => ({ key: 'forms.auth.password.current' }),
    confirmNew: () => ({ key: 'forms.auth.password.confirmNew' }),
    mustBeDifferent: () => ({ key: 'forms.auth.password.mustBeDifferent' }),
  },

  // Email validation
  email: {
    required: () => ({ key: 'forms.auth.email.required' }),
    invalid: () => ({ key: 'forms.auth.email.invalid' }),
    maxLength: (max: number) => ({ key: 'forms.auth.email.maxLength', params: { max } }),
  },

  // Name validation
  name: {
    firstRequired: () => ({ key: 'forms.auth.name.firstRequired' }),
    lastRequired: () => ({ key: 'forms.auth.name.lastRequired' }),
    firstMaxLength: (max: number) => ({ key: 'forms.auth.name.firstMaxLength', params: { max } }),
    lastMaxLength: (max: number) => ({ key: 'forms.auth.name.lastMaxLength', params: { max } }),
    invalidChars: () => ({ key: 'forms.auth.name.invalidChars' }),
  },

  // Terms and conditions
  terms: {
    mustAccept: () => ({ key: 'forms.auth.terms.mustAccept' }),
  },

  // Token validation
  token: {
    resetRequired: () => ({ key: 'forms.auth.token.resetRequired' }),
  },

  // Generic validation
  generic: {
    required: (field?: string) => ({
      key: field ? 'forms.validation.fieldRequired' : 'forms.validation.required',
      params: field ? { field } : undefined
    }),
    minLength: (min: number, field?: string) => ({
      key: field ? 'forms.validation.fieldTooShort' : 'forms.validation.minLength',
      params: field ? { field, min } : { min }
    }),
    maxLength: (max: number, field?: string) => ({
      key: field ? 'forms.validation.fieldTooLong' : 'forms.validation.maxLength',
      params: field ? { field, max } : { max }
    }),
    invalid: (field?: string) => ({
      key: field ? 'forms.validation.fieldInvalid' : 'forms.validation.pattern',
      params: field ? { field } : undefined
    }),
  },
};

// Helper function to create validation message from message config
export const createValidationMessage = (
  config: { key: string; params?: Record<string, any> },
  t?: (key: string, params?: Record<string, any>) => string
): string => {
  if (t) {
    return t(config.key, config.params);
  }

  // Fallback English messages when i18n is not available
  const fallbacks: Record<string, string> = {
    'forms.auth.password.minLength': `Password must be at least ${config.params?.min || 8} characters`,
    'forms.auth.password.maxLength': `Password must be less than ${config.params?.max || 100} characters`,
    'forms.auth.password.uppercase': 'Password must contain at least one uppercase letter',
    'forms.auth.password.lowercase': 'Password must contain at least one lowercase letter',
    'forms.auth.password.number': 'Password must contain at least one number',
    'forms.auth.password.specialChar': 'Password must contain at least one special character',
    'forms.auth.password.required': 'Password is required',
    'forms.auth.password.confirm': 'Please confirm your password',
    'forms.auth.password.noMatch': 'Passwords do not match',
    'forms.auth.password.current': 'Current password is required',
    'forms.auth.password.confirmNew': 'Please confirm your new password',
    'forms.auth.password.mustBeDifferent': 'New password must be different from current password',
    'forms.auth.email.required': 'Email is required',
    'forms.auth.email.invalid': 'Please enter a valid email address',
    'forms.auth.email.maxLength': `Email must be less than ${config.params?.max || 255} characters`,
    'forms.auth.name.firstRequired': 'First name is required',
    'forms.auth.name.lastRequired': 'Last name is required',
    'forms.auth.name.firstMaxLength': `First name must be less than ${config.params?.max || 50} characters`,
    'forms.auth.name.lastMaxLength': `Last name must be less than ${config.params?.max || 50} characters`,
    'forms.auth.name.invalidChars': 'Name contains invalid characters',
    'forms.auth.terms.mustAccept': 'You must accept the terms and conditions',
    'forms.auth.token.resetRequired': 'Reset token is required',
    'forms.validation.required': 'This field is required',
    'forms.validation.fieldRequired': `${config.params?.field || 'Field'} is required`,
    'forms.validation.minLength': `Must be at least ${config.params?.min || 1} characters`,
    'forms.validation.maxLength': `Must be no more than ${config.params?.max || 255} characters`,
    'forms.validation.fieldTooShort': `${config.params?.field || 'Field'} must be at least ${config.params?.min || 1} characters`,
    'forms.validation.fieldTooLong': `${config.params?.field || 'Field'} must be no more than ${config.params?.max || 255} characters`,
    'forms.validation.pattern': 'Invalid format',
    'forms.validation.fieldInvalid': `Please enter a valid ${config.params?.field || 'value'}`,
  };

  return fallbacks[config.key] || config.key;
};

// Helper type for schema validation message functions
export type ValidationMessageConfig = { key: string; params?: Record<string, any> };
export type ValidationMessageFn = () => ValidationMessageConfig;
