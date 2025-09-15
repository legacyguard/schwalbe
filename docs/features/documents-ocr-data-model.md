# Documents & OCR – Data Model Addendum

Identity and RLS note
- Use app.current_external_id() and public.user_auth(clerk_id) helpers.
- Documents table uses TEXT user_id mapped from Clerk subject.
- Storage bucket user_documents is owner-scoped by folder path (userId/docId/...).

Tables/columns touched
- public.documents
  - file_name, file_path, file_type, file_size
  - ocr_text, ocr_confidence, classification_confidence
  - category, title, description, tags, is_important
  - expiration_date (DATE), expires_at (TIMESTAMPTZ)
  - ai_extracted_text, ai_suggested_tags, ai_key_data, ai_processing_id, ai_reasoning
  - processing_status lifecycle: pending -> processing -> completed | failed | manual
- reminder_rule (for expiry reminders)

Reminders hook
- When expiration_date is set on upload/analysis, create a reminder_rule scheduled ~30d before.
- Fallback to 7d before; if still in the past, schedule in ~1h.

Privacy-preserving search (future opt-in)
- Use public.hashed_tokens table (HMAC-SHA256 with server-only salt). No plaintext tokens.
- Client-side tokenization and hashing as per packages/shared/src/search/ingest.ts.
