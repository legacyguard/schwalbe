-- Security Hardening Migration
-- Date: 2025-08-25

-- Ensure helper schema/function exist
CREATE SCHEMA IF NOT EXISTS app;
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Align document_bundles.user_id to Clerk TEXT ID and add RLS policies
DO $$
BEGIN
  -- First, drop existing policies that depend on the user_id column
  IF to_regclass('public.document_bundles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view own bundles" ON public.document_bundles;
    DROP POLICY IF EXISTS "Users can create own bundles" ON public.document_bundles;
    DROP POLICY IF EXISTS "Users can update own bundles" ON public.document_bundles;
    DROP POLICY IF EXISTS "Users can delete own bundles" ON public.document_bundles;
  END IF;

  -- Drop views that depend on document_bundles
  DROP VIEW IF EXISTS bundles_with_documents CASCADE;
  DROP VIEW IF EXISTS bundles_with_active_documents CASCADE;

  -- Drop FK if exists (UUID to auth.users)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'document_bundles' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    BEGIN
      ALTER TABLE document_bundles DROP CONSTRAINT IF EXISTS document_bundles_user_id_fkey;
    EXCEPTION WHEN undefined_table THEN NULL; END;
  END IF;

  -- Alter type to TEXT if column exists and is not already TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_bundles' AND column_name = 'user_id' AND data_type <> 'text'
  ) THEN
    ALTER TABLE document_bundles ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  END IF;

  -- Enable RLS
  BEGIN
    ALTER TABLE document_bundles ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;

-- Recreate the view with the updated column type
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

-- Grant permissions on the view
GRANT SELECT ON bundles_with_documents TO authenticated;

-- Recreate the bundles_with_active_documents view
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

GRANT SELECT ON bundles_with_active_documents TO authenticated;

-- Drop any existing policies and create Clerk-aware policies for document_bundles
DO $$
BEGIN
  IF to_regclass('public.document_bundles') IS NOT NULL THEN
    DROP POLICY IF EXISTS "bundles_select_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_insert_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_update_own" ON public.document_bundles;
    DROP POLICY IF EXISTS "bundles_delete_own" ON public.document_bundles;

    CREATE POLICY "bundles_select_own" ON public.document_bundles
      FOR SELECT TO authenticated USING (user_id = app.current_external_id());
    CREATE POLICY "bundles_insert_own" ON public.document_bundles
      FOR INSERT TO authenticated WITH CHECK (user_id = app.current_external_id());
    CREATE POLICY "bundles_update_own" ON public.document_bundles
      FOR UPDATE TO authenticated USING (user_id = app.current_external_id()) WITH CHECK (user_id = app.current_external_id());
    CREATE POLICY "bundles_delete_own" ON public.document_bundles
      FOR DELETE TO authenticated USING (user_id = app.current_external_id());
  END IF;
END $$;

-- Update functions to use TEXT for user_id
CREATE OR REPLACE FUNCTION find_potential_bundles(
  doc_user_id TEXT,  -- Changed from UUID to TEXT
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
      ) AS match_reasons
    FROM document_bundles b
    WHERE b.user_id = doc_user_id
  )
  SELECT 
    bs.id as bundle_id,
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
  p_user_id TEXT,  -- Changed from UUID to TEXT
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
  p_user_id TEXT  -- Changed from UUID to TEXT
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

-- Note: RLS cannot be applied to views. Ensure documents_enhanced remains a view without RLS; rely on base table RLS.
-- No-op for dropping policies on views (not supported by Postgres).
