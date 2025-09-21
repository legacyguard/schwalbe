-- =================================================================
-- MIGRÁCIA: Ensure Clerk-aware helper functions exist
-- Verzia: 2.0 - Production Ready
-- =================================================================

-- Create app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions to app schema
GRANT USAGE ON SCHEMA app TO authenticated, service_role;

-- Create or replace the helper function for Clerk user ID extraction
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION app.current_external_id() TO authenticated, service_role;

-- Vytvorenie indexu na user_id pre rýchle per-user queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id_clerk ON public.documents(user_id);

-- Komentáre pre lepšiu orientáciu
COMMENT ON TABLE public.documents IS 'Stores metadata about user-uploaded documents with Clerk authentication.';
COMMENT ON SCHEMA app IS 'Application-specific helper functions and utilities.';
COMMENT ON FUNCTION app.current_external_id() IS 'Helper function to extract Clerk user ID from JWT claims.';
COMMENT ON POLICY "Users can view their own documents" ON public.documents IS 'Ensures users can only read their own document records using Clerk JWT.';
COMMENT ON POLICY "Users can insert their own documents" ON public.documents IS 'Ensures users can only insert documents with their own Clerk user ID.';
COMMENT ON POLICY "Users can update their own documents" ON public.documents IS 'Ensures users can only update their own documents with proper validation.';
COMMENT ON POLICY "Users can delete their own documents" ON public.documents IS 'Ensures users can only delete their own documents.';
COMMENT ON INDEX idx_documents_user_id_clerk IS 'Index for fast per-user document queries using Clerk user ID.';
