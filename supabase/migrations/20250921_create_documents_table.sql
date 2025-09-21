-- Create documents table for document management system
-- This migration sets up the complete document schema with AI analysis capabilities

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create documents table
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- File metadata
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size BIGINT,

    -- Document metadata
    title TEXT,
    description TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    is_important BOOLEAN DEFAULT false,
    document_type TEXT DEFAULT 'General',

    -- Processing status
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),

    -- OCR and AI analysis results
    ocr_text TEXT,
    ocr_confidence DECIMAL(5,4),
    ai_extracted_text TEXT,
    ai_confidence DECIMAL(5,4),
    ai_suggested_tags TEXT[] DEFAULT '{}',
    ai_key_data JSONB,
    ai_processing_id TEXT,
    ai_reasoning JSONB,

    -- Classification
    classification_confidence DECIMAL(5,4),
    extracted_entities JSONB,
    extracted_metadata JSONB,

    -- Expiration tracking
    expiration_date DATE,
    expires_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_processing_status ON public.documents(processing_status);
CREATE INDEX idx_documents_expires_at ON public.documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_title_search ON public.documents USING gin(to_tsvector('english', title));
CREATE INDEX idx_documents_ocr_search ON public.documents USING gin(to_tsvector('english', ocr_text)) WHERE ocr_text IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for document files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user_documents',
    'user_documents',
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS policies
CREATE POLICY "Users can view own document files" ON storage.objects
    FOR SELECT USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own document files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own document files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own document files" ON storage.objects
    FOR DELETE USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to clean up orphaned files when document is deleted
CREATE OR REPLACE FUNCTION public.cleanup_document_files()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete associated file from storage
    IF OLD.file_path IS NOT NULL THEN
        PERFORM storage.delete_object('user_documents', OLD.file_path);
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER cleanup_document_files_trigger
    AFTER DELETE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_document_files();

-- Create view for document analytics
CREATE VIEW public.document_analytics AS
SELECT
    user_id,
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE processing_status = 'completed') as analyzed_documents,
    COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > NOW()) as documents_with_expiration,
    COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW() + INTERVAL '30 days') as expiring_soon,
    AVG(ocr_confidence) FILTER (WHERE ocr_confidence IS NOT NULL) as avg_ocr_confidence,
    AVG(classification_confidence) FILTER (WHERE classification_confidence IS NOT NULL) as avg_classification_confidence,
    array_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories_used,
    SUM(file_size) as total_storage_used
FROM public.documents
GROUP BY user_id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT ON public.document_analytics TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;