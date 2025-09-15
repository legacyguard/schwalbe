# Phase 14 – Asset Tracking (Models, Dashboard, Templates)

Purpose
Implement asset tracking including categories, optional fields, documents/beneficiaries links, and dashboards.

Inputs
- SPEC LINKS: asset tracking spec
- CATEGORIES: property, vehicle, financial, business, personal

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Asset tracking core
CONTEXT: Provide CRUD, dashboard summaries, templates by category, and conflict detection/reporting.
SCOPE:
- Data model and migrations
- CRUD UI with filters and charts
- Templates by category; conflict detection/report
NON_GOALS:
- External financial APIs
ACCEPTANCE CRITERIA:
- Users can create/edit assets; dashboard shows summaries and simple charts
DELIVERABLES:
- models/migrations, UI screens, docs
CONSTRAINTS:
- i18n 34; UI English; a11y
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI tests for CRUD and summaries
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Asset tracking core
CONTEXT:
- Spec refs: specs/030-core-features/data-model.md; specs/030-core-features/plan.md
SCOPE:
- Data model + migrations for assets
- CRUD UI with filters/charts under apps/web/src/features/assets/
- Templates by category; conflict detection/report
NON_GOALS:
- External financial APIs
ACCEPTANCE CRITERIA:
- Create/edit assets; dashboard summaries
DELIVERABLES:
- models/migrations, UI, docs
CONSTRAINTS:
- i18n 34; UI English; a11y
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit/UI CRUD tests
```
