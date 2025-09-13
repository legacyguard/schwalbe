# 026 — Vault Encrypted Storage API Contracts

## Overview

This document defines the API contracts for the encrypted vault system, including request/response formats, error handling, and authentication requirements.

## Authentication

All API endpoints require authentication via Clerk JWT tokens. Include the Authorization header:

```http
Authorization: Bearer <clerk-jwt-token>
```

## Core Endpoints

### 1. Document Upload

**Endpoint:** `POST /api/vault/documents`

**Description:** Upload and encrypt a document

**Request:**

```typescript
interface UploadDocumentRequest {
  file: File; // FormData
  metadata?: {
    description?: string;
    tags?: string[];
    expiresAt?: string; // ISO 8601 date
  };
}
```

**Response:**

```typescript
interface UploadDocumentResponse {
  success: true;
  document: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    encryptionNonce: string;
    checksum: string;
    createdAt: string;
    uploadedBy: string;
  };
}
```

**Error Responses:**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Possible error codes:
- "INVALID_FILE_TYPE" - Unsupported file type
- "FILE_TOO_LARGE" - File exceeds size limit
- "ENCRYPTION_FAILED" - Encryption process failed
- "STORAGE_ERROR" - Storage upload failed
- "UNAUTHORIZED" - Authentication required
```

**Example:**

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "metadata={\"description\":\"Important document\"}" \
  https://api.legacyguard.eu/api/vault/documents
```

### 2. Document Download

**Endpoint:** `GET /api/vault/documents/{documentId}`

**Description:** Download and decrypt a document

**Request:**

```typescript
interface DownloadDocumentRequest {
  documentId: string; // URL parameter
}
```

**Response:**

```typescript
// Binary file response with headers:
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 12345
X-Encryption-Status: decrypted
X-File-Checksum: sha256-hash
```

**Error Responses:**

```typescript
// Same as upload errors plus:
- "DOCUMENT_NOT_FOUND" - Document doesn't exist
- "ACCESS_DENIED" - User doesn't have permission
- "DECRYPTION_FAILED" - Decryption process failed
- "CORRUPTED_FILE" - File integrity check failed
```

**Example:**

```bash
curl -X GET \
  -H "Authorization: Bearer <token>" \
  -o document.pdf \
  https://api.legacyguard.eu/api/vault/documents/123e4567-e89b-12d3-a456-426614174000
```

### 3. List Documents

**Endpoint:** `GET /api/vault/documents`

**Description:** List user's documents with pagination and filtering

**Query Parameters:**

```typescript
interface ListDocumentsQuery {
  limit?: number; // Default: 20, Max: 100
  offset?: number; // Default: 0
  sortBy?: 'createdAt' | 'fileName' | 'fileSize'; // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
  mimeType?: string; // Filter by MIME type
  search?: string; // Full-text search
  tags?: string[]; // Filter by tags
}
```

**Response:**

```typescript
interface ListDocumentsResponse {
  success: true;
  documents: Array<{
    id: string;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    checksum: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isEncrypted: boolean;
    encryptionVersion: number;
  }>;
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}
```

**Example:**

```bash
curl -X GET \
  -H "Authorization: Bearer <token>" \
  "https://api.legacyguard.eu/api/vault/documents?limit=10&sortBy=createdAt&sortOrder=desc"
```

### 4. Delete Document

**Endpoint:** `DELETE /api/vault/documents/{documentId}`

**Description:** Soft delete a document

**Request:**

```typescript
interface DeleteDocumentRequest {
  documentId: string; // URL parameter
}
```

**Response:**

```typescript
interface DeleteDocumentResponse {
  success: true;
  document: {
    id: string;
    deletedAt: string;
  };
}
```

**Error Responses:**

```typescript
// Same as download errors plus:
- "DOCUMENT_ALREADY_DELETED" - Document already soft deleted
```

### 5. Document Metadata Update

**Endpoint:** `PATCH /api/vault/documents/{documentId}/metadata`

**Description:** Update document metadata (tags, description, etc.)

**Request:**

```typescript
interface UpdateMetadataRequest {
  documentId: string; // URL parameter
  metadata: {
    description?: string;
    tags?: string[];
    expiresAt?: string;
  };
}
```

**Response:**

```typescript
interface UpdateMetadataResponse {
  success: true;
  document: {
    id: string;
    metadata: {
      description?: string;
      tags: string[];
      expiresAt?: string;
    };
    updatedAt: string;
  };
}
```

## Key Management Endpoints

### 6. Initialize Encryption Keys

**Endpoint:** `POST /api/vault/keys/initialize`

**Description:** Generate and store user's encryption keys

**Request:**

```typescript
interface InitializeKeysRequest {
  password: string; // User's master password
  recoveryEmail?: string; // Optional recovery email
}
```

**Response:**

```typescript
interface InitializeKeysResponse {
  success: true;
  keyInfo: {
    keyId: string;
    publicKey: string;
    keyVersion: number;
    createdAt: string;
  };
}
```

**Error Responses:**

```typescript
- "KEYS_ALREADY_EXIST" - User already has active keys
- "WEAK_PASSWORD" - Password doesn't meet requirements
- "KEY_GENERATION_FAILED" - Cryptographic operation failed
```

### 7. Rotate Encryption Keys

**Endpoint:** `POST /api/vault/keys/rotate`

**Description:** Rotate user's encryption keys for security

**Request:**

```typescript
interface RotateKeysRequest {
  currentPassword: string;
  newPassword: string;
  reason?: string; // Rotation reason
}
```

**Response:**

```typescript
interface RotateKeysResponse {
  success: true;
  rotation: {
    oldKeyId: string;
    newKeyId: string;
    rotationId: string;
    completedAt: string;
  };
}
```

### 8. Key Status Check

**Endpoint:** `GET /api/vault/keys/status`

**Description:** Check encryption key status

**Response:**

```typescript
interface KeyStatusResponse {
  success: true;
  status: {
    hasKeys: boolean;
    keyVersion: number;
    lastRotation?: string;
    needsRotation: boolean;
    isLocked: boolean;
    failedAttempts: number;
  };
}
```

## Sharing Endpoints

### 9. Share Document

**Endpoint:** `POST /api/vault/documents/{documentId}/share`

**Description:** Share document with another user

**Request:**

```typescript
interface ShareDocumentRequest {
  documentId: string; // URL parameter
  shareWith: {
    userId: string;
    email: string;
  };
  permissions: ('read' | 'download')[];
  expiresAt?: string; // Optional expiration
  message?: string; // Optional message to recipient
}
```

**Response:**

```typescript
interface ShareDocumentResponse {
  success: true;
  share: {
    id: string;
    documentId: string;
    sharedWith: string;
    permissions: string[];
    expiresAt?: string;
    createdAt: string;
  };
}
```

### 10. Revoke Share

**Endpoint:** `DELETE /api/vault/documents/{documentId}/share/{shareId}`

**Description:** Revoke document sharing

**Request:**

```typescript
interface RevokeShareRequest {
  documentId: string; // URL parameter
  shareId: string; // URL parameter
}
```

**Response:**

```typescript
interface RevokeShareResponse {
  success: true;
  share: {
    id: string;
    revokedAt: string;
  };
}
```

## Batch Operations

### 11. Batch Upload

**Endpoint:** `POST /api/vault/documents/batch`

**Description:** Upload multiple documents in batch

**Request:**

```typescript
interface BatchUploadRequest {
  files: File[]; // Multiple files
  metadata?: {
    description?: string;
    tags?: string[];
  }[]; // Optional metadata per file
}
```

**Response:**

```typescript
interface BatchUploadResponse {
  success: true;
  results: Array<{
    fileIndex: number;
    success: boolean;
    document?: {
      id: string;
      fileName: string;
    };
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
```

### 12. Batch Delete

**Endpoint:** `DELETE /api/vault/documents/batch`

**Description:** Delete multiple documents

**Request:**

```typescript
interface BatchDeleteRequest {
  documentIds: string[];
}
```

**Response:**

```typescript
interface BatchDeleteResponse {
  success: true;
  results: Array<{
    documentId: string;
    success: boolean;
    error?: string;
  }>;
}
```

## Monitoring Endpoints

### 13. Vault Statistics

**Endpoint:** `GET /api/vault/statistics`

**Description:** Get vault usage statistics

**Response:**

```typescript
interface VaultStatisticsResponse {
  success: true;
  statistics: {
    totalDocuments: number;
    totalSize: number; // bytes
    encryptedDocuments: number;
    recentUploads: number; // last 30 days
    storageUsed: number; // bytes
    averageFileSize: number;
    topFileTypes: Array<{
      mimeType: string;
      count: number;
    }>;
  };
}
```

### 14. Encryption Health Check

**Endpoint:** `GET /api/vault/health/encryption`

**Description:** Check encryption system health

**Response:**

```typescript
interface EncryptionHealthResponse {
  success: true;
  health: {
    encryptionService: 'healthy' | 'degraded' | 'unhealthy';
    keyManagement: 'healthy' | 'degraded' | 'unhealthy';
    storage: 'healthy' | 'degraded' | 'unhealthy';
    lastTestRun: string;
    testsPassed: number;
    testsFailed: number;
  };
}
```

## Rate Limiting

All endpoints are rate limited:

- **Upload operations:** 10 requests per minute per user
- **Download operations:** 50 requests per minute per user
- **List operations:** 100 requests per minute per user
- **Key operations:** 5 requests per minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Standard Error Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

```typescript
type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'ENCRYPTION_ERROR'
  | 'DECRYPTION_ERROR'
  | 'STORAGE_ERROR'
  | 'KEY_MANAGEMENT_ERROR';
```

## WebSocket Events (Real-time Updates)

### Document Events

```typescript
interface DocumentEvent {
  type: 'document.uploaded' | 'document.deleted' | 'document.shared';
  documentId: string;
  userId: string;
  timestamp: string;
  metadata?: any;
}
```

### Key Events

```typescript
interface KeyEvent {
  type: 'key.rotated' | 'key.locked' | 'key.recovery_initiated';
  userId: string;
  keyId: string;
  timestamp: string;
  metadata?: any;
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { VaultClient } from '@legacyguard/vault-sdk';

const client = new VaultClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.legacyguard.eu'
});

// Upload document
const result = await client.documents.upload(file, {
  description: 'Important document',
  tags: ['legal', 'contract']
});

// Download document
const blob = await client.documents.download(documentId);

// List documents
const documents = await client.documents.list({
  limit: 20,
  sortBy: 'createdAt'
});
```

### React Hook Usage

```typescript
import { useVault } from '@legacyguard/vault-react';

function DocumentManager() {
  const { documents, upload, download, isLoading } = useVault();

  const handleUpload = async (file: File) => {
    try {
      await upload(file, { tags: ['important'] });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          {doc.fileName}
          <button onClick={() => download(doc.id)}>
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
```

This API contract provides a comprehensive interface for the encrypted vault system, ensuring consistent and secure document management operations.
