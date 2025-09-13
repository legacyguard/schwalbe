# Family Shield Emergency - API Documentation

## Overview

The Family Shield Emergency API provides comprehensive endpoints for managing emergency access, guardian verification, inactivity monitoring, and access control. All endpoints follow RESTful conventions and use JSON for request/response bodies.

## Authentication

All API endpoints require authentication using JWT tokens. Emergency-specific endpoints may also accept emergency access tokens.

```typescript
// Standard authentication header
Authorization: Bearer <jwt_token>

// Emergency access token (alternative for emergency endpoints)
X-Emergency-Token: <emergency_token>
```

## Emergency Protocol Endpoints

### Create Emergency Protocol

**POST** `/api/emergency/protocols`

Creates a new emergency protocol for a user.

**Request Body:**

```json
{
  "userId": "uuid",
  "protocolType": "inactivity|manual|health_check",
  "config": {
    "inactivityThresholdMonths": 6,
    "requiredGuardians": 2,
    "gracePeriodDays": 7
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "protocolType": "inactivity",
  "status": "inactive",
  "config": {
    "inactivityThresholdMonths": 6,
    "requiredGuardians": 2,
    "gracePeriodDays": 7
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Codes:**

- `400`: Invalid protocol configuration
- `401`: Unauthorized
- `409`: Protocol already exists for user

### Activate Emergency Protocol

**POST** `/api/emergency/protocols/{protocolId}/activate`

Activates an emergency protocol.

**Request Body:**

```json
{
  "reason": "inactivity_detected|manual_guardian|health_check",
  "guardianIds": ["uuid1", "uuid2"],
  "notes": "Optional activation notes"
}
```

**Response:**

```json
{
  "protocolId": "uuid",
  "status": "pending_guardian_confirmation",
  "activationId": "uuid",
  "requiredConfirmations": 2,
  "currentConfirmations": 0,
  "expiresAt": "2024-01-08T00:00:00Z"
}
```

### Get Emergency Protocol Status

**GET** `/api/emergency/protocols/{protocolId}`

Retrieves the current status of an emergency protocol.

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "protocolType": "inactivity",
  "status": "active",
  "activationDate": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-01-31T00:00:00Z",
  "guardianConfirmations": [
    {
      "guardianId": "uuid",
      "guardianName": "John Doe",
      "confirmedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Guardian Management Endpoints

### Create Guardian

**POST** `/api/guardians`

Creates a new guardian for a user.

**Request Body:**

```json
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "relationship": "brother",
  "permissions": {
    "canTriggerEmergency": true,
    "canAccessHealthDocs": true,
    "canAccessFinancialDocs": false,
    "isChildGuardian": false,
    "isWillExecutor": true
  },
  "emergencyContactPriority": 1
}
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "relationship": "brother",
  "permissions": {
    "canTriggerEmergency": true,
    "canAccessHealthDocs": true,
    "canAccessFinancialDocs": false,
    "isChildGuardian": false,
    "isWillExecutor": true
  },
  "verificationStatus": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Verify Guardian

**POST** `/api/guardians/{guardianId}/verify`

Verifies a guardian's identity.

**Request Body:**

```json
{
  "verificationCode": "123456",
  "verificationMethod": "email|sms"
}
```

**Response:**

```json
{
  "guardianId": "uuid",
  "verificationStatus": "verified",
  "verifiedAt": "2024-01-01T00:00:00Z"
}
```

### Update Guardian Permissions

**PUT** `/api/guardians/{guardianId}/permissions`

Updates a guardian's permissions.

**Request Body:**

```json
{
  "canAccessHealthDocs": true,
  "canAccessFinancialDocs": true,
  "isChildGuardian": false,
  "isWillExecutor": true
}
```

**Response:**

```json
{
  "guardianId": "uuid",
  "permissions": {
    "canTriggerEmergency": true,
    "canAccessHealthDocs": true,
    "canAccessFinancialDocs": true,
    "isChildGuardian": false,
    "isWillExecutor": true
  },
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Emergency Access Endpoints

### Verify Emergency Access Token

**POST** `/api/emergency/access/verify`

Verifies an emergency access token.

**Request Body:**

```json
{
  "token": "emergency_token_string",
  "verificationCode": "123456"
}
```

**Response:**

```json
{
  "valid": true,
  "userId": "uuid",
  "guardianId": "uuid",
  "guardianName": "John Doe",
  "permissions": {
    "canAccessHealthDocs": true,
    "canAccessFinancialDocs": false
  },
  "accessStage": "verification",
  "expiresAt": "2024-01-08T00:00:00Z",
  "userData": {
    "name": "Jane Smith",
    "emergencyContacts": [...],
    "survivorManual": {...}
  }
}
```

### Get Emergency Documents

**GET** `/api/emergency/access/{token}/documents`

Retrieves documents accessible during emergency.

**Query Parameters:**

- `category`: Filter by document category (health, financial, legal)
- `limit`: Maximum number of documents to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Medical Records",
      "category": "health",
      "type": "pdf",
      "size": 2048576,
      "createdAt": "2024-01-01T00:00:00Z",
      "canAccess": true
    }
  ],
  "totalCount": 25,
  "hasMore": true
}
```

### Download Emergency Document

**POST** `/api/emergency/access/{token}/documents/{documentId}/download`

Generates a secure download URL for an emergency document.

**Response:**

```json
{
  "downloadUrl": "https://secure.example.com/download/...",
  "expiresAt": "2024-01-01T01:00:00Z",
  "documentId": "uuid",
  "documentTitle": "Medical Records"
}
```

## Inactivity Monitoring Endpoints

### Configure Inactivity Monitoring

**POST** `/api/emergency/monitoring/configure`

Configures inactivity monitoring for a user.

**Request Body:**

```json
{
  "userId": "uuid",
  "thresholdMonths": 6,
  "warningEnabled": true,
  "guardianNotificationEnabled": true,
  "gracePeriodDays": 7
}
```

**Response:**

```json
{
  "userId": "uuid",
  "thresholdMonths": 6,
  "warningEnabled": true,
  "guardianNotificationEnabled": true,
  "gracePeriodDays": 7,
  "configuredAt": "2024-01-01T00:00:00Z"
}
```

### Get Inactivity Status

**GET** `/api/emergency/monitoring/{userId}/status`

Retrieves the current inactivity status for a user.

**Response:**

```json
{
  "userId": "uuid",
  "lastActivityAt": "2023-12-01T00:00:00Z",
  "daysSinceLastActivity": 31,
  "thresholdDays": 180,
  "status": "monitoring",
  "warningSentAt": null,
  "guardiansNotifiedAt": null
}
```

### Record User Activity

**POST** `/api/emergency/monitoring/activity`

Records user activity to reset inactivity timer.

**Request Body:**

```json
{
  "userId": "uuid",
  "activityType": "login|document_access|settings_change",
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response:**

```json
{
  "userId": "uuid",
  "activityRecorded": true,
  "lastActivityAt": "2024-01-01T00:00:00Z"
}
```

## Audit and Logging Endpoints

### Get Emergency Audit Trail

**GET** `/api/emergency/audit/{userId}`

Retrieves the audit trail for emergency activities.

**Query Parameters:**

- `startDate`: Start date for audit trail (ISO 8601)
- `endDate`: End date for audit trail (ISO 8601)
- `eventType`: Filter by event type
- `limit`: Maximum number of entries (default: 100)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "auditEntries": [
    {
      "id": "uuid",
      "timestamp": "2024-01-01T00:00:00Z",
      "eventType": "emergency_access",
      "guardianId": "uuid",
      "guardianName": "John Doe",
      "eventData": {
        "action": "document_download",
        "documentId": "uuid",
        "ipAddress": "192.168.1.1"
      },
      "severity": "info"
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

### Get Emergency Analytics

**GET** `/api/emergency/analytics/{userId}`

Retrieves analytics data for emergency system usage.

**Query Parameters:**

- `timeRange`: Time range for analytics (7d, 30d, 90d)
- `metricType`: Type of metrics to retrieve

**Response:**

```json
{
  "userId": "uuid",
  "timeRange": "30d",
  "metrics": {
    "totalEmergencyAccesses": 5,
    "averageResponseTime": 2.3,
    "guardianVerifications": 3,
    "documentDownloads": 12,
    "inactivityAlerts": 2
  },
  "trends": {
    "emergencyAccessTrend": "stable",
    "responseTimeTrend": "improving",
    "guardianActivityTrend": "increasing"
  }
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "code": "EMERGENCY_ACCESS_DENIED",
    "message": "Emergency access token is invalid or expired",
    "details": {
      "tokenId": "uuid",
      "expiresAt": "2024-01-01T00:00:00Z"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

- `EMERGENCY_ACCESS_DENIED`: Invalid or expired emergency token
- `GUARDIAN_VERIFICATION_FAILED`: Guardian verification failed
- `PROTOCOL_ACTIVATION_FAILED`: Emergency protocol activation failed
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_REQUEST`: Malformed request data

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Emergency Access Endpoints**: 10 requests per minute per IP
- **Guardian Management**: 30 requests per minute per user
- **Audit Endpoints**: 60 requests per minute per user
- **Monitoring Endpoints**: 120 requests per minute per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1640995200
```

## Webhook Endpoints

### Emergency Activation Webhook

**POST** `/api/webhooks/emergency/activation`

Receives notifications when emergency protocols are activated.

**Request Body:**

```json
{
  "eventType": "emergency_activated",
  "userId": "uuid",
  "protocolId": "uuid",
  "activationReason": "inactivity_detected",
  "guardianIds": ["uuid1", "uuid2"],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Guardian Verification Webhook

**POST** `/api/webhooks/emergency/guardian-verification`

Receives notifications when guardians are verified.

**Request Body:**

```json
{
  "eventType": "guardian_verified",
  "userId": "uuid",
  "guardianId": "uuid",
  "guardianName": "John Doe",
  "verificationMethod": "email",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EmergencyAPI } from '@schwalbe/api-client';

const emergencyAPI = new EmergencyAPI({
  baseURL: 'https://api.schwalbe.com',
  apiKey: 'your-api-key'
});

// Create emergency protocol
const protocol = await emergencyAPI.protocols.create({
  userId: 'user-uuid',
  protocolType: 'inactivity',
  config: {
    inactivityThresholdMonths: 6,
    requiredGuardians: 2
  }
});

// Verify emergency access
const accessData = await emergencyAPI.access.verify({
  token: 'emergency-token',
  verificationCode: '123456'
});
```

### cURL Examples

```bash
# Create emergency protocol
curl -X POST https://api.schwalbe.com/api/emergency/protocols \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "protocolType": "inactivity",
    "config": {
      "inactivityThresholdMonths": 6,
      "requiredGuardians": 2
    }
  }'

# Verify emergency access
curl -X POST https://api.schwalbe.com/api/emergency/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "emergency-token",
    "verificationCode": "123456"
  }'
```

This API documentation provides comprehensive coverage of all Family Shield Emergency endpoints, including request/response formats, error handling, and usage examples.
