# Family Collaboration System - Database Schema

## Overview

This document defines the complete database schema for the Family Collaboration System, including table structures, relationships, indexes, constraints, and Row Level Security (RLS) policies.

## Core Tables

### family_members

Primary table for storing family member information and relationships.

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role family_role NOT NULL DEFAULT 'viewer',
  relationship relationship_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '{}',
  phone TEXT CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-\(\)]+$'),
  address JSONB,
  emergency_contact BOOLEAN NOT NULL DEFAULT false,
  emergency_priority INTEGER CHECK (emergency_priority IS NULL OR emergency_priority BETWEEN 1 AND 10),
  access_level TEXT CHECK (access_level IN ('read', 'write', 'admin')),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(family_owner_id, email),
  CHECK (
    CASE
      WHEN role = 'emergency_contact' THEN emergency_contact = true
      ELSE true
    END
  ),

  -- Indexes
  INDEX idx_family_members_owner_active (family_owner_id, is_active),
  INDEX idx_family_members_email (email),
  INDEX idx_family_members_role (role),
  INDEX idx_family_members_relationship (relationship),
  INDEX idx_family_members_emergency (emergency_contact, emergency_priority),
  INDEX idx_family_members_created_at (created_at DESC)
);

-- Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own family members
CREATE POLICY "Users can view their own family members" ON family_members
  FOR SELECT USING (auth.uid() = family_owner_id);

-- Users can insert family members they own
CREATE POLICY "Users can insert their own family members" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = family_owner_id);

-- Users can update their own family members
CREATE POLICY "Users can update their own family members" ON family_members
  FOR UPDATE USING (auth.uid() = family_owner_id) WITH CHECK (auth.uid() = family_owner_id);

-- Users can delete their own family members
CREATE POLICY "Users can delete their own family members" ON family_members
  FOR DELETE USING (auth.uid() = family_owner_id);

-- Triggers
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### family_invitations

Manages invitation tokens and lifecycle for family member onboarding.

```sql
CREATE TABLE family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (expires_at > created_at),
  CHECK (
    CASE
      WHEN status = 'accepted' THEN accepted_at IS NOT NULL
      WHEN status = 'declined' THEN declined_at IS NOT NULL
      ELSE true
    END
  ),

  -- Indexes
  INDEX idx_family_invitations_sender_status (sender_id, status),
  INDEX idx_family_invitations_token (token),
  INDEX idx_family_invitations_expires_at (expires_at),
  INDEX idx_family_invitations_created_at (created_at DESC),
  INDEX idx_family_invitations_family_member (family_member_id),

  -- Unique constraints
  UNIQUE(family_member_id)
);

-- Row Level Security
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent" ON family_invitations
  FOR SELECT USING (auth.uid() = sender_id);

-- Users can insert invitations they send
CREATE POLICY "Users can insert invitations they send" ON family_invitations
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update invitations they sent
CREATE POLICY "Users can update invitations they sent" ON family_invitations
  FOR UPDATE USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

-- Users can delete invitations they sent
CREATE POLICY "Users can delete invitations they sent" ON family_invitations
  FOR DELETE USING (auth.uid() = sender_id);
```

### emergency_access_requests

Handles emergency access requests and approvals.

```sql
CREATE TABLE emergency_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10 AND char_length(reason) <= 1000),
  status emergency_request_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  approver_name TEXT,
  approver_relation TEXT,
  access_granted_until TIMESTAMPTZ,
  verification_token TEXT UNIQUE,
  verification_attempts INTEGER NOT NULL DEFAULT 0,
  max_verification_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (expires_at > requested_at),
  CHECK (access_granted_until IS NULL OR access_granted_until > responded_at),
  CHECK (verification_attempts >= 0 AND verification_attempts <= max_verification_attempts),
  CHECK (requester_id != owner_id), -- Can't request access to own data

  -- Indexes
  INDEX idx_emergency_requests_owner_status (owner_id, status),
  INDEX idx_emergency_requests_requester (requester_id),
  INDEX idx_emergency_requests_expires_at (expires_at),
  INDEX idx_emergency_requests_requested_at (requested_at DESC),
  INDEX idx_emergency_requests_verification_token (verification_token)
);

-- Row Level Security
ALTER TABLE emergency_access_requests ENABLE ROW LEVEL SECURITY;

-- Owners can view requests made to them
CREATE POLICY "Owners can view requests made to them" ON emergency_access_requests
  FOR SELECT USING (auth.uid() = owner_id);

-- Requesters can view requests they made
CREATE POLICY "Requesters can view requests they made" ON emergency_access_requests
  FOR SELECT USING (auth.uid() = requester_id);

-- Anyone can insert emergency requests (with validation)
CREATE POLICY "Anyone can insert emergency requests" ON emergency_access_requests
  FOR INSERT WITH CHECK (true);

-- Owners can update requests made to them
CREATE POLICY "Owners can update requests made to them" ON emergency_access_requests
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
```

### family_activity_log

Comprehensive audit log for all family-related activities.

```sql
CREATE TABLE family_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action_type activity_action_type NOT NULL,
  target_type activity_target_type NOT NULL,
  target_id UUID NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_family_activity_owner_created (family_owner_id, created_at DESC),
  INDEX idx_family_activity_actor (actor_id),
  INDEX idx_family_activity_action (action_type),
  INDEX idx_family_activity_target (target_type, target_id),
  INDEX idx_family_activity_created_at (created_at DESC),

  -- Partitioning for performance (by month)
  PARTITION BY RANGE (created_at)
);

-- Create monthly partitions (example for current year)
CREATE TABLE family_activity_log_2024_01 PARTITION OF family_activity_log
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE family_activity_log_2024_02 PARTITION OF family_activity_log
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Row Level Security
ALTER TABLE family_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view activity for their family
CREATE POLICY "Users can view activity for their family" ON family_activity_log
  FOR SELECT USING (auth.uid() = family_owner_id);

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON family_activity_log
  FOR INSERT WITH CHECK (true);
```

## Supporting Tables

### family_relationships

Advanced family tree relationships and hierarchies.

```sql
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  child_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  relationship_type relationship_type NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  relationship_strength INTEGER CHECK (relationship_strength BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (parent_member_id != child_member_id),

  -- Indexes
  INDEX idx_family_relationships_parent (parent_member_id),
  INDEX idx_family_relationships_child (child_member_id),
  INDEX idx_family_relationships_type (relationship_type),
  INDEX idx_family_relationships_primary (is_primary),

  -- Unique constraints
  UNIQUE(parent_member_id, child_member_id, relationship_type)
);

-- Row Level Security
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- Users can view relationships in their family
CREATE POLICY "Users can view relationships in their family" ON family_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_relationships.parent_member_id
      AND fm.family_owner_id = auth.uid()
    )
  );

-- Users can manage relationships in their family
CREATE POLICY "Users can manage relationships in their family" ON family_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_relationships.parent_member_id
      AND fm.family_owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_relationships.parent_member_id
      AND fm.family_owner_id = auth.uid()
    )
  );
```

### family_permissions

Granular permission assignments for specific resources.

```sql
CREATE TABLE family_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document', 'will', 'vault', 'profile')),
  resource_id UUID NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'admin')),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB, -- Additional conditions for access
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (expires_at IS NULL OR expires_at > granted_at),

  -- Indexes
  INDEX idx_family_permissions_member (family_member_id),
  INDEX idx_family_permissions_resource (resource_type, resource_id),
  INDEX idx_family_permissions_active (is_active, expires_at),
  INDEX idx_family_permissions_granted_by (granted_by),

  -- Unique constraints
  UNIQUE(family_member_id, resource_type, resource_id, permission_type)
);

-- Row Level Security
ALTER TABLE family_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view permissions for their family members
CREATE POLICY "Users can view permissions for their family members" ON family_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_permissions.family_member_id
      AND fm.family_owner_id = auth.uid()
    )
  );

-- Users can manage permissions for their family members
CREATE POLICY "Users can manage permissions for their family members" ON family_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_permissions.family_member_id
      AND fm.family_owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_permissions.family_member_id
      AND fm.family_owner_id = auth.uid()
    )
  );
```

### family_calendar_events

Family calendar and event management.

```sql
CREATE TABLE family_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'meeting',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  location TEXT,
  meeting_url TEXT,
  attendees JSONB NOT NULL DEFAULT '[]',
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_end_date TIMESTAMPTZ,
  status event_status NOT NULL DEFAULT 'scheduled',
  reminders JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (
    CASE
      WHEN is_recurring THEN recurrence_pattern IS NOT NULL
      ELSE true
    END
  ),
  CHECK (recurrence_end_date IS NULL OR recurrence_end_date > scheduled_at),

  -- Indexes
  INDEX idx_family_events_owner_scheduled (family_owner_id, scheduled_at),
  INDEX idx_family_events_type (event_type),
  INDEX idx_family_events_status (status),
  INDEX idx_family_events_created_by (created_by),
  INDEX idx_family_events_scheduled_at (scheduled_at DESC)
);

-- Row Level Security
ALTER TABLE family_calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can view events for their family
CREATE POLICY "Users can view events for their family" ON family_calendar_events
  FOR SELECT USING (auth.uid() = family_owner_id);

-- Users can manage events for their family
CREATE POLICY "Users can manage events for their family" ON family_calendar_events
  FOR ALL USING (auth.uid() = family_owner_id) WITH CHECK (auth.uid() = family_owner_id);
```

## Enums and Types

### family_role

```sql
CREATE TYPE family_role AS ENUM ('collaborator', 'viewer', 'emergency_contact', 'admin');
```

### relationship_type

```sql
CREATE TYPE relationship_type AS ENUM (
  'spouse', 'partner', 'child', 'parent', 'sibling', 'grandparent',
  'grandchild', 'aunt_uncle', 'cousin', 'friend', 'professional', 'other'
);
```

### invitation_status

```sql
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
```

### emergency_request_status

```sql
CREATE TYPE emergency_request_status AS ENUM ('pending', 'approved', 'denied', 'expired');
```

### activity_action_type

```sql
CREATE TYPE activity_action_type AS ENUM (
  'member_added', 'member_updated', 'member_removed', 'member_activated',
  'invitation_sent', 'invitation_accepted', 'invitation_declined', 'invitation_expired',
  'emergency_requested', 'emergency_approved', 'emergency_denied', 'emergency_accessed',
  'permission_granted', 'permission_revoked', 'permission_updated',
  'document_shared', 'document_accessed', 'document_downloaded'
);
```

### activity_target_type

```sql
CREATE TYPE activity_target_type AS ENUM (
  'family_member', 'invitation', 'emergency_request', 'permission', 'document'
);
```

### event_type

```sql
CREATE TYPE event_type AS ENUM (
  'meeting', 'reminder', 'deadline', 'celebration', 'review', 'other'
);
```

### event_status

```sql
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled', 'postponed');
```

## Functions and Triggers

### Update Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Invitation Expiry Function

```sql
CREATE OR REPLACE FUNCTION expire_family_invitations()
RETURNS void AS $$
BEGIN
  UPDATE family_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Emergency Request Expiry Function

```sql
CREATE OR REPLACE FUNCTION expire_emergency_requests()
RETURNS void AS $$
BEGIN
  UPDATE emergency_access_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Activity Logging Function

```sql
CREATE OR REPLACE FUNCTION log_family_activity(
  p_family_owner_id UUID,
  p_actor_id UUID,
  p_actor_name TEXT,
  p_action_type activity_action_type,
  p_target_type activity_target_type,
  p_target_id UUID,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO family_activity_log (
    family_owner_id, actor_id, actor_name, action_type,
    target_type, target_id, details, ip_address, user_agent, session_id
  ) VALUES (
    p_family_owner_id, p_actor_id, p_actor_name, p_action_type,
    p_target_type, p_target_id, p_details, p_ip_address, p_user_agent, p_session_id
  )
  RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Indexes and Performance

### Composite Indexes

```sql
-- Family members queries
CREATE INDEX CONCURRENTLY idx_family_members_owner_role_active
  ON family_members (family_owner_id, role, is_active);

CREATE INDEX CONCURRENTLY idx_family_members_emergency_priority
  ON family_members (emergency_contact, emergency_priority)
  WHERE emergency_contact = true;

-- Invitations queries
CREATE INDEX CONCURRENTLY idx_family_invitations_sender_status_expires
  ON family_invitations (sender_id, status, expires_at);

-- Emergency requests queries
CREATE INDEX CONCURRENTLY idx_emergency_requests_owner_status_created
  ON emergency_access_requests (owner_id, status, created_at DESC);

-- Activity log queries
CREATE INDEX CONCURRENTLY idx_family_activity_owner_action_created
  ON family_activity_log (family_owner_id, action_type, created_at DESC);

CREATE INDEX CONCURRENTLY idx_family_activity_target_action
  ON family_activity_log (target_type, target_id, action_type);
```

## Data Migration Scripts

### Migration: Add Emergency Priority

```sql
-- Add emergency_priority column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_members' AND column_name = 'emergency_priority'
  ) THEN
    ALTER TABLE family_members ADD COLUMN emergency_priority INTEGER;
    ALTER TABLE family_members ADD CONSTRAINT chk_emergency_priority
      CHECK (emergency_priority IS NULL OR emergency_priority BETWEEN 1 AND 10);
  END IF;
END $$;
```

### Migration: Add Activity Logging

```sql
-- Create activity log table if not exists
CREATE TABLE IF NOT EXISTS family_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- Will be converted to enum later
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing data if needed
-- (Migration logic would go here)
```

## Backup and Recovery

### Backup Strategy

```sql
-- Daily backup of family data
CREATE OR REPLACE FUNCTION backup_family_data()
RETURNS void AS $$
BEGIN
  -- Create backup tables with timestamp
  EXECUTE format('CREATE TABLE family_members_backup_%s AS SELECT * FROM family_members', to_char(NOW(), 'YYYYMMDD'));
  EXECUTE format('CREATE TABLE family_invitations_backup_%s AS SELECT * FROM family_invitations', to_char(NOW(), 'YYYYMMDD'));

  -- Clean up old backups (keep last 30 days)
  EXECUTE format('DROP TABLE IF EXISTS family_members_backup_%s', to_char(NOW() - INTERVAL '30 days', 'YYYYMMDD'));
  EXECUTE format('DROP TABLE IF EXISTS family_invitations_backup_%s', to_char(NOW() - INTERVAL '30 days', 'YYYYMMDD'));
END;
$$ LANGUAGE plpgsql;
```

### Data Validation

```sql
-- Validate family member data integrity
CREATE OR REPLACE FUNCTION validate_family_member_data()
RETURNS TABLE(member_id UUID, validation_errors TEXT[]) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fm.id,
    ARRAY[
      CASE WHEN fm.name !~ '^[A-Za-z\s''-]+$' THEN 'Invalid name format' ELSE NULL END,
      CASE WHEN fm.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 'Invalid email format' ELSE NULL END,
      CASE WHEN fm.role NOT IN ('collaborator', 'viewer', 'emergency_contact', 'admin') THEN 'Invalid role' ELSE NULL END,
      CASE WHEN fm.emergency_contact AND fm.emergency_priority IS NULL THEN 'Emergency contact missing priority' ELSE NULL END
    ] FILTER (WHERE validation_errors IS NOT NULL)
  FROM family_members fm
  WHERE ARRAY[
    CASE WHEN fm.name !~ '^[A-Za-z\s''-]+$' THEN 'Invalid name format' ELSE NULL END,
    CASE WHEN fm.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 'Invalid email format' ELSE NULL END,
    CASE WHEN fm.role NOT IN ('collaborator', 'viewer', 'emergency_contact', 'admin') THEN 'Invalid role' ELSE NULL END,
    CASE WHEN fm.emergency_contact AND fm.emergency_priority IS NULL THEN 'Emergency contact missing priority' ELSE NULL END
  ] FILTER (WHERE validation_errors IS NOT NULL) IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
```

## Monitoring and Maintenance

### Health Check Queries

```sql
-- Family system health check
SELECT
  'family_members' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active THEN 1 END) as active_members,
  COUNT(CASE WHEN emergency_contact THEN 1 END) as emergency_contacts
FROM family_members
WHERE family_owner_id = $1;

-- Invitation expiry check
SELECT
  COUNT(*) as pending_invitations,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_pending
FROM family_invitations
WHERE sender_id = $1 AND status = 'pending';

-- Emergency request status
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (responded_at - requested_at))/3600) as avg_response_hours
FROM emergency_access_requests
WHERE owner_id = $1
  AND requested_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

This schema provides a robust foundation for the Family Collaboration System with comprehensive security, performance optimizations, and audit capabilities.
