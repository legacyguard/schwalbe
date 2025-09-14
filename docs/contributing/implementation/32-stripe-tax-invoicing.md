# Phase 32 – Stripe Tax, Invoicing & Billing Localization (CZ/SK)

Purpose
Add tax handling (Stripe Tax), invoice details, VAT/DIČ capture, localized invoice footers, and correct currency/price formatting for CZ/EU.

Inputs
- TAX: Enable Stripe Tax (or explicit tax rates), set tax behavior for products
- FIELDS: Company name, billing address, VAT/DIČ, country, email
- LOCALES: EN/CZ/SK for invoice footers and billing UI

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Stripe Tax + invoicing details + billing localization (CZ/SK)
CONTEXT:
- Pricing UI: apps/web/src/components/landing/PricingSection.tsx (and .js)
- Checkout/Webhooks (Phase 27): supabase/functions/stripe-checkout/index.ts, supabase/functions/stripe-webhook/index.ts
- Subscription service: packages/shared/src/services/subscription.service.ts
SCOPE:
- Enable Stripe Tax (automatic_tax: true) in stripe-checkout; attach billing_address_collection and collect_tax_id when relevant
- Create/extend DB migration supabase/migrations/<ts>_billing_details.sql:
  - profiles: company_name TEXT, vat_id TEXT, billing_address JSONB
- Add Billing Details UI: apps/web/src/features/account/BillingDetails.tsx (EN/CZ/SK labels), write through to Stripe Customer + local DB
- Localize invoice footer text (EN/CZ/SK) and add company info; link Terms/Privacy
- Currency formatting: CZK/EUR display helpers (thousand separator, symbol, decimal places) in a shared util
NON_GOALS:
- Complex multi-country tax logic beyond CZ/SK MVP
ACCEPTANCE CRITERIA:
- Invoices show tax as expected; VAT/DIČ captured; invoice footer localized; billing details persisted both in Stripe and DB
DELIVERABLES:
- checkout updates, webhook enrichment, billing details migration, BillingDetails UI, currency util
CONSTRAINTS:
- Secrets via env; never log PII; small diffs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/billing-tax-czsk
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Test: CZ customer with VAT → invoice with correct tax/footers; data stored in Stripe + DB
```
