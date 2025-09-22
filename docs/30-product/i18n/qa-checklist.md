# Per-country QA Checklist (39 domains)

For each domain, verify:

1) Domain entry exists in packages/shared/src/config/domains.ts with:
   - Correct ISO alpha-2 code
   - Correct host (legacyguard.xx)
   - Correct English name
   - Correct currency (ISO-4217)
   - enabled flag (true only for CZ, SK in MVP)

2) Language menu in packages/shared/src/config/languages.ts DOMAIN_LANGUAGES has ≥4 languages and follows rules:
   - Germany (DE): no Russian
   - Iceland (IS), Liechtenstein (LI): no Ukrainian
   - Baltics (EE, LV, LT): include Russian
   - Each country has regionally appropriate 4–5 languages as per docs matrix
   - Enforced by automated tests: packages/shared/src/config/__tests__/languageRules.test.ts

3) Language stubs exist (apps/web/public/locales) for any newly referenced languages:
   - ui/landing-page.<lang>.json
   - landing/pricing.<lang>.json (optional for MVP)
   - landing/security-promise.<lang>.json (optional for MVP)
   Content may be English placeholders.

4) Legal requirements dataset includes the country (packages/shared/src/config/legal/requirements.ts).

5) Docs reflect updates:
   - docs/i18n/TARGET MARKETS (hosts and country entries)
   - docs/i18n/domains-and-languages.md (flow and references)

6) Smoke tests:
   - getAllowedLanguagesForHost(host) returns expected list
   - computePreferredLocale respects allowed list and fallback hierarchy
   - Non-production redirect simulation still works (no change in this task)
