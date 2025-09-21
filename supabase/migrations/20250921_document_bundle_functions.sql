-- Database functions for document bundle intelligence and versioning
-- These functions support the Edge Function's advanced document analysis

-- Create document_bundles table for organizing related documents
CREATE TABLE IF NOT EXISTS public.document_bundles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    bundle_name TEXT NOT NULL,
    bundle_category TEXT NOT NULL,
    description TEXT,

    -- Entity information (car, property, person, etc.)
    primary_entity TEXT, -- e.g., "Honda Civic 2020", "123 Main St", "John Doe"
    entity_type TEXT, -- e.g., "vehicle", "property", "person", "institution"

    -- Search and matching
    keywords TEXT[] DEFAULT '{}',
    auto_add_rules JSONB DEFAULT '{}', -- Rules for automatically adding docs to this bundle

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Stats
    document_count INTEGER DEFAULT 0,
    last_document_added_at TIMESTAMPTZ
);

-- Create document_bundle_members table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.document_bundle_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bundle_id UUID NOT NULL REFERENCES public.document_bundles(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,

    -- Membership metadata
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by_user BOOLEAN DEFAULT true, -- false if added automatically
    confidence_score DECIMAL(3,2), -- How confident the AI was about this match
    match_reasons TEXT[] DEFAULT '{}',

    UNIQUE(bundle_id, document_id)
);

-- Create indexes
CREATE INDEX idx_document_bundles_user_id ON public.document_bundles(user_id);
CREATE INDEX idx_document_bundles_category ON public.document_bundles(bundle_category);
CREATE INDEX idx_document_bundles_entity ON public.document_bundles(primary_entity) WHERE primary_entity IS NOT NULL;
CREATE INDEX idx_document_bundles_keywords ON public.document_bundles USING gin(keywords);

CREATE INDEX idx_document_bundle_members_bundle ON public.document_bundle_members(bundle_id);
CREATE INDEX idx_document_bundle_members_document ON public.document_bundle_members(document_id);

-- Function to find potential bundles for a new document
CREATE OR REPLACE FUNCTION public.find_potential_bundles(
    doc_user_id UUID,
    doc_category TEXT,
    doc_keywords TEXT[],
    doc_ai_extracted_text TEXT,
    limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    bundle_id UUID,
    bundle_name TEXT,
    bundle_category TEXT,
    primary_entity TEXT,
    document_count INTEGER,
    match_score DECIMAL,
    match_reasons TEXT[]
) AS $$
DECLARE
    keyword_overlap INTEGER;
    text_similarity DECIMAL;
    category_match BOOLEAN;
    total_score DECIMAL;
BEGIN
    RETURN QUERY
    SELECT
        b.id as bundle_id,
        b.bundle_name,
        b.bundle_category,
        b.primary_entity,
        b.document_count,
        -- Calculate match score
        CASE
            WHEN b.bundle_category = doc_category THEN 0.4
            ELSE 0.0
        END +
        CASE
            WHEN array_length(ARRAY(SELECT unnest(b.keywords) INTERSECT SELECT unnest(doc_keywords)), 1) > 0
            THEN (array_length(ARRAY(SELECT unnest(b.keywords) INTERSECT SELECT unnest(doc_keywords)), 1)::DECIMAL / GREATEST(array_length(b.keywords, 1), 1)::DECIMAL) * 0.4
            ELSE 0.0
        END +
        CASE
            WHEN b.primary_entity IS NOT NULL AND doc_ai_extracted_text ILIKE '%' || b.primary_entity || '%'
            THEN 0.3
            ELSE 0.0
        END as match_score,
        -- Generate match reasons
        ARRAY(
            SELECT reason FROM (
                SELECT 'category_match' as reason WHERE b.bundle_category = doc_category
                UNION
                SELECT 'keyword_overlap' as reason WHERE array_length(ARRAY(SELECT unnest(b.keywords) INTERSECT SELECT unnest(doc_keywords)), 1) > 0
                UNION
                SELECT 'entity_mentioned' as reason WHERE b.primary_entity IS NOT NULL AND doc_ai_extracted_text ILIKE '%' || b.primary_entity || '%'
            ) reasons
        ) as match_reasons
    FROM public.document_bundles b
    WHERE b.user_id = doc_user_id
    AND (
        b.bundle_category = doc_category OR
        array_length(ARRAY(SELECT unnest(b.keywords) INTERSECT SELECT unnest(doc_keywords)), 1) > 0 OR
        (b.primary_entity IS NOT NULL AND doc_ai_extracted_text ILIKE '%' || b.primary_entity || '%')
    )
    ORDER BY match_score DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find potential document versions within a bundle
CREATE OR REPLACE FUNCTION public.find_potential_document_versions(
    doc_user_id UUID,
    doc_bundle_id UUID,
    doc_filename TEXT,
    doc_ai_extracted_text TEXT,
    similarity_threshold DECIMAL DEFAULT 0.6
)
RETURNS TABLE (
    document_id UUID,
    file_name TEXT,
    version_number INTEGER,
    version_date TIMESTAMPTZ,
    similarity_score DECIMAL,
    match_reasons TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id as document_id,
        d.file_name,
        ROW_NUMBER() OVER (ORDER BY d.created_at)::INTEGER as version_number,
        d.created_at as version_date,
        -- Calculate similarity score
        CASE
            -- Exact filename match (different extensions)
            WHEN regexp_replace(d.file_name, '\.[^.]*$', '') = regexp_replace(doc_filename, '\.[^.]*$', '') THEN 0.9
            -- Similar filename pattern
            WHEN d.file_name ILIKE '%' || split_part(doc_filename, '.', 1) || '%' THEN 0.7
            -- Category and text similarity
            WHEN d.category IS NOT NULL AND d.ai_extracted_text IS NOT NULL AND
                 length(d.ai_extracted_text) > 100 AND length(doc_ai_extracted_text) > 100 THEN
                -- Simple text similarity based on common words
                (array_length(ARRAY(
                    SELECT unnest(string_to_array(lower(d.ai_extracted_text), ' '))
                    INTERSECT
                    SELECT unnest(string_to_array(lower(doc_ai_extracted_text), ' '))
                ), 1)::DECIMAL /
                GREATEST(
                    array_length(string_to_array(d.ai_extracted_text, ' '), 1),
                    array_length(string_to_array(doc_ai_extracted_text, ' '), 1)
                )::DECIMAL) * 0.8
            ELSE 0.0
        END as similarity_score,
        -- Generate match reasons
        ARRAY(
            SELECT reason FROM (
                SELECT 'exact_filename_match' as reason
                WHERE regexp_replace(d.file_name, '\.[^.]*$', '') = regexp_replace(doc_filename, '\.[^.]*$', '')
                UNION
                SELECT 'similar_filename' as reason
                WHERE d.file_name ILIKE '%' || split_part(doc_filename, '.', 1) || '%'
                UNION
                SELECT 'content_similarity' as reason
                WHERE d.ai_extracted_text IS NOT NULL AND
                      length(d.ai_extracted_text) > 100 AND
                      length(doc_ai_extracted_text) > 100
            ) reasons
        ) as match_reasons
    FROM public.documents d
    JOIN public.document_bundle_members dbm ON d.id = dbm.document_id
    WHERE dbm.bundle_id = doc_bundle_id
    AND d.user_id = doc_user_id
    AND (
        -- Filename similarity
        regexp_replace(d.file_name, '\.[^.]*$', '') = regexp_replace(doc_filename, '\.[^.]*$', '') OR
        d.file_name ILIKE '%' || split_part(doc_filename, '.', 1) || '%' OR
        -- Content similarity (simplified)
        (d.ai_extracted_text IS NOT NULL AND doc_ai_extracted_text IS NOT NULL AND
         array_length(ARRAY(
             SELECT unnest(string_to_array(lower(d.ai_extracted_text), ' '))
             INTERSECT
             SELECT unnest(string_to_array(lower(doc_ai_extracted_text), ' '))
         ), 1) > 10)
    )
    HAVING similarity_score >= similarity_threshold
    ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create a bundle and add document
CREATE OR REPLACE FUNCTION public.create_bundle_with_document(
    p_user_id UUID,
    p_document_id UUID,
    p_bundle_name TEXT,
    p_bundle_category TEXT,
    p_primary_entity TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_keywords TEXT[] DEFAULT '{}',
    p_confidence_score DECIMAL DEFAULT 0.8,
    p_match_reasons TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_bundle_id UUID;
BEGIN
    -- Create the bundle
    INSERT INTO public.document_bundles (
        user_id, bundle_name, bundle_category, primary_entity, entity_type, keywords, document_count
    ) VALUES (
        p_user_id, p_bundle_name, p_bundle_category, p_primary_entity, p_entity_type, p_keywords, 1
    ) RETURNING id INTO new_bundle_id;

    -- Add the document to the bundle
    INSERT INTO public.document_bundle_members (
        bundle_id, document_id, added_by_user, confidence_score, match_reasons
    ) VALUES (
        new_bundle_id, p_document_id, false, p_confidence_score, p_match_reasons
    );

    -- Update bundle stats
    UPDATE public.document_bundles
    SET last_document_added_at = NOW()
    WHERE id = new_bundle_id;

    RETURN new_bundle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add document to existing bundle
CREATE OR REPLACE FUNCTION public.add_document_to_bundle(
    p_bundle_id UUID,
    p_document_id UUID,
    p_confidence_score DECIMAL DEFAULT 0.8,
    p_match_reasons TEXT[] DEFAULT '{}',
    p_added_by_user BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Add the document to the bundle (if not already there)
    INSERT INTO public.document_bundle_members (
        bundle_id, document_id, added_by_user, confidence_score, match_reasons
    ) VALUES (
        p_bundle_id, p_document_id, p_added_by_user, p_confidence_score, p_match_reasons
    ) ON CONFLICT (bundle_id, document_id) DO NOTHING;

    -- Update bundle stats
    UPDATE public.document_bundles
    SET
        document_count = (SELECT COUNT(*) FROM public.document_bundle_members WHERE bundle_id = p_bundle_id),
        last_document_added_at = NOW()
    WHERE id = p_bundle_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to keep document counts updated
CREATE OR REPLACE FUNCTION public.update_bundle_document_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.document_bundles
        SET document_count = document_count + 1
        WHERE id = NEW.bundle_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.document_bundles
        SET document_count = document_count - 1
        WHERE id = OLD.bundle_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bundle_count_trigger
    AFTER INSERT OR DELETE ON public.document_bundle_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bundle_document_count();

-- Row Level Security for bundles
ALTER TABLE public.document_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_bundle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bundles" ON public.document_bundles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bundle memberships" ON public.document_bundle_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.document_bundles b
            WHERE b.id = bundle_id AND b.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.document_bundles TO authenticated;
GRANT ALL ON public.document_bundle_members TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_potential_bundles TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_potential_document_versions TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_bundle_with_document TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_document_to_bundle TO authenticated;