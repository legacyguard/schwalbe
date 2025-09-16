-- Create Quick Insights and Legacy Milestones Tables
-- These tables support the insights engine and milestone tracking system

-- Enable UUID extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- disabled for remote compatibility (use gen_random_uuid())

-- Add trust score fields to wills table if they don't exist
ALTER TABLE wills 
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
ADD COLUMN IF NOT EXISTS trust_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_trust_calculation TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trust_score_history JSONB DEFAULT '[]'::jsonb;

-- Add professional review fields to documents table if they don't exist
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS professional_review_status TEXT DEFAULT 'none' 
    CHECK (professional_review_status IN ('none', 'requested', 'in_progress', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS professional_review_score INTEGER CHECK (professional_review_score >= 0 AND professional_review_score <= 100),
ADD COLUMN IF NOT EXISTS professional_review_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS professional_reviewer_id UUID,
ADD COLUMN IF NOT EXISTS review_findings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_recommendations JSONB DEFAULT '[]'::jsonb;

-- Quick Insights Table
CREATE TABLE IF NOT EXISTS quick_insights (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Using TEXT to match Clerk user IDs
    document_id UUID,
    type TEXT NOT NULL CHECK (type IN ('document_analysis', 'family_impact', 'time_saved', 'protection_level', 'completion_gap', 'urgent_action')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    value TEXT, -- e.g., "2.5 hours saved", "85% protection level"
    impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'important', 'nice_to_have')),
    actionable BOOLEAN DEFAULT false,
    action_text TEXT,
    action_url TEXT,
    metadata JSONB DEFAULT '{"calculatedAt": null, "confidence": 0, "category": "", "tags": []}'::jsonb,
    family_impact JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Legacy Milestones Table
CREATE TABLE IF NOT EXISTS legacy_milestones (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Using TEXT to match Clerk user IDs
    type TEXT NOT NULL CHECK (type IN ('first_document', 'protection_threshold', 'family_complete', 'professional_review', 'annual_update', 'legacy_complete')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('foundation', 'protection', 'family', 'professional', 'maintenance', 'mastery')),
    
    -- Milestone criteria
    criteria_type TEXT NOT NULL CHECK (criteria_type IN ('document_count', 'protection_percentage', 'family_members', 'time_based', 'action_completed', 'review_score')),
    criteria_threshold TEXT NOT NULL, -- Can be number or string
    criteria_current_value TEXT NOT NULL,
    criteria_is_complete BOOLEAN DEFAULT false,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    progress_steps_completed INTEGER DEFAULT 0,
    progress_total_steps INTEGER DEFAULT 1,
    progress_next_action TEXT,
    progress_next_action_url TEXT,
    
    -- Celebration and messaging
    celebration_should_show BOOLEAN DEFAULT false,
    celebration_text TEXT,
    celebration_family_impact_message TEXT,
    celebration_emotional_framing TEXT,
    celebration_icon TEXT,
    celebration_color TEXT,
    
    -- Rewards and benefits
    rewards JSONB DEFAULT '{}'::jsonb,
    
    -- Triggers and metadata
    triggers JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insight Analytics Table (for storing aggregated insights data)
CREATE TABLE IF NOT EXISTS insight_analytics (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    timeframe_start TIMESTAMPTZ NOT NULL,
    timeframe_end TIMESTAMPTZ NOT NULL,
    total_insights INTEGER DEFAULT 0,
    actionable_insights INTEGER DEFAULT 0,
    completed_actions INTEGER DEFAULT 0,
    average_protection_level DECIMAL(5,2) DEFAULT 0,
    total_time_saved DECIMAL(10,2) DEFAULT 0,
    top_categories JSONB DEFAULT '[]'::jsonb,
    trend_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Milestone Analytics Table  
CREATE TABLE IF NOT EXISTS milestone_analytics (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    timeframe_start TIMESTAMPTZ NOT NULL,
    timeframe_end TIMESTAMPTZ NOT NULL,
    milestones_completed INTEGER DEFAULT 0,
    average_completion_time_hours DECIMAL(10,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    most_active_category TEXT,
    preferred_difficulty TEXT,
    completion_trend TEXT CHECK (completion_trend IN ('improving', 'stable', 'declining')),
    total_protection_increase INTEGER DEFAULT 0,
    total_time_saved DECIMAL(10,2) DEFAULT 0,
    features_unlocked JSONB DEFAULT '[]'::jsonb,
    celebration_engagement DECIMAL(3,2) DEFAULT 0,
    recommendation_follow_rate DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_insights_user_id ON quick_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_insights_type ON quick_insights(type);
CREATE INDEX IF NOT EXISTS idx_quick_insights_priority ON quick_insights(priority);
CREATE INDEX IF NOT EXISTS idx_quick_insights_actionable ON quick_insights(actionable);
CREATE INDEX IF NOT EXISTS idx_quick_insights_created_at ON quick_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quick_insights_document_id ON quick_insights(document_id) WHERE document_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_legacy_milestones_user_id ON legacy_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_type ON legacy_milestones(type);
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_category ON legacy_milestones(category);
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='criteria_is_complete'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_legacy_milestones_completed ON legacy_milestones(criteria_is_complete)';
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS idx_legacy_milestones_created_at ON legacy_milestones(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insight_analytics_user_id ON insight_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_analytics_timeframe ON insight_analytics(timeframe_start, timeframe_end);

CREATE INDEX IF NOT EXISTS idx_milestone_analytics_user_id ON milestone_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_analytics_timeframe ON milestone_analytics(timeframe_start, timeframe_end);

-- Row Level Security Policies

-- Quick Insights RLS
ALTER TABLE quick_insights ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE v_type text;
BEGIN
  -- Drop existing policies if present
  DROP POLICY IF EXISTS "Users can view their own insights" ON quick_insights;
  DROP POLICY IF EXISTS "Users can create their own insights" ON quick_insights;
  DROP POLICY IF EXISTS "Users can update their own insights" ON quick_insights;
  DROP POLICY IF EXISTS "Users can delete their own insights" ON quick_insights;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='quick_insights' AND column_name='user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can view their own insights" ON quick_insights FOR SELECT USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can create their own insights" ON quick_insights FOR INSERT WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update their own insights" ON quick_insights FOR UPDATE USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can delete their own insights" ON quick_insights FOR DELETE USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view their own insights" ON quick_insights FOR SELECT USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can create their own insights" ON quick_insights FOR INSERT WITH CHECK (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can update their own insights" ON quick_insights FOR UPDATE USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can delete their own insights" ON quick_insights FOR DELETE USING (user_id = app.current_external_id())';
  END IF;
END$$;

-- Legacy Milestones RLS
ALTER TABLE legacy_milestones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE v_type text;
BEGIN
  DROP POLICY IF EXISTS "Users can view their own milestones" ON legacy_milestones;
  DROP POLICY IF EXISTS "Users can create their own milestones" ON legacy_milestones;
  DROP POLICY IF EXISTS "Users can update their own milestones" ON legacy_milestones;
  DROP POLICY IF EXISTS "Users can delete their own milestones" ON legacy_milestones;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can view their own milestones" ON legacy_milestones FOR SELECT USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can create their own milestones" ON legacy_milestones FOR INSERT WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update their own milestones" ON legacy_milestones FOR UPDATE USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can delete their own milestones" ON legacy_milestones FOR DELETE USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view their own milestones" ON legacy_milestones FOR SELECT USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can create their own milestones" ON legacy_milestones FOR INSERT WITH CHECK (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can update their own milestones" ON legacy_milestones FOR UPDATE USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can delete their own milestones" ON legacy_milestones FOR DELETE USING (user_id = app.current_external_id())';
  END IF;
END$$;

-- Insight Analytics RLS
ALTER TABLE insight_analytics ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE v_type text;
BEGIN
  DROP POLICY IF EXISTS "Users can view their own insight analytics" ON insight_analytics;
  DROP POLICY IF EXISTS "Users can create their own insight analytics" ON insight_analytics;
  DROP POLICY IF EXISTS "Users can update their own insight analytics" ON insight_analytics;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='insight_analytics' AND column_name='user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can view their own insight analytics" ON insight_analytics FOR SELECT USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can create their own insight analytics" ON insight_analytics FOR INSERT WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update their own insight analytics" ON insight_analytics FOR UPDATE USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view their own insight analytics" ON insight_analytics FOR SELECT USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can create their own insight analytics" ON insight_analytics FOR INSERT WITH CHECK (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can update their own insight analytics" ON insight_analytics FOR UPDATE USING (user_id = app.current_external_id())';
  END IF;
END$$;

-- Milestone Analytics RLS
ALTER TABLE milestone_analytics ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE v_type text;
BEGIN
  DROP POLICY IF EXISTS "Users can view their own milestone analytics" ON milestone_analytics;
  DROP POLICY IF EXISTS "Users can create their own milestone analytics" ON milestone_analytics;
  DROP POLICY IF EXISTS "Users can update their own milestone analytics" ON milestone_analytics;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='milestone_analytics' AND column_name='user_id';

  IF v_type = 'uuid' THEN
    EXECUTE 'CREATE POLICY "Users can view their own milestone analytics" ON milestone_analytics FOR SELECT USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can create their own milestone analytics" ON milestone_analytics FOR INSERT WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "Users can update their own milestone analytics" ON milestone_analytics FOR UPDATE USING (user_id = auth.uid())';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view their own milestone analytics" ON milestone_analytics FOR SELECT USING (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can create their own milestone analytics" ON milestone_analytics FOR INSERT WITH CHECK (user_id = app.current_external_id())';
    EXECUTE 'CREATE POLICY "Users can update their own milestone analytics" ON milestone_analytics FOR UPDATE USING (user_id = app.current_external_id())';
  END IF;
END$$;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_insights_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_milestones_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    
    -- Auto-mark as completed if criteria is met
    IF NEW.criteria_current_value::INTEGER >= NEW.criteria_threshold::INTEGER AND NOT NEW.criteria_is_complete THEN
        NEW.criteria_is_complete = true;
        NEW.completed_at = now();
        NEW.celebration_should_show = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_quick_insights_timestamp
    BEFORE UPDATE ON quick_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_insights_timestamp();

CREATE TRIGGER update_legacy_milestones_timestamp
    BEFORE UPDATE ON legacy_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_milestones_timestamp();

-- Insert default milestone templates (guarded)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='criteria_type')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='criteria_threshold')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='criteria_current_value')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='legacy_milestones' AND column_name='celebration_text') THEN
    INSERT INTO legacy_milestones (user_id, type, title, description, category, criteria_type, criteria_threshold, criteria_current_value, celebration_text, celebration_family_impact_message, celebration_emotional_framing, celebration_icon, celebration_color, metadata) VALUES
    -- This is a template that will be copied for each user, using a placeholder user_id
    ('template', 'first_document', 'First Document Upload', 'Upload your first important document to begin your legacy journey', 'foundation', 'document_count', '1', '0', 'Congratulations! You''ve planted the first seed in your Garden of Legacy!', 'Your family now has secure access to this important document', 'This moment marks the beginning of your family''s protected future', '🌱', 'emerald', '{"difficulty": "easy", "estimatedTime": "5 minutes", "priority": "high", "tags": ["beginner", "foundation", "important"], "version": "1.0"}')
    ON CONFLICT DO NOTHING;
  END IF;
END$$;

-- Grant permissions
GRANT ALL ON quick_insights TO authenticated;
GRANT ALL ON legacy_milestones TO authenticated;
GRANT ALL ON insight_analytics TO authenticated;
GRANT ALL ON milestone_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE quick_insights IS 'AI-generated insights about documents and family protection';
COMMENT ON TABLE legacy_milestones IS 'User milestone tracking for legacy planning progress';
COMMENT ON TABLE insight_analytics IS 'Aggregated analytics data for user insights';
COMMENT ON TABLE milestone_analytics IS 'Aggregated analytics data for user milestone progress';
COMMENT ON COLUMN quick_insights.type IS 'Type of insight: document_analysis, family_impact, time_saved, protection_level, completion_gap, urgent_action';
COMMENT ON COLUMN legacy_milestones.type IS 'Type of milestone: first_document, protection_threshold, family_complete, professional_review, annual_update, legacy_complete';
COMMENT ON COLUMN legacy_milestones.category IS 'Category: foundation, protection, family, professional, maintenance, mastery';

