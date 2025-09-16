-- =================================================================
-- Migration: Create privacy-preserving hashed search index
-- Timestamp: 2025-09-15 11:05:00 UTC
-- Notes:
-- - Stores only hashed tokens (HMAC-SHA256 with server-side salt)
-- - No plaintext terms are stored in the database
-- - RLS enforces that only document owners can read; writes limited to service_role
-- =================================================================

-- Ensure required extensions and helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app;

-- Clerk-aware external id helper (must already exist but we ensure it)
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- User auth mapping helper (pass-through for Clerk external ID)
CREATE OR REPLACE FUNCTION public.user_auth(clerk_id TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT clerk_id
$$;

-- hashed index table
CREATE TABLE IF NOT EXISTS public.hashed_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  tf INT2 NOT NULL,
  positions SMALLINT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hashed_tokens_hash_idx ON public.hashed_tokens (hash);
CREATE INDEX IF NOT EXISTS hashed_tokens_doc_id_idx ON public.hashed_tokens (doc_id);

ALTER TABLE public.hashed_tokens ENABLE ROW LEVEL SECURITY;

-- Read: only the document owner (via app.current_external_id() -> public.user_auth)
DROP POLICY IF EXISTS "hashed_tokens_select_owner" ON public.hashed_tokens;
DO $$
DECLARE v_type text;
BEGIN
  SELECT data_type INTO v_type FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='user_id';
  IF v_type = 'uuid' THEN
    EXECUTE $POLICY$
      CREATE POLICY "hashed_tokens_select_owner"
      ON public.hashed_tokens FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = hashed_tokens.doc_id AND d.user_id = auth.uid()
        )
      )
    $POLICY$;
  ELSE
    EXECUTE $POLICY$
      CREATE POLICY "hashed_tokens_select_owner"
      ON public.hashed_tokens FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = hashed_tokens.doc_id AND d.user_id = app.current_external_id()
        )
      )
    $POLICY$;
  END IF;
END$$;

-- Writes: only service role (server contexts)
DROP POLICY IF EXISTS "hashed_tokens_insert_service_role" ON public.hashed_tokens;
CREATE POLICY "hashed_tokens_insert_service_role"
ON public.hashed_tokens
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "hashed_tokens_update_service_role" ON public.hashed_tokens;
CREATE POLICY "hashed_tokens_update_service_role"
ON public.hashed_tokens
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "hashed_tokens_delete_service_role" ON public.hashed_tokens;
CREATE POLICY "hashed_tokens_delete_service_role"
ON public.hashed_tokens
FOR DELETE
TO public
USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE public.hashed_tokens IS 'Privacy-preserving search index: hashed tokens per document (no plaintext terms).';
COMMENT ON COLUMN public.hashed_tokens.hash IS 'HMAC-SHA256(token, SALT) hex-encoded. SALT is server-only secret.';
COMMENT ON COLUMN public.hashed_tokens.tf IS 'Token frequency (term frequency) within the document.';
COMMENT ON COLUMN public.hashed_tokens.positions IS 'Token positions (word indexes) within the document.';
