# Privacy & Security Checklist (schwalbe)

Scope
- Logging: packages/shared/src/services/monitoring.service.ts; Supabase monitoring tables
- Search: packages/shared/src/search/*; supabase/functions/hashed-search-*
- Sharing: apps/web/src/features/sharing/*; Supabase sharing tables and RPCs

Principles
- Secrets via env only; never print secrets
- No PII in logs; only structured, sanitized errors
- Search index uses hashed+salted tokens; no raw-term logging
- Sharing links: password hashing, expiration/revocation, audit logs, least privilege
- Auditing where feasible; RLS smoke tests

Checklist

1) Secrets management
- [x] Supabase client keys read from env in client.ts/lib/supabase.ts
- [x] Search hashing salt read from env on server/edge only
- [x] Critical alert email uses env; avoids printing provider responses
- [ ] Verify CI masks: CI exposure of envs (ticket)

2) Logging and monitoring
- [x] Add redaction utilities to monitoring.service to sanitize message/context/stack
- [x] Avoid logging error details on persistence and alert errors
- [x] Analytics event payload sanitized; performance flush sanitized
- [x] Avoid duplicating raw error details into analytics (trackError now routes to error() with sanitization)
- [ ] Ensure error_log RLS excludes anon writes (already hardened in 20250915083000_harden_error_log_rls.sql); verify deployed (ticket)

3) Search privacy
- [x] Client/server search modules only compute hashes (HMAC-SHA256 with env salt)
- [x] Edge functions never log raw queries; only generic errors
- [x] DB migration creates hashed_tokens with RLS: select owner-only, write service_role only

4) Sharing security
- [x] Tables: share_links, share_audits with password_hash (bcrypt via pgcrypto)
- [x] RPC create_share_link, verify_share_access with SECURITY DEFINER and limited grants
- [x] Viewer avoids leaking data and disables indexing via robots meta
- [ ] Add revoke/share audit helpers and tests (ticket)
- [ ] Brute-force mitigation policy (rate limit via Edge function or app layer) (ticket)

5) Auditing and tests
- [x] RLS smoke tests for sharing (tests/sharing_rls_smoke.sql)
- [x] RLS smoke tests for documents isolation (tests/rls_smoke.sql)
- [x] Add RLS smoke for hashed_tokens select isolation
- [x] Add RLS smoke for error_log (no select for non-service)

6) Least privilege
- [x] Hashed index writes restricted to service_role via policies
- [x] Sharing audits not visible to anon; creator can read relevant entries
- [x] System health public read-only by design; data is non-PII
- [ ] Review Supabase function roles per function (ticket)

Tickets to create
- SECURITY-1: CI masking verification for env vars
- SECURITY-2: RLS smoke tests for hashed_tokens and error_log
- SECURITY-3: Sharing revocation helpers (RPC), with audit entries and tests
- SECURITY-4: Sharing password brute-force mitigation (rate limiting)
- SECURITY-5: Confirm deployment of hardened error_log RLS migration

Sign-off checks before done
- [ ] All new/updated tests pass locally/CI
- [ ] Verified no PII/secret strings are emitted by monitor, search, sharing layers
- [ ] Verified hashed search queries and ingest avoid raw terms in logs
- [ ] Verified sharing flows create audits and respect password + expiry
- [ ] Product owner sign-off
