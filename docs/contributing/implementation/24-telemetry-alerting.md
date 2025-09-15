# Phase 24 – Telemetry & Alerting (Operational Runbook)

Purpose
Establish minimal telemetry and actionable alerts for critical issues.

Inputs
- LOG SOURCES: app, edge functions
- ALERTS: what conditions should email

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Telemetry & alerting runbook
CONTEXT: Use Supabase logs and Resend emails to monitor production readiness.
SCOPE:
- Define log levels and contexts
- Create alerting thresholds and routes
- Add runbook: how to investigate and rollback
NON_GOALS:
- Full observability/metrics stack
ACCEPTANCE CRITERIA:
- Alerts trigger on critical errors; runbook clear
DELIVERABLES:
- logging/alerts config, runbook docs
CONSTRAINTS:
- No secrets in alerts; rate-limit to avoid noise
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Staging alert test; runbook walkthrough
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Telemetry & alerting runbook
CONTEXT:
- Tables: supabase/migrations/20240102000000_create_monitoring_tables.sql
- Email: supabase/functions/send-email/index.ts
SCOPE:
- Define log levels/contexts and critical error thresholds
- Configure alert emails via Resend
- Add runbook docs/observability/baseline.md with investigation/rollback steps
NON_GOALS:
- Full observability stack
ACCEPTANCE CRITERIA:
- Alerts trigger on critical errors; runbook clear
DELIVERABLES:
- logging/alerts config, runbook docs
CONSTRAINTS:
- No secrets in alerts; rate-limit
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Staging alert test; runbook walkthrough
```
