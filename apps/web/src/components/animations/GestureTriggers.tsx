/**
 * Gesture-Based Animation Triggers for LegacyGuard
 *
 * Components that respond to user gestures with liquid animations,
 * providing intuitive and responsive interactions.
 */

import React, { ReactNode, useCallback, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useAnimation, usePerformanceAwareAnimation } from './AnimationProvider';
import { ANIMATION_CONFIG, animationUtils } from '@/config/animations';

// Types
interface GestureTriggerProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onGestureChange?: (state: any) => void;
}

interface SwipeTriggerProps extends GestureTriggerProps {
  direction?: 'left' | 'right' | 'up' | 'down';
  threshold?: number;
  onSwipe?: (direction: string) => void;
}

interface PinchTriggerProps extends GestureTriggerProps {
  minScale?: number;
  maxScale?: number;
  onPinch?: (scale: number) => void;
}

interface PanTriggerProps extends GestureTriggerProps {
  bounds?: { x?: { min: number; max: number }; y?: { min: number; max: number } };
  onPan?: (position: { x: number; y: number }) => void;
}

interface HoverTriggerProps extends GestureTriggerProps {
  scale?: number;
  lift?: number;
  onHover?: (hovering: boolean) => void;
}

interface TapTriggerProps extends GestureTriggerProps {
  scale?: number;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

interface LongPressTriggerProps extends GestureTriggerProps {
  duration?: number;
  onLongPress?: () => void;
  onLongPressEnd?: () => void;
}

// Swipe Gesture Component
export function SwipeTrigger({
  children,
  className = '',
  disabled = false,
  direction = 'right',
  threshold = 50,
  onSwipe,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: SwipeTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], first, last }) => {
        if (disabled || reducedMotion) return;

        if (first) {
          onGestureStart?.();
        }

        const absX = Math.abs(mx);
        const absY = Math.abs(my);

        // Determine swipe direction
        if (absX > absY && absX > threshold) {
          if (mx > 0 && direction === 'right') {
            api({ x: mx, scale: 1.02 });
          } else if (mx < 0 && direction === 'left') {
            api({ x: mx, scale: 1.02 });
          }
        } else if (absY > absX && absY > threshold) {
          if (my > 0 && direction === 'down') {
            api({ y: my, scale: 1.02 });
          } else if (my < 0 && direction === 'up') {
            api({ y: my, scale: 1.02 });
          }
        }

        onGestureChange?.({ x: mx, y: my, direction });

        if (last) {
          onGestureEnd?.();

          // Trigger swipe callback if threshold met
          if (absX > threshold || absY > threshold) {
            const swipeDirection = absX > absY
              ? (mx > 0 ? 'right' : 'left')
              : (my > 0 ? 'down' : 'up');
            onSwipe?.(swipeDirection);
          }

          // Return to original position
          api({ x: 0, y: 0, scale: 1 });
        }
      },
    },
    {
      drag: { filterTaps: true },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ x, y, scale }}>
      {children}
    </animated.div>
  );
}

// Pinch Gesture Component
export function PinchTrigger({
  children,
  className = '',
  disabled = false,
  minScale = 0.5,
  maxScale = 2,
  onPinch,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: PinchTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ scale, rotate }, api] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const bind = useGesture(
    {
      onPinch: ({ offset: [s], first, last }) => {
        if (disabled || reducedMotion) return;

        if (first) {
          onGestureStart?.();
        }

        const clampedScale = Math.max(minScale, Math.min(maxScale, s));
        api({ scale: clampedScale });

        onGestureChange?.({ scale: clampedScale });

        if (last) {
          onGestureEnd?.();
          onPinch?.(clampedScale);
          api({ scale: 1 });
        }
      },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ scale, rotate }}>
      {children}
    </animated.div>
  );
}

// Pan Gesture Component
export function PanTrigger({
  children,
  className = '',
  disabled = false,
  bounds = { x: { min: -100, max: 100 }, y: { min: -100, max: 100 } },
  onPan,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: PanTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], first, last }) => {
        if (disabled || reducedMotion) return;

        if (first) {
          onGestureStart?.();
        }

        const clampedX = bounds.x
          ? Math.max(bounds.x.min, Math.min(bounds.x.max, ox))
          : ox;
        const clampedY = bounds.y
          ? Math.max(bounds.y.min, Math.min(bounds.y.max, oy))
          : oy;

        api({ x: clampedX, y: clampedY });

        onGestureChange?.({ x: clampedX, y: clampedY });

        if (last) {
          onGestureEnd?.();
          onPan?.({ x: clampedX, y: clampedY });
        }
      },
    },
    {
      drag: { filterTaps: true },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ x, y }}>
      {children}
    </animated.div>
  );
}

// Hover Gesture Component
export function HoverTrigger({
  children,
  className = '',
  disabled = false,
  scale = 1.05,
  lift = -4,
  onHover,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: HoverTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ scale: s, y }, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const bind = useGesture(
    {
      onHover: ({ hovering, first, last }) => {
        if (disabled || reducedMotion) return;

        if (first && hovering) {
          onGestureStart?.();
        }

        if (last && !hovering) {
          onGestureEnd?.();
        }

        api({
          scale: hovering ? scale : 1,
          y: hovering ? lift : 0,
        });

        onGestureChange?.({ hovering });
        if (hovering !== undefined) {
          onHover?.(hovering);
        }
      },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ scale: s, y }}>
      {children}
    </animated.div>
  );
}

// Tap Gesture Component
export function TapTrigger({
  children,
  className = '',
  disabled = false,
  scale = 0.95,
  onTap,
  onDoubleTap,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: TapTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ scale: s }, api] = useSpring(() => ({
    scale: 1,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTap = useCallback(() => {
    if (disabled || reducedMotion) return;

    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      onGestureStart?.();
      api({ scale });

      tapTimeoutRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          onTap?.();
        }
        tapCountRef.current = 0;
        onGestureEnd?.();
        api({ scale: 1 });
      }, 300);
    } else if (tapCountRef.current === 2) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      onDoubleTap?.();
      tapCountRef.current = 0;
      onGestureEnd?.();
      api({ scale: 1 });
    }

    onGestureChange?.({ tapCount: tapCountRef.current });
  }, [disabled, reducedMotion, scale, onTap, onDoubleTap, onGestureStart, onGestureEnd, onGestureChange, api]);

  return (
    <animated.div
      className={className}
      style={{ scale: s }}
      onClick={handleTap}
    >
      {children}
    </animated.div>
  );
}

// Long Press Gesture Component
export function LongPressTrigger({
  children,
  className = '',
  disabled = false,
  duration = 500,
  onLongPress,
  onLongPressEnd,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: LongPressTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ scale }, api] = useSpring(() => ({
    scale: 1,
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const pressTimerRef = useRef<NodeJS.Timeout>();
  const isPressedRef = useRef(false);

  const bind = useGesture(
    {
      onPointerDown: () => {
        if (disabled || reducedMotion) return;

        onGestureStart?.();
        isPressedRef.current = true;

        pressTimerRef.current = setTimeout(() => {
          if (isPressedRef.current) {
            api({ scale: 0.9 });
            onLongPress?.();
            onGestureChange?.({ isLongPress: true });
          }
        }, duration);
      },
      onPointerUp: () => {
        if (disabled || reducedMotion) return;

        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
        }

        isPressedRef.current = false;
        api({ scale: 1 });
        onGestureEnd?.();
        onLongPressEnd?.();
        onGestureChange?.({ isLongPress: false });
      },
      onPointerLeave: () => {
        if (disabled || reducedMotion) return;

        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
        }

        isPressedRef.current = false;
        api({ scale: 1 });
        onGestureEnd?.();
        onGestureChange?.({ isLongPress: false });
      },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ scale }}>
      {children}
    </animated.div>
  );
}

// Multi-Gesture Component (combines multiple gestures)
interface MultiGestureTriggerProps extends GestureTriggerProps {
  gestures: ('swipe' | 'pinch' | 'pan' | 'hover' | 'tap' | 'longPress')[];
  onGesture?: (gesture: string, data: any) => void;
}

export function MultiGestureTrigger({
  children,
  className = '',
  disabled = false,
  gestures,
  onGesture,
  onGestureStart,
  onGestureEnd,
  onGestureChange
}: MultiGestureTriggerProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const [{ transform }, api] = useSpring(() => ({
    transform: 'scale(1) translate(0px, 0px)',
    config: animationUtils.getOptimizedConfig(performanceMode),
  }));

  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], first, last }) => {
        if (disabled || reducedMotion || !gestures.includes('pan')) return;

        if (first) onGestureStart?.();
        if (last) onGestureEnd?.();

        api({ transform: `scale(1.02) translate(${mx}px, ${my}px)` });
        onGesture?.('pan', { x: mx, y: my });
        onGestureChange?.({ type: 'pan', x: mx, y: my });
      },
      onPinch: ({ offset: [scale], first, last }) => {
        if (disabled || reducedMotion || !gestures.includes('pinch')) return;

        if (first) onGestureStart?.();
        if (last) onGestureEnd?.();

        api({ transform: `scale(${scale}) translate(0px, 0px)` });
        onGesture?.('pinch', { scale });
        onGestureChange?.({ type: 'pinch', scale });
      },
      onHover: ({ hovering }) => {
        if (disabled || reducedMotion || !gestures.includes('hover')) return;

        if (hovering) {
          onGestureStart?.();
          api({ transform: 'scale(1.05) translate(0px, -4px)' });
          onGesture?.('hover', { hovering: true });
        } else {
          onGestureEnd?.();
          api({ transform: 'scale(1) translate(0px, 0px)' });
          onGesture?.('hover', { hovering: false });
        }
        onGestureChange?.({ type: 'hover', hovering });
      },
    }
  );

  return (
    <animated.div {...bind()} className={className} style={{ transform }}>
      {children}
    </animated.div>
  );
}

// Export all gesture components
export const GestureTriggers = {
  SwipeTrigger,
  PinchTrigger,
  PanTrigger,
  HoverTrigger,
  TapTrigger,
  LongPressTrigger,
  MultiGestureTrigger,
};