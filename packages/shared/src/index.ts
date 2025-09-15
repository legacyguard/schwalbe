
// Export all services
export * from './services/auth.service';
export { DocumentService } from './services/documentService';
export type { Document } from './services/documentService';
export * from './services/encryption.service';
export * from './services/freemium.service';
export type {
  FreemiumFeature,
  FreemiumLimits,
  FreemiumPlan,
} from './services/freemium.service';

// Export Emergency services
export { EmergencyService } from './services/emergency.service';

// Export Emergency types
export * from './types/emergency';

// Export Animation types - Firefly, physics, and personality-aware animation interfaces
export * from './types/animations';

// Export Supabase client
export * from './supabase/client';

// Export domain + language config
export * from './config/domains';
export * from './config/languages';
export { getLanguageLabel, LANGUAGE_LABELS_EN } from './config/languages';
