
import { supabase } from '../supabase/client';

export interface SystemHealthCheck {
  errorRate?: number;
  lastError?: string;
  metadata?: Record<string, any>;
  responseTime?: number;
  service: string;
  status: 'degraded' | 'down' | 'healthy';
}

export interface AnalyticsEvent {
  deviceInfo?: {
    browser?: string;
    isMobile?: boolean;
    platform?: string;
    version?: string;
  };
  eventData?: Record<string, any>;
  eventType: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  timestamp: Date;
  unit: 'bytes' | 'count' | 'ms' | 'percentage';
  value: number;
}

class MonitoringService {
  private sessionId: string;
  private performanceBuffer: PerformanceMetric[] = [];
  private flushInterval: null | ReturnType<typeof setInterval> = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startPerformanceMonitoring();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start monitoring performance metrics
   */
  private startPerformanceMonitoring(): void {
    // Flush performance buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushPerformanceBuffer();
    }, 30000);

    // Monitor page performance
    if (typeof window !== 'undefined' && window.performance) {
      this.captureWebVitals();
    }
  }

  /**
   * Capture Web Vitals metrics
   */
  private captureWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(
      entry => entry.name === 'first-contentful-paint'
    );
    if (fcp) {
      this.recordPerformance('FCP', fcp.startTime, 'ms');
    }

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordPerformance('LCP', lastEntry.startTime, 'ms');
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordPerformance(
          'FID',
          entry.processingStart - entry.startTime,
          'ms'
        );
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordPerformance('CLS', clsValue, 'count');
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Track analytics event
   */
  async trackEvent(
    eventType: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const deviceInfo = this.getDeviceInfo();

      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_type: eventType,
        event_data: eventData,
        session_id: this.sessionId,
        device_info: deviceInfo,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Check system health
   */
  async checkHealth(service: string): Promise<SystemHealthCheck> {
    const startTime = Date.now();
    let status: 'degraded' | 'down' | 'healthy' = 'healthy';
    let lastError: string | undefined;
    let errorRate = 0;

    try {
      // Perform health check based on service
      switch (service) {
        case 'database':
          await this.checkDatabaseHealth();
          break;
        case 'storage':
          await this.checkStorageHealth();
          break;
        case 'auth':
          await this.checkAuthHealth();
          break;
        case 'stripe':
          await this.checkStripeHealth();
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (error: any) {
      status = 'down';
      lastError = error.message;
      errorRate = 100;
    }

    const responseTime = Date.now() - startTime;

    // Determine if service is degraded based on response time
    if (responseTime > 5000 && status === 'healthy') {
      status = 'degraded';
    }

    // Log health check result
    await this.logHealthCheck({
      service,
      status,
      responseTime,
      errorRate,
      lastError,
    });

    return {
      service,
      status,
      responseTime,
      errorRate,
      lastError,
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<void> {
    const { error } = await supabase
      .from('system_health')
      .select('id')
      .limit(1);

    if (error) throw error;
  }

  /**
   * Check storage health
   */
  private async checkStorageHealth(): Promise<void> {
    const { error } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });

    if (error) throw error;
  }

  /**
   * Check auth health
   */
  private async checkAuthHealth(): Promise<void> {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
  }

  /**
   * Check Stripe health
   */
  private async checkStripeHealth(): Promise<void> {
    // This would normally check Stripe API status
    // For now, we'll just check if we can reach the endpoint
    const response = await fetch('https://api.stripe.com/v1/health', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Stripe API is not responding');
    }
  }

  /**
   * Log health check result
   */
  private async logHealthCheck(check: SystemHealthCheck): Promise<void> {
    try {
      await supabase.from('system_health').insert({
        service_name: check.service,
        status: check.status,
        response_time_ms: check.responseTime,
        error_rate: check.errorRate,
        last_error: check.lastError,
        metadata: check.metadata,
      });
    } catch (error) {
      console.error('Error logging health check:', error);
    }
  }

  /**
   * Record performance metric
   */
  recordPerformance(
    name: string,
    value: number,
    unit: 'bytes' | 'count' | 'ms' | 'percentage'
  ): void {
    this.performanceBuffer.push({
      name,
      value,
      unit,
      timestamp: new Date(),
    });

    // Flush if buffer is getting large
    if (this.performanceBuffer.length >= 50) {
      this.flushPerformanceBuffer();
    }
  }

  /**
   * Flush performance buffer to database
   */
  private async flushPerformanceBuffer(): Promise<void> {
    if (this.performanceBuffer.length === 0) return;

    const metrics = [...this.performanceBuffer];
    this.performanceBuffer = [];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Group metrics by type
      const metricsData = metrics.reduce(
        (acc, metric) => {
          if (!acc[metric.name]) {
            acc[metric.name] = [];
          }
          acc[metric.name].push(metric.value);
          return acc;
        },
        {} as Record<string, number[]>
      );

      // Calculate averages
      const averages = Object.entries(metricsData).reduce(
        (acc, [name, values]) => {
          acc[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
          return acc;
        },
        {} as Record<string, number>
      );

      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_type: 'performance_metrics',
        event_data: averages,
        session_id: this.sessionId,
        device_info: this.getDeviceInfo(),
      });
    } catch (error) {
      console.error('Error flushing performance buffer:', error);
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') {
      return {};
    }

    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

    // Parse browser info
    let browser = 'Unknown';
    let browserVersion = 'Unknown';

    if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    }

    return {
      platform,
      browser,
      browserVersion,
      isMobile,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Track error
   */
  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Track page view
   */
  async trackPageView(path: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    });
  }

  /**
   * Track user action
   */
  async trackAction(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      category,
      label,
      value,
    });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching analytics:', error);
      return {};
    }

    // Process analytics data
    const summary = {
      totalEvents: data.length,
      uniqueSessions: new Set(data.map(e => e.session_id)).size,
      eventTypes: {} as Record<string, number>,
      topPages: {} as Record<string, number>,
      devices: {
        mobile: 0,
        desktop: 0,
      },
      browsers: {} as Record<string, number>,
    };

    data.forEach(event => {
      // Count event types
      summary.eventTypes[event.event_type] =
        (summary.eventTypes[event.event_type] || 0) + 1;

      // Count page views
      if (event.event_type === 'page_view' && event.event_data?.path) {
        summary.topPages[event.event_data.path] =
          (summary.topPages[event.event_data.path] || 0) + 1;
      }

      // Count devices
      if (event.device_info?.isMobile) {
        summary.devices.mobile++;
      } else {
        summary.devices.desktop++;
      }

      // Count browsers
      if (event.device_info?.browser) {
        summary.browsers[event.device_info.browser] =
          (summary.browsers[event.device_info.browser] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Cleanup monitoring
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushPerformanceBuffer();
  }
}

export const monitoringService = new MonitoringService();
