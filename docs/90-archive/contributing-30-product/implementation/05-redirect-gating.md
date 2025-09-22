# Phase 05 – Redirect Gating by VITE_IS_PRODUCTION

Purpose
Wrap country-based redirect logic so prod does real redirects and non-prod shows CZ simulation.

Inputs
- SPEC LINKS: redirect gating requirement
- DOMAINS: active domain list to simulate

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Redirect gating by VITE_IS_PRODUCTION
CONTEXT: Preserve switch/case by country; gate with env; simulate in CZ for non-prod.
SCOPE:
- Wrap redirect code in if (VITE_IS_PRODUCTION)
- Else: show CZ modal/toast with target URL for each domain
- Add QA checklist in docs
NON_GOALS:
- Modal redesign
ACCEPTANCE CRITERIA:
- Prod: real redirects; Staging/local: simulation only
DELIVERABLES:
- Routing/app shell diffs; docs
CONSTRAINTS:
- UI English; simulation text Czech; no interactive commands
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Manual verification on CZ/SK
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Redirect gating by VITE_IS_PRODUCTION
CONTEXT:
- Policy: docs/domain/redirect-strategy.md, docs/adr/ADR-003-env-multidomain-redirects.md
- Code refs: packages/shared/src/config/domains.ts (isProduction), apps/web/src/lib/utils/redirect-guard.ts
SCOPE:
- Use isProduction() (domains.ts) to gate redirects
- If prod: perform real redirects to buildCountryUrl(code)
- If non-prod: show Czech simulation modal/toast listing target URL per domain (no navigation)
- Add QA checklist to docs/domain/redirect-strategy.md
NON_GOALS:
- New modal design
ACCEPTANCE CRITERIA:
- Prod redirects; staging/local CZ simulation only
DELIVERABLES:
- Routing/app shell diffs (TopBar/CountryMenu usage); docs update
CONSTRAINTS:
- UI English; simulation text in Czech; no interactive shell commands
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Manual CZ/SK verification
```
