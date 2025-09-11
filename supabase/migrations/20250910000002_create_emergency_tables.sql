-- Create tables for Emergency Activation System (Dead Man Switch)
-- Migration from Hollywood project with adaptations for Schwalbe

-- User health checks table for activity monitoring
CREATE TABLE user_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type VARCHAR(30) NOT NULL CHECK (check_type IN ('login', 'document_access', 'api_ping', 'manual_confirmation')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('responded', 'missed', 'pending')),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_method VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency detection rules table (for configurable detection logic)
CREATE TABLE emergency_detection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('inactivity', 'health_check', 'guardian_manual', 'suspicious_activity')),
  is_enabled BOOLEAN DEFAULT true,
  trigger_conditions JSONB NOT NULL DEFAULT '[]',
  response_actions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER DEFAULT 1,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guardian notifications table
CREATE TABLE guardian_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('activation_request', 'verification_needed', 'shield_activated', 'status_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  verification_token UUID,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'push', 'all')),
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survivor access requests table
CREATE TABLE survivor_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token VARCHAR(500) NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  relationship TEXT,
  purpose TEXT NOT NULL,
  requested_access_types TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES guardians(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency access audit log
CREATE TABLE emergency_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessor_type VARCHAR(20) NOT NULL CHECK (accessor_type IN ('guardian', 'survivor', 'system', 'admin')),
  accessor_id UUID, -- Could be guardian_id or other identifier
  access_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'download', 'modify', 'delete', 'create')),
  success BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user health checks
ALTER TABLE user_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health checks" ON user_health_checks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own health checks" ON user_health_checks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add RLS policies for emergency detection rules
ALTER TABLE emergency_detection_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own detection rules" ON emergency_detection_rules
  FOR ALL USING (user_id = auth.uid());

-- Add RLS policies for guardian notifications
ALTER TABLE guardian_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guardians can view own notifications" ON guardian_notifications
  FOR SELECT USING (guardian_id IN (
    SELECT id FROM guardians WHERE user_id = auth.uid() OR id = guardian_id
  ));

CREATE POLICY "System can insert notifications" ON guardian_notifications
  FOR INSERT WITH CHECK (false); -- Service role only

CREATE POLICY "System can update notifications" ON guardian_notifications
  FOR UPDATE USING (false); -- Service role only

-- Add RLS policies for survivor access requests
ALTER TABLE survivor_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert access requests" ON survivor_access_requests
  FOR INSERT WITH CHECK (true); -- Allow public access for requests

CREATE POLICY "Guardians can view requests for their users" ON survivor_access_requests
  FOR SELECT USING (user_id IN (
    SELECT user_id FROM guardians WHERE id = auth.uid()
  ));

-- Add RLS policies for emergency access audit
ALTER TABLE emergency_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON emergency_access_audit
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON emergency_access_audit
  FOR INSERT WITH CHECK (false); -- Service role only

-- Add indexes for performance
CREATE INDEX idx_user_health_checks_user_id ON user_health_checks(user_id);
CREATE INDEX idx_user_health_checks_status ON user_health_checks(status, scheduled_at);
CREATE INDEX idx_user_health_checks_type ON user_health_checks(check_type, created_at);

CREATE INDEX idx_emergency_detection_rules_user_id ON emergency_detection_rules(user_id);
CREATE INDEX idx_emergency_detection_rules_enabled ON emergency_detection_rules(is_enabled, rule_type);

CREATE INDEX idx_guardian_notifications_guardian_id ON guardian_notifications(guardian_id);
CREATE INDEX idx_guardian_notifications_user_id ON guardian_notifications(user_id);
CREATE INDEX idx_guardian_notifications_verification_token ON guardian_notifications(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX idx_guardian_notifications_expires_at ON guardian_notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_guardian_notifications_priority ON guardian_notifications(priority, created_at);

CREATE INDEX idx_survivor_access_requests_user_id ON survivor_access_requests(user_id);
CREATE INDEX idx_survivor_access_requests_token ON survivor_access_requests(access_token);
CREATE INDEX idx_survivor_access_requests_status ON survivor_access_requests(status, expires_at);
CREATE INDEX idx_survivor_access_requests_email ON survivor_access_requests(requester_email);

CREATE INDEX idx_emergency_access_audit_user_id ON emergency_access_audit(user_id);
CREATE INDEX idx_emergency_access_audit_accessor ON emergency_access_audit(accessor_type, accessor_id);
CREATE INDEX idx_emergency_access_audit_created_at ON emergency_access_audit(created_at);

-- Add triggers for updated_at columns
CREATE TRIGGER update_emergency_detection_rules_updated_at 
  BEFORE UPDATE ON emergency_detection_rules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired notifications and requests
CREATE OR REPLACE FUNCTION cleanup_expired_emergency_data()
RETURNS void AS $$
BEGIN
  -- Mark expired notifications as failed
  UPDATE guardian_notifications 
  SET delivery_status = 'failed'
  WHERE expires_at < NOW() 
    AND delivery_status = 'pending';

  -- Mark expired access requests as expired
  UPDATE survivor_access_requests 
  SET status = 'expired'
  WHERE expires_at < NOW() 
    AND status = 'pending';
    
  -- Clean up old audit logs (keep 2 years)
  DELETE FROM emergency_access_audit 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_health_checks IS 'Health check records to monitor user activity and responsiveness';
COMMENT ON TABLE emergency_detection_rules IS 'User-configurable rules for detecting emergency situations';
COMMENT ON TABLE guardian_notifications IS 'Notifications sent to guardians for emergency activations and status updates';
COMMENT ON TABLE survivor_access_requests IS 'Requests from family members/survivors to access emergency resources';
COMMENT ON TABLE emergency_access_audit IS 'Audit trail for all emergency system access and actions';

-- Create function to initialize default emergency rules for a user
CREATE OR REPLACE FUNCTION initialize_default_emergency_rules(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO emergency_detection_rules (user_id, rule_name, description, rule_type, trigger_conditions, response_actions) VALUES
    (target_user_id, 'Extended Inactivity Detection', 'Trigger emergency when user is inactive for extended period', 'inactivity', 
     '[{"type": "time_based", "threshold_value": 180, "threshold_unit": "days", "comparison_operator": "greater_than"}]',
     '[{"type": "notify_guardians", "priority": 1, "delay_minutes": 0}]'),
    
    (target_user_id, 'Health Check Failure', 'Trigger when multiple health checks are missed', 'health_check',
     '[{"type": "activity_based", "threshold_value": 5, "threshold_unit": "attempts", "comparison_operator": "greater_than"}]',
     '[{"type": "notify_guardians", "priority": 2, "delay_minutes": 60}]'),
    
    (target_user_id, 'Guardian Manual Override', 'Allow guardians to manually trigger emergency protocol', 'guardian_manual',
     '[{"type": "guardian_based", "threshold_value": 1, "threshold_unit": "guardians", "comparison_operator": "greater_than"}]',
     '[{"type": "activate_shield", "priority": 1, "delay_minutes": 0}, {"type": "notify_guardians", "priority": 1, "delay_minutes": 0}]');
END;
$$ LANGUAGE plpgsql;
