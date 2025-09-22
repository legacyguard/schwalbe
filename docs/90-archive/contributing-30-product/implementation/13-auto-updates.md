# Phase 13 – Automatic Will Updates (Sync, Logic, Versioning, Notifications)

Purpose
Detect relevant changes and propose/apply will updates with version history and notifications.

Inputs
- SPEC LINKS: auto-update spec
- CHANGE SOURCES: assets, beneficiaries, guardians

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Automatic will updates
CONTEXT: Monitor change sources and update wills with user approval and version control.
SCOPE:
- Change detection engine
- Smart update logic and approval flow
- Versioning (history, diff, rollback, export)
- Notifications with snooze/undo
NON_GOALS:
- Predictive ML
ACCEPTANCE CRITERIA:
- Accurate proposals; user can approve/reject; rollback works
DELIVERABLES:
- engine code, version store, notification wiring, docs
CONSTRAINTS:
- Privacy-aware logs; UI English; i18n where visible
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/auto-will-updates
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/E2E tests for detection and rollback
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Automatic will updates
CONTEXT:
- Sync service ref: packages/shared/src/services/sync.service.ts
SCOPE:
- Change detection engine for assets/beneficiaries/guardians
- Smart update rules + approval flow
- Versioning (history, diff, rollback, export)
- Notifications (email via Resend)
NON_GOALS:
- ML predictions
ACCEPTANCE CRITERIA:
- Accurate proposals; approve/undo; versions preserved
DELIVERABLES:
- engine code, version store, notifications, docs
CONSTRAINTS:
- Privacy-aware logging; UI English; i18n where visible
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/auto-will-updates
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/E2E for detection/rollback
```
