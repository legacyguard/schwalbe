/**
 * Will Translation Service
 * Manages jurisdiction-specific will translations with full language support
 */

import { NamespaceLoader, type SupportedJurisdictionCode, type SupportedLanguageCode } from './config';

export interface WillTranslationConfig {
  fallbackLanguage?: SupportedLanguageCode;
  jurisdiction: SupportedJurisdictionCode;
  language: SupportedLanguageCode;
}

export interface TranslationAvailability {
  availableLanguages: string[];
  defaultLanguage: string;
  hasEnglish: boolean;
  jurisdiction: string;
}

/**
 * Service for managing will translations across jurisdictions and languages
 */
export class WillTranslationService {
  private static instance: WillTranslationService;

  // Available translation combinations - now with German support
  private static readonly AVAILABLE_TRANSLATIONS: Record<string, {
    default: string;
    files: Record<string, string>;
    languages: string[];
  }> = {
    CZ: {
      languages: ['cs', 'sk', 'en', 'de'],
      default: 'cs',
      files: {
        cs: 'cs_CZ.json',
        sk: 'sk_CZ.json',
        en: 'en_CZ.json',
        de: 'de_CZ.json'
      }
    },
    SK: {
      languages: ['sk', 'cs', 'en', 'de'],
      default: 'sk',
      files: {
        sk: 'sk_SK.json',
        cs: 'cs_SK.json',
        en: 'en_SK.json',
        de: 'de_SK.json'
      }
    }
  };

  private constructor() {}

  static getInstance(): WillTranslationService {
    if (!WillTranslationService.instance) {
      WillTranslationService.instance = new WillTranslationService();
    }
    return WillTranslationService.instance;
  }

  /**
   * Get available languages for a jurisdiction
   */
  getAvailableLanguages(jurisdiction: SupportedJurisdictionCode): string[] {
    return WillTranslationService.AVAILABLE_TRANSLATIONS[jurisdiction]?.languages || ['en'];
  }

  /**
   * Check if a specific language is available for a jurisdiction
   */
  isLanguageAvailable(
    jurisdiction: SupportedJurisdictionCode,
    language: SupportedLanguageCode
  ): boolean {
    const config = WillTranslationService.AVAILABLE_TRANSLATIONS[jurisdiction];
    return config ? config.languages.includes(language) : false;
  }

  /**
   * Get the default language for a jurisdiction
   */
  getDefaultLanguage(jurisdiction: SupportedJurisdictionCode): SupportedLanguageCode {
    return (WillTranslationService.AVAILABLE_TRANSLATIONS[jurisdiction]?.default || 'en') as SupportedLanguageCode;
  }

  /**
   * Load translations for a specific jurisdiction and language
   */
  async loadTranslations(config: WillTranslationConfig): Promise<boolean> {
    try {
      const { jurisdiction, language, fallbackLanguage } = config;

      // Primary: Load requested language
      if (this.isLanguageAvailable(jurisdiction, language)) {
        await NamespaceLoader.loadWills(language, jurisdiction);
      }

      // Fallback: Load fallback language if specified
      if (fallbackLanguage && fallbackLanguage !== language) {
        if (this.isLanguageAvailable(jurisdiction, fallbackLanguage)) {
          await NamespaceLoader.loadWills(fallbackLanguage, jurisdiction);
        }
      }

      // Always load English as ultimate fallback
      if (language !== 'en' && this.isLanguageAvailable(jurisdiction, 'en')) {
        await NamespaceLoader.loadWills('en' as SupportedLanguageCode, jurisdiction);
      }

      // Load jurisdiction default if different
      const defaultLang = this.getDefaultLanguage(jurisdiction);
      if (defaultLang !== language && defaultLang !== fallbackLanguage) {
        await NamespaceLoader.loadWills(defaultLang, jurisdiction);
      }

      return true;
    } catch (_error) {
      console.error('Failed to load will translations:', error);
      return false;
    }
  }

  /**
   * Get translation key for a specific combination
   */
  getTranslationKey(
    jurisdiction: SupportedJurisdictionCode,
    language: SupportedLanguageCode,
    key: string
  ): string {
    const namespace = `wills_${language}_${jurisdiction}`;
    return `${namespace}:${key}`;
  }

  /**
   * Get all available translation configurations
   */
  getAllConfigurations(): TranslationAvailability[] {
    return Object.entries(WillTranslationService.AVAILABLE_TRANSLATIONS).map(([jurisdiction, config]) => ({
      jurisdiction,
      availableLanguages: config.languages,
      defaultLanguage: config.default,
      hasEnglish: config.languages.includes('en')
    }));
  }

  /**
   * Validate that all required translations exist for a jurisdiction
   */
  async validateJurisdictionTranslations(
    jurisdiction: SupportedJurisdictionCode
  ): Promise<{ missing: string[]; valid: boolean; }> {
    const config = WillTranslationService.AVAILABLE_TRANSLATIONS[jurisdiction];
    if (!config) {
      return { valid: false, missing: [`No configuration for ${jurisdiction}`] };
    }

    const missing: string[] = [];

    for (const language of config.languages) {
      const namespace = `wills_${language}_${jurisdiction}`;

      // Check if namespace is loaded or can be loaded
      if (!NamespaceLoader.isLoaded(namespace)) {
        try {
          await NamespaceLoader.loadWills(language as SupportedLanguageCode, jurisdiction);
        } catch (_error) {
          missing.push(`${language}_${jurisdiction}`);
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Get formatted currency for jurisdiction
   */
  formatCurrency(amount: number, jurisdiction: SupportedJurisdictionCode, language: SupportedLanguageCode): string {
    const currency = jurisdiction === 'CZ' ? 'CZK' : 'EUR';
    const locale = language === 'cs' ? 'cs-CZ' :
                   language === 'sk' ? 'sk-SK' :
                   language === 'de' ? 'de-DE' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get formatted date for jurisdiction
   */
  formatDate(date: Date, jurisdiction: SupportedJurisdictionCode, language: SupportedLanguageCode): string {
    const locale = language === 'cs' ? 'cs-CZ' :
                   language === 'sk' ? 'sk-SK' :
                   language === 'de' ? 'de-DE' : 'en-US';

    // Czech, Slovak and German use DD.MM.YYYY format
    if (jurisdiction === 'CZ' || jurisdiction === 'SK') {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date).replace(/\//g, '.');
    }

    // Default format for other jurisdictions
    return new Intl.DateTimeFormat(locale).format(date);
  }

  /**
   * Get legal reference format for jurisdiction
   */
  getLegalReference(jurisdiction: SupportedJurisdictionCode, language: SupportedLanguageCode): string {
    const references: Record<string, Record<string, string>> = {
      CZ: {
        cs: 'zákon č. 89/2012 Sb., občanský zákoník',
        sk: 'zákon č. 89/2012 Zb., občiansky zákonník',
        en: 'Act No. 89/2012 Coll., Civil Code',
        de: 'Gesetz Nr. 89/2012 Slg., Bürgerliches Gesetzbuch'
      },
      SK: {
        sk: 'zákon č. 40/1964 Zb., Občiansky zákonník',
        cs: 'zákon č. 40/1964 Sb., Občanský zákoník',
        en: 'Act No. 40/1964 Coll., Civil Code',
        de: 'Gesetz Nr. 40/1964 Slg., Bürgerliches Gesetzbuch'
      }
    };

    return references[jurisdiction]?.[language] || references[jurisdiction]?.['en'] || 'Civil Code';
  }
}

// Export singleton instance
export const willTranslationService = WillTranslationService.getInstance();
