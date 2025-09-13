# Time Capsule Legacy System - Data Model & API Contracts

## Overview

This document defines the complete data model, database schema, and API contracts for the Time Capsule Legacy System. It includes entity relationships, validation rules, and integration points with existing Schwalbe systems.

## Hollywood Migration Components

### Edge Functions (Migrated from Hollywood)

**time-capsule-delivery**: Automated delivery processing for scheduled capsules

- Location: `supabase/functions/time-capsule-delivery/index.ts`
- Triggers: Cron jobs or manual invocation
- Processes: Date-based and Family Shield activation deliveries
- Outputs: Email notifications with secure access links

**time-capsule-test-preview**: Test preview functionality for user confidence

- Location: `supabase/functions/time-capsule-test-preview/index.ts`
- Triggers: User action from frontend
- Processes: Preview email generation and delivery
- Outputs: Test preview emails with access links

**family-shield-time-capsule-trigger**: Emergency delivery activation

- Location: `supabase/functions/family-shield-time-capsule-trigger/index.ts`
- Triggers: Family Shield emergency activation
- Processes: Immediate delivery of death-triggered capsules
- Outputs: Emergency delivery notifications

### Database Schema (Migrated from Hollywood)

**time_capsules table**: Core capsule metadata and delivery configuration

- Location: `supabase/migrations/20250825170000_create_time_capsules.sql`
- Features: Delivery conditions, access tokens, status tracking
- Security: RLS policies for user-based access control

**time_capsule_storage bucket**: Encrypted media file storage

- Location: `supabase/migrations/20250825171000_create_time_capsule_storage.sql`
- Features: Private bucket with user-specific access policies
- Security: Client-side encryption before upload

### UI Components (Migrated from Hollywood)

**TimeCapsuleWizard**: 4-step creation workflow

- Location: `web/src/components/time-capsule/TimeCapsuleWizard.tsx`
- Features: Recipient selection, delivery configuration, recording, review
- Integration: Guardian system, MediaRecorder API, encryption

**TimeCapsuleList**: Management and status tracking interface

- Location: `web/src/components/time-capsule/TimeCapsuleList.tsx`
- Features: Visual "seal" design, status filtering, test preview
- Integration: Real-time status updates, deletion controls

**TimeCapsuleView**: Public viewing page for delivered capsules

- Location: `web/src/pages/TimeCapsuleView.tsx`
- Features: Secure token authentication, media player, responsive design
- Integration: Signed URL generation, access validation

## Data Model

### Core Entities

#### TimeCapsule

##### Primary entity for time capsule with delivery fields

```typescript
interface TimeCapsule {
  id: string;
  user_id: string;
  recipient_id?: string;
  recipient_name: string;
  recipient_email: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  delivery_date?: string;
  message_title: string;
  message_preview?: string;
  storage_path: string;
  file_type: 'audio' | 'video';
  file_size_bytes?: number;
  duration_seconds?: number;
  thumbnail_path?: string;
  access_token: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  is_delivered: boolean;
  created_at: string;
  updated_at: string;
}
```

#### VideoMessage

##### Entity for video content and metadata

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_condition delivery_condition NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE,
  message_title TEXT NOT NULL,
  message_preview TEXT,
  storage_path TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio')),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  thumbnail_path TEXT,
  access_token UUID DEFAULT gen_random_uuid(),
  status capsule_status DEFAULT 'PENDING',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field Descriptions**:

- `id`: Unique identifier for the time capsule
- `user_id`: Reference to the user who created the capsule
- `recipient_id`: Optional reference to a guardian recipient
- `recipient_name`: Full name of the message recipient
- `recipient_email`: Email address for delivery notifications
- `delivery_condition`: When to deliver ('ON_DATE' or 'ON_DEATH')
- `delivery_date`: Specific delivery date (for 'ON_DATE' condition)
- `message_title`: User-defined title for the capsule
- `message_preview`: Short preview text of the message
- `storage_path`: Path to the encrypted media file in Supabase Storage
- `file_type`: Media type ('video' or 'audio')
- `file_size_bytes`: Size of the media file in bytes
- `duration_seconds`: Length of the recording in seconds
- `thumbnail_path`: Path to video thumbnail (videos only)
- `access_token`: Secure token for recipient access
- `status`: Current delivery status
- `is_delivered`: Whether the capsule has been delivered
- `delivered_at`: Timestamp of successful delivery
- `delivery_attempts`: Number of delivery attempts made
- `last_delivery_attempt`: Timestamp of last delivery attempt
- `delivery_error`: Error message from failed delivery attempts

### Custom Types

#### delivery_condition

```sql
CREATE TYPE delivery_condition AS ENUM ('ON_DATE', 'ON_DEATH');
```

#### capsule_status

```sql
CREATE TYPE capsule_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'CANCELLED');
```

### Indexes

**Performance optimization indexes for common query patterns:**

```sql
-- User-based queries
CREATE INDEX idx_time_capsules_user_id ON time_capsules(user_id);
CREATE INDEX idx_time_capsules_recipient ON time_capsules(recipient_email, is_delivered);

-- Delivery scheduling
CREATE INDEX idx_time_capsules_delivery_date ON time_capsules(delivery_date)
  WHERE delivery_condition = 'ON_DATE' AND is_delivered = false;
CREATE INDEX idx_time_capsules_death_condition ON time_capsules(user_id, delivery_condition)
  WHERE delivery_condition = 'ON_DEATH' AND is_delivered = false;

-- Access control
CREATE INDEX idx_time_capsules_access_token ON time_capsules(access_token)
  WHERE is_delivered = true;

-- Status tracking
CREATE INDEX idx_time_capsules_status ON time_capsules(status, created_at);
```

### Row Level Security (RLS) Policies

**Security policies ensuring users can only access their own data:**

```sql
-- Enable RLS
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

-- Users can view their own capsules
CREATE POLICY "Users can view own time capsules" ON time_capsules
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own capsules
CREATE POLICY "Users can insert own time capsules" ON time_capsules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own capsules (before delivery)
CREATE POLICY "Users can update own time capsules" ON time_capsules
  FOR UPDATE USING (auth.uid() = user_id AND is_delivered = false);

-- Users can delete their own capsules (before delivery)
CREATE POLICY "Users can delete own time capsules" ON time_capsules
  FOR DELETE USING (auth.uid() = user_id AND is_delivered = false);

-- Public access for delivered capsules (controlled by application logic)
CREATE POLICY "Public access with valid token" ON time_capsules
  FOR SELECT USING (true);
```

## Storage Schema

### Time Capsules Bucket

**Supabase Storage configuration for encrypted media files:**

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'time-capsules',
  'time-capsules',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['video/webm', 'video/mp4', 'audio/ogg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png']
);
```

### Storage Policies

**File access control policies:**

```sql
-- Users can upload their own time capsule files
CREATE POLICY "Users can upload their own time capsule files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own time capsule files
CREATE POLICY "Users can view their own time capsule files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own time capsule files
CREATE POLICY "Users can update their own time capsule files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own time capsule files
CREATE POLICY "Users can delete their own time capsule files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access to delivered time capsule files
CREATE POLICY "Public access to delivered time capsule files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'time-capsules'
  AND EXISTS (
    SELECT 1 FROM time_capsules tc
    WHERE tc.storage_path = name
    AND tc.is_delivered = true
  )
);
```

### File Organization

**Storage path structure:**

```text
time-capsules/
├── {user_id}/
│   ├── {timestamp}.webm          # Video recording
│   ├── {timestamp}.ogg           # Audio recording
│   └── {timestamp}_thumbnail.jpg # Video thumbnail
```

## Database Functions

### Delivery Processing Functions

#### get_time_capsules_ready_for_delivery()

**Retrieves capsules ready for delivery based on conditions.**

```sql
CREATE OR REPLACE FUNCTION get_time_capsules_ready_for_delivery()
RETURNS TABLE(
  capsule_id UUID,
  user_id UUID,
  recipient_name TEXT,
  recipient_email TEXT,
  message_title TEXT,
  access_token UUID,
  delivery_condition delivery_condition
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id as capsule_id,
    tc.user_id,
    tc.recipient_name,
    tc.recipient_email,
    tc.message_title,
    tc.access_token,
    tc.delivery_condition
  FROM time_capsules tc
  WHERE
    tc.status = 'PENDING'
    AND tc.is_delivered = false
    AND (
      (tc.delivery_condition = 'ON_DATE' AND tc.delivery_date <= NOW())
      OR
      (tc.delivery_condition = 'ON_DEATH' AND $1 = true)
    )
  ORDER BY tc.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

#### mark_capsule_delivered()

**Marks a capsule as successfully delivered.**

```sql
CREATE OR REPLACE FUNCTION mark_capsule_delivered(capsule_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE time_capsules
  SET
    status = 'DELIVERED',
    is_delivered = true,
    delivered_at = NOW(),
    updated_at = NOW()
  WHERE id = capsule_uuid AND status = 'PENDING';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

#### increment_delivery_attempt()

**Increments delivery attempt counter and handles failures.**

```sql
CREATE OR REPLACE FUNCTION increment_delivery_attempt(
  capsule_uuid UUID,
  error_message TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE time_capsules
  SET
    delivery_attempts = delivery_attempts + 1,
    last_delivery_attempt = NOW(),
    delivery_error = error_message,
    status = CASE
      WHEN delivery_attempts >= 3 THEN 'FAILED'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = capsule_uuid;
END;
$$ LANGUAGE plpgsql;
```

### Utility Functions

#### get_time_capsule_signed_url()

**Generates signed URL for secure media access.**

```sql
CREATE OR REPLACE FUNCTION get_time_capsule_signed_url(
  capsule_token UUID,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
  capsule_record time_capsules%ROWTYPE;
  signed_url TEXT;
BEGIN
  -- Find capsule by access token
  SELECT * INTO capsule_record
  FROM time_capsules
  WHERE access_token = capsule_token
    AND is_delivered = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Capsule not found or not delivered';
  END IF;

  -- Generate signed URL (implementation depends on Supabase Storage)
  -- This is a placeholder - actual implementation uses Supabase client
  RETURN '/api/time-capsule-media/' || capsule_token;
END;
$$ LANGUAGE plpgsql;
```

## API Contracts

### REST API Endpoints

#### Time Capsule Management

##### GET /api/time-capsules

- **Purpose**: Retrieve user's time capsules
- **Query Parameters**:
  - `user_id` (required): User identifier
  - `status` (optional): Filter by status
  - `limit` (optional): Maximum results (default: 50)
  - `offset` (optional): Pagination offset (default: 0)
- **Response**: Array of time capsule objects
- **Status Codes**: 200 (success), 400 (bad request), 401 (unauthorized)

##### POST /api/time-capsules

- **Purpose**: Create new time capsule
- **Request Body**: TimeCapsuleCreateRequest
- **Response**: Created time capsule object
- **Status Codes**: 201 (created), 400 (validation error), 401 (unauthorized)

##### GET /api/time-capsules/{id}

- **Purpose**: Retrieve specific time capsule
- **Path Parameters**: `id` (capsule UUID)
- **Response**: Time capsule object
- **Status Codes**: 200 (success), 404 (not found), 401 (unauthorized)

##### PUT /api/time-capsules/{id}

- **Purpose**: Update time capsule (before delivery)
- **Path Parameters**: `id` (capsule UUID)
- **Request Body**: TimeCapsuleUpdateRequest
- **Response**: Updated time capsule object
- **Status Codes**: 200 (success), 400 (validation error), 403 (already delivered)

##### DELETE /api/time-capsules/{id}

- **Purpose**: Delete time capsule (before delivery)
- **Path Parameters**: `id` (capsule UUID)
- **Response**: Empty body
- **Status Codes**: 204 (deleted), 403 (already delivered), 404 (not found)

#### File Operations

##### POST /api/time-capsules/{id}/upload

- **Purpose**: Upload media file for capsule
- **Path Parameters**: `id` (capsule UUID)
- **Request Body**: Multipart form data with file
- **Response**: Upload result with storage path
- **Status Codes**: 200 (success), 400 (file error), 413 (file too large)

##### GET /api/time-capsules/{id}/media

- **Purpose**: Get signed URL for media access
- **Path Parameters**: `id` (capsule UUID)
- **Query Parameters**: `token` (access token)
- **Response**: Signed URL for media access
- **Status Codes**: 200 (success), 403 (invalid token), 404 (not found)

#### Public Access

##### GET /time-capsule-view/{token}

- **Purpose**: Public viewing page for delivered capsules
- **Path Parameters**: `token` (access token)
- **Response**: HTML page with capsule viewer
- **Status Codes**: 200 (success), 403 (invalid token), 404 (not found)

### Edge Function Endpoints

#### time-capsule-delivery

##### POST /functions/v1/time-capsule-delivery

- **Purpose**: Trigger automated delivery processing
- **Authentication**: Service role key required
- **Request Body**: Optional parameters for testing
- **Response**:

  ```json
  {
    "message": "Time Capsule delivery process completed",
    "processed": 5,
    "successful": 4,
    "failed": 1
  }
  ```

#### time-capsule-test-preview

##### POST /functions/v1/time-capsule-test-preview

- **Purpose**: Send test preview email
- **Request Body**:

  ```json
  {
    "capsule_id": "uuid",
    "user_email": "user@example.com"
  }
  ```

- **Response**: Email sending result

#### family-shield-time-capsule-trigger

##### POST /functions/v1/family-shield-time-capsule-trigger

- **Purpose**: Trigger delivery for Family Shield activation
- **Request Body**:

  ```json
  {
    "user_id": "uuid",
    "activation_type": "emergency"
  }
  ```

- **Response**: Trigger result with affected capsules

## Request/Response Schemas

### TimeCapsuleCreateRequest

```typescript
interface TimeCapsuleCreateRequest {
  user_id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_id?: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  delivery_date?: string; // ISO date string
  message_title: string;
  message_preview?: string;
  storage_path: string;
  file_type: 'video' | 'audio';
  file_size_bytes: number;
  duration_seconds: number;
  thumbnail_path?: string;
}
```

### TimeCapsuleUpdateRequest

```typescript
interface TimeCapsuleUpdateRequest extends Partial<TimeCapsuleCreateRequest> {
  status?: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
}
```

### TimeCapsuleResponse

```typescript
interface TimeCapsuleResponse {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_id?: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  delivery_date?: string;
  message_title: string;
  message_preview?: string;
  storage_path: string;
  file_type: 'video' | 'audio';
  file_size_bytes: number;
  duration_seconds: number;
  thumbnail_path?: string;
  access_token: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  is_delivered: boolean;
  delivered_at?: string;
  delivery_attempts: number;
  last_delivery_attempt?: string;
  delivery_error?: string;
  created_at: string;
  updated_at: string;
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Integration Contracts

### Family Shield Integration

**Emergency Activation Trigger**:

```typescript
interface FamilyShieldTrigger {
  user_id: string;
  activation_type: 'emergency' | 'scheduled';
  trigger_timestamp: string;
  affected_capsules: string[]; // Array of capsule IDs
}
```

**Guardian Access Grant**:

```typescript
interface GuardianAccessGrant {
  capsule_id: string;
  guardian_id: string;
  access_level: 'view' | 'manage';
  granted_at: string;
  expires_at?: string;
}
```

### Document Vault Integration

**Encryption Key Exchange**:

```typescript
interface EncryptionKeyExchange {
  capsule_id: string;
  user_key_hash: string;
  vault_key_reference: string;
  encryption_algorithm: string;
  key_rotation_date?: string;
}
```

**Storage Path Mapping**:

```typescript
interface StoragePathMapping {
  capsule_id: string;
  vault_path: string;
  capsule_path: string;
  encryption_metadata: Record<string, any>;
}
```

### Sofia AI Integration

**Creation Guidance Context**:

```typescript
interface SofiaGuidanceContext {
  user_id: string;
  capsule_id?: string;
  current_step: number;
  emotional_state?: 'anxious' | 'confident' | 'uncertain';
  guidance_type: 'recording_tips' | 'emotional_support' | 'technical_help';
}
```

**AI Response Format**:

```typescript
interface SofiaResponse {
  message: string;
  guidance_type: string;
  suggested_actions?: string[];
  emotional_tone: 'empathetic' | 'pragmatic' | 'adaptive';
  follow_up_questions?: string[];
}
```

## Validation Rules

### Business Logic Validation

**Capsule Creation**:

- User must be authenticated
- Recipient email must be valid format
- Delivery date must be in the future (for ON_DATE)
- Message title is required and max 200 characters
- File size must not exceed 100MB
- Duration must be between 10 seconds and 5 minutes

**Delivery Validation**:

- Capsule must be in PENDING status
- For ON_DATE: current time must be past delivery_date
- For ON_DEATH: Family Shield must be activated
- Access token must be valid UUID
- Recipient email must be deliverable

**Access Control Validation**:

- Users can only access their own capsules
- Delivered capsules allow public access with valid token
- Token must not be expired (30-day limit)
- File access respects storage policies

### Data Integrity Validation

**Database Constraints**:

- Foreign key constraints on user_id and recipient_id
- Check constraints on file_type and status enums
- Unique constraint on access_token
- Not null constraints on required fields

**File Validation**:

- MIME type must match file_type
- File size must match file_size_bytes
- Video files must have thumbnail
- Encryption must be applied before storage

## Migration Scripts

### Initial Schema Creation

**001_create_time_capsules.sql**:

```sql
-- Create custom types
CREATE TYPE delivery_condition AS ENUM ('ON_DATE', 'ON_DEATH');
CREATE TYPE capsule_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'CANCELLED');

-- Create main table
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_condition delivery_condition NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE,
  message_title TEXT NOT NULL,
  message_preview TEXT,
  storage_path TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio')),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  thumbnail_path TEXT,
  access_token UUID DEFAULT gen_random_uuid(),
  status capsule_status DEFAULT 'PENDING',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_time_capsules_user_id ON time_capsules(user_id);
CREATE INDEX idx_time_capsules_delivery_date ON time_capsules(delivery_date)
  WHERE delivery_condition = 'ON_DATE' AND is_delivered = false;
CREATE INDEX idx_time_capsules_access_token ON time_capsules(access_token)
  WHERE is_delivered = true;

-- Enable RLS
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
```

### Storage Bucket Setup

**002_create_time_capsule_storage.sql**:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'time-capsules',
  'time-capsules',
  false,
  104857600,
  ARRAY['video/webm', 'video/mp4', 'audio/ogg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png']
);

-- Create storage policies
CREATE POLICY "Users can upload their own time capsule files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own time capsule files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'time-capsules'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Performance Considerations

### Query Optimization

**Common Query Patterns**:

- User capsule listing: Use idx_time_capsules_user_id
- Delivery processing: Use idx_time_capsules_delivery_date
- Access validation: Use idx_time_capsules_access_token

**Pagination Strategy**:

- Use cursor-based pagination for large result sets
- Implement efficient sorting by created_at
- Cache frequently accessed capsule metadata

### Storage Optimization

**File Organization**:

- User-based folder structure prevents hot spots
- Timestamp-based filenames ensure uniqueness
- Separate thumbnail storage for videos

**Cleanup Strategies**:

- Automatic orphaned file cleanup
- Expired access token cleanup
- Failed delivery retry limits

### Monitoring Queries

**Performance Metrics**:

```sql
-- Average query execution time
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%time_capsules%'
ORDER BY mean_exec_time DESC;

-- Storage usage by user
SELECT
  user_id,
  COUNT(*) as capsule_count,
  SUM(file_size_bytes) as total_size
FROM time_capsules
GROUP BY user_id
ORDER BY total_size DESC;

-- Delivery success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM time_capsules
WHERE is_delivered = true
GROUP BY status;
```

## Security Audit Checklist

### Data Protection

- [ ] RLS policies prevent unauthorized access
- [ ] Encryption applied to sensitive data
- [ ] Access tokens have appropriate expiration
- [ ] Audit logging captures all access events
- [ ] Data minimization principles followed

### Network Security

- [ ] HTTPS required for all API calls
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation prevents injection attacks
- [ ] File upload validation prevents malicious files

### Compliance

- [ ] GDPR data protection principles
- [ ] User consent for data processing
- [ ] Right to erasure (data deletion)
- [ ] Data portability support
- [ ] Privacy by design principles

This comprehensive data model provides a solid foundation for the Time Capsule Legacy System, ensuring data integrity, security, and performance while maintaining compatibility with existing Schwalbe systems.
