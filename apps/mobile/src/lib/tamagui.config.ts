import { config as configBase } from '@tamagui/config/v3';
import { createTamagui } from '@tamagui/core';

// LegacyGuard Emotional Color Palette - Starry Night Theme
const legacyGuardColors = {
  // Primary - Night sky theme (matching web-next)
  backgroundPrimary: '#0f172a',    // Deep slate (from-slate-900)
  backgroundSecondary: '#1e293b',  // Starry night (via-slate-800)
  backgroundTertiary: '#334155',   // Lighter slate (to-slate-700)

  // Accent - Hope & guidance (Sofia firefly theme)
  accentGold: '#fbbf24',           // Sofia firefly gold
  accentGoldLight: '#fef3c7',      // Firefly glow
  accentGoldDark: '#d97706',       // Deep warmth

  // Status - Emotional feedback
  success: '#16a34a',              // Keep existing green
  warning: '#f59e0b',              // Align with gold theme
  error: '#dc2626',                // Keep red for urgency

  // Text - Hierarchy & emotion
  textPrimary: '#ffffff',          // Pure white for clarity
  textSecondary: '#cbd5e1',        // Soft white for comfort
  textMuted: '#64748b',            // Gentle gray for calm
};

// Enhanced Tamagui configuration with LegacyGuard theme
export const config = createTamagui({
  ...configBase,

  // Extend tokens with emotional colors
  tokens: {
    ...configBase.tokens,
    color: {
      ...configBase.tokens.color,
      // LegacyGuard emotional colors
      legacyBackgroundPrimary: legacyGuardColors.backgroundPrimary,
      legacyBackgroundSecondary: legacyGuardColors.backgroundSecondary,
      legacyBackgroundTertiary: legacyGuardColors.backgroundTertiary,
      legacyAccentGold: legacyGuardColors.accentGold,
      legacyAccentGoldLight: legacyGuardColors.accentGoldLight,
      legacyAccentGoldDark: legacyGuardColors.accentGoldDark,
      legacyTextPrimary: legacyGuardColors.textPrimary,
      legacyTextSecondary: legacyGuardColors.textSecondary,
      legacyTextMuted: legacyGuardColors.textMuted,
      legacySuccess: legacyGuardColors.success,
      legacyWarning: legacyGuardColors.warning,
      legacyError: legacyGuardColors.error,
    },
    // Enhanced typography scales
    size: {
      ...configBase.tokens.size,
      heroEmotional: 32,      // Hero headlines for emotional impact
      emotionalLarge: 24,     // Emotional subheadings
      emotionalMedium: 20,    // Section headlines
      bodyComfort: 16,        // Comfortable body text
      captionSoft: 14,        // Soft captions
    },
  },

  // Enhanced themes with emotional variants
  themes: {
    ...configBase.themes,

    // LegacyGuard Dark Theme (primary)
    legacyDark: {
      ...configBase.themes.dark,
      background: legacyGuardColors.backgroundPrimary,
      backgroundHover: legacyGuardColors.backgroundSecondary,
      backgroundPress: legacyGuardColors.backgroundTertiary,
      color: legacyGuardColors.textPrimary,
      colorHover: legacyGuardColors.textSecondary,
      placeholderColor: legacyGuardColors.textMuted,
    },

    // Sofia Firefly Theme for special elements
    legacyGold: {
      ...configBase.themes.dark,
      background: legacyGuardColors.accentGold,
      backgroundHover: legacyGuardColors.accentGoldLight,
      backgroundPress: legacyGuardColors.accentGoldDark,
      color: legacyGuardColors.backgroundPrimary,
    },

    // Achievement celebration theme
    legacySuccess: {
      ...configBase.themes.dark,
      background: legacyGuardColors.success,
      backgroundHover: '#22c55e',
      backgroundPress: '#15803d',
      color: 'white',
    },
  },
});