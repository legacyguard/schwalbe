-- Create Time Capsule system for Family Shield
-- Personal video/audio messages delivered at specific times or after death

CREATE TYPE delivery_condition AS ENUM ('ON_DATE', 'ON_DEATH');
CREATE TYPE capsule_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'CANCELLED');

CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  delivery_condition delivery_condition NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE,
  message_title TEXT NOT NULL,
  message_preview TEXT, -- Brief preview text for the recipient
  storage_path TEXT NOT NULL, -- Path to video/audio file in Supabase Storage
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio')),
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  thumbnail_path TEXT, -- For video thumbnails
  access_token UUID DEFAULT gen_random_uuid(), -- Secure token for recipient access
  status capsule_status DEFAULT 'PENDING',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_attempt TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT, -- Store any delivery error messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own time capsules
CREATE POLICY "Users can view own time capsules" ON time_capsules
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own time capsules
CREATE POLICY "Users can insert own time capsules" ON time_capsules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own time capsules (before delivery)
CREATE POLICY "Users can update own time capsules" ON time_capsules
  FOR UPDATE USING (auth.uid() = user_id AND is_delivered = false);

-- Policy: Users can delete their own time capsules (before delivery)
CREATE POLICY "Users can delete own time capsules" ON time_capsules
  FOR DELETE USING (auth.uid() = user_id AND is_delivered = false);

-- Policy: Allow public access for recipients with valid access token (for viewing)
CREATE POLICY "Public access with valid token" ON time_capsules
  FOR SELECT USING (true); -- Will be restricted by access_token in application logic

-- Add indexes for performance
CREATE INDEX idx_time_capsules_user_id ON time_capsules(user_id);
CREATE INDEX idx_time_capsules_delivery_date ON time_capsules(delivery_date) WHERE delivery_condition = 'ON_DATE' AND is_delivered = false;
CREATE INDEX idx_time_capsules_death_condition ON time_capsules(user_id, delivery_condition) WHERE delivery_condition = 'ON_DEATH' AND is_delivered = false;
CREATE INDEX idx_time_capsules_access_token ON time_capsules(access_token) WHERE is_delivered = true;
CREATE INDEX idx_time_capsules_status ON time_capsules(status, created_at);
CREATE INDEX idx_time_capsules_recipient ON time_capsules(recipient_email, is_delivered);

-- Add updated_at trigger
CREATE TRIGGER update_time_capsules_updated_at 
  BEFORE UPDATE ON time_capsules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get capsules ready for delivery
CREATE OR REPLACE FUNCTION get_time_capsules_ready_for_delivery()
RETURNS TABLE(
  capsule_id UUID,
  user_id UUID,
  recipient_name TEXT,
  recipient_email TEXT,
  message_title TEXT,
  access_token UUID,
  delivery_condition delivery_condition
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id as capsule_id,
    tc.user_id,
    tc.recipient_name,
    tc.recipient_email,
    tc.message_title,
    tc.access_token,
    tc.delivery_condition
  FROM time_capsules tc
  WHERE 
    tc.is_delivered = false 
    AND tc.status = 'PENDING'
    AND (
      (tc.delivery_condition = 'ON_DATE' AND tc.delivery_date <= NOW())
      OR (tc.delivery_condition = 'ON_DEATH' AND EXISTS (
        SELECT 1 FROM family_shield_activation_log fsal 
        WHERE fsal.user_id = tc.user_id 
        AND fsal.status = 'confirmed'
      ))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark capsule as delivered
CREATE OR REPLACE FUNCTION mark_capsule_delivered(capsule_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE time_capsules 
  SET 
    is_delivered = true,
    delivered_at = NOW(),
    status = 'DELIVERED',
    updated_at = NOW()
  WHERE id = capsule_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment delivery attempts
CREATE OR REPLACE FUNCTION increment_delivery_attempt(
  capsule_uuid UUID, 
  error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE time_capsules 
  SET 
    delivery_attempts = delivery_attempts + 1,
    last_delivery_attempt = NOW(),
    delivery_error = error_message,
    status = CASE 
      WHEN delivery_attempts >= 3 THEN 'FAILED'::capsule_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = capsule_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for time capsules (execute manually in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('time-capsules', 'time-capsules', false);

-- Add comments
COMMENT ON TABLE time_capsules IS 'Personal video/audio messages for Time Capsule feature in Family Shield';
COMMENT ON COLUMN time_capsules.user_id IS 'User who created the time capsule';
COMMENT ON COLUMN time_capsules.recipient_id IS 'Guardian ID if recipient is a registered guardian';
COMMENT ON COLUMN time_capsules.recipient_name IS 'Full name of the message recipient';
COMMENT ON COLUMN time_capsules.recipient_email IS 'Email address for delivery notification';
COMMENT ON COLUMN time_capsules.delivery_condition IS 'When the capsule should be delivered (specific date or after death)';
COMMENT ON COLUMN time_capsules.delivery_date IS 'Target delivery date (only for ON_DATE condition)';
COMMENT ON COLUMN time_capsules.message_title IS 'Title of the personal message';
COMMENT ON COLUMN time_capsules.storage_path IS 'Path to the video/audio file in Supabase Storage';
COMMENT ON COLUMN time_capsules.access_token IS 'Secure token for recipient to access the message';
COMMENT ON COLUMN time_capsules.status IS 'Current status of the time capsule delivery process';
COMMENT ON COLUMN time_capsules.is_delivered IS 'Whether the capsule has been successfully delivered';