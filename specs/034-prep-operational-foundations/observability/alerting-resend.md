# Alerting (Resend)

Canonical copy; mirrors docs/observability/alerting-resend.md.

- Triggers: auth.failed_logins_spike, rls.denied_requests_spike, billing.webhook_error_rate_high, stripe.charge_failed, storage.upload_error_rate_high
- Implement alert emails via RESEND_API_KEY in edge functions or API routes
- Batch alerts to avoid floods
