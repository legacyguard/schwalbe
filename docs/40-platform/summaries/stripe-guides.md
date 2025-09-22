# Stripe Guides (Summary for Schwalbe)

Purpose
- Provide a compact reference for testing subscriptions and payments reliably in non-production.

Core references
- Test mode dashboard and local pricing page; webhook endpoint with Supabase functions. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/STRIPE_TESTING_GUIDE.md:17-21
- Test cards: success, 3D Secure variants, decline reasons (insufficient funds, lost/stolen, expired, CVC/ZIP, high risk). Evidence: STRIPE_TESTING_GUIDE.md:46-75; STRIPE_TEST_CARDS_QUICK_REFERENCE.md:5-27,55-73,75-79

Scenarios to cover
- New subscription: select plan → checkout → success, DB subscription record, webhook processed. Evidence: STRIPE_TESTING_GUIDE.md:108-134
- Plan upgrades/downgrades with proration. Evidence: STRIPE_TESTING_GUIDE.md:136-149
- Renewals: success vs failures and retry. Evidence: STRIPE_TESTING_GUIDE.md:98-105
- 3D Secure flows and failures. Evidence: STRIPE_TESTING_GUIDE.md:55-62
- Cancellations via Customer Portal; status changes and plan fallback. Evidence: STRIPE_TESTING_GUIDE.md:170-183

Webhook testing
- Stripe CLI forwarding, trigger events; dashboard manual tests; key events to assert: checkout.session.completed, subscription.updated/deleted, invoice.*. Evidence: STRIPE_TESTING_GUIDE.md:187-221,223-235

Debugging and tools
- Common errors and fixes (No such price, webhook signature, subscription not updating); scripts and logs to use. Evidence: STRIPE_TESTING_GUIDE.md:243-272,274-284,285-296

Checklist per release
- Test all plan flows, 3DS, declines, webhooks, limits, customer portal, renewals. Evidence: STRIPE_TESTING_GUIDE.md:316-329

Schwalbe adaptations
- Use Supabase Edge Functions logs for webhook handling visibility and DB auditing; email alerts via Resend for critical payment failures (no Sentry) per project rules.

