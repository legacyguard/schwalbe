# Phase 16 – Backup Reminders (Scheduling, Triggers, Channels, Analytics)

Purpose
Implement reminders with smart triggers and multi-channel delivery.

Inputs
- SPEC LINKS: reminders spec
- CHANNELS: in-app, email, dashboard

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Backup reminders
CONTEXT: Configurable scheduling, smart triggers, snooze/history, analytics.
SCOPE:
- Reminder scheduling + smart triggers
- Delivery channels and snooze/history UI
- Analytics counters (privacy-safe)
NON_GOALS:
- Mobile push (unless in scope)
ACCEPTANCE CRITERIA:
- Reminders fire per schedule; snooze works; history captured
DELIVERABLES:
- engine, UI, docs
CONSTRAINTS:
- UI English; email via Resend if used; privacy aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/reminders-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for schedules/triggers; QA checklist
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Backup reminders
CONTEXT:
- Specs: specs/033-landing-page/spec.md (for buy/support links), specs/017-sharing-reminders-analytics/spec.md
SCOPE:
- Reminder scheduling + smart triggers
- Delivery channels (in-app, email via Resend) and snooze/history UI
- Privacy-safe analytics counters
NON_GOALS:
- Mobile push
ACCEPTANCE CRITERIA:
- Reminders per schedule; snooze; history captured
DELIVERABLES:
- engine, UI, docs
CONSTRAINTS:
- UI English; email via Resend; privacy-aware
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/reminders-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for schedules/triggers
```
