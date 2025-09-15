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
CREATE POLICY IF NOT EXISTS "authenticated_can_insert_error_logs" ON public.error_log
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_can_select_error_logs" ON public.error_log
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY IF NOT EXISTS "service_role_can_update_error_logs" ON public.error_log
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_can_delete_error_logs" ON public.error_log
  FOR DELETE
  TO service_role
  USING (true);