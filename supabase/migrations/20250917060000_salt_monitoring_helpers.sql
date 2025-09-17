-- Helper functions for salt rotation monitoring and health checks
-- These functions support the salt monitoring and rotation scripts

-- Function to count unique indexed documents
CREATE OR REPLACE FUNCTION public.count_unique_indexed_docs()
RETURNS bigint AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT doc_id) FROM public.hashed_tokens);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get backup table names matching pattern
CREATE OR REPLACE FUNCTION public.get_backup_tables()
RETURNS TABLE(table_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT t.tablename::text
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename LIKE 'hashed_tokens_backup_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to estimate database size (in MB)
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT ROUND(
      pg_database_size(current_database())::numeric / (1024 * 1024), 2
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get search index statistics
CREATE OR REPLACE FUNCTION public.get_search_index_stats()
RETURNS TABLE(
  total_searchable_docs bigint,
  indexed_docs bigint,
  total_tokens bigint,
  coverage_percentage numeric,
  avg_tokens_per_doc numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH doc_stats AS (
    SELECT COUNT(*) as searchable_count
    FROM public.documents
    WHERE ocr_text IS NOT NULL
  ),
  index_stats AS (
    SELECT 
      COUNT(DISTINCT doc_id) as indexed_count,
      COUNT(*) as token_count,
      CASE 
        WHEN COUNT(DISTINCT doc_id) > 0 
        THEN COUNT(*)::numeric / COUNT(DISTINCT doc_id)
        ELSE 0
      END as avg_tokens
    FROM public.hashed_tokens
  )
  SELECT 
    ds.searchable_count,
    is.indexed_count,
    is.token_count,
    CASE 
      WHEN ds.searchable_count > 0 
      THEN ROUND((is.indexed_count::numeric / ds.searchable_count) * 100, 2)
      ELSE 0
    END as coverage_pct,
    ROUND(is.avg_tokens, 2)
  FROM doc_stats ds, index_stats is;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to identify stale search indexes
CREATE OR REPLACE FUNCTION public.get_stale_search_indexes()
RETURNS TABLE(
  doc_id text,
  document_updated_at timestamptz,
  index_created_at timestamptz,
  staleness_hours numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    ht.doc_id,
    d.updated_at as document_updated_at,
    MAX(ht.created_at) as index_created_at,
    ROUND(
      EXTRACT(EPOCH FROM (d.updated_at - MAX(ht.created_at))) / 3600, 2
    ) as staleness_hours
  FROM public.hashed_tokens ht
  INNER JOIN public.documents d ON d.id = ht.doc_id
  WHERE d.updated_at > ht.created_at
  GROUP BY ht.doc_id, d.updated_at
  HAVING d.updated_at > MAX(ht.created_at)
  ORDER BY staleness_hours DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old backup tables
CREATE OR REPLACE FUNCTION public.cleanup_old_backup_tables(
  days_to_keep integer DEFAULT 7
)
RETURNS TABLE(
  dropped_table text,
  backup_date text
) AS $$
DECLARE
  table_rec record;
  backup_date_str text;
  backup_date date;
  cutoff_date date;
BEGIN
  cutoff_date := CURRENT_DATE - days_to_keep;
  
  FOR table_rec IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename LIKE 'hashed_tokens_backup_%'
  LOOP
    -- Extract date from table name (format: hashed_tokens_backup_YYYYMMDD_HHMMSS)
    backup_date_str := substring(table_rec.tablename from 'hashed_tokens_backup_(\d{8})');
    
    IF backup_date_str IS NOT NULL AND length(backup_date_str) = 8 THEN
      BEGIN
        backup_date := to_date(backup_date_str, 'YYYYMMDD');
        
        IF backup_date < cutoff_date THEN
          EXECUTE format('DROP TABLE IF EXISTS %I', table_rec.tablename);
          
          RETURN QUERY SELECT table_rec.tablename, backup_date_str;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Skip tables with invalid date formats
          CONTINUE;
      END;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate search salt functionality
CREATE OR REPLACE FUNCTION public.test_search_salt_functionality()
RETURNS TABLE(
  test_name text,
  success boolean,
  message text
) AS $$
BEGIN
  -- Test 1: Check if we can query hashed_tokens
  BEGIN
    PERFORM COUNT(*) FROM public.hashed_tokens LIMIT 1;
    RETURN QUERY SELECT 'hashed_tokens_access'::text, true, 'Can access hashed_tokens table'::text;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'hashed_tokens_access'::text, false, SQLERRM::text;
  END;
  
  -- Test 2: Check if indexes exist
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'hashed_tokens' 
        AND indexname LIKE '%hash%'
    ) THEN
      RETURN QUERY SELECT 'hash_indexes'::text, true, 'Hash indexes exist'::text;
    ELSE
      RETURN QUERY SELECT 'hash_indexes'::text, false, 'Hash indexes missing'::text;
    END IF;
  END;
  
  -- Test 3: Check data consistency
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.hashed_tokens 
      WHERE hash IS NULL OR doc_id IS NULL
    ) THEN
      RETURN QUERY SELECT 'data_consistency'::text, false, 'Found NULL values in critical fields'::text;
    ELSE
      RETURN QUERY SELECT 'data_consistency'::text, true, 'No NULL values in critical fields'::text;
    END IF;
  END;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users for monitoring functions
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.count_unique_indexed_docs() TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.get_backup_tables() TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.get_database_size() TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.get_search_index_stats() TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.get_stale_search_indexes() TO authenticated, service_role;
  GRANT EXECUTE ON FUNCTION public.test_search_salt_functionality() TO authenticated, service_role;
  
  -- Only service_role can clean up backups
  GRANT EXECUTE ON FUNCTION public.cleanup_old_backup_tables(integer) TO service_role;
END $$;