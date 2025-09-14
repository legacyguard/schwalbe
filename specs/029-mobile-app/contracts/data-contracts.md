# Mobile App Data Contracts

## Core Data Types

### User Profile

```typescript
interface User {
  id: string;
  authUserId: string; // Supabase Auth user ID
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  biometricEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}
```

### Document Entity

```typescript
interface Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  storagePath: string;
  thumbnailPath?: string;
  metadata: DocumentMetadata;
  encryption: EncryptionInfo;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

type DocumentType =
  | 'will'
  | 'trust'
  | 'power_of_attorney'
  | 'healthcare_directive'
  | 'insurance_policy'
  | 'property_deed'
  | 'bank_statement'
  | 'tax_document'
  | 'identification'
  | 'other';

type DocumentCategory =
  | 'legal'
  | 'financial'
  | 'medical'
  | 'personal'
  | 'business'
  | 'estate'
  | 'insurance';

type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'deleted';
```

### Emergency Access

```typescript
interface EmergencyAccess {
  id: string;
  userId: string;
  status: EmergencyStatus;
  reason: string;
  requestedAt: string;
  activatedAt?: string;
  expiresAt?: string;
  requestedBy: string; // Guardian ID
  accessLevel: AccessLevel;
  documents: EmergencyDocument[];
  auditLog: EmergencyAuditEntry[];
  verificationTokens: VerificationToken[];
}

type EmergencyStatus =
  | 'requested'
  | 'pending_verification'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'denied';

type AccessLevel =
  | 'read_only'
  | 'limited'
  | 'full';

interface EmergencyDocument {
  documentId: string;
  accessGranted: boolean;
  decryptedContent?: string;
  accessExpiresAt?: string;
  accessedAt?: string;
  accessCount: number;
}

interface EmergencyAuditEntry {
  id: string;
  timestamp: string;
  action: EmergencyAction;
  actorId: string;
  actorType: 'user' | 'guardian' | 'system';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

type EmergencyAction =
  | 'requested'
  | 'verification_sent'
  | 'verified'
  | 'activated'
  | 'accessed_document'
  | 'expired'
  | 'cancelled';
```

## Sync Data Structures

### Sync Operation

```typescript
interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entityType: string;
  entityId: string;
  data: any;
  timestamp: string;
  retryCount: number;
  status: SyncStatus;
  error?: string;
  conflictResolution?: ConflictResolution;
}

type SyncOperationType =
  | 'create'
  | 'update'
  | 'delete';

type SyncStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'conflict';
```

### Sync Conflict

```typescript
interface SyncConflict {
  id: string;
  operationId: string;
  entityType: string;
  entityId: string;
  clientVersion: any;
  serverVersion: any;
  detectedAt: string;
  resolved: boolean;
  resolution?: ConflictResolution;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  mergedData?: any;
  notes?: string;
}
```

## Notification Data Structures

### Push Notification

```typescript
interface PushNotification {
  id: string;
  userId: string;
  deviceId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  priority: NotificationPriority;
  ttl?: number;
  badge?: number;
  sound?: string;
  category?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  status: NotificationStatus;
}

type NotificationType =
  | 'document_ready'
  | 'document_shared'
  | 'emergency_alert'
  | 'family_activity'
  | 'reminder'
  | 'system_update'
  | 'marketing'
  | 'security_alert';

type NotificationPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'emergency';

type NotificationStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';
```

### Notification Preferences

```typescript
interface NotificationPreferences {
  enabled: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}
```

## Security Data Structures

### Encryption Info

```typescript
interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  iv: string; // Initialization vector
  encrypted: boolean;
  keyVersion: string;
  encryptedAt: string;
  decryptedAt?: string;
}

interface EncryptionKey {
  id: string;
  userId: string;
  keyType: KeyType;
  publicKey?: string;
  encryptedPrivateKey?: string;
  keyVersion: string;
  createdAt: string;
  expiresAt?: string;
  status: KeyStatus;
  metadata: KeyMetadata;
}

type KeyType =
  | 'master'
  | 'document'
  | 'sharing'
  | 'biometric';

type KeyStatus =
  | 'active'
  | 'inactive'
  | 'compromised'
  | 'expired';

interface KeyMetadata {
  algorithm: string;
  keySize: number;
  createdBy: string;
  deviceId?: string;
  biometricBound?: boolean;
}
```

### Biometric Data

```typescript
interface BiometricCredential {
  id: string;
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  publicKey: string;
  keyId: string;
  counter: number;
  createdAt: string;
  lastUsedAt?: string;
  status: BiometricStatus;
}

type BiometricType =
  | 'face_id'
  | 'touch_id'
  | 'fingerprint'
  | 'iris'
  | 'voice';

type BiometricStatus =
  | 'active'
  | 'inactive'
  | 'locked'
  | 'compromised';
```

## Offline Storage Schema

### SQLite Tables

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT UNIQUE,
  email TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  phone_number TEXT,
  date_of_birth TEXT,
  preferences TEXT, -- JSON
  biometric_enabled INTEGER DEFAULT 0,
  last_login_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  storage_path TEXT,
  thumbnail_path TEXT,
  metadata TEXT, -- JSON
  encryption TEXT, -- JSON
  tags TEXT, -- JSON array
  is_favorite INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  expires_at TEXT,
  created_at TEXT,
  updated_at TEXT,
  last_accessed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sync operations table
CREATE TABLE sync_operations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON
  timestamp TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error TEXT,
  conflict_resolution TEXT -- JSON
);

-- Emergency access table (store only hashed tokens)
CREATE TABLE emergency_access (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  requested_at TEXT NOT NULL,
  activated_at TEXT,
  expires_at TEXT,
  requested_by TEXT,
  access_level TEXT NOT NULL,
  documents TEXT, -- JSON
  audit_log TEXT, -- JSON
  verification_token_hashes TEXT, -- JSON of hashed tokens with expires_at (never store raw tokens)
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Validation Rules

### Document Validation

```typescript
const documentValidationRules = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  fileSize: {
    maxBytes: 50 * 1024 * 1024 // 50MB
  },
  mimeType: {
    allowed: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
};
```

### User Validation

```typescript
const userValidationRules = {
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  firstName: {
    minLength: 1,
    maxLength: 50
  },
  lastName: {
    minLength: 1,
    maxLength: 50
  },
  phoneNumber: {
    format: /^\+?[1-9]\d{1,14}$/
  }
};
```

## Data Migration Contracts

### Migration Interface

```typescript
interface DataMigration {
  version: string;
  description: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  down: (db: SQLiteDatabase) => Promise<void>;
  checksum: string; // For integrity verification
}
```

### Migration Registry

```typescript
const MIGRATIONS: DataMigration[] = [
  {
    version: '1.0.0',
    description: 'Initial schema',
    up: async (db) => {
      // Migration logic
    },
    down: async (db) => {
      // Rollback logic
    },
    checksum: 'sha256-hash'
  }
];
```

These data contracts ensure type safety, validation, and consistency across the mobile application and its integration with the backend services.
