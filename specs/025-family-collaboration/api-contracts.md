# Family Collaboration System - API Contracts

## Overview

This document defines the API contracts for the Family Collaboration System, providing comprehensive specifications for all endpoints, request/response formats, error handling, and integration patterns.

## Authentication

All API endpoints require authentication via Clerk JWT tokens. Include the Authorization header:

```
Authorization: Bearer <clerk-jwt-token>
```

## Base URL

```
https://api.schwalbe.com/v1
```

## Family Management APIs

### GET /api/family/members

Retrieve all family members for the authenticated user.

**Request:**
```http
GET /api/family/members
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "familyOwnerId": "uuid",
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "collaborator",
      "relationship": "spouse",
      "status": "active",
      "permissions": {
        "view_documents": true,
        "edit_will": false,
        "emergency_access": true
      },
      "emergencyContact": true,
      "emergencyPriority": 1,
      "joinedAt": "2024-01-15T10:30:00Z",
      "lastActiveAt": "2024-01-20T14:22:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "active": 4,
    "pending": 1
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication
- `500 Internal Server Error`: Database or server error

### POST /api/family/members

Add a new family member and send invitation.

**Request:**
```http
POST /api/family/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "viewer",
  "relationship": "child",
  "message": "I'd love to have you as part of our family protection plan.",
  "permissions": {
    "view_documents": true,
    "emergency_access": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "familyOwnerId": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "viewer",
    "relationship": "child",
    "status": "pending",
    "permissions": {
      "view_documents": true,
      "emergency_access": false
    },
    "invitedAt": "2024-01-20T15:30:00Z",
    "invitedBy": "uuid"
  },
  "invitation": {
    "id": "uuid",
    "token": "invitation-token",
    "expiresAt": "2024-01-27T15:30:00Z",
    "status": "pending"
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid family member data",
    "details": {
      "email": ["Email already exists in family"],
      "role": ["Invalid role for relationship"]
    }
  }
}
```

### PUT /api/family/members/{memberId}

Update family member information and permissions.

**Request:**
```http
PUT /api/family/members/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "collaborator",
  "permissions": {
    "view_documents": true,
    "edit_will": true,
    "emergency_access": true
  },
  "emergencyContact": true,
  "emergencyPriority": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "collaborator",
    "permissions": {
      "view_documents": true,
      "edit_will": true,
      "emergency_access": true
    },
    "emergencyContact": true,
    "emergencyPriority": 2,
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

### DELETE /api/family/members/{memberId}

Remove a family member from the family network.

**Request:**
```http
DELETE /api/family/members/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Family member removed successfully"
}
```

## Invitation Management APIs

### GET /api/family/invitations

Retrieve all family invitations sent by the authenticated user.

**Request:**
```http
GET /api/family/invitations?status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by invitation status (`pending`, `accepted`, `declined`, `expired`)
- `limit`: Maximum number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "familyMemberId": "uuid",
      "email": "jane@example.com",
      "token": "invitation-token",
      "status": "pending",
      "message": "Welcome to our family legacy system!",
      "expiresAt": "2024-01-27T15:30:00Z",
      "createdAt": "2024-01-20T15:30:00Z",
      "name": "Jane Smith",
      "role": "viewer",
      "relationship": "child"
    }
  ],
  "meta": {
    "total": 3,
    "pending": 2,
    "accepted": 1
  }
}
```

### POST /api/family/invitations/{invitationId}/resend

Resend a pending invitation email.

**Request:**
```http
POST /api/family/invitations/uuid/resend
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Updated invitation message"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation resent successfully"
}
```

### DELETE /api/family/invitations/{invitationId}

Cancel a pending invitation.

**Request:**
```http
DELETE /api/family/invitations/uuid
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation cancelled successfully"
}
```

## Emergency Access APIs

### POST /api/emergency/request

Request emergency access to another user's family data.

**Request:**
```http
POST /api/emergency/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": "uuid",
  "reason": "Medical emergency requiring access to insurance documents",
  "requestedDocuments": ["insurance-policy-123", "medical-records-456"],
  "accessDuration": 24,
  "verificationMethod": "email"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "requesterId": "uuid",
    "ownerId": "uuid",
    "reason": "Medical emergency requiring access to insurance documents",
    "status": "pending",
    "requestedAt": "2024-01-20T17:00:00Z",
    "expiresAt": "2024-01-21T17:00:00Z",
    "accessDuration": 24,
    "verificationMethod": "email",
    "emergencyLevel": "high"
  }
}
```

### GET /api/emergency/requests

Retrieve emergency access requests (for owners) or sent requests (for requesters).

**Request:**
```http
GET /api/emergency/requests?status=pending
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "requesterId": "uuid",
      "ownerId": "uuid",
      "reason": "Medical emergency",
      "status": "pending",
      "requestedAt": "2024-01-20T17:00:00Z",
      "expiresAt": "2024-01-21T17:00:00Z",
      "requestedBy": "John Smith",
      "documentsRequested": ["insurance-policy-123"],
      "accessDuration": 24,
      "emergencyLevel": "high"
    }
  ]
}
```

### PUT /api/emergency/requests/{requestId}

Approve or deny an emergency access request.

**Request:**
```http
PUT /api/emergency/requests/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "approverName": "Jane Doe",
  "approverRelation": "spouse",
  "accessGrantedUntil": "2024-01-21T17:00:00Z",
  "responseMessage": "Access granted for medical emergency"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "respondedAt": "2024-01-20T17:30:00Z",
    "approverName": "Jane Doe",
    "approverRelation": "spouse",
    "accessGrantedUntil": "2024-01-21T17:00:00Z"
  }
}
```

### POST /api/emergency/verify

Verify emergency access token and grant temporary access.

**Request:**
```http
POST /api/emergency/verify
Content-Type: application/json

{
  "token": "emergency-access-token",
  "verificationCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "temporary-access-token",
    "expiresAt": "2024-01-21T17:00:00Z",
    "grantedDocuments": ["insurance-policy-123", "medical-records-456"],
    "ownerId": "uuid",
    "requesterId": "uuid"
  }
}
```

## Analytics & Reporting APIs

### GET /api/family/stats

Retrieve comprehensive family statistics and protection metrics.

**Request:**
```http
GET /api/family/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalMembers": 5,
    "activeMembers": 4,
    "pendingInvitations": 1,
    "totalDocuments": 25,
    "sharedDocuments": 15,
    "memberContributions": {
      "uuid-1": 8,
      "uuid-2": 12
    },
    "documentsByCategory": {
      "legal": 5,
      "financial": 8,
      "medical": 4,
      "insurance": 3,
      "property": 5
    },
    "recentActivity": [
      {
        "id": "uuid",
        "actorId": "uuid",
        "actorName": "John Doe",
        "actionType": "member_added",
        "targetType": "family_member",
        "createdAt": "2024-01-20T16:00:00Z",
        "details": {
          "memberName": "Jane Smith",
          "relationship": "child"
        }
      }
    ],
    "upcomingEvents": [],
    "protectionScore": 85
  }
}
```

### GET /api/family/protection

Get detailed family protection status and recommendations.

**Request:**
```http
GET /api/family/protection
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalMembers": 5,
    "activeMembers": 4,
    "protectionLevel": "premium",
    "protectionScore": 85,
    "documentsShared": 15,
    "emergencyContactsSet": true,
    "lastUpdated": "2024-01-20T17:00:00Z",
    "strengths": [
      "Strong emergency contact network",
      "Comprehensive document coverage",
      "Active family collaboration"
    ],
    "recommendations": [
      "Add more detailed medical information",
      "Consider setting up automatic reminders"
    ]
  }
}
```

### GET /api/family/activity

Retrieve family activity log with filtering and pagination.

**Request:**
```http
GET /api/family/activity?limit=20&offset=0&actionType=member_added
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Maximum number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)
- `actionType`: Filter by action type
- `actorId`: Filter by specific actor
- `dateFrom`: Filter from date (ISO 8601)
- `dateTo`: Filter to date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "familyOwnerId": "uuid",
      "actorId": "uuid",
      "actorName": "John Doe",
      "actionType": "member_added",
      "targetType": "family_member",
      "targetId": "uuid",
      "details": {
        "memberName": "Jane Smith",
        "relationship": "child",
        "role": "viewer"
      },
      "createdAt": "2024-01-20T16:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Webhook Contracts

### Family Invitation Events

**Endpoint:** `POST /api/webhooks/family-invitation`

**Headers:**
```
Content-Type: application/json
X-Webhook-Signature: <signature>
```

**Payload:**
```json
{
  "event": "invitation.accepted",
  "timestamp": "2024-01-20T16:00:00Z",
  "data": {
    "invitationId": "uuid",
    "familyMemberId": "uuid",
    "ownerId": "uuid",
    "acceptedBy": {
      "userId": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

### Emergency Access Events

**Endpoint:** `POST /api/webhooks/emergency-access`

**Payload:**
```json
{
  "event": "emergency.requested",
  "timestamp": "2024-01-20T17:00:00Z",
  "data": {
    "requestId": "uuid",
    "requesterId": "uuid",
    "ownerId": "uuid",
    "reason": "Medical emergency",
    "emergencyLevel": "high",
    "requestedDocuments": ["insurance-policy-123"]
  }
}
```

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": ["Specific field validation errors"]
    },
    "requestId": "uuid-for-support"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Family Management**: 100 requests per minute
- **Emergency Access**: 20 requests per minute
- **Analytics**: 50 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

## Versioning

API versioning follows semantic versioning:

- **v1**: Current stable version
- **Breaking Changes**: New major version
- **Additions**: Minor version bump
- **Bug Fixes**: Patch version bump

## SDK Integration

### TypeScript Client

```typescript
import { FamilyAPI } from '@schwalbe/shared';

const familyAPI = new FamilyAPI({ baseURL: '/api/v1' });

// Get family members
const members = await familyAPI.getFamilyMembers();

// Send invitation
const invitation = await familyAPI.sendInvitation({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'viewer',
  relationship: 'child',
  message: 'Welcome to our family!'
});
```

### React Hooks

```typescript
import { useFamilyMembers, useSendInvitation } from '@schwalbe/shared';

function FamilyComponent() {
  const { data: members, loading } = useFamilyMembers();
  const sendInvitation = useSendInvitation();

  const handleInvite = async (invitationData) => {
    await sendInvitation.mutateAsync(invitationData);
  };

  // Component implementation
}
```

## Testing Contracts

### Mock Data Format

```typescript
export const mockFamilyMember: FamilyMember = {
  id: 'mock-uuid',
  familyOwnerId: 'owner-uuid',
  userId: 'user-uuid',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'collaborator',
  relationship: 'spouse',
  status: 'active',
  permissions: {
    view_documents: true,
    edit_will: false,
    emergency_access: true
  },
  emergencyContact: true,
  emergencyPriority: 1,
  joinedAt: new Date('2024-01-15T10:30:00Z'),
  invitedAt: new Date('2024-01-14T10:30:00Z'),
  invitedBy: 'owner-uuid',
  preferences: {}
};
```

### Contract Tests

```typescript
describe('Family API Contracts', () => {
  it('should return family members with correct schema', async () => {
    const response = await request(app)
      .get('/api/family/members')
      .set('Authorization', 'Bearer mock-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    // Schema validation
    response.body.data.forEach(member => {
      expect(member).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        role: expect.stringMatching(/^(collaborator|viewer|emergency_contact|admin)$/),
        relationship: expect.any(String),
        status: expect.stringMatching(/^(active|pending|inactive)$/)
      });
    });
  });
});