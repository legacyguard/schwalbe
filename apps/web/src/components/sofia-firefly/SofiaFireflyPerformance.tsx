import { useState, useCallback, useRef, useEffect } from 'react';

export interface PerformanceConfig {
  enableMonitoring: boolean;
  debounceDelay: number;
  memoryThreshold: number;
  frameRateTarget: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  frameRate: number;
  animationCount: number;
}

export const useSofiaPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    animationCount: 0,
  });

  const [config] = useState<PerformanceConfig>({
    enableMonitoring: true,
    debounceDelay: 100,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    frameRateTarget: 60,
  });

  const animationRefs = useRef<Set<any>>(new Set());
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  // Performance monitoring
  const monitorPerformance = useCallback((operation: string, startTime: number) => {
    if (!config.enableMonitoring) return;

    const duration = performance.now() - startTime;

    setMetrics(prev => ({
      ...prev,
      interactionTime: duration,
    }));

    // Log performance issues
    if (duration > 100) {
      console.warn(`SofiaFirefly: Slow ${operation} (${duration.toFixed(2)}ms)`);
    }
  }, [config.enableMonitoring]);

  // Memory monitoring
  const monitorMemory = useCallback(() => {
    if (!config.enableMonitoring || !(performance as any).memory) return;

    const memoryUsage = (performance as any).memory.usedJSHeapSize;

    setMetrics(prev => ({
      ...prev,
      memoryUsage,
    }));

    if (memoryUsage > config.memoryThreshold) {
      console.warn(`SofiaFirefly: High memory usage (${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
    }
  }, [config.enableMonitoring, config.memoryThreshold]);

  // Frame rate monitoring
  const monitorFrameRate = useCallback(() => {
    if (!config.enableMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);

        setMetrics(prev => ({
          ...prev,
          frameRate: fps,
        }));

        if (fps < config.frameRateTarget * 0.8) {
          console.warn(`SofiaFirefly: Low frame rate (${fps.toFixed(1)} FPS)`);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    const animationId = requestAnimationFrame(measureFrameRate);
    animationRefs.current.add(animationId);

    return () => {
      cancelAnimationFrame(animationId);
      animationRefs.current.delete(animationId);
    };
  }, [config.enableMonitoring, config.frameRateTarget]);

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = config.debounceDelay
  ): T => {
    let timeoutId: NodeJS.Timeout;

    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
      timeoutRefs.current.add(timeoutId);
    }) as T;
  }, [config.debounceDelay]);

  // Cleanup functions
  const cleanupAnimation = useCallback((animation: any) => {
    if (animation && typeof animation.stop === 'function') {
      animation.stop();
    }
    if (typeof animation === 'number') {
      cancelAnimationFrame(animation);
      animationRefs.current.delete(animation);
    }
  }, []);

  const cleanupTimeout = useCallback((timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    timeoutRefs.current.delete(timeout);
  }, []);

  const cleanupInterval = useCallback((interval: NodeJS.Timeout) => {
    clearInterval(interval);
    intervalRefs.current.delete(interval);
  }, []);

  // Global cleanup
  const cleanup = useCallback(() => {
    // Clean up animations
    animationRefs.current.forEach(animation => {
      if (typeof animation === 'number') {
        cancelAnimationFrame(animation);
      }
    });
    animationRefs.current.clear();

    // Clean up timeouts
    timeoutRefs.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutRefs.current.clear();

    // Clean up intervals
    intervalRefs.current.forEach(interval => {
      clearInterval(interval);
    });
    intervalRefs.current.clear();
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (!config.enableMonitoring) return;

    const stopFrameRateMonitoring = monitorFrameRate();

    // Memory monitoring interval
    const memoryInterval = setInterval(monitorMemory, 5000);
    intervalRefs.current.add(memoryInterval);

    return () => {
      stopFrameRateMonitoring?.();
      clearInterval(memoryInterval);
      intervalRefs.current.delete(memoryInterval);
    };
  }, [config.enableMonitoring, monitorFrameRate, monitorMemory]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    metrics,
    config,
    monitorPerformance,
    debounce,
    cleanupAnimation,
    cleanupTimeout,
    cleanupInterval,
    cleanup,
  };
};

// Performance optimization hooks
export const useLazyAnimation = (animationFactory: () => any, dependencies: any[] = []) => {
  const [animation, setAnimation] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      const newAnimation = animationFactory();
      setAnimation(newAnimation);
      setIsLoaded(true);
    }
  }, dependencies);

  return { animation, isLoaded };
};

export const useOptimizedRender = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;

    // Warn about excessive renders
    if (renderCount.current > 10 && timeSinceLastRender < 100) {
      console.warn('SofiaFirefly: Excessive renders detected');
    }

    lastRenderTime.current = currentTime;
  });

  return renderCount.current;
};

// Performance presets
export const PerformancePresets = {
  high: {
    enableMonitoring: true,
    debounceDelay: 50,
    memoryThreshold: 100 * 1024 * 1024, // 100MB
    frameRateTarget: 60,
  },
  medium: {
    enableMonitoring: true,
    debounceDelay: 100,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    frameRateTarget: 45,
  },
  low: {
    enableMonitoring: false,
    debounceDelay: 200,
    memoryThreshold: 25 * 1024 * 1024, // 25MB
    frameRateTarget: 30,
  },
} as const;

// Utility functions for performance analysis
export const getPerformanceInsights = (metrics: PerformanceMetrics) => {
  const insights = {
    isPerformant: metrics.frameRate >= 50 && metrics.interactionTime < 100,
    memoryPressure: metrics.memoryUsage > 50 * 1024 * 1024,
    slowInteractions: metrics.interactionTime > 200,
    recommendations: [] as string[],
  };

  if (metrics.frameRate < 50) {
    insights.recommendations.push('Consider reducing animation complexity');
  }

  if (metrics.interactionTime > 200) {
    insights.recommendations.push('Optimize interaction handlers');
  }

  if (metrics.memoryUsage > 50 * 1024 * 1024) {
    insights.recommendations.push('Consider reducing component state');
  }

  return insights;
};