-- Phase 6: Will Generator System
-- Enables structured will creation and management

-- Create enum for will status
CREATE TYPE will_status AS ENUM (
  'draft',
  'in_progress', 
  'completed',
  'archived'
);

-- Create enum for relationship types
CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'child',
  'parent',
  'sibling',
  'grandchild',
  'friend',
  'charity',
  'other'
);

-- Create wills table
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Metadata
  title TEXT NOT NULL DEFAULT 'My Last Will and Testament',
  status will_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Personal Information
  testator_data JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "fullName": "John Doe",
  --   "dateOfBirth": "1980-01-01", 
  --   "address": "123 Main St, City, State",
  --   "citizenship": "US",
  --   "maritalStatus": "married"
  -- }
  
  -- Beneficiaries and inheritance
  beneficiaries JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{
  --   "id": "uuid",
  --   "name": "Jane Doe",
  --   "relationship": "spouse",
  --   "percentage": 50,
  --   "specificGifts": ["house", "car"],
  --   "conditions": "if surviving"
  -- }]
  
  -- Assets and property
  assets JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "realEstate": [{"description": "Family Home", "address": "123 Main St", "value": 500000}],
  --   "vehicles": [{"make": "Honda", "model": "Civic", "year": 2020, "vin": "12345"}],
  --   "bankAccounts": [{"bank": "Chase", "accountNumber": "****1234", "type": "checking"}],
  --   "investments": [{"company": "Vanguard", "accountType": "401k", "value": 100000}],
  --   "personalProperty": [{"description": "Wedding ring", "value": 5000, "recipient": "spouse"}]
  -- }
  
  -- Executor information
  executor_data JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "primaryExecutor": {"name": "John Smith", "relationship": "friend", "phone": "555-1234"},
  --   "backupExecutor": {"name": "Jane Smith", "relationship": "sibling"},
  --   "executorPowers": ["sell real estate", "manage investments", "pay debts"]
  -- }
  
  -- Guardian information (for minor children)
  guardianship_data JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "minorChildren": [{"name": "Child Name", "dateOfBirth": "2010-01-01"}],
  --   "primaryGuardian": {"name": "Guardian Name", "relationship": "sibling"},
  --   "backupGuardian": {"name": "Backup Guardian", "relationship": "friend"},
  --   "guardianInstructions": "Special care instructions"
  -- }
  
  -- Special instructions and wishes
  special_instructions JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "funeralWishes": "Cremation preferred",
  --   "organDonation": true,
  --   "petCare": "Please care for my dog Max",
  --   "digitalAssets": "See separate digital estate plan",
  --   "personalMessages": [{"recipient": "spouse", "message": "Thank you for everything"}],
  --   "charitableBequests": [{"charity": "Red Cross", "amount": 10000}]
  -- }
  
  -- Legal and technical data
  legal_data JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "jurisdiction": "California",
  --   "witnessRequirements": 2,
  --   "notarization": false,
  --   "revocationClause": true,
  --   "previousWills": "This will revokes all previous wills"
  -- }
  
  -- Generated document data
  document_data JSONB NOT NULL DEFAULT '{}',
  -- Structure: {
  --   "generatedPdfPath": "user_id/wills/will_uuid.pdf",
  --   "pdfSize": 125000,
  --   "generationDate": "2025-01-25T10:00:00Z",
  --   "templateVersion": "1.0",
  --   "pageCount": 8
  -- }
  
  -- Trust Score fields
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  trust_factors JSONB DEFAULT '[]'::jsonb,
  last_trust_calculation TIMESTAMPTZ,
  trust_score_history JSONB DEFAULT '[]'::jsonb,
  
  -- Version control
  version_number INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_wills_user_id ON wills(user_id);
CREATE INDEX idx_wills_status ON wills(status);
CREATE INDEX idx_wills_updated_at ON wills(updated_at DESC);
CREATE INDEX idx_wills_parent_will ON wills(parent_will_id) WHERE parent_will_id IS NOT NULL;

-- Create will_templates table for jurisdictional templates
CREATE TABLE will_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL, -- e.g., "US-California", "US-Texas", "Slovakia"
  template_name TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0',
  
  -- Template structure and clauses
  template_structure JSONB NOT NULL,
  -- Structure defines required sections, optional fields, and legal requirements
  
  legal_requirements JSONB NOT NULL DEFAULT '{}',
  -- Jurisdiction-specific requirements like witness count, notarization, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(jurisdiction, template_name, template_version)
);

-- Add RLS policies
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_templates ENABLE ROW LEVEL SECURITY;

-- Ensure helper schema/function exist
CREATE SCHEMA IF NOT EXISTS app;
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Users can only access their own wills
CREATE POLICY "Users can view own wills" ON wills
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY "Users can create own wills" ON wills
  FOR INSERT WITH CHECK (app.current_external_id() = user_id);

CREATE POLICY "Users can update own wills" ON wills
  FOR UPDATE USING (app.current_external_id() = user_id);

CREATE POLICY "Users can delete own wills" ON wills
  FOR DELETE USING (app.current_external_id() = user_id);

-- Templates are read-only for all authenticated users
CREATE POLICY "Authenticated users can view templates" ON will_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Function to update will updated_at timestamp
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wills_timestamp
  BEFORE UPDATE ON wills
  FOR EACH ROW
  EXECUTE FUNCTION update_will_timestamp();

-- Function to create will version/revision
CREATE OR REPLACE FUNCTION create_will_revision(
  original_will_id UUID,
  user_id_param TEXT
) RETURNS UUID AS $$
DECLARE
  original_will RECORD;
  new_will_id UUID;
  new_version_number INTEGER;
BEGIN
  -- Get original will data
  SELECT * INTO original_will 
  FROM wills 
  WHERE id = original_will_id AND user_id = user_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original will not found or access denied';
  END IF;
  
  -- Calculate new version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO new_version_number
  FROM wills 
  WHERE parent_will_id = original_will_id OR id = original_will_id;
  
  -- Archive original will
  UPDATE wills 
  SET status = 'archived', updated_at = NOW()
  WHERE id = original_will_id;
  
  -- Create new revision
  INSERT INTO wills (
    user_id, title, status, testator_data, beneficiaries, assets,
    executor_data, guardianship_data, special_instructions, legal_data,
    version_number, parent_will_id
  ) VALUES (
    original_will.user_id,
    original_will.title || ' (Revision ' || new_version_number || ')',
    'draft',
    original_will.testator_data,
    original_will.beneficiaries,
    original_will.assets,
    original_will.executor_data,
    original_will.guardianship_data,
    original_will.special_instructions,
    original_will.legal_data,
    new_version_number,
    original_will_id
  ) RETURNING id INTO new_will_id;
  
  RETURN new_will_id;
END;
$$ LANGUAGE plpgsql;

-- Insert basic US template
INSERT INTO will_templates (jurisdiction, template_name, template_structure, legal_requirements) VALUES
('US-General', 'Standard Will Template', 
'{
  "sections": [
    {"id": "declaration", "title": "Declaration", "required": true},
    {"id": "personal_info", "title": "Personal Information", "required": true},
    {"id": "revocation", "title": "Revocation of Previous Wills", "required": true},
    {"id": "beneficiaries", "title": "Beneficiaries and Bequests", "required": true},
    {"id": "executor", "title": "Executor Appointment", "required": true},
    {"id": "guardianship", "title": "Guardian Appointment", "required": false},
    {"id": "special_instructions", "title": "Special Instructions", "required": false},
    {"id": "execution", "title": "Execution and Witnesses", "required": true}
  ],
  "clauses": {
    "revocation": "I hereby revoke all wills and codicils previously made by me.",
    "residual_estate": "All the rest, residue and remainder of my estate I give to my beneficiaries as specified herein."
  }
}',
'{
  "witnessCount": 2,
  "notarizationRequired": false,
  "selfProving": true,
  "minimumAge": 18,
  "mentalCapacity": true
}');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON wills TO authenticated;
GRANT SELECT ON will_templates TO authenticated;
GRANT EXECUTE ON FUNCTION create_will_revision TO authenticated;

-- Add comments
COMMENT ON TABLE wills IS 'User-created wills with structured data for generation';
COMMENT ON TABLE will_templates IS 'Jurisdictional templates for will generation';
COMMENT ON COLUMN wills.testator_data IS 'Personal information of the person making the will';
COMMENT ON COLUMN wills.beneficiaries IS 'Array of beneficiaries with inheritance details';
COMMENT ON COLUMN wills.assets IS 'Structured asset inventory for distribution';
COMMENT ON COLUMN wills.executor_data IS 'Executor and backup executor information';
COMMENT ON COLUMN wills.guardianship_data IS 'Guardian appointments for minor children';
COMMENT ON COLUMN wills.special_instructions IS 'Funeral wishes, personal messages, charitable bequests';
COMMENT ON FUNCTION create_will_revision IS 'Creates a new revision of an existing will';