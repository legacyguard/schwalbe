# Subscriptions Tracking

Purpose: Track subscriptions with cost and renewal metadata, provide user preferences for renewal reminders, surface in UI dashboards, and send reminders before expiry via existing reminder engine and Resend email.

Scope delivered:
- DB: user_subscriptions extended (price_amount_cents, price_currency, auto_renew, renew_url); subscription_preferences with RLS; trigger-driven reminder upserts based on expires_at
- Email: Resend-backed subscription_expiry_reminder template
- UI: apps/web Subscriptions dashboard with cost and renewal views; preference editing
- Integration: reminders scheduled via DB trigger; delivery handled by run-reminders function

Privacy & RLS:
- No PII is logged beyond necessary delivery metadata (notification_log uses user_id or email from profiles)
- subscription_preferences protected by owner RLS
- Adheres to existing Identity and RLS guidance (app.current_external_id(), public.user_auth(clerk_id)) as used across repo

QA checklist:
- Run migration and ensure default preferences created for new users
- Set a test subscription with expires_at ~ 7 days in future; verify reminder_rule entries created
- Trigger GitHub workflow "Run Reminders" or call function; verify notification_log entries
- Send test email using send-email function; verify Resend delivery
- UI: adjust preferences; confirm reminder_rule rescheduled on next subscription update

Notes:
- Billing provider APIs are out of scope; this relies on existing webhook or manual updates populating user_subscriptions
- To avoid accidental PII exposure, email sending is a no-op when recipient email is missing