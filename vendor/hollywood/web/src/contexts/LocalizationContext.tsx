
import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type CountryCode = 'cz' | 'en' | 'sk';
export type LanguageCode = 'cs' | 'de' | 'en' | 'sk';
export type JurisdictionCode = 'CZ' | 'SK';

interface LocalizationState {
  countryCode: CountryCode;
  currency: string;
  jurisdiction: string;
  jurisdictionCode: JurisdictionCode;
  languageCode: LanguageCode;
}

interface LocalizationContextType extends LocalizationState {
  isLoading: boolean;
  setCountryCode: (code: CountryCode) => void;
  setJurisdictionCode: (code: JurisdictionCode) => void;
  setLanguageCode: (code: LanguageCode) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

interface LocalizationProviderProps {
  children: ReactNode;
}

const COUNTRY_MAPPINGS: Record<CountryCode, LocalizationState> = {
  sk: {
    countryCode: 'sk',
    languageCode: 'sk',
    jurisdiction: 'Slovakia',
    jurisdictionCode: 'SK',
    currency: 'EUR',
  },
  cz: {
    countryCode: 'cz',
    languageCode: 'cs',
    jurisdiction: 'Czech Republic',
    jurisdictionCode: 'CZ',
    currency: 'CZK',
  },
  en: {
    countryCode: 'en',
    languageCode: 'en',
    jurisdiction: 'General (English)',
    jurisdictionCode: 'SK', // Default to SK for international users
    currency: 'USD',
  },
};

// Supported language-jurisdiction combinations for will generation
export const SUPPORTED_COMBINATIONS = [
  { language: 'sk', jurisdiction: 'SK', label: 'Slovenčina (Slovensko)' },
  { language: 'cs', jurisdiction: 'SK', label: 'Čeština (Slovensko)' },
  { language: 'en', jurisdiction: 'SK', label: 'English (Slovakia)' },
  { language: 'de', jurisdiction: 'SK', label: 'Deutsch (Slowakei)' },
  { language: 'sk', jurisdiction: 'CZ', label: 'Slovenčina (Česko)' },
  { language: 'cs', jurisdiction: 'CZ', label: 'Čeština (Česko)' },
  { language: 'en', jurisdiction: 'CZ', label: 'English (Czech Republic)' },
  { language: 'de', jurisdiction: 'CZ', label: 'Deutsch (Tschechien)' },
];

const detectCountryFromDomain = (): CountryCode => {
  if (typeof window === 'undefined') return 'en';

  const hostname = window.location.hostname.toLowerCase();

  // Check for country-specific domains
  if (hostname.includes('legacyguard.sk') || hostname.endsWith('.sk')) {
    return 'sk';
  }
  if (hostname.includes('legacyguard.cz') || hostname.endsWith('.cz')) {
    return 'cz';
  }

  // Check for development/staging patterns
  if (hostname.includes('slovakia') || hostname.includes('sk-')) {
    return 'sk';
  }
  if (hostname.includes('czech') || hostname.includes('cz-')) {
    return 'cz';
  }

  // Default to English for development and unknown domains
  return 'en';
};

const detectCountryFromGeolocation = async (): Promise<CountryCode> => {
  try {
    // Check if we already have cached geolocation
    const cachedGeo = sessionStorage.getItem('legacyguard-geo-country');
    if (cachedGeo) {
      return cachedGeo as CountryCode;
    }

    // Simple IP-based country detection
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    const countryCode = data.country_code?.toLowerCase();
    let result: CountryCode = 'en';

    if (countryCode === 'sk') result = 'sk';
    else if (countryCode === 'cz') result = 'cz';

    // Cache the result for this session
    sessionStorage.setItem('legacyguard-geo-country', result);

    return result;
  } catch (_error) {
    // console.log('Geolocation detection failed, using default');
    // Cache the default to avoid repeated failures
    sessionStorage.setItem('legacyguard-geo-country', 'en');
    return 'en';
  }
};

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<LocalizationState>(COUNTRY_MAPPINGS.en);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLocalization = async () => {
      // First try domain detection (fastest and most reliable)
      let detectedCountry = detectCountryFromDomain();

      // If no specific domain match, try geolocation as fallback
      if (detectedCountry === 'en' && typeof window !== 'undefined') {
        const geoCountry = await detectCountryFromGeolocation();
        if (geoCountry !== 'en') {
          detectedCountry = geoCountry;
        }
      }

      // Check if user has previously selected a different country
      const savedCountry = localStorage.getItem(
        'legacyguard-country'
      ) as CountryCode;
      if (savedCountry && COUNTRY_MAPPINGS[savedCountry]) {
        detectedCountry = savedCountry;
      }

      setState(COUNTRY_MAPPINGS[detectedCountry]);
      setIsLoading(false);
    };

    initializeLocalization();
  }, []);

  const setCountryCode = (code: CountryCode) => {
    const newState = COUNTRY_MAPPINGS[code];
    setState(newState);
    localStorage.setItem('legacyguard-country', code);
  };

  const setLanguageCode = (code: LanguageCode) => {
    setState(prev => ({ ...prev, languageCode: code }));
    localStorage.setItem('legacyguard-language', code);
  };

  const setJurisdictionCode = (code: JurisdictionCode) => {
    setState(prev => ({
      ...prev,
      jurisdictionCode: code,
      jurisdiction: code === 'SK' ? 'Slovakia' : 'Czech Republic',
      currency: code === 'SK' ? 'EUR' : 'CZK',
    }));
    localStorage.setItem('legacyguard-jurisdiction', code);
  };

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('legacyguard-language') as LanguageCode;
      const savedJurisdiction = localStorage.getItem('legacyguard-jurisdiction') as JurisdictionCode;

      if (savedLanguage && ['cs', 'de', 'en', 'sk'].includes(savedLanguage)) {
        setState(prev => ({ ...prev, languageCode: savedLanguage }));
      }
      if (savedJurisdiction && ['CZ', 'SK'].includes(savedJurisdiction)) {
        setState(prev => ({
          ...prev,
          jurisdictionCode: savedJurisdiction,
          jurisdiction: savedJurisdiction === 'SK' ? 'Slovakia' : 'Czech Republic',
          currency: savedJurisdiction === 'SK' ? 'EUR' : 'CZK',
        }));
      }
    }
  }, []);

  const contextValue: LocalizationContextType = {
    ...state,
    setCountryCode,
    setLanguageCode,
    setJurisdictionCode,
    isLoading,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error(
      'useLocalization must be used within a LocalizationProvider'
    );
  }
  return context;
};

// Hook for loading country-specific content
export const useCountryContent = <T,>(
  contentType: 'legal_info' | 'will_template' | 'wizard_steps'
) => {
  const { countryCode } = useLocalization();
  const [content, setContent] = useState<null | T>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (contentType === 'will_template') {
        // For markdown templates, we'll need special handling
        const response = await fetch(
          `/src/content/legacy/${countryCode}/will_template.md`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.status}`);
        }
        const text = await response.text();
        setContent(text as T);
      } else {
        // For JSON files, use dynamic imports
        let module;
        if (countryCode === 'sk' && contentType === 'legal_info') {
          module = await import('../content/legacy/sk/legal_info.json');
        } else if (countryCode === 'sk' && contentType === 'wizard_steps') {
          module = await import('../content/legacy/sk/wizard_steps.json');
        } else if (countryCode === 'cz' && contentType === 'legal_info') {
          module = await import('../content/legacy/cz/legal_info.json');
        } else if (countryCode === 'cz' && contentType === 'wizard_steps') {
          module = await import('../content/legacy/cz/wizard_steps.json');
        } else if (countryCode === 'en' && contentType === 'legal_info') {
          module = await import('../content/legacy/en/legal_info.json');
        } else if (countryCode === 'en' && contentType === 'wizard_steps') {
          module = await import('../content/legacy/en/wizard_steps.json');
        } else {
          throw new Error(
            `Unsupported content type: ${contentType} for country: ${countryCode}`
          );
        }
        setContent(module.default as T);
      }
    } catch (err) {
      console.error(`Failed to load ${contentType} for ${countryCode}:`, err);
      setError(`Failed to load ${contentType}`);

      // Fallback to English if country-specific content fails
      if (countryCode !== 'en') {
        try {
          if (contentType === 'will_template') {
            const response = await fetch(
              `/src/content/legacy/en/will_template.md`
            );
            if (response.ok) {
              const text = await response.text();
              setContent(text as T);
              setError(null);
            }
          } else {
            let fallbackModule;
            if (contentType === 'legal_info') {
              fallbackModule = await import(
                '../content/legacy/en/legal_info.json'
              );
            } else if (contentType === 'wizard_steps') {
              fallbackModule = await import(
                '../content/legacy/en/wizard_steps.json'
              );
            }
            if (fallbackModule) {
              setContent(fallbackModule.default as T);
              setError(null);
            }
          }
        } catch (fallbackErr) {
          console.error(`Fallback also failed:`, fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [countryCode, contentType]);

  return { content, loading, error, reload: loadContent };
};
