-- Simple identity consolidation test
-- This test verifies basic functionality without mocking auth.uid()

BEGIN;

-- Test 1: Verify app.current_external_id() function exists and works
DO $$
DECLARE
  current_id text;
BEGIN
  SELECT app.current_external_id() INTO current_id;
  -- Function should return empty string when no user is authenticated
  ASSERT current_id IS NOT NULL, 'app.current_external_id() should return non-null value';
  RAISE NOTICE '✓ app.current_external_id() function exists and works';
END
$$;

-- Test 2: Verify identity consolidation status view exists
DO $$
DECLARE
  consolidation_status text;
  consolidation_message text;
BEGIN
  SELECT status, message INTO consolidation_status, consolidation_message 
  FROM app.identity_consolidation_status;
  
  ASSERT consolidation_status IS NOT NULL, 'Identity consolidation status should exist';
  ASSERT consolidation_status IN ('COMPLETE', 'PARTIAL'), 'Identity consolidation status should be COMPLETE or PARTIAL';
  RAISE NOTICE '✓ Identity consolidation status: %', consolidation_status;
  RAISE NOTICE '  Message: %', consolidation_message;
END
$$;

-- Test 3: Verify documents table has correct RLS policies
DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'documents' 
    AND policyname LIKE '%own documents%';
    
  ASSERT policy_count >= 4, 'Documents table should have at least 4 user-owned policies (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '✓ Documents table has % user-owned RLS policies', policy_count;
END
$$;

-- Test 4: Verify storage policies exist
DO $$
DECLARE
  storage_policy_count int;
BEGIN
  SELECT COUNT(*) INTO storage_policy_count 
  FROM pg_policies 
  WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%legacy-docs%';
    
  ASSERT storage_policy_count >= 4, 'Storage should have at least 4 legacy-docs policies (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '✓ Storage has % legacy-docs RLS policies', storage_policy_count;
END
$$;

-- Test 5: Verify app.current_external_id() function has correct comment
DO $$
DECLARE
  func_comment text;
BEGIN
  SELECT obj_description(oid) INTO func_comment 
  FROM pg_proc 
  WHERE proname = 'current_external_id' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'app');
    
  ASSERT func_comment LIKE '%DEPRECATED%', 'app.current_external_id() should be marked as deprecated';
  RAISE NOTICE '✓ app.current_external_id() is properly marked as deprecated';
END
$$;

DO $$
BEGIN
  RAISE NOTICE '=== ALL IDENTITY CONSOLIDATION TESTS PASSED ===';
END
$$;

ROLLBACK;