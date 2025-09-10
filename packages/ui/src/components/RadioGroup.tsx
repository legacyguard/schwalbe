
import React from 'react';
import {
  Label,
  styled,
  RadioGroup as TamaguiRadioGroup,
  XStack,
  YStack,
} from 'tamagui';

/**
 * Styled radio group component with LegacyGuard design system
 * @component
 */
const StyledRadioGroup = styled(TamaguiRadioGroup, {
  name: 'RadioGroup',
  gap: '$3',
});

/**
 * Radio item container component
 * @component
 */
const StyledRadioGroupItem = styled(TamaguiRadioGroup.Item, {
  name: 'RadioGroupItem',
  backgroundColor: '$background',
  borderWidth: 2,
  borderColor: '$gray4',
  borderRadius: 1000, // Full circle
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'quick',

  variants: {
    size: {
      sm: {
        width: 18,
        height: 18,
      },
      md: {
        width: 22,
        height: 22,
      },
      lg: {
        width: 26,
        height: 26,
      },
    },

    variant: {
      primary: {
        focusStyle: {
          borderColor: '$primaryBlueLight',
          outlineWidth: 2,
          outlineColor: '$primaryBlueLight',
          outlineStyle: 'solid',
        },
        '$group-radio-checked': {
          borderColor: '$primaryBlue',
        },
      },
      success: {
        focusStyle: {
          borderColor: '$primaryGreenLight',
          outlineWidth: 2,
          outlineColor: '$primaryGreenLight',
          outlineStyle: 'solid',
        },
        '$group-radio-checked': {
          borderColor: '$primaryGreen',
        },
      },
      premium: {
        focusStyle: {
          borderColor: '$accentGoldLight',
          outlineWidth: 2,
          outlineColor: '$accentGoldLight',
          outlineStyle: 'solid',
        },
        '$group-radio-checked': {
          borderColor: '$accentGold',
        },
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

/**
 * Radio indicator component for displaying selected state
 * @component
 */
const StyledRadioGroupIndicator = styled(TamaguiRadioGroup.Indicator, {
  name: 'RadioGroupIndicator',
  borderRadius: 1000,
  animation: 'quick',

  variants: {
    size: {
      sm: {
        width: 8,
        height: 8,
      },
      md: {
        width: 10,
        height: 10,
      },
      lg: {
        width: 12,
        height: 12,
      },
    },

    variant: {
      primary: {
        backgroundColor: '$primaryBlue',
      },
      success: {
        backgroundColor: '$primaryGreen',
      },
      premium: {
        backgroundColor: '$accentGold',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

/**
 * Radio option interface
 * @interface
 */
export interface RadioOption {
  /** Optional description text */
  description?: string;
  /** Disable this option */
  disabled?: boolean;
  /** Display label */
  label: string;
  /** Unique value */
  value: string;
}

/**
 * RadioGroup component props
 * @interface
 */
export interface RadioGroupProps {
  /** Accessibility label */
  'aria-label'?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Disable all radio buttons */
  disabled?: boolean;
  /** Form field name */
  name?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Array of radio options */
  options: RadioOption[];
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Required field */
  required?: boolean;
  /** Size variant - sm: 18px, md: 22px, lg: 26px */
  size?: 'lg' | 'md' | 'sm';
  /** Controlled value */
  value?: string;
  /** Color variant */
  variant?: 'premium' | 'primary' | 'success';
}

/**
 * RadioGroup component for selecting one option from multiple choices
 * @component
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' }
 *   ]}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 * />
 * ```
 */
export const RadioGroup = React.memo(
  React.forwardRef<HTMLDivElement, RadioGroupProps>(
    (
      {
        options,
        value,
        defaultValue,
        onValueChange,
        orientation = 'vertical',
        size = 'md',
        variant = 'primary',
        disabled = false,
        name,
        required,
        'aria-label': ariaLabel,
      },
      ref
    ) => {
      const StackComponent = orientation === 'horizontal' ? XStack : YStack;

      return (
        <StyledRadioGroup
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          name={name}
          required={required}
          aria-label={ariaLabel}
          disabled={disabled}
        >
          <StackComponent
            gap='$3'
            flexWrap={orientation === 'horizontal' ? 'wrap' : undefined}
          >
            {options.map(option => (
              <XStack key={option.value} alignItems='center' gap='$3'>
                <StyledRadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  size={size}
                  variant={variant}
                  disabled={disabled || option.disabled}
                >
                  <StyledRadioGroupIndicator size={size} variant={variant} />
                </StyledRadioGroupItem>
                <YStack flex={1}>
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    disabled={disabled || option.disabled}
                    cursor={
                      disabled || option.disabled ? 'not-allowed' : 'pointer'
                    }
                    onPress={() => {
                      if (!disabled && !option.disabled && onValueChange) {
                        onValueChange(option.value);
                      }
                    }}
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <Label
                      size='$2'
                      color='$gray6'
                      marginTop='$1'
                      disabled={disabled || option.disabled}
                    >
                      {option.description}
                    </Label>
                  )}
                </YStack>
              </XStack>
            ))}
          </StackComponent>
        </StyledRadioGroup>
      );
    }
  )
);

RadioGroup.displayName = 'RadioGroup';

/**
 * Props for standalone RadioButton component
 * @interface
 */
export interface RadioButtonProps {
  /** Checked state */
  checked?: boolean;
  /** Optional description */
  description?: string;
  /** Disable the radio button */
  disabled?: boolean;
  /** Display label */
  label: string;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Size variant - sm: 18px, md: 22px, lg: 26px */
  size?: 'lg' | 'md' | 'sm';
  /** Unique value */
  value: string;
  /** Color variant */
  variant?: 'premium' | 'primary' | 'success';
}

/**
 * Standalone RadioButton component
 * @component
 * @example
 * ```tsx
 * <RadioButton
 *   label="Enable feature"
 *   value="feature"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * ```
 */
export const RadioButton = React.memo(
  React.forwardRef<HTMLButtonElement, RadioButtonProps>(
    (
      {
        value,
        label,
        checked = false,
        onCheckedChange,
        size = 'md',
        variant = 'primary',
        disabled = false,
        description,
      },
      ref
    ) => {
      return (
        <XStack alignItems='center' gap='$3'>
          <StyledRadioGroup value={checked ? value : ''}>
            <StyledRadioGroupItem
              ref={ref}
              value={value}
              size={size}
              variant={variant}
              disabled={disabled}
              onPress={() => {
                if (!disabled && onCheckedChange) {
                  onCheckedChange(!checked);
                }
              }}
            >
              {checked && (
                <StyledRadioGroupIndicator size={size} variant={variant} />
              )}
            </StyledRadioGroupItem>
          </StyledRadioGroup>
          <YStack flex={1}>
            <Label
              disabled={disabled}
              cursor={disabled ? 'not-allowed' : 'pointer'}
              onPress={() => {
                if (!disabled && onCheckedChange) {
                  onCheckedChange(!checked);
                }
              }}
            >
              {label}
            </Label>
            {description && (
              <Label size='$2' color='$gray6' marginTop='$1' disabled={disabled}>
                {description}
              </Label>
            )}
          </YStack>
        </XStack>
      );
    }
  )
);

RadioButton.displayName = 'RadioButton';
