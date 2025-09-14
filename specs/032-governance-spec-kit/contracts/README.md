# Governance Spec Kit - API Contracts

## Overview

This directory contains API contract definitions for the Governance Spec Kit system. These contracts define the interfaces and data structures used for integration between governance components and external systems.

## API Contract Files

Security note: All APIs require authentication/authorization aligned with Supabase Auth. Do not log raw secrets or tokens. Use least-privilege access for governance operations.

### spec-kit-api.yaml

**Purpose**: Defines the API contract for the Spec Kit Engine
**Endpoints**:

- `POST /api/v1/specs` - Create new specification
- `GET /api/v1/specs/{id}` - Retrieve specification details
- `PUT /api/v1/specs/{id}` - Update specification
- `DELETE /api/v1/specs/{id}` - Delete specification
- `POST /api/v1/specs/{id}/validate` - Validate specification compliance
- `GET /api/v1/specs/{id}/workflow` - Get specification workflow status

### linear-integration-api.yaml

**Purpose**: Defines the API contract for Linear integration
**Endpoints**:

- `GET /api/v1/linear/projects` - List Linear projects
- `POST /api/v1/linear/projects/{id}/sync` - Sync project data
- `GET /api/v1/linear/issues` - List project issues
- `POST /api/v1/linear/issues/{id}/update` - Update issue status
- `GET /api/v1/linear/webhooks` - Manage webhook configurations
- `POST /api/v1/linear/webhooks/test` - Test webhook connectivity

### pr-discipline-api.yaml

**Purpose**: Defines the API contract for PR discipline management
**Endpoints**:

- `GET /api/v1/pr/templates` - List available PR templates
- `POST /api/v1/pr/templates` - Create new PR template
- `GET /api/v1/pr/templates/{id}` - Get template details
- `PUT /api/v1/pr/templates/{id}` - Update PR template
- `POST /api/v1/pr/validate` - Validate PR against templates
- `GET /api/v1/pr/{id}/compliance` - Check PR compliance status

### documentation-management-api.yaml

**Purpose**: Defines the API contract for documentation management
**Endpoints**:

- `GET /api/v1/docs/standards` - List documentation standards
- `POST /api/v1/docs/standards` - Create documentation standard
- `GET /api/v1/docs/standards/{id}` - Get standard details
- `PUT /api/v1/docs/standards/{id}` - Update documentation standard
- `POST /api/v1/docs/validate` - Validate documentation compliance
- `GET /api/v1/docs/{id}/status` - Get documentation status

### governance-testing-api.yaml

**Purpose**: Defines the API contract for governance testing
**Endpoints**:

- `POST /api/v1/testing/run` - Execute governance tests
- `GET /api/v1/testing/results` - Get test results
- `GET /api/v1/testing/coverage` - Get test coverage metrics
- `POST /api/v1/testing/schedule` - Schedule automated tests
- `GET /api/v1/testing/reports` - Generate test reports

## Data Models

### Common Data Types

#### UUID

```yaml
type: string
format: uuid
description: Universally unique identifier
example: "550e8400-e29b-41d4-a716-446655440000"
```

#### Timestamp

```yaml
type: string
format: date-time
description: ISO 8601 timestamp
example: "2024-01-15T10:30:00Z"
```

#### Status

```yaml
type: string
enum: [active, inactive, pending, completed, failed]
description: Entity status
```

### GovernanceConfig

```yaml
type: object
properties:
  id:
    $ref: '#/components/schemas/UUID'
  name:
    type: string
    description: Configuration name
  version:
    type: string
    description: Configuration version
  rules:
    type: object
    description: Governance rules
  workflows:
    type: object
    description: Workflow definitions
  templates:
    type: object
    description: Template configurations
  created_at:
    $ref: '#/components/schemas/Timestamp'
  updated_at:
    $ref: '#/components/schemas/Timestamp'
required:
  - id
  - name
  - version
```

### SpecKitWorkflow

```yaml
type: object
properties:
  id:
    $ref: '#/components/schemas/UUID'
  config_id:
    $ref: '#/components/schemas/UUID'
  name:
    type: string
    description: Workflow name
  type:
    type: string
    enum: [spec, pr, documentation]
    description: Workflow type
  states:
    type: array
    description: Workflow states
  transitions:
    type: object
    description: State transitions
  validators:
    type: object
    description: Validation rules
  created_at:
    $ref: '#/components/schemas/Timestamp'
required:
  - id
  - config_id
  - name
  - type
```

### LinearProject

```yaml
type: object
properties:
  id:
    $ref: '#/components/schemas/UUID'
  linear_id:
    type: string
    description: Linear project ID
  name:
    type: string
    description: Project name
  description:
    type: string
    description: Project description
  status:
    $ref: '#/components/schemas/Status'
  priority:
    type: string
    enum: [low, medium, high, critical]
    description: Project priority
  progress:
    type: integer
    minimum: 0
    maximum: 100
    description: Progress percentage
  created_at:
    $ref: '#/components/schemas/Timestamp'
required:
  - id
  - linear_id
  - name
  - status
```

### PRTemplate

```yaml
type: object
properties:
  id:
    $ref: '#/components/schemas/UUID'
  config_id:
    $ref: '#/components/schemas/UUID'
  name:
    type: string
    description: Template name
  type:
    type: string
    enum: [feature, bugfix, documentation, hotfix]
    description: Template type
  content:
    type: string
    description: Template content
  fields:
    type: array
    description: Required fields
  validation_rules:
    type: object
    description: Validation rules
  is_default:
    type: boolean
    description: Default template flag
  created_at:
    $ref: '#/components/schemas/Timestamp'
required:
  - id
  - config_id
  - name
  - type
  - content
```

### DocumentationStandard

```yaml
type: object
properties:
  id:
    $ref: '#/components/schemas/UUID'
  config_id:
    $ref: '#/components/schemas/UUID'
  name:
    type: string
    description: Standard name
  type:
    type: string
    enum: [api, user, code, architecture]
    description: Documentation type
  template:
    type: string
    description: Documentation template
  requirements:
    type: object
    description: Documentation requirements
  validation_rules:
    type: object
    description: Validation rules
  is_mandatory:
    type: boolean
    description: Mandatory flag
  created_at:
    $ref: '#/components/schemas/Timestamp'
required:
  - id
  - config_id
  - name
  - type
  - template
```

## Authentication

### API Key Authentication

```yaml
securitySchemes:
  ApiKeyAuth:
    type: apiKey
    in: header
    name: X-API-Key
```

### Bearer Token Authentication

```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

## Error Handling

### Standard Error Response

```yaml
type: object
properties:
  error:
    type: object
    properties:
      code:
        type: string
        description: Error code
      message:
        type: string
        description: Error message
      details:
        type: object
        description: Additional error details
  timestamp:
    $ref: '#/components/schemas/Timestamp'
required:
  - error
  - timestamp
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Policies

- **Spec Operations**: 100 requests per minute
- **Linear Integration**: 50 requests per minute
- **PR Operations**: 200 requests per minute
- **Documentation Operations**: 150 requests per minute
- **Testing Operations**: 50 requests per minute

## Versioning

### API Versioning Strategy

- **URL Path Versioning**: `/api/v1/resource`
- **Header Versioning**: `Accept: application/vnd.governance.v1+json`
- **Semantic Versioning**: Major.Minor.Patch (e.g., 1.2.3)

### Backward Compatibility

- Maintain backward compatibility within major versions
- Deprecation warnings for deprecated endpoints
- Migration guides for breaking changes
- Support for multiple versions simultaneously

## Monitoring and Observability

### Health Check Endpoint

```yaml
GET /api/v1/health
responses:
  200:
    description: Service is healthy
  503:
    description: Service is unhealthy
```

### Metrics Endpoints

```yaml
GET /api/v1/metrics
responses:
  200:
    description: Prometheus metrics
    content:
      text/plain:
        schema:
          type: string
```

### Logging Standards

- Structured JSON logging
- Request ID tracing
- Error correlation
- Performance metrics logging

## Testing

### Contract Testing

- API contract validation using OpenAPI specifications
- Automated testing with generated test cases
- Mock server generation for isolated testing
- Integration testing with real dependencies

### Test Data Management

- Test data generation and cleanup
- Environment isolation for testing
- Test data privacy and security
- Performance testing with realistic data sets

## Deployment

### Environment Configuration

- Development, staging, and production environments
- Environment-specific configuration management
- Secret management and rotation
- Configuration validation at startup

### Containerization

- Docker container definitions
- Kubernetes deployment manifests
- Health check configurations
- Resource limit specifications

## Support and Maintenance

### API Documentation

- Interactive API documentation (Swagger UI)
- Code examples in multiple languages
- SDK generation for common languages
- Community-contributed examples

### Support Channels

- GitHub issues for bug reports
- Discussion forums for questions
- Email support for enterprise customers
- SLA definitions for production support

### Maintenance Windows

- Scheduled maintenance notifications
- Zero-downtime deployment procedures
- Rollback procedures for failed deployments
- Incident response and post-mortem processes
