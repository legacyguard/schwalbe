import { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { SofiaFireflySVG } from './SofiaFireflySVG';

export interface PerformanceConfig {
  enableMemoization: boolean;
  lazyLoadAnimations: boolean;
  debounceInteractions: number;
  maxAnimationFPS: number;
}

const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableMemoization: true,
  lazyLoadAnimations: true,
  debounceInteractions: 16, // ~60fps
  maxAnimationFPS: 60,
};

export const useSofiaPerformance = (config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG) => {
  const performanceConfig = useMemo(() => ({
    ...DEFAULT_PERFORMANCE_CONFIG,
    ...config,
  }), [config]);

  // Debounced interaction handler
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Throttled animation updates
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Performance monitoring
  const monitorPerformance = useCallback((operation: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (__DEV__ && duration > 16) { // Log if slower than 60fps
      console.warn(`SofiaFirefly: ${operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, []);

  // Memory cleanup helpers
  const cleanupAnimation = useCallback((animation: any) => {
    if (animation && typeof animation.stop === 'function') {
      animation.stop();
    }
  }, []);

  const cleanupTimeout = useCallback((timeout: NodeJS.Timeout | null) => {
    if (timeout) {
      clearTimeout(timeout);
    }
  }, []);

  return {
    performanceConfig,
    debounce,
    throttle,
    monitorPerformance,
    cleanupAnimation,
    cleanupTimeout,
  };
};

// Memoized components for performance (commented out due to TypeScript issues)
// export const MemoizedSofiaFireflySVG = memo(SofiaFireflySVG);
// MemoizedSofiaFireflySVG.displayName = 'MemoizedSofiaFireflySVG';

// Performance-optimized animation configurations
export const getOptimizedAnimationConfig = (personality: string, context: string) => {
  return useMemo(() => {
    const baseFPS = 60;
    const targetFPS = Math.min(baseFPS, 30); // Cap at 30fps for better performance
    const frameDuration = 1000 / targetFPS;

    const configs = {
      empathetic: {
        floatDuration: Math.max(3000, frameDuration * 180), // 3 seconds minimum
        pulseDuration: Math.max(2000, frameDuration * 120),
        wingSpeed: Math.max(150, frameDuration * 9),
        touchDuration: Math.max(200, frameDuration * 12),
      },
      pragmatic: {
        floatDuration: Math.max(2500, frameDuration * 150),
        pulseDuration: Math.max(1500, frameDuration * 90),
        wingSpeed: Math.max(120, frameDuration * 7),
        touchDuration: Math.max(150, frameDuration * 9),
      },
      celebratory: {
        floatDuration: Math.max(1800, frameDuration * 108),
        pulseDuration: Math.max(1000, frameDuration * 60),
        wingSpeed: Math.max(80, frameDuration * 5),
        touchDuration: Math.max(120, frameDuration * 7),
      },
      comforting: {
        floatDuration: Math.max(4000, frameDuration * 240),
        pulseDuration: Math.max(2500, frameDuration * 150),
        wingSpeed: Math.max(200, frameDuration * 12),
        touchDuration: Math.max(250, frameDuration * 15),
      },
    };

    return configs[personality as keyof typeof configs] || configs.empathetic;
  }, [personality, context]);
};

// Lazy loading for animations
export const useLazyAnimation = (animationFactory: () => any, shouldLoad: boolean) => {
  const [animation, setAnimation] = useState<any>(null);

  useEffect(() => {
    if (shouldLoad && !animation) {
      InteractionManager.runAfterInteractions(() => {
        const startTime = performance.now();
        const newAnimation = animationFactory();
        setAnimation(newAnimation);

        // Monitor loading performance
        if (__DEV__) {
          const loadTime = performance.now() - startTime;
          console.log(`SofiaFirefly: Animation loaded in ${loadTime.toFixed(2)}ms`);
        }
      });
    }
  }, [shouldLoad, animation, animationFactory]);

  return animation;
};

export default {
  useSofiaPerformance,
  getOptimizedAnimationConfig,
  useLazyAnimation,
};