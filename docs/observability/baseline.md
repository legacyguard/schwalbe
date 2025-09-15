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
