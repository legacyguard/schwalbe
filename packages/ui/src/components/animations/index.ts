// Animation System - Centralized export for all animation components and utilities
// Provides access to firefly animations, interactive elements, and personality-aware animations

// Enhanced Firefly Components
export {
  EnhancedFirefly,
  default as EnhancedFireflyComponent,
} from './EnhancedFirefly';
export {
  SofiaFirefly,
  default as SofiaFireflyComponent,
} from './SofiaFirefly';

// Interactive Animation Components
export {
  AdaptiveAnimatedButton,
  AdaptiveAnimatedCard,
  AdaptiveAnimatedListItem,
  AdaptiveGlowEffect,
  AdaptiveHoverScale,
  AdaptivePulseAnimation,
  AdaptiveAnimationProvider,
  useAdaptiveAnimation,
} from './InteractiveAnimations';

// Loading Animations with Firefly Physics
export {
  LoadingAnimation,
  PageLoader,
  ButtonLoader,
  CardLoader,
  FormLoader,
  ProgressLoader,
} from './LoadingAnimations';

// Milestone and Achievement Animations
export {
  MilestoneCelebration,
  AdaptiveProgressRing,
  AchievementBadge,
} from './MilestoneAnimations';

// Peaceful Transitions
export {
  PeacefulPageTransition,
  FloatingElement,
  BreathingContainer,
  GentleWaveBackground,
  FadeSlideTransition,
  StaggeredReveal,
  MorphingShape,
  ParallaxContainer,
} from './PeacefulTransitions';

// Emotional States and Feedback
export {
  EmotionalStateNotification,
  EmotionalToast,
  InlineEmotionalState,
} from './EmotionalStates';

// Firefly Context and State Management
export {
  FireflyProvider,
  useFirefly,
  useFireflyGuidance,
  useFireflyCelebration,
} from '../contexts/FireflyContext';

// Animation Hooks
export { useFireflyEvents } from '../hooks/useFireflyEvents';

// Core Animation System
export {
  AnimationSystem,
  useAnimationConfig,
  ANIMATION_PRESETS,
  ANIMATION_VARIANTS,
  fadeInUp,
  fadeInLeft,
  scaleIn,
  slideInRight,
} from '../../lib/animation-system';

// Re-export types from shared package
export type {
  FireflyEventType,
  FireflyState,
  FireflyContextValue,
  FireflyProviderProps,
  FireflyPosition,
  TrailPoint,
  EnhancedFireflyProps,
  SofiaFireflyProps,
  PersonalityMode,
  CommunicationStyle,
  LoadingAnimationType,
  LoadingAnimationProps,
  MilestoneData,
  MilestoneCelebrationProps,
  AnimationConfig,
  AdaptiveAnimationConfig,
  AnimationComponentProps,
  MicroAnimationType,
  MicroAnimationProps,
} from '@schwalbe/shared/types/animations';

// Animation configuration presets for easy consumption
export const PERSONALITY_ANIMATIONS = {
  empathetic: {
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94],
    stagger: 0.15,
    style: 'organic',
  },
  pragmatic: {
    duration: 0.4,
    ease: [0.4, 0.0, 0.2, 1],
    stagger: 0.08,
    style: 'efficient',
  },
  adaptive: {
    duration: 0.6,
    ease: [0.35, 0.23, 0.32, 0.97],
    stagger: 0.12,
    style: 'balanced',
  },
} as const;

// Quick access to common animation combinations
export const COMMON_ANIMATIONS = {
  // Card hover effects
  cardHover: (mode: 'adaptive' | 'empathetic' | 'pragmatic' = 'adaptive') => ({
    whileHover: {
      scale: mode === 'empathetic' ? 1.03 : mode === 'pragmatic' ? 1.01 : 1.02,
      y: mode === 'empathetic' ? -8 : -4,
      boxShadow:
        mode === 'empathetic'
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    transition: {
      duration: mode === 'pragmatic' ? 0.2 : 0.3,
    },
  }),

  // Button press effects
  buttonPress: (
    mode: 'adaptive' | 'empathetic' | 'pragmatic' = 'adaptive'
  ) => ({
    whileTap: {
      scale: mode === 'empathetic' ? 0.95 : 0.98,
    },
    transition: {
      duration: 0.1,
    },
  }),

  // List item stagger
  listItemStagger: (
    mode: 'adaptive' | 'empathetic' | 'pragmatic' = 'adaptive'
  ) => ({
    initial: { opacity: 0, y: mode === 'empathetic' ? 20 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: PERSONALITY_ANIMATIONS[mode].duration,
      ease: PERSONALITY_ANIMATIONS[mode].ease,
    },
  }),
} as const;

// Animation performance utilities
export const ANIMATION_PERFORMANCE = {
  // Optimize for performance
  getOptimizedProps: () => ({
    style: { willChange: 'transform, opacity' },
    viewport: { once: true, margin: '0px 0px -50px 0px' },
  }),

  // Check if animations should be disabled
  shouldReduceMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get responsive animation settings
  getResponsiveConfig: (isMobile: boolean) => ({
    duration: isMobile ? 0.3 : 0.5,
    stagger: isMobile ? 0.05 : 0.1,
  }),
} as const;

// Firefly Animation System Constants
export const FIREFLY_CONFIG = {
  empathetic: {
    defaultType: 'glow',
    colors: ['#ec4899', '#f97316', '#8b5cf6'],
    duration: 0.4,
    easing: 'easeOut',
    scale: 1.05,
    bounce: 0.3,
  },
  pragmatic: {
    defaultType: 'lift',
    colors: ['#6b7280', '#374151', '#111827'],
    duration: 0.2,
    easing: 'easeInOut',
    scale: 1.02,
    bounce: 0,
  },
  adaptive: {
    defaultType: 'tilt',
    colors: ['#3b82f6', '#10b981', '#06b6d4'],
    duration: 0.3,
    easing: 'easeOut',
    scale: 1.03,
    bounce: 0.1,
  },
} as const;

// Animation system status
export const ANIMATION_SYSTEM_INFO = {
  version: '1.0.0',
  name: 'Schwalbe Animation System',
  features: [
    'Personality-aware firefly animations',
    'Mouse tracking and physics',
    'Interactive micro-animations',
    'Loading state animations with particles',
    'Milestone celebration animations',
    'Accessibility compliance',
    'Performance optimization',
    'Responsive behavior',
    'Reduced motion support',
  ],
  components: [
    'EnhancedFirefly',
    'SofiaFirefly',
    'LoadingAnimations',
    'InteractiveAnimations',
    'MilestoneAnimations',
    'FireflyContext',
    'AnimationHooks',
  ],
} as const;

// Utility functions for advanced animations
export const ANIMATION_UTILS = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Create staggered animation delays for lists
   */
  createStaggerDelays: (count: number, baseDelay: number = 0.05): number[] => {
    return Array.from({ length: count }, (_, i) => i * baseDelay);
  },

  /**
   * Get personality-specific animation timing
   */
  getPersonalityTiming: (
    personality: 'adaptive' | 'empathetic' | 'pragmatic'
  ) => {
    return FIREFLY_CONFIG[personality];
  },

  /**
   * Create mouse tracking configuration
   */
  createMouseConfig: (sensitivity: number = 0.8) => ({
    enabled: true,
    followDelay: 0.1,
    sensitivity,
    smoothing: 0.3,
  }),

  /**
   * Create physics configuration for particles
   */
  createPhysicsConfig: (mode: 'adaptive' | 'empathetic' | 'pragmatic') => ({
    damping: mode === 'pragmatic' ? 30 : 20,
    stiffness: mode === 'pragmatic' ? 300 : 150,
    mass: 0.8,
  }),
};