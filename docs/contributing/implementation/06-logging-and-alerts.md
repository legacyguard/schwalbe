# Phase 06 – Supabase Logging and Alerts (Replace Sentry)

Purpose
Migrate error tracking: remove Sentry, add Supabase error log storage and Resend alerts.

Inputs
- SPEC LINKS: logging replacement plan
- CRITICALITY: which errors should alert

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Supabase logging replaces Sentry + email alerts via Resend
CONTEXT: Shift to Supabase Edge Functions logs, structured console.error, and error_log table.
SCOPE:
- Remove Sentry config and deps
- Create error_log table and write API (minimal)
- Add logging wrappers to capture context
- Wire critical alerts via Resend
- Add runbook docs
NON_GOALS:
- Full observability stack
ACCEPTANCE CRITERIA:
- Errors visible in DB; critical emails delivered
DELIVERABLES:
- migrations, logging utilities, docs
CONSTRAINTS:
- Secrets via env; no secrets printed; least privilege
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/logging-supabase
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Staging e2e test for error path and email
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Replace Sentry with Supabase logging + Resend alerts
CONTEXT:
- ADR: docs/adr/ADR-002-observability-no-sentry.md
- Existing tables: supabase/migrations/20240102000000_create_monitoring_tables.sql
- Email function: supabase/functions/send-email/index.ts (uses RESEND_API_KEY)
SCOPE:
- Ensure no @sentry/* usage remains (remove if any)
- Add migration supabase/migrations/<timestamp>_create_error_log.sql with columns: id, level, message, context JSONB, stack, created_at
- Add logger util in packages/shared/src/services/monitoring.service.ts to write to error_log (client/server safe)
- Configure critical alert path (Resend) for level >= 'error'
- Add runbook in docs/observability/baseline.md
NON_GOALS:
- Full metrics/trace stack
ACCEPTANCE CRITERIA:
- Errors persisted; critical alerts delivered in staging test
DELIVERABLES:
- migration, logging util, docs
CONSTRAINTS:
- Secrets via env; no secrets printed; least privilege for service role
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/logging-supabase
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- End-to-end: throw test error → email and DB row present
```
