
import React from 'react';
import {
  Label,
  styled,
  Switch as TamaguiSwitch,
  type SwitchProps as TamaguiSwitchProps,
  XStack,
} from 'tamagui';

/**
 * Styled switch component with LegacyGuard styling
 * @component
 * @private
 */
const StyledSwitch = styled(TamaguiSwitch, {
  name: 'Switch',
  backgroundColor: '$gray4',
  borderWidth: 2,
  borderColor: '$gray4',

  variants: {
    size: {
      /** Small size variant - 44x24px */
      sm: {
        width: 44,
        height: 24,
      },
      /** Medium size variant - 52x28px */
      md: {
        width: 52,
        height: 28,
      },
      /** Large size variant - 60x32px */
      lg: {
        width: 60,
        height: 32,
      },
    },

    variant: {
      /** Primary variant with blue accent */
      primary: {
        borderColor: '$gray4',
      },
      /** Success variant with green accent */
      success: {
        borderColor: '$gray4',
      },
      /** Premium variant with gold accent */
      premium: {
        borderColor: '$gray4',
      },
    },

    checked: {
      true: {
        backgroundColor: '$primaryBlue',
        borderColor: '$primaryBlue',
      },
    },
  },

  defaultVariants: {
    size: 'md' as const,
    variant: 'primary' as const,
  },
});

/**
 * Styled thumb component for the switch
 * @component
 * @private
 */
const StyledThumb = styled(TamaguiSwitch.Thumb, {
  name: 'SwitchThumb',
  backgroundColor: 'white',
  animation: 'quick',

  variants: {
    size: {
      /** Small thumb - 18x18px */
      sm: {
        width: 18,
        height: 18,
      },
      /** Medium thumb - 22x22px */
      md: {
        width: 22,
        height: 22,
      },
      /** Large thumb - 26x26px */
      lg: {
        width: 26,
        height: 26,
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
});

/**
 * Props for the Switch component
 */
export interface SwitchProps extends Omit<TamaguiSwitchProps, 'size'> {
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Label text to display next to the switch */
  label?: string;
  /** Position of the label relative to the switch */
  labelPosition?: 'left' | 'right';
  /** Callback fired when the switch value changes */
  onValueChange?: (value: boolean) => void;
  /** Size of the switch */
  size?: 'lg' | 'md' | 'sm';
  /** Visual variant of the switch */
  variant?: 'premium' | 'primary' | 'success';
}

/**
 * A toggle switch component with customizable size, variant, and label support
 *
 * @component
 * @example
 * ```tsx
 * // Basic switch
 * <Switch onValueChange={(value) => console.log(value)} />
 *
 * // Switch with label
 * <Switch
 *   label="Enable notifications"
 *   labelPosition="left"
 *   size="lg"
 *   theme="success"
 * />
 *
 * // Disabled switch
 * <Switch
 *   label="Feature enabled"
 *   disabled={true}
 *   defaultChecked={true}
 * />
 * ```
 */
export const Switch = React.memo(
  React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
      {
        size = 'md',
        variant = 'primary',
        label,
        labelPosition = 'right',
        disabled = false,
        onValueChange,
        ...props
      },
      ref
    ) => {
      const switchComponent = (
        <StyledSwitch
          ref={ref}
          size={size}
          variant={variant}
          disabled={disabled}
          onCheckedChange={onValueChange}
          opacity={disabled ? 0.5 : 1}
          {...props}
        >
          <StyledThumb size={size} animation='quick' />
        </StyledSwitch>
      );

      if (!label) {
        return switchComponent;
      }

      return (
        <XStack alignItems='center' gap='$3' opacity={disabled ? 0.5 : 1}>
          {labelPosition === 'left' && (
            <Label
              htmlFor={props.id}
              disabled={disabled}
              cursor={disabled ? 'not-allowed' : 'pointer'}
            >
              {label}
            </Label>
          )}
          {switchComponent}
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

Switch.displayName = 'Switch';
