/**
 * Jurisdiction-aware i18n hooks
 * Implements proper fallback chain for will translations
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { NamespaceLoader, type SupportedJurisdictionCode, type SupportedLanguageCode } from './config';
import { i18n as i18nInstance } from './index';

/**
 * Enhanced useTranslation hook that considers jurisdiction
 * Implements fallback chain: user language → device language → jurisdiction default → app default
 */
export const useJurisdictionAwareTranslation = (
  jurisdiction: SupportedJurisdictionCode,
  contentType: 'familyShield' | 'wills' = 'wills'
) => {
  const { t, i18n } = useI18nTranslation();
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [loadError, setLoadError] = useState<null | string>(null);

  // Current UI language (normalize to base, e.g., 'en-US' → 'en')
  const currentLanguage = ((i18n.resolvedLanguage ?? i18n.language) || 'en')
    .split('-')[0] as SupportedLanguageCode;
  useEffect(() => {
    let cancelled = false;
    const loadJurisdictionContent = async () => {
      setLoadError(null);
      let loadedAny = false;
      const tried: SupportedLanguageCode[] = [];
      const tryLoad = async (lang: SupportedLanguageCode) => {
        tried.push(lang);
        try {
          await NamespaceLoader.loadContent(contentType, lang, jurisdiction);
          loadedAny = true;
        } catch (_) {
          // swallow and continue to next fallback
        }
      };

      // Fallback 1: current UI language
      await tryLoad(currentLanguage);

      // Fallback 2: jurisdiction's default language
      const jurisdictionDefaults: Record<SupportedJurisdictionCode, SupportedLanguageCode> = {
        CZ: 'cs',
        SK: 'sk',
        DE: 'de',
        PL: 'pl',
        DK: 'da',
        AT: 'de',
        FR: 'fr',
        CH: 'de',
        IT: 'it',
        HR: 'hr',
        BE: 'nl',
        LU: 'fr',
        LI: 'de',
        ES: 'es',
        SE: 'sv',
        FI: 'fi',
        PT: 'pt',
        GR: 'el',
        NL: 'nl',
        GB: 'en',
        LT: 'lt',
        LV: 'lv',
        EE: 'et',
        HU: 'hu',
        SI: 'sl',
        MT: 'mt',
        CY: 'el',
        IE: 'en',
        NO: 'no',
        IS: 'is',
        RO: 'ro',
        BG: 'bg',
        RS: 'sr',
        AL: 'sq',
        MK: 'mk',
        ME: 'sr',
        MD: 'ro',
        UA: 'uk',
        BA: 'bs'
      };
      const defaultLanguage = jurisdictionDefaults[jurisdiction];
      if (defaultLanguage && defaultLanguage !== currentLanguage) {
        await tryLoad(defaultLanguage);
      }

      // Fallback 3: English as ultimate fallback
      if (currentLanguage !== 'en' && defaultLanguage !== 'en') {
        await tryLoad('en');
      }

      if (!cancelled) {
        setIsContentLoaded(loadedAny);
        if (!loadedAny) {
          setLoadError(`Failed to load legal content for ${jurisdiction} (tried: ${tried.join(', ')})`);
        }
      }
    };

    loadJurisdictionContent();
    return () => {
      cancelled = true;
    };
  }, [jurisdiction, currentLanguage, contentType]);

  // Create namespace key for content
  const contentNamespace = `${contentType}_${currentLanguage}_${jurisdiction}`;

  // Enhanced translation function with fallback
  const tJurisdiction = (key: string, options?: any) => {
    // Try jurisdiction-specific translation first
    const jurisdictionKey = `${contentNamespace}:${key}`;
    let translation = t(jurisdictionKey, { ...options, defaultValue: '' });

    // If not found, try jurisdiction default language
    if (!translation) {
      const jurisdictionDefaults: Record<string, string> = {
        CZ: 'cs',
        SK: 'sk'
      };
      const defaultLang = jurisdictionDefaults[jurisdiction];
      if (defaultLang && defaultLang !== currentLanguage) {
        const fallbackNamespace = `${contentType}_${defaultLang}_${jurisdiction}`;
        translation = t(`${fallbackNamespace}:${key}`, { ...options, defaultValue: '' });
      }
    }

    // If still not found, try English
    if (!translation && currentLanguage !== 'en') {
      const englishNamespace = `${contentType}_en_${jurisdiction}`;
      translation = t(`${englishNamespace}:${key}`, { ...options, defaultValue: '' });
    }

    // Ultimate fallback to UI namespace
    if (!translation) {
      translation = t(key, options);
    }

    return translation;
  };

  return {
    t: tJurisdiction,
    tUI: t, // Regular UI translation
    i18n,
    isContentLoaded,
    loadError,
    currentLanguage,
    jurisdiction
  };
};

/**
 * Get the appropriate will translation based on user's language preference and jurisdiction
 */
export const getWillTranslation = (
  userLanguage: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
): string => {
  // Define the translation matrix - now with full English and German support
  const translationMatrix: Record<string, string> = {
    // Czech Republic jurisdiction
    'cs_CZ': 'cs_CZ', // Czech speakers in CZ → Czech law in Czech
    'sk_CZ': 'sk_CZ', // Slovak speakers in CZ → Czech law in Slovak
    'en_CZ': 'en_CZ', // English speakers in CZ → Czech law in English
    'de_CZ': 'de_CZ', // German speakers in CZ → Czech law in German

    // Slovakia jurisdiction
    'sk_SK': 'sk_SK', // Slovak speakers in SK → Slovak law in Slovak
    'cs_SK': 'cs_SK', // Czech speakers in SK → Slovak law in Czech
    'en_SK': 'en_SK', // English speakers in SK → Slovak law in English
    'de_SK': 'de_SK', // German speakers in SK → Slovak law in German
  };

  const key = `${userLanguage}_${jurisdiction}`;
  const result = translationMatrix[key];

  if (result) {
    return result;
  }

  // Enhanced fallback logic
  // 1. Try English for the jurisdiction if not already tried
  if (userLanguage !== 'en') {
    const englishKey = `en_${jurisdiction}`;
    if (translationMatrix[englishKey]) {
      return englishKey;
    }
  }

  // 2. Try jurisdiction's default language
  const jurisdictionDefaults: Record<string, string> = {
    CZ: 'cs',
    SK: 'sk'
  };

  const defaultLang = jurisdictionDefaults[jurisdiction];
  if (defaultLang && defaultLang !== userLanguage) {
    const defaultKey = `${defaultLang}_${jurisdiction}`;
    if (translationMatrix[defaultKey]) {
      return defaultKey;
    }
  }

  // 3. Ultimate fallback to English
  return `en_${jurisdiction}`;
};

/**
 * Validate that all required keys exist in translation files
 */
export const validateTranslationCompleteness = async (
  language: SupportedLanguageCode,
  jurisdiction: SupportedJurisdictionCode
) => {
  const requiredKeys = [
    'title',
    'jurisdiction',
    'language',
    'legalNotice',
    'sections.testator.title',
    'sections.testator.declaration',
    'sections.beneficiaries.title',
    'sections.executor.title',
    'sections.guardianship.title',
    'sections.signature.title',
    'legalRequirements.formTypes.holographic',
    'legalRequirements.witnesses.requirements',
    'validation.errors.missingForcedHeirs'
  ];

  const namespace = `wills_${language}_${jurisdiction}`;
  const missingKeys: string[] = [];

  // Ensure namespace is loaded before validation
  if (!NamespaceLoader.isLoaded(namespace)) {
    try {
      await NamespaceLoader.loadWills(language, jurisdiction);
    } catch {
      // If loading fails, continue and report all keys as missing below
    }
  }

  // Check if each required key exists in the loaded resources
  for (const key of requiredKeys) {
    const translation = i18nInstance.getResource(language, namespace, key);
    if (translation === undefined || translation === null || translation === key) {
      missingKeys.push(key);
    }
  }

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    namespace,
    totalRequiredKeys: requiredKeys.length,
    validatedKeys: requiredKeys.length - missingKeys.length
  };
};
