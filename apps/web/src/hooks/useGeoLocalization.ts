/**
 * Geo Localization Hook
 * React hook for accessing and managing geo-localization data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type GeoLocation,
  type LocalizedContent,
  type EmergencyServices,
  useGeoLocalization as useGeoLocalizationBase,
} from '@/middleware/geoLocalizationMiddleware';

export interface GeoData {
  location: GeoLocation;
  content: LocalizedContent;
  emergency: EmergencyServices;
  timestamp: string;
}

export interface UseGeoLocalizationReturn {
  geoData: GeoData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  getEmergencyNumber: () => string;
  isCountry: (countryCode: string) => boolean;
  isCurrency: (currency: string) => boolean;
  getCountryFlag: () => string;
  getLocalizedStrings: () => LocalizedStrings;
}

interface LocalizedStrings {
  common: Record<string, string>;
  emergency: Record<string, string>;
  legal: Record<string, string>;
  currency: Record<string, string>;
}

const LOCALIZED_STRINGS: Record<string, LocalizedStrings> = {
  'sk-SK': {
    common: {
      loading: 'Načítava sa...',
      error: 'Chyba',
      retry: 'Skúsiť znovu',
      location: 'Poloha',
      update: 'Aktualizovať',
      copy: 'Kopírovať',
      copied: 'Skopírované',
      unknown: 'Neznáme',
      accurate: 'Presné',
      approximate: 'Približné',
      estimated: 'Orientačné',
    },
    emergency: {
      title: 'Núdzové služby',
      unified: 'Jednotné núdzové číslo',
      police: 'Polícia',
      fire: 'Hasiči',
      medical: 'Zdravotná záchrana',
      mental: 'Duševné zdravie',
      domestic: 'Domáce násilie',
      child: 'Deti v núdzi',
      senior: 'Seniori',
      poison: 'Toxikologické centrum',
      disaster: 'Katastrofy',
    },
    legal: {
      title: 'Právny rámec',
      framework: 'Právny systém',
      dataProtection: 'Ochrana osobných údajov',
      institutions: 'Dôveryhodné inštitúcie',
      taxSystem: 'Daňový systém',
    },
    currency: {
      title: 'Lokálne nastavenia',
      currency: 'Mena',
      dateFormat: 'Formát dátumu',
      timeFormat: 'Formát času',
      language: 'Jazyk',
      example: 'Príklad',
    },
  },
  'cs-CZ': {
    common: {
      loading: 'Načítá se...',
      error: 'Chyba',
      retry: 'Zkusit znovu',
      location: 'Poloha',
      update: 'Aktualizovat',
      copy: 'Kopírovat',
      copied: 'Zkopírováno',
      unknown: 'Neznámé',
      accurate: 'Přesné',
      approximate: 'Přibližné',
      estimated: 'Orientační',
    },
    emergency: {
      title: 'Nouzové služby',
      unified: 'Jednotné nouzové číslo',
      police: 'Policie',
      fire: 'Hasiči',
      medical: 'Zdravotnická záchranná služba',
      mental: 'Duševní zdraví',
      domestic: 'Domácí násilí',
      child: 'Děti v nouzi',
      senior: 'Senioři',
      poison: 'Toxikologické centrum',
      disaster: 'Katastrofy',
    },
    legal: {
      title: 'Právní rámec',
      framework: 'Právní systém',
      dataProtection: 'Ochrana osobních údajů',
      institutions: 'Důvěryhodné instituce',
      taxSystem: 'Daňový systém',
    },
    currency: {
      title: 'Místní nastavení',
      currency: 'Měna',
      dateFormat: 'Formát data',
      timeFormat: 'Formát času',
      language: 'Jazyk',
      example: 'Příklad',
    },
  },
  'en-GB': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Try again',
      location: 'Location',
      update: 'Update',
      copy: 'Copy',
      copied: 'Copied',
      unknown: 'Unknown',
      accurate: 'Accurate',
      approximate: 'Approximate',
      estimated: 'Estimated',
    },
    emergency: {
      title: 'Emergency Services',
      unified: 'Emergency Number',
      police: 'Police',
      fire: 'Fire Department',
      medical: 'Medical Emergency',
      mental: 'Mental Health',
      domestic: 'Domestic Violence',
      child: 'Child Services',
      senior: 'Senior Services',
      poison: 'Poison Control',
      disaster: 'Disaster Services',
    },
    legal: {
      title: 'Legal Framework',
      framework: 'Legal System',
      dataProtection: 'Data Protection',
      institutions: 'Trusted Institutions',
      taxSystem: 'Tax System',
    },
    currency: {
      title: 'Local Settings',
      currency: 'Currency',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      language: 'Language',
      example: 'Example',
    },
  },
};

/**
 * Enhanced geo localization hook with additional utilities
 */
export function useGeoLocalization(): UseGeoLocalizationReturn {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGeoData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      const data = useGeoLocalizationBase();
      setGeoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load geo data');
      setGeoData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGeoData();
  }, [loadGeoData]);

  const refresh = useCallback(() => {
    // Clear existing geo data cookie and reload
    document.cookie = 'geo-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    if (!geoData) return `${amount.toFixed(2)} EUR`;

    const { location } = geoData;
    const locale = geoData.content.locale;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: location.currency,
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${location.currency}`;
    }
  }, [geoData]);

  const formatDate = useCallback((date: Date): string => {
    if (!geoData) return date.toLocaleDateString();

    const locale = geoData.content.locale;

    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }, [geoData]);

  const formatTime = useCallback((date: Date): string => {
    if (!geoData) return date.toLocaleTimeString();

    const locale = geoData.content.locale;

    try {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return date.toLocaleTimeString();
    }
  }, [geoData]);

  const getEmergencyNumber = useCallback((): string => {
    return geoData?.emergency.unified || '112';
  }, [geoData]);

  const isCountry = useCallback((countryCode: string): boolean => {
    return geoData?.location.countryCode === countryCode;
  }, [geoData]);

  const isCurrency = useCallback((currency: string): boolean => {
    return geoData?.location.currency === currency;
  }, [geoData]);

  const getCountryFlag = useCallback((): string => {
    if (!geoData) return '🌍';

    const flags: Record<string, string> = {
      SK: '🇸🇰',
      CZ: '🇨🇿',
      AT: '🇦🇹',
      DE: '🇩🇪',
      HU: '🇭🇺',
      PL: '🇵🇱',
      GB: '🇬🇧',
      FR: '🇫🇷',
      IT: '🇮🇹',
      ES: '🇪🇸',
      NL: '🇳🇱',
      BE: '🇧🇪',
      CH: '🇨🇭',
      NO: '🇳🇴',
      SE: '🇸🇪',
      DK: '🇩🇰',
      FI: '🇫🇮',
    };

    return flags[geoData.location.countryCode] || '🌍';
  }, [geoData]);

  const getLocalizedStrings = useCallback((): LocalizedStrings => {
    const locale = geoData?.content.locale || 'sk-SK';
    return LOCALIZED_STRINGS[locale] || LOCALIZED_STRINGS['sk-SK'];
  }, [geoData]);

  return {
    geoData,
    isLoading,
    error,
    refresh,
    formatCurrency,
    formatDate,
    formatTime,
    getEmergencyNumber,
    isCountry,
    isCurrency,
    getCountryFlag,
    getLocalizedStrings,
  };
}

/**
 * Hook for emergency services quick access
 */
export function useEmergencyServices() {
  const { geoData, getEmergencyNumber } = useGeoLocalization();

  const callEmergency = useCallback(() => {
    const number = getEmergencyNumber();
    window.open(`tel:${number}`, '_self');
  }, [getEmergencyNumber]);

  const copyEmergencyNumber = useCallback(async () => {
    const number = getEmergencyNumber();
    try {
      await navigator.clipboard.writeText(number);
      return true;
    } catch (error) {
      console.error('Failed to copy emergency number:', error);
      return false;
    }
  }, [getEmergencyNumber]);

  const getEmergencyServices = useCallback(() => {
    return geoData?.emergency || null;
  }, [geoData]);

  return {
    callEmergency,
    copyEmergencyNumber,
    getEmergencyServices,
    emergencyNumber: getEmergencyNumber(),
  };
}

/**
 * Hook for currency and formatting utilities
 */
export function useLocalization() {
  const {
    geoData,
    formatCurrency,
    formatDate,
    formatTime,
    getLocalizedStrings,
  } = useGeoLocalization();

  const formatNumber = useCallback((number: number): string => {
    if (!geoData) return number.toString();

    try {
      return new Intl.NumberFormat(geoData.content.locale).format(number);
    } catch (error) {
      return number.toString();
    }
  }, [geoData]);

  const formatPercentage = useCallback((percentage: number): string => {
    if (!geoData) return `${percentage}%`;

    try {
      return new Intl.NumberFormat(geoData.content.locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(percentage / 100);
    } catch (error) {
      return `${percentage}%`;
    }
  }, [geoData]);

  const formatRelativeTime = useCallback((date: Date): string => {
    if (!geoData) return date.toLocaleDateString();

    try {
      const rtf = new Intl.RelativeTimeFormat(geoData.content.locale, {
        numeric: 'auto',
      });

      const diffInSeconds = (date.getTime() - Date.now()) / 1000;
      const diffInMinutes = diffInSeconds / 60;
      const diffInHours = diffInMinutes / 60;
      const diffInDays = diffInHours / 24;

      if (Math.abs(diffInDays) >= 1) {
        return rtf.format(Math.round(diffInDays), 'day');
      } else if (Math.abs(diffInHours) >= 1) {
        return rtf.format(Math.round(diffInHours), 'hour');
      } else {
        return rtf.format(Math.round(diffInMinutes), 'minute');
      }
    } catch (error) {
      return date.toLocaleDateString();
    }
  }, [geoData]);

  return {
    locale: geoData?.content.locale || 'sk-SK',
    currency: geoData?.location.currency || 'EUR',
    timezone: geoData?.location.timezone || 'UTC',
    formatCurrency,
    formatDate,
    formatTime,
    formatNumber,
    formatPercentage,
    formatRelativeTime,
    strings: getLocalizedStrings(),
  };
}

/**
 * Hook for legal and compliance information
 */
export function useLegalCompliance() {
  const { geoData } = useGeoLocalization();

  const getLegalFramework = useCallback(() => {
    return geoData?.content.legalFramework || 'International Standards';
  }, [geoData]);

  const getDataProtectionLaws = useCallback(() => {
    return geoData?.content.dataProtectionLaws || ['Local Privacy Laws'];
  }, [geoData]);

  const getTrustedInstitutions = useCallback(() => {
    return geoData?.content.trustedInstitutions || ['Local Legal Authorities'];
  }, [geoData]);

  const isGDPRApplicable = useCallback(() => {
    if (!geoData) return false;

    const gdprCountries = ['SK', 'CZ', 'AT', 'DE', 'HU', 'PL', 'GB', 'FR', 'IT', 'ES', 'NL', 'BE'];
    return gdprCountries.includes(geoData.location.countryCode);
  }, [geoData]);

  return {
    legalFramework: getLegalFramework(),
    dataProtectionLaws: getDataProtectionLaws(),
    trustedInstitutions: getTrustedInstitutions(),
    isGDPRApplicable: isGDPRApplicable(),
    taxSystem: geoData?.content.taxSystem || 'Local Tax System',
  };
}