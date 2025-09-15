-- Harden RLS for public.error_log
-- Inserts: authenticated + service_role only
-- Read/Update/Delete: service_role only

-- Ensure RLS enabled
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Drop permissive policies if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'Anyone can insert error logs'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can insert error logs" ON public.error_log';
  END IF;
END $$;

-- Create strict policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'authenticated_can_insert_error_logs'
  ) THEN
    CREATE POLICY "authenticated_can_insert_error_logs" ON public.error_log
      FOR INSERT
      TO authenticated, service_role
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'service_role_can_select_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_select_error_logs" ON public.error_log
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'service_role_can_update_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_update_error_logs" ON public.error_log
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'error_log' AND policyname = 'service_role_can_delete_error_logs'
  ) THEN
    CREATE POLICY "service_role_can_delete_error_logs" ON public.error_log
      FOR DELETE
      TO service_role
      USING (true);
  END IF;
END $$;
