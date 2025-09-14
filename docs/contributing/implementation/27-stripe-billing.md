# Phase 27 – Stripe Billing + Webhooks + Gating

Purpose
Enable paid plans: Checkout, webhooks persisting subscription state, and UI gating by plan.

Inputs
- STRIPE PRODUCTS: plan mapping for CZ/SK (e.g., Essential/Premium), currencies CZK/EUR
- ENV: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_* variables, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- DB: ensure presence of user_subscriptions or add minimal subscription columns

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Stripe billing + webhooks + gating (CZ/SK MVP)
CONTEXT:
- Pricing UI: apps/web/src/components/landing/PricingSection.tsx (and .js)
- Subscription service: packages/shared/src/services/subscription.service.ts
- Supabase functions exist; use them for Stripe webhooks/checkout
- DB migrations exist for subscriptions (supabase/migrations/20240101000000_create_subscription_tables.sql); extend if needed
SCOPE:
- Add Supabase Edge Functions:
  - supabase/functions/stripe-checkout/index.ts: create Checkout Session for selected plan (CZK/EUR), return url
  - supabase/functions/stripe-webhook/index.ts: handle events invoice.paid, checkout.session.completed, customer.subscription.updated/deleted → upsert subscription rows
- DB: if needed add migration supabase/migrations/<ts>_add_stripe_columns.sql
  - profiles: stripe_customer_id TEXT
  - user_subscriptions: stripe_subscription_id TEXT, plan TEXT, status TEXT, current_period_end TIMESTAMPTZ
- UI gating:
  - packages/shared/src/services/subscription.service.ts: add hasEntitlement(user, feature) and getPlan(user)
  - apps/web: wrap export/share/OCR actions with plan gate (free vs paid)
- Pricing buttons: wire ‘Buy’ to call stripe-checkout function and redirect to session.url
NON_GOALS:
- Complex proration, metered billing
ACCEPTANCE CRITERIA:
- Checkout success writes subscription state; gating hides paid features for free users
- Webhook verifies signature (STRIPE_WEBHOOK_SECRET); idempotent handlers
DELIVERABLES:
- New functions stripe-checkout, stripe-webhook; DB migration; gating util; wiring in PricingSection
CONSTRAINTS:
- Secrets via env; never log PII or full webhook payloads; small diffs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/billing-stripe-mvp
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Staging flow: free → checkout → paid → refresh shows entitlements
```
