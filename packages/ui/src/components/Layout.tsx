
import React from 'react';
import { type GetProps, ScrollView, styled, View } from '@tamagui/core';

/**
 * Container component for LegacyGuard applications
 *
 * @component
 * @example
 * ```tsx
 * <Container size="medium" padding="large">
 *   <Text>Content</Text>
 * </Container>
 * ```
 *
 * @size small - Max width 640px
 * @size medium - Max width 768px
 * @size large - Max width 1024px
 * @size xlarge - Max width 1280px (default)
 * @size full - Full width
 *
 * @padding none - No padding
 * @padding xs - Extra small padding
 * @padding small - Small padding
 * @padding medium - Medium padding (default)
 * @padding large - Large padding
 * @padding xlarge - Extra large padding
 */
export const Container = React.memo(styled(View, {
  name: 'LGContainer',
  width: '100%',
  maxWidth: 1280,
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',

  variants: {
    size: {
      small: {
        maxWidth: 640,
      },
      medium: {
        maxWidth: 768,
      },
      large: {
        maxWidth: 1024,
      },
      xlarge: {
        maxWidth: 1280,
      },
      full: {
        maxWidth: '100%',
      },
    },
    padding: {
      none: {
        paddingHorizontal: 0,
      },
      small: {
        paddingHorizontal: '$2',
      },
      medium: {
        paddingHorizontal: '$4',
      },
      large: {
        paddingHorizontal: '$6',
      },
    },
  } as const,

  defaultVariants: {
    size: 'xlarge',
    padding: 'medium',
  },
}));

/**
 * Stack component for vertical layouts
 *
 * @component
 * @example
 * ```tsx
 * <Stack space="medium" align="center" justify="center">
 *   <Text>Top</Text>
 *   <Text>Bottom</Text>
 * </Stack>
 * ```
 *
 * @space none - No gap
 * @space xs - Extra small gap
 * @space small - Small gap
 * @space medium - Medium gap (default)
 * @space large - Large gap
 * @space xlarge - Extra large gap
 *
 * @align start - Align items to start
 * @align center - Center items
 * @align end - Align items to end
 * @align stretch - Stretch items (default)
 *
 * @justify start - Align items to start (default)
 * @justify center - Center items
 * @justify end - Align items to end
 * @justify between - Space items evenly
 * @justify around - Space items around
 * @justify evenly - Space items evenly
 */
export const Stack = React.memo(styled(View, {
  name: 'LGStack',
  flexDirection: 'column',

  variants: {
    space: {
      none: { gap: 0 },
      xs: { gap: '$1' },
      small: { gap: '$2' },
      medium: { gap: '$4' },
      large: { gap: '$6' },
      xlarge: { gap: '$8' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    fullHeight: {
      true: { height: '100%' },
    },
  } as const,

  defaultVariants: {
    space: 'medium',
    align: 'stretch',
    justify: 'start',
    fullWidth: false,
    fullHeight: false,
  },
}));

/**
 * Row component for horizontal layouts
 *
 * @component
 * @example
 * ```tsx
 * <Row space="medium" align="center" justify="between">
 *   <Text>Left</Text>
 *   <Text>Right</Text>
 * </Row>
 * ```
 *
 * @space none - No gap
 * @space xs - Extra small gap
 * @space small - Small gap
 * @space medium - Medium gap (default)
 * @space large - Large gap
 * @space xlarge - Extra large gap
 *
 * @align start - Align items to start
 * @align center - Center items (default)
 * @align end - Align items to end
 * @align stretch - Stretch items
 * @align baseline - Align items to baseline
 *
 * @justify start - Align items to start (default)
 * @justify center - Center items
 * @justify end - Align items to end
 * @justify between - Space items evenly
 * @justify around - Space items around
 * @justify evenly - Space items evenly
 */
export const Row = React.memo(styled(View, {
  name: 'LGRow',
  flexDirection: 'row',

  variants: {
    space: {
      none: { gap: 0 },
      xs: { gap: '$1' },
      small: { gap: '$2' },
      medium: { gap: '$4' },
      large: { gap: '$6' },
      xlarge: { gap: '$8' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
    wrap: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
  } as const,

  defaultVariants: {
    space: 'medium',
    align: 'center',
    justify: 'start',
    wrap: false,
    fullWidth: false,
  },
}));

/**
 * Grid component for grid layouts
 *
 * @component
 * @example
 * ```tsx
 * <Grid columns={3} gap="medium">
 *   <Box>Item 1</Box>
 *   <Box>Item 2</Box>
 *   <Box>Item 3</Box>
 * </Grid>
 * ```
 *
 * @columns 1 - Single column
 * @columns 2 - Two columns
 * @columns 3 - Three columns (default)
 * @columns 4 - Four columns
 * @columns 6 - Six columns
 * @columns 12 - Twelve columns
 *
 * @gap none - No gap
 * @gap xs - Extra small gap
 * @gap small - Small gap
 * @gap medium - Medium gap (default)
 * @gap large - Large gap
 * @gap xlarge - Extra large gap
 */
export const Grid = React.memo(styled(View, {
  name: 'LGGrid',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',

  variants: {
    columns: {
      1: {
        '> *': { width: '100%' },
      },
      2: {
        '> *': { width: '50%' },
      },
      3: {
        '> *': { width: '33.333%' },
      },
      4: {
        '> *': { width: '25%' },
      },
      6: {
        '> *': { width: '16.666%' },
      },
      12: {
        '> *': { width: '8.333%' },
      },
    },
    gap: {
      none: { gap: 0 },
      xs: { gap: '$1' },
      small: { gap: '$2' },
      medium: { gap: '$4' },
      large: { gap: '$6' },
      xlarge: { gap: '$8' },
    },
  } as const,

  defaultVariants: {
    columns: 1,
    gap: 'medium',
  },
}));

/**
 * Box component for basic containers
 *
 * @component
 * @example
 * ```tsx
 * <Box padding="medium" margin="small" centered>
 *   <Text>Content</Text>
 * </Box>
 * ```
 *
 * @padding none - No padding (default)
 * @padding xs - Extra small padding
 * @padding small - Small padding
 * @padding medium - Medium padding
 * @padding large - Large padding
 * @padding xlarge - Extra large padding
 *
 * @margin none - No margin (default)
 * @margin xs - Extra small margin
 * @margin small - Small margin
 * @margin medium - Medium margin
 * @margin large - Large margin
 * @margin xlarge - Extra large margin
 */
export const Box = React.memo(styled(View, {
  name: 'LGBox',

  variants: {
    padding: {
      none: { padding: 0 },
      xs: { padding: '$1' },
      small: { padding: '$2' },
      medium: { padding: '$4' },
      large: { padding: '$6' },
      xlarge: { padding: '$8' },
    },
    margin: {
      none: { margin: 0 },
      xs: { margin: '$1' },
      small: { margin: '$2' },
      medium: { margin: '$4' },
      large: { margin: '$6' },
      xlarge: { margin: '$8' },
    },
    centered: {
      true: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    flex: {
      true: { flex: 1 },
      false: { flex: 0 },
    },
  } as const,

  defaultVariants: {
    padding: 'none',
    margin: 'none',
    centered: false,
    flex: false,
  },
}));

/**
 * Section component for page sections
 *
 * @component
 * @example
 * ```tsx
 * <Section background="secondary" padding="large">
 *   <Text>Section content</Text>
 * </Section>
 * ```
 *
 * @background default - Default background (default)
 * @background secondary - Secondary background
 * @background tertiary - Tertiary background
 * @background dark - Dark background
 * @background transparent - Transparent background
 *
 * @padding none - No padding
 * @padding small - Small padding
 * @padding medium - Medium padding (default)
 * @padding large - Large padding
 * @padding xlarge - Extra large padding
 */
export const Section = React.memo(styled(View, {
  name: 'LGSection',
  width: '100%',
  paddingVertical: '$8',

  variants: {
    background: {
      default: { backgroundColor: '$background' },
      secondary: { backgroundColor: '$backgroundSecondary' },
      tertiary: { backgroundColor: '$backgroundTertiary' },
      dark: { backgroundColor: '$backgroundDark' },
      transparent: { backgroundColor: 'transparent' },
    },
    padding: {
      none: { paddingVertical: 0 },
      small: { paddingVertical: '$4' },
      medium: { paddingVertical: '$8' },
      large: { paddingVertical: '$12' },
      xlarge: { paddingVertical: '$16' },
    },
  } as const,

  defaultVariants: {
    background: 'default',
    padding: 'medium',
  },
}));

/**
 * Divider component for visual separators
 *
 * @component
 * @example
 * ```tsx
 * <Divider orientation="horizontal" spacing="medium" color="default" />
 * ```
 *
 * @orientation horizontal - Horizontal divider (default)
 * @orientation vertical - Vertical divider
 *
 * @spacing none - No spacing
 * @spacing small - Small spacing
 * @spacing medium - Medium spacing (default)
 * @spacing large - Large spacing
 *
 * @color default - Default color (default)
 * @color light - Light color
 * @color dark - Dark color
 * @color primary - Primary color
 */
export const Divider = React.memo(styled(View, {
  name: 'LGDivider',
  backgroundColor: '$gray3',

  variants: {
    orientation: {
      horizontal: {
        width: '100%',
        height: 1,
      },
      vertical: {
        width: 1,
        height: '100%',
      },
    },
    spacing: {
      none: { margin: 0 },
      small: {
        marginVertical: '$2',
      },
      medium: {
        marginVertical: '$4',
      },
      large: {
        marginVertical: '$6',
      },
    },
    color: {
      default: { backgroundColor: '$gray3' },
      light: { backgroundColor: '$gray2' },
      dark: { backgroundColor: '$gray5' },
      primary: { backgroundColor: '$primaryBlue' },
    },
  } as const,

  defaultVariants: {
    orientation: 'horizontal',
    spacing: 'medium',
    color: 'default',
  },
}));

/**
 * Spacer component for flexible spacing
 *
 * @component
 * @example
 * ```tsx
 * <Spacer size="medium" horizontal />
 * ```
 *
 * @size xs - Extra small spacer
 * @size small - Small spacer
 * @size medium - Medium spacer
 * @size large - Large spacer
 * @size xlarge - Extra large spacer
 * @size flex - Flexible spacer (default)
 *
 * @horizontal false - Vertical spacer (default)
 * @horizontal true - Horizontal spacer
 */
export const Spacer = React.memo(styled(View, {
  name: 'LGSpacer',
  flex: 1,

  variants: {
    size: {
      xs: { height: '$1', flex: 0 },
      small: { height: '$2', flex: 0 },
      medium: { height: '$4', flex: 0 },
      large: { height: '$6', flex: 0 },
      xlarge: { height: '$8', flex: 0 },
      flex: { flex: 1 },
    },
    horizontal: {
      true: {
        height: 'auto',
        width: '$4',
      },
    },
  } as const,

  defaultVariants: {
    size: 'flex',
    horizontal: false,
  },
}));

/**
 * ScrollContainer component for scrollable content
 *
 * @component
 * @example
 * ```tsx
 * <ScrollContainer padding="medium" showsScrollIndicator>
 *   <Text>Scrollable content</Text>
 * </ScrollContainer>
 * ```
 *
 * @padding none - No padding (default)
 * @padding small - Small padding
 * @padding medium - Medium padding
 * @padding large - Large padding
 *
 * @showsScrollIndicator false - Hide scroll indicators (default)
 * @showsScrollIndicator true - Show scroll indicators
 */
export const ScrollContainer = React.memo(styled(ScrollView, {
  name: 'LGScrollContainer',
  flex: 1,

  variants: {
    padding: {
      none: { padding: 0 },
      small: { padding: '$2' },
      medium: { padding: '$4' },
      large: { padding: '$6' },
    },
    showsScrollIndicator: {
      true: {
        showsVerticalScrollIndicator: true,
        showsHorizontalScrollIndicator: true,
      },
      false: {
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
      },
    },
  } as const,

  defaultVariants: {
    padding: 'none',
    showsScrollIndicator: false,
  },
}));

// Aliases for better Tamagui compatibility
export const YStack = Stack; // Vertical Stack
export const XStack = Row; // Horizontal Stack

/**
 * Props for the Container component
 */
export type ContainerProps = GetProps<typeof Container>;

/**
 * Props for the Stack component
 */
export type StackProps = GetProps<typeof Stack>;

/**
 * Props for the YStack component (alias for Stack)
 */
export type YStackProps = StackProps;

/**
 * Props for the Row component
 */
export type RowProps = GetProps<typeof Row>;

/**
 * Props for the XStack component (alias for Row)
 */
export type XStackProps = RowProps;

/**
 * Props for the Grid component
 */
export type GridProps = GetProps<typeof Grid>;

/**
 * Props for the Box component
 */
export type BoxProps = GetProps<typeof Box>;

/**
 * Props for the Section component
 */
export type SectionProps = GetProps<typeof Section>;

/**
 * Props for the Divider component
 */
export type DividerProps = GetProps<typeof Divider>;

/**
 * Props for the Spacer component
 */
export type SpacerProps = GetProps<typeof Spacer>;

/**
 * Props for the ScrollContainer component
 */
export type ScrollContainerProps = GetProps<typeof ScrollContainer>;
