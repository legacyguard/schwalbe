/**
 * Animation Components Index
 *
 * Exports all animation-related components and utilities for the liquid design system.
 */

// Core animation provider and hooks
export { AnimationProvider, useAnimation, useAnimationLifecycle, usePerformanceAwareAnimation } from './AnimationProvider';

// Liquid motion components
export { LiquidMotion } from './LiquidMotion';

// Spring physics components
export { SpringPhysics } from './SpringPhysics';

// Error state components
export { ErrorStates } from './ErrorStates';

// Personality-aware animation components
export {
  PersonalityAwareAnimation,
  EmotionalAnimation,
  ContextAwareAnimation,
  PersonalityHoverEffect,
  PersonalityAdaptiveLoader,
  PersonalityAnimationUtils
} from './PersonalityAwareAnimations';

// Configuration and utilities
export {
  ANIMATION_CONFIG,
  animationUtils,
  animationPresets,
  AnimationPerformanceMonitor
} from '@/config/animations';

export type {
  AnimationState,
  AnimationContextValue,
  AnimationPreset,
  SpringConfig,
  EasingType,
  DurationPreset,
  StaggerPreset
} from '@/config/animations';

// Re-export commonly used animation libraries
export { animated, useSpring, useTransition, useSprings, useChain } from '@react-spring/web';
export { useGesture } from '@use-gesture/react';