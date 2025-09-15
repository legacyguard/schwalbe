// Local stub for @schwalbe/shared used in logic tests to avoid env-dependent clients
// Provide enough logic for existing i18n tests in this package.

export function getAllowedLanguagesForHost(host: string): string[] {
  if (host.includes('legacyguard.cz')) return ['cs', 'sk', 'en', 'de', 'uk']
  if (host.includes('legacyguard.sk')) return ['sk', 'cs', 'en', 'de', 'uk']
  // default for unknown
  return ['en']
}

export function computePreferredLocale(opts: {
  host: string
  userPreferred: string | null
  deviceLocales: string[]
}): string {
  const allowed = getAllowedLanguagesForHost(opts.host)

  // If userPreferred provided and allowed
  if (opts.userPreferred) {
    const up = normalize(opts.userPreferred)
    if (allowed.includes(up)) return up
  }

  // Try device locales
  for (const dl of opts.deviceLocales || []) {
    const n = normalize(dl)
    if (allowed.includes(n)) return n
  }

  // Domain default
  if (opts.host.includes('legacyguard.cz')) return 'cs'
  if (opts.host.includes('legacyguard.sk')) return 'sk'

  // Fallback
  return 'en'
}

function normalize(loc: string): string {
  return loc.toLowerCase().split('-')[0]
}
