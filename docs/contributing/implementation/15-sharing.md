# Phase 15 – Sharing (Secure Links, Passwords, Viewer, Audit)

Purpose
Enable secure time-limited sharing of content with optional passwords and audit trails.

Inputs
- SPEC LINKS: sharing spec
- EXPIRY & ACCESS: defaults for link lifetime and access controls

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Sharing core (links, passwords, viewer, audit)
CONTEXT: Users share content via expiring links; viewer is branded and print-friendly.
SCOPE:
- Share link generation/validation
- Password protection; expiration; audit logs
- Shared viewer UI; PDF export for summaries
NON_GOALS:
- Public indexing
ACCEPTANCE CRITERIA:
- Valid links open viewer; expired/invalid blocked; audits recorded
DELIVERABLES:
- APIs/UI; PDF export; docs
CONSTRAINTS:
- Privacy rules; UI English; i18n for viewer
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/sharing-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Security review; lifecycle tests
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Sharing core (links, passwords, viewer, audit)
CONTEXT:
- Specs: specs/017-sharing-reminders-analytics/spec.md, contracts/README.md
SCOPE:
- Share link generation/validation API under packages/shared/src/services/sharing/
- Password protection; expiration; audit logs (DB)
- Shared viewer UI under apps/web/src/features/sharing/viewer/
- PDF export for summaries
NON_GOALS:
- Public indexing
ACCEPTANCE CRITERIA:
- Valid links; expired/invalid blocked; audits recorded
DELIVERABLES:
- APIs/UI; PDF export; docs
CONSTRAINTS:
- Privacy rules; UI English; i18n for viewer
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/sharing-core
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Security review; lifecycle tests
```
