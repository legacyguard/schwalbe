-- Create storage bucket for time capsules
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'time-capsules',
  'time-capsules',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['video/webm', 'video/mp4', 'audio/ogg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png']
);

-- RLS policies for time-capsules bucket
CREATE POLICY "Users can upload their own time capsule files"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'time-capsules' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own time capsule files"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'time-capsules' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own time capsule files"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'time-capsules' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own time capsule files"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'time-capsules' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for public access to delivered time capsules (with valid token)
-- This will be handled in the application logic for security
CREATE POLICY "Public access to delivered capsules with valid token"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'time-capsules'
  AND EXISTS (
    SELECT 1 FROM time_capsules tc
    WHERE tc.storage_path = name
    AND tc.is_delivered = true
  )
);

-- Create function to generate signed URL for time capsule access
CREATE OR REPLACE FUNCTION get_time_capsule_signed_url(
  capsule_token UUID,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
  capsule_record time_capsules%ROWTYPE;
  signed_url TEXT;
BEGIN
  -- Get capsule by access token
  SELECT * INTO capsule_record
  FROM time_capsules
  WHERE access_token = capsule_token
  AND is_delivered = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Note: In practice, this would call the Supabase API to generate signed URL
  -- This is a placeholder - the actual implementation would be in Edge Functions
  RETURN '/api/time-capsule-media/' || capsule_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_time_capsule_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Find files that don't have corresponding time capsule records
  FOR file_record IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'time-capsules'
    AND NOT EXISTS (
      SELECT 1 FROM time_capsules
      WHERE storage_path = name
      OR thumbnail_path = name
    )
    AND created_at < NOW() - INTERVAL '1 day' -- Only cleanup files older than 1 day
  LOOP
    -- Delete the orphaned file
    DELETE FROM storage.objects
    WHERE bucket_id = 'time-capsules' AND name = file_record.name;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION get_time_capsule_signed_url IS 'Generate signed URL for accessing delivered time capsule media';
COMMENT ON FUNCTION cleanup_orphaned_time_capsule_files IS 'Remove orphaned files from time-capsules storage bucket';