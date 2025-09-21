/**
 * Translation hook for new /src/i18n/locale structure
 * Implements English-only translations as required by project rules
 */

import { useCallback, useMemo } from 'react';
import enTranslations from './locale/en.json';

type TranslationKey = string;
type InterpolationParams = Record<string, number | string>;

interface UseTranslationReturn {
  isLoading: false;
  language: 'en';
  t: (key: TranslationKey, params?: InterpolationParams) => string;
}

/**
 * Get nested property from object using dot notation
 */
function getNestedProperty(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Interpolate parameters in translation string
 */
function interpolate(text: string, params: InterpolationParams = {}): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Custom translation hook for English-only implementation
 * Follows the same API as react-i18next for easy migration
 */
export function useTranslation(): UseTranslationReturn {
  const t = useCallback((key: TranslationKey, params?: InterpolationParams): string => {
    try {
      const translation = getNestedProperty(enTranslations, key);

      if (translation === undefined) {
        // Log missing translation in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation for key: ${key}`);
        }

        // Return the key as fallback (common i18n pattern)
        return key;
      }

      if (typeof translation !== 'string') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key "${key}" does not point to a string value`);
        }
        return key;
      }

      // Apply interpolation if params provided
      return params ? interpolate(translation, params) : translation;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error translating key "${key}":`, error);
      }
      return key;
    }
  }, []);

  return useMemo(() => ({
    t,
    language: 'en' as const,
    isLoading: false,
  }), [t]);
}

/**
 * Higher-order component for class components
 */
export function withTranslation<P extends object>(
  Component: React.ComponentType<P & { t: (key: string, params?: InterpolationParams) => string }>
) {
  return function TranslatedComponent(props: P) {
    const { t } = useTranslation();
    return <Component {...props} t={t} />;
  };
}

/**
 * Direct translation function for use outside React components
 */
export function translate(key: TranslationKey, params?: InterpolationParams): string {
  try {
    const translation = getNestedProperty(enTranslations, key);

    if (translation === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key}`);
      }
      return key;
    }

    if (typeof translation !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation key "${key}" does not point to a string value`);
      }
      return key;
    }

    return params ? interpolate(translation, params) : translation;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error translating key "${key}":`, error);
    }
    return key;
  }
}

// Export type for use in other components
export type { InterpolationParams, UseTranslationReturn };

// Re-export translations for direct access if needed
export { enTranslations };
