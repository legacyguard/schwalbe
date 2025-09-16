# Stripe Webhook Reliability, Idempotency, and Alerting

This function implements:
- Signature verification using Stripe SDK with the raw request body
- Idempotency via webhook_logs (unique webhook_id, attempts, status transitions)
- Retry-safe handlers with minimal side effects and structured logs
- Persistent-failure alerting via Resend (through shared insertErrorAndMaybeAlert)
- Minimal observability metrics per event type (webhook_metrics)

## Files
- supabase/functions/stripe-webhook/index.ts
- supabase/migrations/20240102000000_create_monitoring_tables.sql (webhook_logs exists; adds composite index)
- supabase/migrations/20250916184400_processed_webhooks.sql (older dedupe table; no longer used by webhook)
- supabase/migrations/20250916192550_webhook_metrics.sql (new)

## Environment variables
- STRIPE_SECRET_KEY: Stripe API secret (used for enrich/retrieve)
- STRIPE_WEBHOOK_SECRET: Webhook signing secret (required)
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: Admin client
- MONITORING_ALERT_EMAIL: Comma-separated alert recipients
- MONITORING_ALERT_FROM: From header for alert emails
- RESEND_API_KEY: API key for sending alert emails
- SITE_URL: Used in customer email links
- WEBHOOK_ALERT_WINDOW_MINUTES (default 10)
- WEBHOOK_ALERT_THRESHOLD (default 3)

## Data model
- webhook_logs(webhook_id UNIQUE, event_type, status, error, attempts, processed_at, created_at)
  - Status flow: received -> processing -> processed/failed
  - Index: (event_type, status, created_at)
- webhook_metrics(date, event_type, count) + increment_webhook_metric RPC

Note: legacy processed_webhooks(event_id) table exists; webhook now uses webhook_logs for dedupe and status tracking.

## Log fields (no PII)
- level (info|warn|error) and msg
- event_type, event_id
- customer_id, subscription_id (Stripe identifiers only)

## Testing

1) Bad signature is rejected
- Compute a request with invalid Stripe-Signature header:
  curl -s -X POST "${SITE_URL}/functions/v1/stripe-webhook" \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: t=0,v1=deadbeef" \
    -d '{"id":"evt_test","type":"invoice.payment_succeeded","data":{"object":{}}}' -i
- Expected: 400 with {"error":"invalid_signature"}

2) Duplicate delivery is skipped
- Send the same valid event twice (use Stripe CLI or record+replay with identical body and signature)
- First call: 200 {"received":true}
- Second call: 200 {"received":true,"duplicate":true}
- Check tables:
  select status, attempts from public.webhook_logs where webhook_id='<event_id>';

3) Persistent failure alerting
- Force handler to throw (e.g., temporarily break a DB permission) and post same failing event >= threshold within window
- Expected: alert created via insertErrorAndMaybeAlert (and email via Resend). Logs show stripe_webhook_failures.

## Operational notes
- No secrets are logged. Error messages passed to alerting are redacted before email.
- Status codes: 4xx on bad signatures; 5xx on processing errors to trigger Stripe retries.
- Handlers only use Stripe identifiers; user email is fetched via profile lookup.
