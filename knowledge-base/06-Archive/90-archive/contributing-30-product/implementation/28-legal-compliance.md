# Phase 28 – Legal/Compliance Pages + Consent Tracking + Cookie Banner

Purpose
Provide legally required pages (Terms, Privacy, Cookies, Imprint) in EN/CZ/SK, add consent tracking, and a cookie banner.

Inputs
- LOCALES: EN, CS, SK
- PAGES: Terms, Privacy, Cookies, Imprint (generate minimal compliant MVP content)

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Legal/compliance pages + consent tracking + cookie banner (EN/CZ/SK)
CONTEXT:
- Legal pages will be added under apps/web/src/pages/legal/{terms|privacy|cookies|imprint}.{en|cs|sk}.tsx
- Footer/links: header/footer components to expose these routes
- Consent storage in DB (user_consents table) and local cookie for banner state
SCOPE:
- Generate EN/CZ/SK content for Terms, Privacy, Cookies, Imprint and add routes
- Add cookie banner component (with minimal categories and a single consent toggle for MVP)
- Create migration supabase/migrations/<ts>_create_user_consents.sql
  - user_consents(user_id UUID, terms_version TEXT, privacy_version TEXT, cookies_version TEXT, consented_at TIMESTAMPTZ)
- Store acceptance on first login (if missing) and on banner accept
- Add footer links to legal pages
NON_GOALS:
- Granulárne cookie kategórie a CMP
ACCEPTANCE CRITERIA:
- Pages render in EN/CZ/SK; banner shows once per device until accepted; consent persisted
DELIVERABLES:
- 4×3 legal pages, cookie banner, DB migration, footer links
CONSTRAINTS:
- UI strings in English by default; switchable via i18n; no tracking before consent
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: medium
CHECKS BEFORE DONE:
- Manual check of all pages in EN/CZ/SK; consent row created on accept
```
