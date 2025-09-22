# Schwalbe i18n Matrix (Source of Truth)

This file is the canonical reference for languages and per-country rules used across specs.

- MVP languages: EN, CS, SK, DE, UK
- Production target: 34 languages (see rows below)
- Country rules:
  - Replace Russian with Ukrainian where specified by business rules
  - Remove Ukrainian from Iceland and Liechtenstein
  - Ensure a minimum of 4 languages per country; if fewer are available, add the closest language from the 34-language set

If you maintain a more detailed matrix elsewhere, keep it, but treat this path as the normalized reference for scripts and docs: docs/i18n/matrix.md.

Source of truth: docs/i18n/LANGUAGE MATRIX PER DOMAIN (39 COUNTRIES, 34 LANGUAGES).md

For runtime mapping, see packages/shared/src/config/languages.ts (DOMAIN_LANGUAGES) which is derived from this matrix and enforces per-domain 4–5 languages.

Future work: add a generation script to sync DOMAIN_LANGUAGES from this document.
