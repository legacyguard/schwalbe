# Hollywood → Schwalbe Migration Plan

Author: Agent Mode (Warp)
Branch: migrate/hollywood-import
Status: In progress
Last updated: 2025-09-17

## 1) Objectives

- Safely integrate the best parts of “hollywood” (LegacyGuard) into “schwalbe” without breaking current code.
- Preserve schwalbe Topbar and UX shell while adopting Hollywood’s landing, onboarding philosophy, AI assistant, and personalized dashboard.
- Maintain incremental rollout with feature flags, analytics, and a clear rollback path.

## 2) Scope

Included (phased):

- Phase A: Next.js Landing v2 (animated hero + sections), gentle CTA, analytics, i18n (next-intl).
- Phase B: Onboarding Engine (questions → persona → plan) and MicroTask scaffolding.
- Phase C: AI Assistant (Sofia) minimal viable core (context + UI), adapters.
- Phase D: Personalized Dashboard (family protection analytics, milestones, “next best action”).
- Phase E: Stabilization, refactors, unvendor, cleanup.

Excluded initially:

- Full design-token unification across all apps.
- Deep mobile (React Native) integration beyond shared design language.
- Auth provider swaps (we’ll abstract and adapt later).

## 3) Constraints / Environment

- Package manager: npm
- Frameworks: Next.js (App Router) + React; also Vite and React Native present in monorepo.
- i18n: next-intl for Next.js at apps/web-next/src/messages/{en,sk,cs}.json
- Vendor import: hollywood is added via git subtree under vendor/hollywood
- Branching: all work on migrate/hollywood-import

## 4) High-level Approach

- Keep hollywood code isolated under vendor/hollywood.
- Integrate feature-by-feature behind flags; start with /landing-v2.
- Normalize all user-facing copy into next-intl messages; code stays in English.
- Add analytics (CTA clicks, scroll, view) for UX tuning; support A/B next.
- Progressively extract reusable logic to packages/ (e.g., ai-assistant, onboarding) once stable.

## 5) Risks and Mitigations

- Dependency drift: isolate vendor; only pull what we need; typecheck after each change.
- Routing mismatch (react-router vs Next.js): re-implement pages in Next.js idioms.
- i18n mismatch (i18next vs next-intl): map keys and move text into next-intl JSONs.
- Auth expectations (Clerk vs Supabase): define thin auth adapter; defer deep coupling.
- Regressions: feature flags off by default; PR reviews; small commits.

## 6) Architecture & Directory Map

- vendor/hollywood: source import (web, packages/ui|shared|logic, mobile, etc.)
- apps/web-next/src/app/[locale]/landing-v2: new gated landing (Next.js App Router)
- apps/web-next/src/components/landing/LandingV2.tsx: hero, sections (Next.js, framer-motion)
- apps/web-next/src/messages/{en,sk,cs}.json: i18n texts for landing v2
- apps/web-next/src/config/flags.ts: feature flags (NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING)

Future (proposed):

- packages/ai-assistant: Sofia core (context + personality + orchestration)
- packages/onboarding: Engine (questionnaire, planner, microtasks)
- apps/web-next/src/app/[locale]/onboarding: Next.js onboarding routes
- apps/web-next/src/app/[locale]/dashboard: personalized views

## 7) Phased Delivery

### Phase A: Landing V2 (this PR series)

Goals:

- Animated hero and key sections adapted from hollywood.
- next-intl i18n for all copy.
- Analytics for CTA clicks and scroll interactions.
- Maintain current Topbar via layout; route gated by NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING.

Deliverables:

- /[locale]/landing-v2 fully working, feature-flagged (default OFF).
- Analytics endpoint (basic) + client util wired to LandingV2.
- Basic UX polish (gentle urgency, mobile-first, accessibility checks).

Definition of Done:

- dev build green, typecheck/lint pass.
- QA: smoke test on en/sk/cs; Topbar present; sections render; no console errors.
- Flag OFF by default; enabling shows v2 page.

### Phase B: Onboarding Engine

Goals:

- Short, empathetic onboarding → persona → plan (milestones + next actions).
- Store interim progress locally; add hooks for Supabase sync later.

Deliverables:

- packages/onboarding: domain types, engine, step UI skeleton.
- /[locale]/onboarding routes (feature-flagged).

Definition of Done:

- Flow completes and produces structured plan; copy in next-intl.

### Phase C: AI Assistant (Sofia) – minimal

Goals:

- Context service (personality, progress) + simple chat panel UI.
- Auth adapter interface; avoid hard Clerk dependency.

Deliverables:

- packages/ai-assistant core (no vendor lock-in), minimal UI component for Next.js.

Definition of Done:

- Assistant can surface “next best action” based on onboarding plan + events.

### Phase D: Dashboard personalization

Goals:

- FamilyProtectionAnalytics + milestones from hollywood adapted to Next.js.
- MicroTask Engine integration.

Deliverables:

- Personalized dashboard sections; analytics events; gentle celebrations.

Definition of Done:

- Users see relevant tasks and progress; key widgets stable and accessible.

### Phase E: Stabilization & Cleanup

Goals:

- Move stabilized code from vendor to packages/apps.
- Remove unused vendor code; unify configs.

Deliverables:

- Clean import graph; consistent tsconfig/eslint; updated docs.

## 8) i18n Strategy

- Next.js uses next-intl messages under apps/web-next/src/messages.
- All user-facing copy from migrated components lands here.
- (Optional) Add a resolver to prefer /srn/i18n/locale and fallback to src/messages if needed.

## 9) Analytics & A/B Testing

- Introduce lightweight analytics endpoint in Next.js (no PII, dev-only logging initially).
- Track CTA clicks, scroll depth, and section view.
- Prepare structure for flag-based A/B later (variant keys in events).

## 10) Security & Privacy

- No secrets in code or logs; env via NEXT_PUBLIC_ for client flags only.
- Server endpoints: validate method, size limits, and sanitize inputs.
- Future: Supabase with RLS for persisted telemetry (opt-in).

## 11) Rollback Strategy

- All changes on branch migrate/hollywood-import.
- Hollywood import is a subtree commit; easy to revert if needed.
- Feature flags default OFF; landing v2 is isolated route (/landing-v2).

## 12) QA Plan

- For each change: typecheck, lint, build.
- Manual smoke test: en/sk/cs; mobile viewport; reduced-motion; keyboard nav.
- E2E smoke draft for landing (later): hero renders, CTA works, events sent.

## 13) Milestones & PR Slicing

- A.1: Docs (this file) + route scaffolding + i18n files [DONE]
- A.2: Analytics endpoint + client util + wire CTA + scroll [NEXT]
- A.3: UX polish (copy, spacing, accessibility) + basic tests
- A.4: Review & merge Phase A

## 14) Current Status

- vendor/hollywood subtree added.
- Feature-flagged route /[locale]/landing-v2 in Next.js.
- LandingV2 component implemented with hero/sections.
- i18n set up for en/sk/cs and loader points to src/messages.

## 15) Open Questions

- Keep next-intl as primary i18n store, and optionally add /srn/i18n/locale resolver?
- Preferred analytics storage long-term (Supabase or 3rd party)?

---

## Execution Checklist (Phase A)

- [ ] Add analytics endpoint (apps/web-next/src/app/api/analytics/events/route.ts)
- [ ] Add client util (apps/web-next/src/lib/analytics.ts) using sendBeacon/fetch
- [ ] Wire LandingV2 CTA and section views to analytics
- [ ] Manual QA on en/sk/cs, mobile/desktop, reduced motion
- [ ] Commit small changes with clear messages; prepare PR
