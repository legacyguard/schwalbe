# Document Vault - Data Model

## Overview

This document defines the complete data model for the Document Vault system, including database schema, API contracts, and data structures.

## Database Schema

### Core Tables

#### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  encryption_nonce TEXT NOT NULL,
  bundle_id UUID REFERENCES document_bundles(id),
  category TEXT,
  title TEXT,
  description TEXT,
  tags TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  ocr_text TEXT,
  ocr_confidence DECIMAL(3,2),
  extracted_entities JSONB,
  classification_confidence DECIMAL(3,2),
  extracted_metadata JSONB,
  processing_status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Versioning fields
  is_archived BOOLEAN DEFAULT FALSE,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES documents(id),
  is_latest_version BOOLEAN DEFAULT TRUE,
  version_date TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  archived_reason TEXT,
  
  -- Indexes
CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_bundle_id ON documents(bundle_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_expires_at ON documents(expires_at);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
CREATE INDEX idx_documents_version_number ON documents(version_number);
CREATE INDEX idx_documents_is_archived ON documents(is_archived);
CREATE INDEX idx_documents_is_latest_version ON documents(is_latest_version);
CREATE INDEX idx_documents_encryption_nonce ON documents(encryption_nonce);

-- Privacy-preserving search: no plaintext server-side index. See document_search_tokens below.
```

#### document_bundles

```sql
CREATE TYPE bundle_category AS ENUM (
  'legal', 'financial', 'medical', 'personal', 'business', 'educational', 'other'
);

CREATE TABLE document_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bundle_name TEXT NOT NULL,
  bundle_category bundle_category NOT NULL,
  description TEXT,
  primary_entity TEXT,
  entity_type TEXT,
  keywords TEXT[],
  document_count INTEGER DEFAULT 0,
  total_file_size BIGINT DEFAULT 0,
  last_document_added TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  
CONSTRAINT document_bundles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_document_bundles_user_id ON document_bundles(user_id);
CREATE INDEX idx_document_bundles_category ON document_bundles(bundle_category);
CREATE INDEX idx_document_bundles_keywords ON document_bundles USING GIN(keywords);
```

#### user_encryption_keys

```sql
CREATE TABLE user_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  encrypted_private_key TEXT NOT NULL,
  public_key TEXT NOT NULL,
  salt TEXT NOT NULL,
  nonce TEXT NOT NULL,
  iterations INTEGER NOT NULL DEFAULT 100000,
  key_version INTEGER DEFAULT 1,
  rotation_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_compromised BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMPTZ,
  failed_access_attempts INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  recovery_enabled BOOLEAN DEFAULT TRUE,
  recovery_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  
CONSTRAINT user_encryption_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);
CREATE INDEX idx_user_encryption_keys_is_active ON user_encryption_keys(is_active);
CREATE INDEX idx_user_encryption_keys_key_version ON user_encryption_keys(key_version);
```

#### key_rotation_history

```sql
CREATE TABLE key_rotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_key_version INTEGER NOT NULL,
  new_key_version INTEGER NOT NULL,
  rotation_reason TEXT NOT NULL,
  rotated_at TIMESTAMPTZ DEFAULT NOW(),
  
CONSTRAINT key_rotation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_key_rotation_history_user_id ON key_rotation_history(user_id);
CREATE INDEX idx_key_rotation_history_rotated_at ON key_rotation_history(rotated_at);
```

#### user_key_recovery

```sql
CREATE TABLE user_key_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  backup_phrase_hash TEXT,
  security_questions JSONB,
  guardian_shares JSONB,
  recovery_codes TEXT[],
  recovery_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  
CONSTRAINT user_key_recovery_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_key_recovery_user_id ON user_key_recovery(user_id);
```

#### key_access_logs

```sql
CREATE TYPE access_action AS ENUM (
  'key_retrieval', 'key_rotation', 'recovery_attempt', 'failed_access', 'backup_created'
);

CREATE TABLE key_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action access_action NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
CONSTRAINT key_access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_key_access_logs_user_id ON key_access_logs(user_id);
CREATE INDEX idx_key_access_logs_action ON key_access_logs(action);
CREATE INDEX idx_key_access_logs_created_at ON key_access_logs(created_at);
CREATE INDEX idx_key_access_logs_success ON key_access_logs(success);
```

### Views and Functions

Additional docs:
- See ../../docs/features/documents-ocr-data-model.md (Identity and RLS note & columns touched)

#### Privacy-Preserving Search Index (Hashed Tokens)

```sql
-- Tokens generated client-side by tokenizing plaintext and hashing with a per-user or per-session salt.
-- Server stores only hashed tokens; no plaintext content or tokens are stored.
CREATE TABLE document_search_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  positions INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (document_id, token_hash)
);

CREATE INDEX idx_search_tokens_owner_token ON document_search_tokens(owner_id, token_hash);

-- RLS: owner-scoped visibility
ALTER TABLE document_search_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_can_manage_token_rows" ON document_search_tokens
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

#### documents_enhanced view

```sql
CREATE VIEW documents_enhanced AS
SELECT 
  d.*,
  CASE 
    WHEN d.expires_at IS NOT NULL AND d.expires_at < NOW() THEN 'expired'
    WHEN d.expires_at IS NOT NULL AND d.expires_at < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'active'
  END as expiry_status,
  CASE 
    WHEN d.is_important THEN 10
    WHEN d.expires_at IS NOT NULL AND d.expires_at < NOW() + INTERVAL '30 days' THEN 8
    WHEN d.classification_confidence > 0.8 THEN 6
    WHEN array_length(d.tags, 1) > 3 THEN 4
    ELSE 2
  END as importance_score,
  to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.ocr_text, '')) as search_vector
FROM documents d
WHERE d.is_archived = FALSE;
```

#### bundles_with_active_documents view

```sql
CREATE VIEW bundles_with_active_documents AS
SELECT 
  b.*,
  COUNT(d.id) as active_document_count,
  SUM(d.file_size) as active_total_size
FROM document_bundles b
LEFT JOIN documents d ON b.id = d.bundle_id AND d.is_archived = FALSE
GROUP BY b.id;
```

### Utility Functions

#### calculate_document_importance_score

```sql
CREATE OR REPLACE FUNCTION calculate_document_importance_score(
  p_is_important BOOLEAN,
  p_expires_at TIMESTAMPTZ,
  p_classification_confidence DECIMAL,
  p_tags TEXT[]
) RETURNS INTEGER AS $$
BEGIN
  RETURN CASE 
    WHEN p_is_important THEN 10
    WHEN p_expires_at IS NOT NULL AND p_expires_at < NOW() + INTERVAL '30 days' THEN 8
    WHEN p_classification_confidence > 0.8 THEN 6
    WHEN array_length(p_tags, 1) > 3 THEN 4
    ELSE 2
  END;
END;
$$ LANGUAGE plpgsql;
```

#### find_potential_document_versions

```sql
CREATE OR REPLACE FUNCTION find_potential_document_versions(
  p_user_id TEXT,
  p_bundle_id UUID,
  p_file_name TEXT,
  p_ai_extracted_text TEXT
) RETURNS TABLE(
  document_id UUID,
  similarity_score DECIMAL,
  match_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    CASE 
      WHEN d.file_name = p_file_name THEN 1.0
      WHEN similarity(d.file_name, p_file_name) > 0.8 THEN similarity(d.file_name, p_file_name)
      WHEN similarity(d.ocr_text, p_ai_extracted_text) > 0.7 THEN similarity(d.ocr_text, p_ai_extracted_text)
      ELSE 0.0
    END as similarity_score,
    CASE 
      WHEN d.file_name = p_file_name THEN 'exact_filename_match'
      WHEN similarity(d.file_name, p_file_name) > 0.8 THEN 'similar_filename'
      WHEN similarity(d.ocr_text, p_ai_extracted_text) > 0.7 THEN 'similar_content'
      ELSE 'no_match'
    END as match_reason
  FROM documents d
  WHERE d.user_id = p_user_id 
    AND d.bundle_id = p_bundle_id
    AND d.is_archived = FALSE
    AND (
      d.file_name = p_file_name OR
      similarity(d.file_name, p_file_name) > 0.8 OR
      similarity(d.ocr_text, p_ai_extracted_text) > 0.7
    )
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;
```

#### archive_document_and_create_version

```sql
CREATE OR REPLACE FUNCTION archive_document_and_create_version(
  p_old_document_id UUID,
  p_new_document_id UUID,
  p_archive_reason TEXT DEFAULT 'version_update'
) RETURNS BOOLEAN AS $$
DECLARE
  v_old_version_number INTEGER;
  v_old_user_id TEXT;
BEGIN
  -- Get old document info
  SELECT version_number, user_id INTO v_old_version_number, v_old_user_id
  FROM documents WHERE id = p_old_document_id;
  
  -- Archive old document
  UPDATE documents 
  SET 
    is_archived = TRUE,
    is_latest_version = FALSE,
    archived_at = NOW(),
    archived_reason = p_archive_reason
  WHERE id = p_old_document_id;
  
  -- Update new document with version info
  UPDATE documents 
  SET 
    version_number = v_old_version_number + 1,
    previous_version_id = p_old_document_id,
    is_latest_version = TRUE,
    version_date = NOW()
  WHERE id = p_new_document_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### update_bundle_stats

```sql
CREATE OR REPLACE FUNCTION update_bundle_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE document_bundles 
    SET 
      document_count = document_count + 1,
      total_file_size = total_file_size + NEW.file_size,
      last_document_added = NOW()
    WHERE id = NEW.bundle_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.bundle_id != NEW.bundle_id THEN
      -- Document moved to different bundle
      UPDATE document_bundles 
      SET 
        document_count = document_count - 1,
        total_file_size = total_file_size - OLD.file_size
      WHERE id = OLD.bundle_id;
      
      UPDATE document_bundles 
      SET 
        document_count = document_count + 1,
        total_file_size = total_file_size + NEW.file_size,
        last_document_added = NOW()
      WHERE id = NEW.bundle_id;
    ELSIF OLD.file_size != NEW.file_size THEN
      -- File size changed
      UPDATE document_bundles 
      SET total_file_size = total_file_size - OLD.file_size + NEW.file_size
      WHERE id = NEW.bundle_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE document_bundles 
    SET 
      document_count = document_count - 1,
      total_file_size = total_file_size - OLD.file_size
    WHERE id = OLD.bundle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_bundle_stats
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_bundle_stats();
```

## API Service Interfaces

### DocumentService Interface

```typescript
interface DocumentService {
  // Core CRUD operations
  uploadDocument(file: File, metadata: DocumentUploadMetadata): Promise<Document>;
  getDocument(id: string): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Document listing and search
  listDocuments(filters?: DocumentFilters): Promise<DocumentListResult>;
  searchDocuments(query: SearchQuery): Promise<DocumentSearchResult>;
  
  // Document operations
  downloadDocument(id: string): Promise<Blob>;
  shareDocument(id: string, permissions: SharePermissions): Promise<ShareLink>;
  archiveDocument(id: string, reason?: string): Promise<void>;
  
  // Versioning
  getDocumentVersions(id: string): Promise<DocumentVersion[]>;
  restoreDocumentVersion(id: string, versionId: string): Promise<Document>;
  compareDocumentVersions(id: string, version1: string, version2: string): Promise<DocumentDiff>;
  
  // Bundles
  createBundle(bundle: BundleCreateRequest): Promise<DocumentBundle>;
  addDocumentToBundle(documentId: string, bundleId: string): Promise<void>;
  removeDocumentFromBundle(documentId: string, bundleId: string): Promise<void>;
  
  // Metadata and processing
  extractMetadata(id: string): Promise<DocumentMetadata>;
  processDocument(id: string): Promise<ProcessingResult>;
  updateDocumentTags(id: string, tags: string[]): Promise<Document>;
}
```

### EncryptionService Interface

```typescript
interface EncryptionService {
  // Key management
  generateKeyPair(): Promise<CryptoKeyPair>;
  deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  encryptPrivateKey(privateKey: CryptoKey, masterKey: CryptoKey): Promise<EncryptedData>;
  decryptPrivateKey(encryptedPrivateKey: EncryptedData, masterKey: CryptoKey): Promise<CryptoKey>;
  
  // Document encryption/decryption
  encryptDocument(document: File, key: CryptoKey): Promise<EncryptedDocument>;
  decryptDocument(encryptedDocument: EncryptedDocument, key: CryptoKey): Promise<Blob>;
  
  // Data encryption/decryption
  encryptData(data: string, key: CryptoKey): Promise<EncryptedData>;
  decryptData(encryptedData: EncryptedData, key: CryptoKey): Promise<string>;
  
  // Session management
  unlockSession(masterPassword: string): Promise<EncryptionSession>;
  lockSession(): Promise<void>;
  isSessionUnlocked(): boolean;
  
  // Recovery
  generateBackupPhrase(): Promise<string>;
  recoverFromBackupPhrase(backupPhrase: string): Promise<CryptoKeyPair>;
  createGuardianShares(key: CryptoKey, guardians: string[]): Promise<GuardianShare[]>;
  recoverFromGuardians(guardianShares: GuardianShare[]): Promise<CryptoKey>;
}
```

### MetadataExtractionService Interface

```typescript
interface MetadataExtractionService {
  // OCR processing
  extractTextFromImage(image: File): Promise<OCRResult>;
  extractTextFromPDF(pdf: File): Promise<OCRResult>;
  
  // Document analysis
  analyzeDocument(document: Document): Promise<DocumentAnalysis>;
  categorizeDocument(document: Document): Promise<DocumentCategory>;
  extractEntities(text: string): Promise<Entity[]>;
  
  // AI processing
  generateSummary(text: string): Promise<string>;
  extractKeywords(text: string): Promise<string[]>;
  detectLanguage(text: string): Promise<string>;
  
  // Quality assessment
  assessOCRQuality(ocrResult: OCRResult): Promise<QualityScore>;
  validateExtractedData(data: ExtractedData): Promise<ValidationResult>;
}
```

## Data Transfer Objects (DTOs)

### Document DTOs

```typescript
interface Document {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  encryptionNonce: string;
  bundleId?: string;
  category?: string;
  title?: string;
  description?: string;
  tags: string[];
  isImportant: boolean;
  ocrText?: string;
  ocrConfidence?: number;
  extractedEntities?: Record<string, any>;
  classificationConfidence?: number;
  extractedMetadata?: Record<string, any>;
  processingStatus: ProcessingStatus;
  uploadedAt: Date;
  modifiedAt: Date;
  expiresAt?: Date;
  
  // Versioning
  isArchived: boolean;
  versionNumber: number;
  previousVersionId?: string;
  isLatestVersion: boolean;
  versionDate: Date;
  archivedAt?: Date;
  archivedReason?: string;
}

interface DocumentUploadMetadata {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isImportant?: boolean;
  expiresAt?: Date;
  bundleId?: string;
}

interface DocumentFilters {
  category?: string;
  tags?: string[];
  isImportant?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  bundleId?: string;
  processingStatus?: ProcessingStatus;
  limit?: number;
  offset?: number;
}

interface DocumentListResult {
  documents: Document[];
  totalCount: number;
  hasMore: boolean;
}

interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  suggestions?: string[];
}

interface DocumentVersion {
  id: string;
  versionNumber: number;
  versionDate: Date;
  fileSize: number;
  changeDescription?: string;
  isLatest: boolean;
}

interface DocumentDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}
```

### Encryption DTOs

```typescript
interface EncryptedData {
  algorithm: string;
  data: string; // base64 encoded
  iv: string; // base64 encoded nonce
  salt?: string; // base64 encoded salt
}

interface EncryptedDocument {
  id: string;
  encryptedData: EncryptedData;
  encryptedMetadata: EncryptedData;
  documentSalt: string;
  nonce: string;
  version: number;
  createdAt: Date;
  modifiedAt: Date;
}

interface EncryptionSession {
  sessionId: string;
  publicKey: string;
  ephemeralKeyPair: CryptoKeyPair;
  keyDerivationSalt: string;
  isUnlocked: boolean;
  unlockTimestamp: Date;
  autoLockTimeout: number;
}

interface GuardianShare {
  guardianId: string;
  share: string;
  threshold: number;
  createdAt: Date;
}

interface DocumentAccess {
  documentId: string;
  recipientPublicKey: string;
  encryptedDocumentKey: string;
  permissions: AccessPermissions;
  expiresAt?: Date;
  createdAt: Date;
}

interface AccessPermissions {
  canRead: boolean;
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
}
```

### Bundle DTOs

```typescript
interface DocumentBundle {
  id: string;
  userId: string;
  bundleName: string;
  bundleCategory: BundleCategory;
  description?: string;
  primaryEntity?: string;
  entityType?: string;
  keywords: string[];
  documentCount: number;
  totalFileSize: number;
  lastDocumentAdded?: Date;
  createdAt: Date;
  modifiedAt: Date;
}

interface BundleCreateRequest {
  bundleName: string;
  bundleCategory: BundleCategory;
  description?: string;
  primaryEntity?: string;
  entityType?: string;
  keywords?: string[];
}

type BundleCategory = 'legal' | 'financial' | 'medical' | 'personal' | 'business' | 'educational' | 'other';
```

### Metadata DTOs

```typescript
interface DocumentMetadata {
  title?: string;
  description?: string;
  category?: string;
  tags: string[];
  entities: Entity[];
  keywords: string[];
  language: string;
  confidence: number;
  extractedAt: Date;
}

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  boundingBoxes?: BoundingBox[];
  extractedAt: Date;
}

interface DocumentAnalysis {
  category: string;
  importance: number;
  summary: string;
  entities: Entity[];
  keywords: string[];
  language: string;
  confidence: number;
  analyzedAt: Date;
}

interface Entity {
  text: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
```

### Search DTOs

```typescript
interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
  limit?: number;
  offset?: number;
}

interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileTypes?: string[];
  bundleId?: string;
  isImportant?: boolean;
  hasOCR?: boolean;
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

interface SearchSuggestion {
  text: string;
  type: 'category' | 'tag' | 'title' | 'entity';
  count: number;
}
```

### Error DTOs

```typescript
interface DocumentVaultError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  documentId?: string;
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface ProcessingError {
  documentId: string;
  error: DocumentVaultError;
  retryable: boolean;
  retryAfter?: number;
}
```

## Row Level Security (RLS) Policies

### Storage Bucket Policies (user_documents)

```sql
-- Users may upload into their own folder prefix only
CREATE POLICY "users_can_upload_own_storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users may read their own objects only
CREATE POLICY "users_can_read_own_storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users may update their own objects only
CREATE POLICY "users_can_update_own_storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users may delete their own objects only
CREATE POLICY "users_can_delete_own_storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Documents Table Policies

```sql
-- Users can view their own documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);
```

### Document Bundles Table Policies

```sql
-- Users can view their own bundles
CREATE POLICY "Users can view their own bundles" ON document_bundles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bundles
CREATE POLICY "Users can insert their own bundles" ON document_bundles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bundles
CREATE POLICY "Users can update their own bundles" ON document_bundles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own bundles
CREATE POLICY "Users can delete their own bundles" ON document_bundles
  FOR DELETE USING (auth.uid() = user_id);
```

### User Encryption Keys Table Policies

```sql
-- Users can view their own encryption keys
CREATE POLICY "Users can view their own encryption keys" ON user_encryption_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own encryption keys
CREATE POLICY "Users can insert their own encryption keys" ON user_encryption_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own encryption keys
CREATE POLICY "Users can update their own encryption keys" ON user_encryption_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Users cannot delete their own encryption keys (prevent accidental deletion)
CREATE POLICY "Users cannot delete encryption keys" ON user_encryption_keys
  FOR DELETE USING (FALSE);
```

### Key Access Logs Table Policies

```sql
-- Users can view their own access logs
CREATE POLICY "Users can view their own access logs" ON key_access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert access logs
CREATE POLICY "System can insert access logs" ON key_access_logs
  FOR INSERT WITH CHECK (TRUE);

-- Users cannot modify access logs
CREATE POLICY "Users cannot modify access logs" ON key_access_logs
  FOR UPDATE USING (FALSE);

CREATE POLICY "Users cannot delete access logs" ON key_access_logs
  FOR DELETE USING (FALSE);
```

## Performance Optimizations

### Indexes

- **Primary indexes**: All foreign keys and frequently queried columns
- **Composite indexes**: Multi-column queries for filtering and sorting
- **GIN indexes**: Array columns (tags, keywords) and JSONB columns
- **Full-text search indexes**: Document content search
- **Partial indexes**: Archived documents, active documents

### Query Optimization

- **Materialized views**: For complex aggregations and reporting
- **Query hints**: For expensive operations
- **Connection pooling**: For high-concurrency scenarios
- **Read replicas**: For read-heavy workloads

### Caching Strategy

- **Application-level caching**: Frequently accessed documents and metadata
- **Redis caching**: Session data and temporary results
- **CDN caching**: Static assets and processed documents
- **Database query caching**: Expensive query results

## Data Migration Strategy

### Initial Migration

```sql
-- Create tables in dependency order
-- 1. Core tables (documents, document_bundles)
-- 2. Encryption tables (user_encryption_keys, key_rotation_history)
-- 3. Recovery tables (user_key_recovery, key_access_logs)
-- 4. Views and functions
-- 5. RLS policies
-- 6. Indexes and constraints
```

### Data Migration from Hollywood

```sql
-- Migrate existing documents with encryption metadata
INSERT INTO documents (user_id, file_name, file_path, file_size, mime_type, encryption_nonce, ...)
SELECT 
  user_id,
  file_name,
  file_path,
  file_size,
  mime_type,
  encryption_nonce,
  ...
FROM hollywood.documents
WHERE migration_status = 'pending';

-- Migrate document bundles
INSERT INTO document_bundles (user_id, bundle_name, bundle_category, ...)
SELECT 
  user_id,
  bundle_name,
  bundle_category,
  ...
FROM hollywood.document_bundles;
```

### Rollback Strategy

```sql
-- Backup current state before migration
CREATE TABLE documents_backup AS SELECT * FROM documents;
CREATE TABLE document_bundles_backup AS SELECT * FROM document_bundles;

-- Rollback procedure
BEGIN;
  TRUNCATE documents, document_bundles;
  INSERT INTO documents SELECT * FROM documents_backup;
  INSERT INTO document_bundles SELECT * FROM document_bundles_backup;
COMMIT;
```

## Monitoring and Analytics

### Key Metrics

- **Document operations**: Upload, download, delete rates
- **Encryption performance**: Encryption/decryption times
- **Storage usage**: Total storage, growth rate, quota utilization
- **Search performance**: Query response times, result relevance
- **Error rates**: Failed operations, retry attempts
- **User engagement**: Active users, document count per user

### Alerting Thresholds

- **Performance**: Encryption time > 5s, search time > 1s
- **Storage**: Quota utilization > 80%, growth rate > 20%/week
- **Errors**: Error rate > 1%, failed uploads > 5%
- **Security**: Failed key access > 3 attempts, suspicious activity

### Logging Strategy

- **Structured logging**: JSON format for all operations
- **Log levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Log retention**: 90 days for audit logs, 30 days for debug logs
- **Log aggregation**: Centralized logging with search and alerting
