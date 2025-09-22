# Phase 03 – i18n Baseline: 34 Languages (Matrix Enforcement)

Purpose
Enforce 34 total languages and per-domain language subsets per the matrix.

Inputs
- SPEC LINKS: LANGUAGE MATRIX PER DOMAIN, domains config path
- TARGET DOMAINS: which domains to validate in this phase

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: i18n baseline – enforce 34 languages and per-domain subsets
CONTEXT: Based on the language matrix and current domain config.
SCOPE:
- Ensure only allowed languages appear in switcher per domain
- Implement fallback hierarchy (user → device → domain default → EN)
- Document test checklist for 2–3 domains
NON_GOALS:
- Translating new content
ACCEPTANCE CRITERIA:
- Domain menus show only allowed languages; fallback works
DELIVERABLES:
- i18n config/code diffs; docs/tests
CONSTRAINTS:
- UI strings English; 34 total languages
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- i18n smoke tests pass; docs updated
```

---

Example integration snippet

```ts path=null start=null
// Header menu (Phase 04 will wire this into the actual top bar)
import { getAllowedLanguagesForHost } from '@schwalbe/shared'

const host = typeof window !== 'undefined' ? window.location.hostname : 'legacyguard.cz'
const languagesForMenu = getAllowedLanguagesForHost(host)
// Render languagesForMenu as the Language switcher options
```

Smoke test expectations

```ts path=null start=null
import { getAllowedLanguagesForHost, computePreferredLocale } from '@schwalbe/shared'

expect(getAllowedLanguagesForHost('legacyguard.cz')).toEqual(['cs','sk','en','de','uk'])
expect(getAllowedLanguagesForHost('legacyguard.sk')).toEqual(['sk','cs','en','de','uk'])

// Fallback chain (user → device → domain default → en)
expect(
  computePreferredLocale({ host: 'legacyguard.cz', userPreferred: 'uk-UA', deviceLocales: ['de-DE'] })
).toBe('uk')
```

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: i18n baseline – enforce 34 languages and domain subsets (CZ/SK first)
CONTEXT:
- Matrix: docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md
- Strategy: docs/i18n/strategy.md; docs/i18n/domains-and-languages.md
- Domain config: packages/shared/src/config/domains.ts
SCOPE:
- Implement domain language subsets for MVP domains CZ and SK:
  - CZ (legacyguard.cz): [CS, SK, EN, DE, UK]
  - SK (legacyguard.sk): [SK, CS, EN, DE, UK]
- Create languages mapping module:
  - packages/shared/src/config/languages.ts (export DOMAIN_LANGUAGES map)
- Ensure fallback hierarchy: user → device → domain default → EN
- Add smoke tests for language menu per domain
NON_GOALS:
- Full matrix for all countries (follow-up phases)
ACCEPTANCE CRITERIA:
- CZ/SK show only allowed languages; fallback verified
DELIVERABLES:
- packages/shared/src/config/languages.ts (new)
- i18n menu wiring in header (referenced in Phase 04)
- Test/docs snippet
CONSTRAINTS:
- UI strings in English; total languages = 34 (docs already updated)
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Manual switcher check for CZ/SK
```
