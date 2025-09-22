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

Mainline workflow
- Commit directly to main
- Keep diffs small and focused; avoid mass refactors.

Conventional commits
- Format: type(scope): subject
- Allowed types: feat, fix, docs, chore, refactor, test, build, ci, perf, style
- Common scopes: i18n, logging, redirects, contributing, auth, db, ui, routing
- Subject: imperative mood, sentence case, no trailing period
- Body: explain what and why; reference specs/issues/PRs when helpful
- Breaking changes: include a footer line starting with BREAKING CHANGE: description

Examples
- feat(i18n): enforce 34 languages per domain matrix
- chore(logging): remove sentry and add supabase error_log table
- feat(redirects): gate country redirects by VITE_IS_PRODUCTION; show CZ simulation in non-prod
- docs(contributing): add SEATBELT kickoff template
Module boundaries
- Keep auth helpers under a single lib/auth module
- Centralize Supabase client creation to avoid duplication
