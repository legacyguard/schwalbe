
import { supabase } from '../supabase/client';

export type SubscriptionPlan = 'essential' | 'family' | 'free' | 'premium';
export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'inactive'
  | 'past_due'
  | 'trialing';
export type BillingCycle = 'month' | 'year';

export interface UserSubscription {
  billing_cycle: BillingCycle;
  cancelled_at?: string;
  created_at: string;
  expires_at?: string;
  id: string;
  plan: SubscriptionPlan;
  started_at?: string;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  updated_at: string;
  user_id: string;
  // New metadata for cost view and renewal
  price_amount_cents?: number | null;
  price_currency?: string | null;
  auto_renew?: boolean | null;
  renew_url?: string | null;
}

export interface UserUsage {
  created_at: string;
  document_count: number;
  id: string;
  last_reset_date: string;
  offline_document_count: number;
  scans_this_month: number;
  storage_used_mb: number;
  time_capsule_count: number;
  updated_at: string;
  user_id: string;
}

export interface SubscriptionLimits {
  advanced_search: boolean;
  ai_features: boolean;
  max_documents: null | number;
  max_family_members: number;
  max_scans_per_month: null | number;
  max_storage_mb: null | number;
  max_time_capsules: null | number;
  offline_access: boolean;
  plan: SubscriptionPlan;
  priority_support: boolean;
}

export interface SubscriptionPreferences {
  user_id: string;
  days_before_primary: number; // default 7
  days_before_secondary: number; // default 1
  channels: ('email' | 'in_app')[];
  created_at?: string;
  updated_at?: string;
}

export type UsageType = 'documents' | 'scans' | 'storage' | 'time_capsules';

class SubscriptionService {
  /**
   * Get current plan for a given user (or current user if not specified)
   */
  async getPlan(userId?: string): Promise<SubscriptionPlan> {
    let uid = userId
    if (!uid) {
      const { data: auth } = await supabase.auth.getUser()
      uid = auth.user?.id ?? undefined
    }
    if (!uid) return 'free'
    const { data } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', uid)
      .maybeSingle()
    return ((data as any)?.plan as SubscriptionPlan) ?? 'free'
  }

  /**
   * Check entitlement for a feature
   * Minimal gate: free => no paid features; paid (essential/family/premium) => allowed
   */
  async hasEntitlement(
    feature: 'ocr' | 'share' | 'export',
    userId?: string
  ): Promise<boolean> {
    const plan = await this.getPlan(userId)
    if (plan === 'free') return false
    // MVP: all paid plans have all three features
    return ['ocr', 'share', 'export'].includes(feature)
  }

  /**
   * Get subscription preferences for current user
   */
  async getPreferences(): Promise<SubscriptionPreferences | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('subscription_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error) {
      console.error('Error fetching subscription prefs:', error);
      return null;
    }
    // Normalize channels to array of strings
    const normalized = data
      ? {
          ...data,
          channels: Array.isArray((data as any).channels)
            ? ((data as any).channels as string[])
            : JSON.parse(((data as any).channels as unknown as string) || '[]'),
        }
      : null;
    return normalized as any;
  }

  /**
   * Update subscription preferences for current user
   */
  async updatePreferences(patch: Partial<Omit<SubscriptionPreferences, 'user_id'>>): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const payload: any = { ...patch };
    if (payload.channels) {
      // Ensure JSONB array is persisted correctly
      payload.channels = [...payload.channels];
    }

    const { error } = await supabase
      .from('subscription_preferences')
      .upsert({ user_id: user.id, ...payload })
      .select('user_id')
      .single();
    if (error) {
      console.error('Error updating subscription prefs:', error);
      return false;
    }
    return true;
  }
  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<null | UserSubscription> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  }

  /**
   * Get current user's usage statistics
   */
  async getCurrentUsage(): Promise<null | UserUsage> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching usage:', error);
      return null;
    }

    return data;
  }

  /**
   * Get subscription limits for a specific plan
   */
  async getPlanLimits(
    plan: SubscriptionPlan
  ): Promise<null | SubscriptionLimits> {
    const { data, error } = await supabase
      .from('subscription_limits')
      .select('*')
      .eq('plan', plan)
      .single();

    if (error) {
      console.error('Error fetching plan limits:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all available subscription plans
   */
  async getAllPlans(): Promise<SubscriptionLimits[]> {
    const { data, error } = await supabase
      .from('subscription_limits')
      .select('*')
      .order('plan');

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if user can perform an action based on their usage limits
   */
  async checkUsageLimit(
    usageType: UsageType,
    increment: number = 1
  ): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: user.id,
      p_limit_type: usageType,
      p_increment: increment,
    });

    if (error) {
      console.error('Error checking usage limit:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(
    usageType: UsageType,
    amount: number = 1
  ): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_usage_type: usageType,
      p_amount: amount,
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(feature: keyof SubscriptionLimits): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return false;

    const limits = await this.getPlanLimits(subscription.plan);
    if (!limits) return false;

    return !!limits[feature];
  }

  /**
   * Get usage percentage for a specific metric
   */
  async getUsagePercentage(usageType: UsageType): Promise<number> {
    const [subscription, usage] = await Promise.all([
      this.getCurrentSubscription(),
      this.getCurrentUsage(),
    ]);

    if (!subscription || !usage) return 0;

    const limits = await this.getPlanLimits(subscription.plan);
    if (!limits) return 0;

    let current = 0;
    let max = 0;

    switch (usageType) {
      case 'documents':
        current = usage.document_count;
        max = limits.max_documents || Infinity;
        break;
      case 'storage':
        current = usage.storage_used_mb;
        max = limits.max_storage_mb || Infinity;
        break;
      case 'time_capsules':
        current = usage.time_capsule_count;
        max = limits.max_time_capsules || Infinity;
        break;
      case 'scans':
        current = usage.scans_this_month;
        max = limits.max_scans_per_month || Infinity;
        break;
    }

    if (max === Infinity) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  /**
   * Check if user needs to upgrade to access a feature
   */
  async needsUpgrade(requiredPlan: SubscriptionPlan): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return true;

    const planHierarchy: Record<SubscriptionPlan, number> = {
      free: 0,
      essential: 1,
      family: 2,
      premium: 3,
    };

    return planHierarchy[subscription.plan] < planHierarchy[requiredPlan];
  }

  /**
   * Format storage size for display
   */
  formatStorageSize(mb: number): string {
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${(mb / 1024).toFixed(1)} GB`;
  }

  /**
   * Get days remaining in subscription
   */
  async getDaysRemaining(): Promise<null | number> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription || !subscription.expires_at) return null;

    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  async isExpiringSoon(): Promise<boolean> {
    const daysRemaining = await this.getDaysRemaining();
    return daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  }
}

export const subscriptionService = new SubscriptionService();
