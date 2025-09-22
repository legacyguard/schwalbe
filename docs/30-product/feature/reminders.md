# Backup Reminders – Engine, UI, Scheduling

This document summarizes the implemented Backup Reminders feature and how to run it.

Scope
- Scheduling + smart triggers (RRULE subset: DAILY, WEEKLY, MONTHLY with INTERVAL)
- Delivery channels: in-app, email via Resend (through existing send-email Edge Function)
- Snooze and history (notification_log)
- Privacy-aware analytics (no PII; event types only)

Database
- Tables added (see migration 20250915211510_create_reminder_tables.sql):
  - reminder_rule: user-owned reminder definitions with scheduling fields
  - notification_log: per-delivery history entries (email, in_app)
- RLS: owner-only access; service role full on notification_log
- Indexes: user_id, status, scheduled_at, next_execution_at

Edge Function (Supabase)
- supabase/functions/run-reminders/index.ts
- Selects due reminders (next_execution_at <= now) and single-shot reminders (scheduled_at <= now, never executed)
- Sends email via functions.invoke('send-email') if channel includes email
- Logs entries to notification_log for both email and in_app
- Computes next_execution_at with minimal RRULE parser; marks completed when no next
- Emits analytics events (reminder_sent, reminder_error)

Web UI
- Routes: /reminders/* (wired in apps/web/src/main.tsx)
  - RemindersDashboard: list, snooze quick action, link to create/edit
  - ReminderForm: create reminders (title, description, datetime, channels, RRULE)
  - InAppReminderBanner: floating in-app notifications with dismiss (mark delivered)
- TopBar: bell icon link to /reminders

Shared Service
- @schwalbe/shared reminderService with CRUD, snooze, history, pending in-app fetch, mark delivered

Scheduling
- Options:
  1) Supabase Scheduled Triggers (if available) to hit the Edge Function
  2) External cron (e.g., GitHub Actions, Cloud Scheduler) making an HTTP POST to
     https://<PROJECT>.functions.supabase.co/run-reminders with Authorization: Bearer {{SUPABASE_SERVICE_ROLE_KEY}}
- Run frequency: every 5 minutes recommended

Environment
- Ensure send-email Edge Function is deployed and RESEND_API_KEY configured (already present in repo)
- For local dev: use supabase start, then supabase functions deploy run-reminders

Tests
- Unit tests for schedule logic in packages/logic/src/__tests__/reminders/schedule.test.ts

Notes
- All UI strings are English; analytics use monitoringService and avoid PII
- RRULE parser is minimal; extend as needed (BYDAY, etc.)
