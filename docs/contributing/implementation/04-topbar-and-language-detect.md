# Phase 04 – Multi-domain Top Bar & Language Auto-detect

Purpose
Implement the top bar with required icons and language auto-detect with fallback.

Inputs
- SPEC LINKS: multi-domain/service bar spec, domains config
- INITIAL DOMAINS: CZ, SK

Kickoff prompt
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Multi-domain top bar with icons + language auto-detect
CONTEXT: Top bar mirrors nvidia.com style; initial clickable domains CZ/SK.
SCOPE:
- Header layout with icons (user/Clerk, country, search, support, buy)
- Country menu: list EU; CZ/SK active with redirect links
- Expandable search UI (stub) in header
- Support/buy routes
- Language auto-detect and fallback to EN
NON_GOALS:
- Full search backend
ACCEPTANCE CRITERIA:
- Header responsive; domain links functional; language auto-detect verified
DELIVERABLES:
- Header components; routes; docs snippet
CONSTRAINTS:
- UI English; i18n 34; respect redirect gating
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/topbar-multidomain
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- a11y check; build pass; docs updated
```

---

Ready-to-paste kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Multi-domain top bar with icons + language auto-detect
CONTEXT:
- Domain config: packages/shared/src/config/domains.ts
- Redirect guard: apps/web/src/lib/utils/redirect-guard.ts
- Vite alias: apps/web/vite.config.js (alias '@' → './src')
SCOPE:
- Create header components:
  - apps/web/src/components/layout/TopBar.tsx
  - apps/web/src/components/layout/CountryMenu.tsx
  - apps/web/src/components/layout/SearchBox.tsx (stub)
  - apps/web/src/components/layout/UserIcon.tsx (stub)
- Country menu lists EU, CZ/SK clickable → open computed domain URL
- Auto-detect language (navigator.language) and fallback to EN
- Wire language switcher to DOMAIN_LANGUAGES map (Phase 03)
NON_GOALS:
- Full search backend
ACCEPTANCE CRITERIA:
- Responsive header; CZ/SK links open correct legacyguard.* domains (no redirect in non-prod)
DELIVERABLES:
- New components under apps/web/src/components/layout/
- Small docs snippet
CONSTRAINTS:
- UI English; respect redirect gating policy
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: feature/topbar-multidomain
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- a11y pass for header; manual domain menu test
```
