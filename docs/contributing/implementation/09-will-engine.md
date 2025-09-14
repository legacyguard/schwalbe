# Phase 09 – Will Generation Engine (Country Frameworks, Dynamic Clauses)

Purpose
Implement the core engine capable of assembling jurisdiction-compliant wills with dynamic clause insertion.

Inputs
- SPEC LINKS: legal frameworks, witness/signature rules
- JURISDICTIONS: initial countries (CZ, SK)

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Will generation engine
CONTEXT: Engine must use country-specific rules and insert clauses dynamically while validating compliance.
SCOPE:
- Define schema for legal requirements per country
- Build clause library and insertion rules
- Implement compliance validator
NON_GOALS:
- Full UI editor polishing
ACCEPTANCE CRITERIA:
- Valid drafts generated for CZ and SK per rules
DELIVERABLES:
- engine modules, templates, tests, docs
CONSTRAINTS:
- i18n 34; legal terms per language-country; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-engine
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for rule validation
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Will generation engine (CZ/SK)
CONTEXT:
- Specs: specs/024-will-generation-engine/spec.md, data-model.md, quickstart.md, tasks.md
SCOPE:
- Create engine structure under packages/logic/src/will/
  - engine.ts, rules/cz.ts, rules/sk.ts, templates/
- Encode witness/signature and jurisdiction rules for CZ/SK
- Implement validation pass for compliance
NON_GOALS:
- Full editor UI
ACCEPTANCE CRITERIA:
- Valid drafts for CZ/SK with passing unit tests
DELIVERABLES:
- engine modules, sample templates, tests, docs
CONSTRAINTS:
- i18n 34; legal terms by language-country; UI English
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/will-engine
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Unit tests for compliance rules
```
