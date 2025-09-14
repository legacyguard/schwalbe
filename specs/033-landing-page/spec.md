# Landing Page - Global Header and Multi-domain UX

- New landing experience for LegacyGuard marketing site (apps/web-next)
- Global header modeled after nvidia.com right-aligned icon bar
- Supabase-first authentication; production-ready country switcher; search overlay; support and pricing entry points
- Prepared for multi-domain rollout per country; MVP supports CZ and SK

See also: ../034-prep-operational-foundations/spec.md for MVP operational foundations (env, RLS, observability, ADRs, CI, i18n, release)

## Goals

- Implement a responsive global header on landing pages with these right-aligned icons (desktop) and equivalents in a mobile overflow menu:
  1) User (authentication)
  2) Country (domain selector)
  3) Search (articles/blog)
  4) Support (contact)
  5) Buy (pricing catalog)
- Ensure behavior degrades gracefully on mobile
- Respect environment toggles for country redirect behavior (see production/staging behavior below)
- Maintain English-only UI text outside i18n files

## Non-Goals

- Full blog/CMS implementation (only search UI scaffold and API contract)
- Full pricing purchase flow (CTA surface with link to pricing pages)

## Acceptance Criteria

- [ ] Header renders on landing pages and is responsive (desktop + mobile)
- [ ] Icons and interactions implemented as described below
- [ ] Country switcher drives host-based domain selection with MVP domain allowlist: legacyguard.cz, legacyguard.sk
- [ ] In non-production environments, clicking a country shows a Czech modal simulating redirect URL (per LegacyGuard env rule); in production it performs a real redirect
- [ ] Authentication uses Supabase Auth (no Clerk)
- [ ] Search opens an overlay to query articles/blog posts (stub contract, no full CMS dependency)
- [ ] Support opens a contact panel with canonical support channels
- [ ] Buy opens pricing catalog with ~10 product categories (static scaffold acceptable for MVP)

## Information Architecture

- Global: Header is present on pages using the public marketing layout (landing, pricing, blog index, support)
- Authenticated state: When the user is logged in, the User icon opens a user menu with Profile and Sign out; when not logged in, it opens a Sign in modal or navigates to /sign-in

## Interactions

1) User
- Click → If unauthenticated, open Supabase Auth sign-in (modal) or navigate to /sign-in
- If authenticated → open menu with: Profile, My Documents, Sign out

2) Country (domain selector)
- Click → opens panel with description: "LegacyGuard is provided for individual European countries. Choose your country to continue."
- Shows list of supported countries. MVP: Czech Republic (legacyguard.cz) and Slovakia (legacyguard.sk). Non-MVP (placeholder): All other EU countries are shown as disabled (coming soon).
- Behavior by environment (see Production vs Staging):
  - Production (VITE_IS_PRODUCTION = true) → clicking a country performs window.location replace to the domain (https scheme)
  - Staging/Local (VITE_IS_PRODUCTION = false) → show a Czech-language modal/toast simulating the final redirect URL for each country (no navigation). Text in Czech per rule; other UI text remains English.

3) Search
- Click → overlays a full-width search input (cmd+k capable) with results section
- Scope: articles/blog endpoints (stub route(s) under /api/search?query=)
- Results list items link to article/blog detail pages under /blog/[slug]

4) Support
- Click → opens a side panel or navigates to /support with contact info: support email, contact form link, and FAQ link

5) Buy
- Click → opens /pricing with a catalog grid of product categories (approx. 10): Last Will, Insurance Agreement, Sales Contract, etc.

## Components

- HeaderShell: layout wrapper placing the logo on the left and actions on the right
- HeaderActions: right-aligned bar with icons (User, Country, Search, Support, Buy)
- CountryMenu: popover/panel with country list; uses environment-aware redirect simulation logic
- SearchOverlay: command palette style overlay; integrates with /api/search (returns title, excerpt, url)
- SupportPanel: contact details, support email, link to contact form
- BuyMenu or direct link: simple approach routes to /pricing

## Environment & Domains

- MVP domains: legacyguard.cz, legacyguard.sk
- Future-ready: list can be expanded (legacyguard.de, legacyguard.fr, legacyguard.it, legacyguard.es, etc.) via configuration
- Environment flag: VITE_IS_PRODUCTION controls whether the CountryMenu performs a real redirect (production) or shows Czech simulation (staging/local)

Suggested configuration shape (packages/shared/src/config/domains.ts):

```ts
export type CountryDomain = {
  code: string // ISO2
  host: string // e.g., 'legacyguard.cz'
  name: string // i18n key or English name
  enabled: boolean // MVP: only CZ/SK enabled
}

export const COUNTRY_DOMAINS: CountryDomain[] = [
  { code: 'CZ', host: 'legacyguard.cz', name: 'Czech Republic', enabled: true },
  { code: 'SK', host: 'legacyguard.sk', name: 'Slovakia', enabled: true },
  // Future
  { code: 'DE', host: 'legacyguard.de', name: 'Germany', enabled: false },
  { code: 'FR', host: 'legacyguard.fr', name: 'France', enabled: false },
]

export function getEnabledDomains() {
  return COUNTRY_DOMAINS.filter((c) => c.enabled)
}
```

## Routing & Middleware

- Host-based country inference is allowed for future expansion; MVP uses static links from CountryMenu
- If host-based logic is introduced, detect country by request headers.host and map to country code; use this signal to pre-select language and country in the UI

## Accessibility

- All icons have accessible labels
- Popovers/overlays focus-trap and Escape to close
- Keyboard navigation supported (Tab, Shift+Tab, Arrow keys); Search overlay supports Cmd/Ctrl+K

## Analytics

- Track icon clicks and selections (user_clicked, country_selected, search_opened, support_opened, buy_opened)
- No PII in analytics; include correlation id in logs

## Notes

- Authentication is Supabase Auth (no Clerk). If historical materials mention Clerk, this spec supersedes it.
- Non-production Czech simulation message adheres to LegacyGuard rule; all other UI text remains in English.
