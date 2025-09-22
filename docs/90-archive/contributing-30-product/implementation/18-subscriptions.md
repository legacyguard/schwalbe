# Phase 18 – Subscriptions Tracking (Metadata, Dashboard, Notifications)

Purpose
Track subscriptions in document metadata, surface in dashboards, and notify before expiration.

Inputs
- SPEC LINKS: subscriptions spec
- FIELDS: subscription-specific metadata fields

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Subscriptions tracking
CONTEXT: Add metadata fields, dashboards, and notifications; integrate with reminders.
SCOPE:
- Add metadata fields + migration
- Build dashboards (cost and renewal views)
- Configure notification rules and email templates
- Integrate with existing reminders
NON_GOALS:
- Billing provider APIs
ACCEPTANCE CRITERIA:
- Subscriptions appear in dashboards; reminders sent before expiry
DELIVERABLES:
- models/UI, templates, docs
CONSTRAINTS:
- UI English; Resend for email; privacy aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests; email template QA
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Subscriptions tracking
CONTEXT:
- Migrations: supabase/migrations/20240101000000_create_subscription_tables.sql
- Service: packages/shared/src/services/subscription.service.ts
SCOPE:
- Add/verify metadata fields + migration updates if needed
- Build dashboards (cost and renewal views) in apps/web/src/features/subscriptions/
- Configure notification rules and email templates (Resend)
- Integrate with reminders
NON_GOALS:
- Billing provider APIs
ACCEPTANCE CRITERIA:
- Subscriptions surfaced; reminders sent pre-expiry
DELIVERABLES:
- models/UI, templates, docs
CONSTRAINTS:
- UI English; privacy-aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests; email template QA
```
