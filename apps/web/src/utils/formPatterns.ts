import { validationRules, ValidationConfig } from '@/hooks/useValidation';

/**
 * Common form validation patterns
 */
export const commonValidationPatterns = {
  // Email validation
  email: [
    validationRules.required('Email is required'),
    validationRules.email('Please enter a valid email address')
  ],

  // Password validation
  password: [
    validationRules.required('Password is required'),
    validationRules.minLength(8, 'Password must be at least 8 characters'),
    validationRules.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    )
  ],

  // Confirm password validation
  confirmPassword: (passwordField: string) => [
    validationRules.required('Please confirm your password'),
    validationRules.custom(
      (value: string, formData: any) => value === formData[passwordField],
      'Passwords do not match'
    )
  ],

  // Name validation
  fullName: [
    validationRules.required('Full name is required'),
    validationRules.minLength(2, 'Name must be at least 2 characters'),
    validationRules.pattern(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
  ],

  // Phone validation
  phone: [
    validationRules.required('Phone number is required'),
    validationRules.phone('Please enter a valid phone number')
  ],

  // Optional phone validation
  optionalPhone: [
    validationRules.phone('Please enter a valid phone number')
  ],

  // Age validation
  age: [
    validationRules.required('Age is required'),
    validationRules.min(1, 'Age must be greater than 0'),
    validationRules.max(150, 'Please enter a valid age')
  ],

  // Address validation
  address: [
    validationRules.required('Address is required'),
    validationRules.minLength(5, 'Address must be at least 5 characters')
  ],

  // Required selection
  requiredSelect: (fieldName: string) => [
    validationRules.required(`Please select a ${fieldName}`)
  ],

  // Optional text
  optionalText: [],

  // Required text
  requiredText: (fieldName: string) => [
    validationRules.required(`${fieldName} is required`)
  ],

  // Will-specific validations
  will: {
    jurisdiction: [
      validationRules.required('Please select a jurisdiction')
    ],

    language: [
      validationRules.required('Please select a language')
    ],

    form: [
      validationRules.required('Please select a will type')
    ],

    testatorAge: (formType: 'typed' | 'holographic') => [
      validationRules.required('Age is required'),
      validationRules.min(
        formType === 'holographic' ? 15 : 18,
        `Age must be at least ${formType === 'holographic' ? 15 : 18} for ${formType} will`
      )
    ],

    beneficiaryName: [
      validationRules.required('Beneficiary name is required'),
      validationRules.minLength(2, 'Name must be at least 2 characters')
    ],

    executorName: [], // Optional field

    witnessName: [
      validationRules.required('Witness name is required'),
      validationRules.minLength(2, 'Name must be at least 2 characters')
    ]
  }
};

/**
 * Common form field configurations
 */
export const fieldConfigurations = {
  email: {
    type: 'email',
    placeholder: 'Enter your email address',
    autoComplete: 'email'
  },

  password: {
    type: 'password',
    placeholder: 'Enter your password',
    autoComplete: 'current-password'
  },

  newPassword: {
    type: 'password',
    placeholder: 'Create a password',
    autoComplete: 'new-password'
  },

  confirmPassword: {
    type: 'password',
    placeholder: 'Confirm your password',
    autoComplete: 'new-password'
  },

  fullName: {
    type: 'text',
    placeholder: 'Enter your full name',
    autoComplete: 'name'
  },

  phone: {
    type: 'tel',
    placeholder: 'Enter your phone number',
    autoComplete: 'tel'
  },

  address: {
    type: 'text',
    placeholder: 'Enter your address',
    autoComplete: 'street-address'
  },

  age: {
    type: 'number',
    min: 1,
    max: 150,
    placeholder: 'Enter your age'
  }
};

/**
 * Form submission patterns
 */
export const submissionPatterns = {
  // Standard form submission with loading state
  createSubmitHandler: <T>(
    onSubmit: (data: T) => Promise<void>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      successMessage?: string;
    } = {}
  ) => {
    return async (data: T) => {
      try {
        await onSubmit(data);
        options.onSuccess?.(data);
      } catch (error: any) {
        const errorMessage = error.message || 'An unexpected error occurred';
        options.onError?.(errorMessage);
        throw error;
      }
    };
  },

  // Async validation pattern
  createAsyncValidator: <T>(
    validateFn: (field: keyof T, value: any) => Promise<string | undefined>
  ) => {
    return async (data: T) => {
      const errors: Partial<Record<keyof T, string>> = {};

      for (const [field, value] of Object.entries(data)) {
        try {
          const error = await validateFn(field as keyof T, value);
          if (error) {
            errors[field as keyof T] = error;
          }
        } catch (err) {
          errors[field as keyof T] = 'Validation failed';
        }
      }

      return errors;
    };
  }
};

/**
 * Common select options
 */
export const selectOptions = {
  countries: [
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    // Add more as needed
  ],

  languages: [
    { value: 'en', label: 'English' },
    { value: 'cs', label: 'Čeština' },
    { value: 'sk', label: 'Slovenčina' },
    { value: 'de', label: 'Deutsch' },
    // Add more as needed
  ],

  willTypes: [
    { value: 'typed', label: 'Typed Will (Requires Witnesses)' },
    { value: 'holographic', label: 'Handwritten Will (No Witnesses)' }
  ],

  relationships: [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' }
  ],

  yesNo: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ],

  trueFalse: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ]
};

/**
 * Form layout patterns
 */
export const layoutPatterns = {
  // Two-column layout for desktop
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-4',

  // Three-column layout for desktop
  threeColumn: 'grid grid-cols-1 md:grid-cols-3 gap-4',

  // Stacked layout
  stacked: 'space-y-4',

  // Inline layout for small forms
  inline: 'flex flex-wrap items-end gap-4',

  // Form sections
  section: 'space-y-4 p-6 bg-slate-800 rounded-lg border border-slate-700',

  // Fieldset styling
  fieldset: 'space-y-4 p-4 border border-slate-600 rounded-lg',

  // Button groups
  buttonGroup: 'flex items-center gap-2',
  buttonGroupRight: 'flex items-center justify-end gap-2',
  buttonGroupSpaced: 'flex items-center justify-between'
};

/**
 * Accessibility patterns
 */
export const a11yPatterns = {
  // Form section with proper headings
  createFormSection: (title: string, description?: string) => ({
    role: 'region' as const,
    'aria-labelledby': `${title.toLowerCase().replace(/\s+/g, '-')}-heading`,
    heading: {
      id: `${title.toLowerCase().replace(/\s+/g, '-')}-heading`,
      children: title
    },
    description: description ? {
      id: `${title.toLowerCase().replace(/\s+/g, '-')}-description`,
      children: description
    } : undefined
  }),

  // Required field indicator
  requiredIndicator: {
    'aria-label': 'required',
    className: 'text-red-400 ml-1'
  },

  // Loading state
  loadingState: {
    'aria-busy': true,
    'aria-live': 'polite' as const
  },

  // Error state
  errorState: (errorId: string) => ({
    'aria-invalid': true,
    'aria-describedby': errorId
  })
};

/**
 * Helper functions for form creation
 */
export const formHelpers = {
  // Create a field configuration
  createField: <T>(
    name: keyof T,
    label: string,
    options: {
      type?: string;
      required?: boolean;
      help?: string;
      placeholder?: string;
      validation?: any[];
      fieldConfig?: any;
    } = {}
  ) => ({
    name,
    label,
    required: options.required || false,
    help: options.help,
    validation: options.validation || (options.required ? [validationRules.required(`${label} is required`)] : []),
    fieldConfig: {
      type: options.type || 'text',
      placeholder: options.placeholder,
      ...options.fieldConfig
    }
  }),

  // Create validation configuration from field definitions
  createValidationConfig: <T>(fields: Array<{
    name: keyof T;
    validation: any[];
  }>) => {
    const config: ValidationConfig<T> = {};
    fields.forEach(field => {
      config[field.name] = field.validation;
    });
    return config;
  }
};