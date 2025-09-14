# 034: MVP Operational Foundations (Source of Truth)

Purpose
- Lock in all pre-coding operational decisions inside specs as the canonical reference
- Keep implementation templates handy for coding and CI

Scope
- Environment & secrets (MVP .env.local; future Vercel-managed env)
- RLS catalog and SQL test harness (auth.uid() standard)
- Observability: structured logging and Resend alerts (no Sentry)
- ADRs: identity, observability, env-driven redirects
- CI guardrails: banned legacy patterns (Clerk, Sentry, current_external_id)
- i18n and domains: MVP (CZ, SK with cs, sk, en, de, uk) and production process
- Release/runbooks: cutover plan and incident checklist
- Contribution guidelines: definition of ready and coding conventions

Contents (this spec)
- ./env/README.md — environment strategy and safe handling
- ./security/rls-policy-catalog.md — policy template with auth.uid()
- ./testing/rls-test-harness.md — SQL harness for RLS validation
- ./observability/logging-standards.md — structured logging schema (no PII)
- ./observability/alerting-resend.md — critical alert policy with Resend
- ./adr/ADR-001-supabase-auth-identity.md — identity model
- ./adr/ADR-002-observability-no-sentry.md — no Sentry decision
- ./adr/ADR-003-env-multidomain-redirects.md — redirect behavior
- ./ci/guards.md — grep guard patterns
- ./ci/github-workflow-snippet.md — CI snippet
- ./i18n/domains-and-languages.md — MVP and production plan
- ./release/cutover-plan-auth-rls.md — rollout/rollback
- ./release/incident-checklist.md — operations checklist
- ./ops/migrations/runbook-auth-baseline.md — migration runbook
- ./contributing/definition-of-ready.md — pre-coding checklist
- ./contributing/coding-conventions.md — patterns and standards

Notes
- This spec mirrors docs/ for convenience; this one is the source of truth during coding
- For multi-domain config used by the landing header, see: packages/shared/src/config/domains.ts
