# Environment Variables & Secrets

Purpose: Canonicalize environment config for auth, DB, and functions.

Supabase (web)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Supabase (functions/server)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-only; never in client)
- SEARCH_INDEX_SALT (server-only; used for HMAC hashing of search tokens; rotate carefully and reindex if changed)

Email (Resend)
- RESEND_API_KEY (server-only)

Rules
- No service-role on clients. Validate required envs at startup.
- .env.local for development; staging/production separate.
- Use platform secret managers in CI/CD.
