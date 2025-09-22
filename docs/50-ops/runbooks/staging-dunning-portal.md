# Staging Checklist: Dunning + Billing Portal (Stripe)

Purpose
- Verify failed-payment dunning and recovery email flows, in-app banner, and Billing Portal access on staging with Stripe Test mode.

Environment
- Required env vars (staging):
  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (from the staging endpoint in Stripe Dashboard)
  - RESEND_API_KEY
  - SITE_URL (e.g., https://app.legacyguard.app)

Database
- Apply migrations:
  - `supabase db push`
- Ensure user_subscriptions has a Stripe mapping:
  - Set `user_subscriptions.stripe_customer_id = 'cus_...'` (test customer) for your staging test user.

Deploy Edge Functions
- `supabase functions deploy send-email`
- `supabase functions deploy stripe-webhook`
- `supabase functions deploy create-billing-portal-session`

Stripe Webhook (Test Mode)
- Stripe Dashboard → Developers → Webhooks → Add endpoint:
  - URL: `https://<project-ref>.functions.supabase.co/stripe-webhook`
  - Events: `invoice.payment_failed`, `invoice.payment_succeeded`
  - Copy the endpoint secret into `STRIPE_WEBHOOK_SECRET`.

Test Scenarios
1) Payment failure → dunning
   - Change the customer’s default payment method to a failing test card (or create a new invoice that fails).
   - Expect:
     - Email: “Payment Failed” to the user’s email.
     - In-app banner: “Payment issue” with link to /account/billing.
     - DB: `user_subscriptions.status = 'past_due'`.
   - Idempotency: re-deliveries should not send duplicate emails.

2) Recovery → clear
   - Update the payment method to a valid test card and complete a successful payment (or let Stripe retry).
   - Expect:
     - Email: “Payment Confirmed”.
     - In-app banner cleared.
     - DB: `user_subscriptions.status = 'active'`.

3) Billing Portal
   - Visit `/account/billing` and click “Open Billing Portal”.
   - Expect redirect to Stripe’s portal for the authenticated user.
   - Update payment method and confirm changes reflect on the next invoice/webhook.

Troubleshooting
- No email: Confirm RESEND_API_KEY and supabase function logs for send-email.
- Webhook not firing: Check Stripe delivery logs, `STRIPE_WEBHOOK_SECRET`, and function logs.
- Mapping missing: Ensure `stripe_customer_id` is set for the user in `user_subscriptions`.
- Duplicate effects: Check `public.processed_webhooks` for dedupe; ensure event IDs are unique.

Notes
- Signature verification is enabled. Use the endpoint secret from Stripe Dashboard.
- Do NOT include secrets in logs or printed output.
