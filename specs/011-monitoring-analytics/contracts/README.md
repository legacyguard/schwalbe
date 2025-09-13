# Monitoring & Analytics API Contracts

This directory contains the API contracts and specifications for the monitoring and analytics system.

## API Contract Files

### monitoring-system-api.yaml

Core monitoring system API for health checks, metrics collection, and system monitoring.

**Endpoints:**

- `GET /api/monitoring/health` - System health check
- `POST /api/monitoring/metrics` - Submit performance metrics
- `GET /api/monitoring/metrics/{type}` - Retrieve metrics by type
- `POST /api/monitoring/alerts` - Create monitoring alerts
- `GET /api/monitoring/alerts` - List active alerts
- `PUT /api/monitoring/alerts/{id}` - Update alert status

### analytics-tracking-api.yaml

Analytics tracking API for user behavior and event collection.

**Endpoints:**

- `POST /api/analytics/events` - Track user events
- `GET /api/analytics/events` - Query analytics events
- `POST /api/analytics/pageview` - Track page views
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/analytics/user-action` - Track user actions
- `GET /api/analytics/user/{id}` - Get user analytics

### performance-monitoring-api.yaml

Performance monitoring API for Web Vitals and custom performance metrics.

**Endpoints:**

- `POST /api/performance/vitals` - Submit Web Vitals
- `GET /api/performance/vitals` - Get performance vitals
- `POST /api/performance/custom` - Submit custom metrics
- `GET /api/performance/budget` - Check performance budget
- `POST /api/performance/alert` - Performance alert webhook
- `GET /api/performance/trends` - Get performance trends

### error-logging-api.yaml

Error logging and tracking API for structured error management.

**Endpoints:**

- `POST /api/errors/log` - Log application errors
- `GET /api/errors` - Query error logs
- `GET /api/errors/{id}` - Get specific error details
- `POST /api/errors/batch` - Batch error logging
- `GET /api/errors/summary` - Get error summary statistics
- `PUT /api/errors/{id}/resolve` - Mark error as resolved

### reporting-dashboard-api.yaml

Reporting and dashboard API for monitoring data visualization.

**Endpoints:**

- `GET /api/dashboard/health` - Dashboard health data
- `GET /api/dashboard/performance` - Performance dashboard data
- `GET /api/dashboard/analytics` - Analytics dashboard data
- `GET /api/dashboard/errors` - Error dashboard data
- `POST /api/dashboard/config` - Save dashboard configuration
- `GET /api/dashboard/config` - Get dashboard configuration

## Authentication & Authorization

All API endpoints require authentication using Supabase JWT tokens. The monitoring system uses the following authorization levels:

- **Service Role**: Full access to all monitoring data (used by backend services)
- **Admin**: Read/write access to monitoring data and configuration
- **User**: Read-only access to their own analytics data
- **Public**: Limited read access to public health endpoints

## Data Formats

### Monitoring Data Format

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "web-app",
  "metric": "response_time",
  "value": 150.5,
  "unit": "ms",
  "tags": {
    "endpoint": "/api/users",
    "method": "GET"
  }
}
```

### Analytics Event Format

```json
{
  "event_type": "page_view",
  "user_id": "uuid",
  "session_id": "session-123",
  "timestamp": "2024-01-01T00:00:00Z",
  "event_data": {
    "page": "/dashboard",
    "referrer": "/login",
    "duration": 30000
  },
  "device_info": {
    "browser": "Chrome",
    "platform": "desktop",
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

### Error Log Format

```json
{
  "error_type": "javascript",
  "message": "TypeError: Cannot read property 'x' of undefined",
  "stack": "at Component.render (component.js:15:10)",
  "severity": "high",
  "context": {
    "user_id": "uuid",
    "page": "/dashboard",
    "user_agent": "Mozilla/5.0..."
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **Health endpoints**: 100 requests per minute per IP
- **Metrics submission**: 1000 requests per minute per authenticated user
- **Analytics events**: 500 requests per minute per session
- **Error logging**: 200 requests per minute per user
- **Dashboard queries**: 50 requests per minute per user

## Response Codes

### Success Responses

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted for processing

### Error Responses

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Webhook Endpoints

### Alert Webhooks

```json
{
  "webhook_type": "alert",
  "alert_id": "uuid",
  "alert_type": "performance_threshold",
  "severity": "high",
  "message": "API response time exceeded 5 seconds",
  "data": {
    "metric": "api_response_time",
    "value": 5500,
    "threshold": 5000
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Health Webhooks

```json
{
  "webhook_type": "health",
  "service": "api",
  "status": "degraded",
  "previous_status": "healthy",
  "response_time": 3500,
  "error_rate": 5.2,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Data Retention

- **Raw metrics**: 30 days
- **Aggregated data**: 90 days
- **Analytics events**: 90 days
- **Error logs**: 90 days
- **Health checks**: 30 days
- **Alert history**: 1 year

## Privacy Compliance

All APIs implement GDPR compliance features:

- **Data minimization**: Only necessary data collected
- **Consent management**: User consent required for analytics
- **Data anonymization**: Personal data automatically anonymized
- **Right to erasure**: User data deletion endpoints
- **Data portability**: User data export capabilities
- **Audit logging**: All data access logged for compliance

## Versioning

API versioning follows semantic versioning:

- **v1.0.0**: Initial release with core monitoring features
- **v1.1.0**: Added advanced analytics and performance insights
- **v1.2.0**: Enhanced privacy controls and GDPR compliance
- **v2.0.0**: Major rewrite with improved scalability and real-time features

## Testing

API contracts include comprehensive test scenarios:

- **Unit tests**: Individual endpoint functionality
- **Integration tests**: End-to-end API workflows
- **Load tests**: Performance under high load
- **Security tests**: Authentication and authorization
- **Privacy tests**: GDPR compliance validation

## Monitoring

APIs include built-in monitoring:

- **Request metrics**: Response times, error rates, throughput
- **Health endpoints**: Service availability and performance
- **Alert integration**: Automatic alerting for API issues
- **Audit logging**: All API access logged for security
- **Performance tracking**: API performance monitoring and optimization
