/**
 * Subscription Service Contract
 *
 * Defines the interface for subscription management operations.
 * Handles user subscriptions, usage tracking, and plan management.
 */

export type SubscriptionPlan = 'free' | 'essential' | 'family' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled' | 'trialing';
export type BillingCycle = 'month' | 'year';
export type UsageType = 'documents' | 'storage' | 'time_capsules' | 'scans';

export interface UserSubscription {
  /** Unique subscription identifier */
  id: string;
  /** User identifier */
  userId: string;
  /** Stripe customer identifier */
  stripeCustomerId?: string;
  /** Stripe subscription identifier */
  stripeSubscriptionId?: string;
  /** Current subscription plan */
  plan: SubscriptionPlan;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** Billing cycle */
  billing_cycle: BillingCycle;
  /** Subscription start date */
  started_at?: string;
  /** Subscription expiration date */
  expires_at?: string;
  /** Cancellation date */
  cancelled_at?: string;
  /** Last update timestamp */
  updated_at: string;
  /** Creation timestamp */
  created_at: string;
}

export interface UserUsage {
  /** Unique usage record identifier */
  id: string;
  /** User identifier */
  userId: string;
  /** Number of documents stored */
  document_count: number;
  /** Storage used in MB */
  storage_used_mb: number;
  /** Number of time capsules created */
  time_capsule_count: number;
  /** Scans performed this month */
  scans_this_month: number;
  /** Offline documents count */
  offline_document_count: number;
  /** Last reset date for monthly counters */
  last_reset_date: string;
  /** Last update timestamp */
  updated_at: string;
  /** Creation timestamp */
  created_at: string;
}

export interface SubscriptionLimits {
  /** Subscription plan */
  plan: SubscriptionPlan;
  /** Maximum number of documents (null = unlimited) */
  max_documents: number | null;
  /** Maximum storage in MB (null = unlimited) */
  max_storage_mb: number | null;
  /** Maximum time capsules (null = unlimited) */
  max_time_capsules: number | null;
  /** Maximum scans per month (null = unlimited) */
  max_scans_per_month: number | null;
  /** Maximum family members */
  max_family_members: number;
  /** Offline access allowed */
  offline_access: boolean;
  /** AI features access */
  ai_features: boolean;
  /** Advanced search access */
  advanced_search: boolean;
  /** Priority support access */
  priority_support: boolean;
}

export interface UsageCheckRequest {
  /** User identifier */
  userId: string;
  /** Type of usage to check */
  usageType: UsageType;
  /** Amount to check (default: 1) */
  increment?: number;
}

export interface UsageIncrementRequest {
  /** User identifier */
  userId: string;
  /** Type of usage to increment */
  usageType: UsageType;
  /** Amount to increment (default: 1) */
  amount?: number;
}

export interface PlanUpgradeRequest {
  /** User identifier */
  userId: string;
  /** New plan to upgrade to */
  newPlan: SubscriptionPlan;
  /** Proration behavior */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface SubscriptionServiceResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message (if any) */
  error?: string;
}

/**
 * Subscription Service Interface
 *
 * Defines the contract for subscription management operations
 */
export interface ISubscriptionService {
  /**
   * Get current user's subscription
   */
  getCurrentSubscription(userId: string): Promise<SubscriptionServiceResponse<UserSubscription | null>>;

  /**
   * Get current user's usage statistics
   */
  getCurrentUsage(userId: string): Promise<SubscriptionServiceResponse<UserUsage | null>>;

  /**
   * Get subscription limits for a specific plan
   */
  getPlanLimits(plan: SubscriptionPlan): Promise<SubscriptionServiceResponse<SubscriptionLimits | null>>;

  /**
   * Get all available subscription plans
   */
  getAllPlans(): Promise<SubscriptionServiceResponse<SubscriptionLimits[]>>;

  /**
   * Check if user can perform an action based on usage limits
   */
  checkUsageLimit(request: UsageCheckRequest): Promise<SubscriptionServiceResponse<boolean>>;

  /**
   * Increment usage counter
   */
  incrementUsage(request: UsageIncrementRequest): Promise<SubscriptionServiceResponse<boolean>>;

  /**
   * Check if user has access to a specific feature
   */
  hasFeatureAccess(userId: string, feature: keyof SubscriptionLimits): Promise<SubscriptionServiceResponse<boolean>>;

  /**
   * Get usage percentage for a specific metric
   */
  getUsagePercentage(userId: string, usageType: UsageType): Promise<SubscriptionServiceResponse<number>>;

  /**
   * Check if user needs to upgrade for a required plan
   */
  needsUpgrade(userId: string, requiredPlan: SubscriptionPlan): Promise<SubscriptionServiceResponse<boolean>>;

  /**
   * Get days remaining in current subscription
   */
  getDaysRemaining(userId: string): Promise<SubscriptionServiceResponse<number | null>>;

  /**
   * Check if subscription is expiring soon
   */
  isExpiringSoon(userId: string): Promise<SubscriptionServiceResponse<boolean>>;

  /**
   * Update subscription plan
   */
  updateSubscriptionPlan(request: PlanUpgradeRequest): Promise<SubscriptionServiceResponse<void>>;

  /**
   * Cancel user subscription
   */
  cancelSubscription(userId: string): Promise<SubscriptionServiceResponse<void>>;

  /**
   * Reactivate cancelled subscription
   */
  reactivateSubscription(userId: string): Promise<SubscriptionServiceResponse<void>>;

  /**
   * Get subscription analytics for user
   */
  getSubscriptionAnalytics(userId: string): Promise<SubscriptionServiceResponse<{
    currentPlan: SubscriptionPlan;
    usagePercentage: Record<UsageType, number>;
    daysRemaining: number | null;
    isExpiringSoon: boolean;
    nextBillingDate: string | null;
  }>>;
}

/**
 * Subscription Service Error Types
 */
export class SubscriptionServiceError extends Error {
  constructor(
    message: string,
    public code: 'USER_NOT_FOUND' | 'SUBSCRIPTION_NOT_FOUND' | 'USAGE_LIMIT_EXCEEDED' | 'INVALID_PLAN' | 'PAYMENT_REQUIRED',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SubscriptionServiceError';
  }
}

/**
 * Usage Limit Exceeded Error
 */
export class UsageLimitExceededError extends SubscriptionServiceError {
  constructor(
    usageType: UsageType,
    currentUsage: number,
    limit: number
  ) {
    super(
      `Usage limit exceeded for ${usageType}: ${currentUsage}/${limit}`,
      'USAGE_LIMIT_EXCEEDED',
      402 // Payment Required
    );
    this.name = 'UsageLimitExceededError';
  }
}

/**
 * Factory function type for creating subscription service instances
 */
export type SubscriptionServiceFactory = (config?: any) => ISubscriptionService;