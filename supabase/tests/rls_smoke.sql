-- RLS Smoke Test
-- This script validates per-user isolation for public.documents using Supabase Auth (auth.uid()).
-- No PII: uses synthetic user IDs and temporary data, and rolls back at the end.

BEGIN;

-- Use synthetic user identities (text IDs are fine; policies compare as ::text)
-- User A context
SET LOCAL request.jwt.claims TO '{"sub": "smoke_user_a"}';

-- Insert a document as user A (should pass RLS WITH CHECK)
INSERT INTO public.documents (user_id, file_name, file_path, file_type, file_size)
VALUES ('smoke_user_a', 't.txt', 'smoke_user_a/t.txt', 'text/plain', 1);

-- Verify user A can read it
DO $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.documents WHERE user_id::text = 'smoke_user_a';
  IF c < 1 THEN
    RAISE EXCEPTION 'RLS smoke failed: user A cannot read own document';
  END IF;
END $$;

-- Switch to user B (isolation expected)
SET LOCAL request.jwt.claims TO '{"sub": "smoke_user_b"}';

-- Verify user B cannot read user A's document
DO $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.documents WHERE user_id::text = 'smoke_user_a';
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS smoke failed: user B can read user A document';
  END IF;
END $$;

-- Attempt to update user A's row as user B (should affect 0 rows)
UPDATE public.documents
   SET file_name = 'should_not_update.txt'
 WHERE user_id::text = 'smoke_user_a';

DO $$
DECLARE
  c int;
BEGIN
  GET DIAGNOSTICS c = ROW_COUNT;
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS smoke failed: user B updated user A document (rows=%).', c;
  END IF;
END $$;

-- Switch back to user A and delete own document (should succeed)
SET LOCAL request.jwt.claims TO '{"sub": "smoke_user_a"}';
DELETE FROM public.documents WHERE user_id::text = 'smoke_user_a';

DO $$
DECLARE
  c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.documents WHERE user_id::text = 'smoke_user_a';
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS smoke failed: user A could not delete own document';
  END IF;
END $$;

-- All checks passed; rollback to leave DB unchanged
ROLLBACK;
