# API Documentation

## Overview

The Schwalbe application provides a RESTful API built on Supabase with additional custom endpoints for specialized functionality.

## Base URLs

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

All API requests require authentication using Supabase JWT tokens.

```typescript
// Include in all requests
headers: {
  'Authorization': `Bearer ${supabaseToken}`,
  'Content-Type': 'application/json'
}
```

## Core Services

### Document Service

#### Get Documents
```typescript
GET /api/documents
Query Parameters:
- limit?: number (default: 20)
- offset?: number (default: 0)
- search?: string
- type?: string

Response:
{
  documents: Document[],
  total: number,
  hasMore: boolean
}
```

#### Create Document
```typescript
POST /api/documents
Body: {
  title: string,
  content: string,
  type: 'will' | 'legal' | 'personal',
  metadata?: object
}

Response: Document
```

#### Update Document
```typescript
PUT /api/documents/:id
Body: Partial<Document>

Response: Document
```

#### Delete Document
```typescript
DELETE /api/documents/:id

Response: { success: boolean }
```

### Will Service

#### Create Will
```typescript
POST /api/wills
Body: {
  testator: TestatorInfo,
  beneficiaries: Beneficiary[],
  executor: ExecutorInfo,
  witnesses: Witness[],
  jurisdiction: string,
  language: string,
  form: 'typed' | 'holographic'
}

Response: Will
```

#### Validate Will
```typescript
POST /api/wills/:id/validate

Response: {
  isValid: boolean,
  errors: ValidationError[],
  warnings: ValidationWarning[]
}
```

### Subscription Service

#### Get Subscription
```typescript
GET /api/subscriptions/current

Response: {
  subscription: Subscription | null,
  trial: TrialInfo | null,
  usage: UsageInfo
}
```

#### Update Subscription
```typescript
PUT /api/subscriptions/:id
Body: {
  planId: string,
  preferences: SubscriptionPreferences
}

Response: Subscription
```

#### Cancel Subscription
```typescript
DELETE /api/subscriptions/:id
Query Parameters:
- immediate?: boolean (default: false)

Response: { success: boolean, effectiveDate: string }
```

### Sharing Service

#### Create Share Link
```typescript
POST /api/shares
Body: {
  resourceType: 'document' | 'will' | 'vault' | 'family',
  resourceId: string,
  permissions: SharePermissions,
  password?: string,
  expiresAt?: string,
  maxAccessCount?: number
}

Response: {
  shareId: string,
  url: string,
  expiresAt: string | null
}
```

#### Access Share Link
```typescript
GET /api/shares/:shareId
Query Parameters:
- password?: string

Response: {
  resource: any,
  permissions: SharePermissions,
  metadata: ShareMetadata
}
```

### Emergency Service

#### Trigger Emergency Protocol
```typescript
POST /api/emergency/trigger
Body: {
  type: 'medical' | 'legal' | 'family',
  severity: 'low' | 'medium' | 'high' | 'critical',
  message?: string,
  contacts?: string[]
}

Response: {
  emergencyId: string,
  status: 'triggered',
  estimatedResponse: string
}
```

#### Get Emergency Status
```typescript
GET /api/emergency/:emergencyId

Response: {
  id: string,
  status: EmergencyStatus,
  timeline: EmergencyEvent[],
  contacts: EmergencyContact[]
}
```

## Data Types

### Document
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  type: 'will' | 'legal' | 'personal';
  status: 'draft' | 'final' | 'archived';
  metadata: object;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
```

### Will
```typescript
interface Will {
  id: string;
  testator: TestatorInfo;
  beneficiaries: Beneficiary[];
  executor: ExecutorInfo;
  witnesses: Witness[];
  jurisdiction: string;
  language: string;
  form: 'typed' | 'holographic';
  status: 'draft' | 'signed' | 'witnessed' | 'final';
  createdAt: string;
  updatedAt: string;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  preferences: SubscriptionPreferences;
}
```

## Error Handling

All endpoints return errors in a consistent format:

```typescript
{
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication token missing or invalid
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- Anonymous: 10 requests per minute
- Authenticated: 100 requests per minute
- Premium: 1000 requests per minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Webhooks

### Subscription Events
```typescript
POST /webhooks/subscriptions
Body: {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.canceled',
  data: Subscription
}
```

### Emergency Events
```typescript
POST /webhooks/emergency
Body: {
  type: 'emergency.triggered' | 'emergency.resolved',
  data: EmergencyEvent
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @schwalbe/api-client
```

```typescript
import { SchwalbeClient } from '@schwalbe/api-client';

const client = new SchwalbeClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.schwalbe.com'
});

const documents = await client.documents.list();
```

## Testing

Use the included Postman collection or OpenAPI spec for testing:

- Postman: `docs/postman-collection.json`
- OpenAPI: `docs/openapi.yaml`

## Support

For API support, contact: api-support@schwalbe.com