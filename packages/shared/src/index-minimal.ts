// Minimal exports for Dead Man Switch functionality
// Emergency system types and services

export { EmergencyService } from './services/emergency.service';
export * from './types/emergency';
export * from './supabase/client';

// Minimal config exports helpful for UI wiring
export * from './config/billing';

// i18n utilities (re-exported from logic to maintain compatibility)
export * from '@schwalbe/logic/i18n/domains';
export * from '@schwalbe/logic/i18n/languages';

// Reminders (exposed for web UI)
export * from './services/reminders/reminder.service';

// Subscriptions (exposed for web UI)
export * from './services/subscription.service';

// Sharing service (exposed for web UI)
export { sharingService, SharingService } from './services/sharing/sharing.service';
export type { CreateShareLinkInput, SharePermissions } from './services/sharing/sharing.service';
export type { ShareLink } from './types/sharing';

// Logger (needed for error handling)
export { logger } from './lib/logger';

// Authentication store (needed for web auth)
export { useAuthStore } from './stores/authStore';

// Onboarding service (needed for onboarding functionality)
export { OnboardingService } from './services/onboarding/onboarding.service';

// Will services (needed for will functionality)
export { willService } from './services/will.service';
// Will validation service moved to @schwalbe/logic package
export { willGuardianIntegration } from './services/willGuardianIntegration.service';

// Will types (needed for will functionality)
export type {
  WillUserData,
  BeneficiaryInfo,
  ExecutorInfo,
  GuardianshipInfo,
  AssetInfo,
  PersonalInfo,
  FamilyInfo,
  WillValidationResult,
  WillTemplate,
  WillJurisdictionConfig,
  ValidationError,
  Jurisdiction,
  WillLanguage,
  WillStatus
} from './types/will';
