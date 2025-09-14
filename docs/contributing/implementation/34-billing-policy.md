# Phase 34 – Refund/Cancel/Trial Policy + UI Messaging

Purpose
Define and implement clear policies for refunds, cancellations, (optional) trial/grace periods, and consistent UI/email messaging.

Inputs
- POLICY: refund window, cancellation effect (immediate vs end-of-period), trial length, grace period days
- UI COPY: EN/CZ/SK messages for cancel/upgrade/downgrade screens and emails

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Refund/Cancel/Trial policy + UI messaging (EN/CZ/SK)
CONTEXT:
- PricingSection and Account/Billing UI; email function via Resend
- Terms/Privacy updated in Phase 28
SCOPE:
- Implement cancellation flow in app (confirm modal → update Stripe subscription → reflect locally); choose policy (immediate/end-of-period)
- Add optional trial/grace toggles in config; display informational banners accordingly
- Email templates: cancellation confirmation, trial ending (if trial used)
- Update Terms/Privacy snippets to reflect policy
NON_GOALS:
- Complex proration beyond Stripe defaults
ACCEPTANCE CRITERIA:
- Cancellation behavior matches policy; messaging consistent across UI and emails; legal pages updated
DELIVERABLES:
- Billing UI updates, email templates, legal text updates
CONSTRAINTS:
- UI English baseline; localize into CZ/SK; no secrets logging
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/billing-policy-ui
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Staging tests for cancel/upgrade/downgrade; trial/grace messaging verified
```
