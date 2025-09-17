/**
 * Mobile Optimization Utilities
 * Responsive design helpers, touch optimizations, and mobile-specific performance enhancements
 */

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { type Breakpoint, breakpoints } from './mobile-optimization-constants';

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
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    return undefined;
  }, []);

  const getCurrentBreakpoint = (): Breakpoint | null => {
    const { width } = windowSize;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return null; // Below sm breakpoint
  };

  const current = getCurrentBreakpoint();

  return {
    current,
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

// Touch gesture detection
export function useTouchGestures(elementRef: React.RefObject<HTMLElement>) {
  const [gesture, setGesture] = useState<{
    direction?: 'down' | 'left' | 'right' | 'up';
    distance?: number;
    type: 'pinch' | 'swipe' | 'tap' | null;
  }>({ type: null });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startTouch: null | Touch = null;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startTouch = e.touches[0];
        startTime = Date.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch || e.changedTouches.length !== 1) return;

      const endTouch = e.changedTouches[0];
      const endTime = Date.now();
      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = endTime - startTime;

      if (duration < 300 && distance < 10) {
        setGesture({ type: 'tap' });
      } else if (distance > 50) {
        let direction: 'down' | 'left' | 'right' | 'up';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        setGesture({ type: 'swipe', direction, distance });
      }

      // Reset after a short delay
      setTimeout(() => setGesture({ type: null }), 100);
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

// Mobile-optimized component props generator
export const mobileOptimized = {
  // Button optimization for touch
  button: (size: 'lg' | 'md' | 'sm' = 'md') => ({
    className: cn(
      'touch-manipulation select-none',
      size === 'sm' && 'min-h-[36px] min-w-[36px]',
      size === 'md' && 'min-h-[44px] min-w-[44px]',
      size === 'lg' && 'min-h-[56px] min-w-[56px]'
    ),
    style: {
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none' as any,
      WebkitUserSelect: 'none' as any,
    },
  }),

  // Input optimization for mobile
  input: () => ({
    className: 'touch-manipulation',
    autoComplete: 'off',
    autoCapitalize: 'none',
    autoCorrect: 'off',
    spellCheck: false,
  }),

  // Card optimization for mobile interactions
  card: (interactive: boolean = false) => ({
    className: cn(
      interactive &&
        'touch-manipulation cursor-pointer active:scale-[0.98] transition-transform'
    ),
    style: interactive
      ? {
          WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
        }
      : undefined,
  }),

  // List optimization for mobile scrolling
  list: () => ({
    className: 'overscroll-y-contain',
    style: {
      WebkitOverflowScrolling: 'touch',
    },
  }),
};

// Responsive grid system
export function useResponsiveGrid(defaultCols: number = 1) {
  const { isSmall, isMedium, isLarge } = useBreakpoint();

  const getColumns = useCallback(() => {
    if (isSmall) return 1;
    if (isMedium) return Math.min(2, defaultCols);
    if (isLarge) return Math.min(3, defaultCols);
    return defaultCols;
  }, [isSmall, isMedium, isLarge, defaultCols]);

  return {
    columns: getColumns(),
    gridClassName: cn(
      'grid gap-4',
      `grid-cols-1`,
      `md:grid-cols-${Math.min(2, defaultCols)}`,
      `lg:grid-cols-${Math.min(3, defaultCols)}`,
      `xl:grid-cols-${defaultCols}`
    ),
  };
}

// Mobile-specific viewport utilities
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation:
      typeof screen !== 'undefined' ? screen.orientation?.angle || 0 : 0,
  });

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: screen.orientation?.angle || 0,
      });
    }

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return {
    ...viewport,
    isLandscape: viewport.width > viewport.height,
    isPortrait: viewport.width <= viewport.height,
    aspectRatio: viewport.width / viewport.height,
  };
}

// Performance monitoring for mobile
export function useMobilePerformance() {
  const [performance, setPerformance] = useState({
    renderTime: 0,
    memoryUsage: 0,
    connectionType: 'unknown',
  });

  useEffect(() => {
    // Performance monitoring
    if ('performance' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const renderTime = entries.reduce(
          (max, entry) => Math.max(max, entry.duration),
          0
        );
    return undefined;
        setPerformance(prev => ({ ...prev, renderTime }));
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => observer.disconnect();
    }

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      const memoryInfo = (
        performance as {
          memory?: { jsHeapSizeLimit: number; usedJSHeapSize: number };
        }
      ).memory;
      if (memoryInfo) {
        setPerformance(prev => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit,
        }));
      }
    }

    // Connection type detection
    if ('connection' in navigator) {
      const connection = (
        navigator as { connection?: { effectiveType?: string } }
      ).connection;
      setPerformance(prev => ({
        ...prev,
        connectionType: connection?.effectiveType || 'unknown',
      }));
    }
  }, []);

  return performance;
}

// Adaptive loading based on device capabilities
export function useAdaptiveLoading() {
  const performance = useMobilePerformance();
  const { isSmall } = useBreakpoint();

  const shouldReduceAnimations =
    performance.renderTime > 100 || performance.memoryUsage > 0.8;
  const shouldLazyLoad =
    performance.connectionType === '2g' ||
    performance.connectionType === 'slow-2g';
  const shouldReduceImages = isSmall && shouldLazyLoad;

  return {
    shouldReduceAnimations,
    shouldLazyLoad,
    shouldReduceImages,
    adaptiveImageQuality: shouldReduceImages ? 'low' : 'high',
    adaptiveAnimationDuration: shouldReduceAnimations ? 0.1 : 0.3,
  };
}

// Mobile-specific analytics tracking
export const mobileAnalytics = {
  trackTouch: (element: string, gesture: string) => {
    // This would integrate with your analytics service
    console.log(`Mobile Touch: ${element} - ${gesture}`);
  },

  trackScreenOrientation: (orientation: 'landscape' | 'portrait') => {
    console.log(`Screen Orientation: ${orientation}`);
  },

  trackPerformance: (metric: string, value: number) => {
    console.log(`Mobile Performance: ${metric} = ${value}`);
  },
};

// Utility for mobile-optimized component rendering
export function MobileOptimizedComponent<T extends Record<string, any>>({
  MobileComponent,
  DesktopComponent,
  ...props
}: {
  DesktopComponent: React.ComponentType<T>;
  MobileComponent: React.ComponentType<T>;
} & T) {
  const { isSmall } = useBreakpoint();

  return isSmall ? (
    <MobileComponent {...(props as unknown as T)} />
  ) : (
    <DesktopComponent {...(props as unknown as T)} />
  );
}

// Backward compatibility wrapper
/**
 * @deprecated Use MobileOptimizedComponent instead. This function will be removed in a future version.
 *
 * Example migration:
 * // Old API
 * renderMobileOptimized(MobileComp, DesktopComp, props)
 *
 * // New API
 * <MobileOptimizedComponent MobileComponent={MobileComp} DesktopComponent={DesktopComp} {...props} />
 */
export function renderMobileOptimized<T extends Record<string, any>>(
  MobileComponent: React.ComponentType<T>,
  DesktopComponent: React.ComponentType<T>,
  props: T
) {
  console.warn(
    'renderMobileOptimized is deprecated. Use MobileOptimizedComponent instead. ' +
      'See the function documentation for migration details.'
  );
  return (
    <MobileOptimizedComponent
      MobileComponent={MobileComponent}
      DesktopComponent={DesktopComponent}
      {...props}
    />
  );
}
