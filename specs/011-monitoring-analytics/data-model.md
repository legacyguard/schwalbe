# Data Model: Monitoring & Analytics System

## Core Entities

### MonitoringMetric Entity

Represents individual performance and system metrics collected from the platform.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier for the metric
- `name` (VARCHAR): Metric name (e.g., 'FCP', 'API_RESPONSE_TIME')
- `value` (DECIMAL): Numeric value of the metric
- `unit` (VARCHAR): Unit of measurement ('ms', 'bytes', 'count', 'percentage')
- `timestamp` (TIMESTAMP): When the metric was recorded
- `session_id` (VARCHAR): User session identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user
- `metadata` (JSONB): Additional context data
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Belongs to User (optional, for authenticated metrics)
- Aggregated into Performance Reports

### AnalyticsEvent Entity

Tracks user interactions and behavior analytics events.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier for the event
- `user_id` (UUID, Foreign Key): Reference to authenticated user
- `event_type` (VARCHAR): Type of event ('page_view', 'user_action', 'error')
- `event_data` (JSONB): Structured event data payload
- `session_id` (VARCHAR): User session identifier
- `device_info` (JSONB): Browser, platform, and device information
- `page_url` (VARCHAR): Current page URL for context
- `referrer` (VARCHAR): Referring page URL
- `timestamp` (TIMESTAMP): Event timestamp
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Belongs to User
- Used in Analytics Reports and Dashboards

### PerformanceData Entity

Stores aggregated performance metrics and Web Vitals data.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key): Reference to user
- `session_id` (VARCHAR): Session identifier
- `metric_type` (VARCHAR): Type of performance metric
- `metric_value` (DECIMAL): Performance value
- `metric_unit` (VARCHAR): Unit of measurement
- `page_url` (VARCHAR): Page where metric was collected
- `device_info` (JSONB): Device and browser context
- `timestamp` (TIMESTAMP): Collection timestamp
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Belongs to User
- Aggregated for Performance Dashboards

### ErrorLog Entity

Structured error logging with context and severity information.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key): Reference to user (if authenticated)
- `error_type` (VARCHAR): Category of error ('javascript', 'api', 'network')
- `error_message` (TEXT): Error message
- `error_stack` (TEXT): Stack trace (sanitized)
- `severity` (VARCHAR): Error severity ('low', 'medium', 'high', 'critical')
- `context` (JSONB): Additional error context
- `user_agent` (VARCHAR): Browser user agent string
- `url` (VARCHAR): URL where error occurred
- `session_id` (VARCHAR): User session identifier
- `timestamp` (TIMESTAMP): Error timestamp
- `resolved` (BOOLEAN): Whether error has been resolved
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Belongs to User (optional)
- Triggers Alert Rules
- Used in Error Reports

### AlertRule Entity

Configurable rules for triggering alerts based on monitoring data.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `name` (VARCHAR): Human-readable rule name
- `description` (TEXT): Rule description and purpose
- `condition_type` (VARCHAR): Type of condition ('threshold', 'trend', 'pattern')
- `condition_config` (JSONB): Condition configuration parameters
- `severity` (VARCHAR): Alert severity level
- `enabled` (BOOLEAN): Whether rule is active
- `notification_channels` (VARCHAR[]): Channels for notifications ('email', 'slack')
- `cooldown_minutes` (INTEGER): Minimum time between alerts
- `last_triggered` (TIMESTAMP): Last time rule was triggered
- `created_by` (UUID): User who created the rule
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Created by User
- Triggers Alert Instances

### AlertInstance Entity

Individual alert instances triggered by alert rules.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `alert_rule_id` (UUID, Foreign Key): Reference to triggering rule
- `title` (VARCHAR): Alert title
- `message` (TEXT): Alert description
- `severity` (VARCHAR): Alert severity
- `status` (VARCHAR): Alert status ('active', 'acknowledged', 'resolved')
- `triggered_data` (JSONB): Data that triggered the alert
- `acknowledged_by` (UUID): User who acknowledged the alert
- `acknowledged_at` (TIMESTAMP): Acknowledgment timestamp
- `resolved_by` (UUID): User who resolved the alert
- `resolved_at` (TIMESTAMP): Resolution timestamp
- `created_at` (TIMESTAMP): Alert creation timestamp

**Relationships:**

- Belongs to AlertRule
- Acknowledged/Resolved by User

### Dashboard Entity

Configurable dashboard layouts for monitoring visualization.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key): Dashboard owner
- `name` (VARCHAR): Dashboard name
- `description` (TEXT): Dashboard description
- `layout_config` (JSONB): Dashboard layout configuration
- `widget_configs` (JSONB): Individual widget configurations
- `is_public` (BOOLEAN): Whether dashboard is publicly accessible
- `is_default` (BOOLEAN): Whether this is the default dashboard
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Relationships:**

- Belongs to User
- Contains Dashboard Widgets

### SystemHealth Entity

Health check results for platform services and components.

**Fields:**

- `id` (UUID, Primary Key): Unique identifier
- `service_name` (VARCHAR): Name of service being monitored
- `status` (VARCHAR): Health status ('healthy', 'degraded', 'down')
- `response_time_ms` (INTEGER): Response time in milliseconds
- `error_rate` (DECIMAL): Error rate percentage
- `last_error` (TEXT): Last error message
- `metadata` (JSONB): Additional health check metadata
- `checked_at` (TIMESTAMP): When health check was performed
- `created_at` (TIMESTAMP): Record creation timestamp

**Relationships:**

- Used in Health Dashboards
- Triggers Health Alerts

## Entity Relationships

```text
User (1) ──── (N) AnalyticsEvent
User (1) ──── (N) MonitoringMetric
User (1) ──── (N) PerformanceData
User (1) ──── (N) ErrorLog
User (1) ──── (N) AlertRule
User (1) ──── (N) Dashboard

AlertRule (1) ──── (N) AlertInstance

Dashboard (1) ──── (N) DashboardWidget (conceptual)
```

## Data Flow Patterns

### Analytics Data Flow

1. User interactions captured by monitoring service
2. Events buffered and batched for efficiency
3. Data validated and enriched with context
4. Stored in AnalyticsEvent table with proper indexing
5. Aggregated for reporting and dashboard display

### Performance Data Flow

1. Web Vitals and custom metrics collected automatically
2. Performance data buffered to minimize impact
3. Metrics validated and normalized
4. Stored in PerformanceData table with time-series indexing
5. Used for performance dashboards and alerting

### Error Data Flow

1. Errors captured with full context and stack traces
2. Error data sanitized for privacy compliance
3. Structured error information stored in ErrorLog table
4. Error patterns analyzed for alerting and reporting
5. Critical errors trigger immediate notifications

### Alert Data Flow

1. Monitoring data evaluated against alert rules
2. Rule conditions checked continuously or on schedule
3. Alert instances created when conditions met
4. Notifications sent via configured channels
5. Alert lifecycle tracked from creation to resolution

## Privacy and Compliance Considerations

### Data Minimization

- Only collect necessary data for monitoring and analytics
- Implement data retention policies with automatic cleanup
- Use data anonymization for sensitive information

### User Consent

- Require explicit consent for analytics tracking
- Provide easy opt-out mechanisms
- Respect Do Not Track preferences

### GDPR Compliance

- Implement right to erasure for user data
- Provide data export capabilities
- Maintain audit logs for data processing activities

### Data Security

- Encrypt sensitive monitoring data at rest
- Use RLS policies for data access control
- Implement proper authentication for dashboard access

## Indexing Strategy

### Performance Indexes

- `analytics_events(created_at, user_id)` for time-based queries
- `analytics_events(event_type, created_at)` for event type analysis
- `error_logs(severity, created_at)` for error severity filtering
- `performance_data(metric_type, timestamp)` for metric time-series
- `system_health(service_name, checked_at)` for health history

### Composite Indexes

- `analytics_events(user_id, event_type, created_at)` for user behavior analysis
- `error_logs(user_id, error_type, timestamp)` for user-specific error tracking
- `performance_data(user_id, metric_type, timestamp)` for user performance analysis

## Data Retention Policies

### Analytics Data

- Raw events: 90 days
- Aggregated summaries: 2 years
- User behavior patterns: 1 year

### Performance Data

- Raw metrics: 30 days
- Aggregated performance data: 1 year
- Performance trends: 2 years

### Error Data

- Error logs: 90 days
- Error summaries: 1 year
- Critical error archives: 2 years

### System Health Data

- Health check results: 30 days
- Health summaries: 1 year
- Health trend analysis: 2 years

## Migration Strategy

### From Hollywood Monitoring

1. Migrate existing monitoring service implementation
2. Port analytics event structures and schemas
3. Migrate performance monitoring configurations
4. Transfer error logging patterns and alerting rules
5. Update data models for enhanced privacy compliance

### Database Migration

1. Create new monitoring tables with proper RLS policies
2. Migrate existing data with data transformation
3. Update indexes for query performance
4. Implement data cleanup and retention policies
5. Validate data integrity and relationships
