import { I18n } from 'i18n-js';
import * as Localization from 'react-native-localize';

// Create i18n instance
const i18n = new I18n();

// Function to load translations dynamically
export const loadTranslations = async () => {
  // This is a placeholder - in production, load from actual module files
  // For now, we'll use empty translations to avoid errors
  const translations = {
    en: {},
    cs: {},
    sk: {},
    de: {},
  };

  // Set translations
  i18n.translations = translations;
};

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Function to set the locale based on device settings
export const initializeI18n = () => {
  const locales = Localization.getLocales();

  if (locales.length > 0) {
    const deviceLanguage = locales[0].languageCode;

    // Check if we support this language
    if (['en', 'cs', 'sk', 'de'].includes(deviceLanguage)) {
      i18n.locale = deviceLanguage;
    } else {
      i18n.locale = 'en'; // fallback to English
    }
  }
};

// Initialize on import
initializeI18n();

// Listen for locale changes (types don't expose addEventListener in RN Localize)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Localization as any).addEventListener?.('change', () => {
  initializeI18n();
});

export default i18n;
export const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, options as Record<string, unknown>);
