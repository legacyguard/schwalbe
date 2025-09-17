
/**
 * i18n System for LegacyGuard
 * Main export file for internationalization
 */

// Core exports
export {
  getCurrentJurisdiction,
  getDefaultLanguage,
  getJurisdictionTranslation,
  getSupportedLanguages,
  default as i18n,
  loadLegalTranslations,
  NAMESPACES,
} from './config';
// Re-export hooks (will be created in separate file)
export {
  useJurisdiction,
  useLanguage,
  useLegalTerm,
  useTranslation,
} from './hooks';
// Enhanced hooks
export {
  getWillTranslation,
  useJurisdictionAwareTranslation,
  validateTranslationCompleteness
} from './jurisdiction-aware-hooks';
export {
  getAllJurisdictions,
  getJurisdictionByDomain,
  getJurisdictionsByLanguage,
  getJurisdictionsByTier,
  JURISDICTION_CONFIG,
} from './jurisdictions';

export type { JurisdictionConfig } from './jurisdictions';

export {
  formatCurrency,
  formatDate,
  formatNumber,
  getLanguageConfig,
  getLanguagesByScript,
  getRTLLanguages,
  LANGUAGE_CONFIG,
} from './languages';
export type { LanguageConfig } from './languages';
export {
  getLegalDefinition,
  getLegalReference,
  getLegalTerm,
  getLegalTermsByCategory,
  getRelatedLegalTerms,
  LEGAL_TERMS_DATABASE,
  LegalTermCategory,
  searchLegalTerms,
} from './legal-terminology';

export type { LegalTerm } from './legal-terminology';
// Type exports
export type {
  DeepPartial,
  ExtractNamespaceKeys,
  I18nConfig,
  JurisdictionCode,
  JurisdictionTranslationOverride,
  LanguageCode,
  TFunction,
  TranslationKeys,
  TranslationNamespace,
  TranslationOptions,
  TranslationResource,
  UseJurisdictionReturn,
  UseLegalTermReturn,
  UseTranslationReturn,
} from './types';

// Service exports
export { willTranslationService } from './will-translation-service';

export type { TranslationAvailability, WillTranslationConfig } from './will-translation-service';
