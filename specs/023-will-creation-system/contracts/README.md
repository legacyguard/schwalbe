# Will Creation System - API Contracts

## Overview

This directory contains the API contract specifications for the Will Creation System. The contracts define the interfaces between the will generation service and external systems, ensuring consistent integration and reliable communication.

## API Specifications

### will-generation-api.yaml

**Purpose:** Core will generation and management endpoints

**Endpoints:**

- `POST /api/wills` - Create new will
- `GET /api/wills/{id}` - Retrieve will details
- `PUT /api/wills/{id}` - Update will data
- `POST /api/wills/{id}/generate` - Generate PDF document
- `GET /api/wills/{id}/validate` - Validate will legally

**Key Features:**

- RESTful design with JSON payloads
- Comprehensive error handling
- Rate limiting and authentication
- Versioned API with backward compatibility

### legal-validation-api.yaml

**Purpose:** Legal compliance checking and validation services

**Endpoints:**

- `POST /api/validation/jurisdiction` - Validate jurisdiction requirements
- `POST /api/validation/clauses` - Validate clause assembly
- `GET /api/validation/rules/{jurisdiction}` - Get validation rules
- `POST /api/validation/compliance` - Check legal compliance

**Key Features:**

- Jurisdiction-specific validation rules
- Real-time validation feedback
- Legal requirement checking
- Compliance reporting

### template-management-api.yaml

**Purpose:** Legal template management and versioning

**Endpoints:**

- `GET /api/templates` - List available templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/{id}` - Update template
- `GET /api/templates/{id}/versions` - Get template versions
- `POST /api/templates/{id}/validate` - Validate template

**Key Features:**

- Template versioning and rollback
- Jurisdiction mapping
- Template validation
- Change tracking

### pdf-generation-api.yaml

**Purpose:** Document generation and formatting services

**Endpoints:**

- `POST /api/pdf/generate` - Generate PDF from will data
- `GET /api/pdf/{id}/status` - Check generation status
- `GET /api/pdf/{id}/download` - Download generated PDF
- `POST /api/pdf/preview` - Generate preview

**Key Features:**

- Asynchronous PDF generation
- Progress tracking
- Multiple format support
- Document integrity verification

### i18n-legal-api.yaml

**Purpose:** Internationalization and localization services

**Endpoints:**

- `GET /api/i18n/languages` - Get supported languages
- `POST /api/i18n/translate` - Translate legal content
- `GET /api/i18n/templates/{jurisdiction}` - Get localized templates
- `POST /api/i18n/validate` - Validate translations

**Key Features:**

- Multi-language legal content
- Jurisdiction-language mapping
- Translation validation
- Cultural adaptation

## Contract Standards

### Request/Response Format

All APIs use consistent JSON format with the following structure:

**Request:**

```json
{
  "data": {
    // Request payload
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2025-01-25T10:00:00Z",
    "requestId": "uuid"
  }
}
```

**Response:**

```json
{
  "data": {
    // Response payload
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2025-01-25T10:00:00Z",
    "requestId": "uuid"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Handling

Standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "fullName",
      "reason": "required"
    },
    "suggestion": "Please provide a valid full name"
  },
  "metadata": {
    "version": "1.0",
    "timestamp": "2025-01-25T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### Authentication

All endpoints require Supabase Auth JWT Bearer tokens for user flows. Include a correlation header on all requests (e.g., X-Request-ID). Do not log Authorization headers.

```http
Authorization: Bearer <supabase_jwt>
X-Request-ID: <uuid>
```

### Observability

- Use structured logs from Supabase Edge Functions as the primary source of truth.
- For critical failures, send email alerts via Resend.
- Do not use Sentry in this project; external observability systems are optional and complementary.

### Rate Limiting

API rate limits are enforced per user:

- Will Generation: 100 requests/hour
- Legal Validation: 500 requests/hour
- Template Access: 1000 requests/hour
- PDF Generation: 50 requests/hour

## Versioning Strategy

### API Versioning

- URL-based versioning: `/api/v1/wills`
- Header-based versioning: `Accept-Version: 1.0`
- Semantic versioning: MAJOR.MINOR.PATCH

### Contract Versioning

- Contracts versioned with semantic versioning
- Backward compatibility maintained within major versions
- Breaking changes require new major version
- Deprecation notices for deprecated endpoints

## Testing Contracts

### Contract Testing

- Automated API contract validation
- Schema validation for all requests/responses
- Integration tests for all endpoints
- Performance testing under load

### Mock Services

- Mock implementations for development
- Contract-compliant test doubles
- Error scenario simulation
- Performance testing fixtures

## Monitoring & Observability

### Metrics Collection

- Response time tracking
- Error rate monitoring
- Usage pattern analysis
- Performance benchmarking

### Logging Standards

- Structured logging with consistent format
- Request/response correlation IDs
- Error context and stack traces
- Security event logging

## Security Considerations

### Data Protection

- End-to-end encryption for sensitive data
- Secure key management
- Audit trail for all operations
- GDPR/CCPA compliance

### Access Control

- Role-based access control (RBAC)
- Fine-grained permissions
- API key management
- Rate limiting and throttling

## Future Enhancements

### Planned APIs

- **will-collaboration-api.yaml** - Multi-user will editing
- **legal-ai-api.yaml** - AI-powered legal assistance
- **document-signing-api.yaml** - Digital signature integration
- **legal-compliance-api.yaml** - Automated compliance monitoring

### API Evolution

- GraphQL API for complex queries
- WebSocket support for real-time updates
- Event-driven architecture
- Microservices integration

This API contract suite provides a solid foundation for the Will Creation System, ensuring reliable integration with external systems and maintaining high standards for security, performance, and usability.
