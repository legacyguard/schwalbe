-- Enhanced Onboarding Progress Table
-- This migration extends the existing onboarding_progress table with new fields
-- for Phase 1.2 User State Detection and Onboarding Flow Logic

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns for enhanced onboarding tracking
DO $$
BEGIN
  -- User state detection fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'user_state') THEN
    ALTER TABLE onboarding_progress ADD COLUMN user_state JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'questionnaire_responses') THEN
    ALTER TABLE onboarding_progress ADD COLUMN questionnaire_responses JSONB;
  END IF;

  -- Flow control fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'current_phase') THEN
    ALTER TABLE onboarding_progress ADD COLUMN current_phase TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'can_resume') THEN
    ALTER TABLE onboarding_progress ADD COLUMN can_resume BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'has_skipped') THEN
    ALTER TABLE onboarding_progress ADD COLUMN has_skipped BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'last_activity_at') THEN
    ALTER TABLE onboarding_progress ADD COLUMN last_activity_at TIMESTAMPTZ;
  END IF;

  -- Existing fields (ensure they exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'box_items') THEN
    ALTER TABLE onboarding_progress ADD COLUMN box_items TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'trusted_name') THEN
    ALTER TABLE onboarding_progress ADD COLUMN trusted_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'family_context') THEN
    ALTER TABLE onboarding_progress ADD COLUMN family_context JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'completed_steps') THEN
    ALTER TABLE onboarding_progress ADD COLUMN completed_steps INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'completed_at') THEN
    ALTER TABLE onboarding_progress ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_progress' AND column_name = 'total_time_spent') THEN
    ALTER TABLE onboarding_progress ADD COLUMN total_time_spent INTEGER; -- in minutes
  END IF;
END $$;

-- Create unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_progress_user_id_key') THEN
    ALTER TABLE onboarding_progress ADD CONSTRAINT onboarding_progress_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_current_phase ON onboarding_progress(current_phase);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_can_resume ON onboarding_progress(can_resume);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_last_activity ON onboarding_progress(last_activity_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can insert own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can update own onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can delete own onboarding progress" ON onboarding_progress;

-- Create RLS policies
CREATE POLICY "Users can view own onboarding progress" ON onboarding_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON onboarding_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON onboarding_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding progress" ON onboarding_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set last_activity_at when certain fields change
CREATE OR REPLACE FUNCTION update_last_activity_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at when user makes progress
  IF (
    OLD.current_phase IS DISTINCT FROM NEW.current_phase OR
    OLD.completed_steps IS DISTINCT FROM NEW.completed_steps OR
    OLD.user_state IS DISTINCT FROM NEW.user_state OR
    OLD.questionnaire_responses IS DISTINCT FROM NEW.questionnaire_responses
  ) THEN
    NEW.last_activity_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic last_activity_at updates
DROP TRIGGER IF EXISTS update_onboarding_progress_activity ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_activity
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity_at();

-- Add some helpful comments
COMMENT ON TABLE onboarding_progress IS 'Tracks user progress through the LegacyGuard onboarding process';
COMMENT ON COLUMN onboarding_progress.user_state IS 'JSON object containing user state detection results (life situation, confidence level, goals, preferences)';
COMMENT ON COLUMN onboarding_progress.questionnaire_responses IS 'JSON object containing detailed questionnaire responses';
COMMENT ON COLUMN onboarding_progress.current_phase IS 'Current phase in the onboarding flow (user-state, questionnaire, scene-1, scene-2, scene-3, scene-4, completed)';
COMMENT ON COLUMN onboarding_progress.can_resume IS 'Whether the user can resume onboarding from where they left off';
COMMENT ON COLUMN onboarding_progress.has_skipped IS 'Whether the user has skipped any parts of the onboarding';
COMMENT ON COLUMN onboarding_progress.last_activity_at IS 'Timestamp of last user activity in onboarding';