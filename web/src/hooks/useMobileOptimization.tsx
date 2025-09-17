
/**
 * Mobile Optimization React Hooks
 * Custom hooks for responsive design and mobile performance optimizations
 */

import { type RefObject, useCallback, useEffect, useState } from 'react';
import {
  type Breakpoint,
  breakpoints,
  touchThresholds,
} from '@/lib/performance/mobile-optimization-constants';

// Hook for responsive breakpoint detection
export function useBreakpoint(): {
  current: Breakpoint | null;
  height: number;
  is2XLarge: boolean;
  isLarge: boolean;
  isMedium: boolean;
  isSmall: boolean;
  isXLarge: boolean;
  width: number;
} {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (): Breakpoint | null => {
    const { width } = windowSize;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return null;
  };

  return {
    current: getCurrentBreakpoint(),
    isSmall: windowSize.width < breakpoints.md,
    isMedium:
      windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isLarge:
      windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl,
    isXLarge:
      windowSize.width >= breakpoints.xl &&
      windowSize.width < breakpoints['2xl'],
    is2XLarge: windowSize.width >= breakpoints['2xl'],
    width: windowSize.width,
    height: windowSize.height,
  };
}

// Hook for touch gesture handling
export function useTouchGestures(elementRef: RefObject<HTMLElement>) {
  const [gesture, setGesture] = useState<{
    direction: 'down' | 'left' | 'right' | 'up' | null;
    isActive: boolean;
    startPoint: null | { x: number; y: number };
    type: 'pinch' | 'swipe' | 'tap' | null;
  }>({
    isActive: false,
    type: null,
    direction: null,
    startPoint: null,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let touchStart: null | { time: number; x: number; y: number } = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setGesture(prev => ({
        ...prev,
        isActive: true,
        startPoint: { x: touch.clientX, y: touch.clientY },
      }));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      if (
        distance < touchThresholds.swipeDistance &&
        deltaTime < touchThresholds.tapTimeout
      ) {
        setGesture(prev => ({ ...prev, type: 'tap', isActive: false }));
      } else if (velocity > touchThresholds.swipeVelocity) {
        let direction: 'down' | 'left' | 'right' | 'up';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        setGesture(prev => ({
          ...prev,
          type: 'swipe',
          direction,
          isActive: false,
        }));
      } else {
        setGesture(prev => ({ ...prev, isActive: false }));
      }

      touchStart = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef]);

  return gesture;
}

// Hook for responsive grid columns
export function useResponsiveGrid(defaultCols: number = 1) {
  const { current, width } = useBreakpoint();

  const getColumns = useCallback(() => {
    if (!current) return defaultCols;

    const columnMap: Record<Breakpoint, number> = {
      sm: Math.max(1, defaultCols),
      md: Math.max(2, Math.floor(defaultCols * 1.5)),
      lg: Math.max(2, defaultCols * 2),
      xl: Math.max(3, Math.floor(defaultCols * 2.5)),
      '2xl': Math.max(4, defaultCols * 3),
    };

    return columnMap[current];
  }, [current, defaultCols]);

  return {
    columns: getColumns(),
    breakpoint: current,
    width,
  };
}

// Hook for viewport information
export function useViewport() {
  const { width, height, current } = useBreakpoint();

  return {
    width,
    height,
    breakpoint: current,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    orientation: width > height ? 'landscape' : 'portrait',
  };
}
