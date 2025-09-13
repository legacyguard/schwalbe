# Will Creation System - Database Contracts

## Schema Overview

The will creation system uses a comprehensive database schema designed for flexibility, security, and performance. All tables implement Row Level Security (RLS) and follow strict data validation patterns.

## Core Tables

### wills

**Purpose:** Stores complete will data with flexible JSONB structure for complex legal documents.

**Schema:**
```sql
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Last Will and Testament',
  status will_status NOT NULL DEFAULT 'draft',
  jurisdiction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Core will data stored as JSONB for flexibility
  testator_data JSONB NOT NULL DEFAULT '{}',
  beneficiaries JSONB NOT NULL DEFAULT '[]',
  assets JSONB NOT NULL DEFAULT '{}',
  executor_data JSONB NOT NULL DEFAULT '{}',
  guardianship_data JSONB NOT NULL DEFAULT '{}',
  special_instructions JSONB NOT NULL DEFAULT '{}',
  legal_data JSONB NOT NULL DEFAULT '{}',
  document_data JSONB NOT NULL DEFAULT '{}',

  -- Version control
  version_number INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  CONSTRAINT valid_jurisdiction CHECK (jurisdiction ~ '^[A-Z]{2}-[A-Za-z-]+$'),
  CONSTRAINT positive_version CHECK (version_number > 0)
);
```

**Indexes:**
```sql
CREATE INDEX idx_wills_user_id ON wills(user_id);
CREATE INDEX idx_wills_status ON wills(status);
CREATE INDEX idx_wills_jurisdiction ON wills(jurisdiction);
CREATE INDEX idx_wills_updated_at ON wills(updated_at DESC);
CREATE INDEX idx_wills_parent_will ON wills(parent_will_id) WHERE parent_will_id IS NOT NULL;
CREATE INDEX idx_wills_testator_name ON wills USING GIN ((testator_data -> 'fullName'));
CREATE INDEX idx_wills_beneficiaries ON wills USING GIN (beneficiaries);
```

**RLS Policies:**
```sql
-- Users can only access their own wills
CREATE POLICY "Users can view own wills" ON wills
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own wills" ON wills
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own wills" ON wills
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own wills" ON wills
  FOR DELETE USING (auth.uid()::text = user_id);
```

### will_templates

**Purpose:** Stores jurisdiction-specific legal templates with validation rules.

**Schema:**
```sql
CREATE TABLE will_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0',
  template_structure JSONB NOT NULL,
  legal_requirements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  UNIQUE(jurisdiction, template_name, template_version)
);
```

**Indexes:**
```sql
CREATE INDEX idx_will_templates_jurisdiction ON will_templates(jurisdiction);
CREATE INDEX idx_will_templates_active ON will_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_will_templates_structure ON will_templates USING GIN (template_structure);
```

**RLS Policies:**
```sql
-- Templates are read-only for all authenticated users
CREATE POLICY "Authenticated users can view templates" ON will_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
```

### will_drafts

**Purpose:** Manages temporary draft sessions for will creation workflow.

**Schema:**
```sql
CREATE TABLE will_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step_number INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  draft_data JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, session_id),
  CONSTRAINT valid_step CHECK (step_number BETWEEN 1 AND total_steps),
  CONSTRAINT future_expiry CHECK (expires_at > NOW())
);
```

**Indexes:**
```sql
CREATE INDEX idx_will_drafts_user_id ON will_drafts(user_id);
CREATE INDEX idx_will_drafts_session_id ON will_drafts(session_id);
CREATE INDEX idx_will_drafts_expires_at ON will_drafts(expires_at);
CREATE INDEX idx_will_drafts_will_id ON will_drafts(will_id);
```

**RLS Policies:**
```sql
CREATE POLICY "Users can manage own drafts" ON will_drafts
  FOR ALL USING (auth.uid()::text = user_id);
```

## Supporting Tables

### will_revisions

**Purpose:** Tracks detailed changes between will versions.

**Schema:**
```sql
CREATE TABLE will_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changed_by TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'content', 'template', 'legal'
  change_description TEXT,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_change_type CHECK (change_type IN ('content', 'template', 'legal'))
);
```

### will_audit_log

**Purpose:** Comprehensive audit trail for all will operations.

**Schema:**
```sql
CREATE TABLE will_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  will_id UUID REFERENCES wills(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_action CHECK (action IN ('create', 'update', 'delete', 'view', 'export')),
  CONSTRAINT valid_resource_type CHECK (resource_type IN ('will', 'draft', 'template', 'pdf'))
);
```

## Data Types and Enums

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

### jurisdiction_type
```sql
CREATE TYPE jurisdiction_type AS ENUM (
  'US-Federal',
  'US-State',
  'International',
  'EU-Member'
);
```

## Functions and Triggers

### Automatic Timestamps
```sql
CREATE OR REPLACE FUNCTION update_will_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Auto-complete when all required sections are filled
  IF NEW.status = 'in_progress' AND
     NEW.testator_data ? 'fullName' AND
     NEW.beneficiaries != '[]'::jsonb AND
     NEW.executor_data ? 'primaryExecutor' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wills_timestamp
  BEFORE UPDATE ON wills
  FOR EACH ROW
  EXECUTE FUNCTION update_will_timestamp();
```

### Will Versioning
```sql
CREATE OR REPLACE FUNCTION create_will_revision(
  original_will_id UUID,
  user_id_param TEXT
) RETURNS UUID AS $$
DECLARE
  original_will RECORD;
  new_will_id UUID;
  new_version_number INTEGER;
BEGIN
  -- Get original will data
  SELECT * INTO original_will
  FROM wills
  WHERE id = original_will_id AND user_id = user_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original will not found or access denied';
  END IF;

  -- Calculate new version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO new_version_number
  FROM wills
  WHERE parent_will_id = original_will_id OR id = original_will_id;

  -- Archive original will
  UPDATE wills
  SET status = 'archived', updated_at = NOW()
  WHERE id = original_will_id;

  -- Create new revision
  INSERT INTO wills (
    user_id, title, status, jurisdiction,
    testator_data, beneficiaries, assets,
    executor_data, guardianship_data, special_instructions, legal_data,
    version_number, parent_will_id
  ) VALUES (
    original_will.user_id,
    original_will.title || ' (Revision ' || new_version_number || ')',
    'draft',
    original_will.jurisdiction,
    original_will.testator_data,
    original_will.beneficiaries,
    original_will.assets,
    original_will.executor_data,
    original_will.guardianship_data,
    original_will.special_instructions,
    original_will.legal_data,
    new_version_number,
    original_will_id
  ) RETURNING id INTO new_will_id;

  RETURN new_will_id;
END;
$$ LANGUAGE plpgsql;
```

### Audit Logging
```sql
CREATE OR REPLACE FUNCTION audit_will_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO will_audit_log (
      will_id, user_id, action, resource_type, resource_id, new_values
    ) VALUES (
      NEW.id, NEW.user_id, 'create', 'will', NEW.id, row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO will_audit_log (
      will_id, user_id, action, resource_type, resource_id, old_values, new_values
    ) VALUES (
      NEW.id, NEW.user_id, 'update', 'will', NEW.id, row_to_json(OLD), row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO will_audit_log (
      will_id, user_id, action, resource_type, resource_id, old_values
    ) VALUES (
      OLD.id, OLD.user_id, 'delete', 'will', OLD.id, row_to_json(OLD)
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_wills_changes
  AFTER INSERT OR UPDATE OR DELETE ON wills
  FOR EACH ROW
  EXECUTE FUNCTION audit_will_changes();
```

## Views

### Active Wills View
```sql
CREATE VIEW active_wills AS
SELECT
  w.*,
  COUNT(r.id) as revision_count,
  MAX(r.created_at) as last_revision_date
FROM wills w
LEFT JOIN will_revisions r ON w.id = r.will_id
WHERE w.status IN ('draft', 'in_progress', 'completed')
GROUP BY w.id;
```

### Will Statistics View
```sql
CREATE VIEW will_statistics AS
SELECT
  user_id,
  COUNT(*) as total_wills,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_wills,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_wills,
  MAX(created_at) as last_will_created,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_completion_hours
FROM wills
GROUP BY user_id;
```

## Data Validation

### JSON Schema Validation
```sql
-- Function to validate will data against JSON schema
CREATE OR REPLACE FUNCTION validate_will_data(
  data_type TEXT,
  data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  schema JSONB;
BEGIN
  -- Get schema based on data type
  CASE data_type
    WHEN 'testator_data' THEN
      schema := '{
        "type": "object",
        "required": ["fullName", "dateOfBirth", "address", "citizenship"],
        "properties": {
          "fullName": {"type": "string", "minLength": 2, "maxLength": 100},
          "dateOfBirth": {"type": "string", "format": "date"},
          "citizenship": {"type": "string", "minLength": 2, "maxLength": 3}
        }
      }'::jsonb;
    WHEN 'beneficiaries' THEN
      schema := '{
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name", "relationship", "percentage"],
          "properties": {
            "name": {"type": "string", "minLength": 1},
            "relationship": {"type": "string"},
            "percentage": {"type": "number", "minimum": 0, "maximum": 100}
          }
        }
      }'::jsonb;
  END CASE;

  -- Validate against schema (simplified - would use proper JSON schema validator)
  RETURN jsonb_typeof(data) = 'object';
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization

### Partitioning Strategy
```sql
-- Partition wills table by creation year for better performance
CREATE TABLE wills_y2025 PARTITION OF wills
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE wills_y2026 PARTITION OF wills
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### Query Optimization
```sql
-- Optimized query for user's active wills
CREATE OR REPLACE FUNCTION get_user_active_wills(user_id_param TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status will_status,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.title, w.status, w.updated_at
  FROM wills w
  WHERE w.user_id = user_id_param
    AND w.status IN ('draft', 'in_progress', 'completed')
  ORDER BY w.updated_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
```

## Backup and Recovery

### Automated Backups
```sql
-- Function to create will backup
CREATE OR REPLACE FUNCTION backup_will(
  will_id_param UUID,
  backup_reason TEXT DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
  backup_id UUID;
BEGIN
  INSERT INTO will_backups (
    will_id, backup_data, backup_reason, created_by
  ) VALUES (
    will_id_param,
    (SELECT row_to_json(w) FROM wills w WHERE id = will_id_param),
    backup_reason,
    auth.uid()::text
  ) RETURNING id INTO backup_id;

  RETURN backup_id;
END;
$$ LANGUAGE plpgsql;
```

### Point-in-Time Recovery
```sql
-- Function to restore will from backup
CREATE OR REPLACE FUNCTION restore_will_from_backup(
  will_id_param UUID,
  backup_id_param UUID
) RETURNS BOOLEAN AS $$
DECLARE
  backup_record RECORD;
BEGIN
  SELECT * INTO backup_record
  FROM will_backups
  WHERE id = backup_id_param AND will_id = will_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Restore will data
  UPDATE wills
  SET
    title = backup_record.backup_data->>'title',
    testator_data = backup_record.backup_data->'testator_data',
    beneficiaries = backup_record.backup_data->'beneficiaries',
    -- ... other fields
    updated_at = NOW()
  WHERE id = will_id_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

This database contract provides a solid foundation for the will creation system with proper security, performance, and maintainability considerations.