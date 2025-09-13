# 026 — Vault Encrypted Storage Data Model

## Overview

This document defines the data model for the encrypted vault system, including database schema, entity relationships, and data structures for secure document storage and key management.

## Core Entities

### VaultConfig Entity

**Purpose**: Stores vault configuration and settings

**Fields**:

- `id` (UUID, Primary Key) - Unique vault configuration identifier
- `user_id` (TEXT) - Owner of the vault configuration
- `vault_name` (TEXT) - Human-readable vault name
- `encryption_algorithm` (TEXT) - Encryption algorithm used (e.g., "XSalsa20-Poly1305")
- `key_derivation_method` (TEXT) - Key derivation method (e.g., "PBKDF2")
- `key_iterations` (INTEGER) - Number of iterations for key derivation
- `max_file_size` (BIGINT) - Maximum allowed file size in bytes
- `storage_quota` (BIGINT) - Storage quota in bytes
- `created_at` (TIMESTAMP) - Configuration creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `is_active` (BOOLEAN) - Whether configuration is active

**Indexes**:

- `idx_vault_config_user_id` on `user_id`
- `idx_vault_config_active` on `is_active`

### EncryptionKey Entity

**Purpose**: Manages encryption keys for vault operations

**Fields**:

- `id` (UUID, Primary Key) - Unique key identifier
- `user_id` (TEXT) - Owner of the encryption key
- `key_version` (INTEGER) - Version number of the key
- `encrypted_private_key` (TEXT) - Encrypted private key data
- `public_key` (TEXT) - Public key for encryption
- `salt` (TEXT) - Salt used for key derivation
- `nonce` (TEXT) - Nonce for encryption operations
- `key_fingerprint` (TEXT) - Hash fingerprint of the key
- `is_active` (BOOLEAN) - Whether key is currently active
- `expires_at` (TIMESTAMP) - Key expiration date
- `created_at` (TIMESTAMP) - Key creation timestamp
- `last_used_at` (TIMESTAMP) - Last usage timestamp

**Indexes**:

- `idx_encryption_key_user_id` on `user_id`
- `idx_encryption_key_active` on `is_active`
- `idx_encryption_key_version` on `user_id, key_version`

### EncryptedData Entity

**Purpose**: Stores encrypted document data and metadata

**Fields**:

- `id` (UUID, Primary Key) - Unique document identifier
- `user_id` (TEXT) - Owner of the document
- `vault_config_id` (UUID) - Reference to vault configuration
- `file_name` (TEXT) - Original file name
- `encrypted_file_name` (TEXT) - Encrypted file identifier
- `file_size` (BIGINT) - Original file size in bytes
- `mime_type` (TEXT) - MIME type of the original file
- `storage_path` (TEXT) - Path to encrypted file in storage
- `encryption_nonce` (TEXT) - Nonce used for file encryption
- `encrypted_metadata` (JSONB) - Encrypted metadata about the file
- `checksum` (TEXT) - Integrity checksum of original file
- `tags` (TEXT[]) - User-defined tags for organization
- `is_deleted` (BOOLEAN) - Soft delete flag
- `created_at` (TIMESTAMP) - Document upload timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

**Indexes**:

- `idx_encrypted_data_user_id` on `user_id`
- `idx_encrypted_data_vault_config` on `vault_config_id`
- `idx_encrypted_data_deleted` on `is_deleted`
- `idx_encrypted_data_created` on `created_at`
- Full-text search index on `file_name, tags`

### ZeroKnowledgeProof Entity

**Purpose**: Stores zero-knowledge proofs for privacy validation

**Fields**:

- `id` (UUID, Primary Key) - Unique proof identifier
- `user_id` (TEXT) - Owner of the proof
- `proof_type` (TEXT) - Type of zero-knowledge proof
- `proof_data` (JSONB) - Proof data and parameters
- `public_inputs` (JSONB) - Public inputs to the proof
- `proof_hash` (TEXT) - Hash of the proof for verification
- `is_valid` (BOOLEAN) - Whether proof has been validated
- `validated_at` (TIMESTAMP) - Proof validation timestamp
- `expires_at` (TIMESTAMP) - Proof expiration date
- `created_at` (TIMESTAMP) - Proof creation timestamp

**Indexes**:

- `idx_zero_knowledge_proof_user_id` on `user_id`
- `idx_zero_knowledge_proof_valid` on `is_valid`
- `idx_zero_knowledge_proof_type` on `proof_type`

### SecurityScan Entity

**Purpose**: Tracks security scans and vulnerability assessments

**Fields**:

- `id` (UUID, Primary Key) - Unique scan identifier
- `scan_type` (TEXT) - Type of security scan performed
- `target_type` (TEXT) - What was scanned (vault, key, data)
- `target_id` (UUID) - ID of the scanned target
- `scan_results` (JSONB) - Detailed scan results
- `vulnerability_count` (INTEGER) - Number of vulnerabilities found
- `severity_level` (TEXT) - Highest severity found
- `scan_status` (TEXT) - Status of the scan (pending, running, completed, failed)
- `scan_duration` (INTEGER) - Scan duration in milliseconds
- `initiated_by` (TEXT) - User or system that initiated scan
- `created_at` (TIMESTAMP) - Scan initiation timestamp
- `completed_at` (TIMESTAMP) - Scan completion timestamp

**Indexes**:

- `idx_security_scan_target` on `target_type, target_id`
- `idx_security_scan_status` on `scan_status`
- `idx_security_scan_created` on `created_at`

### VaultLog Entity

**Purpose**: Audit trail for all vault operations

**Fields**:

- `id` (UUID, Primary Key) - Unique log entry identifier
- `user_id` (TEXT) - User performing the operation
- `operation_type` (TEXT) - Type of operation performed
- `resource_type` (TEXT) - Type of resource affected
- `resource_id` (UUID) - ID of affected resource
- `operation_details` (JSONB) - Detailed operation information
- `ip_address` (TEXT) - IP address of the operation
- `user_agent` (TEXT) - User agent string
- `success` (BOOLEAN) - Whether operation was successful
- `error_message` (TEXT) - Error message if operation failed
- `performance_metrics` (JSONB) - Performance data for the operation
- `created_at` (TIMESTAMP) - Operation timestamp

**Indexes**:

- `idx_vault_log_user_id` on `user_id`
- `idx_vault_log_operation` on `operation_type`
- `idx_vault_log_resource` on `resource_type, resource_id`
- `idx_vault_log_created` on `created_at`
- `idx_vault_log_success` on `success`

## Entity Relationships

```text
VaultConfig (1) ──── (N) EncryptedData
    │
    └── (1) ──── (N) EncryptionKey
                      │
                      └── (1) ──── (N) ZeroKnowledgeProof

VaultConfig (1) ──── (N) SecurityScan
VaultConfig (1) ──── (N) VaultLog

EncryptedData (1) ──── (N) VaultLog
EncryptionKey (1) ──── (N) VaultLog
```

## Data Flow Architecture

### Document Upload Flow

1. **Client Preparation**
   - Generate file-specific encryption key
   - Create encryption nonce
   - Encrypt file data client-side
   - Calculate file checksum

2. **Metadata Creation**
   - Create EncryptedData record
   - Store encryption parameters
   - Link to active EncryptionKey
   - Generate audit log entry

3. **Storage Operations**
   - Upload encrypted file to Supabase Storage
   - Update storage path in database
   - Validate file integrity
   - Create SecurityScan record

### Document Download Flow

1. **Access Validation**
   - Verify user permissions
   - Check EncryptionKey validity
   - Validate ZeroKnowledgeProof if required

2. **Data Retrieval**
   - Fetch EncryptedData metadata
   - Retrieve encrypted file from storage
   - Get decryption parameters
   - Create audit log entry

3. **Client Decryption**
   - Decrypt file using client-side keys
   - Verify file integrity with checksum
   - Return decrypted file to user

## Security Policies

### Row Level Security (RLS)

Note: RLS policies use `app.current_external_id()` (Clerk external ID). Reference users via `public.user_auth(clerk_id)`. Avoid `auth.uid()` in RLS when using Clerk.

```sql
-- VaultConfig RLS
CREATE POLICY "Users can manage own vault config"
ON vault_config FOR ALL
USING (app.current_external_id() = user_id);

-- EncryptionKey RLS
CREATE POLICY "Users can access own encryption keys"
ON encryption_key FOR SELECT
USING (app.current_external_id() = user_id);

-- EncryptedData RLS
CREATE POLICY "Users can access own encrypted data"
ON encrypted_data FOR ALL
USING (app.current_external_id() = user_id);

-- ZeroKnowledgeProof RLS
CREATE POLICY "Users can access own zero knowledge proofs"
ON zero_knowledge_proof FOR ALL
USING (app.current_external_id() = user_id);

-- SecurityScan RLS
CREATE POLICY "Users can view own security scans"
ON security_scan FOR SELECT
USING (app.current_external_id() = user_id);

-- VaultLog RLS
CREATE POLICY "Users can view own vault logs"
ON vault_log FOR SELECT
USING (app.current_external_id() = user_id);
```

### Data Encryption Policies

- **At Rest**: All sensitive data encrypted using AES-256-GCM
- **In Transit**: TLS 1.3 encryption for all network communications
- **Key Storage**: Encryption keys encrypted with user-derived keys
- **Metadata**: File metadata encrypted before database storage

## Performance Optimizations

### Database Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_encrypted_data_user_created
ON encrypted_data(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_encrypted_data_user_tags
ON encrypted_data USING GIN(user_id, tags);

CREATE INDEX CONCURRENTLY idx_vault_log_user_operation_created
ON vault_log(user_id, operation_type, created_at DESC);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_encryption_key_active_user
ON encryption_key(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_encrypted_data_active_user
ON encrypted_data(user_id) WHERE is_deleted = false;
```

### Query Optimization

- **Pagination**: Use cursor-based pagination for large result sets
- **Caching**: Implement Redis caching for frequently accessed metadata
- **Archiving**: Move old log entries to archive tables
- **Partitioning**: Partition large tables by date ranges

## Data Integrity Constraints

### Check Constraints

```sql
-- File size validation
ALTER TABLE encrypted_data
ADD CONSTRAINT chk_file_size_positive
CHECK (file_size > 0);

-- Key version validation
ALTER TABLE encryption_key
ADD CONSTRAINT chk_key_version_positive
CHECK (key_version > 0);

-- MIME type validation
ALTER TABLE encrypted_data
ADD CONSTRAINT chk_mime_type_not_empty
CHECK (length(mime_type) > 0);
```

### Foreign Key Constraints

```sql
-- VaultConfig references
ALTER TABLE encrypted_data
ADD CONSTRAINT fk_encrypted_data_vault_config
FOREIGN KEY (vault_config_id) REFERENCES vault_config(id);

-- Ensure referential integrity
ALTER TABLE zero_knowledge_proof
ADD CONSTRAINT fk_zero_knowledge_proof_key
FOREIGN KEY (user_id) REFERENCES encryption_key(user_id);
```

## Migration Strategy

### Database Migrations

1. **Initial Schema Creation**

   ```sql
   -- Create all tables with proper constraints
   -- Add initial RLS policies
   -- Create performance indexes
   ```

2. **Data Migration**

   ```sql
   -- Migrate existing vault data if any
   -- Transform legacy encryption formats
   -- Update metadata structures
   ```

3. **Security Hardening**

   ```sql
   -- Add additional security constraints
   -- Implement advanced RLS policies
   -- Create audit triggers
   ```

### Data Validation

- **Checksum Verification**: Validate file integrity during migration
- **Key Validation**: Ensure all encryption keys are properly formatted
- **Metadata Validation**: Verify encrypted metadata can be decrypted
- **Permission Validation**: Confirm all access permissions are correct

## Monitoring and Alerting

### Key Metrics

- **Storage Usage**: Track vault storage consumption
- **Encryption Performance**: Monitor encryption/decryption times
- **Security Events**: Track security-related operations
- **Data Integrity**: Monitor checksum validation success rates

### Alert Conditions

- **Storage Quota Exceeded**: Alert when approaching storage limits
- **Encryption Failures**: Alert on encryption operation failures
- **Security Violations**: Alert on unauthorized access attempts
- **Data Corruption**: Alert on checksum validation failures

## Backup and Recovery

### Backup Strategy

- **Database Backups**: Daily full backups with transaction logs
- **File Backups**: Encrypted file storage with redundancy
- **Key Backups**: Secure key escrow with multi-party access
- **Metadata Backups**: Encrypted metadata with integrity verification

### Recovery Procedures

- **Data Recovery**: Restore from encrypted backups with key access
- **Key Recovery**: Multi-party key recovery with audit trails
- **Integrity Verification**: Validate all recovered data integrity
- **Access Restoration**: Restore user access with proper authorization

This data model provides a comprehensive foundation for the encrypted vault system with strong security, performance, and maintainability characteristics.
