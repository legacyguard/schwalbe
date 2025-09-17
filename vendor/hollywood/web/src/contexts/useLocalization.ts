
import { type Context, useContext } from 'react';
import type { CountryCode, LocalizationContextType } from './localizationTypes';
// import { LocalizationContext } from './LocalizationContext';

// This context is defined in LocalizationContext.tsx
declare const LocalizationContext: Context<LocalizationContextType | null>;

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      'useLocalization must be used within a LocalizationProvider'
    );
  }
  return context;
};

// Hook for country-specific content
export const useCountryContent = <T>(
  contentMap: Record<CountryCode, T>,
  fallback?: T
): T => {
  const { countryCode } = useLocalization();
  return contentMap[countryCode] || fallback || contentMap.en;
};
