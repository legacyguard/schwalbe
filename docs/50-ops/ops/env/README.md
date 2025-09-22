# Environment & Secrets Management (MVP → Production)

Status: Accepted for MVP; future-ready for Vercel-managed env.

Principles
- Single source of truth per environment; no secrets in git
- Same variable names across environments (12-factor)
- Client-exposed keys prefixed with NEXT_PUBLIC_ (Next.js) or VITE_ (Vite)
- For LegacyGuard redirect behavior keep VITE_IS_PRODUCTION (per project rule)

MVP approach
- Local/staging: use .env.local (untracked) with non-production keys
- Document variables in this README (optionally add .env.example with placeholders only)
- Production: manage secrets in Vercel project settings (no .env files in git)

Variable inventory
- apps/web (Vite):
  - VITE_SUPABASE_URL (client/runtime)
  - VITE_SUPABASE_ANON_KEY (client/runtime)
  - VITE_IS_PRODUCTION (marketing/redirect logic; true=real redirects, false=simulation)
- Vercel serverless functions (Node):
  - SUPABASE_URL (server-only)
  - SUPABASE_SERVICE_ROLE_KEY (server-only; never shipped to browser)
  - STRIPE_SECRET_KEY (server-only)
  - STRIPE_WEBHOOK_SECRET (server-only)
  - MONITORING_ENVIRONMENT (e.g., production)
  - MONITORING_ALERT_EMAIL (e.g., alerts@yourdomain)
  - MONITORING_ALERT_FROM (optional)
  - ALERT_RATE_LIMIT_MINUTES (optional)
- Supabase Edge Functions (Deno) secrets:
  - RESEND_API_KEY
  - SEARCH_INDEX_SALT (for hashed search)

Local setup (MVP)
- Create .env.local at workspace(s) that need it (never commit):
  - apps/web (Vite): VITE_* variables
  - any Next.js app (future): NEXT_PUBLIC_* variables

Production setup (Vercel)
- Define env vars in Vercel UI or CLI; do NOT commit secrets
- Recommended CLI flow (no secrets shown; you’ll be prompted):
  - vercel env add VITE_SUPABASE_URL production
  - vercel env add VITE_SUPABASE_ANON_KEY production
  - vercel env add VITE_IS_PRODUCTION production
  - vercel env add SUPABASE_URL production
  - vercel env add SUPABASE_SERVICE_ROLE_KEY production
  - vercel env add STRIPE_SECRET_KEY production
  - vercel env add STRIPE_WEBHOOK_SECRET production
  - vercel env add MONITORING_ENVIRONMENT production
  - vercel env add MONITORING_ALERT_EMAIL production
  - vercel env add MONITORING_ALERT_FROM production
  - vercel env add ALERT_RATE_LIMIT_MINUTES production
- Pull env to local (safe values only):
  - vercel env pull .env.local

Supabase secrets (set in Supabase dashboard or CLI)
- RESEND_API_KEY
- SEARCH_INDEX_SALT

Migration later from .env to Vercel
- Keep variable names stable now; code won’t change later
- Replace local .env usage with Vercel-provisioned runtime at deploy time
- Use vercel env pull for local dev parity without storing secrets in git

Safety notes
- Never log tokens/keys
- Do not echo secrets in CI; inject via env
- Client code must only reference VITE_* (Vite) or NEXT_PUBLIC_* (Next.js) variables

Appendix: sample .env.local (placeholders only)
# apps/web (Vite)
VITE_SUPABASE_URL=<your-nonprod-url>
VITE_SUPABASE_ANON_KEY=<your-nonprod-anon-key>
VITE_IS_PRODUCTION=false
# Server-only (Vercel Functions)
SUPABASE_URL=<nonprod-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<nonprod-service-role>
STRIPE_SECRET_KEY=<nonprod-stripe-secret>
STRIPE_WEBHOOK_SECRET=<nonprod-stripe-webhook>
MONITORING_ENVIRONMENT=staging
MONITORING_ALERT_EMAIL=alerts-staging@yourdomain
# Supabase
# Set via Supabase secrets: RESEND_API_KEY, SEARCH_INDEX_SALT
