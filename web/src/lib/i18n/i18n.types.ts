
/**
 * i18n TypeScript Types and Helpers
 * Type-safe internationalization utilities
 */

import type { TFunction } from 'i18next';
import { type NAMESPACES, SUPPORTED_LANGUAGES } from './config';

// Language codes
export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Namespace types
export type CoreNamespace = typeof NAMESPACES.UI;
export type FeatureNamespace =
  | typeof NAMESPACES.CONTENT.familyShield
  | typeof NAMESPACES.CONTENT.wills;
export type WebNamespace = string;
export type MobileNamespace = string;
export type LegalNamespace = string;

export type AllNamespaces =
  | CoreNamespace
  | FeatureNamespace
  | LegalNamespace
  | MobileNamespace
  | WebNamespace;

// Translation key structure
export interface TranslationKeys {
  // Auth
  'auth.login': {
    apple: string;
    continueWith: string;
    createAccount: string;
    email: string;
    errors: {
      accountLocked: string;
      emailNotVerified: string;
      invalidCredentials: string;
      networkError: string;
      tooManyAttempts: string;
      userNotFound: string;
      wrongPassword: string;
    };
    facebook: string;
    forgotPassword: string;
    google: string;
    noAccount: string;
    or: string;
    password: string;
    rememberMe: string;
    signIn: string;
    signUp: string;
    subtitle: string;
    title: string;
  };

  // Common UI
  'common.ui': {
    button: {
      add: string;
      back: string;
      cancel: string;
      close: string;
      collapse: string;
      confirm: string;
      copy: string;
      delete: string;
      deselectAll: string;
      download: string;
      edit: string;
      expand: string;
      export: string;
      filter: string;
      finish: string;
      import: string;
      less: string;
      loading: string;
      more: string;
      next: string;
      print: string;
      refresh: string;
      remove: string;
      retry: string;
      save: string;
      search: string;
      select: string;
      selectAll: string;
      share: string;
      sort: string;
      submit: string;
      upload: string;
    };
    label: {
      account: string;
      address: string;
      category: string;
      city: string;
      country: string;
      date: string;
      description: string;
      email: string;
      filter: string;
      firstName: string;
      language: string;
      lastName: string;
      name: string;
      notes: string;
      notifications: string;
      optional: string;
      password: string;
      phone: string;
      preferences: string;
      privacy: string;
      profile: string;
      required: string;
      search: string;
      security: string;
      settings: string;
      sortBy: string;
      status: string;
      tags: string;
      theme: string;
      time: string;
      title: string;
      type: string;
      zipCode: string;
    };
    message: {
      areYouSure: string;
      confirmCancel: string;
      confirmDelete: string;
      copied: string;
      copying: string;
      created: string;
      creating: string;
      deleted: string;
      deleting: string;
      downloaded: string;
      downloading: string;
      error: string;
      info: string;
      loading: string;
      noData: string;
      noResults: string;
      processed: string;
      processing: string;
      saved: string;
      saving: string;
      sending: string;
      sent: string;
      success: string;
      unsavedChanges: string;
      updated: string;
      updating: string;
      uploaded: string;
      uploading: string;
      warning: string;
    };
    time: {
      ago: string;
      days: string;
      elapsed: string;
      hours: string;
      in: string;
      lastMonth: string;
      lastWeek: string;
      lastYear: string;
      minutes: string;
      months: string;
      nextMonth: string;
      nextWeek: string;
      nextYear: string;
      now: string;
      remaining: string;
      seconds: string;
      thisMonth: string;
      thisWeek: string;
      thisYear: string;
      today: string;
      tomorrow: string;
      weeks: string;
      years: string;
      yesterday: string;
    };
  };

  // Features - Vault
  'features.vault.categories': {
    all: string;
    cards: string;
    custom: string;
    documents: string;
    financial: string;
    identities: string;
    medical: string;
    notes: string;
    passwords: string;
    personal: string;
  };

  // Add more namespace definitions as needed...
}

// Type-safe translation function
export type TypedTFunction<NS extends AllNamespaces = AllNamespaces> =
  NS extends keyof TranslationKeys
    ? TFunction<NS, TranslationKeys[NS]>
    : TFunction;

// Translation interpolation values
export interface InterpolationValues {
  [key: string]: boolean | Date | null | number | string | undefined;
}

// Pluralization rules
export interface PluralizationRule {
  few?: string;
  many?: string;
  one: string;
  other: string;
  two?: string;
  zero?: string;
}

// Date formatting options
export interface DateFormatOptions {
  format?: 'full' | 'long' | 'medium' | 'short';
  relative?: boolean;
  timezone?: string;
}

// Number formatting options
export interface NumberFormatOptions {
  currency?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  style?: 'currency' | 'decimal' | 'percent';
  useGrouping?: boolean;
}

// Translation metadata
export interface TranslationMetadata {
  author?: string;
  context?: string;
  key: string;
  language: string;
  lastModified?: Date;
  maxLength?: number;
  namespace: string;
  reviewed?: boolean;
  tags?: string[];
}

// Helper class for type-safe translations
export class TranslationHelper {
  /**
   * Generate a type-safe translation key
   */
  static key<NS extends keyof TranslationKeys>(
    namespace: NS,
    ...keys: string[]
  ): string {
    return `${namespace}.${keys.join('.')}`;
  }

  /**
   * Check if a translation exists
   */
  static exists(): boolean {
    // Implementation would check i18n.exists
    // TODO: Implement with actual key and namespace checking
    return true; // Placeholder
  }

  /**
   * Format a date according to locale
   */
  static formatDate(
    date: Date | number | string,
    language: LanguageCode,
    options?: DateFormatOptions
  ): string {
    const d = date instanceof Date ? date : new Date(date);
    const locale = SUPPORTED_LANGUAGES[language].code;

    if (options?.relative) {
      return this.getRelativeTime(d, language);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {};

    switch (options?.format) {
      case 'short':
        formatOptions.dateStyle = 'short';
        break;
      case 'medium':
        formatOptions.dateStyle = 'medium';
        break;
      case 'long':
        formatOptions.dateStyle = 'long';
        break;
      case 'full':
        formatOptions.dateStyle = 'full';
        break;
      default:
        formatOptions.dateStyle = 'medium';
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(d);
  }

  /**
   * Format a number according to locale
   */
  static formatNumber(
    value: number,
    language: LanguageCode,
    options?: NumberFormatOptions
  ): string {
    const locale = SUPPORTED_LANGUAGES[language].code;
    const currency =
      options?.currency || SUPPORTED_LANGUAGES[language].currency;

    const formatOptions: Intl.NumberFormatOptions = {
      style: options?.style || 'decimal',
      currency: options?.style === 'currency' ? currency : undefined,
      minimumFractionDigits: options?.minimumFractionDigits,
      maximumFractionDigits: options?.maximumFractionDigits,
      useGrouping: options?.useGrouping ?? true,
    };

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  }

  /**
   * Get relative time string
   */
  private static getRelativeTime(date: Date, language: LanguageCode): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const rtf = new Intl.RelativeTimeFormat(
      SUPPORTED_LANGUAGES[language].code,
      {
        numeric: 'auto',
      }
    );

    if (Math.abs(diffInDays) >= 365) {
      return rtf.format(-Math.floor(diffInDays / 365), 'year');
    }
    if (Math.abs(diffInDays) >= 30) {
      return rtf.format(-Math.floor(diffInDays / 30), 'month');
    }
    if (Math.abs(diffInDays) >= 7) {
      return rtf.format(-Math.floor(diffInDays / 7), 'week');
    }
    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(-diffInDays, 'day');
    }
    if (Math.abs(diffInHours) >= 1) {
      return rtf.format(-diffInHours, 'hour');
    }
    if (Math.abs(diffInMinutes) >= 1) {
      return rtf.format(-diffInMinutes, 'minute');
    }

    return rtf.format(-diffInSeconds, 'second');
  }

  /**
   * Validate translation completeness
   */
  static validateTranslations(): { incomplete: string[]; missing: string[] } {
    const missing: string[] = [];
    const incomplete: string[] = [];

    // TODO: Implement actual validation with namespace and language parameters
    // Implementation would check actual translation files
    // This is a placeholder

    return { missing, incomplete };
  }

  /**
   * Generate translation statistics
   */
  static getStatistics(): {
    percentage: number;
    total: number;
    translated: number;
    untranslated: number;
  } {
    // Implementation would analyze actual translation files
    // This is a placeholder

    return {
      total: 100,
      translated: 85,
      untranslated: 15,
      percentage: 85,
    };
  }
}

// React hooks types
export interface UseTranslationResponse<
  NS extends AllNamespaces = AllNamespaces,
> {
  i18n: {
    changeLanguage: (lng: LanguageCode) => Promise<void>;
    isReady: boolean;
    language: LanguageCode;
    languages: LanguageCode[];
  };
  ready: boolean;
  t: TypedTFunction<NS>;
}

// Custom hook return types
export interface UseNamespaceLoadingState {
  error: Error | null;
  isLoaded: boolean;
  isLoading: boolean;
}

// Translation validation rules
export interface ValidationRule {
  customValidator?: (value: string) => boolean | string;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  required?: boolean;
}

// Translation context for components
export interface TranslationContext {
  fallbackLanguage: LanguageCode;
  language: LanguageCode;
  missingKeyHandler?: (key: string) => void;
  namespace: AllNamespaces;
}

export default TranslationHelper;
