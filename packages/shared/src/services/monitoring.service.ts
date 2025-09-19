
import { supabase } from '../supabase/client';

import { logger } from '../lib/logger';
// Log levels for error_log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// -----------------------
// Redaction utilities (no PII or secrets in logs)
// -----------------------
const SECRET_KEY_PATTERNS = [
  'password', 'passcode', 'pwd', 'secret', 'token', 'apikey', 'api_key', 'key', 'authorization', 'auth', 'cookie', 'session', 'jwt', 'bearer',
  // common personal data
  'email', 'e-mail', 'phone', 'mobile', 'ssn', 'national', 'passport', 'iban', 'bank', 'credit', 'card', 'cc', 'cvv', 'address', 'name'
];

function isSecretKey(k?: string): boolean {
  if (!k) return false;
  const lk = k.toLowerCase();
  return SECRET_KEY_PATTERNS.some(p => lk.includes(p));
}

function redactValue(key: string | undefined, value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'string') {
    if (isSecretKey(key)) return '[REDACTED]';
    // mask likely email patterns and bearer tokens within free text
    const masked = value
      // emails
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]')
      // bearer-like tokens
      .replace(/(Bearer\s+)[A-Za-z0-9\-_.]+/gi, '$1[REDACTED_TOKEN]')
      // long hex strings (32+)
      .replace(/\b[0-9a-f]{32,}\b/gi, '[REDACTED_HEX]');
    return masked.length > 2000 ? masked.slice(0, 2000) + '…' : masked;
  }
  if (typeof value === 'object') return redactObject(value as Record<string, unknown>);
  return isSecretKey(key) ? '[REDACTED]' : value;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  try {
    const out: Record<string, unknown> = Array.isArray(obj) ? {} : {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = redactValue(k, v);
    }
    return out;
  } catch {
    return {};
  }
}

function redactText(text?: string): string | undefined {
  if (!text) return text;
  return String(redactValue(undefined, text));
}

// In-memory throttle/de-dupe for alerts (server/process-local)
const ALERT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ALERT_LRU_MAX = 512;
const alertCache: Map<string, number> = new Map();

function stableStringify(obj: Record<string, unknown> | undefined): string {
  if (!obj) return '';
  try {
    const keys = Object.keys(obj).sort();
    const normalized: Record<string, unknown> = {};
    for (const k of keys) normalized[k] = (obj as any)[k];
    return JSON.stringify(normalized);
  } catch {
    try { return JSON.stringify(obj); } catch { return String(obj); }
  }
}

// Simple FNV-1a hash for signatures
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return ('0000000' + hash.toString(16)).slice(-8);
}

function makeSignature(level: LogLevel, message: string, context?: Record<string, unknown>, stack?: string): string {
  const base = [level, message, stack || '', stableStringify(context)].join('|');
  return fnv1a(base);
}

function shouldSendAlert(signature: string): boolean {
  const now = Date.now();
  const last = alertCache.get(signature);
  if (last && now - last < ALERT_TTL_MS) return false;
  // LRU cap
  if (alertCache.size >= ALERT_LRU_MAX) {
    const firstKey = alertCache.keys().next().value;
    if (firstKey) alertCache.delete(firstKey);
  }
  alertCache.set(signature, now);
  return true;
}

function getEnv(name: string): string | undefined {
  // Avoid direct property access to prevent bundlers from inlining secrets into client bundles
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env[name];
  }
  return undefined;
}

function getRuntimeEnvironment(): string {
  if (typeof window !== 'undefined') {
    const viteMode = (window as any)?.import?.meta?.env?.MODE || (window as any)?.VITE_ENV;
    return String(viteMode || 'browser');
  }
  return getEnv('NODE_ENV') || 'server';
}

function getAppVersion(): string {
  // Prefer explicit env var; do not use package.json import to keep this lightweight
  const v = getEnv('APP_VERSION') || getEnv('NEXT_PUBLIC_APP_VERSION') || getEnv('EXPO_PUBLIC_APP_VERSION');
  return v || 'unknown';
}

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

  // -----------------------
  // Error logging + alerts
  // -----------------------
  private isCritical(level: LogLevel) {
    return level === 'error' || level === 'fatal';
  }

  private toStack(e: unknown): string | undefined {
    if (!e) return undefined;
    if (typeof e === 'string') return e;
    if (e instanceof Error) return e.stack || e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }

  private async insertErrorLog(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    stack?: string
  ): Promise<void> {
    try {
      const sanitizedContext = context ? redactObject(context) : {};
      const sanitizedMessage = typeof message === 'string' ? (redactText(message) || '') : JSON.stringify(message);
      const sanitizedStack = redactText(stack);
      await supabase.from('error_log').insert({
        level,
        message: sanitizedMessage,
        context: sanitizedContext,
        stack: sanitizedStack ?? null,
      });
    } catch {
      // Do not print database errors or details
      // Intentionally swallow provider errors to avoid log loops
    }
  }

  private async sendCriticalAlert(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    stack?: string
  ): Promise<void> {
    if (!this.isCritical(level)) return;

    // Throttle/de-dupe
    const signature = makeSignature(level, message, context, stack);
    if (!shouldSendAlert(signature)) return;

    // Prefer to send from server/edge only (least privilege). If in browser, try using functions.invoke with user auth.
    const isBrowser = typeof window !== 'undefined';
    const subject = `[${level.toUpperCase()}] Schwalbe alert: ${(redactText(message) || '').slice(0, 120)}`;
    const body = {
      to: getEnv('ALERT_EMAIL_TO') || undefined,
      subject,
      text: JSON.stringify({ level, message: redactText(message), context: context ? redactObject(context) : undefined, stack: redactText(stack) }).slice(0, 5000),
    };

    try {
      if (!isBrowser) {
        const functionsBaseEnv = getEnv('SUPABASE_URL');
        const functionsBase = (functionsBaseEnv || '').replace(/\/$/, '') + '/functions/v1';
        const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
        const anonKey = getEnv('SUPABASE_ANON_KEY');
        const authToken = serviceKey || anonKey || '';
        if (!functionsBaseEnv || !authToken || !getEnv('ALERT_EMAIL_TO')) {
          logger.warn('Critical alert not sent (missing server env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALERT_EMAIL_TO).');
          return;
        }
        const res = await fetch(`${functionsBase}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          // Avoid logging provider response details to prevent leaks
          logger.error('Critical alert email failed');
        }
      } else {
        // Browser: use functions.invoke; requires an authenticated user session to include Authorization
        // If not logged in, this may fail with 401 by design.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          logger.warn('Skipping alert email in browser (no auth session).');
          return;
        }
        const { error } = await supabase.functions.invoke('send-email', {
          body,
        });
        if (error) {
          logger.error('Critical alert email failed (browser)');
        }
      }
    } catch {
      // Avoid printing detailed provider errors
      logger.error('Critical alert path error');
    }
  }

  async log(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown): Promise<void> {
    const stack = this.toStack(error);

    // Structured console logging (sanitized)
    try {
      const sanitizedContext = context ? redactObject(context) : undefined;
      const entry: Record<string, unknown> = {
        level,
        message: redactText(message) || '',
        timestamp: new Date().toISOString(),
        environment: getRuntimeEnvironment(),
        app_version: getAppVersion(),
        // Never include user identifiers in logs
        request_id: (sanitizedContext && (sanitizedContext['request_id'] || (sanitizedContext as any)['trace_id'] || (sanitizedContext as any)['correlation_id'])) || undefined,
        context: sanitizedContext,
        stack: redactText(stack) || undefined,
      };
      const logText = JSON.stringify(entry);
      if (level === 'error' || level === 'fatal') logger.error(logText);
      else if (level === 'warn') logger.warn(logText);
      else if ((console as any).debug && level === 'debug') (console as any).debug(logText);
      else logger.info(logText);
    } catch { /* ignore */ }

    await this.insertErrorLog(level, message, context, stack);
    if (this.isCritical(level)) {
      await this.sendCriticalAlert(level, message, context, stack);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    return this.log('debug', message, context);
  }
  info(message: string, context?: Record<string, any>) {
    return this.log('info', message, context);
  }
  warn(message: string, context?: Record<string, any>) {
    return this.log('warn', message, context);
  }
  error(message: string, context?: Record<string, any>, err?: unknown) {
    return this.log('error', message, context, err);
  }
  fatal(message: string, context?: Record<string, any>, err?: unknown) {
    return this.log('fatal', message, context, err);
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
      if (lastEntry) {
        this.recordPerformance('LCP', lastEntry.startTime, 'ms');
      }
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

      // Sanitize event data before storing
      const sanitizedData = eventData ? redactObject(eventData) : {};

      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_type: eventType,
        event_data: sanitizedData,
        session_id: this.sessionId,
        device_info: deviceInfo,
      });
    } catch {
      // Avoid printing event payloads or error details
      logger.error('Error tracking event');
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
        last_error: redactText(check.lastError) || null,
        metadata: check.metadata ? redactObject(check.metadata as any) : null,
      });
    } catch {
      logger.error('Error logging health check');
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
          acc[metric.name]!.push(metric.value);
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
    } catch {
      logger.error('Error flushing performance buffer');
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
    // Route through structured error logging with sanitization; do not store raw error details in analytics
    await this.error(error.message, context, error);
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
      logger.error('Error fetching analytics');
      return {};
    }

    // Process analytics data
    const summary = {
      totalEvents: data.length,
      uniqueSessions: new Set(data.map((e: any) => e.session_id)).size,
      eventTypes: {} as Record<string, number>,
      topPages: {} as Record<string, number>,
      devices: {
        mobile: 0,
        desktop: 0,
      },
      browsers: {} as Record<string, number>,
    };

    data.forEach((event: any) => {
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
