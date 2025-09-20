-- Fix RLS Policy Inconsistencies
-- This migration addresses critical RLS policy issues identified in the security audit

-- Helper function to get current user's external ID consistently
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    -- Try auth.uid() first (modern Supabase auth)
    auth.uid()::text,
    -- Fallback to custom external_id if available
    (auth.jwt() ->> 'external_id'),
    -- Final fallback to empty string (will fail RLS checks)
    ''
  );
$$;

-- Fix professional_reviewers policies
DROP POLICY IF EXISTS "System can manage reviewers" ON public.professional_reviewers;
DROP POLICY IF EXISTS "Allow read access to reviewers" ON public.professional_reviewers;

-- More secure policies for professional_reviewers
CREATE POLICY "Reviewers can read own profile" ON public.professional_reviewers
  FOR SELECT
  USING (user_id = app.current_external_id());

CREATE POLICY "Reviewers can update own profile" ON public.professional_reviewers
  FOR UPDATE
  USING (user_id = app.current_external_id())
  WITH CHECK (user_id = app.current_external_id());

-- Allow service role for system operations
CREATE POLICY "Service role can manage reviewers" ON public.professional_reviewers
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Public read access for verified reviewers only
CREATE POLICY "Public can read verified reviewers" ON public.professional_reviewers
  FOR SELECT
  USING (verified = true AND status = 'active');

-- Fix professional_onboarding policies
DROP POLICY IF EXISTS "Users can manage own onboarding" ON public.professional_onboarding;

CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding
  FOR ALL
  USING (user_id = app.current_external_id())
  WITH CHECK (user_id = app.current_external_id());

-- Fix document_reviews policies
DROP POLICY IF EXISTS "Reviewers can manage assigned reviews" ON public.document_reviews;

CREATE POLICY "Reviewers can read assigned reviews" ON public.document_reviews
  FOR SELECT
  USING (
    reviewer_id IN (
      SELECT id FROM public.professional_reviewers
      WHERE user_id = app.current_external_id()
    )
  );

CREATE POLICY "Reviewers can update assigned reviews" ON public.document_reviews
  FOR UPDATE
  USING (
    reviewer_id IN (
      SELECT id FROM public.professional_reviewers
      WHERE user_id = app.current_external_id()
    )
  )
  WITH CHECK (
    reviewer_id IN (
      SELECT id FROM public.professional_reviewers
      WHERE user_id = app.current_external_id()
    )
  );

-- Document owners can read their reviews
CREATE POLICY "Document owners can read their reviews" ON public.document_reviews
  FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM public.documents
      WHERE user_id = auth.uid()
    )
  );

-- Fix will_drafts policies - ensure proper user isolation
DROP POLICY IF EXISTS "Users can manage own will drafts" ON public.will_drafts;

CREATE POLICY "Users can manage own will drafts" ON public.will_drafts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix documents policies - ensure proper user isolation
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;

CREATE POLICY "Users can read own documents" ON public.documents
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE
  USING (user_id = auth.uid());

-- Fix assets policies - ensure proper user isolation
DROP POLICY IF EXISTS "Users can manage own assets" ON public.assets;

CREATE POLICY "Users can read own assets" ON public.assets
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assets" ON public.assets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE
  USING (user_id = auth.uid());

-- Fix user_preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix reminders policies
DROP POLICY IF EXISTS "Users can manage own reminders" ON public.reminders;

CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add audit logging for policy violations
CREATE OR REPLACE FUNCTION log_policy_violation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    details,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid()::text,
    jsonb_build_object(
      'attempted_access', 'unauthorized',
      'policy_check', 'failed',
      'user_agent', current_setting('request.headers')::json->>'user-agent'
    ),
    NOW()
  );

  RETURN NULL; -- This will still fail the operation
END;
$$;

-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id text,
  details jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow service role to read audit logs
CREATE POLICY "Service role can read audit logs" ON public.audit_log
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation ON public.audit_log(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';