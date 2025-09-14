# Tasks: 033-landing-page

## Build Checklist

### Header Actions Bar
- [ ] Implement HeaderShell and HeaderActions (desktop + mobile)
- [ ] Add icons: User, Country, Search, Support, Buy with aria-labels
- [ ] Keyboard navigation (Tab/Shift+Tab, Enter/Space)
- [ ] Analytics events on click

### Country Selector (Multi-domain)
- [ ] Create CountryMenu using packages/shared/src/config/domains.ts
- [ ] Render MVP countries: CZ (legacyguard.cz), SK (legacyguard.sk)
- [ ] Environment behavior:
  - [ ] Production → onSelect navigates to https://{host}
  - [ ] Staging/Local → show Czech-language simulation toast/modal with the target URL; do not navigate
- [ ] Disabled EU countries visible but non-interactive (coming soon)

### Search Overlay
- [ ] Implement SearchOverlay (Cmd/Ctrl+K) with input and results list
- [ ] Stub /api/search?query= endpoint returning title, excerpt, url

### Support Panel
- [ ] Implement SupportPanel with support email, contact form link, FAQ link

### Buy/Pricing
- [ ] Link Buy action to /pricing
- [ ] Create pricing catalog page with ~10 product categories (static scaffold)

### i18n & Accessibility
- [ ] All UI text outside i18n files is English; simulation message in Czech only
- [ ] Header, menus, overlays fully accessible (focus trap, Escape to close)

### Verification
- [ ] Desktop and mobile responsive behavior validated
- [ ] Production domain redirects verified for CZ/SK
- [ ] Staging/Local simulation toast shows correct URLs in Czech
- [ ] Lighthouse accessibility score >= 90 on landing page
- [ ] No usage of Clerk; Supabase Auth only
