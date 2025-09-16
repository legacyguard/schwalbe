# Observability Baseline: Telemetry & Alerting Runbook

Owner: Platform
Last updated: 2025-09-16

## Purpose

Define a minimal, privacy-aware logging and alerting baseline for Schwalbe that:
- Standardizes log levels and contexts
- Triggers rate-limited alert emails on critical errors via Resend
- Provides clear investigation and rollback steps

Non-goals: full observability stack or vendor lock-in.

## Configuration (no secrets in content)

Environment variables (set in Supabase Edge Function secrets and Vercel envs):
- MONITORING_ENVIRONMENT: development | staging | production
- MONITORING_ALERT_EMAIL: comma-separated list (e.g., staging-alerts@documentsafe.app)
- MONITORING_ALERT_FROM: display sender (default: "Schwalbe Alerts <alerts@documentsafe.app>")
- ALERT_RATE_LIMIT_MINUTES: minutes to suppress duplicate alerts (default: 30)
- RESEND_API_KEY: used only by server-side function to send emails

Note: Do not include secrets in alert payloads. The system redacts common token patterns automatically.

## Log Levels and Severity Mapping

- debug -> not persisted by baseline
- info -> not persisted by baseline
- warn -> severity: low
- error -> severity: high
- critical -> severity: critical

Database column severity supports: low | medium | high | critical.

## Contexts

Use one of:
- auth, database, billing, storage, sharing, search, rls, edge, client, ai, documents, subscriptions, reminders, alerts

## Critical Error Thresholds

An error is considered critical if any of the following are true:
- error_type in { security, database, rls_violation }
- http_status >= 500 AND context in { auth, database, rls }
- unhandled is true AND context in { auth, database, rls }
- Optional burst rule (documented): >=5 occurrences of the same error within 10 minutes (future enhancement)

## Alerting Flow

1) Client/server calls the Edge Function POST /functions/v1/log-error with error data
2) Function writes to error_logs with computed severity
3) If severity=critical, function checks alert_instances for a recent fingerprint
4) If not found within ALERT_RATE_LIMIT_MINUTES, function creates alert_instances row and sends an email via Resend

Email content contains:
- Environment, type, context, redacted message, optional URL
- No secrets or raw stack traces

## Investigation Playbook

1) Confirm alert receipt and context
- Subject: [ENV] Critical <type>
- Check recipients configured via MONITORING_ALERT_EMAIL

2) Inspect recent errors
- SQL (Supabase SQL editor):
```
SELECT id, error_type, severity, url, created_at
FROM error_logs
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 50;
```

3) Find the alert instance by fingerprint (if present in email link or logs)
```
SELECT id, title, severity, triggered_data, created_at
FROM alert_instances
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 20;
```

4) Identify blast radius
- Correlate by url, session_id, user_id if available
- Check recent deploys and feature flags

5) Remediation options
- Hotfix the offending code path
- Feature-flag off the risky feature (if supported)
- Temporarily degrade functionality (graceful fallback)

## Rollback Steps (low-risk)

- Revert to last known good deploy in Vercel
- If the error relates to a specific Edge Function:
  - `supabase functions list`
  - Re-deploy last known good or disable caller temporarily
- If alerts are too noisy:
  - Increase ALERT_RATE_LIMIT_MINUTES (staging first)
  - Do NOT disable alerts in production unless on-call is aware

## Staging Test (required before Done)

Use a temporary critical error to validate:

- Invoke via curl (replace {{SUPABASE_URL}} and {{ANON_OR_BEARER_TOKEN}}):
```
curl -sS -X POST "{{SUPABASE_URL}}/functions/v1/log-error" \
  -H "Authorization: Bearer {{ANON_OR_BEARER_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "error_type": "database",
    "message": "Simulated connection failure",
    "context": "database",
    "http_status": 500,
    "url": "/api/test"
  }'
```
- Expected: JSON success, alerted=true, severity=critical
- Verify an email arrives to MONITORING_ALERT_EMAIL
- Check alert_instances for a new row within last 5 minutes

## Runbook Walkthrough

- Who: On-call (Platform)
- When: Upon any critical alert
- Actions:
  1) Acknowledge alert (email thread)
  2) Check error_logs and alert_instances (SQL above)
  3) Decide mitigate vs rollback
  4) Create/attach incident note in issue tracker
  5) Post-mortem if user impact confirmed

## Notes

- RLS: error_logs and alert tables must be accessible by service role only for writes; users may have read per policies
- Privacy: No PII or secrets in alerts; messages are redacted by pattern
- Rate limiting: De-duplicates by fingerprint within ALERT_RATE_LIMIT_MINUTES

# Observability Baseline (No Sentry)

Status: Active
Related ADR: ../adr/ADR-002-observability-no-sentry.md

Overview
- Replace Sentry with:
  - Supabase logs and a dedicated error_log table
  - Critical alerting via Resend through the send-email Edge Function
- Goal: Persist all errors and deliver alerts for level >= error in staging and production.

Schema
- Table: public.error_log
  - id (uuid, pk, default gen_random_uuid())
  - level (text: debug|info|warn|error|fatal)
  - message (text)
  - context (jsonb)
  - stack (text)
  - created_at (timestamptz default now())
- RLS:
  - Insert: anon, authenticated, service_role
  - Read/Update/Delete: service_role only

Client/Server Logging Utility
- File: packages/shared/src/services/monitoring.service.ts
- Usage:
  - Monitoring.error('something failed', { feature: 'x' }, err)
  - Monitoring.info('something happened', { meta: 123 })
- Behavior:
  - Writes a row to public.error_log
  - If level >= error, triggers an email via Supabase Edge Function send-email

Environment Variables
- Required:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY (client-side; used for inserts only)
  - SUPABASE_SERVICE_ROLE_KEY (server-only; used for server-triggered alerts)
  - ALERT_EMAIL_TO (e.g., alerts@example.com)
- Optional:
  - NEXT_PUBLIC_* or EXPO_PUBLIC_* for frontends
- Security:
  - Never print secrets. Service role is only used on server/CI/Edge; browser uses anon key.

Alert Path
- Edge Function: supabase/functions/send-email/index.ts (uses RESEND_API_KEY)
- Server/Edge: POST {SUPABASE_URL}/functions/v1/send-email with Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
- Browser: supabase.functions.invoke('send-email') if an authenticated session is present; otherwise skipped.

Runbook
1) Preflight
   - Ensure RESEND_API_KEY is configured for the send-email Edge Function.
   - Ensure ALERT_EMAIL_TO is set.
   - Deploy migrations: error_log table + RLS hardening.
   - Redeploy shared package.

2) Manual Test (staging/dev)
   - In a staging environment with ALERT_EMAIL_TO set to a test inbox:
     a) Trigger: from any page or function, run:
        Monitoring.error('E2E test: logging baseline', { test: true, scope: 'observability-test' }, new Error('Simulated'))
     b) Verify DB: SELECT level,message,created_at FROM public.error_log ORDER BY created_at DESC LIMIT 1; confirm row and level.
     c) Verify Email: an alert should arrive with subject like "[ERROR] Schwalbe alert: E2E test: logging baseline".
     d) Throttle check: call Monitoring.error with the same inputs within 10 minutes; verify only one email alert is received.

3) Triage Operational Issues
   - If no DB row: confirm network access to Supabase and that RLS allows INSERT for "authenticated" role.
   - If no email:
     - Check send-email function logs in Supabase dashboard.
     - Confirm Authorization header used server-side; in browser ensure user session exists.
     - Validate RESEND_API_KEY and from address.

4) Least Privilege
   - Keep read/update/delete on error_log restricted to service role only.
   - Client only inserts; cannot read or delete.

5) Retention Strategy (disabled by default)
   - Recommended retention: 30–90 days.
   - SQL snippet to enable later (disabled by default):
     ```sql
     -- path=null start=null
     -- Delete error logs older than 90 days
     DELETE FROM public.error_log WHERE created_at < NOW() - INTERVAL '90 days';
     ```
   - Optional pg_cron schedule to enable later:
     ```sql
     -- path=null start=null
     -- SELECT cron.schedule('purge-error-log', '0 3 * * *', $$DELETE FROM public.error_log WHERE created_at < NOW() - INTERVAL '90 days';$$);
     ```

6) Structured Console Logging
   - All Monitoring.log(...) calls also emit a JSON console line with fields:
     { level, message, timestamp, environment, app_version, user_id?, request_id?, context, stack? }
   - No secrets are included; ensure context does not contain secrets.

7) Identity and RLS note
   - Standard guidance: use app.current_external_id() and public.user_auth(clerk_id) when mapping identities in RLS decisions.
   - See specs/005-auth-rls-baseline/data-model.md for the canonical identity approach.

8) E2E Verification Log
   - Date: <fill in when tested>
   - DB row: ✅ present (id: <redacted>, level: error, message: E2E test: logging baseline)
   - Email: ✅ alert received at ALERT_EMAIL_TO
   - Throttle: ✅ duplicate within 10 minutes produced no second email
