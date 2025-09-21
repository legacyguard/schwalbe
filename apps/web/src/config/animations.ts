/**
 * Animation Configuration System for LegacyGuard
 *
 * This file contains all animation configurations for the liquid design system,
 * including spring physics, easing curves, and performance settings.
 */

import { config } from '@react-spring/web';

// Animation performance settings
export const ANIMATION_CONFIG = {
  // Performance thresholds
  FPS_TARGET: 60,
  MAX_ANIMATION_DURATION: 2000, // 2 seconds max for any single animation
  REDUCED_MOTION_DURATION_MULTIPLIER: 0.5,

  // Spring physics configurations
  SPRINGS: {
    // Gentle spring for subtle interactions
    gentle: config.gentle,

    // Default spring for most UI interactions
    default: config.default,

    // Stiff spring for snappy feedback
    stiff: config.stiff,

    // Slow spring for dramatic reveals
    slow: config.slow,

    // Custom spring for liquid design
    liquid: {
      mass: 1,
      tension: 120,
      friction: 14,
      clamp: false,
      precision: 0.01,
      velocity: 0,
    },

    // Custom spring for morphing transitions
    morphing: {
      mass: 0.8,
      tension: 180,
      friction: 12,
      clamp: false,
      precision: 0.01,
      velocity: 0,
    },

    // Custom spring for gesture-based interactions
    gesture: {
      mass: 0.6,
      tension: 300,
      friction: 35,
      clamp: true,
      precision: 0.01,
      velocity: 0,
    },
  },

  // Easing curves for different animation types
  EASING: {
    // Standard easing for smooth transitions
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeIn: [0.42, 0, 1, 1],
    easeInOut: [0.42, 0, 0.58, 1],

    // Custom easing for liquid design
    liquid: [0.25, 0.46, 0.45, 0.94],
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.175, 0.885, 0.32, 1.275],

    // Easing for emotional states
    comforting: [0.25, 0.46, 0.45, 0.94],
    celebratory: [0.68, -0.55, 0.265, 1.55],
    urgent: [0.4, 0, 0.2, 1],
  },

  // Animation duration presets
  DURATIONS: {
    instant: 50,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    dramatic: 1200,
  },

  // Stagger delays for sequential animations
  STAGGERS: {
    micro: 25,
    small: 50,
    medium: 100,
    large: 200,
    dramatic: 300,
  },
} as const;

// Animation state management
export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  performanceMode: 'high' | 'medium' | 'low';
  reducedMotion: boolean;
}

// Animation performance monitoring
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  updateFrame() {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
    }

    return this.fps;
  }

  getPerformanceMode(): 'high' | 'medium' | 'low' {
    if (this.fps >= 55) return 'high';
    if (this.fps >= 30) return 'medium';
    return 'low';
  }
}

// Animation context provider configuration
export interface AnimationContextValue {
  performanceMonitor: AnimationPerformanceMonitor;
  config: typeof ANIMATION_CONFIG;
  state: AnimationState;
  updateState: (updates: Partial<AnimationState>) => void;
}

// Utility functions for animation timing
export const animationUtils = {
  // Calculate optimal duration based on distance and performance
  calculateDuration: (distance: number, baseDuration: number = 300): number => {
    const speed = Math.min(distance / 100, 2); // Normalize speed
    return Math.max(50, Math.min(baseDuration * speed, ANIMATION_CONFIG.MAX_ANIMATION_DURATION));
  },

  // Get staggered delay for sequential animations
  getStaggerDelay: (index: number, stagger: keyof typeof ANIMATION_CONFIG.STAGGERS): number => {
    return index * ANIMATION_CONFIG.STAGGERS[stagger];
  },

  // Check if reduced motion is preferred
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get performance-optimized config
  getOptimizedConfig: (performanceMode: 'high' | 'medium' | 'low') => {
    const configs = {
      high: ANIMATION_CONFIG.SPRINGS.default,
      medium: { ...ANIMATION_CONFIG.SPRINGS.default, tension: 100 },
      low: { ...ANIMATION_CONFIG.SPRINGS.default, tension: 80, friction: 20 },
    };

    return configs[performanceMode];
  },
};

// Animation presets for common use cases
export const animationPresets = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.normal,
      ease: ANIMATION_CONFIG.EASING.easeOut,
    },
  },

  // Card hover effects
  cardHover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },

  // Button press feedback
  buttonPress: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.fast,
      ease: ANIMATION_CONFIG.EASING.easeInOut,
    },
  },

  // Loading spinner
  loadingSpinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  // Success celebration
  successCelebration: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.slow,
      ease: ANIMATION_CONFIG.EASING.bounce,
    },
  },

  // Error shake
  errorShake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.fast,
      ease: ANIMATION_CONFIG.EASING.easeInOut,
    },
  },
} as const;

// Export types
export type AnimationPreset = keyof typeof animationPresets;
export type SpringConfig = keyof typeof ANIMATION_CONFIG.SPRINGS;
export type EasingType = keyof typeof ANIMATION_CONFIG.EASING;
export type DurationPreset = keyof typeof ANIMATION_CONFIG.DURATIONS;
export type StaggerPreset = keyof typeof ANIMATION_CONFIG.STAGGERS;