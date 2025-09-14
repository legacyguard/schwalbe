# Emergency Access System - API Contracts

This directory contains the API contract specifications for the Emergency Access System, defining the interfaces and data structures for all emergency access operations.

## API Contract Files

### Core Emergency Functions

#### verify-emergency-access.contract.ts

**Purpose:** Emergency access token verification and document retrieval
**Function:** verify-emergency-access (Supabase Edge Function)

**Key Features:**

- Token-based authentication with verification codes
- Permission-based document access control
- Comprehensive audit logging
- Survivor manual and emergency contact integration

#### activate-family-shield.contract.ts

**Purpose:** Family Shield emergency activation with guardian notifications
**Function:** activate-family-shield (Supabase Edge Function)

**Key Features:**

- Multi-reason activation (manual, inactivity, health_check, emergency)
- Personality-aware notification messaging (empathetic, pragmatic, adaptive)
- Secure token generation with configurable expiration
- Guardian permission mapping and notification queuing

#### download-emergency-document.contract.ts

**Purpose:** Secure document download with permission validation
**Function:** download-emergency-document (Supabase Edge Function)

**Key Features:**

- Secure document access with signed URLs
- Category-based permission filtering
- Comprehensive access logging
- File type validation and security controls

#### check-inactivity.contract.ts

**Purpose:** Automated user inactivity monitoring and guardian notifications
**Function:** check-inactivity (Supabase Edge Function)

**Key Features:**

- Configurable inactivity threshold monitoring
- Grace period handling with user notifications
- Automated notification escalation to guardians
- False positive prevention mechanisms

#### protocol-inactivity-checker.contract.ts

**Purpose:** Advanced inactivity detection with protocol state management
**Function:** protocol-inactivity-checker (Supabase Edge Function)

**Key Features:**

- Protocol status transitions (inactive → pending_verification → active)
- User verification email system
- Audit log integration
- Advanced inactivity pattern recognition

## Contract Standards

### Authentication

All API endpoints require authentication using Supabase Auth JWT Bearer tokens for user/guardian-facing flows. API keys are reserved for trusted system-to-system integrations. Include a correlation header on all requests.

- Bearer token (Supabase Auth JWT)
- X-Request-ID correlation header
- Multi-factor verification for sensitive operations

Security notes:

- Emergency tokens must be opaque and stored as hashes; never log tokens or Authorization headers.
- No client exposure of Supabase service role keys.
- See 005-auth-rls-baseline for identity and RLS conventions.

### Response Format

Standard JSON response format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string | null,
  "meta": {
    "timestamp": string,
    "request_id": string,
    "version": string
  }
}
```

### Error Handling

Standardized error responses:

- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - System error

### Rate Limiting

API rate limits:

- Emergency activation: 10 requests per hour per user
- Document access: 100 requests per hour per guardian
- Status checks: 1000 requests per hour per user
- Verification attempts: 5 attempts per hour per guardian

### Data Validation

Input validation rules:

- Required field validation
- Data type checking
- Format validation (email, phone, etc.)
- Business rule validation
- Security validation (XSS, injection prevention)

## Testing Contracts

### Unit Testing

Contract validation tests:

- Request/response schema validation
- Error response format verification
- Authentication requirement testing
- Rate limiting validation

### Integration Testing

End-to-end contract testing:

- API endpoint availability
- Request/response cycle validation
- Error handling verification
- Performance requirement validation

### Contract Compliance

Automated contract compliance:

- OpenAPI specification validation
- Schema compliance checking
- Breaking change detection
- Backward compatibility verification

## Versioning

### API Versioning

Semantic versioning for API contracts:

- Major version: Breaking changes
- Minor version: New features (backward compatible)
- Patch version: Bug fixes and improvements

### Contract Evolution

Contract update process:

1. Propose contract changes
2. Review impact on existing clients
3. Update contract specifications
4. Implement backward compatibility
5. Update client integrations
6. Deprecate old contract versions

## Security Considerations

### Data Protection

- All sensitive data encrypted in transit and at rest
- PII data access logged and monitored
- GDPR compliance for data handling
- Data retention policies enforced

### Access Control

- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Time-based access restrictions
- Geographic access controls

### Audit & Compliance

- Complete audit trail for all API calls
- Compliance logging for regulatory requirements
- Security event monitoring and alerting
- Incident response procedures

## Monitoring & Observability

### Observability Baseline (required)

- Use structured logs from Supabase Edge Functions as the primary source of truth.
- For critical failures, send email alerts via Resend.
- Do not use Sentry in this project; external observability systems are optional and complementary.
- Include a correlation ID on all requests and propagate it through logs.

### API Metrics

Key performance indicators:

- Response time distribution
- Error rate by endpoint
- Request volume and patterns
- Authentication success/failure rates

### Health Checks

API health monitoring:

- Endpoint availability checks
- Dependency health validation
- Performance threshold monitoring
- Automated alerting and recovery

### Logging

Comprehensive API logging:

- Request/response logging
- Error and exception logging
- Security event logging
- Performance metric logging

## Future Enhancements

### Planned Improvements

- GraphQL API support
- Real-time WebSocket connections
- Advanced caching strategies
- Machine learning integration
- Enhanced security features

### API Evolution

Future API development:

- Microservice architecture support
- Event-driven API patterns
- AI-powered API optimization
- Advanced analytics integration
