// packages/logic/src/i18n/domains.ts
// Country domain configuration and helpers for LegacyGuard multi-domain setup
// Supabase-first; used by landing header Country selector

export type CountryCode = string // ISO-3166-1 alpha-2 (e.g., 'CZ', 'SK')

export interface CountryDomain {
  code: CountryCode
  host: string // e.g., 'legacyguard.cz'
  name: string // English label or i18n key
  currency: string // ISO-4217 currency code (e.g., 'CZK', 'EUR')
  enabled: boolean // MVP: true only for CZ, SK
}

// 39 countries with dedicated domains (Tier 1 + Tier 2) + development domain
// Enabled flags remain true only for CZ/SK for MVP; others are configured but disabled.
export const COUNTRY_DOMAINS: CountryDomain[] = [
  // Development/staging domain
  { code: 'APP', host: 'legacyguard.app', name: 'Development', currency: 'USD', enabled: true },
  // Tier 1
  { code: 'DE', host: 'legacyguard.de', name: 'Germany', currency: 'EUR', enabled: false },
  { code: 'FR', host: 'legacyguard.fr', name: 'France', currency: 'EUR', enabled: false },
  { code: 'ES', host: 'legacyguard.es', name: 'Spain', currency: 'EUR', enabled: false },
  { code: 'IT', host: 'legacyguard.it', name: 'Italy', currency: 'EUR', enabled: false },
  { code: 'NL', host: 'legacyguard.nl', name: 'Netherlands', currency: 'EUR', enabled: false },
  { code: 'BE', host: 'legacyguard.be', name: 'Belgium', currency: 'EUR', enabled: false },
  { code: 'LU', host: 'legacyguard.lu', name: 'Luxembourg', currency: 'EUR', enabled: false },
  { code: 'CH', host: 'legacyguard.ch', name: 'Switzerland', currency: 'CHF', enabled: false },
  { code: 'LI', host: 'legacyguard.li', name: 'Liechtenstein', currency: 'CHF', enabled: false },
  { code: 'AT', host: 'legacyguard.at', name: 'Austria', currency: 'EUR', enabled: false },
  { code: 'UK', host: 'legacyguard.uk', name: 'United Kingdom', currency: 'GBP', enabled: false },
  { code: 'DK', host: 'legacyguard.dk', name: 'Denmark', currency: 'DKK', enabled: false },
  { code: 'SE', host: 'legacyguard.se', name: 'Sweden', currency: 'SEK', enabled: false },
  { code: 'FI', host: 'legacyguard.fi', name: 'Finland', currency: 'EUR', enabled: false },
  { code: 'CZ', host: 'legacyguard.cz', name: 'Czech Republic', currency: 'CZK', enabled: true },
  { code: 'SK', host: 'legacyguard.sk', name: 'Slovakia', currency: 'EUR', enabled: true },
  { code: 'PL', host: 'legacyguard.pl', name: 'Poland', currency: 'PLN', enabled: false },
  { code: 'HU', host: 'legacyguard.hu', name: 'Hungary', currency: 'HUF', enabled: false },
  { code: 'SI', host: 'legacyguard.si', name: 'Slovenia', currency: 'EUR', enabled: false },
  { code: 'EE', host: 'legacyguard.ee', name: 'Estonia', currency: 'EUR', enabled: false },
  { code: 'LV', host: 'legacyguard.lv', name: 'Latvia', currency: 'EUR', enabled: false },
  { code: 'LT', host: 'legacyguard.lt', name: 'Lithuania', currency: 'EUR', enabled: false },
  { code: 'PT', host: 'legacyguard.pt', name: 'Portugal', currency: 'EUR', enabled: false },
  { code: 'GR', host: 'legacyguard.gr', name: 'Greece', currency: 'EUR', enabled: false },
  { code: 'MT', host: 'legacyguard.mt', name: 'Malta', currency: 'EUR', enabled: false },
  { code: 'CY', host: 'legacyguard.cy', name: 'Cyprus', currency: 'EUR', enabled: false },
  { code: 'IE', host: 'legacyguard.ie', name: 'Ireland', currency: 'EUR', enabled: false },
  { code: 'NO', host: 'legacyguard.no', name: 'Norway', currency: 'NOK', enabled: false },
  { code: 'IS', host: 'legacyguard.is', name: 'Iceland', currency: 'ISK', enabled: false },
  // Tier 2
  { code: 'RO', host: 'legacyguard.ro', name: 'Romania', currency: 'RON', enabled: false },
  { code: 'BG', host: 'legacyguard.bg', name: 'Bulgaria', currency: 'BGN', enabled: false },
  { code: 'HR', host: 'legacyguard.hr', name: 'Croatia', currency: 'EUR', enabled: false },
  { code: 'RS', host: 'legacyguard.rs', name: 'Serbia', currency: 'RSD', enabled: false },
  { code: 'AL', host: 'legacyguard.al', name: 'Albania', currency: 'ALL', enabled: false },
  { code: 'MK', host: 'legacyguard.mk', name: 'North Macedonia', currency: 'MKD', enabled: false },
  { code: 'ME', host: 'legacyguard.me', name: 'Montenegro', currency: 'EUR', enabled: false },
  { code: 'MD', host: 'legacyguard.md', name: 'Moldova', currency: 'MDL', enabled: false },
  { code: 'UA', host: 'legacyguard.ua', name: 'Ukraine', currency: 'UAH', enabled: false },
  { code: 'BA', host: 'legacyguard.ba', name: 'Bosnia and Herzegovina', currency: 'BAM', enabled: false },
]

export const DEFAULT_COUNTRY: CountryCode = 'CZ'

export function getEnabledDomains(): CountryDomain[] {
  return COUNTRY_DOMAINS.filter((c) => c.enabled)
}

export function getDomainForCountry(code: CountryCode): CountryDomain | undefined {
  return COUNTRY_DOMAINS.find((c) => c.code.toUpperCase() === code.toUpperCase())
}

export function isProduction(): boolean {
  // VITE_IS_PRODUCTION (LegacyGuard rule) or typical env flags
  return (
    process.env.VITE_IS_PRODUCTION === 'true' ||
    process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true' ||
    process.env.NODE_ENV === 'production'
  )
}

export function buildCountryUrl(code: CountryCode, opts?: { https?: boolean }): string | null {
  const rec = getDomainForCountry(code)
  if (!rec) return null
  const https = opts?.https ?? true
  const scheme = https ? 'https://' : 'http://'
  return `${scheme}${rec.host}`
}
