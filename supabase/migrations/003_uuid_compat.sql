-- Compatibility shim to ensure uuid_generate_v4() is available
-- Prefer pgcrypto's gen_random_uuid(), but provide uuid_generate_v4() if missing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  -- If the uuid_generate_v4 function is missing, create a wrapper to gen_random_uuid()
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'uuid_generate_v4' AND n.nspname = 'public'
  ) THEN
    -- Try to create uuid-ossp if allowed (will provide uuid_generate_v4). If not available, fallback to custom function.
    BEGIN
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    EXCEPTION WHEN OTHERS THEN
      -- Ignore, fallback below
      NULL;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.proname = 'uuid_generate_v4' AND n.nspname = 'public'
    ) THEN
      CREATE FUNCTION public.uuid_generate_v4()
      RETURNS uuid
      LANGUAGE sql
      STABLE
      AS $$
        SELECT gen_random_uuid();
      $$;
      COMMENT ON FUNCTION public.uuid_generate_v4() IS 'Compatibility shim mapping to gen_random_uuid()';
    END IF;
  END IF;
END$$;