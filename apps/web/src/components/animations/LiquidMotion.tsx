/**
 * Liquid Motion Components for LegacyGuard
 *
 * Base animation components that provide liquid design motion effects
 * with performance optimization and accessibility support.
 */

import React, { ReactNode, useMemo } from 'react';
import { animated, useSpring, useTransition, useSprings } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useAnimation, usePerformanceAwareAnimation } from './AnimationProvider';
import { ANIMATION_CONFIG, animationUtils } from '@/config/animations';

// Types
interface LiquidMotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  disabled?: boolean;
}

interface FadeInProps extends LiquidMotionProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

interface SlideInProps extends LiquidMotionProps {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

interface ScaleInProps extends LiquidMotionProps {
  scale?: number;
}

interface MorphProps extends LiquidMotionProps {
  variant: 'card-hover' | 'card-active' | 'button-hover' | 'button-active' | 'input-focus';
}

interface StaggerProps extends LiquidMotionProps {
  stagger?: number;
  childDelay?: number;
}

// Base animated container
export const LiquidContainer = animated.div;

// Fade In Animation Component
export function FadeIn({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_CONFIG.DURATIONS.normal,
  disabled = false,
  direction = 'up',
  distance = 20
}: FadeInProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { opacity: 1, ...directions[direction] }
      : { opacity: 0, ...directions[direction] },
    to: { opacity: 1, x: 0, y: 0 },
    delay: disabled ? 0 : delay,
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Slide In Animation Component
export function SlideIn({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_CONFIG.DURATIONS.normal,
  disabled = false,
  direction,
  distance = 50
}: SlideInProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { ...directions[direction] }
      : { opacity: 0, ...directions[direction] },
    to: { opacity: 1, x: 0, y: 0 },
    delay: disabled ? 0 : delay,
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Scale In Animation Component
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_CONFIG.DURATIONS.normal,
  disabled = false,
  scale = 0.8
}: ScaleInProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, opacity: 1 }
      : { scale, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    delay: disabled ? 0 : delay,
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Morph Animation Component
export function Morph({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_CONFIG.DURATIONS.normal,
  disabled = false,
  variant
}: MorphProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const morphVariants = {
    'card-hover': {
      scale: 1.02,
      y: -4,
      rotate: 0,
    },
    'card-active': {
      scale: 0.98,
      y: -2,
      rotate: 0,
    },
    'button-hover': {
      scale: 1.05,
      y: 0,
      rotate: 0,
    },
    'button-active': {
      scale: 0.95,
      y: 0,
      rotate: 0,
    },
    'input-focus': {
      scale: 1.02,
      y: 0,
      rotate: 0,
    },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, y: 0, rotate: 0 }
      : { scale: 1, y: 0, rotate: 0 },
    to: morphVariants[variant],
    delay: disabled ? 0 : delay,
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Stagger Animation Component
export function Stagger({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_CONFIG.DURATIONS.normal,
  disabled = false,
  stagger = ANIMATION_CONFIG.STAGGERS.medium,
  childDelay = 0
}: StaggerProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const childrenArray = React.Children.toArray(children);

  const springs = useSprings(
    childrenArray.length,
    childrenArray.map((_, index) => ({
      from: disabled || reducedMotion
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
      delay: disabled ? 0 : delay + (index * stagger) + childDelay,
      config: animationUtils.getOptimizedConfig('high'),
    }))
  );

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <LiquidContainer key={index} style={springs[index]}>
          {child}
        </LiquidContainer>
      ))}
    </div>
  );
}

// Gesture-Aware Animation Component
interface GestureAwareProps extends LiquidMotionProps {
  onGesture?: (gesture: any) => void;
  gestureType?: 'drag' | 'pinch' | 'move' | 'hover';
  sensitivity?: number;
}

export function GestureAware({
  children,
  className = '',
  onGesture,
  gestureType = 'drag',
  sensitivity = 1
}: GestureAwareProps) {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: ANIMATION_CONFIG.SPRINGS.gesture,
  }));

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        api({ x: x * sensitivity, y: y * sensitivity });
        onGesture?.({ type: 'drag', x, y });
      },
      onPinch: ({ offset: [scale] }) => {
        api({ scale: scale * sensitivity });
        onGesture?.({ type: 'pinch', scale });
      },
      onMove: ({ xy: [x, y] }) => {
        onGesture?.({ type: 'move', x, y });
      },
      onHover: ({ hovering }) => {
        if (gestureType === 'hover') {
          api({ scale: hovering ? 1.05 : 1 });
          onGesture?.({ type: 'hover', hovering });
        }
      },
    },
    {
      drag: { filterTaps: true },
      pinch: { scaleBounds: { min: 0.5, max: 2 } },
    }
  );

  return (
    <LiquidContainer
      {...bind()}
      className={className}
      style={{ x, y, scale }}
    >
      {children}
    </LiquidContainer>
  );
}

// Performance-Optimized Animation Wrapper
interface PerformanceOptimizedProps extends LiquidMotionProps {
  threshold?: number;
  rootMargin?: string;
}

export function PerformanceOptimized({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: PerformanceOptimizedProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const spring = useSpring({
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={reducedMotion ? undefined : spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Enhanced Liquid Design Components for Apple 2025

// Contextual Morphing Component
interface ContextualMorphProps extends LiquidMotionProps {
  context: 'comforting' | 'celebratory' | 'urgent' | 'neutral';
  intensity?: 'subtle' | 'moderate' | 'intense';
}

export function ContextualMorph({
  children,
  className = '',
  context,
  intensity = 'moderate',
  disabled = false
}: ContextualMorphProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const contextVariants = {
    comforting: {
      subtle: { scale: 0.98, y: -2, rotate: 0 },
      moderate: { scale: 0.96, y: -4, rotate: 1 },
      intense: { scale: 0.94, y: -6, rotate: 2 },
    },
    celebratory: {
      subtle: { scale: 1.02, y: -2, rotate: -1 },
      moderate: { scale: 1.04, y: -4, rotate: -2 },
      intense: { scale: 1.06, y: -6, rotate: -3 },
    },
    urgent: {
      subtle: { scale: 1.02, y: -1, rotate: 0.5 },
      moderate: { scale: 1.04, y: -2, rotate: 1 },
      intense: { scale: 1.06, y: -3, rotate: 1.5 },
    },
    neutral: {
      subtle: { scale: 1, y: 0, rotate: 0 },
      moderate: { scale: 1.01, y: -1, rotate: 0 },
      intense: { scale: 1.02, y: -2, rotate: 0 },
    },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, y: 0, rotate: 0 }
      : { scale: 1, y: 0, rotate: 0 },
    to: contextVariants[context][intensity],
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Emotional State Animation Component
interface EmotionalStateProps extends LiquidMotionProps {
  emotion: 'joy' | 'calm' | 'trust' | 'hope' | 'determination';
  trigger: 'hover' | 'focus' | 'load' | 'complete';
}

export function EmotionalState({
  children,
  className = '',
  emotion,
  trigger,
  disabled = false
}: EmotionalStateProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const emotionVariants = {
    joy: {
      scale: [1, 1.1, 1],
      rotate: [0, 2, -2, 0],
      y: [0, -3, 0],
    },
    calm: {
      scale: [1, 1.02, 1],
      rotate: [0, 0.5, 0],
      y: [0, -1, 0],
    },
    trust: {
      scale: [1, 1.03, 1],
      rotate: [0, 1, 0],
      y: [0, -2, 0],
    },
    hope: {
      scale: [1, 1.05, 1],
      rotate: [0, -1, 1, 0],
      y: [0, -4, 0],
    },
    determination: {
      scale: [1, 1.02, 1],
      rotate: [0, 0.5, 0],
      y: [0, -1, 0],
    },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, rotate: 0, y: 0 }
      : { scale: 1, rotate: 0, y: 0 },
    to: emotionVariants[emotion],
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Liquid Background Morphing Component
interface LiquidBackgroundProps extends LiquidMotionProps {
  variant: 'breathing' | 'flowing' | 'pulsing' | 'shifting';
  colors?: string[];
  intensity?: number;
}

export function LiquidBackground({
  children,
  className = '',
  variant,
  colors = ['rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)', 'rgba(16, 185, 129, 0.1)'],
  intensity = 1,
  disabled = false
}: LiquidBackgroundProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const backgroundVariants = {
    breathing: {
      background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
      scale: [1, 1.2, 1],
      opacity: [0.3 * intensity, 0.6 * intensity, 0.3 * intensity],
    },
    flowing: {
      background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
      x: [0, 100, 0],
      opacity: [0.1 * intensity, 0.3 * intensity, 0.1 * intensity],
    },
    pulsing: {
      background: `radial-gradient(circle, ${colors[0]} 20%, transparent 80%)`,
      scale: [0.8, 1.5, 0.8],
      opacity: [0.2 * intensity, 0.5 * intensity, 0.2 * intensity],
    },
    shifting: {
      background: `conic-gradient(from 0deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
      rotate: [0, 360],
      opacity: [0.1 * intensity, 0.3 * intensity, 0.1 * intensity],
    },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, rotate: 0, x: 0, y: 0, opacity: 0.1 * intensity }
      : { scale: 1, rotate: 0, x: 0, y: 0, opacity: 0.1 * intensity },
    to: backgroundVariants[variant],
    config: animationUtils.getOptimizedConfig('low'),
  });

  return (
    <LiquidContainer
      className={`absolute inset-0 ${className}`}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Personality-Responsive Component
interface PersonalityResponsiveProps extends LiquidMotionProps {
  personality: 'caring' | 'confident' | 'gentle' | 'encouraging';
  userState: 'new' | 'returning' | 'hesitant' | 'confident';
}

export function PersonalityResponsive({
  children,
  className = '',
  personality,
  userState,
  disabled = false
}: PersonalityResponsiveProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const personalityVariants = {
    caring: {
      new: { scale: 0.95, y: -2, rotate: 1 },
      returning: { scale: 1, y: -1, rotate: 0 },
      hesitant: { scale: 0.98, y: -3, rotate: 0.5 },
      confident: { scale: 1.02, y: -1, rotate: -0.5 },
    },
    confident: {
      new: { scale: 1.02, y: -1, rotate: -0.5 },
      returning: { scale: 1.01, y: -0.5, rotate: 0 },
      hesitant: { scale: 1, y: -2, rotate: 0 },
      confident: { scale: 1.03, y: 0, rotate: -1 },
    },
    gentle: {
      new: { scale: 0.96, y: -3, rotate: 0.5 },
      returning: { scale: 0.99, y: -1, rotate: 0 },
      hesitant: { scale: 0.97, y: -4, rotate: 1 },
      confident: { scale: 1.01, y: -0.5, rotate: -0.5 },
    },
    encouraging: {
      new: { scale: 1.01, y: -2, rotate: -1 },
      returning: { scale: 1.02, y: -1, rotate: -0.5 },
      hesitant: { scale: 1, y: -3, rotate: 0 },
      confident: { scale: 1.04, y: 0, rotate: -1 },
    },
  };

  const spring = useSpring({
    from: disabled || reducedMotion
      ? { scale: 1, y: 0, rotate: 0 }
      : { scale: 1, y: 0, rotate: 0 },
    to: personalityVariants[personality][userState],
    config: animationUtils.getOptimizedConfig('medium'),
  });

  return (
    <LiquidContainer
      className={className}
      style={spring}
    >
      {children}
    </LiquidContainer>
  );
}

// Export all components
export const LiquidMotion = {
  FadeIn,
  SlideIn,
  ScaleIn,
  Morph,
  Stagger,
  GestureAware,
  PerformanceOptimized,
  Container: LiquidContainer,
  ContextualMorph,
  EmotionalState,
  LiquidBackground,
  PersonalityResponsive,
};