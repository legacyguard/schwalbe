
import React from 'react';
import { type GetProps, styled, Button as TamaguiButton } from 'tamagui';

/**
 * Button component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <Button theme="primary" size="medium" onPress={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @variant primary - Primary action button with blue background
 * @variant secondary - Secondary action button with gray background
 * @variant success - Success action button with green background
 * @variant premium - Premium action button with gold background
 * @variant danger - Danger action button with red background
 * @variant ghost - Ghost button with transparent background
 * @variant outline - Outline button with border
 *
 * @size small - 32px height
 * @size medium - 40px height (default)
 * @size large - 48px height
 * @size xlarge - 56px height
 */
export const Button = React.memo(styled(TamaguiButton, {
  name: 'LGButton',

  // Base styles
  backgroundColor: '$primaryBlue',
  color: 'white',
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '$4',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: '$2',

  // Animations
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    opacity: 0.9,
  },
  hoverStyle: {
    backgroundColor: '$primaryBlueDark',
  },
  focusStyle: {
    backgroundColor: '$primaryBlueDark',
    outlineColor: '$primaryBlueLight',
    outlineStyle: 'solid',
    outlineWidth: 2,
  },
  disabledStyle: {
    backgroundColor: '$gray4',
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  // Variants
  variants: {
    variant: {
      primary: {
        backgroundColor: '$primaryBlue',
        color: 'white',
        hoverStyle: {
          backgroundColor: '$primaryBlueDark',
        },
      },
      secondary: {
        backgroundColor: '$gray2',
        color: '$gray9',
        borderColor: '$gray3',
        hoverStyle: {
          backgroundColor: '$gray3',
        },
      },
      success: {
        backgroundColor: '$primaryGreen',
        color: 'white',
        hoverStyle: {
          backgroundColor: '$primaryGreenDark',
        },
      },
      premium: {
        backgroundColor: '$accentGold',
        color: 'white',
        hoverStyle: {
          backgroundColor: '$accentGoldDark',
        },
      },
      danger: {
        backgroundColor: '$error',
        color: 'white',
        hoverStyle: {
          backgroundColor: '$errorDark',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$primaryBlue',
        borderColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$gray2',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$primaryBlue',
        borderColor: '$primaryBlue',
        borderWidth: 2,
        hoverStyle: {
          backgroundColor: '$primaryBlue',
          color: 'white',
        },
      },
    },

    size: {
      small: {
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        fontSize: '$3',
        height: 32,
      },
      medium: {
        paddingHorizontal: '$4',
        paddingVertical: '$3',
        fontSize: '$4',
        height: 40,
      },
      large: {
        paddingHorizontal: '$5',
        paddingVertical: '$4',
        fontSize: '$5',
        height: 48,
      },
      xlarge: {
        paddingHorizontal: '$6',
        paddingVertical: '$5',
        fontSize: '$6',
        height: 56,
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    rounded: {
      true: {
        borderRadius: 9999,
      },
      false: {
        borderRadius: '$2',
      },
    },

    loading: {
      true: {
        opacity: 0.7,
        pointerEvents: 'none',
      },
    },
  } as const,

  // Default variants
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    fullWidth: false,
    rounded: false,
    loading: false,
  },
}));

/**
 * Props for the Button component
 */
export type ButtonProps = GetProps<typeof Button>;

/**
 * IconButton component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <IconButton size="medium" onPress={handleClick}>
 *   <Icon name="heart" />
 * </IconButton>
 * ```
 *
 * @size small - 32x32px
 * @size medium - 40x40px (default)
 * @size large - 48x48px
 * @size xlarge - 56x56px
 */
export const IconButton = React.memo(styled(Button, {
  name: 'LGIconButton',
  paddingHorizontal: 0,
  aspectRatio: 1,

  variants: {
    size: {
      small: {
        width: 32,
        height: 32,
      },
      medium: {
        width: 40,
        height: 40,
      },
      large: {
        width: 48,
        height: 48,
      },
      xlarge: {
        width: 56,
        height: 56,
      },
    },
  },

  defaultVariants: {
    size: 'medium',
  },
}));

/**
 * Props for the IconButton component
 */
export type IconButtonProps = GetProps<typeof IconButton>;
