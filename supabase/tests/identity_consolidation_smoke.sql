-- Smoke test for Phase 4: Identity consolidation to auth.uid()
-- This test verifies that RLS policies work correctly with auth.uid()

BEGIN;

-- Create test user (simulated - in real Supabase this would be done via auth.users)
CREATE TEMP TABLE test_auth_context AS 
SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid as user_id;

-- Mock auth.uid() to return our test user
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT user_id FROM test_auth_context LIMIT 1;
$$;

-- Test 1: Verify app.current_external_id() still works (backward compatibility)
DO $$
DECLARE
  current_id text;
BEGIN
  SELECT app.current_external_id() INTO current_id;
  ASSERT current_id = '550e8400-e29b-41d4-a716-446655440000', 'app.current_external_id() should return auth.uid()::text';
  RAISE NOTICE '✓ app.current_external_id() backward compatibility works';
END
$$;

-- Test 2: Verify documents RLS policies work with auth.uid()
INSERT INTO public.documents (id, user_id, title, content_type, encrypted_content, created_at, updated_at)
VALUES (
  'test-doc-1',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Document',
  'text/plain',
  'encrypted-content-here',
  now(),
  now()
);

-- Should be able to select own document
DO $$
DECLARE
  doc_count int;
BEGIN
  SELECT COUNT(*) INTO doc_count 
  FROM public.documents 
  WHERE id = 'test-doc-1';
  ASSERT doc_count = 1, 'Should be able to view own document';
  RAISE NOTICE '✓ Documents RLS SELECT policy works with auth.uid()';
END
$$;

-- Test 3: Verify user_encryption_keys policies work with auth.uid() (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_encryption_keys') THEN
    INSERT INTO public.user_encryption_keys (id, user_id, encrypted_private_key, public_key, is_active, created_at)
    VALUES (
      'test-key-1',
      '550e8400-e29b-41d4-a716-446655440000',
      'encrypted-private-key',
      'public-key',
      true,
      now()
    );
  END IF;
END
$$;

-- Should be able to select own encryption key (if table exists)
DO $$
DECLARE
  key_count int;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_encryption_keys') THEN
    SELECT COUNT(*) INTO key_count 
    FROM public.user_encryption_keys 
    WHERE id = 'test-key-1' AND is_active = true;
    ASSERT key_count = 1, 'Should be able to view own active encryption key';
    RAISE NOTICE '✓ Encryption keys RLS SELECT policy works with auth.uid()';
  ELSE
    RAISE NOTICE '✓ Encryption keys table does not exist - skipping test';
  END IF;
END
$$;

-- Test 4: Verify wills policies work with auth.uid() (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wills') THEN
    INSERT INTO public.wills (id, user_id, title, content, jurisdiction, form_type, created_at, updated_at)
    VALUES (
      'test-will-1',
      '550e8400-e29b-41d4-a716-446655440000',
      'Test Will',
      'Will content here',
      'CZ',
      'typed',
      now(),
      now()
    );
  END IF;
END
$$;

-- Should be able to select own will (if table exists)
DO $$
DECLARE
  will_count int;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wills') THEN
    SELECT COUNT(*) INTO will_count 
    FROM public.wills 
    WHERE id = 'test-will-1';
    ASSERT will_count = 1, 'Should be able to view own will';
    RAISE NOTICE '✓ Wills RLS SELECT policy works with auth.uid()';
  ELSE
    RAISE NOTICE '✓ Wills table does not exist - skipping test';
  END IF;
END
$$;

-- Test 5: Verify identity consolidation status view
DO $$
DECLARE
  consolidation_status text;
BEGIN
  SELECT status INTO consolidation_status 
  FROM app.identity_consolidation_status;
  ASSERT consolidation_status IN ('COMPLETE', 'PARTIAL'), 'Identity consolidation should be complete or partial';
  RAISE NOTICE '✓ Identity consolidation status is %', consolidation_status;
END
$$;

-- Test 6: Verify we cannot see other users' data
INSERT INTO public.documents (id, user_id, title, content_type, encrypted_content, created_at, updated_at)
VALUES (
  'other-user-doc',
  '660e8400-e29b-41d4-a716-446655440001',
  'Other User Document',
  'text/plain',
  'other-encrypted-content',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Should NOT be able to select other user's document
DO $$
DECLARE
  other_doc_count int;
BEGIN
  SELECT COUNT(*) INTO other_doc_count 
  FROM public.documents 
  WHERE id = 'other-user-doc';
  ASSERT other_doc_count = 0, 'Should NOT be able to view other users documents';
  RAISE NOTICE '✓ RLS properly blocks access to other users data';
END
$$;

-- Test 7: Test UPDATE policies work correctly
UPDATE public.documents 
SET title = 'Updated Test Document' 
WHERE id = 'test-doc-1';

-- Verify update worked
DO $$
DECLARE
  updated_title text;
BEGIN
  SELECT title INTO updated_title 
  FROM public.documents 
  WHERE id = 'test-doc-1';
  ASSERT updated_title = 'Updated Test Document', 'Document update should work for own document';
  RAISE NOTICE '✓ Documents RLS UPDATE policy works with auth.uid()';
END
$$;

-- Test 8: Test DELETE policies work correctly
DELETE FROM public.documents WHERE id = 'test-doc-1';

-- Verify deletion worked
DO $$
DECLARE
  deleted_count int;
BEGIN
  SELECT COUNT(*) INTO deleted_count 
  FROM public.documents 
  WHERE id = 'test-doc-1';
  ASSERT deleted_count = 0, 'Document should be deleted';
  RAISE NOTICE '✓ Documents RLS DELETE policy works with auth.uid()';
END
$$;

-- Clean up test data  
DO $$
BEGIN
  DELETE FROM public.documents WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_encryption_keys') THEN
    DELETE FROM public.user_encryption_keys WHERE id = 'test-key-1';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wills') THEN
    DELETE FROM public.wills WHERE id = 'test-will-1';
  END IF;
END
$$;

-- Restore original auth.uid() function (this won't work in tests but good practice)
-- In real environment, Supabase manages this function

RAISE NOTICE '=== ALL IDENTITY CONSOLIDATION TESTS PASSED ===';

ROLLBACK;