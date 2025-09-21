
import React from 'react';
import {
  Label,
  styled,
  Checkbox as TamaguiCheckbox,
  type CheckboxProps as TamaguiCheckboxProps,
  Theme,
  XStack,
} from 'tamagui';
import { Check } from 'lucide-react-native';

/**
 * Styled checkbox component with LegacyGuard design system
 * @component
 * @example
 * ```tsx
 * <Checkbox
 *   size="md"
 *   theme="primary"
 *   label="Enable notifications"
 *   onCheckedChange={(checked) => console.log(checked)}
 * />
 * ```
 */
const StyledCheckbox = styled(TamaguiCheckbox, {
  name: 'Checkbox',
  backgroundColor: '$background',
  borderWidth: 2,
  borderColor: '$gray4',
  borderRadius: '$2',
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
      },
      success: {
        focusStyle: {
          borderColor: '$primaryGreenLight',
          outlineWidth: 2,
          outlineColor: '$primaryGreenLight',
          outlineStyle: 'solid',
        },
      },
      premium: {
        focusStyle: {
          borderColor: '$accentGoldLight',
          outlineWidth: 2,
          outlineColor: '$accentGoldLight',
          outlineStyle: 'solid',
        },
      },
    },

    checked: {
      true: {
        backgroundColor: '$primaryBlue',
        borderColor: '$primaryBlue',
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
    size: 'md' as const,
    variant: 'primary' as const,
  },
});

/**
 * Checkbox indicator component for displaying checkmark or indeterminate state
 * @component
 */
const StyledIndicator = styled(TamaguiCheckbox.Indicator, {
  name: 'CheckboxIndicator',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

/**
 * Props for the Checkbox component
 * @interface
 */
export interface CheckboxProps extends Omit<TamaguiCheckboxProps, 'size'> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Disable the checkbox */
  disabled?: boolean;
  /** Show indeterminate state (horizontal line) */
  indeterminate?: boolean;
  /** Label text to display alongside checkbox */
  label?: string;
  /** Position of label relative to checkbox */
  labelPosition?: 'left' | 'right';
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Size variant - sm: 18px, md: 22px, lg: 26px */
  size?: 'lg' | 'md' | 'sm';
  /** Color variant */
  variant?: 'premium' | 'primary' | 'success';
}

// Main Checkbox component
export const Checkbox = React.memo(
  React.forwardRef<HTMLButtonElement, CheckboxProps>(
    (
      {
        size = 'md',
        variant = 'primary',
        label,
        labelPosition = 'right',
        disabled = false,
        checked,
        defaultChecked,
        onCheckedChange,
        indeterminate = false,
        ...props
      },
      ref
    ) => {
      // Calculate icon size based on checkbox size
      const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;

      const checkboxComponent = (
        <StyledCheckbox
          ref={ref}
          size={size}
          variant={variant}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          {...props}
        >
          <StyledIndicator>
            {indeterminate ? (
              <Theme name={variant}>
                <XStack
                  width={iconSize * 0.7}
                  height={2}
                  backgroundColor='$color12'
                  borderRadius='$1'
                />
              </Theme>
            ) : (
              <Check size={iconSize} color='$color12' strokeWidth={3} />
            )}
          </StyledIndicator>
        </StyledCheckbox>
      );

      if (!label) {
        return checkboxComponent;
      }

      return (
        <XStack
          alignItems='center'
          gap='$3'
          opacity={disabled ? 0.5 : 1}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          onPress={() => {
            if (!disabled && onCheckedChange) {
              onCheckedChange(!checked);
            }
          }}
        >
          {labelPosition === 'left' && (
            <Label
              htmlFor={props.id}
              disabled={disabled}
              cursor={disabled ? 'not-allowed' : 'pointer'}
            >
              {label}
            </Label>
          )}
          {checkboxComponent}
          {labelPosition === 'right' && (
            <Label
              htmlFor={props.id}
              disabled={disabled}
              cursor={disabled ? 'not-allowed' : 'pointer'}
            >
              {label}
            </Label>
          )}
        </XStack>
      );
    }
  )
);

Checkbox.displayName = 'Checkbox';

// CheckboxGroup component for managing multiple checkboxes
export interface CheckboxGroupProps {
  disabled?: boolean;
  onValueChange: (value: string[]) => void;
  options: Array<{
    disabled?: boolean;
    label: string;
    value: string;
  }>;
  orientation?: 'horizontal' | 'vertical';
  size?: 'lg' | 'md' | 'sm';
  value: string[];
  variant?: 'premium' | 'primary' | 'success';
}

export const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>(
  (
    {
      options,
      value = [],
      onValueChange,
      orientation = 'vertical',
      size = 'md',
      variant = 'primary',
      disabled = false,
    },
    ref
  ) => {
    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onValueChange([...value, optionValue]);
      } else {
        onValueChange(value.filter(v => v !== optionValue));
      }
    };

    const StackComponent =
      orientation === 'horizontal'
        ? XStack
        : styled(XStack, {
            flexDirection: 'column',
          });

    return (
      <StackComponent ref={ref} gap='$3' flexWrap='wrap'>
        {options.map(option => (
          <Checkbox
            key={option.value}
            label={option.label}
            size={size}
            variant={variant}
            checked={value.includes(option.value)}
            onCheckedChange={checked =>
              handleCheckboxChange(option.value, checked)
            }
            disabled={disabled || option.disabled}
          />
        ))}
      </StackComponent>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';
