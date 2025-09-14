# Coding Conventions

Auth patterns (Next.js)
- Server: createServerComponentClient + session gate
- Middleware: createMiddlewareClient + guards; minimal logic; add security headers

RLS usage
- All owner checks use auth.uid() = user_id (UUID)
- No custom claim helper functions

Logging
- Use structured logging per docs/observability/logging-standards.md
- No PII; include req_id, area, event, severity

Errors
- Categorize: validation, auth, rls_denied, upstream, unknown
- Include code and message; never include secrets

Commits
- Conventional: docs(), feat(), fix(), chore(), refactor(), test()
- Example: docs(auth): migrate specs from Clerk to Supabase Auth

Module boundaries
- Keep auth helpers under a single lib/auth module
- Centralize Supabase client creation to avoid duplication
