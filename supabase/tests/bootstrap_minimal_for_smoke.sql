-- Minimal bootstrap schema to support SQL smoke tests locally
-- This avoids ordering issues with full migration chain by defining only what's required.

-- Extensions and helper schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app;

-- Identity helper used in RLS policies
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Documents table + RLS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  document_type TEXT DEFAULT 'General',
  expires_at TIMESTAMPTZ,
  encrypted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can view their own documents'
  ) THEN
    CREATE POLICY "Users can view their own documents" ON public.documents
      FOR SELECT USING (user_id = app.current_external_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can insert their own documents'
  ) THEN
    CREATE POLICY "Users can insert their own documents" ON public.documents
      FOR INSERT WITH CHECK (user_id = app.current_external_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can update their own documents'
  ) THEN
    CREATE POLICY "Users can update their own documents" ON public.documents
      FOR UPDATE USING (user_id = app.current_external_id())
      WITH CHECK (user_id = app.current_external_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can delete their own documents'
  ) THEN
    CREATE POLICY "Users can delete their own documents" ON public.documents
      FOR DELETE USING (user_id = app.current_external_id());
  END IF;
END $$;

-- error_log table + RLS (service_role read/update/delete; authenticated+service insert)
CREATE TABLE IF NOT EXISTS public.error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='error_log' AND policyname='authenticated_can_insert_error_logs'
  ) THEN
    CREATE POLICY "authenticated_can_insert_error_logs" ON public.error_log
      FOR INSERT TO authenticated, service_role
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='error_log' AND policyname='service_role_can_select_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_select_error_logs" ON public.error_log
      FOR SELECT TO service_role
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='error_log' AND policyname='service_role_can_update_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_update_error_logs" ON public.error_log
      FOR UPDATE TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='error_log' AND policyname='service_role_can_delete_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_delete_error_logs" ON public.error_log
      FOR DELETE TO service_role
      USING (true);
  END IF;
END $$;

-- hashed_tokens table + RLS
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hashed_tokens' AND policyname='hashed_tokens_select_owner'
  ) THEN
    CREATE POLICY "hashed_tokens_select_owner"
      ON public.hashed_tokens FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = hashed_tokens.doc_id AND d.user_id = app.current_external_id()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hashed_tokens' AND policyname='hashed_tokens_insert_service_role'
  ) THEN
    CREATE POLICY "hashed_tokens_insert_service_role"
      ON public.hashed_tokens
      FOR INSERT
      TO public
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hashed_tokens' AND policyname='hashed_tokens_update_service_role'
  ) THEN
    CREATE POLICY "hashed_tokens_update_service_role"
      ON public.hashed_tokens
      FOR UPDATE
      TO public
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hashed_tokens' AND policyname='hashed_tokens_delete_service_role'
  ) THEN
    CREATE POLICY "hashed_tokens_delete_service_role"
      ON public.hashed_tokens
      FOR DELETE
      TO public
      USING (auth.role() = 'service_role');
  END IF;
END $$;
