-- Professional Review System Database Schema
-- Comprehensive schema for professional network, reviews, and milestones

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trust Score Fields for Wills Table
ALTER TABLE wills 
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
ADD COLUMN IF NOT EXISTS trust_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_trust_calculation TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trust_score_history JSONB DEFAULT '[]'::jsonb;

-- Professional Review Fields for Documents Table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS professional_review_status TEXT DEFAULT 'none' 
    CHECK (professional_review_status IN ('none', 'requested', 'in_progress', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS professional_review_score INTEGER CHECK (professional_review_score >= 0 AND professional_review_score <= 100),
ADD COLUMN IF NOT EXISTS professional_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS professional_reviewer_id UUID,
ADD COLUMN IF NOT EXISTS review_findings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_recommendations JSONB DEFAULT '[]'::jsonb;

-- Quick Insights Tables
CREATE TABLE IF NOT EXISTS quick_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('document_analysis', 'family_impact', 'time_saved', 'protection_level', 'completion_gap', 'urgent_action')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    value TEXT,
    impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'important', 'nice_to_have')),
    actionable BOOLEAN DEFAULT false,
    action_text TEXT,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    family_impact JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Legacy Milestones Tables
CREATE TABLE IF NOT EXISTS legacy_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('first_document', 'protection_threshold', 'family_complete', 'professional_review', 'annual_update', 'legacy_complete')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('foundation', 'protection', 'family', 'professional', 'maintenance', 'mastery')),
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    progress JSONB NOT NULL DEFAULT '{}'::jsonb,
    celebration JSONB NOT NULL DEFAULT '{}'::jsonb,
    rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
    triggers JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestone_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestone_celebrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES legacy_milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    celebration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Professional Network Tables
CREATE TABLE IF NOT EXISTS professional_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professional_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
    portfolio JSONB DEFAULT '{}'::jsonb,
    availability JSONB DEFAULT '{}'::jsonb,
    verification_status TEXT DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professional_reviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credentials TEXT NOT NULL,
    bar_number TEXT,
    jurisdiction TEXT NOT NULL,
    specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_completed INTEGER DEFAULT 0,
    average_turnaround_hours INTEGER DEFAULT 48,
    profile_verified BOOLEAN DEFAULT false,
    contact_email TEXT NOT NULL,
    phone TEXT,
    bio TEXT,
    profile_image_url TEXT,
    hourly_rate DECIMAL(10,2),
    availability JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    review_type TEXT NOT NULL CHECK (review_type IN ('basic', 'comprehensive', 'certified')),
    urgency_level TEXT DEFAULT 'standard' CHECK (urgency_level IN ('standard', 'priority', 'urgent')),
    specialization_required TEXT,
    request_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    reviewer_id UUID REFERENCES professional_reviewers(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES professional_reviewers(id) ON DELETE CASCADE,
    review_type TEXT NOT NULL DEFAULT 'legal',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    review_date TIMESTAMPTZ DEFAULT now(),
    completion_date TIMESTAMPTZ,
    turnaround_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES document_reviews(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    findings JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    risk_assessment JSONB DEFAULT '{}'::jsonb,
    completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
    legal_compliance JSONB DEFAULT '{}'::jsonb,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professional_reviewers(id) ON DELETE CASCADE,
    consultation_type TEXT NOT NULL CHECK (consultation_type IN ('initial_consultation', 'document_review', 'estate_planning', 'family_planning')),
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    meeting_url TEXT,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Family Impact Statements Table
CREATE TABLE IF NOT EXISTS family_impact_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification and Communication Tables
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    application_id UUID REFERENCES professional_onboarding(id) ON DELETE SET NULL,
    review_id UUID REFERENCES document_reviews(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS failed_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    email_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insight Actions Tracking
CREATE TABLE IF NOT EXISTS insight_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL REFERENCES quick_insights(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    result_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_insights_user_id ON quick_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_insights_type ON quick_insights(type);
CREATE INDEX IF NOT EXISTS idx_quick_insights_priority ON quick_insights(priority);
CREATE INDEX IF NOT EXISTS idx_quick_insights_created_at ON quick_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_legacy_milestones_user_id ON legacy_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_type ON legacy_milestones(type);
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_category ON legacy_milestones(category);
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_completed_at ON legacy_milestones(completed_at);

CREATE INDEX IF NOT EXISTS idx_professional_reviewers_jurisdiction ON professional_reviewers(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_professional_reviewers_specializations ON professional_reviewers USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_professional_reviewers_rating ON professional_reviewers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_professional_reviewers_verified ON professional_reviewers(profile_verified);

CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON review_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_document_id ON review_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_created_at ON review_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_reviewer_id ON document_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status ON document_reviews(status);
CREATE INDEX IF NOT EXISTS idx_document_reviews_created_at ON document_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_professional_id ON consultations(professional_id);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_time ON consultations(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

-- Row Level Security Policies

-- Quick Insights RLS
ALTER TABLE quick_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own insights" ON quick_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insights" ON quick_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON quick_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insights" ON quick_insights FOR DELETE USING (auth.uid() = user_id);

-- Legacy Milestones RLS
ALTER TABLE legacy_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own milestones" ON legacy_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON legacy_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON legacy_milestones FOR UPDATE USING (auth.uid() = user_id);

-- Milestone Progress RLS
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON milestone_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON milestone_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON milestone_progress FOR UPDATE USING (auth.uid() = user_id);

-- Professional Onboarding RLS
ALTER TABLE professional_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own applications" ON professional_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON professional_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON professional_onboarding FOR UPDATE USING (auth.uid() = user_id);

-- Professional Reviewers RLS (public read for verified professionals)
ALTER TABLE professional_reviewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view verified professionals" ON professional_reviewers FOR SELECT USING (profile_verified = true);
CREATE POLICY "Professionals can update their own profiles" ON professional_reviewers FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM professional_onboarding 
        WHERE user_id = auth.uid() 
        AND verification_status = 'verified'
    )
);

-- Review Requests RLS
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own review requests" ON review_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own review requests" ON review_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own review requests" ON review_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Reviewers can view assigned requests" ON review_requests FOR SELECT USING (
    reviewer_id IN (
        SELECT id FROM professional_reviewers 
        WHERE id IN (
            SELECT pr.id FROM professional_reviewers pr
            JOIN professional_onboarding po ON po.user_id = auth.uid()
            WHERE pr.contact_email = po.credentials->>'email'
        )
    )
);

-- Document Reviews RLS
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reviews of their documents" ON document_reviews FOR SELECT USING (
    document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
);
CREATE POLICY "Reviewers can view their assigned reviews" ON document_reviews FOR SELECT USING (
    reviewer_id IN (
        SELECT pr.id FROM professional_reviewers pr
        JOIN professional_onboarding po ON po.credentials->>'email' = pr.contact_email
        WHERE po.user_id = auth.uid()
    )
);
CREATE POLICY "Reviewers can update their assigned reviews" ON document_reviews FOR UPDATE USING (
    reviewer_id IN (
        SELECT pr.id FROM professional_reviewers pr
        JOIN professional_onboarding po ON po.credentials->>'email' = pr.contact_email
        WHERE po.user_id = auth.uid()
    )
);

-- Review Results RLS
ALTER TABLE review_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view results of their document reviews" ON review_results FOR SELECT USING (
    review_id IN (
        SELECT dr.id FROM document_reviews dr
        JOIN documents d ON d.id = dr.document_id
        WHERE d.user_id = auth.uid()
    )
);
CREATE POLICY "Reviewers can insert results for their reviews" ON review_results FOR INSERT WITH CHECK (
    review_id IN (
        SELECT dr.id FROM document_reviews dr
        JOIN professional_reviewers pr ON pr.id = dr.reviewer_id
        JOIN professional_onboarding po ON po.credentials->>'email' = pr.contact_email
        WHERE po.user_id = auth.uid()
    )
);

-- Consultations RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own consultations" ON consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own consultations" ON consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own consultations" ON consultations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Professionals can view their consultations" ON consultations FOR SELECT USING (
    professional_id IN (
        SELECT pr.id FROM professional_reviewers pr
        JOIN professional_onboarding po ON po.credentials->>'email' = pr.contact_email
        WHERE po.user_id = auth.uid()
    )
);

-- Family Impact Statements RLS
ALTER TABLE family_impact_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own impact statements" ON family_impact_statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own impact statements" ON family_impact_statements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own impact statements" ON family_impact_statements FOR UPDATE USING (auth.uid() = user_id);

-- Insert default professional specializations
INSERT INTO professional_specializations (name, description, category) VALUES
    ('Estate Planning', 'Wills, trusts, and estate planning documents', 'estate'),
    ('Family Law', 'Family-related legal matters and planning', 'family'),
    ('Tax Law', 'Tax implications and planning strategies', 'tax'),
    ('Real Estate', 'Property transactions and ownership documents', 'property'),
    ('Business Law', 'Business structure and commercial planning', 'business'),
    ('Elder Law', 'Legal issues affecting seniors and aging', 'elder'),
    ('Probate', 'Probate court procedures and administration', 'probate'),
    ('Trust Administration', 'Trust management and administration', 'trust'),
    ('Asset Protection', 'Strategies for protecting family assets', 'asset'),
    ('Healthcare Directives', 'Medical and healthcare decision planning', 'healthcare')
ON CONFLICT (name) DO NOTHING;

