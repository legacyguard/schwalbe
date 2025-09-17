-- Add encryption_nonce column to documents table for storing nonce with encrypted files
-- This is needed for the new server-side key management system

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS encryption_nonce TEXT;

-- Add comment for documentation
COMMENT ON COLUMN documents.encryption_nonce IS 'Base64-encoded nonce used for document encryption, required for decryption';

-- Create index for performance when looking up documents
CREATE INDEX IF NOT EXISTS idx_documents_encryption_nonce 
ON documents(encryption_nonce) 
WHERE encryption_nonce IS NOT NULL;
