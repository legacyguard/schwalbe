# Security & Privacy Checklist – Documents & OCR

- Storage
  - Bucket: user_documents exists and is private
  - RLS restricts to auth.uid() folder prefix (or equivalent helper)
  - File paths do not leak PII beyond userId/docId/filename
- Database
  - documents RLS: owner-only CRUD using auth.uid() or app.current_external_id()
  - No plaintext search index; if enabled, use hashed_tokens only
  - AI/OCR outputs stored as TEXT/JSONB; avoid logging plaintext in server logs
- Edge Functions
  - intelligent-document-analyzer uses ALLOWED_ORIGINS and avoids logging secrets
  - hashed-search-ingest uses service role and SEARCH_INDEX_SALT; never returns token hashes for debugging
- Client
  - Feature flag VITE_ENABLE_HASHED_SEARCH_INGEST to control index updates
  - All UI strings in English; no secrets in client logs
- Observability
  - Use Supabase logs; ensure no PII in error payloads