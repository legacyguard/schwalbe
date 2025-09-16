-- Compatibility shim for uuid_generate_v4()
-- Ensure required extensions are available before other migrations reference uuid_generate_v4().
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
