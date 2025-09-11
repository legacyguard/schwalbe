# Domain Redirect Strategy (Schwalbe)

Behavior (environment-controlled)
- Production (VITE_IS_PRODUCTION=true): perform real redirects to predefined trusted country domains while preserving path and session.
- Development/Staging (VITE_IS_PRODUCTION=false): DO NOT redirect; instead, show a Czech simulation message and a modal/toast with target URL.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DOMAIN_REDIRECT_SETUP.md:14-22,72-100

Supported domains (reference)
- Country to domain mappings exist for EU and adjacent countries.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DOMAIN_REDIRECT_SETUP.md:24-70

Usage Pattern (service-based)
- Centralize logic in a domainRedirectService with helpers to compute target domains, check current domain, and perform redirect/simulations.
Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/DOMAIN_REDIRECT_SETUP.md:104-122

Schwalbe rules
- Preserve the original switch/case mapping but wrap in environment condition as above; UI text English except the simulation message.
- Ensure integration with i18n and country/language modal.

