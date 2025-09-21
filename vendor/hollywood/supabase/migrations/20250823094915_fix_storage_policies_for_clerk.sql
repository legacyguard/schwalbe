-- =================================================================
-- MIGRÁCIA: Produkčne pripravené Storage Policies pre Clerk Autentifikáciu
-- Verzia: 2.0 - Production Ready
-- =================================================================

-- Táto migrácia implementuje bezpečné development policies a produkčné Clerk RLS policies
-- Používame Clerk's native Supabase integration namiesto deprecated JWT template

-- Najprv odstránime existujúce komplikované politiky
DROP POLICY IF EXISTS "Allow user to read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow user to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "dev: allow authenticated users scoped to their folder" ON storage.objects;

-- Bezpečnejšie development policies (restricted to authenticated users and user-owned folders)
-- Toto je stále development-friendly, ale bezpečnejšie ako blanket access
CREATE POLICY "dev: allow authenticated users scoped to their folder"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'user_documents'
  AND (name LIKE auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'user_documents'
  AND (name LIKE auth.uid()::text || '/%')
);

-- Produkčné Clerk RLS policies pre storage.objects
-- Používame Clerk's native Supabase integration ktorý automaticky mapuje JWT sub na auth.uid()

-- Policy pre čítanie súborov - používatelia vidia len súbory vo svojom priečinku
CREATE POLICY "users_can_read_own_objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pre vkladanie súborov - používatelia vkladajú len do svojho priečinka
CREATE POLICY "users_can_insert_own_objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pre aktualizáciu súborov - používatelia aktualizujú len súbory vo svojom priečinku
CREATE POLICY "users_can_update_own_objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pre mazanie súborov - používatelia mazajú len súbory vo svojom priečinku
CREATE POLICY "users_can_delete_own_objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: Cannot add comments to policies on storage.objects as we don't own that table
-- Policy descriptions:
-- "dev: allow authenticated users scoped to their folder" - Development policy - allows authenticated users access only to their own folder. NOT FOR PRODUCTION!
-- "users_can_read_own_objects" - Production policy - users can read only files in their own folder using Clerk native integration.
-- "users_can_insert_own_objects" - Production policy - users can insert files only into their own folder using Clerk native integration.
-- "users_can_update_own_objects" - Production policy - users can update only files in their own folder using Clerk native integration.
-- "users_can_delete_own_objects" - Production policy - users can delete only files in their own folder using Clerk native integration.
