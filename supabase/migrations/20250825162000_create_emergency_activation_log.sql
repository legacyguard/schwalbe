-- Create Family Shield activation log table for audit trail
CREATE TABLE family_shield_activation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  activation_type VARCHAR(20) NOT NULL CHECK (activation_type IN ('inactivity_detected', 'manual_guardian', 'admin_override')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  verification_token UUID DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  guardian_email TEXT,
  guardian_name TEXT,
  notes TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS (Row Level Security)
ALTER TABLE family_shield_activation_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activation logs
CREATE POLICY "Users can view own activation logs" ON family_shield_activation_log
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only system can insert activation logs (no direct user insert)
CREATE POLICY "System can insert activation logs" ON family_shield_activation_log
  FOR INSERT WITH CHECK (false); -- Will be bypassed by service role

-- Policy: System can update activation logs (no direct user update)
CREATE POLICY "System can update activation logs" ON family_shield_activation_log
  FOR UPDATE USING (false); -- Will be bypassed by service role

-- Add indexes for performance and queries
CREATE INDEX idx_activation_log_user_id ON family_shield_activation_log(user_id);
CREATE INDEX idx_activation_log_guardian_id ON family_shield_activation_log(guardian_id);
CREATE INDEX idx_activation_log_status ON family_shield_activation_log(status);
CREATE INDEX idx_activation_log_token ON family_shield_activation_log(verification_token) WHERE status = 'pending';
CREATE INDEX idx_activation_log_created_at ON family_shield_activation_log(created_at);
CREATE INDEX idx_activation_log_expires ON family_shield_activation_log(token_expires_at) WHERE status = 'pending';

-- Create function to automatically expire old tokens
CREATE OR REPLACE FUNCTION expire_old_activation_tokens()
RETURNS void AS $$
BEGIN
  UPDATE family_shield_activation_log 
  SET 
    status = 'expired',
    expired_at = NOW()
  WHERE 
    status = 'pending' 
    AND token_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE family_shield_activation_log IS 'Audit log for Family Shield activation attempts';
COMMENT ON COLUMN family_shield_activation_log.user_id IS 'User whose protocol is being activated';
COMMENT ON COLUMN family_shield_activation_log.guardian_id IS 'Guardian who initiated the activation (if applicable)';
COMMENT ON COLUMN family_shield_activation_log.activation_type IS 'How the activation was triggered';
COMMENT ON COLUMN family_shield_activation_log.status IS 'Current status of the activation request';
COMMENT ON COLUMN family_shield_activation_log.verification_token IS 'Unique token for verifying the activation';
COMMENT ON COLUMN family_shield_activation_log.token_expires_at IS 'When the verification token expires';
COMMENT ON COLUMN family_shield_activation_log.guardian_email IS 'Email of guardian who initiated (for audit)';
COMMENT ON COLUMN family_shield_activation_log.guardian_name IS 'Name of guardian who initiated (for audit)';
COMMENT ON COLUMN family_shield_activation_log.notes IS 'Additional context or notes';
COMMENT ON COLUMN family_shield_activation_log.ip_address IS 'IP address of the request';
COMMENT ON COLUMN family_shield_activation_log.user_agent IS 'User agent of the request';
