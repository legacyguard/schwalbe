
/**
 * i18n Configuration for LegacyGuard
 * Unified configuration supporting the locales structure
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { JURISDICTION_CONFIG } from './jurisdictions';

// Platform detection
export const detectPlatform = (): 'mobile' | 'web' => {
  // Check if we're in a React Native environment
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'mobile';
  }
  // Check for Expo
  if (typeof window !== 'undefined' && (window as { expo?: unknown }).expo) {
    return 'mobile';
  }
  return 'web';
};

// Supported jurisdictions (39 countries based on analysis.cjs)
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

// Supported languages (34 languages for 39 jurisdictions)
export const SUPPORTED_LANGUAGES = {
  sq: {
    code: 'sq',
    name: 'Albanian',
    nativeName: 'Shqip',
    flag: '🇦🇱',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  bs: {
    code: 'bs',
    name: 'Bosnian',
    nativeName: 'Bosanski',
    flag: '🇧🇦',
    currency: 'BAM',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    flag: '🇧🇬',
    currency: 'BGN',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  hr: {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    flag: '🇭🇷',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  cs: {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    currency: 'CZK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  da: {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    currency: 'DKK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    currency: 'EUR',
    dateFormat: 'DD-MM-YYYY',
    rtl: false,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  et: {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    flag: '🇪🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  fi: {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  hu: {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    currency: 'HUF',
    dateFormat: 'YYYY.MM.DD',
    rtl: false,
  },
  is: {
    code: 'is',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    flag: '🇮🇸',
    currency: 'ISK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  ga: {
    code: 'ga',
    name: 'Irish Gaelic',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  lv: {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    flag: '🇱🇻',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  lt: {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    flag: '🇱🇹',
    currency: 'EUR',
    dateFormat: 'YYYY.MM.DD',
    rtl: false,
  },
  mk: {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    flag: '🇲🇰',
    currency: 'MKD',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  mt: {
    code: 'mt',
    name: 'Maltese',
    nativeName: 'Malti',
    flag: '🇲🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  me: {
    code: 'me',
    name: 'Montenegrin',
    nativeName: 'Crnogorski',
    flag: '🇲🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    currency: 'NOK',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    currency: 'PLN',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    currency: 'RON',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  sr: {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    flag: '🇷🇸',
    currency: 'RSD',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  sl: {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    flag: '🇸🇮',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    rtl: false,
  },
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    currency: 'SEK',
    dateFormat: 'YYYY-MM-DD',
    rtl: false,
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    rtl: false,
  },
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// New namespace configuration matching the new locales structure
export const NAMESPACES = {
  // UI namespace (default, always loaded)
  UI: 'ui',

  // Content namespaces (loaded on demand)
  CONTENT: {
    wills: 'wills',
    familyShield: 'family-shield',
  },
} as const;

// Helper function to get content namespace with jurisdiction
export const getContentNamespace = (
  content: keyof typeof NAMESPACES.CONTENT,
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
) => {
  return `${content}_${language}_${jurisdiction}`;
};

// Configuration object
export const i18nConfig = {
  // Default settings
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',

  // Resource loading - UI namespace is default
  ns: [NAMESPACES.UI],
  defaultNS: NAMESPACES.UI,

  // Language settings
  supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
  load: 'languageOnly' as const, // Ignore region codes

  // Detection options
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
    checkForSupportedLanguage: true,
  },

  // Backend options for loading translations
  backend: {
    // Load path function for the new structure
    loadPath: (lngs: string[], namespaces: string[]) => {
      const lng = lngs[0];
      const namespace = namespaces[0];

      // Handle UI namespace
      if (namespace === NAMESPACES.UI) {
        return `/locales/ui/${lng}.json`;
      }

      // Handle content namespaces with jurisdiction
      // Format: wills_sk_SK, family-shield_en_CZ, etc.
      if (namespace.includes('_')) {
        const [contentType, language, jurisdiction] = namespace.split('_');
        return `/locales/content/${contentType}/${language}_${jurisdiction}.json`;
      }

      // Default fallback
      return `/locales/ui/${lng}.json`;
    },

    // Parse the loaded data
    parse: (data: string) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse translation data:', error);
        return {};
      }
    },
  },

  // Interpolation options
  interpolation: {
    escapeValue: false, // React already escapes values
    format: (value: unknown, format?: string, lng?: string): string => {
      if (typeof value === 'string') {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
      }

      if (format === 'currency' && typeof value === 'number' && lng) {
        const language = SUPPORTED_LANGUAGES[lng as SupportedLanguageCode];
        return new Intl.NumberFormat(lng, {
          style: 'currency',
          currency: language?.currency || 'EUR',
        }).format(value);
      }

      if (format === 'date' && value instanceof Date) {
        return new Intl.DateTimeFormat(lng).format(value);
      }

      return String(value);
    },
  },

  // React specific options
  react: {
    useSuspense: false, // Disable suspense for better control
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
  },

  // Missing key handling
  saveMissing: process.env.NODE_ENV === 'development',
  missingKeyHandler: (
    lngs: readonly string[],
    ns: string,
    key: string,
    _fallbackValue: string,
    _updateMissing: boolean,
    _options: unknown
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${lngs.join(', ')} - ${ns}:${key}`);
    }
  },

  // Pluralization
  pluralSeparator: '_',
  contextSeparator: '_',

  // Performance
  maxParallelReads: 10,
  initImmediate: true,
};

// Namespace loader utility for the new architecture
export class NamespaceLoader {
  private static loadedNamespaces = new Set<string>();

  /**
   * Load content namespace for specific language and jurisdiction
   */
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
        // Try fallback to English if available
        if (language !== 'en') {
          const fallbackNamespace = getContentNamespace(
            contentType,
            'en',
            jurisdiction
          );
          try {
            await i18n.loadNamespaces([fallbackNamespace]);
            this.loadedNamespaces.add(fallbackNamespace);
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

  /**
   * Load wills content for specific jurisdiction
   */
  static async loadWills(
    language: SupportedLanguageCode,
    jurisdiction: SupportedJurisdictionCode
  ) {
    await this.loadContent('wills', language, jurisdiction);
  }

  /**
   * Load family shield content for specific jurisdiction
   */
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

// Route-based namespace mapping (simplified for new structure)
export const getNamespacesForRoute = (_pathname: string): string[] => {
  // Always load UI namespace
  const namespaces: string[] = [NAMESPACES.UI];

  // Content namespaces are loaded on-demand based on user's jurisdiction and language
  // This function now returns just the UI namespace, content is loaded when needed
  return namespaces;
};

// Initialize i18n
export const initI18n = async () => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);

  return i18n;
};

// Auto-initialize for immediate use
if (!i18n.isInitialized) {
  initI18n().catch(error => {
    console.error('Failed to initialize i18n:', error);
  });
}

// Missing export functions
export const getCurrentJurisdiction = (): string => {
  // Get jurisdiction from URL, localStorage, or default
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('legacyguard_jurisdiction');
    if (stored) return stored;

    // Try to detect from domain
    const hostname = window.location.hostname;
    if (hostname.includes('.de')) return 'DE';
    if (hostname.includes('.cz')) return 'CZ';
    if (hostname.includes('.sk')) return 'SK';
    if (hostname.includes('.pl')) return 'PL';
  }

  return 'SK'; // Default jurisdiction
};

export const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

export const getDefaultLanguage = (): string => {
  const jurisdiction = getCurrentJurisdiction();
  const config = JURISDICTION_CONFIG[jurisdiction];
  return config?.defaultLanguage || 'sk';
};

export const loadLegalTranslations = async (
  jurisdiction: string,
  language: string
) => {
  // Load legal translations for specific jurisdiction and language
  try {
    const response = await fetch(
      `/locales/content/${jurisdiction.toLowerCase()}/${language}/legal.json`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(
      `Failed to load legal translations for ${jurisdiction}/${language}:`,
      error
    );
  }
  return {};
};

export const getJurisdictionTranslation = (
  jurisdiction: string,
  key: string,
  language?: string
) => {
  // Ensure language is resolved even if not used directly for now
  void (language || getDefaultLanguage());
  const config = JURISDICTION_CONFIG[jurisdiction];
  if (!config) return key;

  // Return translated jurisdiction name or other jurisdiction-specific translations
  return config.name || key;
};

export default i18n;
