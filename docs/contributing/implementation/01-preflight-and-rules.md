# Phase 01 – Preflight & Global Rules

Purpose
Ensure every implementation task starts with the correct global constraints and inputs.

Inputs to include in your kickoff prompt
- SPEC LINKS: canonical docs you’re following (paste paths/URLs)
- TARGET FEATURE: short title and goal
- IMPACTED AREAS: codepaths or modules
- RISK TOLERANCE: low/medium/high
- PERMISSIONS: edit_code, readonly_cmds, run_tests, commit (ask)

Kickoff prompt (copy/paste)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: <short title>
CONTEXT: Following <spec links>. This phase ensures global constraints are enforced from the start.
SCOPE:
- Confirm i18n = 34 languages; English UI strings outside i18n
- Confirm VITE_IS_PRODUCTION redirect gating in routing/app shell
- Confirm Supabase logging baseline and critical email alerts via Resend
- Confirm hashed+salted search index policy in docs/config
- Confirm Identity & RLS guidance present in data model
NON_GOALS:
- Feature-specific implementation
ACCEPTANCE CRITERIA:
- Checklist complete; gaps noted with follow-ups
DELIVERABLES:
- Updated docs/links; small diffs if required
CONSTRAINTS:
- No secrets printed; least privilege; small diffs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- All global rules documented and validated
```

Checklist
- [ ] i18n total languages = 34 reflected in docs and configs
- [ ] Redirect gating documented and verified
- [ ] Sentry removed (if present); Supabase logging baseline
- [ ] Privacy index policy documented
- [ ] Identity & RLS note present

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Preflight & global rule validation
CONTEXT:
- Specs/docs:
  - docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md
  - docs/i18n/strategy.md
  - docs/domain/redirect-strategy.md
  - docs/adr/ADR-003-env-multidomain-redirects.md
  - docs/adr/ADR-001-supabase-auth-identity.md
  - docs/security/overview.md
- Code/config to verify:
  - packages/shared/src/config/domains.ts (isProduction, COUNTRY_DOMAINS)
  - apps/web/src/lib/utils/redirect-guard.ts
  - packages/shared/src/lib/supabase.ts and packages/shared/src/supabase/client.ts
  - supabase/functions/send-email/index.ts (Resend integration)
  - supabase/migrations/20240102000000_create_monitoring_tables.sql
SCOPE:
- Confirm i18n = 34 languages reflected in docs and planned configs
- Confirm VITE_IS_PRODUCTION gating policy (prod redirects vs non-prod CZ simulation) is documented and ready
- Confirm Supabase logging baseline (monitoring tables) and Resend email path exist
- Confirm privacy-preserving search index approach documented (hashed+salted tokens)
- Confirm Identity & RLS guidance present (ADR-001) and reconcile with Auth+RLS quickstart
NON_GOALS:
- Feature-specific implementation
ACCEPTANCE CRITERIA:
- Checklist complete with notes; gaps ticketed
DELIVERABLES:
- Minor doc updates if needed
CONSTRAINTS:
- No secrets printed; least privilege
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- All global rules documented and validated
```
