# Implementation Guide: Monitoring & Analytics System

## Overview

This implementation guide provides detailed instructions for setting up and deploying the monitoring and analytics system for Schwalbe. The system integrates Supabase logs, database error tracking, Resend alerts, and comprehensive performance monitoring.

## Prerequisites

### System Requirements

- Node.js 18+ with TypeScript support
- Supabase project with database access
- Resend account for email alerts
- Vercel deployment environment
- GitHub repository with CI/CD pipeline

### Dependencies

```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.0.10",
  "resend": "^3.2.0",
  "zod": "^3.22.4",
  "date-fns": "^3.0.6"
}
```

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend Configuration
RESEND_API_KEY=your_resend_api_key

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=development
MONITORING_RETENTION_DAYS=90
```

### Hollywood Monitoring System Migration

Migrate existing monitoring components from Hollywood codebase:

```typescript
// Migration from Hollywood monitoring service
// Original Hollywood: packages/shared/src/services/monitoring.ts

export class HollywoodMonitoringService {
  // Legacy Hollywood monitoring methods
  async logError(error: Error, context?: any) {
    // Hollywood error logging implementation
  }

  async trackEvent(eventName: string, data: any) {
    // Hollywood event tracking implementation
  }

  async checkHealth() {
    // Hollywood health check implementation
  }
}

// Schwalbe migration adapter
export class MonitoringMigrationAdapter {
  private hollywoodService: HollywoodMonitoringService;
  private schwalbeService: MonitoringService;

  constructor() {
    this.hollywoodService = new HollywoodMonitoringService();
    this.schwalbeService = new MonitoringService();
  }

  // Migrate Hollywood error logging to Schwalbe
  async migrateErrorLogging(error: Error, context?: any) {
    // First log to Hollywood for backward compatibility
    await this.hollywoodService.logError(error, context);

    // Then log to Schwalbe system
    await this.schwalbeService.trackError(error, context);
  }

  // Migrate Hollywood event tracking to Schwalbe
  async migrateEventTracking(eventName: string, data: any) {
    // Transform Hollywood event format to Schwalbe format
    const schwalbeEvent = this.transformEventFormat(eventName, data);

    // Track in both systems during migration
    await this.hollywoodService.trackEvent(eventName, data);
    await this.schwalbeService.trackEvent(schwalbeEvent.type, schwalbeEvent.data);
  }

  private transformEventFormat(eventName: string, data: any) {
    // Transform Hollywood event format to Schwalbe analytics format
    return {
      type: this.mapEventType(eventName),
      data: this.transformEventData(data)
    };
  }

  private mapEventType(hollywoodEvent: string): string {
    // Map Hollywood event names to Schwalbe event types
    const eventMap: Record<string, string> = {
      'user_action': 'user_interaction',
      'page_view': 'page_view',
      'error_occurred': 'error',
      'performance_metric': 'performance_metric'
    };

    return eventMap[hollywoodEvent] || hollywoodEvent;
  }

  private transformEventData(data: any): any {
    // Transform Hollywood data structure to Schwalbe format
    return {
      ...data,
      migrated_from: 'hollywood',
      migration_timestamp: new Date().toISOString()
    };
  }
}

// Usage during migration period
export const monitoringMigrationAdapter = new MonitoringMigrationAdapter();

// Gradually replace Hollywood calls with Schwalbe calls
// Phase 1: Use adapter for both systems
// Phase 2: Direct Schwalbe calls with Hollywood fallback
// Phase 3: Pure Schwalbe implementation
```

### Hollywood Database Schema Migration

Migrate Hollywood monitoring tables to Schwalbe schema:

```sql
-- Hollywood to Schwalbe table mapping
-- Hollywood: error_logs → Schwalbe: error_logs
-- Hollywood: analytics_events → Schwalbe: analytics_events
-- Hollywood: performance_metrics → Schwalbe: performance_metrics

-- Migration script for existing Hollywood data
INSERT INTO schwalbe.error_logs (
  user_id,
  error_type,
  error_message,
  error_stack,
  severity,
  context,
  user_agent,
  url,
  session_id,
  created_at
)
SELECT
  user_id,
  CASE
    WHEN error_type = 'javascript' THEN 'javascript'
    WHEN error_type = 'network' THEN 'network'
    WHEN error_type = 'validation' THEN 'validation'
    ELSE 'api'
  END as error_type,
  message,
  stack_trace,
  CASE
    WHEN severity = 'error' THEN 'high'
    WHEN severity = 'warning' THEN 'medium'
    ELSE 'low'
  END as severity,
  metadata,
  user_agent,
  page_url,
  session_id,
  created_at
FROM hollywood.error_logs
WHERE created_at >= '2024-01-01'; -- Migrate recent data only

-- Migrate analytics events
INSERT INTO schwalbe.analytics_events (
  user_id,
  event_type,
  event_data,
  session_id,
  device_info,
  page_url,
  created_at
)
SELECT
  user_id,
  CASE
    WHEN event_name = 'page_load' THEN 'page_view'
    WHEN event_name = 'button_click' THEN 'user_interaction'
    ELSE event_name
  END as event_type,
  event_properties,
  session_id,
  device_info,
  page_url,
  timestamp
FROM hollywood.analytics_events
WHERE timestamp >= '2024-01-01';
```

### Hollywood Configuration Migration

Migrate Hollywood monitoring configuration:

```typescript
// Hollywood configuration (packages/shared/src/config/monitoring.ts)
export const HOLLYWOOD_MONITORING_CONFIG = {
  enabled: process.env.MONITORING_ENABLED === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  sampleRate: parseFloat(process.env.SAMPLE_RATE || '1.0'),
};

// Schwalbe configuration migration
export const SCHWALBE_MONITORING_CONFIG = {
  enabled: HOLLYWOOD_MONITORING_CONFIG.enabled,
  environment: process.env.NODE_ENV || 'development',
  retentionDays: parseInt(process.env.RETENTION_DAYS || '90'),
  sampleRate: HOLLYWOOD_MONITORING_CONFIG.sampleRate,
// Remove legacy vendor, add Supabase and Resend
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  resendKey: process.env.RESEND_API_KEY,
};

// Gradual migration strategy
export function getMonitoringConfig() {
  const useSchwalbe = process.env.USE_SCHWALBE_MONITORING === 'true';

  if (useSchwalbe) {
    return SCHWALBE_MONITORING_CONFIG;
  }

  // Fallback to Hollywood during migration
  return HOLLYWOOD_MONITORING_CONFIG;
}
```

### Hollywood Edge Function Migration

Migrate Hollywood Supabase Edge Functions:

```typescript
// Hollywood: supabase/functions/error-handler/index.ts
export async function handleError(error: any, context: any) {
  // Hollywood error handling logic
}

// Schwalbe migration: supabase/functions/error-processor/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

export async function processError(errorData: any) {
  // Enhanced error processing with Supabase storage and Resend alerts
  try {
    // Store error in database
    const { data, error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_type: errorData.type,
        error_message: errorData.message,
        error_stack: errorData.stack,
        severity: errorData.severity,
        context: errorData.context,
        user_agent: errorData.userAgent,
        url: errorData.url,
        session_id: errorData.sessionId,
      });

    if (dbError) throw dbError;

    // Send alert for critical errors
    if (errorData.severity === 'critical') {
      await resend.emails.send({
        from: 'alerts@schwalbe.dev',
        to: ['admin@schwalbe.dev'],
        subject: `Critical Error: ${errorData.message}`,
        html: `
          <h2>Critical Error Detected</h2>
          <p><strong>Type:</strong> ${errorData.type}</p>
          <p><strong>Message:</strong> ${errorData.message}</p>
          <p><strong>URL:</strong> ${errorData.url}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Hollywood UI Component Migration

Migrate Hollywood monitoring UI components:

```tsx
// Hollywood: packages/ui/src/components/ErrorBoundary.tsx
export class HollywoodErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hollywood error reporting (legacy vendor)
    LegacyErrorReporter.captureException(error, { contexts: errorInfo });
  }
}

// Schwalbe migration: packages/ui/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error reporting with Supabase and Resend
    monitoringService.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }
}

// Gradual migration with feature flags
export function ErrorBoundaryWrapper({ children, useSchwalbe = false }) {
  if (useSchwalbe) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Fallback to Hollywood during migration
  return <HollywoodErrorBoundary>{children}</HollywoodErrorBoundary>;
}
```

### Hollywood Testing Migration

Migrate Hollywood monitoring tests:

```typescript
// Hollywood: packages/shared/src/services/__tests__/monitoring.test.ts
describe('HollywoodMonitoringService', () => {
  // Hollywood test cases
});

// Schwalbe migration: packages/shared/src/services/monitoring/__tests__/monitoring.service.test.ts
describe('MonitoringService', () => {
  // Enhanced test cases with Supabase and Resend integration
  it('should track events to Supabase', async () => {
    // Test Supabase event tracking
  });

  it('should send alerts via Resend', async () => {
    // Test Resend alert functionality
  });

  it('should handle Hollywood migration gracefully', async () => {
    // Test backward compatibility during migration
  });
});

// Migration test suite
describe('Monitoring Migration', () => {
  it('should migrate Hollywood errors to Schwalbe format', () => {
    // Test data transformation
  });

  it('should maintain data integrity during migration', () => {
    // Test data consistency
  });
});
```

### Hollywood Deployment Migration

Migrate Hollywood deployment configuration:

```yaml
# Hollywood: .github/workflows/deploy.yml
# (Original Hollywood deployment - legacy vendor observability)

# Schwalbe migration: .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod --yes

      - name: Health Check
        run: curl -f https://api.schwalbe.dev/health

      - name: Performance Check
        run: |
          lighthouse https://app.schwalbe.dev \
            --output json \
            --output-path ./lighthouse-results.json

      - name: Alert on Deployment
        if: failure()
        run: |
          curl -X POST https://api.schwalbe.dev/api/alerts \
            -H "Content-Type: application/json" \
            -d '{
              "title": "Deployment Failed",
              "message": "Production deployment failed",
              "severity": "high"
            }'
```

This migration approach ensures a smooth transition from Hollywood's monitoring system to Schwalbe's enhanced observability platform while maintaining backward compatibility during the migration period.

## Database Setup

### Migration Files

Create the monitoring tables migration:

```sql
-- File: supabase/migrations/20240102000000_create_monitoring_tables.sql

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id VARCHAR(255),
  device_info JSONB,
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health table
CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_rate DECIMAL(5,2),
  last_error TEXT,
  metadata JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logs table
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context JSONB,
  user_agent VARCHAR(500),
  url VARCHAR(500),
  session_id VARCHAR(255),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit VARCHAR(20) NOT NULL,
  page_url VARCHAR(500),
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  condition_type VARCHAR(50) NOT NULL,
  condition_config JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN DEFAULT true,
  notification_channels VARCHAR(20)[] DEFAULT '{}',
  cooldown_minutes INTEGER DEFAULT 60,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert instances table
CREATE TABLE alert_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  triggered_data JSONB,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- System health policies (read-only for users, full access for service)
CREATE POLICY "Users can view system health" ON system_health
  FOR SELECT USING (true);

CREATE POLICY "Service can manage system health" ON system_health
  FOR ALL USING (true);

-- Error logs policies
CREATE POLICY "Users can view own errors" ON error_logs
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service can insert errors" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Performance metrics policies
CREATE POLICY "Users can view own performance" ON performance_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can insert performance" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- Alert rules policies (admin only)
CREATE POLICY "Admins can manage alert rules" ON alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Alert instances policies
CREATE POLICY "Users can view alerts" ON alert_instances
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage alerts" ON alert_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Database Indexes

```sql
-- Analytics events indexes
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

-- System health indexes
CREATE INDEX idx_system_health_service_checked ON system_health(service_name, checked_at);
CREATE INDEX idx_system_health_status ON system_health(status);

-- Error logs indexes
CREATE INDEX idx_error_logs_user_created ON error_logs(user_id, created_at);
CREATE INDEX idx_error_logs_type_severity ON error_logs(error_type, severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_user_created ON performance_metrics(user_id, created_at);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);

-- Alert instances indexes
CREATE INDEX idx_alert_instances_rule_created ON alert_instances(alert_rule_id, created_at);
CREATE INDEX idx_alert_instances_status ON alert_instances(status);
```

## Core Implementation

### Monitoring Service Setup

Create the main monitoring service in `packages/shared/src/services/monitoring/`:

```typescript
// packages/shared/src/services/monitoring/monitoring.service.ts
import { supabase } from '../../supabase/client';
import { AnalyticsEvent, SystemHealthCheck, PerformanceMetric } from './types';

export class MonitoringService {
  private sessionId: string;
  private performanceBuffer: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPerformanceMonitoring(): void {
    // Flush performance buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushPerformanceBuffer();
    }, 30000);

    // Monitor Web Vitals if in browser
    if (typeof window !== 'undefined' && window.performance) {
      this.captureWebVitals();
    }
  }

  private captureWebVitals(): void {
    // Implementation for Web Vitals capture
    // FCP, LCP, FID, CLS monitoring
  }

  async trackEvent(eventType: string, eventData?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

  async checkHealth(service: string): Promise<SystemHealthCheck> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    let lastError: string | undefined;
    let errorRate = 0;

    try {
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
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (error: any) {
      status = 'down';
      lastError = error.message;
      errorRate = 100;
    }

    const responseTime = Date.now() - startTime;

    if (responseTime > 5000 && status === 'healthy') {
      status = 'degraded';
    }

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

  private async checkDatabaseHealth(): Promise<void> {
    const { error } = await supabase
      .from('system_health')
      .select('id')
      .limit(1);

    if (error) throw error;
  }

  private async checkStorageHealth(): Promise<void> {
    const { error } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });

    if (error) throw error;
  }

  private async checkAuthHealth(): Promise<void> {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
  }

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

  recordPerformance(name: string, value: number, unit: string): void {
    this.performanceBuffer.push({
      name,
      value,
      unit,
      timestamp: new Date(),
    });

    if (this.performanceBuffer.length >= 50) {
      this.flushPerformanceBuffer();
    }
  }

  private async flushPerformanceBuffer(): Promise<void> {
    if (this.performanceBuffer.length === 0) return;

    const metrics = [...this.performanceBuffer];
    this.performanceBuffer = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_type: 'performance_metrics',
        event_data: this.aggregateMetrics(metrics),
        session_id: this.sessionId,
        device_info: this.getDeviceInfo(),
      });
    } catch (error) {
      console.error('Error flushing performance buffer:', error);
    }
  }

  private aggregateMetrics(metrics: PerformanceMetric[]): Record<string, any> {
    // Aggregate metrics by type
    const aggregated: Record<string, number[]> = {};

    metrics.forEach(metric => {
      if (!aggregated[metric.name]) {
        aggregated[metric.name] = [];
      }
      aggregated[metric.name].push(metric.value);
    });

    // Calculate averages
    const averages: Record<string, number> = {};
    Object.entries(aggregated).forEach(([name, values]) => {
      averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return averages;
  }

  private getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') {
      return {};
    }

    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

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

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  async trackPageView(path: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    });
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushPerformanceBuffer();
  }
}

export const monitoringService = new MonitoringService();
```

### Error Boundary Component

Create a React error boundary for client-side error tracking:

```tsx
// packages/ui/src/components/ErrorBoundary.tsx
import React from 'react';
import { monitoringService } from '@schwalbe/shared';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error with monitoring service
    monitoringService.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="error-boundary">
    <h2>Something went wrong</h2>
    <p>We apologize for the inconvenience. Please try refreshing the page.</p>
    {process.env.NODE_ENV === 'development' && error && (
      <details>
        <summary>Error Details (Development)</summary>
        <pre>{error.stack}</pre>
      </details>
    )}
    <button onClick={resetError}>Try Again</button>
  </div>
);
```

### Alerting System

Create Supabase Edge Functions for alerting:

```typescript
// supabase/functions/alert-processor/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

interface AlertData {
  alert_rule_id: string;
  title: string;
  message: string;
  severity: string;
  triggered_data: any;
}

export async function processAlert(alertData: AlertData) {
  try {
    // Insert alert instance
    const { data: alertInstance, error: insertError } = await supabase
      .from('alert_instances')
      .insert({
        alert_rule_id: alertData.alert_rule_id,
        title: alertData.title,
        message: alertData.message,
        severity: alertData.severity,
        triggered_data: alertData.triggered_data,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Get alert rule for notification settings
    const { data: alertRule, error: ruleError } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('id', alertData.alert_rule_id)
      .single();

    if (ruleError) throw ruleError;

    // Send notifications
    if (alertRule.notification_channels.includes('email')) {
      await sendAlertEmail(alertData, alertRule);
    }

    // Update last triggered timestamp
    await supabase
      .from('alert_rules')
      .update({ last_triggered: new Date().toISOString() })
      .eq('id', alertData.alert_rule_id);

    return { success: true, alertInstance };
  } catch (error) {
    console.error('Error processing alert:', error);
    return { success: false, error: error.message };
  }
}

async function sendAlertEmail(alertData: AlertData, alertRule: any) {
  try {
    const emailHtml = `
      <h2>Alert: ${alertData.title}</h2>
      <p><strong>Severity:</strong> ${alertData.severity}</p>
      <p><strong>Message:</strong> ${alertData.message}</p>
      <p><strong>Rule:</strong> ${alertRule.name}</p>
      <p><strong>Triggered:</strong> ${new Date().toISOString()}</p>
      ${alertData.triggered_data ? `<pre>${JSON.stringify(alertData.triggered_data, null, 2)}</pre>` : ''}
    `;

    await resend.emails.send({
      from: 'alerts@schwalbe.dev',
      to: ['admin@schwalbe.dev'], // Configure recipient list
      subject: `Alert: ${alertData.title}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
}
```

### Health Check Endpoint

Create API route for health monitoring:

```typescript
// apps/web/src/pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { monitoringService } from '@schwalbe/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthChecks = await Promise.all([
      monitoringService.checkHealth('database'),
      monitoringService.checkHealth('storage'),
      monitoringService.checkHealth('auth'),
    ]);

    const overallStatus = healthChecks.some(h => h.status === 'down')
      ? 'down'
      : healthChecks.some(h => h.status === 'degraded')
      ? 'degraded'
      : 'healthy';

    res.status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: healthChecks,
      version: process.env.npm_package_version,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'down',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Integration Setup

### Application Integration

Initialize monitoring in the main application:

```typescript
// apps/web/src/pages/_app.tsx
import { useEffect } from 'react';
import { monitoringService } from '@schwalbe/shared';
import { ErrorBoundary } from '@schwalbe/ui';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      monitoringService.trackPageView(url);
    };

    // Track initial page view
    monitoringService.trackPageView(window.location.pathname);

    // Listen for route changes
    // (Add router event listeners based on your routing setup)

    return () => {
      // Cleanup monitoring on unmount
      monitoringService.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
```

### Supabase Integration

Set up monitoring triggers in Supabase:

```sql
-- Function to automatically create alerts for critical errors
CREATE OR REPLACE FUNCTION create_error_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alerts for high/critical severity errors
  IF NEW.severity IN ('high', 'critical') THEN
    -- Insert alert instance
    INSERT INTO alert_instances (
      alert_rule_id,
      title,
      message,
      severity,
      triggered_data
    ) VALUES (
      (SELECT id FROM alert_rules WHERE name = 'Critical Error Alert' LIMIT 1),
      'Critical Error Detected',
      format('Critical error in %s: %s', NEW.error_type, NEW.error_message),
      NEW.severity,
      json_build_object(
        'error_id', NEW.id,
        'error_type', NEW.error_type,
        'error_message', NEW.error_message,
        'user_id', NEW.user_id,
        'url', NEW.url
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic error alerts
CREATE TRIGGER error_alert_trigger
  AFTER INSERT ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_error_alert();
```

## Deployment Configuration

### Environment Setup

Configure monitoring for different environments:

```bash
# .env.local (Development)
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=development
MONITORING_RETENTION_DAYS=30
MONITORING_ALERT_EMAIL=dev-alerts@schwalbe.dev

# .env.staging (Staging)
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=staging
MONITORING_RETENTION_DAYS=60
MONITORING_ALERT_EMAIL=staging-alerts@schwalbe.dev

# .env.production (Production)
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=production
MONITORING_RETENTION_DAYS=90
MONITORING_ALERT_EMAIL=production-alerts@schwalbe.dev
```

### Vercel Configuration

Configure monitoring in Vercel:

```json
// vercel.json
{
  "functions": {
    "api/health.ts": {
      "maxDuration": 10
    },
    "api/monitoring/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### CI/CD Integration

Add monitoring to CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
cache: 'npm'

      - name: Install dependencies
run: npm ci

      - name: Run tests
run: npm run lighthouse

      - name: Run monitoring tests
run: npm run test:monitoring

      - name: Health check
        run: curl -f https://api-staging.schwalbe.dev/health

      - name: Performance check
        run: lighthouse https://staging.schwalbe.dev --output json --output-path ./lighthouse-results.json
```

## Monitoring Dashboard

### Dashboard Component

Create a basic monitoring dashboard:

```tsx
// apps/web/src/components/MonitoringDashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@schwalbe/shared';

interface DashboardData {
  totalEvents: number;
  activeAlerts: number;
  systemHealth: any[];
  recentErrors: any[];
  performanceMetrics: any[];
}

export function MonitoringDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load analytics summary
      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Load active alerts
      const { data: alertsData } = await supabase
        .from('alert_instances')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load system health
      const { data: healthData } = await supabase
        .from('system_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(20);

      // Load recent errors
      const { data: errorsData } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setData({
        totalEvents: analyticsData?.length || 0,
        activeAlerts: alertsData?.length || 0,
        systemHealth: healthData || [],
        recentErrors: errorsData || [],
        performanceMetrics: [], // Load performance data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading monitoring data...</div>;
  }

  if (!data) {
    return <div>Failed to load monitoring data</div>;
  }

  return (
    <div className="monitoring-dashboard">
      <h1>System Monitoring</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Events (24h)</h3>
          <div className="metric-value">{data.totalEvents}</div>
        </div>

        <div className="metric-card">
          <h3>Active Alerts</h3>
          <div className="metric-value">{data.activeAlerts}</div>
        </div>

        <div className="metric-card">
          <h3>System Health</h3>
          <div className="health-status">
            {data.systemHealth.length > 0 ? (
              <span className={`status-${data.systemHealth[0].status}`}>
                {data.systemHealth[0].status}
              </span>
            ) : (
              <span>Unknown</span>
            )}
          </div>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Active Alerts</h2>
        {data.activeAlerts === 0 ? (
          <p>No active alerts</p>
        ) : (
          <ul>
            {data.activeAlerts.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
                <small>{new Date(alert.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="errors-section">
        <h2>Recent Errors</h2>
        {data.recentErrors.length === 0 ? (
          <p>No recent errors</p>
        ) : (
          <ul>
            {data.recentErrors.map((error) => (
              <li key={error.id}>
                <strong>{error.error_type}</strong>
                <p>{error.error_message}</p>
                <small>{new Date(error.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

## Testing and Validation

### Unit Tests

Create comprehensive unit tests:

```typescript
// packages/shared/src/services/monitoring/monitoring.service.test.ts
import { monitoringService } from './monitoring.service';
import { supabase } from '../../supabase/client';

jest.mock('../../supabase/client');

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track event successfully', async () => {
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({}),
      });

      await monitoringService.trackEvent('test_event', { key: 'value' });

      expect(supabase.from).toHaveBeenCalledWith('analytics_events');
    });

    it('should handle tracking errors gracefully', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('Auth error'));

      await expect(
        monitoringService.trackEvent('test_event')
      ).resolves.not.toThrow();
    });
  });

  describe('checkHealth', () => {
    it('should return healthy status for database', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await monitoringService.checkHealth('database');

      expect(result.status).toBe('healthy');
      expect(result.service).toBe('database');
    });

    it('should return down status on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
        }),
      });

      const result = await monitoringService.checkHealth('database');

      expect(result.status).toBe('down');
      expect(result.lastError).toBe('DB error');
    });
  });
});
```

### Integration Tests

Create integration tests for end-to-end functionality:

```typescript
// apps/web/src/__tests__/monitoring.integration.test.ts
import { render, screen } from '@testing-library/react';
import { MonitoringDashboard } from '../components/MonitoringDashboard';
import { supabase } from '@schwalbe/shared';

jest.mock('@schwalbe/shared');

describe('MonitoringDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display monitoring data', async () => {
    const mockAnalyticsData = [
      { event_type: 'page_view', created_at: new Date().toISOString() },
    ];

    const mockAlertsData = [];
    const mockHealthData = [
      { service_name: 'database', status: 'healthy', checked_at: new Date().toISOString() },
    ];
    const mockErrorsData = [];

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockResolvedValue({ data: mockAnalyticsData }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockAlertsData }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockHealthData }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockErrorsData }),
        }),
      });

    render(<MonitoringDashboard />);

    expect(screen.getByText('System Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Total Events (24h)')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Monitoring Overhead Optimization

Implement performance optimizations:

```typescript
// packages/shared/src/services/monitoring/performance-optimizer.ts
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private monitoringEnabled = true;
  private sampleRate = 1.0; // Sample 100% of events by default

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
  }

  setSampleRate(rate: number): void {
    this.sampleRate = Math.max(0, Math.min(1, rate));
  }

  shouldTrack(): boolean {
    if (!this.monitoringEnabled) return false;
    return Math.random() < this.sampleRate;
  }

  optimizePayload(payload: any): any {
    // Remove sensitive data
    const optimized = { ...payload };

    // Truncate large strings
    Object.keys(optimized).forEach(key => {
      if (typeof optimized[key] === 'string' && optimized[key].length > 1000) {
        optimized[key] = optimized[key].substring(0, 1000) + '...';
      }
    });

    return optimized;
  }

  getPerformanceBudget(): { [key: string]: number } {
    return {
      bundleSize: 500 * 1024, // 500KB
      firstPaint: 2000, // 2 seconds
      firstContentfulPaint: 2000,
      largestContentfulPaint: 2500,
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1,
    };
  }
}
```

## Security Considerations

### Data Protection

Implement security measures:

```typescript
// packages/shared/src/services/monitoring/security-manager.ts
export class SecurityManager {
  sanitizeError(error: Error): Partial<Error> {
    return {
      name: error.name,
      message: this.sanitizeMessage(error.message),
      // Remove stack trace in production
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  sanitizeMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/password[=:][^&\s]*/gi, 'password=***')
      .replace(/token[=:][^&\s]*/gi, 'token=***')
      .replace(/key[=:][^&\s]*/gi, 'key=***');
  }

  validateDataAccess(userId: string, resourceType: string, resourceId?: string): boolean {
    // Implement data access validation logic
    // Check if user has permission to access monitoring data
    return true; // Placeholder
  }

  encryptSensitiveData(data: any): any {
    // Implement data encryption for sensitive monitoring data
    return data; // Placeholder
  }
}
```

## Maintenance and Operations

### Data Cleanup

Implement automated data cleanup:

```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Delete old analytics events (keep 90 days)
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old system health records (keep 30 days)
  DELETE FROM system_health
  WHERE checked_at < NOW() - INTERVAL '30 days';

  -- Delete old error logs (keep 90 days)
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old performance metrics (keep 30 days)
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete resolved alerts older than 1 year
  DELETE FROM alert_instances
  WHERE status = 'resolved'
    AND created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (run daily)
SELECT cron.schedule(
  'cleanup-monitoring-data',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT cleanup_monitoring_data();'
);
```

### Backup and Recovery

Set up monitoring data backup:

```sql
-- Create backup function
CREATE OR REPLACE FUNCTION backup_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Create backup tables with timestamp
  EXECUTE format('CREATE TABLE analytics_events_backup_%s AS SELECT * FROM analytics_events', extract(epoch from now()));
  EXECUTE format('CREATE TABLE error_logs_backup_%s AS SELECT * FROM error_logs', extract(epoch from now()));

  -- Clean up old backups (keep last 7 days)
  -- Implementation depends on backup strategy
END;
$$ LANGUAGE plpgsql;
```

This implementation guide provides a comprehensive foundation for the monitoring and analytics system. The modular architecture allows for incremental implementation and scaling based on project needs.
