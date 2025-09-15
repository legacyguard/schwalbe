-- Error log table replacing Sentry usage
-- Stores structured error events and supports client/server-safe inserts
-- RLS is configured to allow inserts from anon/authenticated/service_role
-- Only service_role can read/update/delete

CREATE TABLE IF NOT EXISTS public.error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON public.error_log(created_at);
CREATE INDEX IF NOT EXISTS idx_error_log_level ON public.error_log(level);

-- Enable Row Level Security
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon/authenticated/service_role (any client may report errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'Anyone can insert error logs'
  ) THEN
    CREATE POLICY "Anyone can insert error logs" ON public.error_log
      FOR INSERT
      TO anon, authenticated, service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Only service role may read/update/delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'Service role can read error logs'
  ) THEN
    CREATE POLICY "Service role can read error logs" ON public.error_log
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'Service role can update error logs'
  ) THEN
    CREATE POLICY "Service role can update error logs" ON public.error_log
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'Service role can delete error logs'
  ) THEN
    CREATE POLICY "Service role can delete error logs" ON public.error_log
      FOR DELETE
      TO service_role
      USING (true);
  END IF;
END $$;
