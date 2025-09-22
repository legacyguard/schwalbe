# Documents & OCR – Quickstart

This guide explains how to use the new Documents feature: upload, OCR, categorization suggestions, expiry detection, and reminder hooks.

Prerequisites
- Environment: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY configured in apps/web/.env.local
- Supabase Edge Function deployed: intelligent-document-analyzer
- Google Vision, OpenAI keys configured on the function (GOOGLE_CLOUD_API_KEY, SOFIA_OPENAI_API_KEY)
- Storage bucket `user_documents` exists with RLS (already provided in migrations)

User flow
1) Navigate to /documents and click Upload
2) Select a PDF or image; click Upload & Analyze
3) The app:
   - Inserts a processing document row
   - Uploads the file to storage at userId/documentId/filename
   - Calls the edge function for OCR and analysis
   - Stores OCR text, category/title suggestions, and (if found) sets expiration_date and expires_at
   - Creates an in-app + email reminder scheduled before the expiry date
4) You’ll be redirected to the document detail, with extracted text and metadata shown

Smoke test
- Upload a clear PDF with a visible date string like "Valid until 2025-12-31" -> verify:
  - documents.ocr_text is populated
  - documents.expiration_date is set
  - reminder_rule contains a newly created reminder with scheduled_at before the expiration

Security & privacy notes
- All UI text is English; OCR is performed server-side using the Edge Function
- No plaintext search index is created in the DB; if indexing is later enabled, use the hashed token system defined in migrations/specs
- Storage access is RLS-protected and restricted to each user’s folder

Troubleshooting
- If OCR fails, document.processing_status becomes 'manual'. You can retry later by re-uploading.
- Ensure the function has ALLOWED_ORIGINS set to include your dev URL (e.g., http://localhost:8082)
