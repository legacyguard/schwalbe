import { DOMAIN_LANGUAGES } from '../languages'

function has(list: readonly string[], code: string): boolean {
  return list.includes(code)
}

describe('Language rules enforcement', () => {
  test('Germany (legacyguard.de) must NOT include Russian (ru)', () => {
    const langs = DOMAIN_LANGUAGES['legacyguard.de']
    expect(has(langs, 'ru')).toBe(false)
  })

  test('Iceland (legacyguard.is) must NOT include Ukrainian (uk)', () => {
    const langs = DOMAIN_LANGUAGES['legacyguard.is']
    expect(has(langs, 'uk')).toBe(false)
  })

  test('Liechtenstein (legacyguard.li) must NOT include Ukrainian (uk)', () => {
    const langs = DOMAIN_LANGUAGES['legacyguard.li']
    expect(has(langs, 'uk')).toBe(false)
  })

  test('Baltics must include Russian (ru): EE, LV, LT', () => {
    expect(has(DOMAIN_LANGUAGES['legacyguard.ee'], 'ru')).toBe(true)
    expect(has(DOMAIN_LANGUAGES['legacyguard.lv'], 'ru')).toBe(true)
    expect(has(DOMAIN_LANGUAGES['legacyguard.lt'], 'ru')).toBe(true)
  })

  test('All domains expose at least 4 languages', () => {
    for (const [host, langs] of Object.entries(DOMAIN_LANGUAGES)) {
      expect(Array.isArray(langs)).toBe(true)
      if (langs.length < 4) {
        throw new Error(`Domain ${host} has only ${langs.length} languages: [${langs.join(', ')}]`)
      }
    }
  })
})
