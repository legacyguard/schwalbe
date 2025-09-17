-- Create document bundles system for Phase 2: Intelligent Document Linking
-- This enables grouping related documents into logical "packages"

-- Create enum for bundle categories
CREATE TYPE bundle_category AS ENUM (
  'personal',
  'housing', 
  'finances',
  'work',
  'health',
  'legal',
  'vehicles',
  'insurance',
  'other'
);

-- Create document_bundles table
CREATE TABLE document_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_name TEXT NOT NULL,
  bundle_category bundle_category NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata for smart suggestions
  primary_entity TEXT, -- e.g., "Škoda Octavia", "123 Main Street", "John Smith"
  entity_type TEXT,    -- e.g., "vehicle", "property", "person", "institution"
  keywords TEXT[],     -- Keywords for matching similar documents
  
  -- Bundle statistics
  document_count INTEGER DEFAULT 0,
  total_file_size BIGINT DEFAULT 0,
  last_document_added TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, bundle_name)
);

-- Add bundle_id column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES document_bundles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_document_bundles_user_id ON document_bundles(user_id);
CREATE INDEX idx_document_bundles_category ON document_bundles(bundle_category);
CREATE INDEX idx_document_bundles_entity ON document_bundles(primary_entity);
CREATE INDEX idx_document_bundles_keywords ON document_bundles USING GIN(keywords);
CREATE INDEX idx_documents_bundle_id ON documents(bundle_id) WHERE bundle_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE document_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bundles" ON document_bundles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bundles" ON document_bundles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bundles" ON document_bundles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bundles" ON document_bundles
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update bundle statistics when documents are added/removed
CREATE OR REPLACE FUNCTION update_bundle_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT or UPDATE (document added to bundle)
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.bundle_id IS NOT NULL) THEN
    UPDATE document_bundles 
    SET 
      document_count = (
        SELECT COUNT(*) 
        FROM documents 
        WHERE bundle_id = NEW.bundle_id AND bundle_id IS NOT NULL
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = NEW.bundle_id AND bundle_id IS NOT NULL
      ),
      last_document_added = NOW(),
      updated_at = NOW()
    WHERE id = NEW.bundle_id;
  END IF;

  -- Handle UPDATE (document removed from bundle) or DELETE
  IF TG_OP = 'UPDATE' AND OLD.bundle_id IS NOT NULL AND (NEW.bundle_id IS NULL OR NEW.bundle_id != OLD.bundle_id) THEN
    UPDATE document_bundles 
    SET 
      document_count = (
        SELECT COUNT(*) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id AND bundle_id IS NOT NULL
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id AND bundle_id IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = OLD.bundle_id;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' AND OLD.bundle_id IS NOT NULL THEN
    UPDATE document_bundles 
    SET 
      document_count = (
        SELECT COUNT(*) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id AND bundle_id IS NOT NULL
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id AND bundle_id IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = OLD.bundle_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic bundle statistics updates
CREATE TRIGGER update_bundle_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_bundle_stats();

-- Function to find potential bundle matches for a new document
CREATE OR REPLACE FUNCTION find_potential_bundles(
  doc_user_id UUID,
  doc_category TEXT,
  doc_keywords TEXT[],
  doc_ai_extracted_text TEXT DEFAULT NULL,
  limit_results INTEGER DEFAULT 5
) RETURNS TABLE (
  bundle_id UUID,
  bundle_name TEXT,
  bundle_category bundle_category,
  primary_entity TEXT,
  document_count INTEGER,
  match_score INTEGER,
  match_reasons TEXT[]
) AS $$
DECLARE
  keyword TEXT;
  score INTEGER;
  reasons TEXT[];
BEGIN
  RETURN QUERY
  WITH bundle_scores AS (
    SELECT 
      b.id,
      b.bundle_name,
      b.bundle_category,
      b.primary_entity,
      b.document_count,
      CASE 
        -- Perfect category match
        WHEN b.bundle_category::TEXT = doc_category THEN 50
        ELSE 0
      END +
      CASE 
        -- Keyword overlap scoring
        WHEN doc_keywords IS NOT NULL AND b.keywords IS NOT NULL THEN
          (SELECT COUNT(*) * 10 FROM unnest(doc_keywords) k WHERE k = ANY(b.keywords))
        ELSE 0
      END +
      CASE 
        -- Text similarity (basic)
        WHEN doc_ai_extracted_text IS NOT NULL AND b.primary_entity IS NOT NULL 
          AND position(lower(b.primary_entity) in lower(doc_ai_extracted_text)) > 0 THEN 30
        ELSE 0
      END AS match_score,
      
      -- Build match reasons array
      ARRAY(
        SELECT reason FROM (
          SELECT 'Same category (' || doc_category || ')' as reason
          WHERE b.bundle_category::TEXT = doc_category
          UNION ALL
          SELECT 'Keyword match: ' || array_to_string(
            ARRAY(SELECT k FROM unnest(doc_keywords) k WHERE k = ANY(b.keywords)), ', '
          )
          WHERE doc_keywords IS NOT NULL AND b.keywords IS NOT NULL 
            AND EXISTS(SELECT 1 FROM unnest(doc_keywords) k WHERE k = ANY(b.keywords))
          UNION ALL
          SELECT 'Entity reference: ' || b.primary_entity
          WHERE doc_ai_extracted_text IS NOT NULL AND b.primary_entity IS NOT NULL 
            AND position(lower(b.primary_entity) in lower(doc_ai_extracted_text)) > 0
        ) reasons_subq
      ) as match_reasons
      
    FROM document_bundles b
    WHERE b.user_id = doc_user_id
  )
  SELECT 
    bs.id,
    bs.bundle_name,
    bs.bundle_category,
    bs.primary_entity,
    bs.document_count,
    bs.match_score,
    bs.match_reasons
  FROM bundle_scores bs
  WHERE bs.match_score > 0
  ORDER BY bs.match_score DESC, bs.document_count DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new bundle and link document
CREATE OR REPLACE FUNCTION create_bundle_and_link_document(
  p_user_id UUID,
  p_bundle_name TEXT,
  p_bundle_category bundle_category,
  p_document_id UUID,
  p_description TEXT DEFAULT NULL,
  p_primary_entity TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_keywords TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  bundle_uuid UUID;
BEGIN
  -- Create the bundle
  INSERT INTO document_bundles (
    user_id,
    bundle_name,
    bundle_category,
    description,
    primary_entity,
    entity_type,
    keywords
  ) VALUES (
    p_user_id,
    p_bundle_name,
    p_bundle_category,
    p_description,
    p_primary_entity,
    p_entity_type,
    p_keywords
  ) RETURNING id INTO bundle_uuid;
  
  -- Link the document to the bundle
  UPDATE documents 
  SET bundle_id = bundle_uuid, updated_at = NOW()
  WHERE id = p_document_id AND user_id = p_user_id;
  
  RETURN bundle_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to link document to existing bundle
CREATE OR REPLACE FUNCTION link_document_to_bundle(
  p_document_id UUID,
  p_bundle_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verify bundle belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM document_bundles 
    WHERE id = p_bundle_id AND user_id = p_user_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Link document to bundle
  UPDATE documents 
  SET bundle_id = p_bundle_id, updated_at = NOW()
  WHERE id = p_document_id AND user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for enhanced bundle information
CREATE OR REPLACE VIEW bundles_with_documents AS
SELECT 
  b.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', d.id,
        'file_name', d.file_name,
        'document_type', d.document_type,
        'file_size', d.file_size,
        'created_at', d.created_at,
        'expiration_date', d.expiration_date,
        'ai_confidence', d.ai_confidence
      ) ORDER BY d.created_at DESC
    ) FILTER (WHERE d.id IS NOT NULL),
    '[]'::json
  ) as documents
FROM document_bundles b
LEFT JOIN documents d ON d.bundle_id = b.id
GROUP BY b.id, b.user_id, b.bundle_name, b.bundle_category, b.description, 
         b.created_at, b.updated_at, b.primary_entity, b.entity_type, 
         b.keywords, b.document_count, b.total_file_size, b.last_document_added;

-- Grant permissions
GRANT SELECT ON bundles_with_documents TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_bundles TO authenticated;
GRANT EXECUTE ON FUNCTION create_bundle_and_link_document TO authenticated;
GRANT EXECUTE ON FUNCTION link_document_to_bundle TO authenticated;

-- Add comments
COMMENT ON TABLE document_bundles IS 'Logical groupings of related documents (e.g., "Vehicle: Škoda Octavia")';
COMMENT ON COLUMN document_bundles.primary_entity IS 'Main entity this bundle represents (car model, property address, etc.)';
COMMENT ON COLUMN document_bundles.entity_type IS 'Type of entity (vehicle, property, person, institution)';
COMMENT ON COLUMN document_bundles.keywords IS 'Keywords for intelligent matching of new documents';
COMMENT ON FUNCTION find_potential_bundles IS 'Finds existing bundles that might be related to a new document';
COMMENT ON FUNCTION create_bundle_and_link_document IS 'Creates new bundle and links document in one transaction';
COMMENT ON FUNCTION link_document_to_bundle IS 'Links existing document to existing bundle with validation';