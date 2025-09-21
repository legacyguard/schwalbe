
/**
 * React hooks for new i18n architecture
 * Provides easy access to translations and jurisdiction-specific content
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getContentNamespace,
  NamespaceLoader,
  NAMESPACES,
  SUPPORTED_JURISDICTIONS,
  SUPPORTED_LANGUAGES,
  type SupportedJurisdictionCode,
  type SupportedLanguageCode,
} from './config';

// Type definitions
export interface UseTranslationReturn {
  i18n: {
    changeLanguage: (lng: SupportedLanguageCode) => Promise<void>;
    isReady: boolean;
    language: SupportedLanguageCode;
    supportedLanguages: SupportedLanguageCode[];
  };
  t: (key: string, options?: any) => string;
}

export interface UseContentNamespaceReturn {
  error: Error | null;
  isLoaded: boolean;
  isLoading: boolean;
}

export interface UseJurisdictionReturn {
  changeJurisdiction: (code: SupportedJurisdictionCode) => void;
  jurisdiction: SupportedJurisdictionCode;
  supportedJurisdictions: SupportedJurisdictionCode[];
}

/**
 * Enhanced useTranslation hook for new architecture
 */
export const useTranslation = (namespace?: string): UseTranslationReturn => {
  const { t: i18nT, i18n } = useI18nTranslation(namespace || NAMESPACES.UI);

  const t = useCallback((key: string, options?: any): string => {
    try {
      const result = i18nT(key, options);
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`, error);
      return key;
    }
  }, [i18nT]);

  return {
    t,
    i18n: {
      language: (i18n.language || 'en') as SupportedLanguageCode,
      changeLanguage: async (lng: SupportedLanguageCode) => {
        await i18n.changeLanguage(lng);
      },
      isReady: i18n.isInitialized,
      supportedLanguages: Object.keys(
        SUPPORTED_LANGUAGES
      ) as SupportedLanguageCode[],
    },
  };
};

/**
 * Hook for loading and using content namespaces (wills, family-shield)
 */
export const useContentNamespace = (
  contentType: keyof typeof NAMESPACES.CONTENT,
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
): UseContentNamespaceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const namespace = useMemo(
    () => getContentNamespace(contentType, language, jurisdiction),
    [contentType, language, jurisdiction]
  );

  useEffect(() => {
    const loadNamespace = async () => {
      if (NamespaceLoader.isLoaded(namespace)) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await NamespaceLoader.loadContent(contentType, language, jurisdiction);
        setIsLoaded(true);
      } catch (err) {
        setError(err as Error);
        console.error(
          `Failed to load content namespace for ${String(contentType)}:`,
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNamespace();
  }, [contentType, language, jurisdiction, namespace]);

  return { isLoading, error, isLoaded };
};

/**
 * Hook for managing jurisdiction
 */
export const useJurisdiction = (): UseJurisdictionReturn => {
  const [jurisdiction, setJurisdiction] = useState<SupportedJurisdictionCode>(
    () => {
      // Try to get from localStorage or default to SK
      const stored = localStorage.getItem(
        'preferredJurisdiction'
      ) as SupportedJurisdictionCode;
      return stored && Object.keys(SUPPORTED_JURISDICTIONS).includes(stored)
        ? stored
        : 'SK';
    }
  );

  const changeJurisdiction = useCallback((code: SupportedJurisdictionCode) => {
    setJurisdiction(code);
    localStorage.setItem('preferredJurisdiction', code);
  }, []);

  return {
    jurisdiction,
    changeJurisdiction,
    supportedJurisdictions: Object.keys(
      SUPPORTED_JURISDICTIONS
    ) as SupportedJurisdictionCode[],
  };
};

/**
 * Hook for language formatting utilities
 */
export const useLanguageFormatting = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const languageConfig =
    SUPPORTED_LANGUAGES[currentLang as SupportedLanguageCode];

  const formatDate = useCallback(
    (date: Date): string => {
      if (!languageConfig) return date.toLocaleDateString();

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return languageConfig.dateFormat
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', String(year));
    },
    [languageConfig]
  );

  const formatCurrency = useCallback(
    (amount: number): string => {
      if (!languageConfig) return amount.toString();

      return new Intl.NumberFormat(currentLang, {
        style: 'currency',
        currency: languageConfig.currency,
      }).format(amount);
    },
    [languageConfig, currentLang]
  );

  return {
    formatDate,
    formatCurrency,
    language: languageConfig,
    isRTL: languageConfig?.rtl || false,
  };
};

/**
 * Hook for wills-specific content
 */
export const useWillsContent = (
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
) => {
  const contentNamespace = useContentNamespace('wills', language, jurisdiction);
  const { t } = useI18nTranslation(
    getContentNamespace('wills', language, jurisdiction)
  );

  return {
    ...contentNamespace,
    t: contentNamespace.isLoaded ? t : () => '',
    namespace: getContentNamespace('wills', language, jurisdiction),
  };
};

/**
 * Hook for family shield content
 */
export const useFamilyShieldContent = (
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
) => {
  const contentNamespace = useContentNamespace(
    'familyShield',
    language,
    jurisdiction
  );
  const { t } = useI18nTranslation(
    getContentNamespace('familyShield', language, jurisdiction)
  );

  return {
    ...contentNamespace,
    t: contentNamespace.isLoaded ? t : () => '',
    namespace: getContentNamespace('familyShield', language, jurisdiction),
  };
};

/**
 * Hook for language switcher functionality
 */
export const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const availableLanguages = useMemo(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => ({
      code: code as SupportedLanguageCode,
      name: config.name,
      nativeName: config.nativeName,
      flag: config.flag,
      isActive: i18n.language === code,
    }));
  }, [i18n.language]);

  const switchLanguage = useCallback(
    async (code: SupportedLanguageCode) => {
      await i18n.changeLanguage(code);
      localStorage.setItem('i18nextLng', code);
      document.documentElement.lang = code;
    },
    [i18n]
  );

  return {
    currentLanguage: i18n.language as SupportedLanguageCode,
    availableLanguages,
    switchLanguage,
  };
};

/**
 * Hook for legal terminology
 */
export const useLegalTerm = (
  term: string,
  jurisdiction?: SupportedJurisdictionCode
) => {
  const { jurisdiction: currentJurisdiction } = useJurisdiction();
  const jurs = jurisdiction || currentJurisdiction;

  // This would integrate with legal terminology system
  return {
    term,
    definition: `Definition for ${term} in ${jurs}`,
    jurisdiction: jurs,
  };
};

/**
 * Hook for language management
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  return {
    currentLanguage: i18n.language as SupportedLanguageCode,
    changeLanguage: i18n.changeLanguage,
    supportedLanguages: i18n.supportedLanguages,
    isReady: i18n.isReady,
  };
};
