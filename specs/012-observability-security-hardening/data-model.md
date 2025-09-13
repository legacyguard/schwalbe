# Observability, Security Hardening, and Performance Optimization - Data Model

## Observability System Entities

### ErrorLog

```sql
CREATE TABLE error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  severity TEXT NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id TEXT,
  session_id TEXT,
  request_id TEXT,
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  context JSONB NOT NULL DEFAULT '{}',
  tags JSONB NOT NULL DEFAULT '[]',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_environment ON error_logs(environment);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX idx_error_logs_tags ON error_logs USING GIN(tags);
```

### SystemHealth

```sql
CREATE TABLE system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('api', 'database', 'storage', 'auth', 'email', 'monitoring')),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'down')),
  response_time_ms INTEGER,
  error_rate DECIMAL(5,2) DEFAULT 0,
  throughput INTEGER,
  memory_usage_mb INTEGER,
  cpu_usage_percent DECIMAL(5,2),
  disk_usage_percent DECIMAL(5,2),
  last_error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_health_service_name ON system_health(service_name);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at DESC);
CREATE INDEX idx_system_health_service_type ON system_health(service_type);
```

### AlertLog

```sql
CREATE TABLE alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL, -- 'error_log', 'system_health', 'security_scan', 'performance'
  source_id TEXT,
  recipient TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'webhook')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'suppressed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alert_logs_alert_type ON alert_logs(alert_type);
CREATE INDEX idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX idx_alert_logs_status ON alert_logs(status);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at DESC);
CREATE INDEX idx_alert_logs_source ON alert_logs(source, source_id);
```

## Security System Entities

### SecurityEvent

```sql
CREATE TABLE security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  url TEXT,
  method TEXT,
  request_body JSONB,
  response_status INTEGER,
  error_message TEXT,
  csp_violation JSONB,
  security_headers JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
```

### VulnerabilityScan

```sql
CREATE TABLE vulnerability_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('dependency', 'container', 'infrastructure', 'code')),
  scanner_version TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  total_vulnerabilities INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  results JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vulnerability_scans_scan_type ON vulnerability_scans(scan_type);
CREATE INDEX idx_vulnerability_scans_status ON vulnerability_scans(status);
CREATE INDEX idx_vulnerability_scans_started_at ON vulnerability_scans(started_at DESC);
CREATE INDEX idx_vulnerability_scans_target ON vulnerability_scans(target);
```

### SecurityPolicy

```sql
CREATE TABLE security_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_type TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  policy_config JSONB NOT NULL DEFAULT '{}',
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  is_active BOOLEAN DEFAULT true,
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_security_policies_policy_type ON security_policies(policy_type);
CREATE INDEX idx_security_policies_environment ON security_policies(environment);
CREATE INDEX idx_security_policies_is_active ON security_policies(is_active);
```

## Performance System Entities

### PerformanceMetric

```sql
CREATE TABLE performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '{}',
  user_id TEXT,
  session_id TEXT,
  url TEXT,
  user_agent TEXT,
  device_info JSONB,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_measured_at ON performance_metrics(measured_at DESC);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_tags ON performance_metrics USING GIN(tags);
```

### WebVitals

```sql
CREATE TABLE web_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  page_url TEXT NOT NULL,
  metric_name TEXT NOT NULL CHECK (metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB')),
  value DECIMAL(10,2) NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  device_info JSONB,
  connection_info JSONB,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX idx_web_vitals_rating ON web_vitals(rating);
CREATE INDEX idx_web_vitals_measured_at ON web_vitals(measured_at DESC);
CREATE INDEX idx_web_vitals_user_id ON web_vitals(user_id);
CREATE INDEX idx_web_vitals_page_url ON web_vitals(page_url);
```

### LoadTestResult

```sql
CREATE TABLE load_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('smoke', 'load', 'stress', 'spike')),
  scenario TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  total_requests INTEGER NOT NULL,
  successful_requests INTEGER NOT NULL,
  failed_requests INTEGER NOT NULL,
  average_response_time_ms DECIMAL(8,2),
  p95_response_time_ms DECIMAL(8,2),
  p99_response_time_ms DECIMAL(8,2),
  throughput_rps DECIMAL(8,2),
  error_rate DECIMAL(5,2),
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_mb INTEGER,
  results JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_load_test_results_test_name ON load_test_results(test_name);
CREATE INDEX idx_load_test_results_test_type ON load_test_results(test_type);
CREATE INDEX idx_load_test_results_status ON load_test_results(status);
CREATE INDEX idx_load_test_results_started_at ON load_test_results(started_at DESC);
```

## Monitoring System Entities

### MonitoringConfig

```sql
CREATE TABLE monitoring_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_type TEXT NOT NULL,
  config_name TEXT NOT NULL,
  config_data JSONB NOT NULL DEFAULT '{}',
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  is_active BOOLEAN DEFAULT true,
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_monitoring_configs_config_type ON monitoring_configs(config_type);
CREATE INDEX idx_monitoring_configs_environment ON monitoring_configs(environment);
CREATE INDEX idx_monitoring_configs_is_active ON monitoring_configs(is_active);
```

### AuditLog

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## Row Level Security Policies

Note: RLS policies use `app.current_external_id()` as the identity source (Clerk external ID). Avoid `auth.uid()` when using Clerk. Where user_id is present, ensure it stores Clerk external IDs and references `public.user_auth(clerk_id)` in relational schemas.

```sql
-- Enable RLS on all tables
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Error logs policies (service role access for monitoring)
CREATE POLICY "Service role can manage error logs" ON error_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- System health policies (read access for authenticated users)
CREATE POLICY "Authenticated users can view system health" ON system_health
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage system health" ON system_health
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Alert logs policies (service role only)
CREATE POLICY "Service role can manage alert logs" ON alert_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Security events policies (service role for monitoring)
CREATE POLICY "Service role can manage security events" ON security_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Vulnerability scans policies (service role only)
CREATE POLICY "Service role can manage vulnerability scans" ON vulnerability_scans
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Security policies (read access for authenticated users)
CREATE POLICY "Authenticated users can view active security policies" ON security_policies
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Service role can manage security policies" ON security_policies
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Performance metrics policies (users can view own data)
CREATE POLICY "Users can view own performance metrics" ON performance_metrics
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY "Service role can manage performance metrics" ON performance_metrics
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Web vitals policies (users can view own data)
CREATE POLICY "Users can view own web vitals" ON web_vitals
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY "Service role can manage web vitals" ON web_vitals
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Load test results policies (service role only)
CREATE POLICY "Service role can manage load test results" ON load_test_results
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Monitoring configs policies (read access for authenticated users)
CREATE POLICY "Authenticated users can view active monitoring configs" ON monitoring_configs
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Service role can manage monitoring configs" ON monitoring_configs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Audit logs policies (service role for compliance)
CREATE POLICY "Service role can manage audit logs" ON audit_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

## Data Relationships

### Observability System Relations

- **ErrorLog** N:1 **User** (many errors per user)
- **SystemHealth** N:1 **Service** (many health checks per service)
- **AlertLog** N:1 **ErrorLog** (alerts triggered by errors)
- **AlertLog** N:1 **SystemHealth** (alerts for health issues)

### Security System Relations

- **SecurityEvent** N:1 **User** (many events per user)
- **VulnerabilityScan** 1:N **SecurityEvent** (scans generate events)
- **SecurityPolicy** 1:N **SecurityEvent** (policies govern events)

### Performance System Relations

- **PerformanceMetric** N:1 **User** (many metrics per user)
- **WebVitals** N:1 **User** (many vitals per user)
- **LoadTestResult** 1:N **PerformanceMetric** (tests generate metrics)

### Monitoring System Relations

- **MonitoringConfig** 1:N **SystemHealth** (configs define health checks)
- **AuditLog** N:1 **User** (many audits per user)
- **AuditLog** N:1 **Resource** (audits track resource changes)

## Migration Scripts

### Initial Schema Creation

```sql
-- Create all observability, security, and performance tables
-- Enable RLS on all tables with appropriate policies
-- Create indexes for optimal query performance
-- Set up initial monitoring configurations
-- Create default security policies
```

### Hollywood Data Migration

```sql
-- Migrate existing error tracking data
-- Import system health monitoring data
-- Convert security event logs to new format
-- Migrate performance metrics and web vitals
-- Update monitoring configurations
-- Preserve audit trails and compliance data
```

### Data Retention Policies

```sql
-- Error logs: 90 days retention
-- System health: 30 days retention
-- Security events: 1 year retention
-- Performance metrics: 90 days retention
-- Web vitals: 30 days retention
-- Audit logs: 7 years retention (compliance)
```

This comprehensive data model supports all Phase 13 requirements: structured error logging with Supabase integration, security hardening with CSP and vulnerability scanning, performance optimization with Web Vitals monitoring, and comprehensive alerting with Resend notifications.
