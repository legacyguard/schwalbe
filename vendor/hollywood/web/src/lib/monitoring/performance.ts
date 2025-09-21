
/**
 * Performance Monitoring with Web Vitals
 * Phase 5A: Production Operations & DevOps
 */

// Web Vitals types (simplified implementation)
interface WebVitalsMetric {
  delta: number;
  entries: PerformanceEntry[];
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  navigationType: 'back-forward' | 'back-forward-cache' | 'navigate' | 'reload';
  rating: 'good' | 'needs-improvement' | 'poor';
  value: number;
}

interface PerformanceConfig {
  enabled: boolean;
  reportInterval: number; // in milliseconds
  sampleRate: number;
  thresholds: {
    cls: { good: number; poor: number };
    fcp: { good: number; poor: number };
    fid: { good: number; poor: number };
    lcp: { good: number; poor: number };
    ttfb: { good: number; poor: number };
  };
}

interface RoutePerformance {
  bundleSize?: number;
  loadTime: number;
  resources: number;
  route: string;
  timestamp: number;
}

interface UserTimingMark {
  duration?: number;
  metadata?: Record<string, any>;
  name: string;
  startTime: number;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private routePerformance: RoutePerformance[] = [];
  private userTimings: UserTimingMark[] = [];
  private ___observer?: PerformanceObserver;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (!this.config.enabled) return;

    console.info('📈 Performance monitoring initialized');

    this.setupWebVitalsTracking();
    this.setupNavigationTracking();
    this.setupResourceTracking();
    this.startReporting();
  }

  /**
   * Setup Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    // Track Core Web Vitals
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackFCP();
    this.trackTTFB();
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;

        const metric: WebVitalsMetric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.getRating('lcp', lastEntry.startTime),
          delta: lastEntry.startTime,
          entries: [lastEntry],
          id: this.generateMetricId(),
          navigationType: this.getNavigationType(),
        };

        this.metrics.set('LCP', metric);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP tracking not supported:', error);
    }
  }

  /**
   * Track First Input Delay (FID)
   */
  private trackFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(
          (entry: PerformanceEntry & { processingStart?: number }) => {
            const processingTime = entry.processingStart || entry.startTime;
            const metric: WebVitalsMetric = {
              name: 'FID',
              value: processingTime - entry.startTime,
              rating: this.getRating('fid', processingTime - entry.startTime),
              delta: processingTime - entry.startTime,
              entries: [entry],
              id: this.generateMetricId(),
              navigationType: this.getNavigationType(),
            };

            this.metrics.set('FID', metric);
          }
        );
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID tracking not supported:', error);
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  private trackCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(
          (
            entry: PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            }
          ) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value || 0;
              clsEntries.push(entry);
            }
          }
        );

        const metric: WebVitalsMetric = {
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('cls', clsValue),
          delta: clsValue,
          entries: clsEntries,
          id: this.generateMetricId(),
          navigationType: this.getNavigationType(),
        };

        this.metrics.set('CLS', metric);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS tracking not supported:', error);
    }
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  private trackFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          entry => entry.name === 'first-contentful-paint'
        );

        if (fcpEntry) {
          const metric: WebVitalsMetric = {
            name: 'FCP',
            value: fcpEntry.startTime,
            rating: this.getRating('fcp', fcpEntry.startTime),
            delta: fcpEntry.startTime,
            entries: [fcpEntry],
            id: this.generateMetricId(),
            navigationType: this.getNavigationType(),
          };

          this.metrics.set('FCP', metric);
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP tracking not supported:', error);
    }
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  private trackTTFB(): void {
    const navigationEntries = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];

    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      const ttfb = nav.responseStart - nav.requestStart;

      const metric: WebVitalsMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: this.getRating('ttfb', ttfb),
        delta: ttfb,
        entries: [nav],
        id: this.generateMetricId(),
        navigationType: this.getNavigationType(),
      };

      this.metrics.set('TTFB', metric);
    }
  }

  /**
   * Setup navigation timing tracking
   */
  private setupNavigationTracking(): void {
    // Track route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackRouteChange = (route: string) => {
      const startTime = performance.now();

      // Wait for next frame to measure load time
      requestAnimationFrame(() => {
        const loadTime = performance.now() - startTime;
        const resourceCount = performance.getEntriesByType('resource').length;

        const routeMetric: RoutePerformance = {
          route,
          loadTime,
          timestamp: Date.now(),
          resources: resourceCount,
        };

        this.routePerformance.push(routeMetric);

        // Keep only last 50 route metrics
        if (this.routePerformance.length > 50) {
          this.routePerformance.shift();
        }
      });
    };

    history.pushState = function (
      state: any,
      title: string,
      url?: null | string | URL
    ) {
      const result = originalPushState.call(history, state, title, url);
      if (url) trackRouteChange(url.toString());
      return result;
    };

    history.replaceState = function (
      state: any,
      title: string,
      url?: null | string | URL
    ) {
      const result = originalReplaceState.call(history, state, title, url);
      if (url) trackRouteChange(url.toString());
      return result;
    };

    // Track initial page load
    window.addEventListener('load', () => {
      trackRouteChange(window.location.pathname);
    });
  }

  /**
   * Setup resource timing tracking
   */
  private setupResourceTracking(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach((entry: PerformanceEntry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          // Track slow resources (> 1 second)
          if (resourceEntry.duration > 1000) {
            console.warn('🐌 Slow resource detected:', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource tracking not supported:', error);
    }
  }

  /**
   * Mark custom performance timing
   */
  mark(name: string, metadata?: Record<string, any>): void {
    const timing: UserTimingMark = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.userTimings.push(timing);

    // Also use Performance API if available
    if ('mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const startTiming = this.userTimings.find(t => t.name === startMark);
    const endTime = endMark
      ? this.userTimings.find(t => t.name === endMark)?.startTime ||
        performance.now()
      : performance.now();

    if (startTiming) {
      const duration = endTime - startTiming.startTime;
      startTiming.duration = duration;

      // Use Performance API if available
      if ('measure' in performance && 'mark' in performance) {
        try {
          if (endMark) {
            performance.measure(name, startMark, endMark);
          } else {
            performance.measure(name, startMark);
          }
        } catch (error) {
          console.warn('Performance measure failed:', error);
        }
      }

      return duration;
    }

    return 0;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Record<string, any> {
    return {
      webVitals: Object.fromEntries(this.metrics),
      routes: this.routePerformance.slice(-10), // Last 10 routes
      userTimings: this.userTimings.slice(-20), // Last 20 timings
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo(),
    };
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): null | {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } {
    if ('memory' in performance) {
      const memory = (
        performance as Performance & {
          memory: {
            jsHeapSizeLimit: number;
            totalJSHeapSize: number;
            usedJSHeapSize: number;
          };
        }
      ).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Get connection information
   */
  private getConnectionInfo(): null | {
    downlink: number;
    effectiveType: string;
    rtt: number;
    saveData: boolean;
  } {
    if ('connection' in navigator) {
      const connection = (
        navigator as Navigator & {
          connection: {
            downlink: number;
            effectiveType: string;
            rtt: number;
            saveData: boolean;
          };
        }
      ).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  }

  /**
   * Get rating for a metric value
   */
  private getRating(
    metricName: keyof PerformanceConfig['thresholds'],
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.config.thresholds[metricName];

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get navigation type
   */
  private getNavigationType(): WebVitalsMetric['navigationType'] {
    const nav = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (nav) {
      switch (nav.type) {
        case 'reload':
          return 'reload';
        case 'back_forward':
          return 'back-forward';
        default:
          return 'navigate';
      }
    }

    return 'navigate';
  }

  /**
   * Start performance reporting
   */
  private startReporting(): void {
    setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics(true);
    });
  }

  /**
   * Report metrics to monitoring service
   */
  private reportMetrics(isUnload = false): void {
    if (Math.random() > this.config.sampleRate) return;

    const metrics = this.getMetrics();

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.info('📊 Performance metrics:', metrics);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricsToService(metrics, isUnload);
    }
  }

  /**
   * Send metrics to monitoring service
   */
  private sendMetricsToService(
    metrics: Record<string, unknown>,
    isUnload = false
  ): void {
    const payload = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics,
      isUnload,
    };

    // Use sendBeacon for unload events
    if (isUnload && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(payload));
    } else {
      // For now, store in localStorage
      const storedMetrics = JSON.parse(
        localStorage.getItem('legacyguard-metrics') || '[]'
      );
      storedMetrics.push(payload);

      // Keep only last 50 metric reports
      if (storedMetrics.length > 50) {
        storedMetrics.shift();
      }

      localStorage.setItem(
        'legacyguard-metrics',
        JSON.stringify(storedMetrics)
      );
    }
  }
}

// Create and export performance monitor
export const performanceMonitor = new PerformanceMonitor({
  enabled: true,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  reportInterval: 30000, // 30 seconds
  thresholds: {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
  },
});

// Initialize performance monitoring
performanceMonitor.init();

// Export convenience functions
export const markPerformance = (
  name: string,
  metadata?: Record<string, any>
) => {
  performanceMonitor.mark(name, metadata);
};

export const measurePerformance = (
  name: string,
  startMark: string,
  endMark?: string
) => {
  return performanceMonitor.measure(name, startMark, endMark);
};

export const getPerformanceMetrics = () => {
  return performanceMonitor.getMetrics();
};
