# Phase 30 – E2E Money‑Path Smoke Tests

Purpose
Automate end‑to‑end smoke tests across the critical paid journey.

Inputs
- FLOWS: registration → checkout → entitlement → wizard → export → share; failed payment path
- ENV: staging URLs and secrets

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: E2E money‑path smoke tests
CONTEXT:
- Use Playwright (or Cypress) in apps/web for E2E
- Stripe: test keys + webhooks in staging
SCOPE:
- Add E2E tests under apps/web/tests/e2e/money-path.spec.ts
  - Happy path: sign up → buy → confirm entitlement → run wizard minimal → export PDF → create share link
  - Failure path: failed payment → banner + email dunning
- Minimal fixtures and selectors to be stable
- Add CI job to run smoke on staging
NON_GOALS:
- Full regression coverage
ACCEPTANCE CRITERIA:
- Tests pass locally and in CI against staging
DELIVERABLES:
- E2E spec, fixtures, CI workflow step
CONSTRAINTS:
- No secrets printed in logs; mask Stripe keys
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- CI run green; artifacts show screenshots/videos on failure
```
