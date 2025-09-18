import i18n from '../src/i18n'

describe('mobile i18n smoke (no-RN)', () => {
  test('navigation labels exist', () => {
    const tNav = i18n.getFixedT('en', 'navigation')
    expect(tNav('home')).toBe('Home')
    expect(tNav('documents')).toBe('Documents')
    expect(tNav('protection')).toBe('Protection')
    expect(tNav('profile')).toBe('Profile')
  })
})
