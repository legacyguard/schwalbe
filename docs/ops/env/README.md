# Environment & Secrets Management (MVP → Production)

Status: Accepted for MVP; future-ready for Vercel-managed env.

Principles
- Single source of truth per environment; no secrets in git
- Same variable names across environments (12-factor)
- Client-exposed keys prefixed with NEXT_PUBLIC_ (Next.js)
- For LegacyGuard redirect behavior keep VITE_IS_PRODUCTION (per project rule)

MVP approach
- Local/staging: use .env.local (untracked) with non-production keys
- Document variables in this README (optionally add .env.example with placeholders only)
- Production: manage secrets in Vercel project settings (no .env files in git)

Variable inventory
- NEXT_PUBLIC_SUPABASE_URL (client/runtime)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (client/runtime)
- SUPABASE_SERVICE_ROLE_KEY (server-only; never shipped to browser)
- RESEND_API_KEY (server-only)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (server-only)
- VITE_IS_PRODUCTION (marketing/redirect logic; true=real redirects, false=simulation)

Local setup (MVP)
- Create .env.local at workspace(s) that need it (never commit):
  - web-next (Next.js): NEXT_PUBLIC_* and server-only keys for server code paths
  - any Vite-based marketing app: VITE_IS_PRODUCTION

Production setup (Vercel)
- Define env vars in Vercel UI or CLI; do NOT commit secrets
- Recommended CLI flow (no secrets shown; you’ll be prompted):
  - vercel env add NEXT_PUBLIC_SUPABASE_URL production
  - vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  - vercel env add SUPABASE_SERVICE_ROLE_KEY production
  - vercel env add RESEND_API_KEY production
  - vercel env add STRIPE_SECRET_KEY production
  - vercel env add STRIPE_WEBHOOK_SECRET production
  - vercel env add VITE_IS_PRODUCTION production
- Pull env to local (safe values only):
  - vercel env pull .env.local

Migration later from .env to Vercel
- Keep variable names stable now; code won’t change later
- Replace local .env usage with Vercel-provisioned runtime at deploy time
- Use vercel env pull for local dev parity without storing secrets in git

Safety notes
- Never log tokens/keys
- Do not echo secrets in CI; inject via env
- Client code must only reference NEXT_PUBLIC_* variables

Appendix: sample .env.local (placeholders only)
# Next.js client
NEXT_PUBLIC_SUPABASE_URL=<your-nonprod-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-nonprod-anon-key>
# Server-only
SUPABASE_SERVICE_ROLE_KEY=<nonprod-service-role>
RESEND_API_KEY=<nonprod-resend>
STRIPE_SECRET_KEY=<nonprod-stripe-secret>
STRIPE_WEBHOOK_SECRET=<nonprod-stripe-webhook>
# Marketing redirect behavior
VITE_IS_PRODUCTION=false
