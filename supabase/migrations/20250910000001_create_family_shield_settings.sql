-- Create Family Shield settings table for Dead Man Switch configuration
-- Part of emergency protection system migration from Hollywood

CREATE TABLE family_shield_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inactivity_period_months INTEGER DEFAULT 6 CHECK (inactivity_period_months > 0),
  required_guardians_for_activation INTEGER DEFAULT 2 CHECK (required_guardians_for_activation > 0),
  is_shield_enabled BOOLEAN DEFAULT false,
  last_activity_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shield_status VARCHAR(20) DEFAULT 'inactive' CHECK (shield_status IN ('inactive', 'pending_verification', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE family_shield_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own settings
CREATE POLICY "Users can view own shield settings" ON family_shield_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own shield settings" ON family_shield_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own shield settings" ON family_shield_settings
  FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_shield_settings_user_id ON family_shield_settings(user_id);
CREATE INDEX idx_shield_settings_status ON family_shield_settings(shield_status);
CREATE INDEX idx_shield_settings_activity_check ON family_shield_settings(last_activity_check) 
WHERE shield_status = 'inactive';

-- Ensure one settings record per user
CREATE UNIQUE INDEX idx_shield_settings_user_unique ON family_shield_settings(user_id);

-- Add updated_at trigger
CREATE TRIGGER update_shield_settings_updated_at 
  BEFORE UPDATE ON family_shield_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE family_shield_settings IS 'User-specific Family Shield configuration for Dead Man Switch system';
COMMENT ON COLUMN family_shield_settings.user_id IS 'Reference to the user who owns these settings';
COMMENT ON COLUMN family_shield_settings.inactivity_period_months IS 'Months of inactivity before shield verification begins';
COMMENT ON COLUMN family_shield_settings.required_guardians_for_activation IS 'Number of guardians needed to manually activate Family Shield';
COMMENT ON COLUMN family_shield_settings.is_shield_enabled IS 'Whether the Family Shield is enabled';
COMMENT ON COLUMN family_shield_settings.last_activity_check IS 'Last time user activity was checked';
COMMENT ON COLUMN family_shield_settings.shield_status IS 'Current status of the shield (inactive, pending_verification, active)';
