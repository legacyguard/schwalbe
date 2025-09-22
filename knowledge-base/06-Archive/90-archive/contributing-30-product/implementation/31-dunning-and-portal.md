# Phase 31 – Dunning + Email Flows + Billing Portal UX

Purpose
Handle failed payments gracefully, notify users, and provide self‑serve Billing Portal.

Inputs
- EMAILS: payment_failed, payment_recovered, trial_ending (optional)
- BILLING PORTAL: Stripe billing portal configuration and link in app

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Dunning + email flows + Billing Portal UX
CONTEXT:
- Email function: supabase/functions/send-email/index.ts (Resend)
- Subscription service: packages/shared/src/services/subscription.service.ts
- Pricing UI: apps/web/src/components/landing/PricingSection.tsx
SCOPE:
- Webhook handlers: on invoice.payment_failed → mark past_due; send email; show in-app banner
- Recovery: on invoice.payment_succeeded after failure → send recovery email; clear banner
- Add Stripe Billing Portal link (apps/web/src/features/account/Billing.tsx) and label in menu
- Email templates (Resend): payment failed, recovered; use minimal compliant footers
- Update gating to respect grace period if desired (MVP optional)
NON_GOALS:
- Complex retry policies beyond Stripe defaults
ACCEPTANCE CRITERIA:
- Failed payments produce banner + email; recovery clears banner and sends confirmation
- Billing Portal accessible and updates are reflected on next sync
DELIVERABLES:
- Webhook updates, email templates, account/billing UI, banner component
CONSTRAINTS:
- Secrets via env; no PII in logs; idempotent webhook actions
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Staging test: force failure → receive email + banner; pay → recovery email + banner cleared
```
