
/**
 * Enhanced i18n Configuration for LegacyGuard
 * Includes plurals support, date-fns integration, and fallback mechanism
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import {
  format as dateFnsFormat,
  formatDistance,
  parseISO,
} from 'date-fns';
import { cs, de, enUS, es, fr, it, pl, sk } from 'date-fns/locale';

// Date-fns locale mapping
const dateFnsLocales = {
  en: enUS,
  sk: sk,
  cs: cs,
  de: de,
  pl: pl,
  fr: fr,
  it: it,
  es: es,
  // Add more locales as needed
};

// Platform detection
export const detectPlatform = (): 'mobile' | 'web' => {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'mobile';
  }
  if (typeof window !== 'undefined' && (window as { expo?: unknown }).expo) {
    return 'mobile';
  }
  return 'web';
};

// Supported jurisdictions
export const SUPPORTED_JURISDICTIONS = {
  DE: 'Germany',
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  PL: 'Poland',
  DK: 'Denmark',
  AT: 'Austria',
  FR: 'France',
  CH: 'Switzerland',
  IT: 'Italy',
  HR: 'Croatia',
  BE: 'Belgium',
  LU: 'Luxembourg',
  LI: 'Liechtenstein',
  ES: 'Spain',
  SE: 'Sweden',
  FI: 'Finland',
  PT: 'Portugal',
  GR: 'Greece',
  NL: 'Netherlands',
  GB: 'United Kingdom',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  HU: 'Hungary',
  SI: 'Slovenia',
  MT: 'Malta',
  CY: 'Cyprus',
  IE: 'Ireland',
  NO: 'Norway',
  IS: 'Iceland',
  RO: 'Romania',
  BG: 'Bulgaria',
  RS: 'Serbia',
  AL: 'Albania',
  MK: 'North Macedonia',
  ME: 'Montenegro',
  MD: 'Moldova',
  UA: 'Ukraine',
  BA: 'Bosnia and Herzegovina',
} as const;

export type SupportedJurisdictionCode = keyof typeof SUPPORTED_JURISDICTIONS;

// Supported languages with plural rules
export const SUPPORTED_LANGUAGES = {
  sq: {
    code: 'sq',
    name: 'Albanian',
    nativeName: 'Shqip',
    flag: '🇦🇱',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  bs: {
    code: 'bs',
    name: 'Bosnian',
    nativeName: 'Bosanski',
    flag: '🇧🇦',
    currency: 'BAM',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-other',
  },
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    flag: '🇧🇬',
    currency: 'BGN',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  hr: {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    flag: '🇭🇷',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-other',
  },
  cs: {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    currency: 'CZK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  da: {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    currency: 'DKK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    currency: 'EUR',
    dateFormat: 'DD-MM-YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  et: {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    flag: '🇪🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  fi: {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  hu: {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    currency: 'HUF',
    dateFormat: 'YYYY.MM.DD',
    rtl: false,
    pluralRules: 'one-other',
  },
  is: {
    code: 'is',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    flag: '🇮🇸',
    currency: 'ISK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  ga: {
    code: 'ga',
    name: 'Irish Gaelic',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-two-few-many-other',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  lv: {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    flag: '🇱🇻',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'zero-one-other',
  },
  lt: {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    flag: '🇱🇹',
    currency: 'EUR',
    dateFormat: 'YYYY.MM.DD',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  mk: {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    flag: '🇲🇰',
    currency: 'MKD',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  mt: {
    code: 'mt',
    name: 'Maltese',
    nativeName: 'Malti',
    flag: '🇲🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  me: {
    code: 'me',
    name: 'Montenegrin',
    nativeName: 'Crnogorski',
    flag: '🇲🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-other',
  },
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    currency: 'NOK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    currency: 'PLN',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    currency: 'RON',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-other',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  sr: {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    flag: '🇷🇸',
    currency: 'RSD',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-other',
  },
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
  sl: {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    flag: '🇸🇮',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-two-few-other',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    currency: 'SEK',
    dateFormat: 'YYYY-MM-DD',
    rtl: false,
    pluralRules: 'one-other',
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-other',
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
    pluralRules: 'one-few-many-other',
  },
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Namespaces
export const NAMESPACES = {
  UI: 'ui',
  CONTENT: {
    wills: 'wills',
    familyShield: 'family-shield',
  },
} as const;

// Helper functions
export const getContentNamespace = (
  content: keyof typeof NAMESPACES.CONTENT,
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
) => {
  return `${content}_${language}_${jurisdiction}`;
};

/**
 * Format number with localized formatting
 */
export const formatNumber = (
  value: number,
  lng: string,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(lng, options).format(value);
};

/**
 * Format currency with proper locale
 */
export const formatCurrency = (
  value: number,
  lng: string,
  currency?: string
): string => {
  const language = SUPPORTED_LANGUAGES[lng as SupportedLanguageCode];
  return new Intl.NumberFormat(lng, {
    style: 'currency',
    currency: currency || language?.currency || 'EUR',
  }).format(value);
};

/**
 * Format date using date-fns with locale support
 */
export const formatDate = (
  date: Date | string,
  lng: string,
  formatStr?: string
): string => {
  const locale = dateFnsLocales[lng as keyof typeof dateFnsLocales] || enUS;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const language = SUPPORTED_LANGUAGES[lng as SupportedLanguageCode];
  const defaultFormat =
    language?.dateFormat
      .toLowerCase()
      .replace(/yyyy/g, 'yyyy')
      .replace(/mm/g, 'MM')
      .replace(/dd/g, 'dd') || 'dd/MM/yyyy';

  return dateFnsFormat(dateObj, formatStr || defaultFormat, { locale });
};

/**
 * Format relative time (e.g., "3 days ago")
 */
export const formatRelativeTime = (
  date: Date | string,
  lng: string
): string => {
  const locale = dateFnsLocales[lng as keyof typeof dateFnsLocales] || enUS;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  return formatDistance(dateObj, new Date(), { addSuffix: true, locale });
};

/**
 * Format file size with proper units
 */
export const formatFileSize = (bytes: number, lng: string): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${formatNumber(size, lng, { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
};

// Enhanced i18n configuration
export const i18nConfig = {
  // Fallback configuration - CRUCIAL for missing translations
  fallbackLng: 'en',
  fallbackNS: 'ui',

  // Development settings
  debug: process.env.NODE_ENV === 'development',

  // Resource loading
  ns: [NAMESPACES.UI],
  defaultNS: NAMESPACES.UI,

  // Language settings
  supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
  load: 'languageOnly' as const,

  // Detection options
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
    checkWhitelist: true,
  },

  // Backend options
  backend: {
    loadPath: (lngs: string[], namespaces: string[]) => {
      const lng = lngs[0];
      const namespace = namespaces[0];

      if (namespace === NAMESPACES.UI) {
        return `/locales/ui/${lng}.json`;
      }

      if (namespace.includes('_')) {
        const [contentType, language, jurisdiction] = namespace.split('_');
        return `/locales/content/${contentType}/${language}_${jurisdiction}.json`;
      }

      return `/locales/ui/${lng}.json`;
    },

    parse: (data: string) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse translation data:', error);
        return {};
      }
    },
  },

  // Enhanced interpolation with formatters
  interpolation: {
    escapeValue: false,

    format: (value: unknown, format?: string, lng?: string): string => {
      if (!format || !lng) {
        return String(value);
      }

      // Text transformations
      if (typeof value === 'string') {
        switch (format) {
          case 'uppercase':
            return value.toUpperCase();
          case 'lowercase':
            return value.toLowerCase();
          case 'capitalize':
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
      }

      // Number formatting
      if (typeof value === 'number') {
        switch (format) {
          case 'number':
            return formatNumber(value, lng);
          case 'currency':
            return formatCurrency(value, lng);
          case 'percent':
            return formatNumber(value, lng, { style: 'percent' });
          case 'fileSize':
            return formatFileSize(value, lng);
        }
      }

      // Date formatting
      if (
        value instanceof Date ||
        (typeof value === 'string' && format.startsWith('date'))
      ) {
        const formatStr = format.split(':')[1]; // Support format like "date:dd.MM.yyyy"

        switch (format.split(':')[0]) {
          case 'date':
            return formatDate(value as Date | string, lng, formatStr);
          case 'dateRelative':
            return formatRelativeTime(value as Date | string, lng);
          case 'dateShort':
            return formatDate(value as Date | string, lng, 'dd.MM');
          case 'dateLong':
            return formatDate(value as Date | string, lng, 'dd MMMM yyyy');
          case 'time': {
            const locale =
              dateFnsLocales[lng as keyof typeof dateFnsLocales] || enUS;
            return dateFnsFormat(value as Date, 'HH:mm', { locale });
          }
        }
      }

      return String(value);
    },
  },

  // React specific options
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'em', 'u'],
  },

  // Missing key handling
  saveMissing: process.env.NODE_ENV === 'development',
  missingKeyHandler: (
    lngs: readonly string[],
    ns: string,
    key: string,
    fallbackValue: string,
      _updateMissing: boolean,
  _options: any
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Missing translation: [${lngs.join(', ')}] ${ns}:${key}`);
      console.warn(`   Fallback to: ${fallbackValue || 'en'}`);
    }
  },

  // Pluralization configuration
  pluralSeparator: '_',
  contextSeparator: '_',
  keySeparator: '.',
  nsSeparator: ':',

  // Load configuration
  maxParallelReads: 10,
  initImmediate: true,

  // Non-essential missing keys
  nonEssentialKeys: ['tooltip', 'placeholder', 'description'],

  // Return empty string for non-essential missing keys
  returnEmptyString: false,
  returnNull: false,

  // Always return the key if translation is missing (better than empty)
  returnObjects: true,

  // Join arrays with newline
  joinArrays: '\n',

  // Post processing
  postProcess: ['sprintf', 'interval'],

  // Retry configuration for loading resources
  retryTimeout: 3000,
  maxRetries: 3,
};

// Namespace loader utility
export class NamespaceLoader {
  private static loadedNamespaces = new Set<string>();

  static async loadContent(
    contentType: keyof typeof NAMESPACES.CONTENT,
    language: SupportedLanguageCode,
    jurisdiction: SupportedJurisdictionCode
  ) {
    const namespace = getContentNamespace(contentType, language, jurisdiction);

    if (!this.loadedNamespaces.has(namespace)) {
      try {
        await i18n.loadNamespaces([namespace]);
        this.loadedNamespaces.add(namespace);
      } catch (error) {
        console.warn(`Failed to load namespace ${namespace}:`, error);

        // Try fallback to English
        if (language !== 'en') {
          const fallbackNamespace = getContentNamespace(
            contentType,
            'en',
            jurisdiction
          );
          try {
            await i18n.loadNamespaces([fallbackNamespace]);
            this.loadedNamespaces.add(fallbackNamespace);
            console.info(`✅ Loaded fallback namespace: ${fallbackNamespace}`);
          } catch (fallbackError) {
            console.error(
              `Failed to load fallback namespace ${fallbackNamespace}:`,
              fallbackError
            );
          }
        }
      }
    }
  }

  static async loadWills(
    language: SupportedLanguageCode,
    jurisdiction: SupportedJurisdictionCode
  ) {
    await this.loadContent('wills', language, jurisdiction);
  }

  static async loadFamilyShield(
    language: SupportedLanguageCode,
    jurisdiction: SupportedJurisdictionCode
  ) {
    await this.loadContent('familyShield', language, jurisdiction);
  }

  static isLoaded(namespace: string): boolean {
    return this.loadedNamespaces.has(namespace);
  }

  static getLoadedNamespaces(): string[] {
    return Array.from(this.loadedNamespaces);
  }

  static reset() {
    this.loadedNamespaces.clear();
  }
}

// Initialize i18n
export const initI18n = async () => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);

  console.info('✅ i18n initialized with enhanced configuration');
  console.info(`   - Fallback language: ${i18nConfig.fallbackLng}`);
  console.info(
    `   - Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`
  );

  return i18n;
};

// Auto-initialize
if (!i18n.isInitialized) {
  initI18n().catch(error => {
    console.error('❌ Failed to initialize i18n:', error);
  });
}

export default i18n;
