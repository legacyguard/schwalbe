-- Create guardians table for trusted family members/friends
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own guardians
CREATE POLICY "Users can view own guardians" ON guardians
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own guardians
CREATE POLICY "Users can insert own guardians" ON guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own guardians
CREATE POLICY "Users can update own guardians" ON guardians
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own guardians
CREATE POLICY "Users can delete own guardians" ON guardians
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_guardians_user_id ON guardians(user_id);
CREATE INDEX idx_guardians_created_at ON guardians(created_at);
CREATE INDEX idx_guardians_active ON guardians(is_active) WHERE is_active = true;

-- Add constraints
ALTER TABLE guardians ADD CONSTRAINT guardians_email_check 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guardians_updated_at 
  BEFORE UPDATE ON guardians 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE guardians IS 'Trusted people who can help users families in emergencies';
COMMENT ON COLUMN guardians.user_id IS 'Reference to the user who owns this guardian';
COMMENT ON COLUMN guardians.name IS 'Full name of the guardian';
COMMENT ON COLUMN guardians.email IS 'Email address for contact';
COMMENT ON COLUMN guardians.phone IS 'Optional phone number for contact';
COMMENT ON COLUMN guardians.relationship IS 'Relationship to user (e.g., spouse, child, friend)';
COMMENT ON COLUMN guardians.notes IS 'Optional notes about the guardian';
COMMENT ON COLUMN guardians.is_active IS 'Whether this guardian is currently active';