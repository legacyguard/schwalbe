# Database Types - Data Model

## Overview

This document outlines the core database entities, relationships, and data structures for the Schwalbe database system. The model is based on Hollywood's existing schema with enhancements for type safety and validation.

### Identity and RLS Note

- Use `auth.uid()` as the identity source for Row Level Security (RLS) policies (Supabase Auth user ID).
- Reference users via `auth.users(id)`.
- Store `user_id` as UUID in all tables that reference `auth.users(id)`.
- Remove any usage of `app.current_external_id()` and any legacy external-identity-specific identifiers in RLS policies, types, and schemas.
- Ensure migrations and examples align to this identity model across tables and policies.

## Core Entities

### DatabaseSchema Entity

Represents the overall database schema structure and metadata.

```typescript
interface DatabaseSchema {
  id: string;
  name: string;
  version: string;
  description?: string;
  tables: TableDefinition[];
  enums: EnumDefinition[];
  functions: FunctionDefinition[];
  created_at: Date;
  updated_at: Date;
}
```

**Fields:**

- `id`: Unique identifier for the schema
- `name`: Schema name (e.g., "public", "auth")
- `version`: Schema version for migration tracking
- `description`: Optional description of the schema
- `tables`: Array of table definitions
- `enums`: Array of enum definitions
- `functions`: Array of function definitions
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

### MigrationFile Entity

Represents individual migration files and their execution status.

```typescript
interface MigrationFile {
  id: string;
  filename: string;
  version: string;
  checksum: string;
  executed_at?: Date;
  execution_time?: number;
  success: boolean;
  error_message?: string;
  rollback_available: boolean;
  dependencies: string[];
}
```

**Fields:**

- `id`: Unique identifier
- `filename`: Migration filename (e.g., "20240101000000_create_subscription_tables.sql")
- `version`: Migration version/timestamp
- `checksum`: File checksum for integrity verification
- `executed_at`: Execution timestamp
- `execution_time`: Execution duration in milliseconds
- `success`: Execution success status
- `error_message`: Error details if execution failed
- `rollback_available`: Whether rollback script exists
- `dependencies`: Array of migration dependencies

### TypeDefinition Entity

Represents generated TypeScript type definitions.

```typescript
interface TypeDefinition {
  id: string;
  table_name: string;
  type_name: string;
  typescript_code: string;
  schema_version: string;
  generated_at: Date;
  is_valid: boolean;
  validation_errors?: string[];
}
```

**Fields:**

- `id`: Unique identifier
- `table_name`: Source table name
- `type_name`: Generated TypeScript type name
- `typescript_code`: Generated TypeScript code
- `schema_version`: Schema version when generated
- `generated_at`: Generation timestamp
- `is_valid`: Type validation status
- `validation_errors`: Array of validation error messages

### SchemaValidation Entity

Represents schema validation rules and results.

```typescript
interface SchemaValidation {
  id: string;
  table_name: string;
  column_name?: string;
  validation_type: 'constraint' | 'relationship' | 'data_type' | 'custom';
  validation_rule: string;
  error_message: string;
  severity: 'error' | 'warning' | 'info';
  is_active: boolean;
  created_at: Date;
}
```

**Fields:**

- `id`: Unique identifier
- `table_name`: Target table name
- `column_name`: Optional column name for column-specific validations
- `validation_type`: Type of validation rule
- `validation_rule`: Validation rule definition
- `error_message`: Error message for validation failures
- `severity`: Validation severity level
- `is_active`: Whether validation is currently active
- `created_at`: Creation timestamp

### DataIntegrity Entity

Represents data integrity checks and monitoring.

```typescript
interface DataIntegrity {
  id: string;
  check_name: string;
  check_type: 'consistency' | 'referential' | 'business_rule' | 'custom';
  target_tables: string[];
  check_query: string;
  expected_result?: any;
  last_run_at?: Date;
  last_status: 'pass' | 'fail' | 'error';
  failure_count: number;
  is_active: boolean;
}
```

**Fields:**

- `id`: Unique identifier
- `check_name`: Human-readable check name
- `check_type`: Type of integrity check
- `target_tables`: Array of affected tables
- `check_query`: SQL query for the integrity check
- `expected_result`: Expected result value
- `last_run_at`: Last execution timestamp
- `last_status`: Last check status
- `failure_count`: Number of consecutive failures
- `is_active`: Whether check is currently active

### MigrationLog Entity

Represents migration execution logs and audit trail.

```typescript
interface MigrationLog {
  id: string;
  migration_id: string;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: Date;
  user_id?: string;
  session_id?: string;
}
```

**Fields:**

- `id`: Unique identifier
- `migration_id`: Reference to migration file
- `log_level`: Log severity level
- `message`: Log message
- `details`: Optional structured log details
- `timestamp`: Log timestamp
- `user_id`: User who triggered the migration
- `session_id`: Session identifier for tracking

## Database Tables (Based on Hollywood Schema)

### Core User Tables

#### user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('free', 'essential', 'family', 'premium')),
  status TEXT CHECK (status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
  billing_cycle TEXT CHECK (billing_cycle IN ('month', 'year')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### user_usage

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  time_capsule_count INTEGER DEFAULT 0,
  scans_this_month INTEGER DEFAULT 0,
  offline_document_count INTEGER DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Document Management Tables

#### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  document_type TEXT,
  bundle_id UUID REFERENCES document_bundles(id) ON DELETE SET NULL,
  expiration_date TIMESTAMPTZ,
  ai_confidence DECIMAL(3,2),
  ai_extracted_text TEXT,
  ai_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### document_bundles

```sql
CREATE TABLE document_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bundle_name)
);
```

### Will Generation Tables

#### wills

```sql
CREATE TABLE wills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Last Will and Testament',
  status will_status NOT NULL DEFAULT 'draft',
  testator_data JSONB NOT NULL DEFAULT '{}',
  beneficiaries JSONB NOT NULL DEFAULT '[]',
  assets JSONB NOT NULL DEFAULT '{}',
  executor_data JSONB NOT NULL DEFAULT '{}',
  guardianship_data JSONB NOT NULL DEFAULT '{}',
  special_instructions JSONB NOT NULL DEFAULT '{}',
  legal_data JSONB NOT NULL DEFAULT '{}',
  document_data JSONB NOT NULL DEFAULT '{}',
  version_number INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### will_templates

```sql
CREATE TABLE will_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0',
  template_structure JSONB NOT NULL,
  legal_requirements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(jurisdiction, template_name, template_version)
);
```

### Family and Emergency Tables

#### guardians

```sql
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT,
  priority INTEGER DEFAULT 1,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  UNIQUE(user_id, guardian_user_id)
);
```

#### emergency_access_tokens

```sql
CREATE TABLE emergency_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token_hash)
);
```

### Time Capsule Tables

#### time_capsules

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  delivery_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'delivered', 'failed')) DEFAULT 'pending',
  content JSONB NOT NULL DEFAULT '{}',
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Enums and Types

### bundle_category

```sql
CREATE TYPE bundle_category AS ENUM (
  'personal',
  'housing',
  'finances',
  'work',
  'health',
  'legal',
  'vehicles',
  'insurance',
  'other'
);
```

### will_status

```sql
CREATE TYPE will_status AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'archived'
);
```

### relationship_type

```sql
CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'child',
  'parent',
  'sibling',
  'grandchild',
  'friend',
  'charity',
  'other'
);
```

## Relationships

### Entity Relationship Diagram

```text
auth.users (Supabase Auth)
    │
    ├── user_subscriptions (1:1)
    ├── user_usage (1:1)
    ├── documents (1:many)
    │   └── document_bundles (many:1)
    ├── wills (1:many)
    ├── guardians (1:many)
    │   └── emergency_access_tokens (1:many)
    └── time_capsules (1:many)

will_templates (Global)
    └── wills (many:1 via jurisdiction)
```

### Key Relationships

1. **User → Subscriptions**: One-to-one relationship for billing
2. **User → Usage**: One-to-one relationship for limits tracking
3. **User → Documents**: One-to-many for file storage
4. **Documents → Bundles**: Many-to-one for organization
5. **User → Wills**: One-to-many for legal documents
6. **Wills → Templates**: Many-to-one for jurisdictional templates
7. **User → Guardians**: One-to-many for emergency contacts
8. **Guardians → Emergency Tokens**: One-to-many for access control
9. **User → Time Capsules**: One-to-many for legacy content

## Data Flow

### Migration Data Flow

```text
Migration Files → Migration Runner → Schema Updates → Type Generator → TypeScript Types
```

### Validation Data Flow

```text
Schema Changes → Validation Rules → Integrity Checks → Error Reporting → Rollback/Repair
```

### Type Generation Flow

```text
Database Schema → Type Analysis → TypeScript Generation → Validation → Package Export
```

## Indexes and Performance

### Core Indexes

- `user_subscriptions(user_id)` - Primary user lookup
- `user_usage(user_id)` - Usage tracking
- `documents(user_id, bundle_id)` - Document organization
- `document_bundles(user_id, bundle_category)` - Bundle filtering
- `wills(user_id, status)` - Will management
- `guardians(user_id, priority)` - Emergency access
- `time_capsules(user_id, delivery_date)` - Scheduled delivery

### Performance Considerations

- All user-scoped queries include user_id for RLS efficiency
- JSONB fields indexed for common query patterns
- Composite indexes for multi-column filters
- GIN indexes for array and text search operations

## Security Model

### Row Level Security (RLS)

- All tables enable RLS
- User-scoped access policies
- Service role access for administrative operations
- Secure JWT token validation

### Data Encryption

- Sensitive document content encrypted at rest
- Key management through dedicated tables
- Zero-knowledge architecture for user data

### Audit Logging

- All data modifications logged
- Migration execution tracked
- Access patterns monitored
- Security events recorded

## Migration Strategy

### Incremental Migration

1. Core user tables (subscriptions, usage)
2. Document management system
3. Will generation framework
4. Family and emergency features
5. Time capsule functionality

### Data Transformation

- Schema normalization and optimization
- Data type conversions and validations
- Relationship integrity verification
- Performance index creation

### Rollback Procedures

- Transaction-based migrations
- Automated rollback scripts
- Data backup and recovery
- Integrity verification after rollback
