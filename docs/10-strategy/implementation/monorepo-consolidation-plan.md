# Monorepo Consolidation and Migration Plan (with Web Build Fix)

Owner: main branch
Status: Draft for execution
Last updated: 2025-09-16

This plan closes identified gaps, completes the migration to Next.js, ships a minimal mobile app, and includes a concrete fix for the current web build failure.


## 0) Immediate Web Build Fix — Vite failing on `react-native`

Symptoms
- Running `npm run -w @schwalbe/web build` fails with:
  - `[commonjs--resolver] Expected 'from', got 'typeOf' in node_modules/react-native/index.js`

Root cause
- Some dependencies (e.g., moti/tamagui variants) import `react-native` APIs. The `react-native` npm package includes Flow-typed `import type`/`import typeof` constructs that Vite’s CommonJS analysis attempts to parse, causing a failure in web builds. For web, we need `react-native-web` or a hard stub, not the native package.

Recommended fix (Option A — alias to react-native-web)
- Install `react-native-web` in the web workspace and alias `react-native` → `react-native-web` in `apps/web/vite.config.ts`. This keeps web-friendly implementations for `Pressable`, etc., and avoids Flow syntax.

Commands
```bash
# In repo root
npm i -w @schwalbe/web react-native-web
```

Vite config snippet (alias)
```ts
// apps/web/vite.config.ts (add/ensure this alias exists)
resolve: {
  alias: [
    // ...other aliases
    { find: /^react-native$/, replacement: 'react-native-web' },
    { find: /^react-native\/(.*)$/, replacement: 'react-native-web/dist/$1' },
  ],
},
optimizeDeps: {
  include: ['react-native-web'],
  exclude: ['react-native'],
},
build: {
  commonjsOptions: {
    // Ensure the CommonJS plugin doesn’t try to parse react-native
    ignore: ['react-native', /^react-native\//],
  },
},
```

Alternative fix (Option B — hard stub)
- If you prefer not to add `react-native-web`, keep a hard stub for `react-native` and related RN-only packages. This repo already includes a pre-plugin and alias approach to stub RN, but if you still encounter the error, ensure both a pre `resolveId()` nuller AND a `load()` override are present and run before CommonJS transforms. Also make sure the alias patterns cover nested subpaths and absolute paths in `node_modules`.

Validation
- Clean install, then build:
```bash
npm ci
npm run -w @schwalbe/web build
```
- Success criteria: the build completes without `[commonjs--resolver]` errors and outputs `apps/web/dist`.

Notes
- This fix is compatible with later migration to Next.js (App Router), where a Next-specific alias to `react-native-web` can be kept; or you can remove RN consumers in the web app as we complete the migration.


## 1) Phased Execution Plan

The plan follows your specs ordering and low-risk posture (commit to `main`, small PRs). Staging dry-runs are required before production changes affecting auth/RLS/observability.

### Phase 0 — Foundations & CI Hardening (1–2 days)
Goals
- Add missing observability tables and strengthen CI guardrails; freeze the Vite app for migration.
Tasks
- DB migrations (observability):
  - Create `public.error_logs`, `public.alert_rules`, `public.alert_instances` with RLS, indexes, and service-role manage policies.
  - Add supabase SQL smokes for inserts/reads per policy.
- CI guardrails (GitHub Actions):
  - Lint, typecheck, unit tests, supabase SQL tests, Playwright smoke.
  - Fail if:
    - Code references Sentry packages.
    - Logs include plaintext search terms.
    - Secrets (env var names such as RESEND_API_KEY) are printed.
- Freeze `apps/web` feature work; migration target is `apps/web-next`.
Acceptance
- Migrations applied; `log-error` and `stripe-webhook` alert flows work; CI green; guardrails effective.

### Phase 1 — i18n Matrix Enforcement (1–2 days)
Goals
- Enforce “34 languages” and per-country rules with a CI health-check.
Tasks
- `scripts/i18n-health-check.ts` compares `docs/i18n/matrix.md` with `packages/shared/src/config/languages.ts` `DOMAIN_LANGUAGES`:
  - ≥ 4 languages per domain.
  - Germany has no Russian; Iceland/Liechtenstein have no Ukrainian.
  - Baltics include Russian as per updated rules.
- Add CI job `i18n:matrix-check` that fails on mismatch.
Acceptance
- CI fails when mappings deviate from matrix; passes when aligned.

### Phase 2 — Support Page & Header/Footer Links (0.5–1 day)
Goals
- Meet support-page and link requirements.
Tasks
- Add `apps/web/src/pages/support/support.{en,cs,sk}.tsx` (content parity; baseline English elsewhere).
- Ensure header/footer link to Support and legal pages.
Acceptance
- `/support` renders for EN/CS/SK; header/footer links present.

### Phase 3 — Refund/Cancel/Trial UX Polish (1–2 days)
Goals
- Ensure consistent localization in UI and emails.
Tasks
- UI: finalize EN/CS/SK text in `SubscriptionsDashboard` cancel flow.
- Email templates: verify cancel/trial templates are localized (EN/CS/SK).
- Legal: ensure Terms/Privacy include policy references across locales.
Acceptance
- UAT of both cancel modes; localized emails received; legal texts consistent.

### Phase 4 — Identity & RLS Consolidation (2–3 days)
Goals
- Standardize on Supabase-first identity (auth.uid()) in production policies while preserving docs’ “Identity and RLS note”.
Tasks
- Audit migrations for `app.current_external_id()` usage; convert active policies to `auth.uid()`.
- Keep doc note clarifying: “Production uses `auth.uid()`; helper discussed for historical context only.”
Acceptance
- Active RLS policies are `auth.uid()`-based; RLS smoke tests pass.

### Phase 5 — Sharing Feature Baseline (2–4 days)
Goals
- Ship minimal secure sharing.
Tasks
- DB tables: `public.share_links`, `public.share_audit` with RLS/service-role policies.
- Edge function: `share-resolver` validates token/password/expiry and logs audit (privacy-safe hashes).
- UI: create/rotate/revoke/copy links; optional password and expiry.
Acceptance
- Owner creates link; audit records; revocation/expiry enforced; no PII logged.

### Phase 6 — Release & QA Playbook Completion (1–2 days)
Goals
- Operationalize three QA gates with staging dry-run.
Tasks
- Document staging dry-run and rollback steps; CI gates:
  - Accessibility/i18n: keyboard-only smoke, language menus ≥4 per domain.
  - Privacy/security: hashed search + RLS smokes; secret scan.
  - Alerts: one critical via `log-error`, dedupe verified via `alert_instances`.
Acceptance
- Staging dry-run executed and all gates pass.

### Phase 7 — Redirect Gating Verification (0.5 day)
Goals
- Confirm env-gated redirect behavior and robots adherence.
Tasks
- Ensure `VITE_IS_PRODUCTION` set correctly per env; verify Czech simulation modal in non-prod, real redirects in prod.
Acceptance
- Manual checks per `docs/domain/redirect-strategy.md` pass.

### Phase 8 — Next.js Migration (apps/web-next) (5–8 days)
Goals
- Migrate to Next.js App Router with parity of critical features.
Tasks
- Create `apps/web-next` with:
  - Next 14/15 App Router + TypeScript; `next-intl` for i18n.
  - Supabase auth SSR helpers; middleware for locale detection.
  - Header (icons), Country menu, Search box, Support/Legal, Pricing, Subscriptions dashboard, Documents list/detail (read-only first).
- Redirect gating and Czech simulation modal ported.
- Hashed search via Edge Function from client without logging raw terms.
- E2E parity suite with Playwright.
Acceptance
- `apps/web-next` deployed to staging; parity suite green; plan to retire `apps/web` post cutover.

### Phase 9 — Mobile App (Expo RN) MVP (5–8 days; post‑MVP acceptable)
Goals
- Ship minimal mobile experience.
Tasks
- Expo RN app with Supabase auth, i18n, documents list/detail (signed URLs), hashed search, reminders inbox.
- Privacy: no raw search terms in logs; no secrets printed.
Acceptance
- iOS/Android simulator smoke tests pass; RLS respected; search works.

### Phase 10 — Salt Rotation & Reindex Runbook (0.5–1 day)
Goals
- Complete hashed-search operational story.
Tasks
- Document `scripts/reindex-hashed-search.ts` usage, rotation sequence, and reindex steps.
Acceptance
- Staging dry-run on a small dataset; documented.

### Phase 11 — Observability Polish (0.5–1 day)
Goals
- Alerts actionable and quiet in steady-state.
Tasks
- Confirm per-env recipients; rate-limit via fingerprint; fallback Resend path works.
Acceptance
- One critical emits a single alert; duplicates suppressed within cooldown.

### Phase 12 — Documentation Pass (0.5–1 day)
Goals
- Align docs and ADRs with reality.
Tasks
- Update specs/ADR with table names and paths; add matrix-check script reference; document Next.js app paths; clarify Identity note.
Acceptance
- Docs guide new contributors correctly end-to-end.


## 2) Acceptance Criteria Summary By Gap
- Observability tables: migrations exist and are deployed; helper functions insert and alert successfully.
- i18n health checks: CI enforces domain-language invariants and 34-language target.
- Support page: EN/CS/SK variants and header/footer links live.
- Refund/Cancel/Trial: UI and email templates localized; legal pages updated.
- Identity/RLS: `auth.uid()` active everywhere; RLS smoke tests green; docs clarify history.
- Sharing: secure links with optional password/expiry and privacy-preserving audit; viewer clean.
- QA gates: implemented and passing; staging dry-run documented and exercised.
- Redirect gating: verified in non-prod/prod per rules.
- Next.js: `apps/web-next` shipped with parity; Vite app retired post cutover.
- Mobile: Expo MVP shipped.
- Salt rotation: runbook in place and tested on staging.


## 3) Risks & Mitigations
- React Native web interop: Prefer `react-native-web` alias to avoid fragile stubs; keep stubs as fallback.
- Identity policy drift: Lock policies to `auth.uid()` with tests; keep docs for context but forbid new code using `app.current_external_id()`.
- Alert noise: Rate-limit via `alert_instances` fingerprint and per-env recipient lists.
- i18n sprawl: Matrix enforcement prevents regressions; generation script can be added later.


## 4) Implementation Notes & Snippets

Observability: table outlines (SQL sketch)
```sql
-- error_logs, alert_rules, alert_instances (outline only; finalize during migration)
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  error_type text not null,
  error_message text not null,
  error_stack text null,
  severity text not null,
  context jsonb null,
  url text null,
  user_agent text null,
  session_id text null,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  condition_type text not null,
  condition_config jsonb not null,
  severity text not null,
  enabled boolean not null default true,
  cooldown_minutes int not null default 30,
  notification_channels text[] not null default '{email}',
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.alert_instances (
  id uuid primary key default gen_random_uuid(),
  alert_rule_id uuid references public.alert_rules(id) on delete cascade,
  title text not null,
  message text not null,
  severity text not null,
  triggered_data jsonb not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_instances ENABLE ROW LEVEL SECURITY;
-- Policies: service_role manage; optionally allow admin read.
```

i18n matrix health-check (script sketch)
```ts
// scripts/i18n-health-check.ts (outline)
import fs from 'fs'
import path from 'path'
import { DOMAIN_LANGUAGES } from '../packages/shared/src/config/languages'

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg) }

function main() {
  // 1) ≥4 per domain
  for (const [host, langs] of Object.entries(DOMAIN_LANGUAGES)) {
    assert(langs.length >= 4, `Domain ${host} has only ${langs.length} languages`)
  }
  // 2) Special rules
  assert(!DOMAIN_LANGUAGES['legacyguard.de']?.includes('ru'), 'Germany must not include Russian')
  assert(!DOMAIN_LANGUAGES['legacyguard.is']?.includes('uk'), 'Iceland must not include Ukrainian')
  assert(!DOMAIN_LANGUAGES['legacyguard.li']?.includes('uk'), 'Liechtenstein must not include Ukrainian')
  for (const host of ['legacyguard.lt','legacyguard.lv','legacyguard.ee']) {
    assert(DOMAIN_LANGUAGES[host]?.includes('ru'), `${host} should include Russian per matrix rule`)
  }
  console.log('i18n matrix check passed')
}

main()
```

Vite web build fix (preferred alias to RNW)
```ts
// apps/web/vite.config.ts (excerpt)
resolve: {
  alias: [
    { find: /^react-native$/, replacement: 'react-native-web' },
    { find: /^react-native\/(.*)$/, replacement: 'react-native-web/dist/$1' },
  ],
},
optimizeDeps: {
  include: ['react-native-web'],
  exclude: ['react-native'],
},
build: {
  commonjsOptions: {
    ignore: ['react-native', /^react-native\//],
  },
},
```


## 5) Timeline (rough)
- Week 1: Phases 0–4
- Week 2: Phases 5–7 and begin Phase 8 (Next.js)
- Week 3: Finish Phase 8 + Phase 11–12; cutover to Next.js
- Week 4 (post‑MVP): Phase 9 (mobile) + Phase 10 runbook


## 6) Approvals
- Commits to `main` only; small, reviewable PRs; staging dry-run required before sensitive changes.


---
Questions or approvals: please comment inline and I will execute the next steps.
