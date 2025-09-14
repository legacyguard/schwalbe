# Professional Network API Contracts

This directory contains the OpenAPI specifications for the Professional Network system APIs. These contracts define the interfaces for all external and internal integrations.

## API Specifications

### 1. Professional Management API

**File**: `professional-management-api.yaml`

Manages professional profiles, verification, and onboarding processes.

**Key Endpoints**:

- `POST /api/professional/onboard` - Submit professional application
- `GET /api/professional/profile/{id}` - Get professional profile
- `PUT /api/professional/verify/{id}` - Admin verification of professional
- `GET /api/professional/search` - Search professionals by criteria
- `PUT /api/professional/availability/{id}` - Update professional availability

**Authentication**: Bearer token (Supabase Auth JWT)

### 2. Review System API

**File**: `review-system-api.yaml`

Handles document review requests, assignments, and completion workflows.

**Key Endpoints**:

- `POST /api/reviews/request` - Submit document review request
- `GET /api/reviews/{id}` - Get review details
- `PUT /api/reviews/{id}/assign` - Assign review to professional
- `POST /api/reviews/{id}/submit` - Submit completed review
- `GET /api/reviews/{id}/result` - Get review results and feedback

**Authentication**: Bearer token (Supabase Auth JWT)

### 3. Booking System API

**File**: `booking-system-api.yaml`

Manages consultation booking, scheduling, and calendar integration.

**Key Endpoints**:

- `POST /api/consultations/book` - Book consultation with professional
- `GET /api/consultations/{id}` - Get consultation details
- `PUT /api/consultations/{id}/reschedule` - Reschedule consultation
- `DELETE /api/consultations/{id}` - Cancel consultation
- `GET /api/professional/availability/{id}` - Get professional availability

**Authentication**: Bearer token (Supabase Auth JWT)

### 4. Payment Integration API

**File**: `payment-integration-api.yaml`

Handles commission calculations, payment processing, and financial reporting.

**Key Endpoints**:

- `GET /api/professional/commissions` - Get commission history
- `POST /api/admin/commissions/process` - Process commission payment
- `GET /api/professional/commissions/summary` - Get commission summary
- `POST /api/commissions/dispute` - Create commission dispute
- `GET /api/payments/history` - Get payment transaction history

**Authentication**: Bearer token (Supabase Auth JWT)

### 5. Analytics Monitoring API

**File**: `analytics-monitoring-api.yaml`

Provides analytics, monitoring, and reporting capabilities.

**Key Endpoints**:

- `GET /api/analytics/professional/{id}` - Get professional analytics
- `GET /api/analytics/system/performance` - Get system performance metrics
- `GET /api/analytics/reviews/quality` - Get review quality metrics
- `GET /api/analytics/financial/summary` - Get financial analytics
- `POST /api/monitoring/events` - Log monitoring events

**Authentication**: Bearer token (Supabase Auth JWT). For server-to-server ingestion, use Supabase service role or hashed single-use tokens (see Token Handling Best Practices).

## Common API Patterns

### Authentication

All APIs use Bearer token authentication with Supabase Auth JWT tokens:

```http
Authorization: Bearer {{SUPABASE_JWT}}
```

- For client applications, obtain the JWT via Supabase Auth and include it with each request.
- For server-to-server operations, use the Supabase service role in secure server contexts only; never expose service role tokens to clients.

### Response Format

Standard JSON response format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... } // For list endpoints
}
```

### Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional additional details
  }
}
```

### Pagination

List endpoints support cursor-based pagination:

```json
{
  "data": [...],
  "pagination": {
    "hasNext": true,
    "nextCursor": "cursor-token",
    "total": 150
  }
}
```

## Rate Limiting

- **Authenticated Users**: 1000 requests per hour
- **Admin Users**: 5000 requests per hour
- **Public Endpoints**: 100 requests per hour

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

## Webhook Endpoints

### Stripe Webhooks

- `POST /api/webhooks/stripe` - Handle Stripe payment events
- **Events**: `payment_intent.succeeded`, `payout.created`, `dispute.created`

### Calendar Integration Webhooks

- `POST /api/webhooks/calendar` - Handle calendar event updates
- **Events**: `event.created`, `event.updated`, `event.cancelled`

## Data Validation

### Input Validation

- All inputs are validated using JSON Schema
- Business rule validation is performed at the service layer
- Comprehensive error messages for validation failures

### Output Sanitization

- All outputs are sanitized to prevent XSS attacks
- Sensitive data is masked or excluded based on user permissions
- Consistent data formatting across all endpoints

## Versioning

API versioning follows semantic versioning:

- **v1.0.0**: Initial release
- **v1.1.0**: Added commission dispute functionality
- **v1.2.0**: Enhanced analytics and reporting

Version is specified in the URL path:

```http
/api/v1/professional/onboard
```

## Testing

### API Testing

- Postman collection available in `/docs/api/`
- Automated tests using Jest and Supertest
- Integration tests with test database

### Contract Testing

- OpenAPI specification validation
- Schema validation for all endpoints
- Response format verification

## Monitoring

### Health Checks

- `GET /api/health` - Overall system health
- `GET /api/health/database` - Database connectivity
- `GET /api/health/external` - External service connectivity

### Metrics

- Response times and error rates
- Request volume and throughput
- Database query performance
- External API call success rates

### Observability Baseline

- Structured logging in Supabase Edge Functions (include requestId, userId, path, status, latency; redact PII)
- Critical error alerts via Resend email; no Sentry
- Never log raw tokens or secrets

## Security

### Transport Security

- All endpoints require HTTPS
- TLS 1.3 minimum
- Certificate pinning for mobile clients

### Data Security

- End-to-end encryption for sensitive data
- Data at rest encryption in database
- Secure key management with rotation

### Access Control

- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Row Level Security (RLS) enforced at the database layer with owner-first defaults
- API token usage restricted to server-only contexts (never in clients)

### Token Handling Best Practices

- Use hashed single-use tokens for any external or ingestion endpoints.
- Store only token_hash with created_at and expires_at; never store or log raw tokens.
- Enforce max age and invalidate tokens on first use.
- Keep Supabase service role tokens only in server/Edge Functions; never expose to clients.

## Support

### Documentation

- Complete OpenAPI specifications
- Interactive API documentation (Swagger UI)
- Code examples in multiple languages
- Troubleshooting guides

### Support Channels

- API status page: `https://status.legacyguard.app`
- Developer forum: `https://developers.legacyguard.app`
- Email support: `api-support@legacyguard.app`
- Emergency hotline: `1-800-API-HELP`
