-- Create will_draft_versions table to store immutable snapshots of wizard progress per save
-- Complements will_drafts upsert by keeping historical versions

BEGIN;

CREATE TABLE IF NOT EXISTS will_draft_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  total_steps INTEGER NOT NULL,
  draft_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE will_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own draft versions" ON will_draft_versions
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own draft versions" ON will_draft_versions
  FOR INSERT WITH CHECK (app.current_external_id() = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_wdv_user_id ON will_draft_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_wdv_session_id ON will_draft_versions(session_id);
CREATE INDEX IF NOT EXISTS idx_wdv_created_at ON will_draft_versions(created_at DESC);

COMMIT;