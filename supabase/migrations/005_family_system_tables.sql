-- Family System Database Schema
-- Tables for family member management, invitations, and emergency access

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'co_owner', 'collaborator', 'viewer', 'emergency_contact')),
    relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'parent', 'child', 'sibling', 'grandparent', 'grandchild', 'aunt_uncle', 'cousin', 'friend', 'professional', 'other')),
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    date_of_birth DATE,
    emergency_contact BOOLEAN DEFAULT false,
    access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'admin')),
    preferences JSONB DEFAULT '{}'::jsonb,
    trusted_devices JSONB DEFAULT '[]'::jsonb,
    emergency_access_enabled BOOLEAN DEFAULT false,
    avatar_url TEXT,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(family_owner_id, email)
);

-- Family Invitations Table
CREATE TABLE IF NOT EXISTS family_invitations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Emergency Access Requests Table
CREATE TABLE IF NOT EXISTS emergency_access_requests (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    requested_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    responded_at TIMESTAMPTZ,
    approver_name TEXT,
    approver_relation TEXT,
    access_granted_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Document Shares Table (for family document sharing)
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email TEXT,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
    shared_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT document_shares_recipient_check 
    CHECK (shared_with_id IS NOT NULL OR shared_with_email IS NOT NULL OR family_member_id IS NOT NULL)
);

-- Family Activity Log Table
CREATE TABLE IF NOT EXISTS family_activity_log (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'member_added', 'member_removed', 'member_updated', 'invitation_sent', 
        'invitation_accepted', 'document_shared', 'document_accessed', 
        'emergency_access_requested', 'emergency_access_granted', 'role_changed'
    )),
    target_type TEXT CHECK (target_type IN ('family_member', 'document', 'invitation', 'emergency_request')),
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Family Communication Events Table (for calendar/scheduling)
CREATE TABLE IF NOT EXISTS family_calendar_events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'reminder' CHECK (event_type IN ('reminder', 'review', 'meeting', 'deadline', 'celebration')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    attendees JSONB DEFAULT '[]'::jsonb, -- Array of family member IDs
    location TEXT,
    meeting_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_end_date DATE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    reminders JSONB DEFAULT '[]'::jsonb, -- Array of reminder settings
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_owner_id ON family_members(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON family_members(email);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);
CREATE INDEX IF NOT EXISTS idx_family_members_active ON family_members(is_active);
CREATE INDEX IF NOT EXISTS idx_family_members_emergency ON family_members(emergency_contact);

CREATE INDEX IF NOT EXISTS idx_family_invitations_sender_id ON family_invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);
CREATE INDEX IF NOT EXISTS idx_family_invitations_expires_at ON family_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_emergency_access_requests_requester ON emergency_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_emergency_access_requests_owner ON emergency_access_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_emergency_access_requests_status ON emergency_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_access_requests_expires_at ON emergency_access_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_owner_id ON document_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with_id ON document_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_family_member_id ON document_shares(family_member_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_active ON document_shares(is_active);

CREATE INDEX IF NOT EXISTS idx_family_activity_log_owner_id ON family_activity_log(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_actor_id ON family_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_action_type ON family_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_created_at ON family_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_family_calendar_events_owner_id ON family_calendar_events(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_calendar_events_scheduled_at ON family_calendar_events(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_family_calendar_events_status ON family_calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_family_calendar_events_type ON family_calendar_events(event_type);

-- Row Level Security Policies

-- Family Members RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family owners can manage their family members" ON family_members 
    FOR ALL USING (auth.uid() = family_owner_id);
CREATE POLICY "Family members can view other members in their family" ON family_members 
    FOR SELECT USING (
        user_id = auth.uid() OR 
        family_owner_id IN (
            SELECT family_owner_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Family Invitations RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Senders can manage their invitations" ON family_invitations 
    FOR ALL USING (auth.uid() = sender_id);
CREATE POLICY "Anyone can accept invitations with valid token" ON family_invitations 
    FOR UPDATE USING (status = 'pending' AND expires_at > now());

-- Emergency Access Requests RLS
ALTER TABLE emergency_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own emergency requests" ON emergency_access_requests 
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create emergency access requests" ON emergency_access_requests 
    FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Owners can respond to emergency requests" ON emergency_access_requests 
    FOR UPDATE USING (auth.uid() = owner_id);

-- Document Shares RLS
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Document owners can manage shares" ON document_shares 
    FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Shared users can view their shares" ON document_shares 
    FOR SELECT USING (
        auth.uid() = shared_with_id OR 
        shared_with_email IN (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Family Activity Log RLS
ALTER TABLE family_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family owners can view their family activity" ON family_activity_log 
    FOR SELECT USING (auth.uid() = family_owner_id);
CREATE POLICY "System can insert family activity" ON family_activity_log 
    FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- Family Calendar Events RLS
ALTER TABLE family_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family owners can manage their calendar events" ON family_calendar_events 
    FOR ALL USING (auth.uid() = family_owner_id);
CREATE POLICY "Family members can view calendar events" ON family_calendar_events 
    FOR SELECT USING (
        family_owner_id IN (
            SELECT family_owner_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Functions for automatic activity logging
CREATE OR REPLACE FUNCTION log_family_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO family_activity_log (
            family_owner_id, 
            actor_id, 
            action_type, 
            target_type, 
            target_id,
            details
        ) VALUES (
            NEW.family_owner_id,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN NEW.family_owner_id
                WHEN TG_TABLE_NAME = 'family_invitations' THEN NEW.sender_id
                ELSE auth.uid()
            END,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 'member_added'
                WHEN TG_TABLE_NAME = 'family_invitations' THEN 'invitation_sent'
                WHEN TG_TABLE_NAME = 'document_shares' THEN 'document_shared'
                ELSE 'unknown_action'
            END,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 'family_member'
                WHEN TG_TABLE_NAME = 'family_invitations' THEN 'invitation'
                WHEN TG_TABLE_NAME = 'document_shares' THEN 'document'
                ELSE 'unknown'
            END,
            NEW.id,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 
                    jsonb_build_object('name', NEW.name, 'role', NEW.role, 'relationship', NEW.relationship)
                WHEN TG_TABLE_NAME = 'family_invitations' THEN 
                    jsonb_build_object('email', NEW.email)
                WHEN TG_TABLE_NAME = 'document_shares' THEN 
                    jsonb_build_object('document_id', NEW.document_id, 'permission', NEW.permission_level)
                ELSE '{}'::jsonb
            END
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log specific update actions
        IF TG_TABLE_NAME = 'family_invitations' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
            INSERT INTO family_activity_log (
                family_owner_id, 
                actor_id, 
                action_type, 
                target_type, 
                target_id,
                details
            ) VALUES (
                (SELECT sender_id FROM family_invitations WHERE id = NEW.id),
                auth.uid(),
                'invitation_accepted',
                'invitation',
                NEW.id,
                jsonb_build_object('email', NEW.email)
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO family_activity_log (
            family_owner_id, 
            actor_id, 
            action_type, 
            target_type, 
            target_id,
            details
        ) VALUES (
            OLD.family_owner_id,
            auth.uid(),
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 'member_removed'
                ELSE 'unknown_action'
            END,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 'family_member'
                ELSE 'unknown'
            END,
            OLD.id,
            CASE 
                WHEN TG_TABLE_NAME = 'family_members' THEN 
                    jsonb_build_object('name', OLD.name, 'role', OLD.role)
                ELSE '{}'::jsonb
            END
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic activity logging
DROP TRIGGER IF EXISTS family_members_activity_trigger ON family_members;
CREATE TRIGGER family_members_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON family_members
    FOR EACH ROW EXECUTE FUNCTION log_family_activity();

DROP TRIGGER IF EXISTS family_invitations_activity_trigger ON family_invitations;
CREATE TRIGGER family_invitations_activity_trigger
    AFTER INSERT OR UPDATE ON family_invitations
    FOR EACH ROW EXECUTE FUNCTION log_family_activity();

DROP TRIGGER IF EXISTS document_shares_activity_trigger ON document_shares;
CREATE TRIGGER document_shares_activity_trigger
    AFTER INSERT ON document_shares
    FOR EACH ROW EXECUTE FUNCTION log_family_activity();

-- Function to clean up expired invitations and access requests
CREATE OR REPLACE FUNCTION cleanup_expired_family_data()
RETURNS void AS $$
BEGIN
    -- Mark expired invitations
    UPDATE family_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < now();
    
    -- Mark expired emergency access requests
    UPDATE emergency_access_requests 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < now();
    
    -- Remove expired document shares
    DELETE FROM document_shares 
    WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a periodic job to clean up expired data (requires pg_cron extension)
-- This would typically be set up in production
-- SELECT cron.schedule('cleanup-expired-family-data', '0 2 * * *', 'SELECT cleanup_expired_family_data();');