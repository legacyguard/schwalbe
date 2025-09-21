import { useMemo } from 'react';

export type PersonalityMode = 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
export type ContextType = 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging' | 'trust' | 'processing' | 'analyzing' | 'synthesizing' | 'validating' | 'monitoring' | 'inviting' | 'consulting' | 'emergency' | 'onboarding';

export interface AnimationConfig {
  float: {
    duration: number;
    easing: string;
  };
  pulse: {
    duration: number;
    easing: string;
  };
  wing: {
    duration: number;
    easing: string;
  };
  touch: {
    duration: number;
    easing: string;
  };
  opacityRange: [number, number];
}

export interface ContextMultiplier {
  float: number;
  pulse: number;
  wing: number;
  touch: number;
}

// Personality-based animation configurations
const personalityConfigs: Record<PersonalityMode, AnimationConfig> = {
  empathetic: {
    float: { duration: 4.0, easing: 'easeInOut' },
    pulse: { duration: 2.5, easing: 'easeInOut' },
    wing: { duration: 0.2, easing: 'easeInOut' },
    touch: { duration: 0.3, easing: 'easeOut' },
    opacityRange: [0.6, 0.9],
  },
  pragmatic: {
    float: { duration: 3.0, easing: 'linear' },
    pulse: { duration: 1.8, easing: 'easeInOut' },
    wing: { duration: 0.15, easing: 'easeInOut' },
    touch: { duration: 0.2, easing: 'easeOut' },
    opacityRange: [0.7, 1.0],
  },
  celebratory: {
    float: { duration: 2.0, easing: 'easeInOut' },
    pulse: { duration: 1.2, easing: 'easeInOut' },
    wing: { duration: 0.1, easing: 'easeInOut' },
    touch: { duration: 0.25, easing: 'easeOut' },
    opacityRange: [0.8, 1.0],
  },
  comforting: {
    float: { duration: 5.0, easing: 'easeInOut' },
    pulse: { duration: 3.0, easing: 'easeInOut' },
    wing: { duration: 0.25, easing: 'easeInOut' },
    touch: { duration: 0.4, easing: 'easeOut' },
    opacityRange: [0.5, 0.8],
  },
  nurturing: {
    float: { duration: 4.5, easing: 'easeInOut' },
    pulse: { duration: 2.8, easing: 'easeInOut' },
    wing: { duration: 0.22, easing: 'easeInOut' },
    touch: { duration: 0.35, easing: 'easeOut' },
    opacityRange: [0.6, 0.85],
  },
  confident: {
    float: { duration: 3.5, easing: 'easeInOut' },
    pulse: { duration: 2.0, easing: 'easeInOut' },
    wing: { duration: 0.18, easing: 'easeInOut' },
    touch: { duration: 0.28, easing: 'easeOut' },
    opacityRange: [0.7, 0.95],
  },
};

// Context-based animation multipliers
const contextMultipliers: Record<ContextType, ContextMultiplier> = {
  idle: { float: 1.0, pulse: 1.0, wing: 1.0, touch: 1.0 },
  guiding: { float: 0.8, pulse: 0.9, wing: 1.1, touch: 0.9 },
  celebrating: { float: 0.6, pulse: 0.7, wing: 1.3, touch: 0.8 },
  helping: { float: 0.9, pulse: 1.0, wing: 1.0, touch: 1.0 },
  waiting: { float: 1.2, pulse: 1.1, wing: 0.8, touch: 1.1 },
  learning: { float: 0.85, pulse: 1.15, wing: 1.2, touch: 0.95 },
  supporting: { float: 0.95, pulse: 1.05, wing: 1.05, touch: 1.05 },
  encouraging: { float: 0.75, pulse: 1.25, wing: 1.3, touch: 0.85 },
};

export const useSofiaAnimations = (
  personality: PersonalityMode,
  context: ContextType
) => {
  const animationConfigs = useMemo(() => {
    return personalityConfigs[personality] || personalityConfigs.empathetic;
  }, [personality]);

  const contextMultiplier = useMemo(() => {
    return contextMultipliers[context] || contextMultipliers.idle;
  }, [context]);

  return {
    animationConfigs,
    contextMultipliers: contextMultiplier,
  };
};

// Animation preset functions for framer-motion
export const createFloatingAnimation = (
  config: AnimationConfig['float'],
  multiplier: number
) => ({
  y: [-10, 10, -10],
  transition: {
    duration: config.duration * multiplier,
    repeat: Infinity,
    ease: config.easing,
  },
});

export const createPulseAnimation = (
  config: AnimationConfig['pulse'],
  multiplier: number,
  glowIntensity: number
) => ({
  scale: [1, 1.2, 1],
  opacity: [glowIntensity, glowIntensity * 1.5, glowIntensity],
  transition: {
    duration: config.duration * multiplier,
    repeat: Infinity,
    ease: config.easing,
  },
});

export const createWingAnimation = (
  config: AnimationConfig['wing'],
  multiplier: number
) => ({
  rotate: [0, 25, 0],
  transition: {
    duration: config.duration * multiplier,
    repeat: Infinity,
    ease: config.easing,
  },
});

export const createTouchAnimation = (
  config: AnimationConfig['touch'],
  multiplier: number
) => ({
  scale: [1, 1.3, 1],
  transition: {
    duration: config.duration * multiplier,
    ease: config.easing,
  },
});

// Easing presets for consistent animations
export const EasingPresets = {
  gentle: 'easeInOut',
  energetic: 'easeOut',
  smooth: 'linear',
  bouncy: 'easeInOut',
} as const;