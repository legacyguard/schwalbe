# Landing Page Contracts (Global Header and Country Menu)

This document defines component contracts for the landing page header.

## HeaderActions Contract

```ts
export interface HeaderActionsProps {
  onUserClick: () => void
  onCountryClick: () => void
  onSearchClick: () => void
  onSupportClick: () => void
  onBuyClick: () => void
}
```

- Layout: Right-aligned actions bar with five icons (User, Country, Search, Support, Buy)
- Accessibility: each icon must be a button with aria-label
- Keyboard: Tab navigation, Enter/Space activation
- Mobile: collapses into an overflow menu with the same actions

## CountryMenu Contract

```ts
import type { CountryDomain } from '../../../../packages/shared/src/config/domains'

export interface CountryMenuProps {
  isOpen: boolean
  onClose: () => void
  countries: CountryDomain[] // from getEnabledDomains()
  onSelect: (code: string) => void // ISO code
  environment: {
    isProduction: boolean
  }
}
```

Behavior:
- If environment.isProduction = true → onSelect performs real redirect to https://{host}
- If false → show Czech-language simulation message (toast/modal) with the URL and do not navigate; close menu after
- Disabled countries can be shown but non-interactive with "Coming soon" label

## SearchOverlay Contract (stub)

```ts
export interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}
```

- Opens a full-width overlay with an input
- Calls /api/search?query="..." for article/blog results (title, excerpt, url)

## SupportPanel Contract (stub)

```ts
export interface SupportPanelProps {
  isOpen: boolean
  onClose: () => void
}
```

- Shows support email, contact form link, FAQ link

## Buy Navigation
- Header action routes to /pricing
- /pricing shows a catalog of ~10 product categories

## Notes
- Authentication uses Supabase Auth (no Clerk)
- All text outside i18n files is English; simulation toast text is in Czech per LegacyGuard rule
