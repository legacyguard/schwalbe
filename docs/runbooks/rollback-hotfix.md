# Rollback & Hotfix Runbook

Owner: Ops (Platform)
Last updated: 2025-09-16

Scope
- Provide clear, low-risk steps to roll back a release and apply hotfixes with minimal downtime.

Principles
- Keep it reversible; prefer configuration/env flag over code changes when possible.
- No secrets in terminals/logs; use provider secret stores and bearer tokens.
- Stage first; production only with explicit approval.

Prerequisites
- Provider access to web deploys (e.g., Vercel) and Supabase (DB + Edge Functions).
- Error logging baseline active (see docs/observability/baseline.md).

Quick Reference
- Health endpoints: If available, prefer GET /health or provider dashboard signals.
- Error DB tables: public.error_log (or error_logs/alert_instances as configured).
- Alert email: MONITORING_ALERT_EMAIL inbox.

Rollback Decision Tree
1) Is the issue scoped to frontend only (no DB changes)?
   - Yes → Revert frontend to last known good deploy.
   - No → Continue.
2) Did the release include DB migrations?
   - Yes → Evaluate migration reversibility.
     - If reversible: apply rollback scripts in staging first, then production.
     - If not easily reversible: hotfix forward with feature-flagging and guard rails.
   - No → Revert affected Edge Functions/API and frontend.
3) Is user impact critical (security/privacy/availability)?
   - Yes → Rollback immediately and communicate incident; then hotfix.
   - No → Consider targeted hotfix without full rollback.

Safe Rollback Steps
Frontend (Vercel or equivalent)
- Identify previous deployment (last known good).
- Trigger rollback to that deployment via provider UI/CLI (ask for approval before prod action).
- Verify: basic smoke tests (landing page, will wizard start, language menu).

Edge Functions
- List versions: supabase functions list
- If a specific function is culprit (e.g., log-error, send-email, hashed-search-*):
  - Redeploy the previous known good version.
  - Alternatively, temporarily disable caller path behind env flag.

Database
- If a migration created breaking change and has a documented DOWN script:
  - Apply DOWN in staging, verify smoke, then apply in production.
- If no DOWN script:
  - Create forward-fix migration to restore compatibility (e.g., recreate column with default), deploy to staging, verify, then production.

Hotfix Flow
- Create a minimal patch with the smallest possible blast radius.
- Tests: run typecheck, lint, unit/e2e if available.
- Deploy to staging; run smoke tests; verify alerts are quiet.
- Upon approval, deploy to production.

Verification After Rollback/Hotfix
- Monitor error_log and alert_instances for 30–60 minutes.
- Confirm user flows are restored (sign-in, protected routes, will wizard, sharing if affected).
- Document resolution and close incident.

Communications
- Before rollback: notify stakeholders; set expectations.
- After rollback/hotfix: share summary, affected scope, remediation, and next steps.

Appendix: SQL Snippets (read-only examples)
- Recent errors (2h window):
```
SELECT id, error_type, severity, url, created_at
FROM error_logs
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 50;
```
- Recent alerts (2h window):
```
SELECT id, title, severity, created_at
FROM alert_instances
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 20;
```

Notes
- Respect RLS and roles; use service role only in server/CI contexts.
- If alerts are too noisy during an incident, increase ALERT_RATE_LIMIT_MINUTES temporarily (staging first), never disable in prod without on-call agreement.
