-- =============================================================
-- Migration: Align identity mapping to Supabase Auth (auth.uid()) in RLS
-- Timestamp: 2025-09-15 16:35:00 UTC
-- Notes:
-- - Replace legacy Clerk-based helpers (app.current_external_id / public.user_auth)
--   in policies with Supabase Auth predicates using auth.uid().
-- - Keep compatibility with TEXT vs UUID user_id columns by casting to text
--   in predicates (user_id::text = auth.uid()::text).
-- - Idempotent: drops existing policies if present, then recreates.
-- - Least privilege preserved.
-- =============================================================

-- Document bundles: ensure policies use auth.uid()
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'document_bundles'
  ) THEN
    -- Ensure RLS enabled
    ALTER TABLE public.document_bundles ENABLE ROW LEVEL SECURITY;

    -- Drop any existing policies
    DROP POLICY IF EXISTS "bundles_select_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_insert_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_update_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_delete_own" ON public.document_bundles;

    -- Recreate using auth.uid(), casting for type-compat
    CREATE POLICY "bundles_select_own" ON public.document_bundles
      FOR SELECT TO authenticated
      USING (user_id::text = auth.uid()::text);

    CREATE POLICY "bundles_insert_own" ON public.document_bundles
      FOR INSERT TO authenticated
      WITH CHECK (user_id::text = auth.uid()::text);

    CREATE POLICY "bundles_update_own" ON public.document_bundles
      FOR UPDATE TO authenticated
      USING (user_id::text = auth.uid()::text);

    CREATE POLICY "bundles_delete_own" ON public.document_bundles
      FOR DELETE TO authenticated
      USING (user_id::text = auth.uid()::text);
  END IF;
END
$$;

-- Hashed search index: ensure SELECT joins via auth.uid()
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hashed_tokens'
  ) THEN
    -- Ensure RLS enabled
    ALTER TABLE public.hashed_tokens ENABLE ROW LEVEL SECURITY;

    -- Replace legacy owner SELECT policy
    DROP POLICY IF EXISTS "hashed_tokens_select_owner" ON public.hashed_tokens;

    CREATE POLICY "hashed_tokens_select_owner"
    ON public.hashed_tokens
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.id = public.hashed_tokens.doc_id
          AND d.user_id::text = auth.uid()::text
      )
    );
  END IF;
END
$$;
