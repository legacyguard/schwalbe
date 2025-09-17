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
  'ga', // Irish
  'mt', // Maltese
  'is', // Icelandic
  'no', // Norwegian (for regional UX parity)
  'tr', // Turkish (regional communities)
  'ru', // Russian (matrix-dependent; see project rules for specific countries)
  'bs', // Bosnian
] as const

export type LocaleCode = (typeof SUPPORTED_LANGUAGES_34)[number]

export type DomainHost = string // e.g., 'legacyguard.cz'

// English display labels for languages
export const LANGUAGE_LABELS_EN: Record<LocaleCode, string> = {
  cs: 'Czech',
  sk: 'Slovak',
  en: 'English',
  de: 'German',
  uk: 'Ukrainian',
  pl: 'Polish',
  da: 'Danish',
  sv: 'Swedish',
  fi: 'Finnish',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  el: 'Greek',
  nl: 'Dutch',
  lt: 'Lithuanian',
  lv: 'Latvian',
  et: 'Estonian',
  hu: 'Hungarian',
  ro: 'Romanian',
  sl: 'Slovenian',
  hr: 'Croatian',
  sr: 'Serbian',
  sq: 'Albanian',
  mk: 'Macedonian',
  me: 'Montenegrin',
  bg: 'Bulgarian',
  ga: 'Irish',
  mt: 'Maltese',
  is: 'Icelandic',
  no: 'Norwegian',
  tr: 'Turkish',
  ru: 'Russian',
  bs: 'Bosnian',
}

export function getLanguageLabel(code: LocaleCode): string {
  return LANGUAGE_LABELS_EN[code] ?? code.toUpperCase()
}

// Domain → languages mapping (≥4 per country) based on the 39-country matrix
export const DOMAIN_LANGUAGES: Record<DomainHost, LocaleCode[]> = {
  'legacyguard.app': ['en', 'cs', 'sk', 'de', 'uk'], // Development/staging domain
  'legacyguard.cz': ['cs', 'sk', 'en', 'de', 'uk'],
  'legacyguard.sk': ['sk', 'cs', 'en', 'de', 'uk'],
  'legacyguard.de': ['de', 'en', 'pl', 'uk'],
  'legacyguard.pl': ['pl', 'en', 'de', 'cs', 'uk'],
  'legacyguard.dk': ['da', 'en', 'de', 'sv', 'uk'],
  'legacyguard.at': ['de', 'en', 'it', 'cs', 'uk'],
  'legacyguard.fr': ['fr', 'en', 'de', 'es', 'uk'],
  'legacyguard.ch': ['de', 'fr', 'it', 'en', 'uk'],
  'legacyguard.it': ['it', 'en', 'de', 'fr', 'uk'],
  'legacyguard.hr': ['hr', 'en', 'de', 'it', 'sr'],
  'legacyguard.be': ['nl', 'fr', 'en', 'de', 'uk'],
  'legacyguard.lu': ['fr', 'de', 'en', 'pt', 'uk'],
  'legacyguard.li': ['de', 'en', 'fr', 'it'],
  'legacyguard.es': ['es', 'en', 'fr', 'de', 'uk'],
  'legacyguard.se': ['sv', 'en', 'de', 'fi', 'uk'],
  'legacyguard.fi': ['fi', 'sv', 'en', 'de', 'uk'],
  'legacyguard.pt': ['pt', 'en', 'es', 'fr', 'uk'],
  'legacyguard.gr': ['el', 'en', 'de', 'fr', 'uk'],
  'legacyguard.nl': ['nl', 'en', 'de', 'fr', 'uk'],
  'legacyguard.uk': ['en', 'pl', 'fr', 'de', 'uk'],
  'legacyguard.lt': ['lt', 'en', 'ru', 'pl', 'uk'],
  'legacyguard.lv': ['lv', 'ru', 'en', 'de', 'uk'],
  'legacyguard.ee': ['et', 'ru', 'en', 'fi', 'uk'],
  'legacyguard.mt': ['mt', 'en', 'it', 'de', 'fr'],
  'legacyguard.cy': ['el', 'en', 'tr', 'ru', 'uk'],
  'legacyguard.ie': ['en', 'ga', 'pl', 'fr', 'uk'],
  'legacyguard.no': ['no', 'en', 'sv', 'da', 'uk'],
  'legacyguard.is': ['is', 'en', 'da', 'no'],
  'legacyguard.ro': ['ro', 'en', 'de', 'hu', 'uk'],
  'legacyguard.bg': ['bg', 'en', 'de', 'ru', 'uk'],
  'legacyguard.rs': ['sr', 'en', 'de', 'ru', 'hr'],
  'legacyguard.al': ['sq', 'en', 'it', 'de', 'el'],
  'legacyguard.mk': ['mk', 'sq', 'en', 'de', 'bg'],
  'legacyguard.me': ['me', 'sr', 'en', 'de', 'ru'],
  'legacyguard.md': ['ro', 'ru', 'en', 'uk', 'bg'],
  'legacyguard.ua': ['uk', 'ru', 'en', 'pl', 'ro'],
  'legacyguard.ba': ['bs', 'hr', 'sr', 'en', 'de'],
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
