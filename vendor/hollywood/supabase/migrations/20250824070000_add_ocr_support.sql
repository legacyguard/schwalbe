-- Add OCR and AI processing support to documents table

-- Add new columns for OCR and AI processing
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false;

-- OCR-specific columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(3,2);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_entities JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS classification_confidence DECIMAL(3,2);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_metadata JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'manual' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'manual'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_important ON documents(is_important) WHERE is_important = true;
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_text_search ON documents USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(ocr_text, '')));

-- Add check constraints
ALTER TABLE documents ADD CONSTRAINT documents_ocr_confidence_check 
  CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1));

ALTER TABLE documents ADD CONSTRAINT documents_classification_confidence_check 
  CHECK (classification_confidence IS NULL OR (classification_confidence >= 0 AND classification_confidence <= 1));

-- Add comments for new columns
COMMENT ON COLUMN documents.category IS 'Document category (legal, financial, medical, etc.)';
COMMENT ON COLUMN documents.title IS 'Human-readable document title';
COMMENT ON COLUMN documents.description IS 'Document description or summary';
COMMENT ON COLUMN documents.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN documents.is_important IS 'Whether the document is marked as important';
COMMENT ON COLUMN documents.ocr_text IS 'Full text extracted from OCR processing';
COMMENT ON COLUMN documents.ocr_confidence IS 'OCR accuracy confidence score (0-1)';
COMMENT ON COLUMN documents.extracted_entities IS 'JSON array of entities extracted from document (names, dates, etc.)';
COMMENT ON COLUMN documents.classification_confidence IS 'Document classification confidence score (0-1)';
COMMENT ON COLUMN documents.extracted_metadata IS 'JSON object of structured metadata extracted from document';
COMMENT ON COLUMN documents.processing_status IS 'Status of AI/OCR processing';

-- Create a function to calculate document importance score
CREATE OR REPLACE FUNCTION calculate_document_importance_score(
  doc_important BOOLEAN,
  doc_expires_at TIMESTAMP WITH TIME ZONE,
  doc_classification_confidence DECIMAL,
  doc_tags TEXT[]
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  days_until_expiry INTEGER;
BEGIN
  -- Base score for important flag
  IF doc_important THEN
    score := score + 50;
  END IF;
  
  -- Score based on expiration urgency
  IF doc_expires_at IS NOT NULL THEN
    days_until_expiry := EXTRACT(DAYS FROM (doc_expires_at - NOW()));
    CASE
      WHEN days_until_expiry <= 7 THEN score := score + 40;  -- Expires in a week
      WHEN days_until_expiry <= 30 THEN score := score + 30; -- Expires in a month
      WHEN days_until_expiry <= 90 THEN score := score + 20; -- Expires in 3 months
      WHEN days_until_expiry <= 365 THEN score := score + 10; -- Expires in a year
    END CASE;
  END IF;
  
  -- Score based on classification confidence
  IF doc_classification_confidence IS NOT NULL THEN
    score := score + (doc_classification_confidence * 20)::INTEGER;
  END IF;
  
  -- Score based on tags
  IF doc_tags IS NOT NULL THEN
    IF 'urgent' = ANY(doc_tags) THEN score := score + 30; END IF;
    IF 'legal' = ANY(doc_tags) THEN score := score + 20; END IF;
    IF 'financial' = ANY(doc_tags) THEN score := score + 15; END IF;
    IF 'expires' = ANY(doc_tags) THEN score := score + 25; END IF;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Create a view for enhanced document search
CREATE OR REPLACE VIEW documents_enhanced AS
SELECT 
  d.*,
  calculate_document_importance_score(d.is_important, d.expires_at, d.classification_confidence, d.tags) AS importance_score,
  CASE 
    WHEN d.expires_at IS NOT NULL AND d.expires_at <= (NOW() + INTERVAL '30 days') THEN true 
    ELSE false 
  END AS expires_soon,
  CASE 
    WHEN d.expires_at IS NOT NULL AND d.expires_at <= NOW() THEN true 
    ELSE false 
  END AS is_expired,
  to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.ocr_text, '')) AS search_vector
FROM documents d;

-- Note: Cannot create RLS policies on views
-- The base documents table already has RLS policies that will be applied

-- Create a function to search documents with OCR content
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT,
  user_id_param TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
  id UUID,
  title TEXT,
  file_name TEXT,
  category TEXT,
  document_type TEXT,
  importance_score INTEGER,
  expires_soon BOOLEAN,
  is_expired BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.id,
    de.title,
    de.file_name,
    de.category,
    de.document_type,
    de.importance_score,
    de.expires_soon,
    de.is_expired,
    de.created_at,
    ts_rank(de.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM documents_enhanced de
  WHERE 
    (user_id_param IS NULL OR de.user_id = user_id_param)
    AND de.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY 
    ts_rank(de.search_vector, plainto_tsquery('english', search_query)) DESC,
    de.importance_score DESC,
    de.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON documents_enhanced TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_document_importance_score TO authenticated;