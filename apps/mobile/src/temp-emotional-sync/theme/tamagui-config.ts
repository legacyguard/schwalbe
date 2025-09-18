/**
 * Extended Tamagui Configuration for Emotional Sync
 * Extends base config with emotional color palette and typography
 */

import { config as configBase } from '@tamagui/config/v3';
import { createTamagui } from '@tamagui/core';
import { tamaguiEmotionalTokens } from './colors';
import { tamaguiFontSizes, tamaguiFontWeights, tamaguiLineHeights } from './typography';

export const emotionalConfig = createTamagui({
  ...configBase,

  // Extend existing tokens with emotional tokens
  tokens: {
    ...configBase.tokens,
    color: {
      ...configBase.tokens.color,
      ...tamaguiEmotionalTokens,
    },
    size: {
      ...configBase.tokens.size,
      ...tamaguiFontSizes,
    },
    space: {
      ...configBase.tokens.space,
      ...tamaguiFontSizes, // Can also be used for spacing
    },
  },

  // Add emotional font weights
  fonts: {
    ...configBase.fonts,
    emotional: {
      ...configBase.fonts.body,
      weight: {
        ...configBase.fonts.body?.weight,
        ...tamaguiFontWeights,
      },
      size: tamaguiFontSizes,
      lineHeight: tamaguiLineHeights,
    },
  },

  // Custom themes for emotional states
  themes: {
    ...configBase.themes,

    // Emotional dark theme (primary)
    emotionalDark: {
      ...configBase.themes.dark,
      background: tamaguiEmotionalTokens.backgroundEmotionalPrimary,
      backgroundHover: tamaguiEmotionalTokens.backgroundEmotionalSecondary,
      backgroundPress: tamaguiEmotionalTokens.backgroundEmotionalTertiary,
      color: tamaguiEmotionalTokens.textEmotionalPrimary,
      colorHover: tamaguiEmotionalTokens.textEmotionalSecondary,
      placeholderColor: tamaguiEmotionalTokens.textEmotionalMuted,
    },

    // Sofia firefly theme for special elements
    fireflyTheme: {
      ...configBase.themes.dark,
      background: tamaguiEmotionalTokens.accentFirefly,
      backgroundHover: tamaguiEmotionalTokens.accentFireflyLight,
      backgroundPress: tamaguiEmotionalTokens.accentFireflyDark,
      color: tamaguiEmotionalTokens.backgroundEmotionalPrimary,
    },

    // Achievement celebration theme
    achievementTheme: {
      ...configBase.themes.dark,
      background: '$green10',
      backgroundHover: '$green9',
      backgroundPress: '$green11',
      color: 'white',
    },
  },
});

export type EmotionalConfig = typeof emotionalConfig;