
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

// Export Sofia AI services
export * from './services/sofia';

export * from './services/stripe.service';
export * from './services/subscription.service';

// Export types
export type {
  BillingCycle,
  SubscriptionLimits,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageType,
  UserSubscription,
  UserUsage,
} from './services/subscription.service';

export * from './services/sync.service';

export type {
  SyncConflictResolution,
  SyncStatus,
} from './services/sync.service';

// Export Sofia AI types
export * from './types/sofia';

// Export Supabase client
export * from './supabase/client';
