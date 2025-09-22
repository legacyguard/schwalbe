# Phase 33 – Webhook Reliability, Idempotency & Alerting

Purpose
Harden Stripe and other critical webhooks with signature verification, idempotency, retries, structured logging, and alerts.

Inputs
- ENDPOINTS: stripe-webhook (Phase 27), any other critical webhooks
- ALERTS: thresholds for failure rate, latency

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Webhook reliability + idempotency + alerting
CONTEXT:
- Stripe webhook at supabase/functions/stripe-webhook/index.ts
- Monitoring tables: supabase/migrations/20240102000000_create_monitoring_tables.sql
SCOPE:
- Verify Stripe signature (STRIPE_WEBHOOK_SECRET); canonicalize raw body for verification
- Add idempotency store (webhook_logs with event_id unique) to skip duplicates
- Implement retry-safe handlers and structured logs (level, event_type, customer_id, subscription_id)
- Alerting: critical email via Resend on persistent failures (>N in Mins)
- Observability: minimal metrics increments per event type
NON_GOALS:
- Full observability stack
ACCEPTANCE CRITERIA:
- Duplicate deliveries skipped; bad signatures rejected; alerts fire on repeated failures
DELIVERABLES:
- webhook updates, idempotency table/index, alerting hook, docs
CONSTRAINTS:
- No secrets in logs; PII minimization
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Simulate duplicate + bad signature; verify behavior and alerting
```
