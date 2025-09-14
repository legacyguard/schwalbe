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
  1) Update packages/shared/src/config/domains.ts (host, country code, enabled, languages)
     - Note: languages[] mapping is not yet present in CountryDomain; track per docs for now; see docs/tickets/T-002-country-domain-languages-prop.md
  2) Add/verify i18n resources for new languages
  3) Validate currency and legal requirements where applicable
  4) QA domain redirects (prod) vs simulation (staging/local)

Rules and constraints
- All UI strings outside i18n must be English
- Follow language replacement/removal rules where specified by project
- Each country must expose at least 4 languages; prefer regional relevance

QA checklist
- Language menu shows 5 languages for CZ and SK
- Redirect simulation message is in Czech only (staging/local)
- Production domains perform real redirects
- No Russian in Germany; no Ukrainian in Iceland/Liechtenstein (per rules)
