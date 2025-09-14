# Time Capsule Legacy System - API Contracts

This directory contains the complete API contracts and interface definitions for the Time Capsule Legacy System.

## API Contract Files

### time-capsule-api.yaml

#### Main Time Capsule API specification

Contains the complete REST API definition for time capsule operations:

- Time capsule CRUD operations
- Delivery scheduling and management
- Access control and permissions
- Status tracking and monitoring

### video-processing-api.yaml

#### Video processing and encoding API

Defines the video processing pipeline:

- Video upload and encoding endpoints
- Compression and optimization services
- Thumbnail generation APIs
- Quality validation endpoints

### delivery-scheduling-api.yaml

#### Delivery scheduling and automation API

Specifies the delivery system interfaces:

- Schedule creation and management
- Trigger configuration and monitoring
- Delivery queue management
- Notification and alerting APIs

### legacy-management-api.yaml

#### Legacy content management API

Defines legacy preservation interfaces:

- Content organization and categorization
- Access control and sharing
- Version management and history
- Archival and backup operations

### emotional-support-api.yaml

#### Emotional support and guidance API

Contains emotional intelligence interfaces:

- User sentiment analysis
- Contextual guidance and suggestions
- Emotional state tracking
- Support resource recommendations

## Contract Structure

Each API contract follows the OpenAPI 3.0 specification format:

```yaml
openapi: 3.0.3
info:
  title: Time Capsule Legacy API
  version: 1.0.0
  description: API for time capsule creation and delivery

servers:
  - url: https://api.legacyguard.app/v1
    description: Production server

paths:
  /time-capsules:
    # Path definitions
  /time-capsules/{id}:
    # Individual capsule operations

components:
  schemas:
    # Data model definitions
  securitySchemes:
    # Authentication definitions
```

## Authentication

All APIs use Supabase Auth JWT authentication for user/guardian flows. Include a correlation header (e.g., X-Request-ID) on every request. Tokens are opaque on the wire and stored as hashes server-side; never log tokens or Authorization headers. Do not expose Supabase service role keys in client environments. See 005-auth-rls-baseline for identity and RLS conventions.

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
description: Supabase Auth JWT token

security:
  - bearerAuth: []
```

## Observability

- Use structured logs from Supabase Edge Functions as the primary source of truth.
- For critical failures, send email alerts via Resend.
- Do not use Sentry in this project; external observability systems are optional and complementary.

## Error Handling

Standardized error response format:

```yaml
ErrorResponse:
  type: object
  properties:
    error:
      type: object
      properties:
        code:
          type: string
          enum: [VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND, INTERNAL_ERROR]
        message:
          type: string
        details:
          type: object
```

## Data Models

### TimeCapsule

```yaml
TimeCapsule:
  type: object
  required:
    - id
    - user_id
    - recipient_name
    - recipient_email
    - delivery_condition
    - message_title
    - storage_path
    - file_type
  properties:
    id:
      type: string
      format: uuid
    user_id:
      type: string
      format: uuid
    recipient_name:
      type: string
      maxLength: 255
    recipient_email:
      type: string
      format: email
    delivery_condition:
      type: string
      enum: [ON_DATE, ON_DEATH]
    delivery_date:
      type: string
      format: date-time
    message_title:
      type: string
      maxLength: 200
    storage_path:
      type: string
    file_type:
      type: string
      enum: [video, audio]
    status:
      type: string
      enum: [PENDING, DELIVERED, FAILED, CANCELLED]
    created_at:
      type: string
      format: date-time
```

### DeliverySchedule

```yaml
DeliverySchedule:
  type: object
  required:
    - capsule_id
    - condition_type
  properties:
    capsule_id:
      type: string
      format: uuid
    condition_type:
      type: string
      enum: [ON_DATE, ON_DEATH, CONDITIONAL]
    trigger_date:
      type: string
      format: date-time
    trigger_conditions:
      type: array
      items:
        type: object
    status:
      type: string
      enum: [ACTIVE, COMPLETED, CANCELLED]
```

## API Endpoints

### Time Capsule Management

#### Create Time Capsule

```yaml
POST /time-capsules
summary: Create a new time capsule
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/TimeCapsuleCreateRequest'
responses:
  '201':
    description: Time capsule created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/TimeCapsule'
```

#### Get Time Capsules

```yaml
GET /time-capsules
summary: Retrieve user's time capsules
parameters:
  - name: status
    in: query
    schema:
      type: string
      enum: [PENDING, DELIVERED, FAILED, CANCELLED]
  - name: limit
    in: query
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 50
responses:
  '200':
    description: List of time capsules
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: '#/components/schemas/TimeCapsule'
```

### Video Processing

#### Upload Video

```yaml
POST /videos/upload
summary: Upload and process video content
requestBody:
  required: true
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          file:
            type: string
            format: binary
            description: Video file to upload
          metadata:
            type: object
            properties:
              title:
                type: string
              duration:
                type: number
responses:
  '200':
    description: Video uploaded and processed
    content:
      application/json:
        schema:
          type: object
          properties:
            video_id:
              type: string
            status:
              type: string
              enum: [PROCESSING, COMPLETED, FAILED]
            thumbnail_url:
              type: string
```

### Delivery Management

#### Create Delivery Schedule

```yaml
POST /deliveries/schedules
summary: Create delivery schedule for time capsule
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/DeliverySchedule'
responses:
  '201':
    description: Delivery schedule created
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/DeliverySchedule'
```

#### Get Delivery Status

```yaml
GET /deliveries/{capsule_id}/status
summary: Get delivery status for capsule
parameters:
  - name: capsule_id
    in: path
    required: true
    schema:
      type: string
      format: uuid
responses:
  '200':
    description: Delivery status information
    content:
      application/json:
        schema:
          type: object
          properties:
            capsule_id:
              type: string
            status:
              type: string
            scheduled_date:
              type: string
              format: date-time
            attempts:
              type: integer
            last_attempt:
              type: string
              format: date-time
```

## WebSocket Contracts

### Real-time Updates

#### Connection

```javascript
// Client connection
const ws = new WebSocket('wss://api.legacyguard.app/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));
```

#### Message Types

```typescript
interface WebSocketMessage {
  type: 'capsule_status_update' | 'delivery_notification' | 'processing_complete';
  payload: any;
  timestamp: string;
}

// Capsule status update
{
  type: 'capsule_status_update',
  payload: {
    capsule_id: 'uuid',
    status: 'DELIVERED',
    delivered_at: '2024-01-01T00:00:00Z'
  },
  timestamp: '2024-01-01T00:00:00Z'
}
```

## Rate Limiting

API rate limits to ensure fair usage:

```yaml
RateLimit:
  type: object
  properties:
    limit:
      type: integer
      description: Maximum requests per window
    remaining:
      type: integer
      description: Remaining requests in current window
    reset:
      type: integer
      description: Unix timestamp when limit resets
    window:
      type: string
      description: Time window (e.g., '1h', '1d')
```

## Versioning

API versioning strategy:

- **URL Path Versioning**: `/v1/time-capsules`
- **Header Versioning**: `Accept-Version: 1.0.0`
- **Backward Compatibility**: Maintain compatibility for 2 major versions
- **Deprecation Notices**: 6-month deprecation period

## Testing

### Contract Testing

```bash
# Validate OpenAPI specifications
npm run test:contracts

# Generate API documentation
npm run docs:generate

# Run integration tests
npm run test:integration
```

### Mock Servers

```bash
# Start mock API server
npm run mock:start

# Run contract tests against mocks
npm run test:contracts:mock
```

## Deployment

### API Gateway Configuration

```yaml
api_gateway:
  routes:
    - path: /v1/time-capsules
      service: time-capsule-service
      methods: [GET, POST, PUT, DELETE]
    - path: /v1/videos
      service: video-processing-service
      methods: [POST, GET]
    - path: /v1/deliveries
      service: delivery-service
      methods: [GET, POST, PUT]
```

### Monitoring

```yaml
monitoring:
  endpoints:
    - /health
    - /metrics
    - /diagnostics
  alerts:
    - latency > 500ms
    - error_rate > 5%
    - throughput < 100 req/min
```

## Security

### Security Authentication

- JWT tokens with Supabase Auth integration
- Refresh token rotation
- Session management and timeouts

### Authorization

- Role-based access control (RBAC)
- Resource-level permissions
- API key management for service accounts

### Data Protection

- End-to-end encryption for sensitive data
- PII data minimization
- GDPR compliance measures

## Support

### Documentation

- **API Reference**: Complete endpoint documentation
- **Integration Guides**: Step-by-step integration tutorials
- **Code Examples**: Sample implementations in multiple languages
- **Troubleshooting**: Common issues and solutions

### Developer Resources

- **SDKs**: Client libraries for popular languages
- **Postman Collections**: Pre-configured API requests
- **Sandbox Environment**: Test environment with sample data
- **Community Support**: Forums and discussion channels

This contracts directory provides the complete API specification for the Time Capsule Legacy System, ensuring consistent implementation across all services and clear integration paths for external consumers.
