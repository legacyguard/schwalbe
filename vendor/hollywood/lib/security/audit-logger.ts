/**
 * Audit logging system for security events
 * Tracks all sensitive operations and security events
 */

import { createClient } from '@supabase/supabase-js';

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // Document events
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  DOCUMENT_SHARE = 'DOCUMENT_SHARE',
  DOCUMENT_ACCESS_DENIED = 'DOCUMENT_ACCESS_DENIED',

  // Guardian events
  GUARDIAN_ADDED = 'GUARDIAN_ADDED',
  GUARDIAN_REMOVED = 'GUARDIAN_REMOVED',
  GUARDIAN_MODIFIED = 'GUARDIAN_MODIFIED',
  GUARDIAN_ACCESS = 'GUARDIAN_ACCESS',

  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ACCESS_ATTEMPT = 'INVALID_ACCESS_ATTEMPT',
  DATA_EXPORT = 'DATA_EXPORT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',

  // System events
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  ENCRYPTION_KEY_ROTATED = 'ENCRYPTION_KEY_ROTATED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditEvent {
  description: string;
  errorMessage?: string;
  eventType: AuditEventType;
  id?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  resourceId?: string;
  resourceType?: string;
  sessionId?: string;
  severity: AuditSeverity;
  success: boolean;
  timestamp: string;
  userAgent?: string;
  userId: null | string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private queue: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private supabase: null | SupabaseClient = null;
  private isInitialized = false;

  private constructor() {
    // Start flush interval
    this.startFlushInterval();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Initialize with Supabase client
   */
  public initialize(supabaseUrl?: string, supabaseKey?: string): void {
    if (this.isInitialized) return;

    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      this.supabase = createClient(url, key);
      this.isInitialized = true;
    }
  }

  /**
   * Log an audit event
   */
  public async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId(),
    };

    // Add to queue
    this.queue.push(auditEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(auditEvent);
    }

    // Flush immediately for critical events
    if (event.severity === AuditSeverity.CRITICAL) {
      await this.flush();
    }
  }

  /**
   * Log a security event
   */
  public async logSecurity(
    eventType: AuditEventType,
    userId: null | string,
    description: string,
    metadata?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.WARNING
  ): Promise<void> {
    await this.log({
      userId,
      eventType,
      severity,
      description,
      metadata,
      success: false,
    });
  }

  /**
   * Log a successful operation
   */
  public async logSuccess(
    eventType: AuditEventType,
    userId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      eventType,
      severity: AuditSeverity.INFO,
      description,
      metadata,
      success: true,
    });
  }

  /**
   * Log a failed operation
   */
  public async logFailure(
    eventType: AuditEventType,
    userId: null | string,
    description: string,
    error: Error | string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      eventType,
      severity: AuditSeverity.ERROR,
      description,
      metadata,
      success: false,
      errorMessage: typeof error === 'string' ? error : error.message,
    });
  }

  /**
   * Log document access
   */
  public async logDocumentAccess(
    userId: string,
    documentId: string,
    action: 'delete' | 'download' | 'share' | 'upload',
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      upload: AuditEventType.DOCUMENT_UPLOAD,
      download: AuditEventType.DOCUMENT_DOWNLOAD,
      delete: AuditEventType.DOCUMENT_DELETE,
      share: AuditEventType.DOCUMENT_SHARE,
    };

    await this.log({
      userId,
      eventType: eventTypeMap[action],
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      description: `Document ${action} ${success ? 'successful' : 'failed'}`,
      resourceId: documentId,
      resourceType: 'document',
      metadata,
      success,
    });
  }

  /**
   * Log authentication event
   */
  public async logAuth(
    userId: null | string,
    action: 'login' | 'logout' | 'reset',
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      login: success
        ? AuditEventType.LOGIN_SUCCESS
        : AuditEventType.LOGIN_FAILED,
      logout: AuditEventType.LOGOUT,
      reset: AuditEventType.PASSWORD_RESET,
    };

    await this.log({
      userId,
      eventType: eventTypeMap[action],
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      description: `${action} ${success ? 'successful' : 'failed'}`,
      metadata,
      success,
    });
  }

  /**
   * Query audit logs
   */
  public async query(filters: {
    endDate?: Date;
    eventType?: AuditEventType;
    limit?: number;
    severity?: AuditSeverity;
    startDate?: Date;
    userId?: string;
  }): Promise<AuditEvent[]> {
    if (!this.supabase) {
      console.warn('Audit logger not initialized with Supabase');
      return [];
    }

    try {
      let query = this.supabase.from('audit_logs').select('*');

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      query = query.order('timestamp', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Failed to query audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error querying audit logs:', error);
      return [];
    }
  }

  /**
   * Get suspicious activity for a user
   */
  public async getSuspiciousActivity(
    userId: string,
    days: number = 7
  ): Promise<AuditEvent[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.query({
      userId,
      severity: AuditSeverity.WARNING,
      startDate,
    });
  }

  /**
   * Export audit logs
   */
  public async export(filters: Record<string, any>): Promise<string> {
    const logs = await this.query(filters);
    return JSON.stringify(logs, null, 2);
  }

  // Private methods

  private startFlushInterval(): void {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('audit_logs').insert(events);

        if (error) {
          console.error('Failed to flush audit logs:', error);
          // Re-add to queue on failure
          this.queue.unshift(...events);
        }
      } catch (error) {
        console.error('Error flushing audit logs:', error);
        // Re-add to queue on failure
        this.queue.unshift(...events);
      }
    } else {
      // Fallback: Store in localStorage if Supabase not available
      this.storeLocally(events);
    }
  }

  private storeLocally(events: AuditEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = localStorage.getItem('audit_logs_queue');
      const queue = existing ? JSON.parse(existing) : [];
      queue.push(...events);

      // Keep only last 1000 events
      const trimmed = queue.slice(-1000);
      localStorage.setItem('audit_logs_queue', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to store audit logs locally:', error);
    }
  }

  private getClientIP(): string {
    // This would typically be set by the server
    return 'unknown';
  }

  private getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return 'unknown';
  }

  private getSessionId(): string {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('audit_session_id');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2);
        sessionStorage.setItem('audit_session_id', sessionId);
      }
      return sessionId;
    }
    return 'unknown';
  }

  private consoleLog(_event: AuditEvent): void {
    // Development logging - would be replaced with proper logging in production
    // const color = {
    //   [AuditSeverity.INFO]: 'color: blue',
    //   [AuditSeverity.WARNING]: 'color: orange',
    //   [AuditSeverity.ERROR]: 'color: red',
    //   [AuditSeverity.CRITICAL]: 'color: red; font-weight: bold',
    // }[event.severity];
    // console.log(
    //   `%c[AUDIT] ${event.severity}`,
    //   color,
    //   `${event.eventType}: ${event.description}`,
    //   event.metadata || ''
    // );
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Helper functions for common logging patterns

export function logSecurityEvent(
  description: string,
  metadata?: Record<string, any>
): void {
  auditLogger.logSecurity(
    AuditEventType.SUSPICIOUS_ACTIVITY,
    null,
    description,
    metadata
  );
}

export function logRateLimitExceeded(
  userId: null | string,
  endpoint: string
): void {
  auditLogger.logSecurity(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    userId,
    `Rate limit exceeded for ${endpoint}`,
    { endpoint }
  );
}

export function logInvalidAccess(
  userId: null | string,
  resource: string,
  reason: string
): void {
  auditLogger.logSecurity(
    AuditEventType.INVALID_ACCESS_ATTEMPT,
    userId,
    `Invalid access attempt to ${resource}: ${reason}`,
    { resource, reason },
    AuditSeverity.WARNING
  );
}
