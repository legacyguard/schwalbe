-- Compatibility shim to ensure uuid_generate_v4() is available
-- Prefer pgcrypto's gen_random_uuid(), but provide uuid_generate_v4() if missing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- If uuid_generate_v4 does not exist, create a wrapper that maps to gen_random_uuid().
CREATE FUNCTION IF NOT EXISTS public.uuid_generate_v4()
RETURNS uuid
LANGUAGE sql
STABLE
AS $fn$
  SELECT gen_random_uuid();
$fn$;

COMMENT ON FUNCTION public.uuid_generate_v4() IS 'Compatibility shim mapping to gen_random_uuid()';
