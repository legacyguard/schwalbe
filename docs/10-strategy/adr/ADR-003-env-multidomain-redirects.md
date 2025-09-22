# ADR-003: Env-Driven Multi-Domain Redirects

Status: Accepted

Context
- LegacyGuard uses country-specific domains; we need safe staging behavior

Decision
- Use VITE_IS_PRODUCTION to control behavior
  - true: real redirects to target country domains
  - false: no redirect; show Czech-language simulation with the target URL
- Preserve original switch/case redirect logic by country

Consequences
- Staging/local can validate UX without leaving the site
- Production performs real navigation
- Documented in packages/shared/src/config/domains.ts + spec 033-landing-page
