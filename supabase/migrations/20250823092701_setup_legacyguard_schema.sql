-- =================================================================
-- MIGRÁCIA: Inicializácia schémy pre LegacyGuard
-- Verzia: 1.0
-- =================================================================

-- =========== KROK 1: Nastavenie Storage (Úložiska) ===========
-- Vytvorenie súkromného bucketu pre používateľské dokumenty.
-- Tento SQL príkaz je bezpečné spustiť viackrát.
INSERT INTO storage.buckets (id, name, public, owner)
VALUES ('user_documents', 'user_documents', false, null)
ON CONFLICT (id) DO NOTHING;

-- Funkcia pre extrakciu user ID z file path (pre Clerk autentifikáciu)
CREATE OR REPLACE FUNCTION public.extract_user_id_from_path(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $
BEGIN
  -- File path format: "user_123abc/file.pdf"
  -- Extract first part before first slash
  RETURN split_part(file_path, '/', 1);
END;
$;
-- Politiky pre Storage sa musia nastaviť zvlášť, keďže nie sú súčasťou štandardných migrácií DB.
-- Tieto politiky zabezpečia, že používatelia môžu manipulovať len so svojimi súbormi.

-- Najprv odstránime existujúce politiky ak existujú
DROP POLICY IF EXISTS "Allow user to read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to delete their own files" ON storage.objects;

-- Politika pre Čítanie (SELECT) - pre Clerk autentifikáciu
CREATE POLICY "Allow user to read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user_documents' 
  AND public.extract_user_id_from_path(name) = app.current_external_id()
);

-- Politika pre Nahrávanie (INSERT) - pre Clerk autentifikáciu
CREATE POLICY "Allow user to upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_documents' 
  AND public.extract_user_id_from_path(name) = app.current_external_id()
);

-- Politika pre Aktualizáciu (UPDATE) - pre Clerk autentifikáciu
CREATE POLICY "Allow user to update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user_documents' 
  AND public.extract_user_id_from_path(name) = app.current_external_id()
)
WITH CHECK (
  bucket_id = 'user_documents' 
  AND public.extract_user_id_from_path(name) = app.current_external_id()
);

-- Politika pre Mazanie (DELETE) - pre Clerk autentifikáciu
CREATE POLICY "Allow user to delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_documents' 
  AND public.extract_user_id_from_path(name) = app.current_external_id()
);

-- ALTERNATÍVNE: Jednoduchšie riešenie pre development - povoliť všetko
-- DROP POLICY IF EXISTS "Allow all operations for development" ON storage.objects;
-- CREATE POLICY "Allow all operations for development"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'user_documents')
-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========== KROK 2: Nastavenie Databázovej Tabuľky `documents` ===========

-- Vytvorenie tabuľky pre metadáta dokumentov
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk user IDs
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  document_type TEXT DEFAULT 'General',
  expires_at TIMESTAMP WITH TIME ZONE,
  encrypted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Povolenie Row Level Security (RLS) pre tabuľku `documents`
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Najprv odstránime existujúce politiky ak existujú
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
-- Vytvorenie app schema pre helper funkcie (ak neexistuje)
CREATE SCHEMA IF NOT EXISTS app;

-- Helper funkcia na čítanie Clerk subject z JWT
CREATE OR REPLACE FUNCTION app.current_external_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
$$;

-- Politiky pre tabuľku `documents` - pre Clerk autentifikáciu
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (user_id = app.current_external_id());

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = app.current_external_id());

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE 
  USING (user_id = app.current_external_id())
  WITH CHECK (user_id = app.current_external_id());

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (user_id = app.current_external_id());

-- Vytvorenie indexov pre zrýchlenie dopytov (ak neexistujú)
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Vytvorenie funkcie pre trigger na automatickú aktualizáciu `updated_at`
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Vytvorenie triggeru, ktorý sa spustí pred každou aktualizáciou riadku
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Pridanie komentárov pre lepšiu orientáciu
COMMENT ON TABLE public.documents IS 'Stores metadata about user-uploaded documents.';
COMMENT ON POLICY "Users can view their own documents" ON public.documents IS 'Ensures users can only read their own document records.';
