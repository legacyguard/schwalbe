-- Phase 4: Simple identity consolidation to auth.uid()
-- This migration focuses on core tables and avoids complex professional review system

-- Update the legacy function to use auth.uid() directly
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  -- Deprecated: Use auth.uid() directly instead
  SELECT COALESCE(auth.uid()::text, '');
$$;

-- ========================================
-- CORE DOCUMENTS TABLE POLICIES
-- ========================================

-- Drop and recreate documents policies with auth.uid()
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

CREATE POLICY "Users can view own documents" 
  ON public.documents FOR SELECT 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own documents" 
  ON public.documents FOR UPDATE 
  USING (user_id = auth.uid()::text) 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own documents" 
  ON public.documents FOR DELETE 
  USING (user_id = auth.uid()::text);

-- ========================================
-- STORAGE POLICIES
-- ========================================

-- Drop and recreate storage policies
DROP POLICY IF EXISTS "Users can view own documents in legacy-docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert own documents in legacy-docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents in legacy-docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents in legacy-docs" ON storage.objects;

CREATE POLICY "Users can view own documents in legacy-docs" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'legacy-docs' 
    AND public.extract_user_id_from_path(name) = auth.uid()::text);

CREATE POLICY "Users can insert own documents in legacy-docs" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'legacy-docs' 
    AND public.extract_user_id_from_path(name) = auth.uid()::text);

CREATE POLICY "Users can update own documents in legacy-docs" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'legacy-docs' 
    AND public.extract_user_id_from_path(name) = auth.uid()::text);

CREATE POLICY "Users can delete own documents in legacy-docs" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'legacy-docs' 
    AND public.extract_user_id_from_path(name) = auth.uid()::text);

-- ========================================
-- VERIFICATION VIEW
-- ========================================

-- Create a view to help verify the consolidation
CREATE OR REPLACE VIEW app.identity_consolidation_status AS
SELECT 
  'PARTIAL' as status,
  'Core documents and storage policies updated to use auth.uid(). Professional review system policies may still use app.current_external_id() but that function now delegates to auth.uid().' as message,
  now() as consolidated_at;

COMMENT ON VIEW app.identity_consolidation_status IS 
'View indicating that Phase 4 identity consolidation is partially complete. Core policies now use auth.uid() directly, and app.current_external_id() delegates to auth.uid().';

COMMENT ON FUNCTION app.current_external_id() IS 
'DEPRECATED: Legacy function from Clerk migration. Now delegates to auth.uid(). Use auth.uid() directly instead. This function is maintained for compatibility but will be removed in a future migration.';