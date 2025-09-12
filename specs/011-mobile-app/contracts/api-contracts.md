# Mobile App API Contracts

## Authentication APIs

### Sign In

```typescript
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Biometric Authentication

```typescript
POST /auth/biometric
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "biometricToken": "biometric-challenge-token",
  "deviceId": "device-uuid"
}

Response:
{
  "success": true,
  "sessionToken": "session-token",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

## Document Management APIs

### List Documents

```typescript
GET /documents?type=will&status=ready&limit=20&offset=0
Authorization: Bearer <access_token>

Response:
{
  "documents": [
    {
      "id": "doc-123",
      "title": "Last Will and Testament",
      "type": "will",
      "status": "ready",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T11:00:00Z",
      "size": 245760,
      "checksum": "sha256-hash"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

### Upload Document

```typescript
POST /documents/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- file: <document file>
- metadata: {
    "title": "My Document",
    "type": "will",
    "tags": ["personal", "legal"]
  }

Response:
{
  "documentId": "doc-123",
  "uploadUrl": "https://storage.example.com/upload-url",
  "status": "processing"
}
```

### Download Document

```typescript
GET /documents/{documentId}/download
Authorization: Bearer <access_token>

Response:
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"

<document binary data>
```

## Offline Sync APIs

### Get Sync Status

```typescript
GET /sync/status
Authorization: Bearer <access_token>

Response:
{
  "lastSyncAt": "2024-01-01T10:00:00Z",
  "pendingChanges": 3,
  "serverChanges": 5,
  "conflicts": 1
}
```

### Sync Changes

```typescript
POST /sync
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clientChanges": [
    {
      "id": "change-123",
      "type": "update",
      "entityType": "document",
      "entityId": "doc-123",
      "data": { "title": "Updated Title" },
      "timestamp": "2024-01-01T10:00:00Z"
    }
  ],
  "lastSyncTimestamp": "2024-01-01T09:00:00Z"
}

Response:
{
  "success": true,
  "serverChanges": [
    {
      "type": "update",
      "entityType": "document",
      "entityId": "doc-456",
      "data": { "status": "processed" }
    }
  ],
  "conflicts": [
    {
      "id": "conflict-123",
      "entityType": "document",
      "entityId": "doc-789",
      "clientVersion": { "title": "Client Title" },
      "serverVersion": { "title": "Server Title" }
    }
  ]
}
```

## Emergency Access APIs

### Activate Emergency Access

```typescript
POST /emergency/activate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Medical emergency",
  "guardianIds": ["guardian-123", "guardian-456"],
  "documentIds": ["doc-123", "doc-456"]
}

Response:
{
  "emergencyId": "emergency-123",
  "status": "pending_verification",
  "expiresAt": "2024-01-02T10:00:00Z",
  "verificationTokens": [
    {
      "guardianId": "guardian-123",
      "token": "verification-token-123"
    }
  ]
}
```

### Verify Emergency Access

```typescript
POST /emergency/verify
Content-Type: application/json

{
  "emergencyId": "emergency-123",
  "guardianId": "guardian-123",
  "verificationToken": "verification-token-123",
  "verificationCode": "123456"
}

Response:
{
  "success": true,
  "accessToken": "emergency-access-token",
  "expiresAt": "2024-01-02T10:00:00Z"
}
```

## Push Notification APIs

### Register Device

```typescript
POST /notifications/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceToken": "expo-device-token",
  "platform": "ios",
  "appVersion": "1.0.0"
}

Response:
{
  "success": true,
  "deviceId": "device-123"
}
```

### Send Notification

```typescript
POST /notifications/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "user-123",
  "title": "Document Ready",
  "body": "Your will has been processed successfully",
  "data": {
    "type": "document_ready",
    "documentId": "doc-123"
  },
  "priority": "high"
}

Response:
{
  "success": true,
  "notificationId": "notification-123"
}
```

## Error Response Format

All APIs return errors in the following format:

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "retryable": false
  }
}
```

## Rate Limiting

- Authentication endpoints: 10 requests per minute
- Document operations: 100 requests per minute
- Sync operations: 50 requests per minute
- Emergency operations: 20 requests per minute

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1638360000
```

## Versioning

API versioning is handled through URL paths:

- Current version: `/v1/`
- Future versions: `/v2/`, `/v3/`, etc.

All mobile clients should use the latest stable API version.
