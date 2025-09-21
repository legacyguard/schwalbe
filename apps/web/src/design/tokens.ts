/**
 * LegacyGuard Design System Tokens
 *
 * Unified design system following Apple 2025 liquid design principles
 * Provides consistent visual language across all components
 */

import { PersonalityMode, ContextType } from '@/components/sofia-firefly/SofiaFireflyPersonality';

// Animation Timing Standards
export const ANIMATION_TIMING = {
  instant: 0.15,      // Quick feedback
  fast: 0.25,         // Micro-interactions
  normal: 0.4,        // Standard transitions
  slow: 0.6,          // Gentle reveals
  verySlow: 0.8,      // Dramatic effects
  processing: 3.0,    // AI processing states
} as const;

// Easing Functions - Apple-inspired liquid motion
export const EASING = {
  liquid: [0.25, 0.46, 0.45, 0.94],  // Apple-inspired
  bounce: [0.68, -0.55, 0.265, 1.55], // Playful
  smooth: [0.4, 0, 0.2, 1],          // Professional
  sharp: [0.4, 0, 0.6, 1],           // Urgent
} as const;

// Unified Material System
export const MATERIALS = {
  gold: {
    color: "#FFD700",
    metalness: 0.8,
    roughness: 0.2,
    emissive: "#FFD700",
    emissiveIntensity: 0.1
  },
  wood: {
    color: "#8B4513",
    metalness: 0.1,
    roughness: 0.8,
    normalScale: 0.5
  },
  trust: {
    color: "#22C55E", // Green-500
    metalness: 0.9,
    roughness: 0.1,
    emissive: "#22C55E",
    emissiveIntensity: 0.2
  },
  certainty: {
    color: "#F59E0B", // Amber-500
    metalness: 0.7,
    roughness: 0.3,
    emissive: "#F59E0B",
    emissiveIntensity: 0.15
  }
} as const;

// Contextual Color Themes
export const CONTEXT_COLORS = {
  trust: {
    primary: "#22C55E",
    secondary: "#16A34A",
    accent: "#15803D",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  certainty: {
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#B45309",
    glow: "rgba(245, 158, 11, 0.3)"
  },
  processing: {
    primary: "#3B82F6",
    secondary: "#2563EB",
    accent: "#1D4ED8",
    glow: "rgba(59, 130, 246, 0.3)"
  },
  neutral: {
    primary: "#6B7280",
    secondary: "#4B5563",
    accent: "#374151",
    glow: "rgba(107, 114, 128, 0.2)"
  },
  idle: {
    primary: "#6B7280",
    secondary: "#4B5563",
    accent: "#374151",
    glow: "rgba(107, 114, 128, 0.2)"
  },
  guiding: {
    primary: "#3B82F6",
    secondary: "#2563EB",
    accent: "#1D4ED8",
    glow: "rgba(59, 130, 246, 0.3)"
  },
  celebrating: {
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#B45309",
    glow: "rgba(245, 158, 11, 0.3)"
  },
  helping: {
    primary: "#22C55E",
    secondary: "#16A34A",
    accent: "#15803D",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  waiting: {
    primary: "#6B7280",
    secondary: "#4B5563",
    accent: "#374151",
    glow: "rgba(107, 114, 128, 0.2)"
  },
  learning: {
    primary: "#3B82F6",
    secondary: "#2563EB",
    accent: "#1D4ED8",
    glow: "rgba(59, 130, 246, 0.3)"
  },
  supporting: {
    primary: "#22C55E",
    secondary: "#16A34A",
    accent: "#15803D",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  encouraging: {
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#B45309",
    glow: "rgba(245, 158, 11, 0.3)"
  },
  analyzing: {
    primary: "#3B82F6",
    secondary: "#2563EB",
    accent: "#1D4ED8",
    glow: "rgba(59, 130, 246, 0.3)"
  },
  synthesizing: {
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#6D28D9",
    glow: "rgba(139, 92, 246, 0.3)"
  }
} as const;

// Typography Hierarchy
export const TYPOGRAPHY = {
  hero: {
    size: "text-4xl md:text-5xl",
    weight: "font-bold",
    lineHeight: "leading-tight",
    letterSpacing: "tracking-tight"
  },
  title: {
    size: "text-2xl md:text-3xl",
    weight: "font-semibold",
    lineHeight: "leading-snug",
    letterSpacing: "tracking-normal"
  },
  body: {
    size: "text-base md:text-lg",
    weight: "font-normal",
    lineHeight: "leading-relaxed",
    letterSpacing: "tracking-normal"
  },
  caption: {
    size: "text-sm",
    weight: "font-medium",
    lineHeight: "leading-normal",
    letterSpacing: "tracking-wide"
  }
} as const;

// Spacing System
export const SPACING = {
  xs: "space-y-2",
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
  xl: "space-y-8",
  xxl: "space-y-12"
} as const;

// Layout Standards
export const LAYOUT = {
  container: {
    maxWidth: "max-w-4xl",
    padding: "p-6 md:p-8",
    margin: "mx-auto"
  },
  card: {
    padding: "p-6 md:p-8",
    borderRadius: "rounded-xl",
    shadow: "shadow-xl",
    background: "bg-background/95 backdrop-blur-sm"
  },
  section: {
    spacing: "mb-8 md:mb-12",
    padding: "py-8 md:py-12"
  }
} as const;

// Animation Variants - Standardized across all components
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  slideIn: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  liquid: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -5 }
  }
} as const;

// Personality-Aware Animation Multipliers
export const PERSONALITY_MULTIPLIERS = {
  empathetic: {
    duration: 1.2,
    intensity: 0.8,
    easing: EASING.smooth
  },
  pragmatic: {
    duration: 0.9,
    intensity: 1.0,
    easing: EASING.sharp
  },
  celebratory: {
    duration: 1.1,
    intensity: 1.3,
    easing: EASING.bounce
  },
  comforting: {
    duration: 1.4,
    intensity: 0.7,
    easing: EASING.liquid
  },
  nurturing: {
    duration: 1.3,
    intensity: 0.9,
    easing: EASING.smooth
  },
  confident: {
    duration: 1.0,
    intensity: 1.1,
    easing: EASING.sharp
  }
} as const;

// Context-Aware Animation Settings
export const CONTEXT_ANIMATIONS = {
  idle: {
    duration: ANIMATION_TIMING.slow,
    easing: EASING.liquid,
    intensity: 0.5
  },
  guiding: {
    duration: ANIMATION_TIMING.normal,
    easing: EASING.smooth,
    intensity: 0.8
  },
  celebrating: {
    duration: ANIMATION_TIMING.fast,
    easing: EASING.bounce,
    intensity: 1.2
  },
  helping: {
    duration: ANIMATION_TIMING.normal,
    easing: EASING.liquid,
    intensity: 0.9
  },
  waiting: {
    duration: ANIMATION_TIMING.verySlow,
    easing: EASING.smooth,
    intensity: 0.3
  },
  learning: {
    duration: ANIMATION_TIMING.slow,
    easing: EASING.liquid,
    intensity: 0.7
  },
  supporting: {
    duration: ANIMATION_TIMING.normal,
    easing: EASING.smooth,
    intensity: 0.8
  },
  encouraging: {
    duration: ANIMATION_TIMING.fast,
    easing: EASING.bounce,
    intensity: 1.0
  },
  trust: {
    duration: ANIMATION_TIMING.slow,
    easing: EASING.liquid,
    intensity: 0.9
  },
  processing: {
    duration: ANIMATION_TIMING.processing,
    easing: EASING.smooth,
    intensity: 0.6
  },
  analyzing: {
    duration: ANIMATION_TIMING.normal,
    easing: EASING.smooth,
    intensity: 0.7
  },
  synthesizing: {
    duration: ANIMATION_TIMING.slow,
    easing: EASING.liquid,
    intensity: 0.8
  }
} as const;

// Performance Standards
export const PERFORMANCE_STANDARDS = {
  onboarding: { target: 60, minimum: 30 },
  interactions: { target: 60, minimum: 45 },
  processing: { target: 30, minimum: 24 },
  idle: { target: 60, minimum: 50 }
} as const;

// Accessibility Standards
export const ACCESSIBILITY = {
  reducedMotion: {
    disableComplexAnimations: true,
    maintainCoreFunctionality: true,
    provideAlternativeFeedback: true,
    preserveEmotionalIntent: true
  },
  focus: {
    ringWidth: "ring-2",
    ringColor: "ring-yellow-400",
    ringOpacity: "ring-opacity-50"
  },
  contrast: {
    minimumRatio: 4.5,
    enhancedRatio: 7.0
  }
} as const;

// AI Consistency Standards
export const AI_CONSISTENCY = {
  responseTime: { min: 0.1, max: 0.5 },
  contextAwareness: 0.95,
  emotionalAlignment: 0.9,
  userPreferenceRetention: 0.95
} as const;

// Component-Specific Standards
export const COMPONENT_STANDARDS = {
  box3d: {
    rotationSpeed: 0.5,
    floatingAmplitude: 0.1,
    particleCount: 20,
    material: MATERIALS.wood
  },
  key3d: {
    swayingSpeed: 0.3,
    engravingDuration: 1.0,
    sparkleCount: 12,
    material: MATERIALS.gold
  },
  aiProcessing: {
    stageDuration: ANIMATION_TIMING.processing / 5,
    particleSpeed: 10,
    glowIntensity: 0.3,
    insightDelay: 0.2
  },
  sofiaFirefly: {
    glowIntensity: 0.3,
    floatingSpeed: 0.5,
    interactionScale: 1.1,
    messageDuration: 2.5
  }
} as const;

// Export utility functions
export const getAnimationConfig = (personality: PersonalityMode, context: ContextType) => {
  const personalityMultiplier = PERSONALITY_MULTIPLIERS[personality];
  const contextAnimation = CONTEXT_ANIMATIONS[context];

  return {
    duration: contextAnimation.duration * personalityMultiplier.duration,
    easing: personalityMultiplier.easing,
    intensity: contextAnimation.intensity * personalityMultiplier.intensity
  };
};

export const getContextualColors = (context: ContextType) => {
  return CONTEXT_COLORS[context] || CONTEXT_COLORS.neutral;
};

export const getTypographyClass = (level: keyof typeof TYPOGRAPHY) => {
  const config = TYPOGRAPHY[level];
  return `${config.size} ${config.weight} ${config.lineHeight} ${config.letterSpacing}`;
};

export const getSpacingClass = (level: keyof typeof SPACING) => {
  return SPACING[level];
};

export const getLayoutClass = (component: keyof typeof LAYOUT) => {
  const config = LAYOUT[component];
  if ('maxWidth' in config && 'margin' in config) {
    return `${config.maxWidth} ${config.padding} ${config.margin}`;
  }
  return config.padding;
};

// Type exports
export type AnimationTiming = typeof ANIMATION_TIMING;
export type EasingType = typeof EASING;
export type MaterialType = typeof MATERIALS;
export type ContextColorType = typeof CONTEXT_COLORS;
export type TypographyType = typeof TYPOGRAPHY;
export type SpacingType = typeof SPACING;
export type LayoutType = typeof LAYOUT;
export type AnimationVariantsType = typeof ANIMATION_VARIANTS;
export type ComponentStandardsType = typeof COMPONENT_STANDARDS;