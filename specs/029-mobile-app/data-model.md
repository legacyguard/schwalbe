# Mobile App Data Model & API Contracts

## Overview

This document defines the data structures, API contracts, and local storage schemas for the LegacyGuard mobile application. The mobile app requires a hybrid data model that supports both online synchronization with Supabase and offline functionality using local storage.

## Core Data Entities

### MobileSession

```typescript
interface MobileSession {
  id: string;
  userId: string;
  deviceId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  startedAt: string;
  lastActivityAt: string;
  isActive: boolean;
  biometricUsed: boolean;
  ipAddress?: string;
  location?: GeoLocation;
}
```

### OfflineData

```typescript
interface OfflineData {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  data: any;
  version: number;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  checksum: string;
  expiresAt?: string;
}
```

### PushNotification

```typescript
interface PushNotification {
  id: string;
  userId: string;
  deviceToken: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  status: NotificationStatus;
}
```

### BiometricAuth

```typescript
interface BiometricAuth {
  id: string;
  userId: string;
  deviceId: string;
  biometricType: 'face_id' | 'touch_id' | 'fingerprint';
  publicKey: string;
  keyId: string;
  counter: number;
  enrolledAt: string;
  lastUsedAt?: string;
  status: 'active' | 'inactive' | 'locked';
  metadata: BiometricMetadata;
}
```

### MobileSettings

```typescript
interface MobileSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  offline: OfflineSettings;
  accessibility: AccessibilitySettings;
  updatedAt: string;
}
```

### SyncStatus

```typescript
interface SyncStatus {
  id: string;
  userId: string;
  deviceId: string;
  lastSyncAt?: string;
  pendingChanges: number;
  serverChanges: number;
  conflicts: SyncConflict[];
  isOnline: boolean;
  syncInProgress: boolean;
  error?: string;
}
```

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  offlineMode: boolean;
}

interface DeviceInfo {
  platform: 'ios' | 'android';
  model: string;
  osVersion: string;
  appVersion: string;
  deviceId: string;
}

interface NotificationSettings {
  emergencyAlerts: boolean;
  documentUpdates: boolean;
  familyActivity: boolean;
  reminders: boolean;
  marketing: boolean;
}

interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReporting: boolean;
  locationServices: boolean;
}

### Document Management

```typescript
interface MobileDocument {
  id: string;
  userId: string;
  title: string;
  type: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  filePath?: string; // Local file path for offline access
  supabasePath?: string; // Supabase storage path
  metadata: DocumentMetadata;
  encryption: EncryptionInfo;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

type DocumentType =
  | 'will'
  | 'trust'
  | 'power_of_attorney'
  | 'healthcare_directive'
  | 'insurance'
  | 'property_deed'
  | 'bank_statement'
  | 'other';

type DocumentCategory =
  | 'legal'
  | 'financial'
  | 'medical'
  | 'personal'
  | 'family';

type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'syncing'
  | 'offline'
  | 'error';

interface DocumentMetadata {
  size: number; // bytes
  mimeType: string;
  checksum: string; // SHA-256 hash
  ocrText?: string; // Extracted text from OCR
  thumbnailPath?: string;
  tags: string[];
  aiAnalysis?: AIAnalysis;
}

interface EncryptionInfo {
  algorithm: 'aes-256-gcm';
  keyId: string;
  iv: string;
  encrypted: boolean;
}

interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  suggestedActions: string[];
  confidence: number;
}
```

### Offline Sync Management

```typescript
interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  conflicts: SyncConflict[];
  syncInProgress: boolean;
}

interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  serverVersion: any;
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge';
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
```

### Emergency Access

```typescript
interface EmergencyAccess {
  id: string;
  userId: string;
  isActive: boolean;
  activatedAt?: Date;
  activatedBy: string; // Guardian ID
  accessLevel: AccessLevel;
  expiresAt?: Date;
  documents: EmergencyDocument[];
  auditLog: EmergencyAuditEntry[];
}

type AccessLevel =
  | 'read_only'
  | 'limited'
  | 'full';

interface EmergencyDocument {
  documentId: string;
  decryptedContent?: string; // Only available during active emergency
  accessGrantedAt: Date;
  accessedAt?: Date;
}

interface EmergencyAuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details: any;
}
```

## Local Storage Schema

### AsyncStorage Keys

```typescript
// User session and preferences
'user_profile' -> MobileUser
'user_preferences' -> UserPreferences
'auth_tokens' -> { accessToken: string; refreshToken: string }

// Document cache
'document_list' -> MobileDocument[]
'document_metadata_${id}' -> DocumentMetadata
'document_content_${id}' -> string (encrypted)

// Sync management
'sync_status' -> SyncStatus
'sync_queue' -> SyncOperation[]
'sync_conflicts' -> SyncConflict[]

// Offline data
'offline_documents' -> MobileDocument[]
'offline_changes' -> any[]

// Emergency access
'emergency_access' -> EmergencyAccess
'emergency_documents' -> EmergencyDocument[]

// Cache management
'cache_timestamps' -> { [key: string]: Date }
'cache_versions' -> { [key: string]: string }
```

### SQLite Schema (for complex queries)

```sql
-- Documents table for offline querying
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  file_path TEXT,
  supabase_path TEXT,
  metadata TEXT, -- JSON string
  encryption TEXT, -- JSON string
  sync_status TEXT, -- JSON string
  created_at INTEGER,
  updated_at INTEGER,
  last_accessed_at INTEGER
);

-- Full-text search index
CREATE VIRTUAL TABLE documents_fts USING fts5(
  id, title, ocr_text, tags,
  content=documents,
  content_rowid=rowid
);

-- Sync operations queue
CREATE TABLE sync_operations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON string
  timestamp INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  status TEXT NOT NULL
);

-- Emergency access log
CREATE TABLE emergency_log (
  id TEXT PRIMARY KEY,
  emergency_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT, -- JSON string
  FOREIGN KEY (emergency_id) REFERENCES emergency_access(id)
);
```

## API Contracts

### Authentication APIs

```typescript
// Clerk integration endpoints
interface AuthAPI {
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshToken(): Promise<TokenResult>;
  getCurrentUser(): Promise<MobileUser>;
}

// Biometric authentication
interface BiometricAPI {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<BiometricResult>;
  storeCredentials(credentials: Credentials): Promise<void>;
  retrieveCredentials(): Promise<Credentials>;
}

interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: 'face' | 'fingerprint' | 'iris';
}
```

### Document Management APIs

```typescript
interface DocumentAPI {
  // Core CRUD operations
  listDocuments(filter?: DocumentFilter): Promise<MobileDocument[]>;
  getDocument(id: string): Promise<MobileDocument>;
  createDocument(document: CreateDocumentRequest): Promise<MobileDocument>;
  updateDocument(id: string, updates: UpdateDocumentRequest): Promise<MobileDocument>;
  deleteDocument(id: string): Promise<void>;

  // File operations
  uploadDocument(file: File, metadata: UploadMetadata): Promise<UploadResult>;
  downloadDocument(id: string): Promise<Blob>;
  generateThumbnail(document: MobileDocument): Promise<string>;

  // OCR and AI processing
  processOCR(image: ImageData): Promise<OCRResult>;
  analyzeDocument(content: string): Promise<AIAnalysis>;
}

interface DocumentFilter {
  type?: DocumentType;
  category?: DocumentCategory;
  status?: DocumentStatus;
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

interface UploadResult {
  documentId: string;
  uploadUrl: string;
  checksum: string;
}
```

### Sync APIs

```typescript
interface SyncAPI {
  // Synchronization management
  getSyncStatus(): Promise<SyncStatus>;
  startSync(): Promise<SyncResult>;
  stopSync(): Promise<void>;

  // Conflict resolution
  getConflicts(): Promise<SyncConflict[]>;
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;

  // Background sync
  enableBackgroundSync(): Promise<void>;
  disableBackgroundSync(): Promise<void>;
  getBackgroundSyncStatus(): Promise<boolean>;
}

interface SyncResult {
  success: boolean;
  syncedEntities: number;
  conflicts: number;
  errors: string[];
  duration: number;
}

interface ConflictResolution {
  strategy: 'local' | 'server' | 'merge';
  mergedData?: any;
}
```

### Emergency Access APIs

```typescript
interface EmergencyAPI {
  // Emergency activation
  checkEmergencyStatus(): Promise<EmergencyStatus>;
  activateEmergency(reason: string): Promise<EmergencyResult>;
  deactivateEmergency(): Promise<void>;

  // Document access during emergency
  getEmergencyDocuments(): Promise<EmergencyDocument[]>;
  accessEmergencyDocument(documentId: string): Promise<string>;

  // Guardian verification
  verifyGuardian(guardianId: string, code: string): Promise<boolean>;
  requestGuardianVerification(guardianId: string): Promise<void>;
}

interface EmergencyStatus {
  isActive: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  accessLevel: AccessLevel;
  guardianName?: string;
}

interface EmergencyResult {
  success: boolean;
  accessToken: string;
  expiresAt: Date;
  documents: string[]; // Document IDs accessible
}
```

## Push Notification Schema

```typescript
interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority: 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
  badge?: number;
  sound?: string;
  category?: string;
}

type NotificationType =
  | 'emergency_alert'
  | 'document_ready'
  | 'family_activity'
  | 'reminder'
  | 'system_update'
  | 'marketing';

interface NotificationAction {
  id: string;
  title: string;
  type: 'foreground' | 'background' | 'destructive';
  authenticationRequired?: boolean;
}
```

## Error Handling & Validation

```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  statusCode?: number;
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
}

interface NetworkError extends APIError {
  isNetworkError: true;
  isOffline: boolean;
  retryAfter?: number;
}
```

## State Management Stores

```typescript
// Main app store
interface AppStore {
  user: MobileUser | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  emergencyStatus: EmergencyStatus | null;

  // Actions
  setUser: (user: MobileUser) => void;
  setOnlineStatus: (online: boolean) => void;
  updateSyncStatus: (status: SyncStatus) => void;
  setEmergencyStatus: (status: EmergencyStatus | null) => void;
}

// Document store
interface DocumentStore {
  documents: MobileDocument[];
  selectedDocument: MobileDocument | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDocuments: (documents: MobileDocument[]) => void;
  addDocument: (document: MobileDocument) => void;
  updateDocument: (id: string, updates: Partial<MobileDocument>) => void;
  removeDocument: (id: string) => void;
  setSelectedDocument: (document: MobileDocument | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Emergency store
interface EmergencyStore {
  isEmergencyActive: boolean;
  emergencyDocuments: EmergencyDocument[];
  verificationCode: string | null;

  // Actions
  activateEmergency: (documents: EmergencyDocument[]) => void;
  deactivateEmergency: () => void;
  setVerificationCode: (code: string) => void;
  verifyGuardian: (guardianId: string) => Promise<boolean>;
}
```

## Migration & Versioning

```typescript
interface DataMigration {
  version: string;
  description: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  down: (db: SQLiteDatabase) => Promise<void>;
}

interface SchemaVersion {
  current: string;
  migrations: DataMigration[];
}

// Migration registry
const MIGRATIONS: DataMigration[] = [
  {
    version: '1.0.0',
    description: 'Initial schema',
    up: async (db) => {
      // Create initial tables
    },
    down: async (db) => {
      // Drop tables
    }
  }
];
```

This data model provides a comprehensive foundation for the mobile application's offline-first architecture, ensuring data consistency, security, and synchronization capabilities across all platform features.
