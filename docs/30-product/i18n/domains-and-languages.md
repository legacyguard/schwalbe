# Domains and Languages Plan

MVP (2 countries, 5 languages each)
- Countries: Czech Republic (CZ), Slovak Republic (SK)
- Languages per country: Czech (cs), Slovak (sk), English (en), German (de), Ukrainian (uk)
- Domains: legacyguard.cz, legacyguard.sk
- Behavior: VITE_IS_PRODUCTION=true → real redirect; false → Czech simulation banner with target URL

Production (target)
- 39 countries, 34 languages
- Source of truth:
  - docs/i18n/TARGET MARKETS (39 countries with dedicated domains).md
  - docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md
- Additions flow:
  1) Update packages/shared/src/config/domains.ts (host, country code, currency, enabled)
  2) Update packages/shared/src/config/languages.ts DOMAIN_LANGUAGES mapping per domain
  3) Add/verify i18n resources for new languages (stubs acceptable; UI remains English)
  4) Validate currency and legal requirements where applicable (see packages/shared/src/config/legal/requirements.ts)
  5) QA domain redirects (prod) vs simulation (staging/local)

Rules and constraints
- All UI strings outside i18n must be English
- Follow language replacement/removal rules where specified by project
- Each country must expose at least 4 languages; prefer regional relevance
- Enforced rules: Germany (DE) has no Russian (ru); Iceland (IS) and Liechtenstein (LI) have no Ukrainian (uk); Baltics (EE, LV, LT) include Russian (ru)

Automation
- Tests enforce rules and minimum language counts: packages/shared/src/config/__tests__/languageRules.test.ts

QA checklist
- Language menu shows 5 languages for CZ and SK
- Redirect simulation message is in Czech only (staging/local)
- Production domains perform real redirects
- No Russian in Germany; no Ukrainian in Iceland/Liechtenstein (per rules)
- Baltics include Russian (ru)
