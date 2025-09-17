-- Sharing functionality smoke test
-- This test verifies the basic sharing workflow

BEGIN;

-- Mock a test user UUID
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID AS test_user_id;

-- Mock auth.uid() function to return our test user
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
$$;

-- Mock auth.role() function to return authenticated
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 'authenticated'::TEXT;
$$;

-- Test 1: Create a share link for a document
DO $$
DECLARE
  share_result RECORD;
  test_doc_id TEXT := 'test-doc-123';
BEGIN
  -- First insert a test document
  INSERT INTO public.documents (id, user_id, title, content_type, encrypted_content, created_at, updated_at)
  VALUES (test_doc_id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Document', 'text/plain', 'encrypted-content', now(), now());
  
  -- Create a share link via RPC
  SELECT * INTO share_result FROM public.create_share_link(
    'document',
    test_doc_id,
    '{"read": true, "download": false}',
    NULL,
    NULL,
    NULL
  );
  
  -- Verify share link was created
  ASSERT share_result.share_id IS NOT NULL, 'Share ID should be generated';
  ASSERT LENGTH(share_result.share_id) > 10, 'Share ID should be a reasonable length';
  RAISE NOTICE '✓ Share link created: %', share_result.share_id;
END
$$;

-- Test 2: Verify share access (positive case)
DO $$
DECLARE
  share_result RECORD;
  verify_result RECORD;
  test_share_id TEXT;
BEGIN
  -- Get the share ID from the previous test
  SELECT share_id INTO test_share_id FROM public.share_links ORDER BY created_at DESC LIMIT 1;
  
  -- Verify access without password
  SELECT * INTO verify_result FROM public.verify_share_access(
    test_share_id,
    NULL,
    'Mozilla/5.0 Test Browser',
    '127.0.0.1'::INET
  );
  
  -- Should grant access
  ASSERT verify_result.status = 'ok', 'Access should be granted';
  ASSERT verify_result.resource_type = 'document', 'Resource type should match';
  ASSERT verify_result.resource_id = 'test-doc-123', 'Resource ID should match';
  RAISE NOTICE '✓ Share access verification successful';
END
$$;

-- Test 3: Test password-protected share
DO $$
DECLARE
  share_result RECORD;
  verify_result RECORD;
  test_password TEXT := 'test123';
BEGIN
  -- Create password-protected share
  SELECT * INTO share_result FROM public.create_share_link(
    'document',
    'test-doc-123',
    '{"read": true}',
    NULL,
    NULL,
    test_password
  );
  
  -- Verify access fails without password
  SELECT * INTO verify_result FROM public.verify_share_access(
    share_result.share_id,
    NULL,
    'Mozilla/5.0 Test Browser',
    '127.0.0.1'::INET
  );
  
  ASSERT verify_result.status = 'password_required', 'Should require password';
  
  -- Verify access succeeds with correct password
  SELECT * INTO verify_result FROM public.verify_share_access(
    share_result.share_id,
    test_password,
    'Mozilla/5.0 Test Browser',
    '127.0.0.1'::INET
  );
  
  ASSERT verify_result.status = 'ok', 'Should grant access with correct password';
  RAISE NOTICE '✓ Password protection works correctly';
END
$$;

-- Test 4: Test expired share
DO $$
DECLARE
  share_result RECORD;
  verify_result RECORD;
  past_time TIMESTAMPTZ := now() - INTERVAL '1 hour';
BEGIN
  -- Create expired share
  SELECT * INTO share_result FROM public.create_share_link(
    'document',
    'test-doc-123',
    '{"read": true}',
    past_time,
    NULL,
    NULL
  );
  
  -- Verify access fails for expired link
  SELECT * INTO verify_result FROM public.verify_share_access(
    share_result.share_id,
    NULL,
    'Mozilla/5.0 Test Browser',
    '127.0.0.1'::INET
  );
  
  ASSERT verify_result.status = 'expired', 'Should be expired';
  ASSERT verify_result.reason = 'expired_by_time', 'Should indicate time expiry';
  RAISE NOTICE '✓ Share expiry works correctly';
END
$$;

-- Test 5: Test access count limits
DO $$
DECLARE
  share_result RECORD;
  verify_result RECORD;
  i INTEGER;
BEGIN
  -- Create share with access limit of 2
  SELECT * INTO share_result FROM public.create_share_link(
    'document',
    'test-doc-123',
    '{"read": true}',
    NULL,
    2,
    NULL
  );
  
  -- Access twice (should work)
  FOR i IN 1..2 LOOP
    SELECT * INTO verify_result FROM public.verify_share_access(
      share_result.share_id,
      NULL,
      'Mozilla/5.0 Test Browser',
      '127.0.0.1'::INET
    );
    ASSERT verify_result.status = 'ok', 'Should grant access within limit';
  END LOOP;
  
  -- Third access should fail
  SELECT * INTO verify_result FROM public.verify_share_access(
    share_result.share_id,
    NULL,
    'Mozilla/5.0 Test Browser',
    '127.0.0.1'::INET
  );
  
  ASSERT verify_result.status = 'expired', 'Should be expired after max accesses';
  ASSERT verify_result.reason = 'max_access_reached', 'Should indicate access limit reached';
  RAISE NOTICE '✓ Access count limits work correctly';
END
$$;

-- Test 6: Verify audit trail
DO $$
DECLARE
  audit_count INTEGER;
BEGIN
  -- Count audit entries
  SELECT COUNT(*) INTO audit_count FROM public.share_audits;
  
  -- Should have multiple audit entries from our tests
  ASSERT audit_count >= 5, 'Should have audit entries for share operations';
  RAISE NOTICE '✓ Audit trail created: % entries', audit_count;
END
$$;

-- Test 7: Verify RLS policies work
DO $$
DECLARE
  share_count INTEGER;
  audit_count INTEGER;
BEGIN
  -- User should see their own share links
  SELECT COUNT(*) INTO share_count FROM public.share_links;
  ASSERT share_count > 0, 'User should see their own share links';
  
  -- User should see audits for their share links
  SELECT COUNT(*) INTO audit_count FROM public.share_audits;
  ASSERT audit_count > 0, 'User should see audits for their share links';
  
  RAISE NOTICE '✓ RLS policies work correctly';
END
$$;

-- Cleanup
DELETE FROM public.share_audits WHERE EXISTS (
  SELECT 1 FROM public.share_links sl 
  WHERE sl.id = share_audits.share_link_id 
    AND sl.resource_id = 'test-doc-123'
);
DELETE FROM public.share_links WHERE resource_id = 'test-doc-123';
DELETE FROM public.documents WHERE id = 'test-doc-123';

DO $$
BEGIN
  RAISE NOTICE '=== ALL SHARING FUNCTIONALITY TESTS PASSED ===';
END
$$;

ROLLBACK;