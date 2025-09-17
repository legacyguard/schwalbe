-- Simple sharing functionality test
-- This test verifies basic sharing database functionality

BEGIN;

-- Test 1: Verify share_links table exists and has correct structure
DO $$
DECLARE
  table_count INTEGER;
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_name = 'share_links' AND table_schema = 'public';
  
  ASSERT table_count = 1, 'share_links table should exist';
  
  SELECT COUNT(*) INTO column_count 
  FROM information_schema.columns 
  WHERE table_name = 'share_links' AND table_schema = 'public';
  
  ASSERT column_count >= 10, 'share_links should have required columns';
  RAISE NOTICE '✓ share_links table exists with % columns', column_count;
END
$$;

-- Test 2: Verify share_audits table exists
DO $$
DECLARE
  table_count INTEGER;
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_name = 'share_audits' AND table_schema = 'public';
  
  ASSERT table_count = 1, 'share_audits table should exist';
  
  SELECT COUNT(*) INTO column_count 
  FROM information_schema.columns 
  WHERE table_name = 'share_audits' AND table_schema = 'public';
  
  ASSERT column_count >= 7, 'share_audits should have required columns';
  RAISE NOTICE '✓ share_audits table exists with % columns', column_count;
END
$$;

-- Test 3: Verify RPC functions exist
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count 
  FROM pg_proc 
  WHERE proname = 'create_share_link' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  ASSERT func_count = 1, 'create_share_link function should exist';
  
  SELECT COUNT(*) INTO func_count 
  FROM pg_proc 
  WHERE proname = 'verify_share_access' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  ASSERT func_count = 1, 'verify_share_access function should exist';
  RAISE NOTICE '✓ Required RPC functions exist';
END
$$;

-- Test 4: Verify RLS policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'share_links' 
    AND policyname = 'owners_manage_share_links';
  
  ASSERT policy_count = 1, 'share_links should have owner management policy';
  
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'share_audits' 
    AND policyname = 'owners_select_audits';
  
  ASSERT policy_count = 1, 'share_audits should have owner select policy';
  RAISE NOTICE '✓ RLS policies are properly configured';
END
$$;

-- Test 5: Verify indexes exist for performance
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE tablename = 'share_links' 
    AND schemaname = 'public'
    AND indexname LIKE 'idx_share_links_%';
  
  ASSERT index_count >= 4, 'share_links should have performance indexes';
  
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE tablename = 'share_audits' 
    AND schemaname = 'public'
    AND indexname LIKE 'idx_share_audits_%';
  
  ASSERT index_count >= 3, 'share_audits should have performance indexes';
  RAISE NOTICE '✓ Performance indexes are in place';
END
$$;

-- Test 6: Verify check constraints
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count 
  FROM information_schema.check_constraints cc
  JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
  WHERE ccu.table_name = 'share_links' 
    AND ccu.table_schema = 'public'
    AND cc.check_clause LIKE '%resource_type%';
  
  ASSERT constraint_count >= 1, 'share_links should have resource_type constraint';
  
  SELECT COUNT(*) INTO constraint_count 
  FROM information_schema.check_constraints cc
  JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
  WHERE ccu.table_name = 'share_audits' 
    AND ccu.table_schema = 'public'
    AND cc.check_clause LIKE '%action%';
  
  ASSERT constraint_count >= 1, 'share_audits should have action constraint';
  RAISE NOTICE '✓ Check constraints are properly defined';
END
$$;

DO $$
BEGIN
  RAISE NOTICE '=== ALL SHARING DATABASE TESTS PASSED ===';
END
$$;

ROLLBACK;