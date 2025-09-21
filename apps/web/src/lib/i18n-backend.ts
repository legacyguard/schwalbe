/**
 * @description i18n backend for loading modular translation files
 * Supports dynamic loading of translations organized by namespace
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale detection utility
import { computePreferredLocaleFromBrowser } from './locale';

const initialLocale = computePreferredLocaleFromBrowser();

// Configure i18next with backend loading
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: initialLocale,
    fallbackLng: 'en',

    // Configure backend to load files from our modular structure
    backend: {
      loadPath: '/locales/{{ns}}/{{lng}}.json',
      // Define how to parse the namespace and file structure
      parse: (data: string) => {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.warn('Failed to parse translation file:', error);
          return {};
        }
      },
    },

    // Define default namespaces that should be loaded
    defaultNS: 'common/navigation',
    ns: [
      'common/navigation',
      'common/buttons',
      'pages/landing',
      'will/wizard',
      'features/subscriptions',
      'features/sharing',
    ],

    interpolation: {
      escapeValue: false,
    },

    // Enhanced debugging and error handling
    debug: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}:${ns}:${key}`);
      }
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Pluralization and context support
    pluralSeparator: '_',
    contextSeparator: '_',

    // Load translations on demand
    partialBundledLanguages: true,

    // Preload languages for better UX
    preload: ['en', 'cs', 'sk'],

    // Cache management
    load: 'languageOnly', // Load only language, not region
    cleanCode: true,
  });

export default i18n;