
import React from 'react';
import { type GetProps, styled, Text } from 'tamagui';

// Heading components
export const H1 = React.memo(styled(Text, {
  name: 'LGH1',
  tag: 'h1',
  fontFamily: '$heading',
  fontSize: '$13', // 72px
  fontWeight: '$6',
  lineHeight: 1.2,
  color: '$color',
  letterSpacing: '$4',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
}));

export const H2 = styled(Text, {
  name: 'LGH2',
  tag: 'h2',
  fontFamily: '$heading',
  fontSize: '$11', // 52px
  fontWeight: '$5',
  lineHeight: 1.25,
  color: '$color',
  letterSpacing: '$3',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

export const H3 = styled(Text, {
  name: 'LGH3',
  tag: 'h3',
  fontFamily: '$heading',
  fontSize: '$9', // 30px
  fontWeight: '$5',
  lineHeight: 1.3,
  color: '$color',
  letterSpacing: '$2',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

export const H4 = styled(Text, {
  name: 'LGH4',
  tag: 'h4',
  fontFamily: '$heading',
  fontSize: '$7', // 20px
  fontWeight: '$4',
  lineHeight: 1.4,
  color: '$color',
  letterSpacing: '$2',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

export const H5 = styled(Text, {
  name: 'LGH5',
  tag: 'h5',
  fontFamily: '$heading',
  fontSize: '$6', // 18px
  fontWeight: '$4',
  lineHeight: 1.5,
  color: '$color',
  letterSpacing: '$1',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

export const H6 = styled(Text, {
  name: 'LGH6',
  tag: 'h6',
  fontFamily: '$heading',
  fontSize: '$5', // 16px
  fontWeight: '$4',
  lineHeight: 1.5,
  color: '$color',
  letterSpacing: '$1',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

// Paragraph
export const Paragraph = React.memo(styled(Text, {
  name: 'LGParagraph',
  tag: 'p',
  fontFamily: '$body',
  fontSize: '$4', // 14px
  fontWeight: '$2',
  lineHeight: 1.6,
  color: '$color',

  variants: {
    size: {
      sm: {
        fontSize: '$3', // 12px
        lineHeight: 1.5,
      },
      md: {
        fontSize: '$4', // 14px
        lineHeight: 1.6,
      },
      lg: {
        fontSize: '$5', // 16px
        lineHeight: 1.7,
      },
    },
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
    weight: {
      normal: { fontWeight: '$2' },
      medium: { fontWeight: '$3' },
      semibold: { fontWeight: '$4' },
      bold: { fontWeight: '$5' },
    },
  },

  defaultVariants: {
    size: undefined,
    weight: undefined,
  },
}));

// Span (inline text)
export const Span = styled(Text, {
  name: 'LGSpan',
  tag: 'span',
  fontFamily: '$body',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
    weight: {
      normal: { fontWeight: '$2' },
      medium: { fontWeight: '$3' },
      semibold: { fontWeight: '$4' },
      bold: { fontWeight: '$5' },
    },
    decoration: {
      none: { textDecorationLine: 'none' },
      underline: { textDecorationLine: 'underline' },
      lineThrough: { textDecorationLine: 'line-through' },
    },
  },
});

// Label
export const Label = styled(Text, {
  name: 'LGLabel',
  tag: 'label',
  fontFamily: '$body',
  fontSize: '$3', // 12px
  fontWeight: '$4',
  lineHeight: 1.3,
  color: '$gray7',
  textTransform: 'uppercase',
  letterSpacing: 0.5,

  variants: {
    size: {
      small: {
        fontSize: '$2', // 11px
        letterSpacing: 0.3,
      },
      medium: {
        fontSize: '$3', // 12px
        letterSpacing: 0.5,
      },
      large: {
        fontSize: '$4', // 14px
        letterSpacing: 0.6,
      },
    },
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },

  defaultVariants: {
    size: undefined,
  },
});

// Caption (small text)
export const Caption = styled(Text, {
  name: 'LGCaption',
  fontFamily: '$body',
  fontSize: '$2', // 11px
  fontWeight: '$2',
  lineHeight: 1.4,
  color: '$gray6',

  variants: {
    color: {
      primary: { color: '$primaryBlue' },
      secondary: { color: '$gray7' },
      success: { color: '$primaryGreen' },
      premium: { color: '$accentGold' },
      danger: { color: '$error' },
      muted: { color: '$gray5' },
    },
  },
});

// Export types
export type H1Props = GetProps<typeof H1>;
export type H2Props = GetProps<typeof H2>;
export type H3Props = GetProps<typeof H3>;
export type H4Props = GetProps<typeof H4>;
export type H5Props = GetProps<typeof H5>;
export type H6Props = GetProps<typeof H6>;
export type ParagraphProps = GetProps<typeof Paragraph>;
export type SpanProps = GetProps<typeof Span>;
export type LabelProps = GetProps<typeof Label>;
export type CaptionProps = GetProps<typeof Caption>;
