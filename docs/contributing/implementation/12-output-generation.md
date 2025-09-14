# Phase 12 – Output Generation (PDF, Handwriting, Notarization Checklists)

Purpose
Generate legally formatted outputs from will data for supported jurisdictions.

Inputs
- SPEC LINKS: output formats and jurisdiction rules
- TARGETS: CZ, SK for initial validation

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Output generation (PDF, handwriting template, notarization checklist)
CONTEXT: Produce multiple output formats with jurisdiction-specific formatting.
SCOPE:
- PDF generator with locale-aware formatting
- Handwriting template (lines, fields)
- Notarization checklist per country
NON_GOALS:
- E-signature integration
ACCEPTANCE CRITERIA:
- CZ/SK outputs render correctly
DELIVERABLES:
- output modules/templates, docs
CONSTRAINTS:
- i18n 34; print styles a11y; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/output-generation
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Visual inspection; sample PDFs in repo (if appropriate)
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Output generation (PDF, handwriting, notarization)
CONTEXT:
- Will engine outputs: specs/024-will-generation-engine/quickstart.md
SCOPE:
- Create output modules under packages/logic/src/output/
  - pdf.ts, handwriting.ts, notarization-checklist.ts
- Jurisdiction formatting for CZ/SK
NON_GOALS:
- E-signature
ACCEPTANCE CRITERIA:
- CZ/SK outputs render correctly
DELIVERABLES:
- output modules, sample templates, docs
CONSTRAINTS:
- i18n 34; print a11y; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/output-generation
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Visual PDFs check; print CSS validated
```
