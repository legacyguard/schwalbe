/**
 * Real User Monitoring (RUM) System
 * Tracks actual user experience metrics in production
 */

interface RUMMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  jsHeapSize?: number;
  
  // User context
  userId?: string;
  sessionId: string;
  pageUrl: string;
  timestamp: number;
  
  // Device & Network
  deviceMemory?: number;
  connectionType?: string;
  isMobile: boolean;
  
  // Error tracking
  errorCount: number;
  warningCount: number;
}

interface RUMConfig {
  enabled: boolean;
  sampleRate: number; // Percentage of users to track (0-100)
  endpoint: string;
  batchSize: number;
  flushInterval: number; // ms
}

class RUMMonitor {
  private config: RUMConfig;
  private metrics: RUMMetrics[] = [];
  private sessionId: string;
  private userId?: string;
  private errorCount = 0;
  private warningCount = 0;
  private observer?: PerformanceObserver;
  private isEnabled = false;

  constructor(config: RUMConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.isEnabled = config.enabled && Math.random() * 100 < config.sampleRate;
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    // Core Web Vitals monitoring
    this.observeWebVitals();
    
    // Resource timing monitoring
    this.observeResourceTiming();
    
    // Error monitoring
    this.setupErrorTracking();
    
    // Page lifecycle monitoring
    this.setupPageLifecycleMonitoring();
    
    // Periodic batch sending
    this.setupBatchSending();
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric({ lcp: lastEntry.startTime });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric({ fid: entry.processingStart - entry.startTime });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID monitoring not supported');
      }

      // Layout Shift (CLS)
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric({ cls: clsValue });
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS monitoring not supported');
      }
    }

    // First Contentful Paint (FCP)
    window.addEventListener('load', () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric({ fcp: fcpEntry.startTime });
      }
    });

    // Time to First Byte (TTFB)
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        this.recordMetric({ ttfb: navigationEntry.responseStart });
      }
    });
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'resource') {
              this.recordMetric({
                resourceLoadTime: entry.duration,
                pageUrl: entry.name,
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource timing monitoring not supported');
      }
    }
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.errorCount++;
      this.recordMetric({ errorCount: this.errorCount });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      this.recordMetric({ errorCount: this.errorCount });
    });

    // Console warnings tracking
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.warningCount++;
      this.recordMetric({ warningCount: this.warningCount });
      originalWarn.apply(console, args);
    };
  }

  private setupPageLifecycleMonitoring(): void {
    // Page load time
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        this.recordMetric({
          pageLoadTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart,
        });
      }
    });

    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          this.recordMetric({
            jsHeapSize: memoryInfo.usedJSHeapSize,
            deviceMemory: (navigator as any).deviceMemory,
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private setupBatchSending(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);

    // Send on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }

  public recordMetric(metric: Partial<RUMMetrics>): void {
    if (!this.isEnabled) return;

    const fullMetric: RUMMetrics = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      timestamp: Date.now(),
      isMobile: window.innerWidth < 768,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      ...metric,
    };

    this.metrics.push(fullMetric);

    // Flush if batch size reached
    if (this.metrics.length >= this.config.batchSize) {
      this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      // Send to analytics endpoint
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          userId: this.userId,
        }),
        keepalive: true, // Continue even if page is unloading
      });
    } catch (error) {
      console.warn('Failed to send RUM metrics:', error);
      // Re-add metrics to queue for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getSessionMetrics(): RUMMetrics[] {
    return [...this.metrics];
  }

  public destroy(): void {
    this.flushMetrics();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize RUM monitor
export const rumMonitor = new RUMMonitor({
  enabled: import.meta.env.PROD, // Only enable in production
  sampleRate: 10, // Track 10% of users
  endpoint: '/api/analytics/rum',
  batchSize: 20,
  flushInterval: 30000, // 30 seconds
});

// Export for use in components
export default rumMonitor;

// Helper functions for manual metric recording
export const recordCustomMetric = (metric: Partial<RUMMetrics>): void => {
  rumMonitor.recordMetric(metric);
};

export const setRUMUserId = (userId: string): void => {
  rumMonitor.setUserId(userId);
};