# Schwalbe Specs — Canonical Execution Order

This file defines the recommended execution order for all spec folders, aligned to docs/high-level-plan.md. It does NOT rename directories. It establishes phase order and cross-links existing specs.

Legend:
- Phase labels correspond to sections in docs/high-level-plan.md
- Cross-phase = used throughout multiple phases
- This order references existing spec directories without renaming them; some specs are cross-phase scaffolds

0) Governance and Foundations (Phase 0 bootstrap context)
- 032-governance-spec-kit (cross-phase governance/spec-guard)
- 001-reboot-foundation (monorepo standards, boundaries, CI baseline)
- 002-nextjs-migration (apps/web-next baseline, exclude apps/web)

1) Migration of Infra and Core Packages
- 003-hollywood-migration (selective copy; infra + core packages; Vite only for Storybook builder)
- 030-core-features (cross-phase aggregator: minimal vertical slices to validate foundations)

2) Auth + RLS Baseline
- 005-auth-rls-baseline (Clerk + Supabase RLS vertical slice)

3) Database and Types
- 015-database-types (migrations curation, type-gen, strict typing)

4) Billing (Stripe)
- 008-billing-stripe (edge functions + subscription state machine)
- 028-pricing-conversion (pricing UX, conversion funnels)

5) Email (Resend)
- 007-email-resend (templates, events, sandbox)

6) i18n + Country Rules
- 009-i18n-country-rules (MVP EN/CS/SK/DE/UK; production target 34; matrix-driven rules)

7) Emotional Core MVP
- 013-animations-microinteractions (supporting primitives)
- 014-emotional-core-mvp (landing, Sofia presence, onboarding)

8) Vault (Encrypted Storage)
- 016-vault-encrypted-storage (foundation services)
- 006-document-vault (application features built on 026)

9) Family Shield and Emergency Access
- 019-family-shield-emergency (protocols and flows)
- 025-family-collaboration (collaboration models supporting guardians and sharing)
- 020-emergency-access (application flows using 027)
- 018-dead-man-switch (cross-links with emergency protocol)

10) Time Capsules
- 021-time-capsules (delivery + scheduling)
- 012-time-capsule-legacy (application flows, legacy experiences)

11) Will Generation Engine
- 024-will-generation-engine (engine + validators)
- 023-will-creation-system (wizard + UI built on 029)

12) Sharing, Reminders, Analytics, AI Expansion
- 017-sharing-reminders-analytics (secure sharing + reminders + analytics)
- 031-sofia-ai-system (enhanced dialog system and features)
- 026-professional-network (B2B2C flows)
- 027-business-journeys (journey orchestration, cross-phase)

13) Observability, Security, Performance Hardening
- 011-monitoring-analytics (Supabase logs + DB error table + Resend; no Sentry)
- 012-observability-security-hardening (CSP, Trusted Types, budgets)
- 004-integration-testing (cross-phase: adds deep test suites and pipelines)
- 010-production-deployment (final deployment and operations; also referenced earlier for preview infra)

(Post‑MVP) Mobile Application
- 029-mobile-app (post‑MVP; separate repo recommended in high-level plan, keep spec here for scope)

Notes
- apps/web (Vite) is frozen; excluded from CI typecheck/build. Keep for reference until apps/web-next gates are green and then remove.
- i18n matrix source-of-truth: docs/i18n/matrix.md (normalized path).
- Observability standard: Supabase logs + DB error table + Resend alerts (no Sentry).
