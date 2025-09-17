-- Add AI analysis support to documents table for intelligent document organizer

-- Add AI-specific columns
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_extracted_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_suggested_tags TEXT[];
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_key_data JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_processing_id TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_reasoning JSONB;

-- Add indexes for AI-related queries
CREATE INDEX IF NOT EXISTS idx_documents_ai_confidence ON documents(ai_confidence);
CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_documents_ai_processing_id ON documents(ai_processing_id);
CREATE INDEX IF NOT EXISTS idx_documents_ai_key_data ON documents USING GIN(ai_key_data);
CREATE INDEX IF NOT EXISTS idx_documents_ai_suggested_tags ON documents USING GIN(ai_suggested_tags);

-- Add check constraints
ALTER TABLE documents ADD CONSTRAINT documents_ai_confidence_check 
  CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1));

-- Add comments for AI columns
COMMENT ON COLUMN documents.ai_extracted_text IS 'Full text extracted by AI analysis (OCR + processing)';
COMMENT ON COLUMN documents.ai_confidence IS 'AI analysis confidence score (0-1)';
COMMENT ON COLUMN documents.ai_suggested_tags IS 'Array of tags suggested by AI analysis';
COMMENT ON COLUMN documents.expiration_date IS 'Document expiration date extracted by AI';
COMMENT ON COLUMN documents.ai_key_data IS 'JSON array of key data points extracted by AI (amounts, account numbers, etc.)';
COMMENT ON COLUMN documents.ai_processing_id IS 'Unique ID for AI processing session';
COMMENT ON COLUMN documents.ai_reasoning IS 'JSON object containing AI reasoning for categorization and analysis';

-- Create a function to get documents expiring soon with AI analysis
CREATE OR REPLACE FUNCTION get_expiring_documents(
  user_uuid UUID,
  days_ahead INTEGER DEFAULT 30
) RETURNS TABLE (
  id UUID,
  title TEXT,
  file_name TEXT,
  category TEXT,
  expiration_date DATE,
  days_until_expiry INTEGER,
  ai_confidence DECIMAL(3,2),
  ai_suggested_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    COALESCE(d.title, d.file_name) as title,
    d.file_name,
    d.category,
    d.expiration_date,
    (d.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    d.ai_confidence,
    d.ai_suggested_tags
  FROM documents d
  WHERE 
    d.user_id = user_uuid
    AND d.expiration_date IS NOT NULL
    AND d.expiration_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '%s days', days_ahead)
  ORDER BY 
    d.expiration_date ASC,
    d.ai_confidence DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get AI analysis statistics
CREATE OR REPLACE FUNCTION get_ai_analysis_stats(
  user_uuid UUID
) RETURNS TABLE (
  total_documents BIGINT,
  ai_analyzed_documents BIGINT,
  avg_ai_confidence DECIMAL(5,2),
  documents_with_expiration BIGINT,
  documents_expiring_soon BIGINT,
  most_common_category TEXT,
  most_common_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total_docs,
      COUNT(CASE WHEN ai_confidence IS NOT NULL THEN 1 END) as ai_docs,
      AVG(ai_confidence) as avg_conf,
      COUNT(CASE WHEN expiration_date IS NOT NULL THEN 1 END) as docs_with_exp,
      COUNT(CASE WHEN expiration_date IS NOT NULL AND expiration_date <= (CURRENT_DATE + INTERVAL '30 days') THEN 1 END) as docs_exp_soon,
      MODE() WITHIN GROUP (ORDER BY category) as common_cat,
      array_agg(DISTINCT unnest(ai_suggested_tags)) as all_tags
    FROM documents 
    WHERE user_id = user_uuid
  ),
  tag_counts AS (
    SELECT unnest(all_tags) as tag, count(*) as tag_count
    FROM stats
    WHERE all_tags IS NOT NULL
    GROUP BY unnest(all_tags)
    ORDER BY count(*) DESC
    LIMIT 5
  )
  SELECT 
    s.total_docs,
    s.ai_docs,
    ROUND(s.avg_conf, 2),
    s.docs_with_exp,
    s.docs_exp_soon,
    s.common_cat,
    array_agg(tc.tag ORDER BY tc.tag_count DESC)
  FROM stats s
  LEFT JOIN tag_counts tc ON true
  GROUP BY s.total_docs, s.ai_docs, s.avg_conf, s.docs_with_exp, s.docs_exp_soon, s.common_cat;
END;
$$ LANGUAGE plpgsql;

-- Update the enhanced documents view to include AI data
DROP VIEW IF EXISTS documents_enhanced;
CREATE OR REPLACE VIEW documents_enhanced AS
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
FROM documents d;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_expiring_documents TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_analysis_stats TO authenticated;