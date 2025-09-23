import i18n from '../src/i18n'

// Ensure critical keys exist in en, cs, and sk locales
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
    'home.sectionProtectionGarden','home.plantSeedsTitle','home.addLegacyDoc','home.strengthenShield','home.gardenTitle','home.gardenGrowth','home.securityStatus.activeTitle','home.securityStatus.activeSubtitle',
    'home.emotional.morning','home.emotional.afternoon','home.emotional.evening','home.emotional.night',
    'home.achievements.dailyCheck.title','home.achievements.dailyCheck.description','home.achievements.dailyCheck.shareText',
    'home.stats.seedsOfProtection','home.stats.guardianCircle','home.stats.familyHearts','home.stats.growthThisMonth',
    'home.activity.documentPlanted','home.activity.guardianJoined','home.activity.shieldStrengthened',
    'documents.title','documents.searchPlaceholder','documents.yourCollection','documents.stats.seeds','documents.stats.preserved',
    'documents.empty.title','documents.empty.subtitleDefault','documents.empty.subtitleSearchEmpty','documents.empty.plantFirstSeed',
    'documents.samples.will.name','documents.samples.will.type','documents.samples.will.status',
    'documents.samples.insurance.name','documents.samples.insurance.type','documents.samples.insurance.status',
    'documents.samples.property.name','documents.samples.property.type','documents.samples.property.status',
    'documents.samples.photos.name','documents.samples.photos.type','documents.samples.photos.status',
    'profile.title','profile.role','profile.statusActive','profile.credentials','profile.settings',
    'profile.appInfo.name','profile.appInfo.version','profile.appDescription','profile.sofiaMessage',
    'profile.signOut.title','profile.signOut.message','profile.signOut.cancel','profile.signOut.confirm',
    'profile.menu.accountSettings.title','profile.menu.accountSettings.subtitle',
    'profile.menu.notifications.title','profile.menu.notifications.subtitle',
    'profile.menu.privacySecurity.title','profile.menu.privacySecurity.subtitle',
    'profile.menu.helpSupport.title','profile.menu.helpSupport.subtitle',
    'profile.userInfo.email','profile.userInfo.phone','profile.userInfo.memberSince',
    'profile.userInfo.noEmail','profile.userInfo.noPhone','profile.userInfo.unknown',
    'protection.title','protection.status.activeTitle','protection.status.activeSubtitle','protection.status.completion',
    'protection.arsenal','protection.controls','protection.wisdom.title','protection.wisdom.tip',
    'protection.labels.alerts','protection.labels.alertsDesc','protection.labels.preservation','protection.labels.preservationDesc',
    'protection.labels.vaultLock','protection.labels.vaultLockDesc',
    'protection.features.documentEncryption.title','protection.features.documentEncryption.description',
    'protection.features.familyAccessControl.title','protection.features.familyAccessControl.description',
    'protection.features.automaticBackup.title','protection.features.automaticBackup.description',
    'protection.features.mobileSecurity.title','protection.features.mobileSecurity.description',
    'protection.actions.manageFamilyCircle','protection.actions.viewProtectionReport','protection.actions.updateGuardianKey',
    'protection.statusTypes.active','protection.statusTypes.partial','protection.statusTypes.inactive'
  ]
}

describe('i18n coverage for en, cs, and sk', () => {
  const locales = ['en','cs','sk'] as const
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
