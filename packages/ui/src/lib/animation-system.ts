// Animation System Foundation for Schwalbe
// Provides centralized animation configurations and utilities for Sofia's adaptive animations

import type { Easing, Transition, Variants } from 'framer-motion';

export type PersonalityMode = 'adaptive' | 'empathetic' | 'pragmatic';

/**
 * Animation configuration types
 */
export interface AnimationConfig {
  delay: number;
  duration: number;
  ease: Easing;
  stagger?: number;
}

export interface AdaptiveAnimationConfig {
  balanced: AnimationConfig;
  empathetic: AnimationConfig;
  pragmatic: AnimationConfig;
}

/**
 * Core animation presets based on Sofia's personality modes
 */
export const ANIMATION_PRESETS: Record<PersonalityMode, AnimationConfig> = {
  empathetic: {
    duration: 0.8,
    delay: 0.1,
    ease: [0.25, 0.46, 0.45, 0.94], // Organic, flowing easing
    stagger: 0.15,
  },
  pragmatic: {
    duration: 0.4,
    delay: 0.05,
    ease: [0.4, 0.0, 0.2, 1], // Sharp, efficient easing
    stagger: 0.08,
  },
  adaptive: {
    duration: 0.6,
    delay: 0.08,
    ease: [0.35, 0.23, 0.32, 0.97], // Balanced easing
    stagger: 0.12,
  },
};

/**
 * Common animation variants for consistent UI behavior
 */
export const ANIMATION_VARIANTS = {
  // Page transitions
  pageEntry: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  // Card animations
  cardHover: {
    rest: { scale: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  },

  // Modal/Dialog animations
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  },

  // Notification animations
  notification: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },

  // Progress animations
  progressFill: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
  },

  // Button interactions
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.98 },
  },

  // Milestone celebrations
  celebrate: {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },

  // Garden growth animations
  gardenGrowth: {
    seed: { scale: 0.5, opacity: 0.7 },
    sprout: { scale: 0.8, opacity: 0.9 },
    bloom: { scale: 1, opacity: 1 },
  },

  // Firefly trail
  fireflyTrail: {
    initial: { opacity: 0.6, scale: 1 },
    animate: { opacity: 0, scale: 0.3 },
    exit: { opacity: 0 },
  },
} as const;

/**
 * Animation utility functions
 */
export class AnimationSystem {
  /**
   * Get animation config based on personality mode
   */
  static getConfig(mode: PersonalityMode): AnimationConfig {
    return ANIMATION_PRESETS[mode];
  }

  /**
   * Create adaptive transition based on personality
   */
  static createTransition(
    mode: PersonalityMode,
    overrides?: Partial<AnimationConfig>
  ): Transition {
    const config = this.getConfig(mode);
    return {
      duration: overrides?.duration ?? config.duration,
      delay: overrides?.delay ?? config.delay,
      ease: overrides?.ease ?? config.ease,
      staggerChildren: overrides?.stagger ?? config.stagger,
    };
  }

  /**
   * Create staggered container variants
   */
  static createStaggerContainer(mode: PersonalityMode): Variants {
    const config = this.getConfig(mode);
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: config.stagger,
          delayChildren: config.delay,
        },
      },
      exit: {
        opacity: 0,
        transition: {
          staggerChildren: (config.stagger || 0.1) * 0.5,
          staggerDirection: -1,
        },
      },
    };
  }

  /**
   * Create staggered item variants
   */
  static createStaggerItem(mode: PersonalityMode): Variants {
    const config = this.getConfig(mode);

    if (mode === 'empathetic') {
      return {
        initial: { opacity: 0, y: 20, scale: 0.9 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: config.duration,
            ease: config.ease,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
          scale: 0.9,
          transition: {
            duration: config.duration * 0.7,
            ease: config.ease,
          },
        },
      };
    } else {
      return {
        initial: { opacity: 0, x: -10 },
        animate: {
          opacity: 1,
          x: 0,
          transition: {
            duration: config.duration,
            ease: config.ease,
          },
        },
        exit: {
          opacity: 0,
          x: 10,
          transition: {
            duration: config.duration * 0.7,
            ease: config.ease,
          },
        },
      };
    }
  }

  /**
   * Create adaptive page transition variants
   */
  static createPageTransition(mode: PersonalityMode): Variants {
    const config = this.getConfig(mode);

    if (mode === 'empathetic') {
      // Organic, flowing page transitions
      return {
        initial: {
          opacity: 0,
          y: 30,
          scale: 0.98,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: config.duration,
            ease: config.ease,
            delay: config.delay,
          },
        },
        exit: {
          opacity: 0,
          y: -20,
          scale: 1.02,
          transition: {
            duration: config.duration * 0.8,
            ease: config.ease,
          },
        },
      };
    } else {
      // Direct, efficient page transitions
      return {
        initial: {
          opacity: 0,
          x: 20,
        },
        animate: {
          opacity: 1,
          x: 0,
          transition: {
            duration: config.duration,
            ease: config.ease,
            delay: config.delay,
          },
        },
        exit: {
          opacity: 0,
          x: -20,
          transition: {
            duration: config.duration * 0.7,
            ease: config.ease,
          },
        },
      };
    }
  }

  /**
   * Create celebration animation variants
   */
  static createCelebrationVariants(mode: PersonalityMode): Variants {
    const config = this.getConfig(mode);

    if (mode === 'empathetic') {
      // Joyful, organic celebration
      return {
        initial: { scale: 1, rotate: 0 },
        animate: {
          scale: [1, 1.15, 1.05, 1],
          rotate: [0, 3, -2, 0],
          y: [0, -5, 0],
          transition: {
            duration: config.duration * 2,
            ease: config.ease,
            repeat: 2,
          },
        },
      };
    } else {
      // Efficient, purposeful celebration
      return {
        initial: { scale: 1 },
        animate: {
          scale: [1, 1.08, 1],
          transition: {
            duration: config.duration,
            ease: config.ease,
            repeat: 1,
          },
        },
      };
    }
  }

  /**
   * Performance optimization utilities
   */
  static getOptimizedProps() {
    return {
      // Optimize for smooth animations
      style: {
        willChange: 'transform, opacity',
      },
      // Reduce motion for accessibility
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '0px 0px -100px 0px' },
    };
  }

  /**
   * Responsive animation scaling
   */
  static getResponsiveConfig(
    mode: PersonalityMode,
    isMobile: boolean
  ): AnimationConfig {
    const config = this.getConfig(mode);

    if (isMobile) {
      return {
        ...config,
        duration: config.duration * 0.8,
        delay: config.delay * 0.7,
        stagger: (config.stagger || 0.1) * 0.8,
      };
    }

    return config;
  }

  /**
   * Accessibility considerations
   */
  static shouldReduceMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get reduced motion config
   */
  static getReducedMotionConfig(): AnimationConfig {
    return {
      duration: 0.1,
      delay: 0,
      ease: 'linear',
      stagger: 0,
    };
  }
}

/**
 * Hook for getting adaptive animation configuration
 */
export function useAnimationConfig(
  mode: PersonalityMode = 'adaptive'
): AnimationConfig {
  if (typeof window === 'undefined') {
    return AnimationSystem.getConfig(mode);
  }
  
  const isMobile = window.innerWidth < 768;
  const shouldReduce = AnimationSystem.shouldReduceMotion();

  if (shouldReduce) {
    return AnimationSystem.getReducedMotionConfig();
  }

  return AnimationSystem.getResponsiveConfig(mode, isMobile);
}

/**
 * Common animation preset exports
 */
export const fadeInUp = (mode: PersonalityMode = 'adaptive'): Variants => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: AnimationSystem.createTransition(mode),
  },
});

export const fadeInLeft = (mode: PersonalityMode = 'adaptive'): Variants => ({
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: AnimationSystem.createTransition(mode),
  },
});

export const scaleIn = (mode: PersonalityMode = 'adaptive'): Variants => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: AnimationSystem.createTransition(mode),
  },
});

export const slideInRight = (mode: PersonalityMode = 'adaptive'): Variants => ({
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: AnimationSystem.createTransition(mode),
  },
});