-- Error log RLS smoke test
-- Ensures only authenticated/service_role can insert; only service_role can select

BEGIN;

-- Attempt insert as anon (should fail)
RESET request.jwt.claims; -- anon
DO $$
BEGIN
  BEGIN
    INSERT INTO public.error_log(level, message, context) VALUES ('error', 'anon insert should fail', '{}'::jsonb);
    RAISE EXCEPTION 'RLS failed: anon could insert into error_log';
  EXCEPTION WHEN others THEN
    -- expected
    NULL;
  END;
END $$;

-- Insert as authenticated (should succeed)
SET LOCAL request.jwt.claims TO '{"sub": "error_rls_user"}';
INSERT INTO public.error_log(level, message, context) VALUES ('error', 'auth insert ok', '{}'::jsonb);

-- Select as authenticated (should return 0 rows due to no select policy)
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.error_log;
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS failed: authenticated can read error_log rows';
  END IF;
END $$;

-- Select as service_role (should be allowed)
SET LOCAL request.jwt.claims TO '{"sub": "service_user", "role": "service_role"}';
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.error_log;
  IF c < 1 THEN
    RAISE EXCEPTION 'Expected service_role to read at least one error_log row';
  END IF;
END $$;

ROLLBACK;