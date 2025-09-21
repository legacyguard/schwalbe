-- Create Emergency Access Tokens table for Family Shield System
-- This table manages secure token-based access for guardians during emergencies

CREATE TABLE emergency_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  verification_code VARCHAR(10),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  activation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  activation_reason VARCHAR(50) NOT NULL CHECK (activation_reason IN ('manual', 'inactivity', 'health_check', 'emergency')),
  permissions JSONB NOT NULL DEFAULT '{}',
  requires_verification BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Access Logs table for comprehensive audit trail
CREATE TABLE emergency_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES emergency_access_tokens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('token_verification', 'document_download', 'manual_download', 'family_shield_activation')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for emergency access tokens
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens for security
CREATE POLICY "Service role can manage tokens" ON emergency_access_tokens
  FOR ALL USING (false); -- Service role only

-- Add RLS policies for emergency access logs  
ALTER TABLE emergency_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own access logs
CREATE POLICY "Users can view own access logs" ON emergency_access_logs
  FOR SELECT USING (user_id = auth.uid());

-- Guardians can view logs for their tokens
CREATE POLICY "Guardians can view their access logs" ON emergency_access_logs
  FOR SELECT USING (guardian_id IN (
    SELECT id FROM guardians WHERE email = auth.jwt() ->> 'email'
  ));

-- Service role can insert logs
CREATE POLICY "Service role can insert logs" ON emergency_access_logs
  FOR INSERT WITH CHECK (false); -- Service role only

-- Add indexes for performance
CREATE INDEX idx_emergency_access_tokens_token ON emergency_access_tokens(token);
CREATE INDEX idx_emergency_access_tokens_user_id ON emergency_access_tokens(user_id);
CREATE INDEX idx_emergency_access_tokens_guardian_id ON emergency_access_tokens(guardian_id);
CREATE INDEX idx_emergency_access_tokens_expires_at ON emergency_access_tokens(expires_at);
CREATE INDEX idx_emergency_access_tokens_active ON emergency_access_tokens(is_active, expires_at);

CREATE INDEX idx_emergency_access_logs_token_id ON emergency_access_logs(token_id);
CREATE INDEX idx_emergency_access_logs_user_id ON emergency_access_logs(user_id);
CREATE INDEX idx_emergency_access_logs_guardian_id ON emergency_access_logs(guardian_id);
CREATE INDEX idx_emergency_access_logs_created_at ON emergency_access_logs(created_at);
CREATE INDEX idx_emergency_access_logs_access_type ON emergency_access_logs(access_type, created_at);

-- Add trigger for updated_at column
CREATE TRIGGER update_emergency_access_tokens_updated_at 
  BEFORE UPDATE ON emergency_access_tokens 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_emergency_tokens()
RETURNS void AS $$
BEGIN
  -- Deactivate expired tokens
  UPDATE emergency_access_tokens 
  SET is_active = false,
      updated_at = NOW()
  WHERE expires_at < NOW() 
    AND is_active = true;

  -- Clean up old access logs (keep 3 years for legal compliance)
  DELETE FROM emergency_access_logs 
  WHERE created_at < NOW() - INTERVAL '3 years';
    
END;
$$ LANGUAGE plpgsql;

-- Create function to generate emergency access token
CREATE OR REPLACE FUNCTION generate_emergency_access_token(
  p_user_id UUID,
  p_guardian_id UUID,
  p_activation_reason VARCHAR(50),
  p_permissions JSONB DEFAULT '{}',
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TABLE(token_id UUID, access_token VARCHAR, verification_code VARCHAR) AS $$
DECLARE
  v_token VARCHAR(255);
  v_verification_code VARCHAR(10);
  v_token_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'base64url') || '-' || extract(epoch from now())::text;
  
  -- Generate 6-digit verification code
  v_verification_code := lpad((random() * 999999)::int::text, 6, '0');
  
  -- Set expiration date
  v_expires_at := NOW() + (p_expires_days || ' days')::interval;
  
  -- Insert token record
  INSERT INTO emergency_access_tokens (
    user_id, 
    guardian_id, 
    token, 
    verification_code,
    expires_at,
    activation_reason,
    permissions,
    requires_verification
  ) VALUES (
    p_user_id,
    p_guardian_id,
    v_token,
    v_verification_code,
    v_expires_at,
    p_activation_reason,
    p_permissions,
    true
  ) RETURNING id INTO v_token_id;
  
  -- Return token information
  RETURN QUERY SELECT v_token_id, v_token, v_verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE emergency_access_tokens IS 'Secure tokens for guardian access during Family Shield activation';
COMMENT ON TABLE emergency_access_logs IS 'Comprehensive audit trail for all emergency access activities';

COMMENT ON FUNCTION generate_emergency_access_token IS 'Securely generates emergency access tokens for guardians';
COMMENT ON FUNCTION cleanup_expired_emergency_tokens IS 'Maintenance function to clean up expired tokens and old logs';

-- Grant necessary permissions to service role
-- Note: These grants would typically be handled by Supabase automatically
-- but are included here for completeness