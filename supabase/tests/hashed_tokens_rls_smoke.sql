-- Hashed tokens RLS smoke test
-- Ensures a user can only see hashed_tokens rows for their own documents

BEGIN;

-- Create two synthetic documents for two users
SET LOCAL request.jwt.claims TO '{"sub": "rls_user_a", "role": "service_role"}'; -- elevate for setup inserts

-- Create documents for both users (assuming documents.user_id text matching Clerk external id)
INSERT INTO public.documents (id, user_id, file_name, file_path, file_type, file_size)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'rls_user_a', 'a.txt', 'rls_user_a/a.txt', 'text/plain', 1),
  ('00000000-0000-0000-0000-0000000000b1', 'rls_user_b', 'b.txt', 'rls_user_b/b.txt', 'text/plain', 1)
ON CONFLICT DO NOTHING;

-- Insert hashed tokens as service role (writes restricted to service_role)
INSERT INTO public.hashed_tokens (doc_id, hash, tf, positions)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'hash_a', 2, ARRAY[1,2]),
  ('00000000-0000-0000-0000-0000000000b1', 'hash_b', 3, ARRAY[1,3,5]);

-- Switch to user A and verify visibility
SET LOCAL request.jwt.claims TO '{"sub": "rls_user_a"}';
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.hashed_tokens ht
  JOIN public.documents d ON d.id = ht.doc_id
  WHERE d.user_id::text = 'rls_user_a';
  IF c < 1 THEN
    RAISE EXCEPTION 'Expected user A to see own hashed tokens';
  END IF;
  SELECT COUNT(*) INTO c FROM public.hashed_tokens ht
  JOIN public.documents d ON d.id = ht.doc_id
  WHERE d.user_id::text = 'rls_user_b';
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS failed: user A can see user B hashed tokens';
  END IF;
END $$;

-- Switch to user B and verify isolation
SET LOCAL request.jwt.claims TO '{"sub": "rls_user_b"}';
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.hashed_tokens ht
  JOIN public.documents d ON d.id = ht.doc_id
  WHERE d.user_id::text = 'rls_user_b';
  IF c < 1 THEN
    RAISE EXCEPTION 'Expected user B to see own hashed tokens';
  END IF;
  SELECT COUNT(*) INTO c FROM public.hashed_tokens ht
  JOIN public.documents d ON d.id = ht.doc_id
  WHERE d.user_id::text = 'rls_user_a';
  IF c <> 0 THEN
    RAISE EXCEPTION 'RLS failed: user B can see user A hashed tokens';
  END IF;
END $$;

ROLLBACK;