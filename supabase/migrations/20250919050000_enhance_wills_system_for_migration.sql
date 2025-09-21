-- Enhancement to wills system for Hollywood migration
-- Adds fields and updates schema to match migrated services

-- Add new enum values for will status to match TypeScript types
ALTER TYPE will_status ADD VALUE 'executed';

-- Add new fields to wills table to match our TypeScript interface
ALTER TABLE wills ADD COLUMN IF NOT EXISTS jurisdiction TEXT DEFAULT 'CZ';
ALTER TABLE wills ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'cs';
ALTER TABLE wills ADD COLUMN IF NOT EXISTS form TEXT DEFAULT 'typed';
ALTER TABLE wills ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE wills ADD COLUMN IF NOT EXISTS validation_result JSONB DEFAULT '{}';
ALTER TABLE wills ADD COLUMN IF NOT EXISTS user_data JSONB DEFAULT '{}';
ALTER TABLE wills ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES will_templates(id);
ALTER TABLE wills ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE;

-- Update the status enum to include executed status (for compatibility)
ALTER TABLE wills ALTER COLUMN status TYPE TEXT;
DROP TYPE IF EXISTS will_status CASCADE;
CREATE TYPE will_status AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'executed',
  'archived'
);
ALTER TABLE wills ALTER COLUMN status TYPE will_status USING status::will_status;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_wills_jurisdiction ON wills(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_wills_language ON wills(language);
CREATE INDEX IF NOT EXISTS idx_wills_template_id ON wills(template_id);
CREATE INDEX IF NOT EXISTS idx_wills_executed_at ON wills(executed_at) WHERE executed_at IS NOT NULL;

-- Enhance will_templates table to match our TypeScript interface
ALTER TABLE will_templates ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE will_templates ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'cs';
ALTER TABLE will_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE will_templates ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE will_templates ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]';

-- Update template structure to be more flexible
UPDATE will_templates SET
  name = template_name,
  language = CASE
    WHEN jurisdiction LIKE '%CZ%' THEN 'cs'
    WHEN jurisdiction LIKE '%SK%' THEN 'sk'
    ELSE 'en'
  END,
  description = 'Standard will template for ' || jurisdiction,
  content = 'Template content placeholder',
  variables = '[
    {"key": "testatorName", "label": "Testator Name", "type": "text", "required": true},
    {"key": "testatorAddress", "label": "Testator Address", "type": "text", "required": true},
    {"key": "beneficiaries", "label": "Beneficiaries", "type": "array", "required": true},
    {"key": "executorName", "label": "Executor Name", "type": "text", "required": false}
  ]'
WHERE name IS NULL;

-- Add Czech and Slovak templates
INSERT INTO will_templates (
  jurisdiction,
  template_name,
  name,
  language,
  description,
  content,
  variables,
  template_structure,
  legal_requirements
) VALUES
-- Czech Republic Template
('CZ', 'Standardní závěť', 'Standardní závěť', 'cs',
'Standardní závěť pro českou jurisdikci s dodržením zákonných požadavků.',
'Já, {{testatorName}}, narozený/á dne {{testatorBirthDate}}, bytem {{testatorAddress}}, jako osoba při zdravé mysli a z vlastní vůle činím tuto závěť...',
'[
  {"key": "testatorName", "label": "Jméno zůstavitele", "type": "text", "required": true},
  {"key": "testatorBirthDate", "label": "Datum narození", "type": "date", "required": true},
  {"key": "testatorAddress", "label": "Adresa", "type": "text", "required": true},
  {"key": "beneficiaries", "label": "Dědicové", "type": "array", "required": true},
  {"key": "executorName", "label": "Vykonavatel závěti", "type": "text", "required": false}
]',
'{
  "sections": [
    {"id": "declaration", "title": "Prohlášení", "required": true},
    {"id": "personal_info", "title": "Osobní údaje", "required": true},
    {"id": "revocation", "title": "Zrušení předchozích závětí", "required": true},
    {"id": "beneficiaries", "title": "Dědicové a odkazy", "required": true},
    {"id": "executor", "title": "Vykonavatel závěti", "required": false},
    {"id": "guardianship", "title": "Poručník nezletilých", "required": false},
    {"id": "execution", "title": "Vyhotovení a svědci", "required": true}
  ]
}',
'{
  "witnessCount": 2,
  "notarizationRequired": false,
  "minimumAge": 18,
  "forcedHeirship": true,
  "holographicAllowed": true
}'),

-- Slovak Republic Template
('SK', 'Štandardný testament', 'Štandardný testament', 'sk',
'Štandardný testament pre slovenskú jurisdikciu s dodržaním zákonných požiadaviek.',
'Ja, {{testatorName}}, narodený/á dňa {{testatorBirthDate}}, bytom {{testatorAddress}}, ako osoba pri zdravom rozume a z vlastnej vôle činím tento testament...',
'[
  {"key": "testatorName", "label": "Meno poručiteľa", "type": "text", "required": true},
  {"key": "testatorBirthDate", "label": "Dátum narodenia", "type": "date", "required": true},
  {"key": "testatorAddress", "label": "Adresa", "type": "text", "required": true},
  {"key": "beneficiaries", "label": "Dedičia", "type": "array", "required": true},
  {"key": "executorName", "label": "Vykonávateľ testamentu", "type": "text", "required": false}
]',
'{
  "sections": [
    {"id": "declaration", "title": "Vyhlásenie", "required": true},
    {"id": "personal_info", "title": "Osobné údaje", "required": true},
    {"id": "revocation", "title": "Zrušenie predchádzajúcich testamentov", "required": true},
    {"id": "beneficiaries", "title": "Dedičia a odkazy", "required": true},
    {"id": "executor", "title": "Vykonávateľ testamentu", "required": false},
    {"id": "guardianship", "title": "Poručník maloletých", "required": false},
    {"id": "execution", "title": "Vyhotovenie a svedkovia", "required": true}
  ]
}',
'{
  "witnessCount": 2,
  "notarizationRequired": false,
  "minimumAge": 18,
  "forcedHeirship": true,
  "holographicAllowed": true
}')
ON CONFLICT (jurisdiction, template_name, template_version) DO NOTHING;

-- Create guardian table if it doesn't exist (for will-guardian integration)
CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  can_trigger_emergency BOOLEAN DEFAULT false,
  can_access_health_docs BOOLEAN DEFAULT false,
  can_access_financial_docs BOOLEAN DEFAULT false,
  is_child_guardian BOOLEAN DEFAULT false,
  is_will_executor BOOLEAN DEFAULT false,
  emergency_contact_priority INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for guardians
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON guardians(email);
CREATE INDEX IF NOT EXISTS idx_guardians_is_active ON guardians(is_active);
CREATE INDEX IF NOT EXISTS idx_guardians_is_will_executor ON guardians(is_will_executor);
CREATE INDEX IF NOT EXISTS idx_guardians_is_child_guardian ON guardians(is_child_guardian);

-- Enable RLS for guardians
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- RLS policies for guardians
CREATE POLICY IF NOT EXISTS "Users can view own guardians" ON guardians
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own guardians" ON guardians
  FOR INSERT WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own guardians" ON guardians
  FOR UPDATE USING (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own guardians" ON guardians
  FOR DELETE USING (app.current_external_id() = user_id);

-- Create family guidance entries table if it doesn't exist (for will guidance)
CREATE TABLE IF NOT EXISTS family_guidance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for family guidance entries
CREATE INDEX IF NOT EXISTS idx_family_guidance_user_id ON family_guidance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_family_guidance_entry_type ON family_guidance_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_family_guidance_is_completed ON family_guidance_entries(is_completed);

-- Enable RLS for family guidance entries
ALTER TABLE family_guidance_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for family guidance entries
CREATE POLICY IF NOT EXISTS "Users can view own guidance entries" ON family_guidance_entries
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own guidance entries" ON family_guidance_entries
  FOR INSERT WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own guidance entries" ON family_guidance_entries
  FOR UPDATE USING (app.current_external_id() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own guidance entries" ON family_guidance_entries
  FOR DELETE USING (app.current_external_id() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON guardians TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON family_guidance_entries TO authenticated;

-- Update the update trigger function to handle new fields
CREATE OR REPLACE FUNCTION update_will_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Auto-complete when all required sections are filled
  IF NEW.status = 'in_progress' AND
     NEW.testator_data ? 'fullName' AND
     NEW.beneficiaries != '[]'::jsonb AND
     NEW.executor_data ? 'primaryExecutor' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comments for new fields
COMMENT ON COLUMN wills.jurisdiction IS 'Legal jurisdiction for the will (CZ, SK, etc.)';
COMMENT ON COLUMN wills.language IS 'Language of the will content (cs, sk, en)';
COMMENT ON COLUMN wills.form IS 'Type of will form (typed, holographic)';
COMMENT ON COLUMN wills.content IS 'Generated will content as text';
COMMENT ON COLUMN wills.validation_result IS 'Validation result from will generation';
COMMENT ON COLUMN wills.user_data IS 'Complete user data used for will generation';
COMMENT ON COLUMN wills.template_id IS 'Reference to the template used';
COMMENT ON COLUMN wills.executed_at IS 'When the will was executed/finalized';

COMMENT ON TABLE guardians IS 'Guardian contacts for emergency and will execution';
COMMENT ON TABLE family_guidance_entries IS 'Family guidance entries and instructions';