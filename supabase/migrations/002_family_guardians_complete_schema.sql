-- Family Members and Guardians Complete Schema
-- This migration creates comprehensive tables for family management and guardian system

-- Family Members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'sibling', 'guardian', 'friend', 'other')),
  protection_status TEXT DEFAULT 'unprotected' CHECK (protection_status IN ('protected', 'partial', 'unprotected', 'pending')),
  is_emergency_contact BOOLEAN DEFAULT false,
  is_guardian BOOLEAN DEFAULT false,
  date_of_birth DATE,
  address JSONB, -- {street, city, country, postal_code}
  notes TEXT,
  avatar_url TEXT,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardians table with detailed permissions
CREATE TABLE IF NOT EXISTS guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  guardian_user_id UUID REFERENCES auth.users(id), -- If guardian has account
  permissions JSONB DEFAULT '[]'::jsonb, -- Array of permission objects
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'accepted', 'active', 'inactive', 'declined')),
  emergency_priority INTEGER DEFAULT 1 CHECK (emergency_priority >= 1 AND emergency_priority <= 10),
  can_access_documents BOOLEAN DEFAULT false,
  can_emergency_activate BOOLEAN DEFAULT false,
  can_manage_family BOOLEAN DEFAULT false,
  can_view_finances BOOLEAN DEFAULT false,
  can_make_medical_decisions BOOLEAN DEFAULT false,
  invitation_token TEXT UNIQUE,
  invitation_sent_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  emergency_contact_info JSONB, -- {preferred_method, backup_phone, backup_email}
  trust_level INTEGER DEFAULT 1 CHECK (trust_level >= 1 AND trust_level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardian permissions tracking
CREATE TABLE IF NOT EXISTS guardian_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('document_access', 'emergency_activation', 'family_management', 'financial_overview', 'medical_decisions', 'communication', 'legal_actions')),
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  conditions JSONB, -- Special conditions for permission
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts (separate from guardians)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL,
  priority_order INTEGER DEFAULT 1,
  contact_method_preference TEXT DEFAULT 'phone' CHECK (contact_method_preference IN ('phone', 'email', 'sms', 'both')),
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_medical_contact BOOLEAN DEFAULT false,
  is_financial_contact BOOLEAN DEFAULT false,
  is_legal_contact BOOLEAN DEFAULT false,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family protection metrics for analytics
CREATE TABLE IF NOT EXISTS family_protection_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_family_members INTEGER DEFAULT 0,
  protected_members INTEGER DEFAULT 0,
  active_guardians INTEGER DEFAULT 0,
  emergency_contacts_count INTEGER DEFAULT 0,
  protection_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100 score
  last_family_activity_at TIMESTAMPTZ,
  completion_milestones JSONB DEFAULT '[]'::jsonb,
  risk_assessment JSONB, -- Risk factors and recommendations
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family invitations system
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  invitation_type TEXT NOT NULL CHECK (invitation_type IN ('family_member', 'guardian', 'emergency_contact')),
  role_details JSONB, -- Role-specific configuration
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship ON family_members(relationship);
CREATE INDEX IF NOT EXISTS idx_family_members_protection_status ON family_members(protection_status);
CREATE INDEX IF NOT EXISTS idx_family_members_is_guardian ON family_members(is_guardian);
CREATE INDEX IF NOT EXISTS idx_family_members_is_emergency_contact ON family_members(is_emergency_contact);

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_family_member_id ON guardians(family_member_id);
CREATE INDEX IF NOT EXISTS idx_guardians_status ON guardians(status);
CREATE INDEX IF NOT EXISTS idx_guardians_emergency_priority ON guardians(emergency_priority);
CREATE INDEX IF NOT EXISTS idx_guardians_guardian_user_id ON guardians(guardian_user_id);

CREATE INDEX IF NOT EXISTS idx_guardian_permissions_guardian_id ON guardian_permissions(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_permissions_type ON guardian_permissions(permission_type);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON emergency_contacts(priority_order);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);

CREATE INDEX IF NOT EXISTS idx_family_protection_metrics_user_id ON family_protection_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_family_invitations_inviter ON family_invitations(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);

-- RLS (Row Level Security) policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_protection_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Family members policies
DROP POLICY IF EXISTS "Users can view own family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert own family members" ON family_members;
DROP POLICY IF EXISTS "Users can update own family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete own family members" ON family_members;
DROP POLICY IF EXISTS "Guardians can view family members they guard" ON family_members;

CREATE POLICY "Users can view own family members" ON family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family members" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family members" ON family_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family members" ON family_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Guardians can view family members they guard" ON family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guardians g
      WHERE g.guardian_user_id = auth.uid()
      AND g.family_member_id = family_members.id
      AND g.status = 'active'
    )
  );

-- Guardians policies
DROP POLICY IF EXISTS "Users can view own guardians" ON guardians;
DROP POLICY IF EXISTS "Users can insert own guardians" ON guardians;
DROP POLICY IF EXISTS "Users can update own guardians" ON guardians;
DROP POLICY IF EXISTS "Users can delete own guardians" ON guardians;
DROP POLICY IF EXISTS "Guardian users can view their guardian records" ON guardians;

CREATE POLICY "Users can view own guardians" ON guardians
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guardians" ON guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guardians" ON guardians
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own guardians" ON guardians
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Guardian users can view their guardian records" ON guardians
  FOR SELECT USING (auth.uid() = guardian_user_id);

-- Guardian permissions policies
DROP POLICY IF EXISTS "Users can view guardian permissions for their guardians" ON guardian_permissions;
DROP POLICY IF EXISTS "Users can manage guardian permissions" ON guardian_permissions;

CREATE POLICY "Users can view guardian permissions for their guardians" ON guardian_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guardians g
      WHERE g.id = guardian_permissions.guardian_id
      AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage guardian permissions" ON guardian_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guardians g
      WHERE g.id = guardian_permissions.guardian_id
      AND g.user_id = auth.uid()
    )
  );

-- Emergency contacts policies
DROP POLICY IF EXISTS "Users can manage own emergency contacts" ON emergency_contacts;

CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Family protection metrics policies
DROP POLICY IF EXISTS "Users can view own family metrics" ON family_protection_metrics;

CREATE POLICY "Users can view own family metrics" ON family_protection_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Family invitations policies
DROP POLICY IF EXISTS "Users can manage invitations they sent" ON family_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON family_invitations;

CREATE POLICY "Users can manage invitations they sent" ON family_invitations
  FOR ALL USING (auth.uid() = inviter_user_id);

CREATE POLICY "Users can view invitations sent to them" ON family_invitations
  FOR SELECT USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guardians_updated_at ON guardians;
CREATE TRIGGER update_guardians_updated_at
  BEFORE UPDATE ON guardians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update family protection metrics
CREATE OR REPLACE FUNCTION calculate_family_protection_score(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_members INTEGER;
  protected_members INTEGER;
  active_guardians INTEGER;
  emergency_contacts INTEGER;
  score DECIMAL;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO total_members
  FROM family_members
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO protected_members
  FROM family_members
  WHERE user_id = p_user_id AND protection_status = 'protected';

  SELECT COUNT(*) INTO active_guardians
  FROM guardians
  WHERE user_id = p_user_id AND status = 'active';

  SELECT COUNT(*) INTO emergency_contacts
  FROM emergency_contacts
  WHERE user_id = p_user_id;

  -- Calculate protection score (0-100)
  score := 0;

  -- Base score for having family members (20 points)
  IF total_members > 0 THEN
    score := score + 20;
  END IF;

  -- Protection coverage (40 points max)
  IF total_members > 0 THEN
    score := score + (protected_members::DECIMAL / total_members * 40);
  END IF;

  -- Guardian coverage (25 points max)
  IF active_guardians >= 2 THEN
    score := score + 25;
  ELSIF active_guardians = 1 THEN
    score := score + 15;
  END IF;

  -- Emergency contacts (15 points max)
  IF emergency_contacts >= 3 THEN
    score := score + 15;
  ELSIF emergency_contacts >= 1 THEN
    score := score + (emergency_contacts * 5);
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update family metrics
CREATE OR REPLACE FUNCTION update_family_protection_metrics(p_user_id UUID)
RETURNS void AS $$
DECLARE
  metric_record family_protection_metrics%ROWTYPE;
BEGIN
  -- Calculate current metrics
  SELECT
    p_user_id,
    (SELECT COUNT(*) FROM family_members WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM family_members WHERE user_id = p_user_id AND protection_status = 'protected'),
    (SELECT COUNT(*) FROM guardians WHERE user_id = p_user_id AND status = 'active'),
    (SELECT COUNT(*) FROM emergency_contacts WHERE user_id = p_user_id),
    calculate_family_protection_score(p_user_id),
    (SELECT MAX(last_activity_at) FROM family_members WHERE user_id = p_user_id),
    '[]'::jsonb,
    NULL,
    NOW(),
    NOW()
  INTO
    metric_record.user_id,
    metric_record.total_family_members,
    metric_record.protected_members,
    metric_record.active_guardians,
    metric_record.emergency_contacts_count,
    metric_record.protection_score,
    metric_record.last_family_activity_at,
    metric_record.completion_milestones,
    metric_record.risk_assessment,
    metric_record.calculated_at,
    metric_record.created_at;

  -- Upsert metrics
  INSERT INTO family_protection_metrics (
    user_id, total_family_members, protected_members, active_guardians,
    emergency_contacts_count, protection_score, last_family_activity_at,
    completion_milestones, risk_assessment, calculated_at, created_at
  ) VALUES (
    metric_record.user_id, metric_record.total_family_members, metric_record.protected_members,
    metric_record.active_guardians, metric_record.emergency_contacts_count, metric_record.protection_score,
    metric_record.last_family_activity_at, metric_record.completion_milestones, metric_record.risk_assessment,
    metric_record.calculated_at, metric_record.created_at
  ) ON CONFLICT (user_id) DO UPDATE SET
    total_family_members = EXCLUDED.total_family_members,
    protected_members = EXCLUDED.protected_members,
    active_guardians = EXCLUDED.active_guardians,
    emergency_contacts_count = EXCLUDED.emergency_contacts_count,
    protection_score = EXCLUDED.protection_score,
    last_family_activity_at = EXCLUDED.last_family_activity_at,
    calculated_at = EXCLUDED.calculated_at;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update metrics when family data changes
CREATE OR REPLACE FUNCTION trigger_update_family_metrics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_family_protection_metrics(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS family_members_metrics_trigger ON family_members;
CREATE TRIGGER family_members_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON family_members
  FOR EACH ROW EXECUTE FUNCTION trigger_update_family_metrics();

DROP TRIGGER IF EXISTS guardians_metrics_trigger ON guardians;
CREATE TRIGGER guardians_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON guardians
  FOR EACH ROW EXECUTE FUNCTION trigger_update_family_metrics();

DROP TRIGGER IF EXISTS emergency_contacts_metrics_trigger ON emergency_contacts;
CREATE TRIGGER emergency_contacts_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION trigger_update_family_metrics();

-- Add comments for documentation
COMMENT ON TABLE family_members IS 'Family members with their protection status and relationships';
COMMENT ON TABLE guardians IS 'Guardian assignments with detailed permissions and emergency priorities';
COMMENT ON TABLE guardian_permissions IS 'Granular permission tracking for guardians';
COMMENT ON TABLE emergency_contacts IS 'Emergency contact information separate from family tree';
COMMENT ON TABLE family_protection_metrics IS 'Real-time calculated family protection analytics';
COMMENT ON TABLE family_invitations IS 'Family invitation system for onboarding new members and guardians';

COMMENT ON COLUMN family_members.protection_status IS 'Current protection level: protected, partial, unprotected, pending';
COMMENT ON COLUMN guardians.emergency_priority IS 'Priority order for emergency activation (1 = highest priority)';
COMMENT ON COLUMN guardians.trust_level IS 'Trust level from 1-5 (5 = highest trust)';
COMMENT ON COLUMN family_protection_metrics.protection_score IS 'Calculated protection score from 0-100 based on family coverage';