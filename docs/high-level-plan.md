# Schwalbe — High‑Level Implementation Plan

This document is the single source of truth for rebuilding Hollywood as Schwalbe — clean, stable, secure, emotionally resonant, and production-ready. It integrates:

- A pragmatic rebuild roadmap (phased, quality-gated)
- Hollywood → Schwalbe migration guidance
- Emotional Core requirements (psychological design) and success metrics
- Security hardening and “delete now” hygiene
- i18n and country rules, environment-based redirect logic
- Observability (Supabase logs + DB error table + Resend alerts)
- CI/CD and governance via spec-kit, Linear, and GitHub

We will deploy to Vercel, use Supabase (DB, storage, edge functions), Clerk (auth), Stripe (billing), Resend (email), GitHub (repo + Actions), Linear (work tracking), and Google Translate API (i18n).

---

## 1) Product North Star and Emotional Core

What made Hollywood unique — we preserve and elevate it:

1. Exceptional Emotional Design
   - Night sky landing page with subtle depth and meaning (stars, parallax, firefly glow) to evoke calm, courage, and care.
   - Sofia firefly presence — a gentle, empathic guide.
   - 3-act visual storytelling: chaos → organization → legacy transformation.

2. Sophisticated User Journey
   - Emotions-first onboarding to lower anxiety and build trust.
   - Clear progress markers that celebrate momentum without pressure.
   - Friction is transformed into ceremony (e.g., “seal your legacy” moments).

3. Comprehensive Feature Set (framed emotionally)
   - Vault and encryption: “I’m protecting my loved ones.”
   - Family Shield (guardians, emergency access): “I’m not alone.”
   - Time Capsules: “I will be remembered in my own words.”
   - Will generation: “I’m taking care of what matters.”

Priorities for Schwalbe (v1):

- Recreate night sky landing page with animations and Sofia presence
- Implement Sofia AI as a guided dialog system (empathic, context-aware)
- Build a 3‑act onboarding flow
- Create a clear navigation system and documentation; deliver a functional encrypted vault

Success Metrics for Schwalbe (qualitative + quantitative):

- Landing page creates emotional impact (qual interviews + session replays on staging)
- Sofia AI guidance is rated “helpful” by ≥70% of early users
- Onboarding reduces user anxiety (self-reported, simple 3-point scale) and improves completion to first encrypted document ≥60%
- Vault: time-to-first-secure-upload < 3 minutes; successful restore verified in test

---

## 2) Target Architecture

- Monorepo: pnpm + turbo (or npm + turbo initially), TypeScript strict everywhere
- apps/
  - web-next (Next.js App Router, SSR/RSC, Edge runtime for server routes)
  - web (Vite) — frozen for reference only; do not extend beyond security/hygiene; excluded from CI build/typecheck
  - (Optional, later) mobile (separate repo recommended post‑MVP)
- packages/
  - ui (design system + primitives + motion)
  - shared (supabase client factory, API/SDKs, logging, email, stripe)
  - logic (domain logic: will generation, validation, transformation)
- supabase/
  - migrations (curated, sequenced)
  - functions (Edge Functions)
  - config (import_map.json, deno.json, tsconfig.json)
- scripts/ (setup, i18n validators, stripe bootstrap)
- docs/ (this plan + product/system docs)
- .github/workflows (CI: typecheck, lint, tests, i18n health, preview deploy)
- spec-kit (governance) — tracked in repo and added to .gitignore for artifacts

Why Next.js: tight fit with Vercel (routing, server actions, edge functions), simpler Clerk/Stripe/Resend integration, reduces custom plumbing.

---

## 3) Phased Roadmap with Quality Gates

Each phase ships a vertical slice and has non-negotiable gates. Proceed only when gates are green on local + CI + preview.

Phase 0 — Bootstrap, Governance, and Hygiene

- Scaffold Next.js App Router app in apps/web-next (do not extend Vite app)
- Exclude apps/web (Vite) from CI typecheck/build; keep only for reference until removal
- Establish TS config, eslint, prettier, commit hooks
- spec-kit: keep and evolve as an internal governance system (do not delete). Add to .gitignore for generated artifacts, not the source.
- Linear: define projects for phases; enforce PR → Linear linkage
- CI: typecheck + lint + build on PR; required status checks
- Gate: main branch protected; CI passing

Phase 1 — Infra and Secrets

- Create Vercel project (dev/preview/prod)
- Create Supabase project (dev; provision preview if using Branch Previews)
- Configure Clerk, Stripe, Resend; connect GitHub
- Define .env.example and env schema (runtime validation). Never commit secrets.
- Wire Clerk provider/middleware only in apps/web-next; create a minimal landing route to verify deploy
- Gate: preview deployment from PR with secret scaffolding docs

Phase 2 — Auth + RLS Baseline (Clerk + Supabase)

- Web: Clerk provider + middleware; server helpers for session
- DB: port Clerk-friendly RLS and storage policies; claims mapping verified
- Vertical slice: “Profile” table read/write behind RLS
- Gate: local + preview auth works; RLS test suite green

Phase 3 — Database and Types

- Curate and port core migrations (see Section 6)
- Generate Supabase types and publish to packages/shared/types
- Gate: CRUD tests for core tables under RLS

Phase 4 — Billing (Stripe)

- Port edge functions: create-checkout-session, stripe-webhook
- Implement subscription state machine in shared services
- Gate: e2e checkout flow (test mode) + webhook handling + DB state transitions

Phase 5 — Email (Resend)

- Port send-email function; template structure; domain events trigger emails
- Gate: email delivery verified in dev + preview (sandbox)

Phase 6 — i18n + Country Rules

- Adopt single i18n layer for Next (e.g., next-intl or next-i18next) in apps/web-next only
- Import curated JSON; wire Google Translate API for background generation/fallback
- i18n health checks in CI; ensure all UI text outside i18n is English
- Country rules: replace Russian with Ukrainian where specified; remove language settings per rules (e.g., no Ukrainian in Iceland/Liechtenstein); ensure 4+ languages per country
- Gate: i18n health workflow passing

Phase 7 — Emotional Core MVP

- Night sky landing page in apps/web-next with accessible performance budgets (60fps target)
- Sofia presence (firefly motion) and a guided dialog surface (non-LLM stub OK initially) in apps/web-next
- 3‑act onboarding in apps/web-next (reduce anxiety; celebrate clarity and action)
- Gate: qualitative review + staging session replays; measurable impact (see metrics)

Phase 8 — Vault (Encrypted Storage)

- Client-side encryption flow and key management service (passphrase → derived key; zero-knowledge; encrypted blobs in Supabase Storage)
- Document listing/upload/download/delete with RLS and storage policies
- Gate: restore scenario validated; error handling and recovery flows present

Phase 9 — Family Shield and Emergency Access

- Port verify-emergency-access, activate-family-shield, protocol-inactivity-checker, check-inactivity, download-emergency-document
- UI flows: invite guardian, verify, simulate inactivity → controlled access
- Gate: end‑to‑end scenario test on preview environment

Phase 10 — Time Capsules

- Port time-capsule-delivery and time-capsule-test-preview; schedule/trigger logic
- Gate: e2e delivery test with audit logs

Phase 11 — Will Generation Engine (Incremental)

- Move will generation logic into packages/logic with unit tests and snapshots
- UI wizard powered by domain logic and i18n clauses; legal requirements DB aligned with country rules
- Gate: clause assembly snapshot tests + i18n coverage

Phase 12 — Sharing, Reminders, Analytics, Sofia AI Expansion

- Secure public share links with audit logs and expiry; reminder scheduling via functions; analytics (privacy-first)
- Enhance Sofia AI dialog with context, empathy prompts, and task routing (gradually)
- Gate: security checks + CSP + perf budgets

Phase 13 — Observability, Security, and Performance Hardening

- Supabase logs + DB error table + Resend alerts (no Sentry)
- CSP, Trusted Types, strict headers
- Smoke e2e on each PR; load test landing + key flows
- Gate: security scan clean; budgets met; alerting verified

---

## 4) Emotional Core Implementation Notes

- Night Sky Landing Page
  - Motion with restraint: stars, depth parallax, subtle firefly glow trails
  - Accessible and performant: lazy motion on low‑end devices, reduced motion support
  - Content hierarchy: mission, safety, warmth, and clear next step

- Sofia Firefly Guide (Guided Dialog)
  - Conversational scaffolding that reassures, clarifies, and celebrates milestones
  - Context-sensing phases: welcome → orientation → first action → reflection
  - Human tone: empathic microcopy and non‑judgmental guidance

- 3‑Act Onboarding Flow
  - Act I (Chaos): “Let’s gather what matters.”
  - Act II (Order): “Your vault is taking shape.”
  - Act III (Legacy): “You’re preparing with love.”

- UX success checks
  - Anxiety-reduction language, coherent progress cues, meaningful moments (ceremony)

---

## 5) Governance — spec‑kit, Linear, and PR Discipline

- spec-kit is a first-class governance asset. Do not delete.
  - Keep source in repo. Add generated artifacts to .gitignore.
  - Expand spec-guard workflow: block merges unless the current phase’s acceptance criteria docs exist and are referenced in PR description.
  - Policy: PRs that modify apps/web (Vite) beyond security/hygiene removals are rejected in review.
- Linear
  - Each phase has a milestone in Linear with tasks linked to PRs
  - PR templates reference Linear issue + phase gates
- Documentation discipline
  - docs/ contains living specs; changes require doc updates in the same PR

---

## 6) Migration Plan — What to Port from Hollywood (Curated)

Supabase Edge Functions (port and adapt names as needed):

- create-checkout-session
- stripe-webhook
- send-email
- verify-emergency-access
- activate-family-shield
- family-shield-time-capsule-trigger
- download-emergency-document
- time-capsule-delivery
- time-capsule-test-preview
- protocol-inactivity-checker (already present)
- check-inactivity (already present)
- intelligent-document-analyzer (optional for v1)
- sofia-ai and sofia-ai-guided (optional for v1; recommended later)
- legacy-guard-api and legacy-guard-auth (rename/trim)
- Also port supabase/functions/_shared, import_map.json, deno.json, tsconfig.json

Migrations (curate, re-sequence, and dedupe with new files):

- 20240101000000_create_subscription_tables.sql (subscriptions/billing)
- 20240102000000_create_monitoring_tables.sql (monitoring)
- 20250823094915_fix_storage_policies_for_clerk.sql (storage RLS for Clerk)
- 20250823095937_fix_documents_rls_for_clerk.sql (documents RLS)
- 20250823220000_create_guardians_table.sql
- 20250829120000_create_emergency_access_tokens.sql
- 20250825162000_create_emergency_activation_log.sql
- Document system:
  - 20250824090000_create_document_bundles.sql
  - 20250824100000_add_document_versioning.sql
  - Optional: 20250824070000_add_ocr_support.sql / 20250824080000_add_ai_analysis_support.sql
- Wills/Keys/Security:
  - 20250825070000_create_wills_system.sql
  - 20250825120000_create_key_management_system.sql
  - 20250825090000_security_hardening.sql
- Protocol and Time Capsules:
  - 20250825161000_create_protocol_settings.sql
  - 20250825170000_create_time_capsules.sql
  - 20250825171000_create_time_capsule_storage.sql

Packages to salvage (after tests):

- packages/ui: reusable components (forms, error boundary, primitives). Remove experiments/duplicates.
- packages/shared: stripe.service, subscription.service, email.service, supabase client wrappers (consolidate to one canonical client), monitoring.service (without Sentry)
- packages/logic: will generation core and validators (with unit tests)

---

## 7) Security — Immediate Deletes and Secure-by-Default

Delete immediately:

- Hardcoded API keys and secrets in any config or source
- Mock authentication bypasses
- Test credentials in environment files or scripts
- Incomplete placeholder components (broken Sofia AI mocks)
- Unused dependencies (remove with audit; target: clear 45+ unused)
- Duplicate UI components with different naming
- Broken import paths (resolve or delete dead code)

Secure-by-default checklist:

- No Sentry; use Supabase logs + DB error table + Resend alerts
- CSP + Trusted Types + strict security headers
- RLS enforced on every table; storage policies locked to authenticated users and roles
- Client-side encryption for sensitive vault data; zero-knowledge posture
- Pre-commit hooks: secret scan (e.g., gitleaks) and lint/typecheck
- CI secret scanning; deny pushes to main without checks
- Rotating webhook secrets (Stripe) and restricted API keys

---

## 8) i18n and Country Rules

- Use a single i18n layer in Next.js; English is the source of truth
- Import modular JSON locales; CI i18n health checks for missing/extra keys
- Google Translate API for background generation with human-curated fixes
- Country-specific rules compliance:
  - Replace Russian with Ukrainian where your rules require
  - Remove Ukrainian from Iceland and Liechtenstein
  - Ensure minimum 4 languages per country; select closest languages where needed
- All UI text outside i18n files must be English

---

## 9) Environment-Based Redirects (Staging vs Production)

- Env flag: NEXT_PUBLIC_IS_PRODUCTION (or VITE_IS_PRODUCTION alias maintained)
- Production: perform real redirects to country-specific domains
- Staging: do not redirect; show modal/toast/alert in Czech simulating the redirect URL for all country domains; all other UI in English

---

## 10) Observability and Error Management (No Sentry)

- DB error table with structured fields (timestamp, environment, severity, code, message, stack, context)
- Shared logger:
  - console.error (structured) → Supabase logs
  - insert error into DB
  - escalate critical errors via Resend
- Dashboards:
  - Lightweight production dashboard page (auth-only) to view health checks and last N critical incidents (dev/staging only)

---

## 11) CI/CD

- GitHub Actions:
  - typecheck, lint, unit tests (limit build/typecheck to packages and apps/web-next; exclude apps/web)
  - i18n health-check
  - (optional now) e2e smoke for landing, auth, and first vault action
  - preview deploy on PR (Vercel)
  - spec-guard — enforce phase gates
- Branch protections: require green checks before merge

---

## 12) Environment Variables (Baseline)

Web (Next.js):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- GOOGLE_TRANSLATE_API_KEY
- NEXT_PUBLIC_IS_PRODUCTION (alias VITE_IS_PRODUCTION if needed)

Supabase Edge Functions:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- CLERK JWT issuer/validation variables (as required by RLS policies)

---

## 13) Cleanup and Adoption Plan

To remove or consolidate now:

- Vite web app (apps/web) — frozen and excluded from CI build/typecheck; remove once apps/web-next MVP gates are green
- apps/demo — remove or archive unless used for smoke tests
- apps/mobile — remove or move to separate repo until web MVP is stable
- Duplicate services/clients — use a single supabase client in packages/shared
- .spec-kit generated artifacts — add to .gitignore; keep spec-kit source and evolve it
- Unused deps and dead code — systematic removal; enforce via CI

---

## 14) Risks and Mitigations

- Scope creep: phases and gates prevent uncontrolled expansion
- Security regressions: CI security checks, RLS tests, and CSP enforce posture
- i18n drift: health-check CI; English-only outside i18n
- Emotional quality loss: qualitative reviews for landing and onboarding; Sofia content cues reviewed with each release

---

## 15) First 2 Weeks Execution Checklist

Week 1

- Create Next.js app and baseline CI
- Clerk + RLS vertical slice (Profile table)
- Port subscription migrations, create-checkout-session + stripe-webhook
- .env.example and env schema

Week 2

- Port send-email and Resend wiring for core events
- Night sky landing + Sofia presence (non‑LLM)
- i18n layer + health-check CI; implement country rules
- Vault MVP: encrypted upload/download prototype (happy path)

Success review: run gates; demo on preview; gather 3 qualitative sessions on emotional impact.

---

## Appendix — Hollywood → Schwalbe Mapping (Quick Reference)

- Port these functions first: create-checkout-session, stripe-webhook, send-email, verify-emergency-access, activate-family-shield
- Then: check-inactivity, protocol-inactivity-checker (already present), download-emergency-document
- Then: time-capsule-delivery, time-capsule-test-preview
- Later (optional): intelligent-document-analyzer, sofia-ai, sofia-ai-guided, legacy-guard-* (renamed)
- Port migrations in the order listed in Section 6, reconciling with new 20250910* files
- Remove Sentry entirely; standardize on Supabase logging + DB table + Resend alerts
- Keep spec-kit and evolve it; do not delete
