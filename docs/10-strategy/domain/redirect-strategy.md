# Domain Redirect Strategy (Schwalbe)

Behavior (environment-controlled)
- Production (VITE_IS_PRODUCTION=true): perform real redirects to predefined trusted country domains.
- Development/Staging (VITE_IS_PRODUCTION=false): DO NOT redirect; instead, show a Czech simulation message and a modal/toast listing the target URL per domain.

Note: MVP navigates to the domain root; path/session preservation can be added later if required.

Supported domains (reference)
- Country to domain mappings exist for EU and adjacent countries.

Usage Pattern (service-based)
- Centralize logic in a small guard that computes target domains, checks environment, and either redirects or returns simulation data for the UI.
- Implementation reference: apps/web/src/lib/utils/redirect-guard.ts and packages/shared/src/config/domains.ts

Schwalbe rules
- Preserve the original switch/case mapping but wrap in environment condition as above; UI text English except the simulation message.
- Ensure integration with i18n and country/language modal.

QA checklist
- Env toggling
  - VITE_IS_PRODUCTION=false: selecting any country opens a Czech simulation modal; no navigation occurs.
  - VITE_IS_PRODUCTION=true: selecting a country performs a real redirect to its domain.
- Domain list
  - Simulation lists one URL per enabled domain (MVP: CZ, SK). Links are not clickable for navigation.
- Language and UI
  - Modal title/buttons in English; simulation body text in Czech.
- Accessibility
  - Modal has role semantics via Dialog; Close button is keyboard accessible; focus is trapped by the Dialog component.
- Safety
  - No redirects when non-production; guard prevents loops in production by limiting rapid repeats.
- Manual verification
  - With VITE_IS_PRODUCTION=false: select CZ and SK from the Country menu and confirm the modal content shows both legacyguard.cz and legacyguard.sk with https URLs.
  - With VITE_IS_PRODUCTION=true: selecting CZ moves the browser to https://legacyguard.cz and SK to https://legacyguard.sk.

