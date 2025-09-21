import i18n from '../src/i18n'

// Lightweight screen-level checks without RN renderer

describe('screen labels (home/documents/protection/profile)', () => {
  test('home major labels', () => {
    const t = i18n.getFixedT('en', 'screens')
    expect(t('home.sectionProtectionGarden')).toBeTruthy()
    expect(t('home.plantSeedsTitle')).toBeTruthy()
    expect(t('home.gardenTitle')).toBeTruthy()
    expect(t('home.gardenGrowth')).toBeTruthy()
  })

  test('documents major labels', () => {
    const t = i18n.getFixedT('en', 'screens')
    expect(t('documents.title')).toBeTruthy()
    expect(t('documents.searchPlaceholder')).toBeTruthy()
    expect(t('documents.yourCollection')).toBeTruthy()
    expect(t('documents.empty.title')).toBeTruthy()
  })

  test('protection major labels', () => {
    const t = i18n.getFixedT('en', 'screens')
    expect(t('protection.title')).toBeTruthy()
    expect(t('protection.arsenal')).toBeTruthy()
    expect(t('protection.controls')).toBeTruthy()
    expect(t('protection.wisdom.title')).toBeTruthy()
  })

  test('profile major labels', () => {
    const t = i18n.getFixedT('en', 'screens')
    expect(t('profile.title')).toBeTruthy()
    expect(t('profile.credentials')).toBeTruthy()
    expect(t('profile.settings')).toBeTruthy()
    expect(t('profile.appInfo.name')).toBeTruthy()
  })
})
