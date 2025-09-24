
import React from 'react';
import {
  type GetProps,
  styled,
  Input as TamaguiInput,
  TextArea as TamaguiTextArea,
  Text,
  View,
} from '@tamagui/core';

/**
 * Input component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter your name"
 *   theme="default"
 *   size="medium"
 *   fullWidth
 * />
 * ```
 *
 * @variant default - Default input with border
 * @variant filled - Filled input with gray background
 * @variant ghost - Ghost input with bottom border only
 * @variant error - Error input with red border
 * @variant success - Success input with green border
 *
 * @size small - 32px height
 * @size medium - 40px height (default)
 * @size large - 48px height
 */
export const Input = React.memo(styled(TamaguiInput, {
  name: 'LGInput',

  // Base styles
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$gray3',
  borderRadius: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$4',
  fontFamily: '$body',
  color: '$color',
  placeholderTextColor: '$gray5',
  height: 40,
  width: '100%',

  // Focus styles
  focusStyle: {
    borderColor: '$primaryBlue',
    outlineColor: '$primaryBlueLight',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 1,
  },

  // Hover styles
  hoverStyle: {
    borderColor: '$gray4',
  },

  // Disabled styles
  disabledStyle: {
    backgroundColor: '$gray2',
    color: '$gray5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  // Variants
  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$gray3',
      },
      filled: {
        backgroundColor: '$gray2',
        borderColor: 'transparent',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '$gray3',
        borderRadius: 0,
        paddingHorizontal: 0,
      },
      error: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
          outlineColor: '$errorLight',
        },
      },
      success: {
        borderColor: '$success',
        focusStyle: {
          borderColor: '$success',
          outlineColor: '$successLight',
        },
      },
    },

    size: {
      small: {
        height: 32,
        fontSize: '$3',
        paddingHorizontal: '$2',
        paddingVertical: '$1',
      },
      medium: {
        height: 40,
        fontSize: '$4',
        paddingHorizontal: '$3',
        paddingVertical: '$2',
      },
      large: {
        height: 48,
        fontSize: '$5',
        paddingHorizontal: '$4',
        paddingVertical: '$3',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
      false: {
        width: 'auto',
      },
    },
  } as const,

  // Default variants
  defaultVariants: {
    variant: 'default',
    size: 'medium',
    fullWidth: false,
  },
}));

/**
 * TextArea component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <TextArea
 *   placeholder="Enter your message"
 *   theme="default"
 *   size="medium"
 * />
 * ```
 *
 * @variant default - Default textarea with border
 * @variant filled - Filled textarea with gray background
 * @variant error - Error textarea with red border
 * @variant success - Success textarea with green border
 *
 * @size small - 80px min-height
 * @size medium - 100px min-height (default)
 * @size large - 120px min-height
 */
export const TextArea = React.memo(styled(TamaguiTextArea, {
  name: 'LGTextArea',

  // Inherit all Input styles
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$gray3',
  borderRadius: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$4',
  fontFamily: '$body',
  color: '$color',
  placeholderTextColor: '$gray5',
  width: '100%',
  minHeight: 100,
  textAlignVertical: 'top',

  // Focus styles
  focusStyle: {
    borderColor: '$primaryBlue',
    outlineColor: '$primaryBlueLight',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 1,
  },

  // Hover styles
  hoverStyle: {
    borderColor: '$gray4',
  },

  // Disabled styles
  disabledStyle: {
    backgroundColor: '$gray2',
    color: '$gray5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  // Variants (same as Input)
  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$gray3',
      },
      filled: {
        backgroundColor: '$gray2',
        borderColor: 'transparent',
      },
      error: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
          outlineColor: '$errorLight',
        },
      },
      success: {
        borderColor: '$success',
        focusStyle: {
          borderColor: '$success',
          outlineColor: '$successLight',
        },
      },
    },

    size: {
      small: {
        minHeight: 80,
        fontSize: '$3',
        paddingHorizontal: '$2',
        paddingVertical: '$2',
      },
      medium: {
        minHeight: 100,
        fontSize: '$4',
        paddingHorizontal: '$3',
        paddingVertical: '$3',
      },
      large: {
        minHeight: 120,
        fontSize: '$5',
        paddingHorizontal: '$4',
        paddingVertical: '$4',
      },
    },
  } as const,

  // Default variants
  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
}));

/**
 * InputGroup component for grouping inputs with labels and error messages
 *
 * @component
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputLabel>Email</InputLabel>
 *   <Input placeholder="Enter email" />
 *   <InputError>Email is required</InputError>
 * </InputGroup>
 * ```
 */
export const InputGroup = React.memo(styled(View, {
  name: 'LGInputGroup',
  width: '100%',
  gap: '$2',
}));

/**
 * InputLabel component for input labels
 *
 * @component
 * @example
 * ```tsx
 * <InputLabel>Username</InputLabel>
 * ```
 */
export const InputLabel = React.memo(styled(Text, {
  name: 'LGInputLabel',
  fontSize: '$3',
  fontWeight: '$4',
  color: '$gray7',
  fontFamily: '$body',
  marginBottom: '$1',
}));

/**
 * InputError component for input error messages
 *
 * @component
 * @example
 * ```tsx
 * <InputError>This field is required</InputError>
 * ```
 */
export const InputError = React.memo(styled(Text, {
  name: 'LGInputError',
  fontSize: '$3',
  color: '$error',
  fontFamily: '$body',
  marginTop: '$1',
}));

/**
 * InputHelper component for input helper text
 *
 * @component
 * @example
 * ```tsx
 * <InputHelper>Helper text for the input</InputHelper>
 * ```
 */
export const InputHelper = React.memo(styled(Text, {
  name: 'LGInputHelper',
  fontSize: '$3',
  color: '$gray6',
  fontFamily: '$body',
  marginTop: '$1',
}));

/**
 * Props for the Input component
 */
export type InputProps = GetProps<typeof Input>;

/**
 * Props for the TextArea component
 */
export type TextAreaProps = GetProps<typeof TextArea>;

/**
 * Props for the InputGroup component
 */
export type InputGroupProps = GetProps<typeof InputGroup>;

/**
 * Props for the InputLabel component
 */
export type InputLabelProps = GetProps<typeof InputLabel>;

/**
 * Props for the InputError component
 */
export type InputErrorProps = GetProps<typeof InputError>;

/**
 * Props for the InputHelper component
 */
export type InputHelperProps = GetProps<typeof InputHelper>;
