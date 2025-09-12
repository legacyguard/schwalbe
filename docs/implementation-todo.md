# Schwalbe — Implementation To‑Do Tracker

This document is your authoritative checklist for rebuilding Schwalbe. It mirrors the phases and success gates from docs/high-level-plan.md, adds immediate security hygiene, and provides curated migration checklists from Hollywood.

Guidance
- Each item is a granular, verifiable task.
- Use [ ] / [x] to track status. Link each task to a Linear issue (e.g., LG-123) and PR when created.
- Do not proceed to the next phase until all gates in the current phase are green on local, CI, and preview.

Links
- Strategy and roadmap: docs/high-level-plan.md
- Specs and governance: spec-kit

Owner = who is responsible. Issue = Linear or GitHub Issue ID. PR = GitHub PR link.


## 0) Immediate Security Deletes and Hygiene
- [ ] Freeze Vite app (apps/web): no new code beyond security/hygiene; exclude from CI build/typecheck (Owner: , Issue: , PR: )
- [ ] Remove any hardcoded secrets from source/config
- [ ] Remove mock authentication bypasses (Owner: , Issue: , PR: )
- [ ] Remove test credentials from any .env.* files or scripts (Owner: , Issue: , PR: )
- [ ] Run secret scanning on repo (e.g., gitleaks) and fix findings (Owner: , Issue: , PR: )
- [ ] Remove incomplete placeholder Sofia AI mocks and broken sample components (Owner: , Issue: , PR: )
- [ ] Audit and remove unused dependencies (target: prune 45+ unneeded) (Owner: , Issue: , PR: )
- [ ] Deduplicate UI components with conflicting names; keep canonical versions in packages/ui (Owner: , Issue: , PR: )
- [ ] Fix or remove broken import paths and dead code (Owner: , Issue: , PR: )
- [ ] Remove Sentry references; standardize on Supabase logs + DB error table + Resend alerts (Owner: , Issue: , PR: )


## Phase 0 — Bootstrap, Governance, and Hygiene
- [ ] Scaffold Next.js App Router app in apps/web-next (Owner: , Issue: , PR: )
- [ ] Exclude apps/web (Vite) from CI typecheck/build (Owner: , Issue: , PR: )
- [ ] TypeScript strict config at root and apps/packages; path aliases (Owner: , Issue: , PR: )
- [ ] ESLint, Prettier, and commit hooks (lint-staged/husky) (Owner: , Issue: , PR: )
- [ ] spec-kit: keep in repo, add generated artifacts to .gitignore (Owner: , Issue: , PR: )
- [ ] Activate spec-guard: run as a GitHub Action in .github/workflows/ (block merges if phase docs missing) (Owner: , Issue: , PR: )
- [ ] CI baseline: typecheck + lint + build on PR (Owner: , Issue: , PR: )
- [ ] Protect main branch with required checks (Owner: , Issue: , PR: )

Gates
- [ ] CI green on a sample PR
- [ ] spec-guard Action enforces doc presence for current phase


## Phase 1 — Infra and Secrets
- [ ] Vercel: create project (dev/preview/prod) (Owner: , Issue: , PR: )
- [ ] Supabase: create project(s); set up environments (Owner: , Issue: , PR: )
- [ ] Configure Clerk, Stripe, Resend; connect GitHub (Owner: , Issue: , PR: )
- [ ] .env.example with all required vars; add runtime env validation (Owner: , Issue: , PR: )
- [ ] Document secrets setup steps in docs/env/environment-variables.md (Owner: , Issue: , PR: )
- [ ] apps/web-next: add Clerk provider/middleware and a minimal landing route to validate deploy (Owner: , Issue: , PR: )

Gates
- [ ] Preview deploy from PR with placeholder secrets configured


## Phase 2 — Auth + RLS Baseline (Clerk + Supabase)
- [ ] Web: add Clerk provider + middleware and session helpers (Owner: , Issue: , PR: )
- [ ] DB: port Clerk-friendly RLS and storage policies; validate JWT claim mapping (Owner: , Issue: , PR: )
- [ ] Vertical slice: Profile table read/write behind RLS (Owner: , Issue: , PR: )
- [ ] Add RLS test suite (Owner: , Issue: , PR: )

Gates
- [ ] Local + preview auth works (manual check)
- [ ] RLS tests pass in CI


## Phase 3 — Database and Types
- [ ] Curate and port subscription, monitoring, guardians/emergency, document, wills/keys/security, protocol/time-capsule migrations (see Migration Checklists) (Owner: , Issue: , PR: )
- [ ] Generate Supabase types; publish to packages/shared/types (Owner: , Issue: , PR: )
- [ ] CRUD tests for core tables under RLS (Owner: , Issue: , PR: )

Gates
- [ ] Types generated and imported from a single canonical package
- [ ] CRUD + RLS tests pass


## Phase 4 — Billing (Stripe)
- [ ] Port Edge Functions: create-checkout-session (Owner: , Issue: , PR: )
- [ ] Port Edge Functions: stripe-webhook (Owner: , Issue: , PR: )
- [ ] Implement subscription state handling in packages/shared (Owner: , Issue: , PR: )
- [ ] Stripe product bootstrap script adapted to Schwalbe (Owner: , Issue: , PR: )
- [ ] e2e test: checkout flow (test mode) with webhook → DB state (Owner: , Issue: , PR: )

Gates
- [ ] e2e subscription flow passes on preview


## Phase 5 — Email (Resend)
- [ ] Port Edge Function: send-email (Owner: , Issue: , PR: )
- [ ] Template directory and email events map (Owner: , Issue: , PR: )
- [ ] Test delivery in dev + preview (sandbox) (Owner: , Issue: , PR: )

Gates
- [ ] Emails delivered successfully for key events


## Phase 6 — i18n + Country Rules
- [ ] Install and configure a single i18n layer for Next.js in apps/web-next (Owner: , Issue: , PR: )
- [ ] Import curated JSON locales; define source-of-truth (Owner: , Issue: , PR: )
- [ ] Add Google Translate API background generation (fallback only) (Owner: , Issue: , PR: )
- [ ] Add i18n health-check script + GitHub Action (Owner: , Issue: , PR: )
- [ ] Apply country rules (replace Russian with Ukrainian where applicable; remove Ukrainian from Iceland/Liechtenstein; ensure ≥4 languages per country) (Owner: , Issue: , PR: )
- [ ] Enforce “English outside i18n” via lint/test (Owner: , Issue: , PR: )

Gates
- [ ] i18n health workflow green


## Phase 7 — Emotional Core MVP
- [ ] Night sky landing page in apps/web-next with accessible, performant motion (Owner: , Issue: , PR: )
- [ ] Sofia presence (firefly) with guided dialog shell in apps/web-next (Owner: , Issue: , PR: )
- [ ] 3‑act onboarding in apps/web-next (Chaos → Order → Legacy) (Owner: , Issue: , PR: )
- [ ] Success instrumentation (qual questions, staging session replays) (Owner: , Issue: , PR: )

Gates (see plan)
- [ ] Emotional impact confirmed qualitatively (3 sessions)
- [ ] ≥60% completion to first encrypted doc in onboarding test cohort


## Phase 8 — Vault (Encrypted Storage)
- [ ] Client-side encryption + key management service (Owner: , Issue: , PR: )
- [ ] Supabase Storage policies and secure upload/download (Owner: , Issue: , PR: )
- [ ] Error handling and recovery flows (Owner: , Issue: , PR: )
- [ ] Restore scenario validation (Owner: , Issue: , PR: )

Gates
- [ ] Successful restore verified in test


## Phase 9 — Family Shield and Emergency Access
- [ ] Port Edge Functions: verify-emergency-access (Owner: , Issue: , PR: )
- [ ] Port Edge Functions: activate-family-shield (Owner: , Issue: , PR: )
- [ ] Port Edge Functions: protocol-inactivity-checker, check-inactivity (Owner: , Issue: , PR: )
- [ ] Port Edge Functions: download-emergency-document (Owner: , Issue: , PR: )
- [ ] UI flows: invite guardian, verify, inactivity simulation, access (Owner: , Issue: , PR: )

Gates
- [ ] End‑to‑end scenario passes on preview


## Phase 10 — Time Capsules
- [ ] Port Edge Functions: time-capsule-delivery (Owner: , Issue: , PR: )
- [ ] Port Edge Functions: time-capsule-test-preview (Owner: , Issue: , PR: )
- [ ] Scheduling/triggers + audit logs (Owner: , Issue: , PR: )

Gates
- [ ] e2e delivery test passes on preview


## Phase 11 — Will Generation Engine (Incremental)
- [ ] Move will generation logic into packages/logic with unit tests (Owner: , Issue: , PR: )
- [ ] Wizard UI powered by domain logic + i18n clauses (Owner: , Issue: , PR: )
- [ ] Legal requirements DB aligned with country rules (Owner: , Issue: , PR: )

Gates
- [ ] Clause assembly snapshot tests and i18n coverage green


## Phase 12 — Sharing, Reminders, Analytics, Sofia AI Expansion
- [ ] Secure share links with permissions, expiry, audit logs (Owner: , Issue: , PR: )
- [ ] Reminders (Supabase functions + templates) (Owner: , Issue: , PR: )
- [ ] Analytics (privacy-first) for key UX steps (Owner: , Issue: , PR: )
- [ ] Sofia AI enhancements: empathy prompts, context, task routing (Owner: , Issue: , PR: )

Gates
- [ ] Security checks green; CSP and perf budgets met


## Phase 13 — Observability, Security, and Performance Hardening
- [ ] DB error table for incidents (Owner: , Issue: , PR: )
- [ ] Shared logger → Supabase logs + DB insert + Resend alerts (Owner: , Issue: , PR: )
- [ ] CSP, Trusted Types, strict headers for web (Owner: , Issue: , PR: )
- [ ] Smoke e2e on PR (landing, auth, first vault action) (Owner: , Issue: , PR: )
- [ ] Load test landing + key flows (Owner: , Issue: , PR: )

Gates
- [ ] Security scan clean; alerting verified; budgets met


## Environment-Based Redirects (Staging vs Production)
- [ ] Add NEXT_PUBLIC_IS_PRODUCTION (alias VITE_IS_PRODUCTION if needed) (Owner: , Issue: , PR: )
- [ ] Production: real redirects to country-specific domains (Owner: , Issue: , PR: )
- [ ] Staging: modal/toast in Czech simulating redirect URLs; all other UI in English (Owner: , Issue: , PR: )


## CI/CD Additions
- [ ] i18n health-check workflow (Owner: , Issue: , PR: )
- [ ] RLS tests in CI (Owner: , Issue: , PR: )
- [ ] Preview deploy on PR (Vercel) (Owner: , Issue: , PR: )
- [ ] spec-guard enforcement for each phase (Owner: , Issue: , PR: )


## Governance and Documentation
- [ ] Keep docs/high-level-plan.md updated at each phase (Owner: , Issue: , PR: )
- [ ] Maintain spec-kit specs; ensure linkages from PRs (Owner: , Issue: , PR: )
- [ ] PR template requires: Linear issue, phase, acceptance criteria (Owner: , Issue: , PR: )


## Migration Checklists — Supabase Edge Functions to Port from Hollywood
Recommended order (rename to Schwalbe naming where applicable):
- [ ] create-checkout-session
- [ ] stripe-webhook
- [ ] send-email
- [ ] verify-emergency-access
- [ ] activate-family-shield
- [ ] family-shield-time-capsule-trigger
- [ ] download-emergency-document
- [ ] time-capsule-delivery
- [ ] time-capsule-test-preview
- [ ] protocol-inactivity-checker (present)
- [ ] check-inactivity (present)
- [ ] intelligent-document-analyzer (optional for v1)
- [ ] sofia-ai (optional for v1)
- [ ] sofia-ai-guided (optional for v1)
- [ ] legacy-guard-api (optional; rename/trim)
- [ ] legacy-guard-auth (optional; rename/trim)
- [ ] Port supabase/functions/_shared utilities
- [ ] Port import_map.json, deno.json, tsconfig.json (functions)


## Migration Checklists — Migrations to Port from Hollywood (Curated)
- [ ] 20240101000000_create_subscription_tables.sql
- [ ] 20240102000000_create_monitoring_tables.sql
- [ ] 20250823094915_fix_storage_policies_for_clerk.sql
- [ ] 20250823095937_fix_documents_rls_for_clerk.sql
- [ ] 20250823220000_create_guardians_table.sql
- [ ] 20250829120000_create_emergency_access_tokens.sql
- [ ] 20250825162000_create_emergency_activation_log.sql
- [ ] 20250824090000_create_document_bundles.sql
- [ ] 20250824100000_add_document_versioning.sql
- [ ] 20250824070000_add_ocr_support.sql (optional)
- [ ] 20250824080000_add_ai_analysis_support.sql (optional)
- [ ] 20250825070000_create_wills_system.sql
- [ ] 20250825120000_create_key_management_system.sql
- [ ] 20250825090000_security_hardening.sql
- [ ] 20250825161000_create_protocol_settings.sql
- [ ] 20250825170000_create_time_capsules.sql
- [ ] 20250825171000_create_time_capsule_storage.sql

Reconciliation tasks
- [ ] Dedupe against existing 20250910* migrations; adjust sequencing (Owner: , Issue: , PR: )


## Housekeeping Backlog (Do As You Go)
- [ ] Remove Vite app (apps/web) once apps/web-next MVP gates are green (Owner: , Issue: , PR: )
- [ ] Remove apps/demo unless actively used (Owner: , Issue: , PR: )
- [ ] Move apps/mobile to separate repo until web MVP is stable (Owner: , Issue: , PR: )
- [ ] Consolidate to a single Supabase client in packages/shared and reuse everywhere (Owner: , Issue: , PR: )
- [ ] Add DB error table schema and logger integration (Owner: , Issue: , PR: )


## Emotional Core Metrics and Validation
- [ ] Add lightweight staging survey (3-point anxiety scale) on onboarding (Owner: , Issue: , PR: )
- [ ] Add event tracking for “time-to-first-secure-upload” (Owner: , Issue: , PR: )
- [ ] Schedule 3 qualitative sessions to review emotional impact (Owner: , Issue: , PR: )


## Definition of Done (per Phase)
- All checklist items completed and verified
- Gates validated (tests/CI/preview)
- Docs updated (high-level plan + specs)
- No new high/critical security findings

