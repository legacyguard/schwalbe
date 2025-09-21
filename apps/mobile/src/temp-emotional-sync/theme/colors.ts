/**
 * Emotional Color Palette - Mobile Sync Implementation
 * Based on mobile-sync-proposal.md
 *
 * Implements "starry night" theme with firefly-yellow accents
 * for emotional engagement and psychological comfort
 */

export const emotionalColors = {
  // Primary - Night sky theme
  backgroundPrimary: '#0f172a',    // Deep slate (from-slate-900)
  backgroundSecondary: '#1e293b',  // Starry night (via-slate-800)
  backgroundTertiary: '#334155',   // Lighter slate (to-slate-700)

  // Accent - Hope & guidance (Sofia firefly theme)
  accentYellow: '#fbbf24',         // Sofia firefly yellow
  accentYellowLight: '#fef3c7',    // Firefly glow
  accentYellowDark: '#d97706',     // Deep warmth

  // Status - Emotional feedback
  success: '#16a34a',              // Keep existing green
  warning: '#f59e0b',              // Align with yellow theme
  error: '#dc2626',                // Keep red for urgency

  // Text - Hierarchy & emotion
  textPrimary: '#ffffff',          // Pure white for clarity
  textSecondary: '#cbd5e1',        // Soft white for comfort
  textMuted: '#64748b',            // Gentle gray for calm

  // Interactive states
  hover: '#1e40af',                // Blue for interactions
  pressed: '#1e3a8a',              // Darker blue for pressed
  disabled: '#6b7280',             // Gray for disabled states

  // Gradients for backgrounds
  gradients: {
    starryNight: ['#0f172a', '#1e293b', '#334155'],
    fireflyGlow: ['#fbbf24', '#fef3c7', '#f59e0b'],
    comfort: ['#1e293b', '#334155', '#475569'],
    achievement: ['#16a34a', '#22c55e', '#4ade80'],
  },
} as const;

// Legacy color mapping for backward compatibility
export const legacyColorMapping = {
  '$gray8': emotionalColors.backgroundSecondary,
  '$gray10': emotionalColors.textMuted,
  'white': emotionalColors.textPrimary,
  '$blue10': emotionalColors.hover,
  '$green10': emotionalColors.success,
  '$purple10': '#a855f7',
  '$orange10': emotionalColors.warning,
} as const;

// Tamagui color tokens
export const tamaguiEmotionalTokens = {
  // Background tokens
  backgroundEmotionalPrimary: emotionalColors.backgroundPrimary,
  backgroundEmotionalSecondary: emotionalColors.backgroundSecondary,
  backgroundEmotionalTertiary: emotionalColors.backgroundTertiary,

  // Accent tokens
  accentFirefly: emotionalColors.accentYellow,
  accentFireflyLight: emotionalColors.accentYellowLight,
  accentFireflyDark: emotionalColors.accentYellowDark,

  // Text tokens
  textEmotionalPrimary: emotionalColors.textPrimary,
  textEmotionalSecondary: emotionalColors.textSecondary,
  textEmotionalMuted: emotionalColors.textMuted,
} as const;

export type EmotionalColorKey = keyof typeof emotionalColors;
export type TamaguiEmotionalToken = keyof typeof tamaguiEmotionalTokens;