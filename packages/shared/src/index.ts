
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

// Export Reminder service
export * from './services/reminders/reminder.service';
// Export Reminder types
export type { ReminderPayload } from './types/reminders';
export type { ReminderRule as Reminder } from './services/reminders/reminder.service';
// Export Subscription service
export * from './services/subscription.service';

// Export monitoring/analytics
export { monitoringService } from './services/monitoring.service';

// Export domain + language config (re-exported from logic to maintain compatibility)
export * from '@schwalbe/logic/i18n/domains';
export * from '@schwalbe/logic/i18n/languages';

// Export billing config
export * from './config/billing';

// Export sharing service
export { sharingService, SharingService } from './services/sharing/sharing.service';

// Export legal requirements dataset (aliased to avoid conflicts)
export {
  type Jurisdiction as LegalJurisdiction,
  LEGAL_REQUIREMENTS,
  getLegalRequirements
} from './config/legal/requirements';

// Export sharing types
export type { CreateShareLinkInput, SharePermissions } from './services/sharing/sharing.service';
export type { ShareLink } from './types/sharing';

// Export unified error handling system (aliased to avoid conflicts)
export {
  AppError,
  ValidationError as AppValidationError,
  NetworkError,
  AuthError,
  BusinessError,
  createValidationError,
  createAuthError,
  createNetworkError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  getErrorMessage,
  getErrorCode,
  shouldRetry,
  getRetryDelay
} from './types/errors';

// Export authentication store
export { useAuthStore } from './stores/authStore';

// Export logger
export { logger } from './lib/logger';

// Export mobile-web bridge utilities
export * from './utils/mobile-web-bridge';

// Export API caching utilities
export * from './utils/api-cache';

// Export onboarding service
export { OnboardingService } from './services/onboarding/onboarding.service';

// Export will services
export { willService, WillService } from './services/will.service';
// Will validation service moved to @schwalbe/logic package
export { willGuardianIntegration, WillGuardianIntegrationService } from './services/willGuardianIntegration.service';

// Export will types (keeping will-specific types with their original names)
export * from './types/will';
