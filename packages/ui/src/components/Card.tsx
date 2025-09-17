
import React from 'react';
import { type GetProps, styled, Text, View } from 'tamagui';

/**
 * Card component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <Card theme="elevated" padding="medium">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Text>Card content goes here</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * @variant default - Default card with border
 * @variant elevated - Elevated card with shadow
 * @variant filled - Filled card with gray background
 * @variant premium - Premium card with gold background
 * @variant success - Success card with green background
 * @variant danger - Danger card with red background
 * @variant ghost - Ghost card with transparent background
 *
 * @padding none - No padding
 * @padding small - Small padding ($3)
 * @padding medium - Medium padding ($4) (default)
 * @padding large - Large padding ($5)
 * @padding xlarge - Extra large padding ($6)
 */
export const Card = React.memo(styled(View, {
  name: 'LGCard',

  // Base styles
  backgroundColor: '$background',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$gray3',
  padding: '$4',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,

  // Animations
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
  },
  exitStyle: {
    opacity: 0,
    scale: 0.95,
  },

  // Hover effects
  hoverStyle: {
    borderColor: '$gray4',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  // Variants
  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$gray3',
      },
      elevated: {
        backgroundColor: '$background',
        borderColor: 'transparent',
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      filled: {
        backgroundColor: '$gray2',
        borderColor: '$gray3',
      },
      premium: {
        backgroundColor: '$accentGold',
        borderColor: '$accentGoldDark',
        color: 'white',
      },
      success: {
        backgroundColor: '$primaryGreen',
        borderColor: '$primaryGreenDark',
        color: 'white',
      },
      danger: {
        backgroundColor: '$error',
        borderColor: '$errorDark',
        color: 'white',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        shadowOpacity: 0,
      },
    },

    padding: {
      none: {
        padding: 0,
      },
      small: {
        padding: '$3',
      },
      medium: {
        padding: '$4',
      },
      large: {
        padding: '$5',
      },
      xlarge: {
        padding: '$6',
      },
    },

    clickable: {
      true: {
        cursor: 'pointer',
        pressStyle: {
          scale: 0.98,
          opacity: 0.9,
        },
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  // Default variants
  defaultVariants: {
    variant: 'default',
    padding: 'medium',
    clickable: false,
    fullWidth: false,
  },
}));

/**
 * CardHeader component for Card headers
 *
 * @component
 * @example
 * ```tsx
 * <CardHeader noBorder>
 *   <CardTitle>Title</CardTitle>
 * </CardHeader>
 * ```
 *
 * @prop noBorder - Remove bottom border
 */
export const CardHeader = React.memo(styled(View, {
  name: 'LGCardHeader',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$3',
  paddingBottom: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$gray3',

  variants: {
    noBorder: {
      true: {
        borderBottomWidth: 0,
        paddingBottom: 0,
      },
    },
  },

  defaultVariants: {
    noBorder: false,
  },
}));

/**
 * CardTitle component for Card titles
 *
 * @component
 * @example
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
export const CardTitle = React.memo(styled(Text, {
  name: 'LGCardTitle',
  fontSize: '$6',
  fontWeight: '$5',
  color: '$color',
  fontFamily: '$heading',
}));

/**
 * CardDescription component for Card descriptions
 *
 * @component
 * @example
 * ```tsx
 * <CardDescription>Card description text</CardDescription>
 * ```
 */
export const CardDescription = React.memo(styled(Text, {
  name: 'LGCardDescription',
  fontSize: '$4',
  color: '$gray6',
  fontFamily: '$body',
  marginTop: '$1',
}));

/**
 * CardContent component for Card content
 *
 * @component
 * @example
 * ```tsx
 * <CardContent>
 *   <Text>Main content goes here</Text>
 * </CardContent>
 * ```
 */
export const CardContent = React.memo(styled(View, {
  name: 'LGCardContent',
  flex: 1,
}));

/**
 * CardFooter component for Card footers
 *
 * @component
 * @example
 * ```tsx
 * <CardFooter justify="between" noBorder>
 *   <Button>Cancel</Button>
 *   <Button theme="primary">Save</Button>
 * </CardFooter>
 * ```
 *
 * @prop noBorder - Remove top border
 * @prop justify - Justify content alignment
 */
export const CardFooter = React.memo(styled(View, {
  name: 'LGCardFooter',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: '$4',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderTopColor: '$gray3',
  gap: '$2',

  variants: {
    noBorder: {
      true: {
        borderTopWidth: 0,
        paddingTop: 0,
      },
    },
    justify: {
      start: {
        justifyContent: 'flex-start',
      },
      center: {
        justifyContent: 'center',
      },
      end: {
        justifyContent: 'flex-end',
      },
      between: {
        justifyContent: 'space-between',
      },
    },
  },
}));

/**
 * Props for the Card component
 */
export type CardProps = GetProps<typeof Card>;

/**
 * Props for the CardHeader component
 */
export type CardHeaderProps = GetProps<typeof CardHeader>;

/**
 * Props for the CardTitle component
 */
export type CardTitleProps = GetProps<typeof CardTitle>;

/**
 * Props for the CardDescription component
 */
export type CardDescriptionProps = GetProps<typeof CardDescription>;

/**
 * Props for the CardContent component
 */
export type CardContentProps = GetProps<typeof CardContent>;

/**
 * Props for the CardFooter component
 */
export type CardFooterProps = GetProps<typeof CardFooter>;
