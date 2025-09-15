-- Automatic Will Updates - proposals and versions
-- Identity: Supabase Auth (auth.uid())

-- Create will_versions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'will_versions'
  ) THEN
    CREATE TABLE will_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      version_data JSONB NOT NULL,
      change_summary TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_will_versions_unique ON will_versions(will_id, version_number);
    CREATE INDEX IF NOT EXISTS idx_will_versions_will_id ON will_versions(will_id);

    ALTER TABLE will_versions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own will versions" ON will_versions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM wills
          WHERE wills.id = will_versions.will_id
            AND wills.user_id = auth.uid()::text
        )
      );
  END IF;
END $$;

-- Proposals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'will_update_proposals'
  ) THEN
    CREATE TABLE will_update_proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','applied','rolled_back')) DEFAULT 'pending',
      patch JSONB NOT NULL,
      summary TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      applied_at TIMESTAMPTZ,
      rolled_back_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_will_update_proposals_will_id ON will_update_proposals(will_id);
    CREATE INDEX IF NOT EXISTS idx_will_update_proposals_user_id ON will_update_proposals(user_id);
    CREATE INDEX IF NOT EXISTS idx_will_update_proposals_status ON will_update_proposals(status);

    ALTER TABLE will_update_proposals ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own proposals" ON will_update_proposals
      FOR SELECT USING (user_id = auth.uid()::text);
    CREATE POLICY "Users can insert own proposals" ON will_update_proposals
      FOR INSERT WITH CHECK (user_id = auth.uid()::text);
    CREATE POLICY "Users can update own proposals" ON will_update_proposals
      FOR UPDATE USING (user_id = auth.uid()::text);
  END IF;
END $$;