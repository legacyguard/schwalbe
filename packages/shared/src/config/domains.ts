// packages/shared/src/config/domains.ts
// Country domain configuration and helpers for LegacyGuard multi-domain setup
// Supabase-first; used by landing header Country selector

export type CountryCode = string // ISO-3166-1 alpha-2 (e.g., 'CZ', 'SK')

export interface CountryDomain {
  code: CountryCode
  host: string // e.g., 'legacyguard.cz'
  name: string // English label or i18n key
  enabled: boolean // MVP: true only for CZ, SK
}

export const COUNTRY_DOMAINS: CountryDomain[] = [
  { code: 'CZ', host: 'legacyguard.cz', name: 'Czech Republic', enabled: true },
  { code: 'SK', host: 'legacyguard.sk', name: 'Slovakia', enabled: true },
  // Future countries (disabled by default in MVP)
  { code: 'DE', host: 'legacyguard.de', name: 'Germany', enabled: false },
  { code: 'FR', host: 'legacyguard.fr', name: 'France', enabled: false },
  { code: 'IT', host: 'legacyguard.it', name: 'Italy', enabled: false },
  { code: 'ES', host: 'legacyguard.es', name: 'Spain', enabled: false },
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
