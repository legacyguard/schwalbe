/**
 * Emotional Typography System - Mobile Implementation
 * Based on mobile-sync-proposal.md
 *
 * Implements emotional hierarchy with large, bold headlines
 * and comfortable reading experience
 */

import { emotionalColors } from './colors';

export const emotionalTypography = {
  // Hero-level emotional headlines
  hero: {
    fontSize: 32,                    // Large for mobile impact
    fontWeight: '800' as const,      // Extra bold for emotional weight
    color: emotionalColors.textPrimary,
    letterSpacing: -0.5,             // Tight for emphasis
    lineHeight: 36,                  // Comfortable line height
  },

  // Emotional subheadings with firefly accent
  emotional: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: emotionalColors.accentYellow,  // Yellow for warmth
    lineHeight: 28,
    letterSpacing: -0.2,
  },

  // Large headlines for sections
  headline: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: emotionalColors.textPrimary,
    lineHeight: 24,
  },

  // Body text optimized for comfort
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: emotionalColors.textSecondary,
    lineHeight: 24,                   // 1.5 ratio for comfortable reading
  },

  // Secondary body text
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: emotionalColors.textMuted,
    lineHeight: 20,
  },

  // Small text for details
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: emotionalColors.textMuted,
    lineHeight: 16,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: emotionalColors.textPrimary,
    letterSpacing: 0.1,
  },

  // Sofia messages - special styling
  sofiaMessage: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: emotionalColors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
} as const;

// Tamagui font size tokens
export const tamaguiFontSizes = {
  $heroEmotional: emotionalTypography.hero.fontSize,
  $emotionalSubheading: emotionalTypography.emotional.fontSize,
  $headlineEmotional: emotionalTypography.headline.fontSize,
  $bodyEmotional: emotionalTypography.body.fontSize,
  $bodySecondaryEmotional: emotionalTypography.bodySecondary.fontSize,
  $captionEmotional: emotionalTypography.caption.fontSize,
  $sofiaMessage: emotionalTypography.sofiaMessage.fontSize,
} as const;

// Tamagui font weight tokens
export const tamaguiFontWeights = {
  $heroWeight: emotionalTypography.hero.fontWeight,
  $emotionalWeight: emotionalTypography.emotional.fontWeight,
  $headlineWeight: emotionalTypography.headline.fontWeight,
  $bodyWeight: emotionalTypography.body.fontWeight,
  $buttonWeight: emotionalTypography.button.fontWeight,
} as const;

// Line height tokens
export const tamaguiLineHeights = {
  $heroLineHeight: emotionalTypography.hero.lineHeight,
  $emotionalLineHeight: emotionalTypography.emotional.lineHeight,
  $bodyLineHeight: emotionalTypography.body.lineHeight,
  $comfortLineHeight: 1.6, // Extra comfortable for longer text
} as const;

// Helper function to get typography style
export const getTypographyStyle = (variant: keyof typeof emotionalTypography) => {
  return emotionalTypography[variant];
};

export type TypographyVariant = keyof typeof emotionalTypography;