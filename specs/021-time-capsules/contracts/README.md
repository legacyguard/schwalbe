# Time Capsules API Contracts

This directory contains the interface definitions, type contracts, and API specifications for the time capsule system.

## Authentication

- Use Supabase Auth JWT Bearer tokens for user/guardian-facing flows.
- Include a correlation header on every request (e.g., X-Request-ID).
- Tokens are opaque on the wire and stored as hashes server-side; never log tokens or Authorization headers.
- Service role keys must never be exposed in client environments.
- See 005-auth-rls-baseline for identity and RLS conventions.

## Observability

- Use structured logs from Supabase Edge Functions as the source of truth.
- For critical failures, send email alerts via Resend.
- Do not use Sentry in this project; external tools are optional and complementary.

## API Contracts

### time-capsule-api.yaml

REST API endpoints for time capsule management:

```yaml
openapi: 3.0.0
info:
  title: Time Capsule API
  version: 1.0.0
  description: API for managing time capsules, scheduling, and delivery

paths:
  /api/time-capsules:
    get:
      summary: List user's time capsules
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
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: List of time capsules
          content:
            application/json:
              schema:
                type: object
                properties:
                  capsules:
                    type: array
                    items:
                      $ref: '#/components/schemas/TimeCapsule'
                  total:
                    type: integer
                  hasMore:
                    type: boolean

    post:
      summary: Create a new time capsule
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCapsuleRequest'
      responses:
        '201':
          description: Time capsule created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateCapsuleResponse'

  /api/time-capsules/{id}:
    get:
      summary: Get time capsule details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Time capsule details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimeCapsule'

    put:
      summary: Update time capsule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateCapsuleRequest'
      responses:
        '200':
          description: Time capsule updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimeCapsule'

    delete:
      summary: Delete time capsule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Time capsule deleted

components:
  schemas:
    TimeCapsule:
      type: object
      properties:
        capsuleId:
          type: string
        userId:
          type: string
        recipientId:
          type: string
        recipientName:
          type: string
        recipientEmail:
          type: string
        deliveryCondition:
          type: string
          enum: [ON_DATE, ON_DEATH]
        deliveryDate:
          type: string
          format: date-time
        messageTitle:
          type: string
        messagePreview:
          type: string
        mediaType:
          type: string
          enum: [video, audio]
        storagePath:
          type: string
        fileSizeBytes:
          type: integer
        durationSeconds:
          type: integer
        thumbnailPath:
          type: string
        status:
          type: string
          enum: [PENDING, DELIVERED, FAILED, CANCELLED]
        isDelivered:
          type: boolean
        deliveredAt:
          type: string
          format: date-time
        deliveryAttempts:
          type: integer
        accessToken:
          type: string
        accessExpiresAt:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateCapsuleRequest:
      type: object
      required:
        - recipientName
        - recipientEmail
        - deliveryCondition
        - messageTitle
        - mediaType
      properties:
        recipientName:
          type: string
        recipientEmail:
          type: string
          format: email
        deliveryCondition:
          type: string
          enum: [ON_DATE, ON_DEATH]
        deliveryDate:
          type: string
          format: date-time
        messageTitle:
          type: string
        messagePreview:
          type: string
        mediaType:
          type: string
          enum: [video, audio]

    CreateCapsuleResponse:
      type: object
      properties:
        capsule:
          $ref: '#/components/schemas/TimeCapsule'
        uploadUrl:
          type: string
        expiresAt:
          type: string
          format: date-time

    UpdateCapsuleRequest:
      type: object
      properties:
        messageTitle:
          type: string
        messagePreview:
          type: string
        deliveryDate:
          type: string
          format: date-time
```

### video-processing-api.yaml

API for video processing operations:

```yaml
openapi: 3.0.0
info:
  title: Video Processing API
  version: 1.0.0
  description: API for video upload, compression, and processing

paths:
  /api/time-capsules/{id}/upload:
    post:
      summary: Upload media file for time capsule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
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
                  description: Video or audio file
                encryptionMetadata:
                  type: string
                  description: JSON string with encryption metadata
      responses:
        '200':
          description: File uploaded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UploadResponse'

  /api/time-capsules/{id}/compress:
    post:
      summary: Compress uploaded video
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CompressionRequest'
      responses:
        '200':
          description: Video compression completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CompressionResponse'

components:
  schemas:
    UploadResponse:
      type: object
      properties:
        storagePath:
          type: string
        thumbnailPath:
          type: string
        fileSize:
          type: integer
        duration:
          type: integer
        encryptionVerified:
          type: boolean

    CompressionRequest:
      type: object
      properties:
        quality:
          type: string
          enum: [low, medium, high]
          default: medium
        format:
          type: string
          enum: [webm, mp4]
          default: webm
        maxSize:
          type: integer
          description: Maximum file size in bytes

    CompressionResponse:
      type: object
      properties:
        originalSize:
          type: integer
        compressedSize:
          type: integer
        compressionRatio:
          type: number
        processingTime:
          type: number
        outputPath:
          type: string
```

### delivery-scheduling-api.yaml

API for delivery scheduling and triggers:

```yaml
openapi: 3.0.0
info:
  title: Delivery Scheduling API
  version: 1.0.0
  description: API for managing delivery schedules and triggers

paths:
  /api/time-capsules/{id}/schedule:
    get:
      summary: Get delivery schedule for capsule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Delivery schedule details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeliverySchedule'

    post:
      summary: Create delivery schedule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateScheduleRequest'
      responses:
        '201':
          description: Schedule created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeliverySchedule'

    put:
      summary: Update delivery schedule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateScheduleRequest'
      responses:
        '200':
          description: Schedule updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeliverySchedule'

components:
  schemas:
    DeliverySchedule:
      type: object
      properties:
        scheduleId:
          type: string
        capsuleId:
          type: string
        triggerType:
          type: string
          enum: [date, emergency]
        scheduledDate:
          type: string
          format: date-time
        emergencyTrigger:
          type: string
        status:
          type: string
          enum: [active, paused, completed, failed]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateScheduleRequest:
      type: object
      required:
        - triggerType
      properties:
        triggerType:
          type: string
          enum: [date, emergency]
        scheduledDate:
          type: string
          format: date-time
        emergencyTrigger:
          type: string
        timezone:
          type: string
          default: UTC

    UpdateScheduleRequest:
      type: object
      properties:
        scheduledDate:
          type: string
          format: date-time
        emergencyTrigger:
          type: string
        status:
          type: string
          enum: [active, paused]
```

### legacy-management-api.yaml

API for legacy content management:

```yaml
openapi: 3.0.0
info:
  title: Legacy Management API
  version: 1.0.0
  description: API for managing legacy content and versioned snapshots

paths:
  /api/time-capsules/{id}/versions:
    get:
      summary: List legacy versions for capsule
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: List of legacy versions
          content:
            application/json:
              schema:
                type: object
                properties:
                  versions:
                    type: array
                    items:
                      $ref: '#/components/schemas/LegacyVersion'
                  total:
                    type: integer
                  hasMore:
                    type: boolean

    post:
      summary: Create new legacy version
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateVersionRequest'
      responses:
        '201':
          description: Version created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LegacyVersion'

  /api/time-capsules/{id}/versions/{versionId}:
    get:
      summary: Get specific legacy version
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: versionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Legacy version details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LegacyVersion'

components:
  schemas:
    LegacyVersion:
      type: object
      properties:
        versionId:
          type: string
        capsuleId:
          type: string
        versionNumber:
          type: integer
        versionLabel:
          type: string
        createdAt:
          type: string
          format: date-time
        snapshotData:
          type: object
          description: JSON snapshot of capsule state
        emotionalContext:
          type: object
          description: Emotional metadata and tags
        changeReason:
          type: string

    CreateVersionRequest:
      type: object
      properties:
        versionLabel:
          type: string
        changeReason:
          type: string
        emotionalContext:
          type: object
```

### time-capsule-testing-api.yaml

API for testing and validation:

```yaml
openapi: 3.0.0
info:
  title: Time Capsule Testing API
  version: 1.0.0
  description: API for testing time capsule functionality

paths:
  /api/time-capsules/{id}/test-preview:
    post:
      summary: Send test preview email
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                customRecipient:
                  type: string
                  format: email
      responses:
        '200':
          description: Test preview sent
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  emailSent:
                    type: boolean
                  previewUrl:
                    type: string
                  sentAt:
                    type: string
                    format: date-time

  /api/time-capsules/{id}/validate:
    post:
      summary: Validate time capsule data
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Validation results
          content:
            application/json:
              schema:
                type: object
                properties:
                  isValid:
                    type: boolean
                  errors:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                        message:
                          type: string
                        code:
                          type: string
                  warnings:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                        message:
                          type: string

  /api/testing/delivery-trigger:
    post:
      summary: Manually trigger delivery (testing only)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                capsuleId:
                  type: string
                force:
                  type: boolean
                  default: false
                testMode:
                  type: boolean
                  default: true
      responses:
        '200':
          description: Delivery triggered
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  deliveryId:
                    type: string
                  status:
                    type: string
                  triggeredAt:
                    type: string
                    format: date-time
```

## Contract Guidelines

### Naming Conventions

- Interfaces: `PascalCase` (e.g., `TimeCapsule`, `CreateCapsuleRequest`)
- Types: `PascalCase` (e.g., `DeliveryCondition`, `CapsuleStatus`)
- Enums: `PascalCase` (e.g., `MediaType`, `EventType`)

### Type Safety

- All contracts must be fully typed with TypeScript
- Use union types for enums and constrained values
- Include JSDoc comments for complex interfaces
- Define optional properties with `?:` syntax

### Validation

- Include runtime validation schemas where applicable
- Define acceptable value ranges and constraints
- Document required vs optional fields clearly

### Versioning

- Contracts are versioned with the specification
- Breaking changes require new contract versions
- Backward compatibility maintained where possible

## Usage

```typescript
// Import contracts
import { TimeCapsule, CreateCapsuleRequest } from './contracts/interfaces';
import { createCapsule } from './contracts/api';

// Use in components
interface CapsuleWizardProps {
  onCreate: (request: CreateCapsuleRequest) => Promise<TimeCapsule>;
}
```

## Testing

Contracts should be tested for:

- Type correctness at compile time
- Runtime validation of constraints
- API contract compliance
- Backward compatibility

## Related Documentation

- See `../data-model.md` for database schema details
- See `../spec.md` for system requirements
- See `../quickstart.md` for implementation examples
