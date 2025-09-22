# Enhanced Observability with Alert Rate Limiting

## Overview

LegacyGuard's enhanced observability system provides sophisticated monitoring, alerting, and rate limiting capabilities to ensure system reliability while preventing alert fatigue.

## Key Features

### 1. Sophisticated Alert Rate Limiting
- **Sliding Window Rate Limiting**: Prevents alert spam with configurable windows
- **Escalation Levels**: Gradual escalation for persistent issues
- **Fingerprint-based Deduplication**: Groups similar alerts intelligently
- **Override Capabilities**: Emergency bypass for critical situations

### 2. Comprehensive Metrics Collection
- **Multiple Metric Types**: Counter, Gauge, Histogram, Summary
- **Rich Labeling**: Dimensional metrics with custom labels
- **Environment Separation**: Per-environment metric tracking
- **Automatic Cleanup**: Configurable retention periods

### 3. Multi-Channel Notifications
- **Email Alerts**: Rich HTML formatting with redaction
- **Slack Integration**: Structured notifications with context
- **PagerDuty Integration**: Critical alert escalation
- **Webhook Support**: Custom notification endpoints

### 4. Real-time Dashboard
- **System Health Overview**: Key performance indicators
- **Rate Limiting Status**: Active limits and escalation levels
- **Error Trends**: Patterns and anomaly detection
- **Metrics Visualization**: Time-series data analysis

## Architecture

### Database Schema

#### Alert Rate Limits (`alert_rate_limits`)
```sql
CREATE TABLE alert_rate_limits (
  id UUID PRIMARY KEY,
  rule_name TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  bucket_window_minutes INTEGER DEFAULT 60,
  max_alerts_per_window INTEGER DEFAULT 5,
  current_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  escalation_level INTEGER DEFAULT 0,
  next_escalation_at TIMESTAMPTZ,
  -- ... additional fields
);
```

#### Observability Metrics (`observability_metrics`)
```sql
CREATE TABLE observability_metrics (
  id UUID PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
  value NUMERIC NOT NULL,
  labels JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  environment TEXT DEFAULT 'development'
);
```

#### Alert Notifications (`alert_notifications`)
```sql
CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY,
  alert_instance_id UUID REFERENCES alert_instances(id),
  channel TEXT CHECK (channel IN ('email', 'slack', 'pagerduty', 'webhook')),
  recipient TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending', 'delivered')),
  attempt_count INTEGER DEFAULT 1,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  -- ... additional fields
);
```

## Usage Guide

### 1. Enhanced Error Logging

#### Basic Usage
```typescript
// Edge Function example
const response = await fetch('/functions/v1/log-error', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    error_type: 'database_connection_failed',
    message: 'Failed to connect to primary database',
    context: 'database',
    severity: 'critical',
    use_enhanced_observability: true,
    labels: {
      region: 'us-east-1',
      service: 'api'
    }
  })
})
```

#### Advanced Features
```typescript
// Override rate limiting for emergency alerts
const emergencyLog = {
  error_type: 'security_breach',
  message: 'Potential security incident detected',
  severity: 'critical',
  override_rate_limit: true,
  use_enhanced_observability: true,
  labels: {
    incident_type: 'unauthorized_access',
    confidence: 'high'
  }
}
```

### 2. Metrics Recording

#### Direct API Usage
```typescript
import { EnhancedObservability } from '../supabase/functions/_shared/enhanced-observability.ts'

const observability = new EnhancedObservability(supabaseAdmin)

// Record performance metrics
await observability.recordMetric({
  name: 'api_response_time',
  type: 'histogram',
  value: responseTimeMs,
  labels: {
    endpoint: '/api/documents',
    method: 'GET',
    status_code: '200'
  }
})

// Record business metrics
await observability.recordMetric({
  name: 'document_uploads',
  type: 'counter',
  value: 1,
  labels: {
    user_tier: 'premium',
    file_type: 'pdf',
    size_bucket: 'large'
  }
})
```

#### Batch Recording
```typescript
await observability.recordMetrics([
  {
    name: 'concurrent_users',
    type: 'gauge',
    value: activeUserCount,
    labels: { region: 'us-east-1' }
  },
  {
    name: 'database_queries',
    type: 'counter',
    value: 1,
    labels: { operation: 'select', table: 'documents' }
  }
])
```

### 3. Alert Management

#### Triggering Custom Alerts
```typescript
const alertResult = await observability.triggerAlert(
  'high_error_rate',
  'High Error Rate Detected',
  `Error rate exceeded threshold: ${errorRate}%`,
  {
    current_rate: errorRate,
    threshold: maxErrorRate,
    window: '5m'
  }
)

if (alertResult?.rate_limited) {
  console.log(`Alert rate limited, escalation level: ${alertResult.escalation_level}`)
}
```

#### Rate Limit Status
```typescript
const rateLimits = await observability.getRateLimitStatus('critical_errors')
for (const limit of rateLimits) {
  console.log(`Rule: ${limit.rule_name}`)
  console.log(`Rate Limited: ${limit.is_rate_limited}`)
  console.log(`Escalation Level: ${limit.escalation_level}`)
  console.log(`Window Progress: ${limit.window_progress_percent}%`)
}
```

## Dashboard and Monitoring

### 1. Observability Dashboard

#### Command Line Interface
```bash
# View current system status
npm run observability:dashboard

# JSON output for automation
npm run observability:dashboard:json

# Production environment specific
npm run observability:dashboard:prod

# Custom time range
npx tsx scripts/observability-dashboard.ts --hours=12 --environment=staging
```

#### Dashboard Sections
- **System Health Overview**: Key metrics and health score
- **Alert Rate Limiting Status**: Active limits and escalation levels
- **Metrics Summary**: Aggregated data by type and environment
- **Error Analysis**: Error patterns and frequency

### 2. Automated Monitoring

#### Health Checks
```bash
# Run comprehensive health monitoring
npm run salt:monitor:alerts

# Check specific components
npx tsx scripts/monitor-salt-health.ts --json | jq '.overall_status'
```

#### CI Integration
```yaml
# GitHub Actions example
- name: Check Observability Health
  run: |
    npm run observability:dashboard:json > observability-report.json
    CRITICAL_ERRORS=$(jq '.system_health.critical_errors_24h' observability-report.json)
    if [ "$CRITICAL_ERRORS" -gt 5 ]; then
      echo "Too many critical errors: $CRITICAL_ERRORS"
      exit 1
    fi
```

## Configuration

### Environment Variables

#### Required Variables
```bash
# Database Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Notifications
RESEND_API_KEY=re_your-resend-key
MONITORING_ALERT_EMAIL=alerts@yourdomain.com
MONITORING_ALERT_FROM="System Alerts <alerts@yourdomain.com>"

# Environment Identification
MONITORING_ENVIRONMENT=production
NODE_ENV=production
```

#### Optional Integrations
```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# PagerDuty Integration
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-integration-key

# Rate Limiting Configuration
ALERT_RATE_LIMIT_MINUTES=30
```

### Alert Rules Configuration

#### Database Configuration
```sql
-- Create custom alert rule
INSERT INTO alert_escalation_rules (
  rule_name,
  severity,
  initial_cooldown_minutes,
  escalation_multiplier,
  max_escalation_level,
  escalation_channels
) VALUES (
  'api_latency_high',
  'high',
  15,
  1.5,
  3,
  '{email,slack}'
);
```

#### Application Configuration
```typescript
// Custom alert thresholds
const ALERT_THRESHOLDS = {
  error_rate: { warning: 5, critical: 10 },
  response_time: { warning: 1000, critical: 5000 },
  memory_usage: { warning: 80, critical: 95 }
}
```

## Rate Limiting Algorithm

### 1. Sliding Window Implementation
```
Window: [---60 minutes---]
Alerts:     ^   ^   ^   ^
Time:      -45 -30 -15  0

Current Count: 4
Max Allowed: 5
Status: ✅ Allowed (1 remaining)
```

### 2. Escalation Strategy
```
Level 0: Normal rate limiting (5 alerts/hour)
Level 1: Reduced rate (2 alerts/hour) + 2x cooldown
Level 2: Critical only (1 alert/hour) + 4x cooldown
Level 3: Emergency bypass + PagerDuty escalation
```

### 3. Fingerprint Generation
```typescript
// Fingerprint components
const fingerprint = sha256([
  environment,
  error_type,
  normalized_message,
  context
].join('|'))

// Deduplication logic
if (existingAlert.fingerprint === fingerprint && 
    withinCooldownWindow(existingAlert.created_at)) {
  return suppressAlert(existingAlert)
}
```

## Best Practices

### 1. Alert Design
- **Actionable Alerts**: Every alert should have a clear response action
- **Severity Mapping**: Use consistent severity levels across the system
- **Context Enrichment**: Include relevant debugging information
- **Rate Limit Awareness**: Design for burst scenarios

### 2. Metrics Strategy
- **Consistent Naming**: Use standardized metric naming conventions
- **Dimensional Modeling**: Leverage labels for drill-down analysis
- **Cardinality Control**: Avoid high-cardinality label values
- **Retention Management**: Configure appropriate data retention

### 3. Notification Channels
- **Channel Selection**: Route alerts based on severity and team
- **Escalation Paths**: Define clear escalation procedures
- **Feedback Loops**: Monitor notification delivery and effectiveness
- **Maintenance Windows**: Suppress alerts during planned maintenance

## Troubleshooting

### Common Issues

#### High Alert Volume
```bash
# Check rate limiting status
npm run observability:dashboard | grep "Rate Limited"

# Analyze alert patterns
psql $DATABASE_URL -c "
  SELECT rule_name, COUNT(*), MAX(escalation_level)
  FROM alert_rate_limits 
  WHERE current_count > max_alerts_per_window
  GROUP BY rule_name;
"
```

#### Missing Notifications
```bash
# Check notification delivery status
psql $DATABASE_URL -c "
  SELECT channel, status, COUNT(*) 
  FROM alert_notifications 
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY channel, status;
"
```

#### Metrics Data Issues
```bash
# Verify metrics collection
npm run observability:dashboard:json | jq '.metrics_summary | length'

# Check for data gaps
psql $DATABASE_URL -c "
  SELECT metric_name, COUNT(*), MAX(timestamp) as latest
  FROM observability_metrics 
  WHERE timestamp > NOW() - INTERVAL '1 day'
  GROUP BY metric_name
  ORDER BY latest DESC;
"
```

### Performance Tuning

#### Database Optimization
```sql
-- Index optimization for metrics queries
CREATE INDEX CONCURRENTLY idx_metrics_name_time_env 
ON observability_metrics(metric_name, timestamp DESC, environment);

-- Partition large tables by time
CREATE TABLE observability_metrics_2024_01 
PARTITION OF observability_metrics 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### Rate Limiting Tuning
```sql
-- Adjust rate limits based on usage patterns
UPDATE alert_rate_limits 
SET max_alerts_per_window = 10,
    bucket_window_minutes = 30
WHERE rule_name = 'high_traffic_errors';
```

## Maintenance

### Data Cleanup
```bash
# Clean up old observability data
psql $DATABASE_URL -c "SELECT cleanup_observability_data(30, 7);"

# Automated cleanup (add to cron)
0 2 * * * psql $DATABASE_URL -c "SELECT cleanup_observability_data();"
```

### Health Monitoring
```bash
# Daily health check
npm run observability:dashboard:json > /var/log/observability/$(date +%Y%m%d).json

# Alert on system degradation
HEALTH_SCORE=$(npm run observability:dashboard:json | jq '.system_health.health_score')
if [ "$HEALTH_SCORE" -lt 80 ]; then
  # Send escalated alert
fi
```

---

## Summary

The enhanced observability system provides production-ready monitoring with:

- ✅ **Sophisticated Rate Limiting**: Prevents alert fatigue while maintaining visibility
- ✅ **Rich Metrics Collection**: Comprehensive system and business metrics
- ✅ **Multi-Channel Notifications**: Flexible alerting across platforms
- ✅ **Real-time Dashboards**: Actionable insights and trend analysis
- ✅ **Automated Maintenance**: Self-managing data lifecycle

This system scales from development to enterprise production environments while maintaining observability best practices.