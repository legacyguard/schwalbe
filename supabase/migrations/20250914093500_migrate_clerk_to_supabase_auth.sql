-- =============================================================
-- Migration: Migrate Clerk-based policies to Supabase Auth (RLS)
-- Date: 2025-09-14
-- Notes:
-- - This migration replaces RLS policies that relied on app.current_external_id()
--   (Clerk external ID) with policies that rely on auth.uid() (Supabase Auth).
-- - It preserves existing TEXT user_id columns for compatibility by comparing
--   user_id = auth.uid()::text. A later migration can change columns to UUID.
-- - Policies are recreated idempotently with DROP IF EXISTS before CREATE.
-- =============================================================

-- Documents table policies (public.documents)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'documents'
  ) THEN
    -- Drop legacy policies (names known from earlier migrations)
    DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

    -- Ensure RLS enabled
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

    -- Create Supabase Auth-based policies using auth.uid()
    CREATE POLICY "Users can view own documents" ON public.documents
      FOR SELECT USING (user_id = auth.uid()::text);

    CREATE POLICY "Users can insert own documents" ON public.documents
      FOR INSERT WITH CHECK (user_id = auth.uid()::text);

    CREATE POLICY "Users can update own documents" ON public.documents
      FOR UPDATE USING (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);

    CREATE POLICY "Users can delete own documents" ON public.documents
      FOR DELETE USING (user_id = auth.uid()::text);
  END IF;
END
$$;

-- Storage object policies (storage.objects) for user_documents bucket
-- Replace any older Clerk-based policies with Supabase auth.uid()-based
DO $$
BEGIN
  -- storage.objects exists in storage schema
  DROP POLICY IF EXISTS "Allow user to read their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow user to upload to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Allow user to update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow user to delete their own files" ON storage.objects;

  -- Optional dev policy (scoped to user folder) - safe baseline
  DROP POLICY IF EXISTS "dev: allow authenticated users scoped to their folder" ON storage.objects;
  CREATE POLICY "dev: allow authenticated users scoped to their folder"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'user_documents' AND (name LIKE auth.uid()::text || '/%')
  )
  WITH CHECK (
    bucket_id = 'user_documents' AND (name LIKE auth.uid()::text || '/%')
  );

  -- Production-scoped policies by folder prefix (first segment equals auth.uid())
  DROP POLICY IF EXISTS "users_can_read_own_objects" ON storage.objects;
  DROP POLICY IF EXISTS "users_can_insert_own_objects" ON storage.objects;
  DROP POLICY IF EXISTS "users_can_update_own_objects" ON storage.objects;
  DROP POLICY IF EXISTS "users_can_delete_own_objects" ON storage.objects;

  CREATE POLICY "users_can_read_own_objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user_documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "users_can_insert_own_objects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user_documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "users_can_update_own_objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'user_documents' AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user_documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "users_can_delete_own_objects" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user_documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
END
$$;

-- Key management tables (user_encryption_keys, key_rotation_history, user_key_recovery, key_access_logs)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_encryption_keys') THEN
    ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own keys" ON user_encryption_keys;
    DROP POLICY IF EXISTS "Users can create own keys" ON user_encryption_keys;
    DROP POLICY IF EXISTS "Users can update own keys" ON user_encryption_keys;

    CREATE POLICY "Users can view own keys" ON user_encryption_keys
      FOR SELECT USING (user_id = auth.uid()::text AND is_active = true AND is_compromised = false);

    CREATE POLICY "Users can create own keys" ON user_encryption_keys
      FOR INSERT WITH CHECK (user_id = auth.uid()::text);

    CREATE POLICY "Users can update own keys" ON user_encryption_keys
      FOR UPDATE USING (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'key_rotation_history') THEN
    ALTER TABLE key_rotation_history ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own rotation history" ON key_rotation_history;
    DROP POLICY IF EXISTS "System can insert rotation history" ON key_rotation_history;

    CREATE POLICY "Users can view own rotation history" ON key_rotation_history
      FOR SELECT USING (user_id = auth.uid()::text);

    CREATE POLICY "System can insert rotation history" ON key_rotation_history
      FOR INSERT WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_key_recovery') THEN
    ALTER TABLE user_key_recovery ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own recovery settings" ON user_key_recovery;
    DROP POLICY IF EXISTS "Users can manage own recovery settings" ON user_key_recovery;

    CREATE POLICY "Users can view own recovery settings" ON user_key_recovery
      FOR SELECT USING (user_id = auth.uid()::text);

    CREATE POLICY "Users can manage own recovery settings" ON user_key_recovery
      FOR ALL USING (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'key_access_logs') THEN
    ALTER TABLE key_access_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own access logs" ON key_access_logs;
    DROP POLICY IF EXISTS "System can insert access logs" ON key_access_logs;

    CREATE POLICY "Users can view own access logs" ON key_access_logs
      FOR SELECT USING (user_id = auth.uid()::text);

    CREATE POLICY "System can insert access logs" ON key_access_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

-- Professional network tables
DO $$
BEGIN
  -- professional_reviewers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_reviewers') THEN
    ALTER TABLE public.professional_reviewers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow read access to reviewers" ON public.professional_reviewers;
    DROP POLICY IF EXISTS "System can manage reviewers" ON public.professional_reviewers;

    CREATE POLICY "Allow read access to reviewers" ON public.professional_reviewers
      FOR SELECT USING (true);

    CREATE POLICY "System can manage reviewers" ON public.professional_reviewers
      FOR ALL USING (false);
  END IF;

  -- professional_onboarding
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_onboarding') THEN
    ALTER TABLE public.professional_onboarding ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own onboarding" ON public.professional_onboarding;

    CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding
      FOR ALL USING (email IS NOT NULL); -- keep permissive until email-to-user mapping finalized
  END IF;

  -- review_requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_requests') THEN
    ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own review requests" ON public.review_requests;

    CREATE POLICY "Users can manage own review requests" ON public.review_requests
      FOR ALL USING (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);
  END IF;

  -- document_reviews
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_reviews') THEN
    ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own reviews" ON public.document_reviews;
    DROP POLICY IF EXISTS "Reviewers can manage assigned reviews" ON public.document_reviews;

    CREATE POLICY "Users can view own reviews" ON public.document_reviews
      FOR SELECT USING (user_id = auth.uid()::text);

    CREATE POLICY "Reviewers can manage assigned reviews" ON public.document_reviews
      FOR ALL USING (
        reviewer_id IN (
          SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid()::text
        )
      );
  END IF;

  -- review_results
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_results') THEN
    ALTER TABLE public.review_results ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own review results" ON public.review_results;

    CREATE POLICY "Users can view own review results" ON public.review_results
      FOR SELECT USING (
        review_id IN (
          SELECT id FROM public.document_reviews WHERE user_id = auth.uid()::text
        )
      );
  END IF;

  -- professional_partnerships
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_partnerships') THEN
    ALTER TABLE public.professional_partnerships ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Reviewers can manage own partnerships" ON public.professional_partnerships;

    CREATE POLICY "Reviewers can manage own partnerships" ON public.professional_partnerships
      FOR ALL USING (
        reviewer_id IN (
          SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid()::text
        )
      );
  END IF;

  -- consultations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultations') THEN
    ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage own consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Reviewers can manage own consultations" ON public.consultations;

    CREATE POLICY "Users can manage own consultations" ON public.consultations
      FOR ALL USING (user_id = auth.uid()::text)
      WITH CHECK (user_id = auth.uid()::text);

    CREATE POLICY "Reviewers can manage own consultations" ON public.consultations
      FOR ALL USING (
        reviewer_id IN (
          SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid()::text
        )
      );
  END IF;
END
$$;
