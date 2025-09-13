-- =====================================================
-- Key Management System for LegacyGuard
-- =====================================================
-- This migration creates a secure key management infrastructure
-- for storing and managing user encryption keys server-side.
-- Keys are encrypted at rest and protected by RLS policies.

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS user_key_recovery CASCADE;
DROP TABLE IF EXISTS user_encryption_keys CASCADE;
DROP TABLE IF EXISTS key_rotation_history CASCADE;
DROP TABLE IF EXISTS key_access_logs CASCADE;

-- =====================================================
-- User Encryption Keys Table
-- =====================================================
-- Stores encrypted user keys with versioning support
CREATE TABLE user_encryption_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    
    -- Encrypted key material (encrypted with master key derived from user password)
    encrypted_private_key TEXT NOT NULL, -- User's private key encrypted
    public_key TEXT NOT NULL, -- Public key can be stored in plain
    
    -- Key derivation parameters
    salt TEXT NOT NULL, -- Salt for key derivation
    nonce TEXT NOT NULL, -- Nonce for encryption
    iterations INTEGER DEFAULT 100000, -- PBKDF2 iterations
    
    -- Key metadata
    key_version INTEGER DEFAULT 1,
    algorithm TEXT DEFAULT 'nacl.box',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_rotated_at TIMESTAMPTZ DEFAULT NOW(),
    rotation_count INTEGER DEFAULT 0,
    
    -- Security metadata
    is_active BOOLEAN DEFAULT true,
    is_compromised BOOLEAN DEFAULT false,
    locked_until TIMESTAMPTZ, -- For rate limiting/security lockouts
    failed_access_attempts INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Recovery setup
    recovery_enabled BOOLEAN DEFAULT false,
    recovery_method TEXT CHECK (recovery_method IN ('guardian', 'security_questions', 'backup_phrase', NULL)),
    
    -- Indexes for performance
    CONSTRAINT unique_active_key UNIQUE(user_id, is_active)
);

-- Create indexes
CREATE INDEX idx_user_keys_user_id ON user_encryption_keys(user_id);
CREATE INDEX idx_user_keys_active ON user_encryption_keys(is_active);
CREATE INDEX idx_user_keys_created ON user_encryption_keys(created_at);

-- =====================================================
-- Key Rotation History Table
-- =====================================================
-- Tracks key rotation events for audit and recovery
CREATE TABLE key_rotation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    old_key_id UUID REFERENCES user_encryption_keys(id),
    new_key_id UUID REFERENCES user_encryption_keys(id),
    rotation_reason TEXT NOT NULL,
    rotation_method TEXT CHECK (rotation_method IN ('automatic', 'manual', 'recovery', 'compromise')),
    rotated_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_by TEXT, -- User or system that initiated rotation
    metadata JSONB, -- Additional rotation context
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES user_encryption_keys(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_rotation_history_user ON key_rotation_history(user_id);
CREATE INDEX idx_rotation_history_date ON key_rotation_history(rotated_at);

-- =====================================================
-- Key Recovery Table
-- =====================================================
-- Stores recovery information for users
CREATE TABLE user_key_recovery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    
    -- Guardian-based recovery
    guardian_shares JSONB, -- Encrypted key shares for guardians
    guardian_threshold INTEGER DEFAULT 2, -- Number of guardians needed
    
    -- Security questions recovery
    security_questions JSONB, -- Encrypted questions and hashed answers
    
    -- Backup phrase recovery
    encrypted_backup_phrase TEXT, -- Encrypted mnemonic phrase
    backup_phrase_hint TEXT, -- Optional hint for user
    
    -- Recovery codes (one-time use)
    recovery_codes JSONB, -- Array of hashed recovery codes
    recovery_codes_used JSONB DEFAULT '[]'::jsonb,
    
    -- Recovery metadata
    recovery_email TEXT, -- Backup email for recovery
    recovery_phone TEXT, -- Backup phone for 2FA recovery
    last_recovery_at TIMESTAMPTZ,
    recovery_attempts INTEGER DEFAULT 0,
    max_recovery_attempts INTEGER DEFAULT 5,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES user_encryption_keys(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_recovery_user ON user_key_recovery(user_id);

-- =====================================================
-- Key Access Logs Table
-- =====================================================
-- Audit log for all key access attempts
CREATE TABLE key_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    key_id UUID REFERENCES user_encryption_keys(id),
    access_type TEXT CHECK (access_type IN ('retrieve', 'rotate', 'recover', 'generate', 'delete')),
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    
    -- Performance indexes
    FOREIGN KEY (user_id) REFERENCES user_encryption_keys(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_access_logs_user ON key_access_logs(user_id);
CREATE INDEX idx_access_logs_time ON key_access_logs(accessed_at);
CREATE INDEX idx_access_logs_type ON key_access_logs(access_type);
CREATE INDEX idx_access_logs_success ON key_access_logs(success);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Ensure helper schema/function exist
CREATE SCHEMA IF NOT EXISTS app;
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Enable RLS on all tables
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_key_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_access_logs ENABLE ROW LEVEL SECURITY;

-- User Encryption Keys Policies
-- Users can only access their own keys
CREATE POLICY "Users can view own keys"
    ON user_encryption_keys FOR SELECT
    USING (app.current_external_id() = user_id AND is_active = true AND is_compromised = false);

CREATE POLICY "Users can create own keys"
    ON user_encryption_keys FOR INSERT
    WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY "Users can update own keys"
    ON user_encryption_keys FOR UPDATE
    USING (app.current_external_id() = user_id)
    WITH CHECK (app.current_external_id() = user_id);

-- No delete policy - keys should be deactivated, not deleted

-- Key Rotation History Policies
CREATE POLICY "Users can view own rotation history"
    ON key_rotation_history FOR SELECT
    USING (app.current_external_id() = user_id);

CREATE POLICY "System can insert rotation history"
    ON key_rotation_history FOR INSERT
    WITH CHECK (true); -- Controlled by functions

-- Key Recovery Policies
CREATE POLICY "Users can view own recovery settings"
    ON user_key_recovery FOR SELECT
    USING (app.current_external_id() = user_id);

CREATE POLICY "Users can manage own recovery settings"
    ON user_key_recovery FOR ALL
    USING (app.current_external_id() = user_id)
    WITH CHECK (app.current_external_id() = user_id);

-- Key Access Logs Policies
CREATE POLICY "Users can view own access logs"
    ON key_access_logs FOR SELECT
    USING (app.current_external_id() = user_id);

CREATE POLICY "System can insert access logs"
    ON key_access_logs FOR INSERT
    WITH CHECK (true); -- Controlled by functions

-- =====================================================
-- Functions for Key Management
-- =====================================================

-- Function to safely retrieve user's active key
CREATE OR REPLACE FUNCTION get_user_active_key(p_user_id TEXT)
RETURNS TABLE (
    public_key TEXT,
    key_version INTEGER,
    algorithm TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log access attempt
    INSERT INTO key_access_logs (user_id, access_type, success, accessed_at)
    VALUES (p_user_id, 'retrieve', true, NOW());
    
    -- Return only public information
    RETURN QUERY
    SELECT 
        uek.public_key,
        uek.key_version,
        uek.algorithm
    FROM user_encryption_keys uek
    WHERE uek.user_id = p_user_id
        AND uek.is_active = true
        AND uek.is_compromised = false
        AND (uek.locked_until IS NULL OR uek.locked_until < NOW());
END;
$$;

-- Function to rotate keys
CREATE OR REPLACE FUNCTION rotate_user_key(
    p_user_id TEXT,
    p_new_encrypted_private_key TEXT,
    p_new_public_key TEXT,
    p_new_salt TEXT,
    p_new_nonce TEXT,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_key_id UUID;
    v_new_key_id UUID;
    v_new_version INTEGER;
BEGIN
    -- Get current active key
    SELECT id, key_version + 1 INTO v_old_key_id, v_new_version
    FROM user_encryption_keys
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Deactivate old key
    UPDATE user_encryption_keys
    SET is_active = false, updated_at = NOW()
    WHERE id = v_old_key_id;
    
    -- Create new key
    INSERT INTO user_encryption_keys (
        user_id, 
        encrypted_private_key, 
        public_key, 
        salt, 
        nonce,
        key_version,
        rotation_count
    ) VALUES (
        p_user_id,
        p_new_encrypted_private_key,
        p_new_public_key,
        p_new_salt,
        p_new_nonce,
        v_new_version,
        v_new_version - 1
    ) RETURNING id INTO v_new_key_id;
    
    -- Log rotation
    INSERT INTO key_rotation_history (
        user_id,
        old_key_id,
        new_key_id,
        rotation_reason,
        rotation_method,
        rotated_by
    ) VALUES (
        p_user_id,
        v_old_key_id,
        v_new_key_id,
        p_reason,
        'manual',
        p_user_id
    );
    
    -- Log access
    INSERT INTO key_access_logs (user_id, key_id, access_type, success)
    VALUES (p_user_id, v_new_key_id, 'rotate', true);
    
    RETURN v_new_key_id;
END;
$$;

-- Function to check if user needs key rotation (called periodically)
CREATE OR REPLACE FUNCTION check_key_rotation_needed(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_last_rotated TIMESTAMPTZ;
    v_rotation_count INTEGER;
BEGIN
    SELECT last_rotated_at, rotation_count
    INTO v_last_rotated, v_rotation_count
    FROM user_encryption_keys
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Rotate if:
    -- 1. Key is older than 90 days
    -- 2. Key has been used more than 1000 times (not tracked yet)
    -- 3. Key is marked as compromised
    RETURN (
        v_last_rotated < NOW() - INTERVAL '90 days'
        OR EXISTS (
            SELECT 1 FROM user_encryption_keys
            WHERE user_id = p_user_id 
                AND is_active = true 
                AND is_compromised = true
        )
    );
END;
$$;

-- Function to handle failed access attempts
CREATE OR REPLACE FUNCTION handle_failed_key_access(p_user_id TEXT, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INTEGER;
BEGIN
    -- Increment failed attempts
    UPDATE user_encryption_keys
    SET failed_access_attempts = failed_access_attempts + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id AND is_active = true
    RETURNING failed_access_attempts INTO v_attempts;
    
    -- Lock account after 5 failed attempts
    IF v_attempts >= 5 THEN
        UPDATE user_encryption_keys
        SET locked_until = NOW() + INTERVAL '15 minutes'
        WHERE user_id = p_user_id AND is_active = true;
    END IF;
    
    -- Log failed access
    INSERT INTO key_access_logs (
        user_id, 
        access_type, 
        success, 
        failure_reason
    ) VALUES (
        p_user_id, 
        'retrieve', 
        false, 
        p_reason
    );
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_encryption_keys_updated_at
    BEFORE UPDATE ON user_encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_key_recovery_updated_at
    BEFORE UPDATE ON user_key_recovery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Initial Setup and Comments
-- =====================================================

COMMENT ON TABLE user_encryption_keys IS 'Stores encrypted user keys for document encryption';
COMMENT ON TABLE key_rotation_history IS 'Audit trail for key rotation events';
COMMENT ON TABLE user_key_recovery IS 'Recovery mechanisms for lost keys';
COMMENT ON TABLE key_access_logs IS 'Audit log for all key access attempts';

COMMENT ON COLUMN user_encryption_keys.encrypted_private_key IS 'User private key encrypted with key derived from user password';
COMMENT ON COLUMN user_encryption_keys.salt IS 'Salt used for PBKDF2 key derivation';
COMMENT ON COLUMN user_encryption_keys.nonce IS 'Nonce used for authenticated encryption';

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_encryption_keys TO authenticated;
GRANT SELECT ON key_rotation_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_key_recovery TO authenticated;
GRANT SELECT, INSERT ON key_access_logs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_active_key TO authenticated;
GRANT EXECUTE ON FUNCTION rotate_user_key TO authenticated;
GRANT EXECUTE ON FUNCTION check_key_rotation_needed TO authenticated;
