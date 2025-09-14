# Environment & Secrets Management (MVP → Production)

This mirrors docs/ops/env/README.md and is the canonical spec copy.

- MVP: .env.local (untracked). Production: Vercel-managed env. No secrets in git.
- Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VITE_IS_PRODUCTION.
- Migration later: keep names stable; use `vercel env add` and `vercel env pull`.
- Safety: no token logging; client uses only NEXT_PUBLIC_*.
