-- Tighten RLS policies for professional review tables by reinstating precise document-owner checks
-- Guards are included to be safe across different environments and ordering.

-- Ensure helper identity function exists (matches prior definition)
CREATE SCHEMA IF NOT EXISTS app;
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Tighten document_reviews: users can view only reviews of their own documents
DO $POLICY$
BEGIN
  IF to_regclass('public.document_reviews') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY';

    -- Drop any relaxed or alternative policies that might broaden access
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'document_reviews' 
        AND policyname = 'Users can view reviews of their documents'
    ) THEN
      EXECUTE 'DROP POLICY "Users can view reviews of their documents" ON public.document_reviews';
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'document_reviews' 
        AND policyname = 'Users can view own reviews'
    ) THEN
      EXECUTE 'DROP POLICY "Users can view own reviews" ON public.document_reviews';
    END IF;

    EXECUTE '
      CREATE POLICY "Users can view reviews of their documents" ON public.document_reviews
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM public.documents d
            WHERE d.id = public.document_reviews.document_id
              AND d.user_id = app.current_external_id()
          )
        )
    ';
  END IF;
END
$POLICY$;

-- Tighten review_results: users can view only results tied to their own documents
DO $POLICY$
BEGIN
  IF to_regclass('public.review_results') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.review_results ENABLE ROW LEVEL SECURITY';

    -- Drop any relaxed or alternative policies that might broaden access
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'review_results' 
        AND policyname = 'Users can view results of their document reviews'
    ) THEN
      EXECUTE 'DROP POLICY "Users can view results of their document reviews" ON public.review_results';
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'review_results' 
        AND policyname = 'Users can view own review results'
    ) THEN
      EXECUTE 'DROP POLICY "Users can view own review results" ON public.review_results';
    END IF;

    EXECUTE '
      CREATE POLICY "Users can view results of their document reviews" ON public.review_results
        FOR SELECT USING (
          EXISTS (
            SELECT 1
            FROM public.document_reviews dr
            JOIN public.documents d ON d.id = dr.document_id
            WHERE dr.id = public.review_results.review_id
              AND d.user_id = app.current_external_id()
          )
        )
    ';
  END IF;
END
$POLICY$;
