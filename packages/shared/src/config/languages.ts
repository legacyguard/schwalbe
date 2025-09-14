// packages/shared/src/config/languages.ts
// Domain → allowed languages mapping and locale utilities for LegacyGuard
// NOTE: Keep codes in BCP 47 lowercase (e.g., 'cs', 'sk', 'en', 'de', 'uk')

import { COUNTRY_DOMAINS, DEFAULT_COUNTRY, type CountryDomain } from './domains'

// Total supported languages baseline (34).
// This list is authoritative for validation and menus. Some locales may be added incrementally.
// The exact per-country exposure is handled by DOMAIN_LANGUAGES.
export const SUPPORTED_LANGUAGES_34 = [
  'cs', // Czech
  'sk', // Slovak
  'en', // English
  'de', // German
  'uk', // Ukrainian
  'pl', // Polish
  'da', // Danish
  'sv', // Swedish
  'fi', // Finnish
  'fr', // French
  'it', // Italian
  'es', // Spanish
  'pt', // Portuguese
  'el', // Greek
  'nl', // Dutch
  'lt', // Lithuanian
  'lv', // Latvian
  'et', // Estonian
  'hu', // Hungarian
  'ro', // Romanian
  'sl', // Slovenian
  'hr', // Croatian
  'sr', // Serbian
  'sq', // Albanian
  'mk', // Macedonian
  'me', // Montenegrin
  'bg', // Bulgarian
  'cy', // Welsh (example placeholder from docs assets)
  'ga', // Irish
  'mt', // Maltese
  'is', // Icelandic
  'no', // Norwegian (for regional UX parity)
  'tr', // Turkish (regional communities)
  'ru', // Russian (matrix-dependent; see project rules for specific countries)
] as const

export type LocaleCode = (typeof SUPPORTED_LANGUAGES_34)[number]

export type DomainHost = string // e.g., 'legacyguard.cz'

// MVP domain → languages mapping
export const DOMAIN_LANGUAGES: Record<DomainHost, LocaleCode[]> = {
  'legacyguard.cz': ['cs', 'sk', 'en', 'de', 'uk'],
  'legacyguard.sk': ['sk', 'cs', 'en', 'de', 'uk'],
}

export function getDomainByHost(hostname: string): CountryDomain | undefined {
  if (!hostname) return undefined
  const normalized = hostname.toLowerCase()
  // Exact or suffix match (to cover subdomains like www.)
  return COUNTRY_DOMAINS.find((d) => normalized === d.host || normalized.endsWith(`.${d.host}`))
}

export function getAllowedLanguagesForHost(hostname: string): LocaleCode[] {
  const rec = getDomainByHost(hostname)
  if (rec) {
    const mapped = DOMAIN_LANGUAGES[rec.host]
    if (mapped) return mapped
  }
  // Fallback to default country record if present, else minimal English
  const defRec = COUNTRY_DOMAINS.find((d) => d.code === DEFAULT_COUNTRY)
  const defLangs = defRec ? DOMAIN_LANGUAGES[defRec.host] : undefined
  return defLangs ?? ['en']
}

export function getDomainDefaultLanguage(hostname: string): LocaleCode {
  const allowed = getAllowedLanguagesForHost(hostname)
  // First of the domain list is considered the default
  return allowed[0] || 'en'
}

export function normalizeLocale(input?: string | null): LocaleCode | null {
  if (!input) return null
  // Map e.g., 'en-US' → 'en', 'cs-CZ' → 'cs', 'uk-UA' → 'uk'
  const base = String(input).toLowerCase().split(/[_.-]/)[0]
  // Guard against unsupported values
  if (SUPPORTED_LANGUAGES_34.includes(base as LocaleCode)) return base as LocaleCode
  return null
}

export interface PreferredLocaleParams {
  host?: string
  userPreferred?: string | null
  deviceLocales?: readonly string[] | null
}

// Compute preferred locale using the hierarchy:
// user → device → domain default → 'en'
export function computePreferredLocale(params: PreferredLocaleParams): LocaleCode {
  const host = params.host || (typeof window !== 'undefined' ? window.location.hostname : '')
  const allowed = getAllowedLanguagesForHost(host)

  // 1) user
  const userNorm = normalizeLocale(params.userPreferred)
  if (userNorm && allowed.includes(userNorm)) return userNorm

  // 2) device (try all navigator.languages)
  const device = params.deviceLocales || (typeof navigator !== 'undefined' ? navigator.languages : [])
  for (const dl of device || []) {
    const dn = normalizeLocale(dl)
    if (dn && allowed.includes(dn)) return dn
  }

  // 3) domain default
  const domainDefault = getDomainDefaultLanguage(host)
  if (domainDefault) return domainDefault

  // 4) English ultimate fallback
  return 'en'
}