import i18n from '../src/i18n'

describe('auth i18n keys (no-RN)', () => {
  test('auth and common keys exist', () => {
    const tAuth = i18n.getFixedT('en', 'auth')
    const tCommon = i18n.getFixedT('en', 'common')

    expect(tAuth('email')).toBe('Email')
    expect(tAuth('password')).toBe('Password')
    expect(tAuth('signIn')).toBe('Sign In')
    expect(tAuth('errors.missingCredentials')).toContain('Please enter')
    expect(tCommon('error')).toBe('Error')
    expect(tCommon('cancel')).toBe('Cancel')
  })
})
