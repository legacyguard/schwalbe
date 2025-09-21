/**
 * Spring Physics Configurations for LegacyGuard
 *
 * Pre-configured spring animations for different interaction types
 * and performance levels.
 */

import React, { ReactNode } from 'react';
import { animated, useSpring, useTransition, useSprings } from '@react-spring/web';
import { usePerformanceAwareAnimation } from './AnimationProvider';
import { ANIMATION_CONFIG, animationUtils } from '@/config/animations';

// Types
interface SpringProps {
  children: ReactNode;
  className?: string;
  config?: keyof typeof ANIMATION_CONFIG.SPRINGS;
  disabled?: boolean;
}

interface HoverSpringProps extends SpringProps {
  scale?: number;
  y?: number;
  rotate?: number;
}

interface PressSpringProps extends SpringProps {
  scale?: number;
  y?: number;
}

interface DragSpringProps extends SpringProps {
  sensitivity?: number;
  bounds?: { min: number; max: number };
}

interface StaggerSpringProps extends SpringProps {
  items: any[];
  stagger?: number;
  renderItem: (item: any, index: number, spring: any) => ReactNode;
}

// Hover Spring Component
export function HoverSpring({
  children,
  className = '',
  config = 'default',
  disabled = false,
  scale = 1.02,
  y = -4,
  rotate = 0
}: HoverSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [spring, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    rotate: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const handleMouseEnter = () => {
    if (!disabled && !reducedMotion) {
      api({
        scale,
        y,
        rotate,
        config: ANIMATION_CONFIG.SPRINGS[config],
      });
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !reducedMotion) {
      api({
        scale: 1,
        y: 0,
        rotate: 0,
        config: ANIMATION_CONFIG.SPRINGS[config],
      });
    }
  };

  return (
    <animated.div
      className={className}
      style={spring}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </animated.div>
  );
}

// Press Spring Component
export function PressSpring({
  children,
  className = '',
  config = 'default',
  disabled = false,
  scale = 0.95,
  y = 0
}: PressSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [spring, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const handleMouseDown = () => {
    if (!disabled && !reducedMotion) {
      api({
        scale,
        y,
        config: ANIMATION_CONFIG.SPRINGS[config],
      });
    }
  };

  const handleMouseUp = () => {
    if (!disabled && !reducedMotion) {
      api({
        scale: 1,
        y: 0,
        config: ANIMATION_CONFIG.SPRINGS[config],
      });
    }
  };

  return (
    <animated.div
      className={className}
      style={spring}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </animated.div>
  );
}

// Drag Spring Component
export function DragSpring({
  children,
  className = '',
  config = 'gesture',
  disabled = false,
  sensitivity = 1,
  bounds = { min: -100, max: 100 }
}: DragSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [spring, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled || reducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(bounds.min, Math.min(bounds.max, event.clientX - rect.left));
    const y = Math.max(bounds.min, Math.min(bounds.max, event.clientY - rect.top));

    api({
      x: x * sensitivity,
      y: y * sensitivity,
      config: ANIMATION_CONFIG.SPRINGS[config],
    });
  };

  const handleDragEnd = () => {
    if (disabled || reducedMotion) return;

    api({
      x: 0,
      y: 0,
      config: ANIMATION_CONFIG.SPRINGS[config],
    });
  };

  return (
    <animated.div
      className={className}
      style={spring}
      draggable
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {children}
    </animated.div>
  );
}

// Stagger Spring Component
export function StaggerSpring({
  items,
  className = '',
  config = 'default',
  disabled = false,
  stagger = ANIMATION_CONFIG.STAGGERS.medium,
  renderItem
}: StaggerSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const springs = useSprings(
    items.length,
    items.map((_, index) => ({
      opacity: reducedMotion ? 1 : 0,
      scale: reducedMotion ? 1 : 0.8,
      y: reducedMotion ? 0 : 20,
      delay: disabled ? 0 : index * stagger,
      config: animationUtils.getOptimizedConfig(performanceMode),
    }))
  );

  return (
    <div className={className}>
      {items.map((item, index) => (
        <animated.div
          key={index}
          style={springs[index]}
        >
          {renderItem(item, index, springs[index])}
        </animated.div>
      ))}
    </div>
  );
}

// Morphing Spring Component
interface MorphingSpringProps extends SpringProps {
  variant: 'card' | 'button' | 'input' | 'modal';
  state: 'default' | 'hover' | 'active' | 'loading' | 'error';
}

export function MorphingSpring({
  children,
  className = '',
  config = 'default',
  disabled = false,
  variant,
  state
}: MorphingSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const morphVariants = {
    card: {
      default: { scale: 1, y: 0, rotate: 0 },
      hover: { scale: 1.02, y: -4, rotate: 0 },
      active: { scale: 0.98, y: -2, rotate: 0 },
      loading: { scale: 0.95, y: 0, rotate: 0 },
      error: { scale: 1.02, y: 0, rotate: 1 },
    },
    button: {
      default: { scale: 1, y: 0, rotate: 0 },
      hover: { scale: 1.05, y: 0, rotate: 0 },
      active: { scale: 0.95, y: 0, rotate: 0 },
      loading: { scale: 0.9, y: 0, rotate: 0 },
      error: { scale: 1, y: 0, rotate: 0 },
    },
    input: {
      default: { scale: 1, y: 0, rotate: 0 },
      hover: { scale: 1, y: 0, rotate: 0 },
      active: { scale: 1, y: 0, rotate: 0 },
      loading: { scale: 1, y: 0, rotate: 0 },
      error: { scale: 1.02, y: 0, rotate: 0.5 },
    },
    modal: {
      default: { scale: 1, y: 0, rotate: 0 },
      hover: { scale: 1, y: 0, rotate: 0 },
      active: { scale: 1, y: 0, rotate: 0 },
      loading: { scale: 1, y: 0, rotate: 0 },
      error: { scale: 1, y: 0, rotate: 0 },
    },
  };

  const [spring, api] = useSpring(() => ({
    ...morphVariants[variant].default,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  React.useEffect(() => {
    if (!disabled && !reducedMotion) {
      api({
        ...morphVariants[variant][state],
        config: ANIMATION_CONFIG.SPRINGS[config],
      });
    }
  }, [state, variant, disabled, reducedMotion, api, config]);

  return (
    <animated.div className={className} style={spring}>
      {children}
    </animated.div>
  );
}

// Liquid Spring Component (for fluid, organic animations)
interface LiquidSpringProps extends SpringProps {
  intensity?: 'gentle' | 'normal' | 'strong';
  damping?: number;
  stiffness?: number;
}

export function LiquidSpring({
  children,
  className = '',
  config = 'liquid',
  disabled = false,
  intensity = 'normal',
  damping = 14,
  stiffness = 120
}: LiquidSpringProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const intensitySettings = {
    gentle: { mass: 1, tension: 80, friction: 20 },
    normal: { mass: 1, tension: 120, friction: 14 },
    strong: { mass: 1, tension: 200, friction: 10 },
  };

  const [spring, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    rotate: 0,
    config: {
      ...intensitySettings[intensity],
      clamp: false,
      precision: 0.01,
      velocity: 0,
    },
  }));

  const triggerLiquidAnimation = () => {
    if (!disabled && !reducedMotion) {
      api({
        scale: 1.05,
        y: -8,
        rotate: 2,
        config: {
          ...intensitySettings[intensity],
          clamp: false,
          precision: 0.01,
          velocity: 0,
        },
      });

      setTimeout(() => {
        api({
          scale: 1,
          y: 0,
          rotate: 0,
          config: {
            ...intensitySettings[intensity],
            clamp: false,
            precision: 0.01,
            velocity: 0,
          },
        });
      }, 200);
    }
  };

  return (
    <animated.div
      className={className}
      style={spring}
      onClick={triggerLiquidAnimation}
    >
      {children}
    </animated.div>
  );
}

// Export all spring components
export const SpringPhysics = {
  HoverSpring,
  PressSpring,
  DragSpring,
  StaggerSpring,
  MorphingSpring,
  LiquidSpring,
};