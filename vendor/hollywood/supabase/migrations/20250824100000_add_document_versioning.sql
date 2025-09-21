-- Phase 3: Document Versioning and History System
-- Enables tracking of document versions and archiving old versions

-- Add versioning columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN DEFAULT true;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- Add indexes for version queries
CREATE INDEX IF NOT EXISTS idx_documents_is_archived ON documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_is_latest_version ON documents(is_latest_version) WHERE is_latest_version = true;
CREATE INDEX IF NOT EXISTS idx_documents_previous_version ON documents(previous_version_id) WHERE previous_version_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_version_chain ON documents(bundle_id, file_name, is_latest_version) WHERE bundle_id IS NOT NULL;

-- Add constraints
ALTER TABLE documents ADD CONSTRAINT documents_version_number_check 
  CHECK (version_number > 0);

-- Create function to find potential document versions within bundles
CREATE OR REPLACE FUNCTION find_potential_document_versions(
  doc_user_id UUID,
  doc_bundle_id UUID,
  doc_filename TEXT,
  doc_ai_extracted_text TEXT DEFAULT NULL,
  similarity_threshold REAL DEFAULT 0.7
) RETURNS TABLE (
  document_id UUID,
  file_name TEXT,
  version_number INTEGER,
  version_date TIMESTAMP WITH TIME ZONE,
  similarity_score REAL,
  match_reasons TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH potential_versions AS (
    SELECT 
      d.id,
      d.file_name,
      d.version_number,
      d.version_date,
      -- Calculate similarity based on filename and content
      CASE 
        -- Exact filename match (without extension and year)
        WHEN similarity(
          regexp_replace(lower(d.file_name), '\.(pdf|jpg|jpeg|png|doc|docx)$', ''),
          regexp_replace(lower(doc_filename), '\.(pdf|jpg|jpeg|png|doc|docx)$', '')
        ) > 0.8 THEN 0.9
        -- Similar filename
        WHEN similarity(lower(d.file_name), lower(doc_filename)) > 0.6 THEN 0.7
        -- Same document type and some content overlap
        WHEN d.document_type IS NOT NULL 
          AND doc_ai_extracted_text IS NOT NULL 
          AND d.ai_extracted_text IS NOT NULL
          AND similarity(lower(d.ai_extracted_text), lower(doc_ai_extracted_text)) > 0.5 THEN 0.6
        ELSE 0.0
      END as similarity_score,
      
      -- Build match reasons
      ARRAY(
        SELECT reason FROM (
          SELECT 'Similar filename: ' || d.file_name as reason
          WHERE similarity(lower(d.file_name), lower(doc_filename)) > 0.6
          UNION ALL
          SELECT 'Same document type: ' || d.document_type
          WHERE d.document_type IS NOT NULL
          UNION ALL
          SELECT 'Content similarity detected'
          WHERE doc_ai_extracted_text IS NOT NULL 
            AND d.ai_extracted_text IS NOT NULL
            AND similarity(lower(d.ai_extracted_text), lower(doc_ai_extracted_text)) > 0.5
          UNION ALL
          SELECT 'Year pattern detected'
          WHERE d.file_name ~ '\d{4}' AND doc_filename ~ '\d{4}'
        ) reasons_subq
      ) as match_reasons
      
    FROM documents d
    WHERE d.user_id = doc_user_id
      AND d.bundle_id = doc_bundle_id
      AND d.is_archived = false
      AND d.is_latest_version = true
      AND d.id != COALESCE((SELECT id FROM documents WHERE user_id = doc_user_id ORDER BY created_at DESC LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid)
  )
  SELECT 
    pv.id,
    pv.file_name,
    pv.version_number,
    pv.version_date,
    pv.similarity_score,
    pv.match_reasons
  FROM potential_versions pv
  WHERE pv.similarity_score >= similarity_threshold
  ORDER BY pv.similarity_score DESC, pv.version_date DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to archive document and create new version
CREATE OR REPLACE FUNCTION archive_document_and_create_version(
  old_document_id UUID,
  new_document_id UUID,
  archive_reason TEXT DEFAULT 'Replaced by newer version'
) RETURNS BOOLEAN AS $$
DECLARE
  old_doc RECORD;
  new_version_number INTEGER;
BEGIN
  -- Get old document details
  SELECT * INTO old_doc FROM documents WHERE id = old_document_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO new_version_number
  FROM documents 
  WHERE bundle_id = old_doc.bundle_id 
    AND similarity(lower(file_name), lower(old_doc.file_name)) > 0.6;
  
  -- Archive old document
  UPDATE documents 
  SET 
    is_archived = true,
    is_latest_version = false,
    archived_at = NOW(),
    archived_reason = archive_reason,
    updated_at = NOW()
  WHERE id = old_document_id;
  
  -- Update new document with version info
  UPDATE documents 
  SET 
    version_number = new_version_number,
    previous_version_id = old_document_id,
    is_latest_version = true,
    version_date = NOW(),
    updated_at = NOW()
  WHERE id = new_document_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create document version without archiving
CREATE OR REPLACE FUNCTION create_document_version(
  original_document_id UUID,
  new_document_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  original_doc RECORD;
  new_version_number INTEGER;
BEGIN
  -- Get original document details
  SELECT * INTO original_doc FROM documents WHERE id = original_document_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO new_version_number
  FROM documents 
  WHERE bundle_id = original_doc.bundle_id 
    AND similarity(lower(file_name), lower(original_doc.file_name)) > 0.6;
  
  -- Mark original document as not latest version
  UPDATE documents 
  SET 
    is_latest_version = false,
    updated_at = NOW()
  WHERE id = original_document_id;
  
  -- Update new document with version info
  UPDATE documents 
  SET 
    version_number = new_version_number,
    previous_version_id = original_document_id,
    is_latest_version = true,
    version_date = NOW(),
    updated_at = NOW()
  WHERE id = new_document_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get document version history
CREATE OR REPLACE FUNCTION get_document_version_history(
  p_document_id UUID
) RETURNS TABLE (
  id UUID,
  file_name TEXT,
  version_number INTEGER,
  version_date TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN,
  is_latest_version BOOLEAN,
  archived_reason TEXT,
  file_size BIGINT
) AS $$
DECLARE
  base_doc_id UUID;
  bundle_id_val UUID;
  base_filename TEXT;
BEGIN
  -- Get the bundle and filename for the document chain
  SELECT d.bundle_id, d.file_name 
  INTO bundle_id_val, base_filename
  FROM documents d 
  WHERE d.id = p_document_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return all versions of similar documents in the same bundle
  RETURN QUERY
  WITH version_chain AS (
    -- Start with the given document
    SELECT d.id, d.file_name, d.version_number, d.version_date, 
           d.is_archived, d.is_latest_version, d.archived_reason, d.file_size,
           0 as level
    FROM documents d
    WHERE d.id = p_document_id
    
    UNION ALL
    
    -- Find related versions (both newer and older)
    SELECT d.id, d.file_name, d.version_number, d.version_date,
           d.is_archived, d.is_latest_version, d.archived_reason, d.file_size,
           vc.level + 1
    FROM documents d
    JOIN version_chain vc ON (d.previous_version_id = vc.id OR vc.previous_version_id = d.id)
    WHERE vc.level < 10 -- Prevent infinite recursion
  )
  SELECT DISTINCT 
    vc.id, vc.file_name, vc.version_number, vc.version_date,
    vc.is_archived, vc.is_latest_version, vc.archived_reason, vc.file_size
  FROM version_chain vc
  ORDER BY vc.version_number DESC, vc.version_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Update bundle statistics to exclude archived documents by default
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
        WHERE bundle_id = NEW.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = NEW.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
      ),
      last_document_added = NOW(),
      updated_at = NOW()
    WHERE id = NEW.bundle_id;
  END IF;

  -- Handle UPDATE (document removed from bundle or archived) or DELETE
  IF TG_OP = 'UPDATE' AND OLD.bundle_id IS NOT NULL AND (NEW.bundle_id IS NULL OR NEW.bundle_id != OLD.bundle_id OR NEW.is_archived != OLD.is_archived) THEN
    UPDATE document_bundles 
    SET 
      document_count = (
        SELECT COUNT(*) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
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
        WHERE bundle_id = OLD.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
      ),
      total_file_size = (
        SELECT COALESCE(SUM(file_size), 0) 
        FROM documents 
        WHERE bundle_id = OLD.bundle_id 
          AND bundle_id IS NOT NULL 
          AND is_archived = false  -- Only count non-archived documents
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

-- Create enhanced view that excludes archived documents by default
CREATE OR REPLACE VIEW documents_active AS
SELECT 
  d.*,
  calculate_document_importance_score(d.is_important, d.expires_at, d.classification_confidence, d.tags) AS importance_score,
  CASE 
    WHEN d.expires_at IS NOT NULL AND d.expires_at <= (NOW() + INTERVAL '30 days') THEN true
    WHEN d.expiration_date IS NOT NULL AND d.expiration_date <= (CURRENT_DATE + INTERVAL '30 days') THEN true
    ELSE false 
  END AS expires_soon,
  CASE 
    WHEN d.expires_at IS NOT NULL AND d.expires_at <= NOW() THEN true
    WHEN d.expiration_date IS NOT NULL AND d.expiration_date <= CURRENT_DATE THEN true
    ELSE false 
  END AS is_expired,
  to_tsvector('english', 
    COALESCE(d.title, '') || ' ' || 
    COALESCE(d.description, '') || ' ' || 
    COALESCE(d.ocr_text, '') || ' ' ||
    COALESCE(d.ai_extracted_text, '')
  ) AS search_vector
FROM documents d
WHERE d.is_archived = false;

-- Create view for bundles with active documents only
CREATE OR REPLACE VIEW bundles_with_active_documents AS
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
        'ai_confidence', d.ai_confidence,
        'version_number', d.version_number,
        'is_latest_version', d.is_latest_version
      ) ORDER BY d.version_date DESC, d.created_at DESC
    ) FILTER (WHERE d.id IS NOT NULL),
    '[]'::json
  ) as documents,
  -- Count of archived documents for history indicator
  COALESCE(
    (SELECT COUNT(*) FROM documents ad WHERE ad.bundle_id = b.id AND ad.is_archived = true),
    0
  ) as archived_document_count
FROM document_bundles b
LEFT JOIN documents d ON d.bundle_id = b.id AND d.is_archived = false
GROUP BY b.id, b.user_id, b.bundle_name, b.bundle_category, b.description, 
         b.created_at, b.updated_at, b.primary_entity, b.entity_type, 
         b.keywords, b.document_count, b.total_file_size, b.last_document_added;

-- Grant permissions
GRANT SELECT ON documents_active TO authenticated;
GRANT SELECT ON bundles_with_active_documents TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_document_versions TO authenticated;
GRANT EXECUTE ON FUNCTION archive_document_and_create_version TO authenticated;
GRANT EXECUTE ON FUNCTION create_document_version TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_version_history TO authenticated;

-- Add comments
COMMENT ON COLUMN documents.is_archived IS 'Whether this document version has been archived (replaced by newer version)';
COMMENT ON COLUMN documents.version_number IS 'Version number within the same document series';
COMMENT ON COLUMN documents.previous_version_id IS 'Reference to the previous version of this document';
COMMENT ON COLUMN documents.is_latest_version IS 'Whether this is the current/latest version of the document';
COMMENT ON COLUMN documents.version_date IS 'When this version was created/uploaded';
COMMENT ON COLUMN documents.archived_at IS 'When this document was archived';
COMMENT ON COLUMN documents.archived_reason IS 'Reason for archiving this document';

COMMENT ON FUNCTION find_potential_document_versions IS 'Finds existing documents that might be older versions of a new document';
COMMENT ON FUNCTION archive_document_and_create_version IS 'Archives old document and sets up version chain with new document';
COMMENT ON FUNCTION create_document_version IS 'Creates version link between documents without archiving the original';
COMMENT ON FUNCTION get_document_version_history IS 'Returns complete version history for a document';
COMMENT ON VIEW documents_active IS 'View of non-archived documents only';
COMMENT ON VIEW bundles_with_active_documents IS 'Bundles with active documents and archived document count';