-- =================================================================
-- MIGRATION: Create Professional Network Tables
-- Version: 1.0
-- Description: Creates tables for attorney and professional reviewer system
-- =================================================================

-- Create professional specializations table
CREATE TABLE IF NOT EXISTS public.professional_specializations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('estate_planning', 'family_law', 'real_estate', 'business_law', 'tax_law', 'other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professional onboarding applications table
CREATE TABLE IF NOT EXISTS public.professional_onboarding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    professional_title VARCHAR(255) NOT NULL,
    law_firm_name VARCHAR(255),
    bar_number VARCHAR(100) NOT NULL,
    licensed_states TEXT[] NOT NULL DEFAULT '{}',
    specializations TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    motivation TEXT,
    referral_source VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professional reviewers table (for verified professionals)
CREATE TABLE IF NOT EXISTS public.professional_reviewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    professional_title VARCHAR(255) NOT NULL,
    law_firm_name VARCHAR(255),
    bar_number VARCHAR(100) NOT NULL,
    licensed_states TEXT[] NOT NULL DEFAULT '{}',
    specializations UUID[] NOT NULL DEFAULT '{}', -- References professional_specializations
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    profile_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review requests table
CREATE TABLE IF NOT EXISTS public.review_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('basic', 'comprehensive', 'certified')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    preferred_reviewer_id UUID REFERENCES public.professional_reviewers(id),
    required_specializations TEXT[] NOT NULL DEFAULT '{}',
    deadline TIMESTAMP WITH TIME ZONE,
    budget_max DECIMAL(10,2),
    special_instructions TEXT,
    family_context JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document reviews table (actual review assignments)
CREATE TABLE IF NOT EXISTS public.document_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.professional_reviewers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('basic', 'comprehensive', 'certified')),
    status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'assigned', 'in_progress', 'completed', 'rejected')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    review_fee DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review results table
CREATE TABLE IF NOT EXISTS public.review_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.document_reviews(id) ON DELETE CASCADE,
    overall_status VARCHAR(30) NOT NULL CHECK (overall_status IN ('approved', 'approved_with_changes', 'requires_revision', 'rejected')),
    trust_score_impact INTEGER CHECK (trust_score_impact >= -10 AND trust_score_impact <= 10),
    legal_compliance_score INTEGER CHECK (legal_compliance_score >= 0 AND legal_compliance_score <= 100),
    recommendations JSONB NOT NULL DEFAULT '[]',
    issues_found JSONB NOT NULL DEFAULT '[]',
    summary TEXT NOT NULL,
    detailed_feedback TEXT NOT NULL,
    next_steps TEXT[] DEFAULT '{}',
    follow_up_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create professional partnerships table
CREATE TABLE IF NOT EXISTS public.professional_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.professional_reviewers(id) ON DELETE CASCADE,
    partnership_type VARCHAR(20) NOT NULL CHECK (partnership_type IN ('individual', 'firm', 'network')),
    commission_rate DECIMAL(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
    minimum_review_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    preferred_review_types TEXT[] NOT NULL DEFAULT '{}',
    availability_hours JSONB NOT NULL DEFAULT '{}',
    max_concurrent_reviews INTEGER NOT NULL DEFAULT 5 CHECK (max_concurrent_reviews > 0),
    auto_assign_enabled BOOLEAN NOT NULL DEFAULT false,
    notification_preferences JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.professional_reviewers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('phone', 'video', 'in_person')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default professional specializations
INSERT INTO public.professional_specializations (name, category, description) VALUES
    ('Estate Planning', 'estate_planning', 'Wills, trusts, and estate planning documents'),
    ('Family Law', 'family_law', 'Divorce, custody, and family legal matters'),
    ('Real Estate Law', 'real_estate', 'Property transactions and real estate documents'),
    ('Business Law', 'business_law', 'Business formation, contracts, and corporate documents'),
    ('Tax Law', 'tax_law', 'Tax planning and compliance documents'),
    ('Trust Administration', 'estate_planning', 'Trust creation and administration'),
    ('Probate Law', 'estate_planning', 'Estate administration and probate proceedings'),
    ('Asset Protection', 'estate_planning', 'Strategies for protecting family assets'),
    ('Healthcare Directives', 'estate_planning', 'Living wills and medical power of attorney'),
    ('Guardianship', 'family_law', 'Legal guardianship arrangements for minors or dependents')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE public.professional_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professional tables
-- Professional specializations (read-only for all users)
CREATE POLICY "Allow read access to specializations" ON public.professional_specializations
    FOR SELECT USING (true);

-- Professional onboarding (users can manage their own applications)
DO $$
BEGIN
  -- Replace if exists to avoid conflicts
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'professional_onboarding' AND policyname = 'Users can manage own onboarding'
  ) THEN
    DROP POLICY "Users can manage own onboarding" ON public.professional_onboarding;
  END IF;

  -- Prefer email column when present; otherwise fall back to user_id; else lock down
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_onboarding' AND column_name = 'email'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding FOR ALL USING (email = app.current_external_id() || ''@placeholder.com'')';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_onboarding' AND column_name = 'user_id'
  ) THEN
    -- Determine data type of user_id to choose the correct identity comparator
    DECLARE v_user_id_type text;
    BEGIN
      SELECT data_type INTO v_user_id_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'professional_onboarding' AND column_name = 'user_id';

      IF v_user_id_type = 'uuid' THEN
        EXECUTE 'CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding FOR ALL USING (user_id = auth.uid())';
      ELSE
        EXECUTE 'CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding FOR ALL USING (user_id = app.current_external_id())';
      END IF;
    END;
  ELSE
    EXECUTE 'CREATE POLICY "Users can manage own onboarding" ON public.professional_onboarding FOR ALL USING (false)';
  END IF;
END$$;

-- Professional reviewers (read-only for users, write for system)
CREATE POLICY "Allow read access to reviewers" ON public.professional_reviewers
    FOR SELECT USING (true);

CREATE POLICY "System can manage reviewers" ON public.professional_reviewers
    FOR ALL USING (false); -- Service role only

-- Review requests (users can manage their own requests)
DO $$
DECLARE v_type text;
BEGIN
  -- Drop existing policy if present
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review_requests' AND policyname = 'Users can manage own review requests'
  ) THEN
    EXECUTE 'DROP POLICY "Users can manage own review requests" ON public.review_requests';
  END IF;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'review_requests' AND column_name = 'user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can manage own review requests" ON public.review_requests FOR ALL USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can manage own review requests" ON public.review_requests FOR ALL USING (user_id = app.current_external_id())';
  END IF;
END$$;

-- Document reviews (users can view their own reviews, reviewers can manage assigned reviews)
DO $$
DECLARE v_has_doc_user boolean; v_doc_user_type text; v_rr_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_reviews' AND policyname = 'Users can view own reviews'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view own reviews" ON public.document_reviews';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_reviews' AND column_name = 'user_id'
  ) INTO v_has_doc_user;

  IF v_has_doc_user THEN
    SELECT data_type INTO v_doc_user_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_reviews' AND column_name = 'user_id';

    IF v_doc_user_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Users can view own reviews" ON public.document_reviews FOR SELECT USING (user_id = auth.uid())';
    ELSE
      EXECUTE 'CREATE POLICY "Users can view own reviews" ON public.document_reviews FOR SELECT USING (user_id = app.current_external_id())';
    END IF;
  ELSE
    -- Fallback: derive ownership via review_requests by matching document_id
    SELECT data_type INTO v_rr_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'review_requests' AND column_name = 'user_id';

    IF v_rr_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Users can view own reviews" ON public.document_reviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.review_requests rr WHERE rr.document_id = public.document_reviews.document_id AND rr.user_id = auth.uid()))';
    ELSE
      EXECUTE 'CREATE POLICY "Users can view own reviews" ON public.document_reviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.review_requests rr WHERE rr.document_id = public.document_reviews.document_id AND rr.user_id = app.current_external_id()))';
    END IF;
  END IF;
END$$;

DO $$
DECLARE v_has_user_id boolean; v_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_reviews' AND policyname = 'Reviewers can manage assigned reviews'
  ) THEN
    EXECUTE 'DROP POLICY "Reviewers can manage assigned reviews" ON public.document_reviews';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id'
  ) INTO v_has_user_id;

  IF v_has_user_id THEN
    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id';

    IF v_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Reviewers can manage assigned reviews" ON public.document_reviews FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid())
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Reviewers can manage assigned reviews" ON public.document_reviews FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = app.current_external_id())
      )';
    END IF;
  ELSE
    -- Fallback: lock down if reviewer identity mapping is unknown on remote
    EXECUTE 'CREATE POLICY "Reviewers can manage assigned reviews" ON public.document_reviews FOR ALL USING (false)';
  END IF;
END$$;

-- Review results (users can view results of their reviews, reviewers can manage results)
DO $$
DECLARE v_has_doc_user boolean; v_doc_user_type text; v_rr_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review_results' AND policyname = 'Users can view own review results'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view own review results" ON public.review_results';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_reviews' AND column_name = 'user_id'
  ) INTO v_has_doc_user;

  IF v_has_doc_user THEN
    SELECT data_type INTO v_doc_user_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_reviews' AND column_name = 'user_id';

    IF v_doc_user_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Users can view own review results" ON public.review_results FOR SELECT USING (review_id IN (SELECT id FROM public.document_reviews WHERE user_id = auth.uid()))';
    ELSE
      EXECUTE 'CREATE POLICY "Users can view own review results" ON public.review_results FOR SELECT USING (review_id IN (SELECT id FROM public.document_reviews WHERE user_id = app.current_external_id()))';
    END IF;
  ELSE
    -- Fallback via join to review_requests on document_id
    SELECT data_type INTO v_rr_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'review_requests' AND column_name = 'user_id';

    IF v_rr_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Users can view own review results" ON public.review_results FOR SELECT USING (EXISTS (SELECT 1 FROM public.document_reviews dr JOIN public.review_requests rr ON rr.document_id = dr.document_id WHERE dr.id = public.review_results.review_id AND rr.user_id = auth.uid()))';
    ELSE
      EXECUTE 'CREATE POLICY "Users can view own review results" ON public.review_results FOR SELECT USING (EXISTS (SELECT 1 FROM public.document_reviews dr JOIN public.review_requests rr ON rr.document_id = dr.document_id WHERE dr.id = public.review_results.review_id AND rr.user_id = app.current_external_id()))';
    END IF;
  END IF;
END$$;

-- Professional partnerships (reviewers can manage their own partnerships)
DO $$
DECLARE v_has_user_id boolean; v_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'professional_partnerships' AND policyname = 'Reviewers can manage own partnerships'
  ) THEN
    EXECUTE 'DROP POLICY "Reviewers can manage own partnerships" ON public.professional_partnerships';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id'
  ) INTO v_has_user_id;

  IF v_has_user_id THEN
    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id';

    IF v_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Reviewers can manage own partnerships" ON public.professional_partnerships FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid())
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Reviewers can manage own partnerships" ON public.professional_partnerships FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = app.current_external_id())
      )';
    END IF;
  ELSE
    -- Fallback: lock down to avoid accidental access on unknown schema
    EXECUTE 'CREATE POLICY "Reviewers can manage own partnerships" ON public.professional_partnerships FOR ALL USING (false)';
  END IF;
END$$;

-- Consultations (users and reviewers can manage their own consultations)
DO $$
DECLARE v_type text; v_has_pr_user_id boolean; v_pr_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'consultations' AND policyname = 'Users can manage own consultations'
  ) THEN
    EXECUTE 'DROP POLICY "Users can manage own consultations" ON public.consultations';
  END IF;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'consultations' AND column_name = 'user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can manage own consultations" ON public.consultations FOR ALL USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can manage own consultations" ON public.consultations FOR ALL USING (user_id = app.current_external_id())';
  END IF;

  -- Reviewer-side policy
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'consultations' AND policyname = 'Reviewers can manage own consultations'
  ) THEN
    EXECUTE 'DROP POLICY "Reviewers can manage own consultations" ON public.consultations';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id'
  ) INTO v_has_pr_user_id;

  IF v_has_pr_user_id THEN
    SELECT data_type INTO v_pr_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professional_reviewers' AND column_name = 'user_id';

    IF v_pr_type = 'uuid' THEN
      EXECUTE 'CREATE POLICY "Reviewers can manage own consultations" ON public.consultations FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = auth.uid())
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Reviewers can manage own consultations" ON public.consultations FOR ALL USING (
        reviewer_id IN (SELECT id FROM public.professional_reviewers WHERE user_id = app.current_external_id())
      )';
    END IF;
  ELSE
    -- Lock down if schema unknown
    EXECUTE 'CREATE POLICY "Reviewers can manage own consultations" ON public.consultations FOR ALL USING (false)';
  END IF;
END$$;


-- Create indexes for performance
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professional_reviewers' AND column_name='user_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_professional_reviewers_user_id ON public.professional_reviewers(user_id)';
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS idx_professional_reviewers_status ON public.professional_reviewers(status, verification_status);
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professional_reviewers' AND column_name='specializations'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_professional_reviewers_specializations ON public.professional_reviewers USING GIN(specializations)';
  END IF;
END$$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_requests' AND column_name='user_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON public.review_requests(user_id)';
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS idx_review_requests_document_id ON public.review_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON public.review_requests(status);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='document_reviews' AND column_name='user_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_document_reviews_user_id ON public.document_reviews(user_id)';
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS idx_document_reviews_reviewer_id ON public.document_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON public.document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status ON public.document_reviews(status);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consultations' AND column_name='user_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id)';
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS idx_consultations_reviewer_id ON public.consultations(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_at ON public.consultations(scheduled_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_professional_onboarding_updated_at
    BEFORE UPDATE ON public.professional_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_reviewers_updated_at
    BEFORE UPDATE ON public.professional_reviewers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
    BEFORE UPDATE ON public.review_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_reviews_updated_at
    BEFORE UPDATE ON public.document_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_results_updated_at
    BEFORE UPDATE ON public.review_results
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_partnerships_updated_at
    BEFORE UPDATE ON public.professional_partnerships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.professional_specializations IS 'Available specializations for professional reviewers';
COMMENT ON TABLE public.professional_onboarding IS 'Applications for professionals to join the network';
COMMENT ON TABLE public.professional_reviewers IS 'Verified professional reviewers in the network';
COMMENT ON TABLE public.review_requests IS 'User requests for document reviews';
COMMENT ON TABLE public.document_reviews IS 'Actual review assignments and their status';
COMMENT ON TABLE public.review_results IS 'Results and findings from completed reviews';
COMMENT ON TABLE public.professional_partnerships IS 'Partnership settings for professional reviewers';
COMMENT ON TABLE public.consultations IS 'Scheduled consultations between users and reviewers';

