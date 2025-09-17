
import React from 'react';
import { type GetProps, styled, Text, View } from 'tamagui';

// Badge Container
export const Badge = React.memo(styled(View, {
  name: 'LGBadge',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$1',
  paddingHorizontal: '$2',
  paddingVertical: 2,

  variants: {
    variant: {
      default: {
        backgroundColor: '$gray2',
        borderColor: '$gray3',
      },
      primary: {
        backgroundColor: '$primaryBlue',
        borderColor: '$primaryBlueDark',
      },
      secondary: {
        backgroundColor: '$gray5',
        borderColor: '$gray6',
      },
      success: {
        backgroundColor: '$success',
        borderColor: '$primaryGreenDark',
      },
      warning: {
        backgroundColor: '$warning',
        borderColor: '$accentGoldDark',
      },
      error: {
        backgroundColor: '$error',
        borderColor: 'rgba(220, 38, 38, 0.8)',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      premium: {
        backgroundColor: '$accentGold',
        borderColor: '$accentGoldDark',
      },
    },
    size: {
      sm: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
      },
      md: {
        paddingHorizontal: '$2',
        paddingVertical: 2,
        borderRadius: '$1',
      },
      lg: {
        paddingHorizontal: '$3',
        paddingVertical: '$1',
        borderRadius: 6,
      },
    },
    rounded: {
      true: {
        borderRadius: 9999,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
    rounded: false,
  },
}));

// Badge Text
export const BadgeText = React.memo(styled(Text, {
  name: 'LGBadgeText',
  fontSize: '$3',
  fontWeight: '500',
  lineHeight: 1,

  variants: {
    variant: {
      default: {
        color: '$gray9',
      },
      primary: {
        color: 'white',
      },
      secondary: {
        color: 'white',
      },
      success: {
        color: 'white',
      },
      warning: {
        color: 'white',
      },
      error: {
        color: 'white',
      },
      outline: {
        color: '$color',
      },
      premium: {
        color: 'white',
      },
    },
    size: {
      sm: {
        fontSize: '$2',
      },
      md: {
        fontSize: '$3',
      },
      lg: {
        fontSize: '$4',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
}));

// Badge with Icon support
export const BadgeWithIcon = React.memo(({
  children,
  icon,
  variant = 'default',
  size = 'md',
  ...props
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: GetProps<typeof Badge>['size'];
  variant?: GetProps<typeof Badge>['variant'];
} & Omit<GetProps<typeof Badge>, 'size' | 'variant'>) => {
  return (
    <Badge variant={variant} size={size} {...props}>
      {icon && <View marginRight='$1'>{icon}</View>}
      <BadgeText variant={variant} size={size}>
        {children}
      </BadgeText>
    </Badge>
  );
});

BadgeWithIcon.displayName = 'BadgeWithIcon';

// Badge Dot for status indicators
export const BadgeDot = React.memo(styled(View, {
  name: 'LGBadgeDot',
  width: 8,
  height: 8,
  borderRadius: 9999,

  variants: {
    status: {
      online: {
        backgroundColor: '$success',
      },
      offline: {
        backgroundColor: '$gray5',
      },
      busy: {
        backgroundColor: '$error',
      },
      away: {
        backgroundColor: '$warning',
      },
    },
    pulse: {
      true: {
        animation: 'quick',
      },
    },
  } as const,

  defaultVariants: {
    status: 'offline',
    pulse: false,
  },
}));

// Badge Group for multiple badges
export const BadgeGroup = React.memo(styled(View, {
  name: 'LGBadgeGroup',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$2',

  variants: {
    size: {
      small: {
        gap: '$1',
      },
      medium: {
        gap: '$2',
      },
      large: {
        gap: '$3',
      },
    },
  } as const,

  defaultVariants: {
    size: 'medium',
  },
}));

// Export types
export type BadgeProps = GetProps<typeof Badge>;
export type BadgeTextProps = GetProps<typeof BadgeText>;
export type BadgeDotProps = GetProps<typeof BadgeDot>;
export type BadgeGroupProps = GetProps<typeof BadgeGroup>;
export type BadgeWithIconProps = Parameters<typeof BadgeWithIcon>[0];
