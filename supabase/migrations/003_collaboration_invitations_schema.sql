-- Collaboration Invitations Schema
-- This migration adds tables for family collaboration invitation system

-- Collaboration invitations table
CREATE TABLE IF NOT EXISTS collaboration_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_name TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_phone TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'guardian', 'friend', 'other')),
  message TEXT,
  permissions JSONB NOT NULL DEFAULT '{
    "can_access_documents": false,
    "can_emergency_activate": false,
    "can_manage_family": false,
    "can_view_finances": false,
    "can_make_medical_decisions": false
  }'::jsonb,
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitation responses and tracking
CREATE TABLE IF NOT EXISTS invitation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES collaboration_invitations(id) ON DELETE CASCADE,
  responder_ip TEXT,
  responder_user_agent TEXT,
  response_type TEXT NOT NULL CHECK (response_type IN ('accepted', 'declined', 'viewed')),
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family sharing permissions - detailed permission tracking
CREATE TABLE IF NOT EXISTS family_sharing_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'document_access', 'emergency_activation', 'family_management',
    'financial_view', 'medical_decisions', 'profile_edit', 'invite_others'
  )),
  resource_id UUID, -- Specific resource if applicable (document_id, etc.)
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  conditions JSONB DEFAULT '{}'::jsonb, -- Special conditions
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate permissions
  UNIQUE(user_id, shared_with_user_id, permission_type, resource_id)
);

-- Family collaboration activity log
CREATE TABLE IF NOT EXISTS family_collaboration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'invitation_sent', 'invitation_accepted', 'invitation_declined',
    'permission_granted', 'permission_revoked', 'family_member_added',
    'family_member_removed', 'guardian_activated', 'emergency_triggered'
  )),
  target_user_id UUID REFERENCES auth.users(id),
  target_resource_id UUID,
  action_details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_token ON collaboration_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invitee_email ON collaboration_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_inviter_status ON collaboration_invitations(inviter_id, status);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_expires_at ON collaboration_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_family_sharing_permissions_user_shared ON family_sharing_permissions(user_id, shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_family_sharing_permissions_active ON family_sharing_permissions(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_family_collaboration_log_user_action ON family_collaboration_log(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_family_collaboration_log_created_at ON family_collaboration_log(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_sharing_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_collaboration_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaboration_invitations
CREATE POLICY "Users can view their own invitations" ON collaboration_invitations
  FOR SELECT USING (inviter_id = auth.uid());

CREATE POLICY "Users can create invitations" ON collaboration_invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can update their own invitations" ON collaboration_invitations
  FOR UPDATE USING (inviter_id = auth.uid());

CREATE POLICY "Invitees can view invitations by token" ON collaboration_invitations
  FOR SELECT USING (true); -- Public read for token-based access

-- RLS Policies for family_sharing_permissions
CREATE POLICY "Users can view permissions they granted or received" ON family_sharing_permissions
  FOR SELECT USING (user_id = auth.uid() OR shared_with_user_id = auth.uid());

CREATE POLICY "Users can create permissions for their resources" ON family_sharing_permissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update permissions they granted" ON family_sharing_permissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete permissions they granted" ON family_sharing_permissions
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for family_collaboration_log
CREATE POLICY "Users can view their own collaboration logs" ON family_collaboration_log
  FOR SELECT USING (user_id = auth.uid() OR actor_user_id = auth.uid());

CREATE POLICY "System can create collaboration logs" ON family_collaboration_log
  FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_collaboration_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_family_sharing_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamps
CREATE TRIGGER trigger_collaboration_invitations_updated_at
  BEFORE UPDATE ON collaboration_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_collaboration_invitation_updated_at();

CREATE TRIGGER trigger_family_sharing_permissions_updated_at
  BEFORE UPDATE ON family_sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_family_sharing_permissions_updated_at();

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE collaboration_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status IN ('pending', 'sent')
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log collaboration activities
CREATE OR REPLACE FUNCTION log_collaboration_activity(
  p_user_id UUID,
  p_actor_user_id UUID,
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_target_resource_id UUID DEFAULT NULL,
  p_action_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO family_collaboration_log (
    user_id, actor_user_id, action_type, target_user_id,
    target_resource_id, action_details
  )
  VALUES (
    p_user_id, p_actor_user_id, p_action_type, p_target_user_id,
    p_target_resource_id, p_action_details
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION check_family_permission(
  p_resource_owner_id UUID,
  p_requesting_user_id UUID,
  p_permission_type TEXT,
  p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN DEFAULT FALSE;
BEGIN
  -- Owner always has permission
  IF p_resource_owner_id = p_requesting_user_id THEN
    RETURN TRUE;
  END IF;

  -- Check if user has specific permission
  SELECT EXISTS(
    SELECT 1 FROM family_sharing_permissions
    WHERE user_id = p_resource_owner_id
      AND shared_with_user_id = p_requesting_user_id
      AND permission_type = p_permission_type
      AND (p_resource_id IS NULL OR resource_id = p_resource_id OR resource_id IS NULL)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- View for invitation statistics
CREATE OR REPLACE VIEW collaboration_invitation_stats AS
SELECT
  inviter_id,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_invitations,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_invitations,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_invitations,
  COUNT(*) FILTER (WHERE status = 'declined') as declined_invitations,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_invitations,
  AVG(CASE WHEN responded_at IS NOT NULL AND sent_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (responded_at - sent_at)) / 3600
      END) as avg_response_time_hours
FROM collaboration_invitations
GROUP BY inviter_id;

-- Comment on tables
COMMENT ON TABLE collaboration_invitations IS 'Stores family collaboration invitations with permissions and status tracking';
COMMENT ON TABLE invitation_responses IS 'Tracks invitation response activities and metadata';
COMMENT ON TABLE family_sharing_permissions IS 'Detailed permission management for family collaboration';
COMMENT ON TABLE family_collaboration_log IS 'Activity log for all family collaboration actions';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON collaboration_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON family_sharing_permissions TO authenticated;
GRANT SELECT, INSERT ON family_collaboration_log TO authenticated;
GRANT SELECT ON collaboration_invitation_stats TO authenticated;