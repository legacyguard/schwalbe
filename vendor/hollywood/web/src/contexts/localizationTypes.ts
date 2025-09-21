
export type CountryCode = 'cz' | 'en' | 'sk';
export type LanguageCode = 'cs' | 'en' | 'sk';

export interface LocalizationState {
  countryCode: CountryCode;
  currency: string;
  jurisdiction: string;
  languageCode: LanguageCode;
}

export interface LocalizationContextType extends LocalizationState {
  isLoading: boolean;
  setCountryCode: (code: CountryCode) => void;
  setLanguageCode: (code: LanguageCode) => void;
}
