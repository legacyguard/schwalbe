# Release & QA Playbook

Owner: Release Manager
Last updated: 2025-09-16

Purpose
- Provide a predictable, low-risk path to release with explicit gates and rollback plan.

Environments
- staging, production

Gates (must pass)
- Gate 22: A11y & i18n
- Gate 23: Privacy & Security
- Gate 24: Telemetry & Alerts

Definition of Done
- All three gates pass (or have low-risk exceptions ticketed and approved)
- Staging dry-run executed
- Rollback and hotfix plan documented and understood
- Sign-offs recorded (A11y/i18n, Security/Privacy, Ops)

References
- A11y & i18n: docs/contributing/implementation/22-a11y-i18n-qa.md
- Privacy & Security: docs/contributing/implementation/23-privacy-security.md
- Telemetry & Alerts: docs/contributing/implementation/24-telemetry-alerting.md
- Observability baseline + staging alert test: docs/observability/baseline.md
- Cutover example: docs/release/cutover-plan-auth-rls.md

Preflight checklist (repo)
- [ ] git clean (no uncommitted changes)
- [ ] npm ci completes on CI and local
- [ ] Build/typecheck/lint/tests green (tracked outside gates)
  - [ ] npm run build
  - [ ] npm run typecheck
  - [ ] npm run lint
  - [ ] npm test (unit and e2e if configured)

Gate 22: A11y & i18n
- [ ] i18n locale parity health check
  - Command: npm run i18n:check
  - CI workflow: .github/workflows/i18n-health-check.yml
- [ ] Language rules (≥4 languages per domain; special country rules)
  - Tests: packages/shared/src/config/__tests__/languageRules.test.ts
- [ ] A11y quick pass (low-risk, non-visual changes only)
  - Keyboard-only navigation for critical flows (header, language switcher, will wizard)
  - Screen reader labels and roles (aria-label, aria-controls, aria-activedescendant)
  - Hide decorative SVGs from SR (aria-hidden="true")
  - Heuristic contrast check for key components; ticket any risk items
- Evidence to attach
  - Latest QA notes: docs/qa/a11y-i18n-qa-report.md

Gate 23: Privacy & Security
- [ ] Logging policy: no PII in logs; structured errors only
  - Verify Monitoring service usage and DB error_log table presence
- [ ] Search privacy: hashed search index; no raw-term logging
  - Code: packages/shared/src/search/
- [ ] Sharing: link lifecycle/password/audit checks documented
- [ ] Banned legacy patterns check (Clerk, Sentry, app.current_external_id in active code)
  - Command (non-fatal in archived docs): see docs/ci/guards.md
- [ ] Secrets handling
  - No secrets committed; env docs up-to-date: docs/env/environment-variables.md
  - Server-only values not exposed via VITE_ unless intended

Gate 24: Telemetry & Alerts
- [ ] Monitoring tables present and RLS configured
  - supabase/migrations/20240102000000_create_monitoring_tables.sql
- [ ] log-error function deployed in environments
  - supabase/functions/log-error/index.ts
- [ ] Alerting route and rate-limit behavior documented
  - docs/observability/baseline.md, docs/observability/alerting-resend.md
- [ ] Staging alert test plan prepared (see Staging Dry-run)

Staging Dry-run (required)
- [ ] Confirm staging base URL and API available
  - VITE_APP_URL (staging) documented and reachable
- [ ] Basic health check
  - e.g., curl -I {{STAGING_WEB_ORIGIN}} and verify 200/3xx
- [ ] i18n check against staging build (optional visual smoke)
- [ ] Alerts: simulated critical error on staging (no secrets printed)
  - See docs/observability/baseline.md (curl POST to /functions/v1/log-error with Authorization: Bearer {{token}})
  - Expected: severity=critical, alerted=true, email received at MONITORING_ALERT_EMAIL
- [ ] Record results below and attach evidence/screenshots as applicable

Production Release (approval required)
- [ ] Release window confirmed (off-peak)
- [ ] Change summary prepared
- [ ] Final go/no-go with sign-offs (below)
- [ ] Deploy to production (per provider controls; no inline secrets)
- [ ] Post-release smoke tests (auth, will wizard key flow, payments if in scope)
- [ ] Monitoring watch window (24–48h) with alert inbox monitored

Rollback & Hotfix (see runbook)
- docs/runbooks/rollback-hotfix.md

Sign-offs
- [ ] A11y/i18n owner: __________________ Date: __________
- [ ] Security/Privacy owner: ___________ Date: __________
- [ ] Ops/Alerts owner: ________________ Date: __________
- [ ] Release Manager: _________________ Date: __________

Appendix: Suggested Commands (safe)
- i18n health check: npm run i18n:check
- Banned patterns guard (non-fatal in archived areas): see docs/ci/guards.md
- Language rules test (if jest wired): npm -w @schwalbe/web run test -- src/config/__tests__/languageRules.test.ts
- Staging alert test: docs/observability/baseline.md
