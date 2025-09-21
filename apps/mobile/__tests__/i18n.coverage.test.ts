import i18n from '../src/i18n'

// Ensure critical keys exist in both en and srn locales
const required = {
  navigation: ['home','documents','protection','profile'],
  common: ['error','cancel'],
  auth: [
    'signIn','signingIn','email','emailPlaceholder','password','passwordPlaceholder',
    'showPassword','hidePassword','subtitle','biometricSupport','biometricTitle','biometricPrompt',
    'biometricSubtitle','faceId','fingerprint','biometric','use','usePassword','authenticating',
    'errors.missingCredentials','errors.invalidCredentials','errors.loginFailed','errors.biometricUnavailable','errors.biometricFailed','errors.authFailedTitle','errors.authFailed'
  ],
  screens: [
    'home.sectionProtectionGarden','home.plantSeedsTitle','home.gardenTitle','home.gardenGrowth','home.securityStatus.activeTitle','home.securityStatus.activeSubtitle',
    'documents.title','documents.searchPlaceholder','documents.yourCollection','documents.empty.title',
    'protection.title','protection.arsenal','protection.controls','protection.wisdom.title',
    'profile.title','profile.credentials','profile.settings','profile.appInfo.name'
  ]
}

describe('i18n coverage for en and srn', () => {
  const locales = ['en','srn'] as const
  for (const locale of locales) {
    test(`${locale} contains required keys`, () => {
      for (const ns of Object.keys(required) as (keyof typeof required)[]) {
        const t = i18n.getFixedT(locale, ns)
        for (const key of required[ns]) {
          const val = t(key)
          expect(typeof val).toBe('string')
          expect(val.length).toBeGreaterThan(0)
        }
      }
    })
  }
})
