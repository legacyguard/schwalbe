
/**
 * TypeScript types for i18n system
 * Provides strong typing for translations and jurisdictions
 */

import type { NAMESPACES } from './config';
import type { JurisdictionConfig } from './jurisdictions';
// import { LanguageConfig } from './languages';
import type { LegalTermCategory } from './legal-terminology';

// Namespace types
export type TranslationNamespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];

// Language codes (ISO 639-1)
export type LanguageCode =
  | 'bg' // Bulgarian
  | 'bs' // Bosnian
  | 'cs' // Czech
  | 'da' // Danish
  | 'de' // German
  | 'el' // Greek
  | 'en' // English
  | 'es' // Spanish
  | 'et' // Estonian
  | 'fi' // Finnish
  | 'fr' // French
  | 'ga' // Irish Gaelic
  | 'hr' // Croatian
  | 'hu' // Hungarian
  | 'is' // Icelandic
  | 'it' // Italian
  | 'lt' // Lithuanian
  | 'lv' // Latvian
  | 'me' // Montenegrin
  | 'mk' // Macedonian
  | 'mt' // Maltese
  | 'nl' // Dutch
  | 'no' // Norwegian
  | 'pl' // Polish
  | 'pt' // Portuguese
  | 'ro' // Romanian
  | 'ru' // Russian
  | 'sk' // Slovak
  | 'sl' // Slovenian
  | 'sq' // Albanian
  | 'sr' // Serbian
  | 'sv' // Swedish
  | 'tr' // Turkish
  | 'uk'; // Ukrainian

// Jurisdiction codes (ISO 3166-1 alpha-2)
export type JurisdictionCode =
  | 'AL'
  | 'AT'
  | 'BA'
  | 'BE'
  | 'BG'
  | 'CH'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DK'
  | 'EE'
  | 'ES'
  | 'FI'
  | 'FR'
  | 'GR'
  | 'HR'
  | 'HU'
  | 'IE'
  | 'IS'
  | 'IT'
  | 'LI'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'MD'
  | 'ME'
  | 'MK'
  | 'MT'
  | 'NL'
  | 'NO'
  | 'PL'
  | 'PT'
  | 'RO'
  | 'RS'
  | 'SE'
  | 'SI'
  | 'SK'
  | 'UA'
  | 'UK';

// Translation key structure
export interface TranslationKeys {
  ai: Record<string, string>;

  // Auth namespace
  auth: {
    errors: {
      emailInUse: string;
      invalidCredentials: string;
      networkError: string;
      tooManyRequests: string;
      userNotFound: string;
      weakPassword: string;
    };
    signIn: {
      continueWith: string;
      email: string;
      forgotPassword: string;
      noAccount: string;
      or: string;
      password: string;
      signUp: string;
      submit: string;
      title: string;
    };
    signOut: {
      confirm: string;
      message: string;
      title: string;
    };
    signUp: {
      confirmPassword: string;
      email: string;
      firstName: string;
      hasAccount: string;
      lastName: string;
      password: string;
      privacy: string;
      signIn: string;
      submit: string;
      terms: string;
      title: string;
    };
  };

  // Common namespace
  common: {
    actions: {
      back: string;
      cancel: string;
      close: string;
      confirm: string;
      copy: string;
      create: string;
      delete: string;
      download: string;
      edit: string;
      filter: string;
      finish: string;
      next: string;
      print: string;
      save: string;
      search: string;
      share: string;
      sort: string;
      update: string;
      upload: string;
    };
    app: {
      name: string;
      tagline: string;
      version: string;
    };
    status: {
      active: string;
      archived: string;
      completed: string;
      error: string;
      inactive: string;
      info: string;
      loading: string;
      pending: string;
      success: string;
      warning: string;
    };
    time: {
      days: string;
      hours: string;
      lastMonth: string;
      lastWeek: string;
      minutes: string;
      nextMonth: string;
      nextWeek: string;
      seconds: string;
      thisMonth: string;
      thisWeek: string;
      today: string;
      tomorrow: string;
      yesterday: string;
    };
    validation: {
      invalid: string;
      invalidDate: string;
      invalidEmail: string;
      invalidFormat: string;
      invalidPhone: string;
      required: string;
      tooLong: string;
      tooShort: string;
    };
  };

  // Dashboard namespace
  dashboard: {
    alerts: {
      actionRequired: string;
      expiringSoon: string;
      noAlerts: string;
      title: string;
      updateAvailable: string;
    };
    overview: {
      completionRate: string;
      daysProtected: string;
      documentsProtected: string;
      familyMembers: string;
      guardians: string;
      title: string;
    };
    quickActions: {
      addFamilyMember: string;
      createWill: string;
      setupGuardian: string;
      title: string;
      uploadDocument: string;
    };
    recentActivity: {
      noActivity: string;
      title: string;
      viewAll: string;
    };
    title: string;
    welcome: string;
  };

  // Other namespaces...
  documents: Record<string, string>;

  emergency: Record<string, string>;
  errors: Record<string, string>;
  family: Record<string, string>;
  guardians: Record<string, string>;
  legacy: Record<string, string>;
  // Legal namespace with jurisdiction-specific terms
  legal: {
    documents: {
      advanceDirective: string;
      beneficiaryDesignation: string;
      powerOfAttorney: string;
      trustDocument: string;
      will: string;
    };
    procedures: {
      certification: string;
      notarization: string;
      probate: string;
      registration: string;
      witnessing: string;
    };
    terms: {
      [K in keyof LegalTermCategory]: string;
    };
  };
  legalDocuments: Record<string, string>;
  legalProcedures: Record<string, string>;
  legalTerms: Record<string, string>;
  notaryTerms: Record<string, string>;
  notifications: Record<string, string>;
  onboarding: Record<string, string>;
  settings: Record<string, string>;
  taxTerms: Record<string, string>;
  vault: Record<string, string>;
  // Will namespace
  will: {
    create: {
      beneficiaries: {
        add: string;
        name: string;
        relationship: string;
        share: string;
        specific: string;
        title: string;
      };
      executor: {
        alternativeExecutor: string;
        name: string;
        relationship: string;
        title: string;
      };
      intro: string;
      personal: {
        address: string;
        dateOfBirth: string;
        fullName: string;
        maritalStatus: string;
        nationality: string;
        title: string;
      };
      review: {
        checkInfo: string;
        download: string;
        sign: string;
        title: string;
      };
      title: string;
      witnesses: {
        requirements: string;
        title: string;
        witness1: string;
        witness2: string;
      };
    };
    validation: {
      ageRequirement: string;
      capacityRequirement: string;
      notaryRequirement: string;
      witnessRequirement: string;
    };
  };
}

// Translation function types with enhanced type safety
export type TFunction = <
  NS extends TranslationNamespace = TranslationNamespace,
>(
  key: ValidTranslationKey<NS>,
  options?: TranslationOptions & { ns?: NS }
) => string;

// Overloaded TFunction for different use cases
export interface TFunctionOverloads {
  // Basic usage
  (key: string, options?: TranslationOptions): string;

  // Type-safe namespace usage
  <NS extends TranslationNamespace>(
    key: ValidTranslationKey<NS>,
    options: TranslationOptions & { ns: NS }
  ): string;

  // Return objects
  <NS extends TranslationNamespace, T = string>(
    key: ValidTranslationKey<NS>,
    options: TranslationOptions & { ns: NS; returnObjects: true }
  ): T;
}

export interface TranslationOptions {
  context?: string;
  count?: number;
  defaultValue?: string;
  jurisdiction?: JurisdictionCode;
  lng?: LanguageCode;
  ns?: TranslationNamespace;
  replace?: Record<string, number | string>;
  returnObjects?: boolean;
}

// i18n configuration types
export interface I18nConfig {
  fallbackLanguage: LanguageCode;
  jurisdiction: JurisdictionCode;
  language: LanguageCode;
  namespaces: TranslationNamespace[];
  supportedLanguages: LanguageCode[];
}

// Translation resource structure
export interface TranslationResource {
  [language: string]: {
    [namespace: string]: TranslationKeys[keyof TranslationKeys];
  };
}

// Jurisdiction-specific translation overrides
export interface JurisdictionTranslationOverride {
  jurisdiction: JurisdictionCode;
  language: LanguageCode;
  namespace: TranslationNamespace;
  overrides: Partial<TranslationKeys[keyof TranslationKeys]>;
}

// Export helper types with improved conditional types
export type ExtractNamespaceKeys<T extends TranslationNamespace> =
  T extends keyof TranslationKeys ? TranslationKeys[T] : never;

// Advanced type for extracting nested keys with dot notation
export type NestedKeys<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & (number | string)]: K extends string
          ? T[K] extends object
            ? D extends 1
              ? K
              : `${K}.${NestedKeys<T[K], [-1, 0, 1, 2, 3][D]>}` | `${K}`
            : K
          : never;
      }[keyof T & (number | string)]
    : never;

// Conditional type for translation key validation
export type ValidTranslationKey<NS extends TranslationNamespace> =
  NS extends keyof TranslationKeys ? NestedKeys<TranslationKeys[NS]> : string;

// Type-safe translation path resolution
export type ResolvePath<T, Path extends string> = Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? T[K] extends object
        ? ResolvePath<T[K], Rest>
        : never
      : never
    : never;

// Use the enhanced DeepPartial from global types
export type { DeepPartial } from '@/types';

// Hook return types
export interface UseTranslationReturn {
  i18n: {
    changeLanguage: (lng: LanguageCode) => Promise<void>;
    isReady: boolean;
    jurisdiction: JurisdictionCode;
    language: LanguageCode;
    languages: LanguageCode[];
    supportedLanguages: LanguageCode[];
  };
  t: TFunction;
}

export interface UseJurisdictionReturn {
  changeJurisdiction: (code: JurisdictionCode) => void;
  currency: string;
  jurisdiction: JurisdictionConfig;
  legalSystem: string;
  supportedLanguages: LanguageCode[];
  tier: 1 | 2;
}

export interface UseLegalTermReturn {
  getDefinition: (key: string) => string | undefined;
  getReference: (key: string) => string | undefined;
  getTerm: (key: string) => string;
  searchTerms: (
    query: string,
    category?: LegalTermCategory
  ) => Array<{
    definition?: string;
    key: string;
    term: string;
  }>;
}
