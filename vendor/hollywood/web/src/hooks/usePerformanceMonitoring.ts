
import { useCallback, useEffect, useState } from 'react';

interface PerformanceMetrics {
  CLS: null | number; // Cumulative Layout Shift
  FCP: null | number; // First Contentful Paint
  FID: null | number; // First Input Delay
  LCP: null | number; // Largest Contentful Paint
  TTFB: null | number; // Time to First Byte
}

interface PerformanceInsights {
  recommendations: string[];
  score: 'good' | 'needs-improvement' | 'poor';
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  });

  const [insights, setInsights] = useState<PerformanceInsights>({
    score: 'good',
    recommendations: [],
  });

  // Measure LCP (Largest Contentful Paint)
  const measureLCP = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, LCP: lastEntry.startTime }));
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // Measure FID (First Input Delay)
  const measureFID = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'first-input') {
            setMetrics(prev => ({
              ...prev,
              FID: (entry as any).processingStart - entry.startTime,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // Measure CLS (Cumulative Layout Shift)
  const measureCLS = useCallback(() => {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics(prev => ({ ...prev, CLS: clsValue }));
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // Measure FCP (First Contentful Paint)
  const measureFCP = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          setMetrics(prev => ({ ...prev, FCP: firstEntry.startTime }));
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // Measure TTFB (Time to First Byte)
  const measureTTFB = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              TTFB: navEntry.responseStart - navEntry.requestStart,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      return () => observer.disconnect();
    }
    return undefined;
  }, []);

  // Generate performance insights and recommendations
  const generateInsights = useCallback((currentMetrics: PerformanceMetrics) => {
    const recommendations: string[] = [];
    let score: 'good' | 'needs-improvement' | 'poor' = 'good';

    // LCP analysis
    if (currentMetrics.LCP !== null) {
      if (currentMetrics.LCP > 4000) {
        score = 'poor';
        recommendations.push(
          'LCP is too slow. Optimize hero images and critical content loading.'
        );
      } else if (currentMetrics.LCP > 2500) {
        score = score === 'good' ? 'needs-improvement' : score;
        recommendations.push(
          'LCP could be improved. Consider image optimization and preloading.'
        );
      }
    }

    // FID analysis
    if (currentMetrics.FID !== null) {
      if (currentMetrics.FID > 300) {
        score = 'poor';
        recommendations.push(
          'FID is too high. Reduce JavaScript execution time and optimize event handlers.'
        );
      } else if (currentMetrics.FID > 100) {
        score = score === 'good' ? 'needs-improvement' : score;
        recommendations.push(
          'FID could be improved. Consider code splitting and lazy loading.'
        );
      }
    }

    // CLS analysis
    if (currentMetrics.CLS !== null) {
      if (currentMetrics.CLS > 0.25) {
        score = 'poor';
        recommendations.push(
          'CLS is too high. Fix layout shifts and reserve space for dynamic content.'
        );
      } else if (currentMetrics.CLS > 0.1) {
        score = score === 'good' ? 'needs-improvement' : score;
        recommendations.push(
          'CLS could be improved. Ensure stable layouts and avoid content jumping.'
        );
      }
    }

    // FCP analysis
    if (currentMetrics.FCP !== null) {
      if (currentMetrics.FCP > 3000) {
        score = 'poor';
        recommendations.push(
          'FCP is too slow. Optimize critical rendering path and reduce blocking resources.'
        );
      } else if (currentMetrics.FCP > 1800) {
        score = score === 'good' ? 'needs-improvement' : score;
        recommendations.push(
          'FCP could be improved. Minimize render-blocking resources.'
        );
      }
    }

    // TTFB analysis
    if (currentMetrics.TTFB !== null) {
      if (currentMetrics.TTFB > 800) {
        score = 'poor';
        recommendations.push(
          'TTFB is too slow. Optimize server response time and consider CDN.'
        );
      } else if (currentMetrics.TTFB > 600) {
        score = score === 'good' ? 'needs-improvement' : score;
        recommendations.push(
          'TTFB could be improved. Optimize server-side performance.'
        );
      }
    }

    setInsights({ score, recommendations });
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    const cleanupLCP = measureLCP();
    const cleanupFID = measureFID();
    const cleanupCLS = measureCLS();
    const cleanupFCP = measureFCP();
    const cleanupTTFB = measureTTFB();

    return () => {
      cleanupLCP?.();
      cleanupFID?.();
      cleanupCLS?.();
      cleanupFCP?.();
      cleanupTTFB?.();
    };
  }, [measureLCP, measureFID, measureCLS, measureFCP, measureTTFB]);

  // Generate insights when metrics change
  useEffect(() => {
    if (Object.values(metrics).some(metric => metric !== null)) {
      generateInsights(metrics);
    }
  }, [metrics, generateInsights]);

  // Log performance metrics to console in development
  useEffect(() => {
    if (
      import.meta.env.DEV &&
      Object.values(metrics).some(metric => metric !== null)
    ) {
      // console.log('🚀 Performance Metrics:', metrics);
      // console.log('💡 Performance Insights:', insights);
    }
  }, [metrics, insights]);

  return {
    metrics,
    insights,
    // Utility functions for manual measurements
    measureCustomMetric: (name: string, _value: number) => {
      if ('performance' in window) {
        performance.mark(`${name}-start`);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    },
    // Get performance score for display
    getPerformanceScore: () => {
      const scores = {
        good: 90,
        'needs-improvement': 70,
        poor: 50,
      };
      return scores[insights.score];
    },
  };
};
