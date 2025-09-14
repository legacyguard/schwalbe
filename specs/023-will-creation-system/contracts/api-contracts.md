# Will Creation System - API Contracts

## REST API Endpoints

### Will Management

#### POST /api/wills

Create a new will with initial jurisdiction setup.

**Request:**

```typescript
POST /api/wills
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Last Will and Testament",
  "jurisdiction": "US-General",
  "templateVersion": "1.0"
}
```

**Response:**

```typescript
201 Created
{
  "will": {
    "id": "uuid",
    "userId": "string",
    "title": "My Last Will and Testament",
    "status": "draft",
    "jurisdiction": "US-General",
    "createdAt": "2025-01-25T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  },
  "draft": {
    "sessionId": "uuid",
    "stepNumber": 1,
    "expiresAt": "2025-01-25T11:00:00Z"
  }
}
```

**Error Responses:**

```typescript
400 Bad Request
{
  "error": "INVALID_JURISDICTION",
  "message": "Jurisdiction 'INVALID' is not supported"
}

401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

#### GET /api/wills

Retrieve user's wills with optional filtering.

**Request:**

```typescript
GET /api/wills?status=draft&limit=10&offset=0
Authorization: Bearer {token}
```

**Response:**

```typescript
200 OK
{
  "wills": [
    {
      "id": "uuid",
      "title": "My Will",
      "status": "draft",
      "jurisdiction": "US-General",
      "createdAt": "2025-01-25T10:00:00Z",
      "updatedAt": "2025-01-25T10:00:00Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### GET /api/wills/{id}

Retrieve specific will details.

**Request:**

```typescript
GET /api/wills/uuid
Authorization: Bearer {token}
```

**Response:**

```typescript
200 OK
{
  "will": {
    "id": "uuid",
    "userId": "string",
    "title": "My Last Will and Testament",
    "status": "draft",
    "jurisdiction": "US-General",
    "createdAt": "2025-01-25T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z",
    "testatorData": { /* personal information */ },
    "beneficiaries": [ /* beneficiary array */ ],
    "assets": { /* asset inventory */ },
    "executorData": { /* executor information */ },
    "specialInstructions": { /* special wishes */ }
  }
}
```

#### PUT /api/wills/{id}

Update will data with partial updates.

**Request:**

```typescript
PUT /api/wills/uuid
Authorization: Bearer {token}
Content-Type: application/json

{
  "testatorData": {
    "fullName": "John Updated Doe",
    "address": {
      "street": "456 Updated St",
      "city": "Updated City",
      "state": "CA",
      "zipCode": "90210",
      "country": "US"
    }
  }
}
```

**Response:**

```typescript
200 OK
{
  "will": {
    "id": "uuid",
    "updatedAt": "2025-01-25T10:30:00Z",
    "testatorData": {
      "fullName": "John Updated Doe",
      "address": {
        "street": "456 Updated St",
        "city": "Updated City",
        "state": "CA",
        "zipCode": "90210",
        "country": "US"
      }
    }
  }
}
```

#### POST /api/wills/{id}/generate-pdf

Generate PDF document from will data.

**Request:**

```typescript
POST /api/wills/uuid/generate-pdf
Authorization: Bearer {token}
Content-Type: application/json

{
  "includeWatermark": false,
  "format": "A4"
}
```

**Response:**

```typescript
200 OK
{
  "pdfUrl": "https://vault.schwalbe.com/wills/uuid/will.pdf",
  "checksum": "sha256-hash",
  "size": 125000,
  "generatedAt": "2025-01-25T10:45:00Z"
}
```

### Template Management

#### GET /api/templates

Retrieve available templates with filtering.

**Request:**

```typescript
GET /api/templates?jurisdiction=US-General&limit=10
Authorization: Bearer {token}
```

**Response:**

```typescript
200 OK
{
  "templates": [
    {
      "id": "uuid",
      "jurisdiction": "US-General",
      "templateName": "Standard Will Template",
      "templateVersion": "1.0",
      "legalRequirements": {
        "witnessCount": 2,
        "notarizationRequired": false,
        "selfProving": true
      },
      "isActive": true
    }
  ],
  "total": 1
}
```

### Draft Management

#### GET /api/drafts/{sessionId}

Retrieve draft session data.

**Request:**

```typescript
GET /api/drafts/session-uuid
Authorization: Bearer {token}
```

**Response:**

```typescript
200 OK
{
  "draft": {
    "sessionId": "session-uuid",
    "willId": "will-uuid",
    "stepNumber": 3,
    "totalSteps": 8,
    "draftData": {
      "testatorData": { /* partial data */ },
      "beneficiaries": [ /* partial beneficiaries */ ]
    },
    "expiresAt": "2025-01-25T11:00:00Z"
  }
}
```

#### PUT /api/drafts/{sessionId}

Update draft session with new data.

**Request:**

```typescript
PUT /api/drafts/session-uuid
Authorization: Bearer {token}
Content-Type: application/json

{
  "stepNumber": 4,
  "draftData": {
    "assets": {
      "realEstate": [
        {
          "description": "Family Home",
          "address": "123 Main St",
          "value": 500000
        }
      ]
    }
  }
}
```

**Response:**

```typescript
200 OK
{
  "draft": {
    "sessionId": "session-uuid",
    "stepNumber": 4,
    "updatedAt": "2025-01-25T10:15:00Z"
  }
}
```

#### POST /api/drafts/{sessionId}/complete

Complete draft and create final will.

**Request:**

```typescript
POST /api/drafts/session-uuid/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmLegalReview": true
}
```

**Response:**

```typescript
200 OK
{
  "will": {
    "id": "will-uuid",
    "status": "completed",
    "completedAt": "2025-01-25T10:20:00Z"
  },
  "pdf": {
    "url": "https://vault.schwalbe.com/wills/will-uuid/will.pdf",
    "checksum": "sha256-hash"
  }
}
```

## GraphQL Schema

```graphql
type Query {
  wills(status: WillStatus, limit: Int, offset: Int): WillConnection!
  will(id: ID!): Will
  templates(jurisdiction: String, limit: Int, offset: Int): TemplateConnection!
  template(id: ID!): WillTemplate
  draft(sessionId: String!): WillDraft
}

type Mutation {
  createWill(input: CreateWillInput!): CreateWillPayload!
  updateWill(id: ID!, input: UpdateWillInput!): UpdateWillPayload!
  deleteWill(id: ID!): DeleteWillPayload!
  generatePdf(id: ID!, input: GeneratePdfInput): GeneratePdfPayload!
  updateDraft(sessionId: String!, input: UpdateDraftInput!): UpdateDraftPayload!
  completeDraft(sessionId: String!, input: CompleteDraftInput!): CompleteDraftPayload!
}

type Will {
  id: ID!
  userId: String!
  title: String!
  status: WillStatus!
  jurisdiction: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  completedAt: DateTime

  testatorData: JSONObject!
  beneficiaries: [Beneficiary!]!
  assets: JSONObject!
  executorData: JSONObject!
  guardianshipData: JSONObject!
  specialInstructions: JSONObject!
  legalData: JSONObject!
  documentData: JSONObject!

  versionNumber: Int!
  parentWill: Will
  revisions: [Will!]!
}

type Beneficiary {
  id: String!
  name: String!
  relationship: RelationshipType!
  percentage: Float!
  specificGifts: [String!]
  conditions: String
  contactInfo: ContactInfo
  isBackup: Boolean
}

type ContactInfo {
  email: String
  phone: String
  address: String
}

type WillTemplate {
  id: ID!
  jurisdiction: String!
  templateName: String!
  templateVersion: String!
  templateStructure: JSONObject!
  legalRequirements: JSONObject!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WillDraft {
  sessionId: String!
  willId: String!
  stepNumber: Int!
  totalSteps: Int!
  draftData: JSONObject!
  expiresAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WillConnection {
  edges: [WillEdge!]!
  nodes: [Will!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type WillEdge {
  node: Will!
  cursor: String!
}

type TemplateConnection {
  edges: [TemplateEdge!]!
  nodes: [WillTemplate!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type TemplateEdge {
  node: WillTemplate!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Input Types
input CreateWillInput {
  title: String
  jurisdiction: String!
  templateVersion: String
}

input UpdateWillInput {
  title: String
  testatorData: JSONObject
  beneficiaries: [BeneficiaryInput!]
  assets: JSONObject
  executorData: JSONObject
  guardianshipData: JSONObject
  specialInstructions: JSONObject
  legalData: JSONObject
}

input BeneficiaryInput {
  id: String
  name: String!
  relationship: RelationshipType!
  percentage: Float!
  specificGifts: [String!]
  conditions: String
  contactInfo: ContactInfoInput
  isBackup: Boolean
}

input ContactInfoInput {
  email: String
  phone: String
  address: String
}

input GeneratePdfInput {
  includeWatermark: Boolean
  format: String
}

input UpdateDraftInput {
  stepNumber: Int
  draftData: JSONObject
}

input CompleteDraftInput {
  confirmLegalReview: Boolean
}

# Enums
enum WillStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum RelationshipType {
  SPOUSE
  CHILD
  PARENT
  SIBLING
  GRANDCHILD
  FRIEND
  CHARITY
  OTHER
}

# Payload Types
type CreateWillPayload {
  will: Will!
  draft: WillDraft!
  errors: [Error!]
}

type UpdateWillPayload {
  will: Will!
  errors: [Error!]
}

type DeleteWillPayload {
  success: Boolean!
  errors: [Error!]
}

type GeneratePdfPayload {
  pdfUrl: String!
  checksum: String!
  size: Int!
  generatedAt: DateTime!
  errors: [Error!]
}

type UpdateDraftPayload {
  draft: WillDraft!
  errors: [Error!]
}

type CompleteDraftPayload {
  will: Will!
  pdf: PdfResult
  errors: [Error!]
}

type PdfResult {
  url: String!
  checksum: String!
  size: Int!
  generatedAt: DateTime!
}

type Error {
  field: String
  message: String!
  code: String!
}
```

## WebSocket Events

### Real-time Updates

#### Will Updates

```typescript
interface WillUpdatedEvent {
  type: 'will:updated';
  willId: string;
  userId: string;
  changes: Partial<WillData>;
  timestamp: string;
}
```

#### Draft Session Events

```typescript
interface DraftSavedEvent {
  type: 'draft:saved';
  sessionId: string;
  stepNumber: number;
  timestamp: string;
}

interface DraftExpiredEvent {
  type: 'draft:expired';
  sessionId: string;
  timestamp: string;
}
```

#### PDF Generation Events

```typescript
interface PdfGeneratedEvent {
  type: 'pdf:generated';
  willId: string;
  pdfUrl: string;
  checksum: string;
  size: number;
  timestamp: string;
}

interface PdfGenerationFailedEvent {
  type: 'pdf:generation:failed';
  willId: string;
  error: string;
  timestamp: string;
}
```

## Error Response Format

All API endpoints follow a consistent error response format:

```typescript
interface ErrorResponse {
  error: string;        // Error code
  message: string;      // Human-readable message
  details?: any;        // Additional error details
  timestamp: string;    // ISO timestamp
  requestId: string;    // Request correlation ID
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- **Will Management**: 100 requests per minute per user
- **Template Access**: 500 requests per minute per user
- **PDF Generation**: 10 requests per minute per user
- **Draft Operations**: 200 requests per minute per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Authentication uses Supabase Auth JWTs validated on each request. Do not log Authorization headers, and include a correlation ID (e.g., X-Request-ID) on all requests.
