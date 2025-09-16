
import { createTamagui, createTokens } from '@tamagui/core';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes as defaultThemes } from '@tamagui/themes';
import { createAnimations } from '@tamagui/animations-react-native';

// LegacyGuard Brand Colors
const legacyGuardColors = {
  // Primary Blue - hlavná farba pre dôveryhodnosť
  primaryBlue: '#1e40af',
  primaryBlueLight: '#3b82f6',
  primaryBlueDark: '#1e3a8a',

  // Primary Green - pre úspech a potvrdenie
  primaryGreen: '#16a34a',
  primaryGreenLight: '#22c55e',
  primaryGreenDark: '#15803d',

  // Accent Gold - pre premium funkcie
  accentGold: '#f59e0b',
  accentGoldLight: '#fbbf24',
  accentGoldDark: '#d97706',

  // Neutral Colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Semantic Colors
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',

  // Background Colors
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  backgroundDark: '#111827',
  backgroundDarkSecondary: '#1f2937',
};

// Font configuration
const interFont = createInterFont({
  size: {
    1: 10,
    2: 11,
    3: 12,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 134,
  },
  weight: {
    1: '300',
    2: '400',
    3: '500',
    4: '600',
    5: '700',
    6: '800',
    7: '900',
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    3: -1,
    4: -1.5,
    5: -2,
  },
});

// Create tokens
const tokens = createTokens({
  color: {
    // Map LegacyGuard colors to tokens
    primaryBlue: legacyGuardColors.primaryBlue,
    primaryBlueLight: legacyGuardColors.primaryBlueLight,
    primaryBlueDark: legacyGuardColors.primaryBlueDark,
    primaryGreen: legacyGuardColors.primaryGreen,
    primaryGreenLight: legacyGuardColors.primaryGreenLight,
    primaryGreenDark: legacyGuardColors.primaryGreenDark,
    accentGold: legacyGuardColors.accentGold,
    accentGoldLight: legacyGuardColors.accentGoldLight,
    accentGoldDark: legacyGuardColors.accentGoldDark,

    // Grays
    gray1: legacyGuardColors.gray50,
    gray2: legacyGuardColors.gray100,
    gray3: legacyGuardColors.gray200,
    gray4: legacyGuardColors.gray300,
    gray5: legacyGuardColors.gray400,
    gray6: legacyGuardColors.gray500,
    gray7: legacyGuardColors.gray600,
    gray8: legacyGuardColors.gray700,
    gray9: legacyGuardColors.gray800,
    gray10: legacyGuardColors.gray900,

    // Semantic
    success: legacyGuardColors.success,
    warning: legacyGuardColors.warning,
    error: legacyGuardColors.error,
    info: legacyGuardColors.info,

    // Backgrounds
    background: legacyGuardColors.backgroundPrimary,
    backgroundSecondary: legacyGuardColors.backgroundSecondary,
    backgroundTertiary: legacyGuardColors.backgroundTertiary,
    backgroundDark: legacyGuardColors.backgroundDark,
    backgroundDarkSecondary: legacyGuardColors.backgroundDarkSecondary,
  },

  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    13: 52,
    14: 56,
    15: 60,
    16: 64,
    true: 16,
  },

  size: {
    0: 0,
    0.25: 2,
    0.5: 4,
    0.75: 8,
    1: 20,
    2: 28,
    3: 36,
    4: 44,
    5: 52,
    6: 60,
    7: 68,
    8: 76,
    9: 84,
    10: 92,
    11: 100,
    12: 108,
    13: 116,
    14: 124,
    15: 132,
    16: 140,
    true: 44,
  },

  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    true: 8,
  },

  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    // Semantic z-index values
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
});

// Create animations
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    stiffness: 120,
  },
  slow: {
    type: 'spring',
    damping: 15,
    stiffness: 40,
  },
});

// Custom LegacyGuard themes
const legacyGuardThemes = {
  light: {
    background: tokens.color.background,
    backgroundHover: tokens.color.gray1,
    backgroundPress: tokens.color.gray2,
    backgroundFocus: tokens.color.gray2,
    backgroundStrong: tokens.color.gray3,
    backgroundTransparent: 'rgba(255,255,255,0)',
    color: tokens.color.gray10,
    colorHover: tokens.color.gray9,
    colorPress: tokens.color.gray9,
    colorFocus: tokens.color.gray9,
    colorTransparent: 'rgba(0,0,0,0)',
    borderColor: tokens.color.gray3,
    borderColorHover: tokens.color.gray4,
    borderColorPress: tokens.color.gray5,
    borderColorFocus: tokens.color.primaryBlue,
    placeholderColor: tokens.color.gray5,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowColorHover: 'rgba(0,0,0,0.15)',
    shadowColorPress: 'rgba(0,0,0,0.2)',
    shadowColorFocus: 'rgba(0,0,0,0.15)',
  },

  dark: {
    background: tokens.color.backgroundDark,
    backgroundHover: tokens.color.backgroundDarkSecondary,
    backgroundPress: tokens.color.gray9,
    backgroundFocus: tokens.color.gray9,
    backgroundStrong: tokens.color.gray8,
    backgroundTransparent: 'rgba(0,0,0,0)',
    color: tokens.color.gray1,
    colorHover: tokens.color.gray2,
    colorPress: tokens.color.gray2,
    colorFocus: tokens.color.gray2,
    colorTransparent: 'rgba(255,255,255,0)',
    borderColor: tokens.color.gray8,
    borderColorHover: tokens.color.gray7,
    borderColorPress: tokens.color.gray6,
    borderColorFocus: tokens.color.primaryBlueLight,
    placeholderColor: tokens.color.gray6,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowColorHover: 'rgba(0,0,0,0.4)',
    shadowColorPress: 'rgba(0,0,0,0.5)',
    shadowColorFocus: 'rgba(0,0,0,0.4)',
  },

  // Brand specific themes
  primary: {
    background: tokens.color.primaryBlue,
    backgroundHover: tokens.color.primaryBlueDark,
    backgroundPress: tokens.color.primaryBlueDark,
    backgroundFocus: tokens.color.primaryBlueDark,
    backgroundStrong: tokens.color.primaryBlueDark,
    backgroundTransparent: 'rgba(30, 64, 175, 0)',
    color: '#ffffff',
    colorHover: '#ffffff',
    colorPress: '#ffffff',
    colorFocus: '#ffffff',
    colorTransparent: 'rgba(255, 255, 255, 0)',
    borderColor: tokens.color.primaryBlue,
    borderColorHover: tokens.color.primaryBlueDark,
    borderColorPress: tokens.color.primaryBlueDark,
    borderColorFocus: tokens.color.primaryBlue,
    placeholderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(30, 64, 175, 0.2)',
  },

  success: {
    background: tokens.color.primaryGreen,
    backgroundHover: tokens.color.primaryGreenDark,
    backgroundPress: tokens.color.primaryGreenDark,
    backgroundFocus: tokens.color.primaryGreenDark,
    backgroundStrong: tokens.color.primaryGreenDark,
    backgroundTransparent: 'rgba(22, 163, 74, 0)',
    color: '#ffffff',
    colorHover: '#ffffff',
    colorPress: '#ffffff',
    colorFocus: '#ffffff',
    colorTransparent: 'rgba(255, 255, 255, 0)',
    borderColor: tokens.color.primaryGreen,
    borderColorHover: tokens.color.primaryGreenDark,
    borderColorPress: tokens.color.primaryGreenDark,
    borderColorFocus: tokens.color.primaryGreen,
    placeholderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(22, 163, 74, 0.2)',
  },

  premium: {
    background: tokens.color.accentGold,
    backgroundHover: tokens.color.accentGoldDark,
    backgroundPress: tokens.color.accentGoldDark,
    backgroundFocus: tokens.color.accentGoldDark,
    backgroundStrong: tokens.color.accentGoldDark,
    backgroundTransparent: 'rgba(245, 158, 11, 0)',
    color: '#ffffff',
    colorHover: '#ffffff',
    colorPress: '#ffffff',
    colorFocus: '#ffffff',
    colorTransparent: 'rgba(255, 255, 255, 0)',
    borderColor: tokens.color.accentGold,
    borderColorHover: tokens.color.accentGoldDark,
    borderColorPress: tokens.color.accentGoldDark,
    borderColorFocus: tokens.color.accentGold,
    placeholderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(245, 158, 11, 0.2)',
  },
};

// Create media queries
const media = {
  xs: { maxWidth: 660 },
  sm: { maxWidth: 860 },
  md: { maxWidth: 980 },
  lg: { maxWidth: 1120 },
  xl: { maxWidth: 1280 },
  xxl: { maxWidth: 1420 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 860 + 1 },
  gtMd: { minWidth: 980 + 1 },
  gtLg: { minWidth: 1120 + 1 },
  gtXl: { minWidth: 1280 + 1 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
};

// Create and export the config
export const config = createTamagui({
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes: {
    ...legacyGuardThemes,
    ...defaultThemes,
  },
  tokens,
  media,
});

// Also export as tamaguiConfig for compatibility
export const tamaguiConfig = config;

// Export types
export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { _brand?: never }
}

export default config;

// Type augmentation for Tamagui
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig { _brand?: never }
}

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig { _brand?: never }
}
