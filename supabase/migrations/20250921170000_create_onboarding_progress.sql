-- Create onboarding_progress table for remote persistence of onboarding state
-- Includes RLS using app.current_external_id() and helpful indexes

BEGIN;

CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id TEXT PRIMARY KEY,
  box_items TEXT,
  trusted_name TEXT,
  family_context JSONB DEFAULT '{}',
  completed_steps INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  total_time_spent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS: users manage only their own onboarding progress
CREATE POLICY IF NOT EXISTS "Users can manage own onboarding progress" ON onboarding_progress
  FOR ALL USING (app.current_external_id() = user_id) WITH CHECK (app.current_external_id() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_completed_steps ON onboarding_progress(completed_steps);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_completed_at ON onboarding_progress(completed_at) WHERE completed_at IS NOT NULL;

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_onboarding_progress ON onboarding_progress;
CREATE TRIGGER trg_set_updated_at_onboarding_progress
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_onboarding_progress();

COMMIT;