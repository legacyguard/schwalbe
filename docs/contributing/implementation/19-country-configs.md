# Phase 19 – Country Configurations (Domains, Currencies, Legal Data)

Purpose
Add or update countries with correct domain, currency, and legal requirement entries.

Inputs
- SPEC LINKS: target markets, language matrix, legal requirements DB
- COUNTRIES: list to add/update

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Country configuration updates
CONTEXT: Align domains, currencies, languages, and legal data per specs.
SCOPE:
- Add/update domain entries and currencies
- Ensure language resources present (≥4 languages per country)
- Update legal requirements dataset
NON_GOALS:
- Full translations
ACCEPTANCE CRITERIA:
- Countries configured correctly; language menus accurate
DELIVERABLES:
- config diffs; language stubs; legal dataset updates; docs
CONSTRAINTS:
- i18n 34; UI English; per-country language rules
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- QA per-country checklist
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Country configuration updates
CONTEXT:
- Targets: docs/i18n/TARGET MARKETS (39 countries with dedicated domains).md
- Language matrix: docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md
- Domains config: packages/shared/src/config/domains.ts
SCOPE:
- Add/update domain entries and currencies in domains.ts
- Ensure language resources present (≥4 per country) per matrix
- Update legal requirements dataset per specs
NON_GOALS:
- Full translations
ACCEPTANCE CRITERIA:
- Countries configured correctly; language menus accurate
DELIVERABLES:
- config diffs; language stubs; legal dataset updates; docs
CONSTRAINTS:
- i18n 34; UI English; per-country language rules
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- QA per-country checklist
```
