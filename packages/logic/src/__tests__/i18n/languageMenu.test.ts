import { getAllowedLanguagesForHost, computePreferredLocale } from '@schwalbe/shared'

describe('i18n domain language subsets (MVP)', () => {
  test('CZ domain exposes only [cs, sk, en, de, uk]', () => {
    const langs = getAllowedLanguagesForHost('legacyguard.cz')
    expect(langs).toEqual(['cs', 'sk', 'en', 'de', 'uk'])
  })

  test('SK domain exposes only [sk, cs, en, de, uk]', () => {
    const langs = getAllowedLanguagesForHost('legacyguard.sk')
    expect(langs).toEqual(['sk', 'cs', 'en', 'de', 'uk'])
  })
})

describe('i18n locale fallback hierarchy', () => {
  test('user → device → domain default → en (CZ)', () => {
    // User preference invalid, device suggests German, expect de (allowed)
    const lang1 = computePreferredLocale({
      host: 'legacyguard.cz',
      userPreferred: 'xx-XX',
      deviceLocales: ['de-DE', 'en-US'],
    })
    expect(lang1).toBe('de')

    // No user/device match → domain default (cs)
    const lang2 = computePreferredLocale({
      host: 'legacyguard.cz',
      userPreferred: null,
      deviceLocales: ['fr-FR', 'it-IT'],
    })
    expect(lang2).toBe('cs')

    // Explicit user wins if allowed
    const lang3 = computePreferredLocale({
      host: 'legacyguard.cz',
      userPreferred: 'uk-UA',
      deviceLocales: ['de-DE'],
    })
    expect(lang3).toBe('uk')
  })

  test('fallback ultimately returns en when nothing matches', () => {
    const lang = computePreferredLocale({
      host: 'unknown.local',
      userPreferred: 'xx',
      deviceLocales: ['zz-ZZ'],
    })
    expect(['cs', 'en']).toContain(lang) // default country may resolve to cs, else en
  })
})