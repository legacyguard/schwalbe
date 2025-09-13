# Next.js Migration - API Contracts

## REST API Contracts

### Authentication Endpoints

#### POST /api/auth/signin

**Purpose**: User authentication
**Authentication**: None required

**Request**:

```typescript
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "user@example.com",
      "firstName": "string",
      "lastName": "string"
    },
    "token": "jwt_token_string"
  }
}
```

**Error Response**:

```typescript
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

#### POST /api/auth/signup

**Purpose**: User registration
**Authentication**: None required

**Request**:

```typescript
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "acceptTerms": true
}
```

**Response**:

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "verificationRequired": true
  }
}
```

### User Management Endpoints

#### GET /api/users/profile

**Purpose**: Get current user profile
**Authentication**: Required

**Response**:

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url_string",
      "preferences": {
        "theme": "light",
        "language": "en",
        "notifications": true
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### PUT /api/users/profile

**Purpose**: Update user profile
**Authentication**: Required

**Request**:

```typescript
{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Response**:

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "preferences": {
        "theme": "dark",
        "language": "en"
      },
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Data Management Endpoints

#### GET /api/data/dashboard

**Purpose**: Get dashboard data
**Authentication**: Required

**Query Parameters**:

- `period`: "7d" | "30d" | "90d" (default: "30d")
- `type`: "overview" | "detailed" (default: "overview")

**Response**:

```typescript
{
  "success": true,
  "data": {
    "stats": {
      "totalItems": 150,
      "activeItems": 45,
      "completedItems": 105,
      "pendingItems": 0
    },
    "recentActivity": [
      {
        "id": "string",
        "type": "item_created",
        "description": "New item created",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "charts": {
      "activity": {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "data": [12, 19, 3, 5, 2]
      }
    }
  }
}
```

#### POST /api/data/items

**Purpose**: Create new data item
**Authentication**: Required

**Request**:

```typescript
{
  "title": "Sample Item",
  "description": "This is a sample item",
  "category": "general",
  "tags": ["sample", "test"],
  "metadata": {
    "priority": "medium",
    "dueDate": "2024-02-01"
  }
}
```

**Response**:

```typescript
{
  "success": true,
  "data": {
    "item": {
      "id": "string",
      "title": "Sample Item",
      "description": "This is a sample item",
      "category": "general",
      "tags": ["sample", "test"],
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### GET /api/data/items

**Purpose**: List data items with pagination
**Authentication**: Required

**Query Parameters**:

- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `category`: string (optional filter)
- `status`: string (optional filter)
- `search`: string (optional search term)
- `sort`: "created_at" | "updated_at" | "title" (default: "created_at")
- `order`: "asc" | "desc" (default: "desc")

**Response**:

```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "Sample Item",
        "description": "This is a sample item",
        "category": "general",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## GraphQL API Contracts (Future)

### Schema Definition

```graphql
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): UserConnection!
  dashboard(period: String): DashboardData!
  items(
    category: String
    status: String
    search: String
    first: Int
    after: String
  ): ItemConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  createItem(input: CreateItemInput!): Item!
  updateItem(id: ID!, input: UpdateItemInput!): Item!
  deleteItem(id: ID!): Boolean!
}

type User {
  id: ID!
  email: String!
  firstName: String
  lastName: String
  avatar: String
  preferences: UserPreferences!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserPreferences {
  theme: Theme!
  language: String!
  notifications: Boolean!
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

type Item {
  id: ID!
  title: String!
  description: String
  category: String!
  tags: [String!]!
  status: ItemStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ItemStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

type DashboardData {
  stats: DashboardStats!
  recentActivity: [Activity!]!
  charts: DashboardCharts!
}

type DashboardStats {
  totalItems: Int!
  activeItems: Int!
  completedItems: Int!
  pendingItems: Int!
}

type Activity {
  id: ID!
  type: ActivityType!
  description: String!
  timestamp: DateTime!
}

enum ActivityType {
  ITEM_CREATED
  ITEM_UPDATED
  ITEM_COMPLETED
  USER_JOINED
}

type DashboardCharts {
  activity: ChartData!
  categories: ChartData!
}

type ChartData {
  labels: [String!]!
  data: [Int!]!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  node: User!
  cursor: String!
}

type ItemConnection {
  edges: [ItemEdge!]!
  pageInfo: PageInfo!
}

type ItemEdge {
  node: Item!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

input CreateUserInput {
  email: String!
  password: String!
  firstName: String
  lastName: String
}

input UpdateUserInput {
  firstName: String
  lastName: String
  preferences: UpdateUserPreferencesInput
}

input UpdateUserPreferencesInput {
  theme: Theme
  language: String
  notifications: Boolean
}

input CreateItemInput {
  title: String!
  description: String
  category: String!
  tags: [String!]
}

input UpdateItemInput {
  title: String
  description: String
  category: String
  tags: [String!]
  status: ItemStatus
}

scalar DateTime
```

## WebSocket Contracts

### Real-time Subscriptions

#### User Status Updates

```typescript
// Client subscription
const subscription = client.subscribe('user:status', {
  userId: 'user_123'
})

// Server broadcast
{
  "type": "user:status",
  "payload": {
    "userId": "user_123",
    "status": "online",
    "lastSeen": "2024-01-01T00:00:00Z"
  }
}
```

#### Dashboard Updates

```typescript
// Client subscription
const subscription = client.subscribe('dashboard:updates', {
  userId: 'user_123'
})

// Server broadcast
{
  "type": "dashboard:updates",
  "payload": {
    "stats": {
      "totalItems": 151,
      "activeItems": 46
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## File Upload Contracts

### Single File Upload

```typescript
// Request (multipart/form-data)
POST /api/upload
Content-Type: multipart/form-data

{
  "file": <file_data>,
  "metadata": {
    "category": "documents",
    "tags": ["important", "confidential"]
  }
}

// Response
{
  "success": true,
  "data": {
    "file": {
      "id": "string",
      "filename": "document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "url": "https://storage.example.com/files/document.pdf",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Batch File Upload

```typescript
// Request (multipart/form-data)
POST /api/upload/batch
Content-Type: multipart/form-data

{
  "files": [<file_data_1>, <file_data_2>],
  "metadata": {
    "category": "documents",
    "tags": ["batch", "upload"]
  }
}

// Response
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "string",
        "filename": "document1.pdf",
        "status": "uploaded"
      },
      {
        "id": "string",
        "filename": "document2.pdf",
        "status": "uploaded"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

## Error Response Contracts

### Standard Error Format

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific_field_name",
      "reason": "detailed_reason"
    },
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid credentials
- `AUTH_EXPIRED`: Token expired
- `PERMISSION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `RESOURCE_NOT_FOUND`: Resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Response

```typescript
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "remaining": 0
    }
  }
}
```

## Pagination Contracts

### Cursor-based Pagination

```typescript
// Request
GET /api/items?first=20&after=cursor_123

// Response
{
  "success": true,
  "data": {
    "items": [...],
    "pageInfo": {
      "hasNextPage": true,
      "hasPreviousPage": false,
      "startCursor": "cursor_123",
      "endCursor": "cursor_456"
    }
  }
}
```

### Offset-based Pagination

```typescript
// Request
GET /api/items?page=2&limit=20

// Response
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

## Versioning Strategy

### API Versioning

- **URL Path Versioning**: `/api/v1/users`
- **Header Versioning**: `Accept: application/vnd.api.v1+json`
- **Query Parameter**: `/api/users?version=1`

### Breaking Changes

- Major version bump for breaking changes
- Deprecation warnings 6 months before removal
- Sunset period of 12 months for old versions
- Clear migration guides provided

## SDK Contracts

### TypeScript SDK

```typescript
// Generated SDK
export class ApiClient {
  constructor(config: ApiConfig)

  // Authentication
  auth: {
    signin(credentials: SigninRequest): Promise<AuthResponse>
    signup(data: SignupRequest): Promise<AuthResponse>
    signout(): Promise<void>
    refresh(): Promise<AuthResponse>
  }

  // Users
  users: {
    getProfile(): Promise<UserProfile>
    updateProfile(data: UpdateProfileRequest): Promise<UserProfile>
    list(options?: ListOptions): Promise<UserList>
  }

  // Data
  data: {
    getDashboard(period?: string): Promise<DashboardData>
    createItem(data: CreateItemRequest): Promise<Item>
    listItems(options?: ListOptions): Promise<ItemList>
    updateItem(id: string, data: UpdateItemRequest): Promise<Item>
    deleteItem(id: string): Promise<void>
  }
}
```

This comprehensive API contract specification ensures consistent, reliable, and well-documented interfaces for the Next.js migration, supporting both current REST patterns and future GraphQL implementations.
