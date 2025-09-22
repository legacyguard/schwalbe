# Phase 4 – Pricing Psychology & Conversion Funnels Migration Plan

Goals
- Port Hollywood pricing experiments/components and align with B2B2C flows.
- Instrument conversion events via Supabase/Edge Functions logging (no Sentry).

Plan
1) Pricing components
   - Pages: consumer pricing, professional plans, partner pricing (lite).
   - Experiments: anchor pricing, decoys, urgency badges (feature-flagged).
2) Event taxonomy
   - Define consistent event names (pricing_viewed, plan_selected, checkout_initiated, conversion_success, churn_intent).
   - Store in Supabase via Edge Functions (structured payloads, user and session context).
3) Funnel progression
   - Awareness → pricing → trial/plan → activation → retention.
   - Add simple cohort stamps (first_seen_at, referrer, campaign).
4) Rollout
   - Start with UI-only demo and mocked tracking.
   - Gate experiments behind feature flags.

Risks
- Overfitting on early cohorts; keep experiments minimal and additive.
- i18n differences for price presentation (resolve later with currency config).

