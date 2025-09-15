-- Create will_drafts table for wizard save/resume
-- NOTE: Uses TEXT user_id to align with existing project conventions in data-model.md

BEGIN;

CREATE TABLE IF NOT EXISTS will_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step_number INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  draft_data JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id),
  CONSTRAINT valid_step CHECK (step_number BETWEEN 1 AND total_steps),
  CONSTRAINT future_expiry CHECK (expires_at > NOW())
);

ALTER TABLE will_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts" ON will_drafts
  FOR ALL USING (auth.uid()::text = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_will_drafts_user_id ON will_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_will_drafts_session_id ON will_drafts(session_id);
CREATE INDEX IF NOT EXISTS idx_will_drafts_expires_at ON will_drafts(expires_at);
CREATE INDEX IF NOT EXISTS idx_will_drafts_will_id ON will_drafts(will_id);

-- Timestamp maintenance trigger
CREATE OR REPLACE FUNCTION set_updated_at_will_drafts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at_will_drafts ON will_drafts;
CREATE TRIGGER trg_set_updated_at_will_drafts
  BEFORE UPDATE ON will_drafts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_will_drafts();

COMMIT;