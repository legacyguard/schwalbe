/**
 * Freemium Manager Service
 * Manages usage limits, tracking, and upgrade flows
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UsageLimits {
  documents: { current: number; limit: number };
  offlineDocuments: { current: number; limit: number };
  scannerUsage: { current: number; limit: number }; // Scans per month
  storage: { current: number; limit: number }; // MB
  timeCapsules: { current: number; limit: number };
}

export interface UserPlan {
  billing_cycle?: 'monthly' | 'yearly';
  expires_at?: string;
  plan: 'essential' | 'family' | 'free' | 'premium';
  started_at: string;
}

export interface FeatureAccess {
  feature: string;
  hasAccess: boolean;
  requiredPlan?: 'essential' | 'family' | 'premium';
  upgradeUrl?: string;
}

export class FreemiumManager {
  private supabase: SupabaseClient;
  private userId: null | string = null;
  private userPlan: null | UserPlan = null;
  private cachedLimits: null | UsageLimits = null;
  private lastLimitCheck: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly WEB_BASE_URL = 'https://legacyguard.sk';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.loadCachedData();
  }

  /**
   * Initialize for a specific user
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.fetchUserPlan();
    await this.checkLimits();
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData() {
    try {
      const cachedPlan = await AsyncStorage.getItem('user_plan');
      const cachedLimits = await AsyncStorage.getItem('usage_limits');

      if (cachedPlan) this.userPlan = JSON.parse(cachedPlan);
      if (cachedLimits) this.cachedLimits = JSON.parse(cachedLimits);
    } catch (error) {
      console.error('FreemiumManager: Error loading cached data', error);
    }
  }

  /**
   * Fetch user plan from database
   */
  private async fetchUserPlan(): Promise<void> {
    if (!this.userId) return;

    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!error && data) {
      this.userPlan = {
        plan: data.plan,
        billing_cycle: data.billing_cycle,
        started_at: data.started_at,
        expires_at: data.expires_at,
      };
      await AsyncStorage.setItem('user_plan', JSON.stringify(this.userPlan));
    } else {
      // Default to free plan
      this.userPlan = {
        plan: 'free',
        started_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Check current usage limits
   */
  async checkLimits(forceRefresh = false): Promise<UsageLimits> {
    // Return cached if valid
    if (!forceRefresh && this.cachedLimits && this.lastLimitCheck) {
      const cacheAge = Date.now() - this.lastLimitCheck.getTime();
      if (cacheAge < this.CACHE_DURATION) {
        return this.cachedLimits;
      }
    }

    if (!this.userId) {
      throw new Error('User ID not initialized');
    }

    const { data: usage, error } = await this.supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      console.error('FreemiumManager: Error fetching usage', error);
      // Return default limits for free plan
      return this.getDefaultLimits();
    }

    const limits = this.calculateLimits(usage);
    this.cachedLimits = limits;
    this.lastLimitCheck = new Date();

    await AsyncStorage.setItem('usage_limits', JSON.stringify(limits));

    return limits;
  }

  /**
   * Calculate limits based on plan
   */
  private calculateLimits(usage: {
    document_count?: number;
    offline_document_count?: number;
    scans_this_month?: number;
    storage_used_mb?: number;
    time_capsule_count?: number;
  }): UsageLimits {
    const plan = this.userPlan?.plan || 'free';
    const planLimits = this.getPlanLimits(plan);

    return {
      documents: {
        current: usage?.document_count ?? 0,
        limit: planLimits.documents,
      },
      storage: {
        current: usage?.storage_used_mb ?? 0,
        limit: planLimits.storage,
      },
      timeCapsules: {
        current: usage?.time_capsule_count ?? 0,
        limit: planLimits.timeCapsules,
      },
      scannerUsage: {
        current: usage?.scans_this_month ?? 0,
        limit: planLimits.scannerUsage,
      },
      offlineDocuments: {
        current: usage?.offline_document_count ?? 0,
        limit: planLimits.offlineDocuments,
      },
    };
  }

  /**
   * Get plan-specific limits
   */
  private getPlanLimits(plan: UserPlan['plan']): {
    documents: number;
    offlineDocuments: number;
    scannerUsage: number;
    storage: number;
    timeCapsules: number;
  } {
    const limits: Record<
      UserPlan['plan'],
      {
        documents: number;
        offlineDocuments: number;
        scannerUsage: number;
        storage: number;
        timeCapsules: number;
      }
    > = {
      free: {
        documents: 10,
        storage: 100,
        timeCapsules: 3,
        scannerUsage: 5,
        offlineDocuments: 5,
      },
      essential: {
        documents: 100,
        storage: 1000,
        timeCapsules: 10,
        scannerUsage: 50,
        offlineDocuments: 25,
      },
      family: {
        documents: 500,
        storage: 5000,
        timeCapsules: 50,
        scannerUsage: 200,
        offlineDocuments: 100,
      },
      premium: {
        documents: Number.POSITIVE_INFINITY,
        storage: Number.POSITIVE_INFINITY,
        timeCapsules: Number.POSITIVE_INFINITY,
        scannerUsage: Number.POSITIVE_INFINITY,
        offlineDocuments: Number.POSITIVE_INFINITY,
      },
    };

    return limits[plan] ?? limits.free;
  }

  /**
   * Get default limits for offline/error scenarios
   */
  private getDefaultLimits(): UsageLimits {
    const planLimits = this.getPlanLimits(this.userPlan?.plan || 'free');
    return {
      documents: { current: 0, limit: planLimits.documents },
      storage: { current: 0, limit: planLimits.storage },
      timeCapsules: { current: 0, limit: planLimits.timeCapsules },
      scannerUsage: { current: 0, limit: planLimits.scannerUsage },
      offlineDocuments: { current: 0, limit: planLimits.offlineDocuments },
    };
  }

  /**
   * Check if user can perform an action
   */
  async canPerformAction(
    action:
      | 'create_capsule'
      | 'offline_save'
      | 'scan_document'
      | 'upload_document'
  ): Promise<boolean> {
    const limits = await this.checkLimits();

    switch (action) {
      case 'upload_document':
        return limits.documents.current < limits.documents.limit;
      case 'scan_document':
        return limits.scannerUsage.current < limits.scannerUsage.limit;
      case 'create_capsule':
        return limits.timeCapsules.current < limits.timeCapsules.limit;
      case 'offline_save':
        return limits.offlineDocuments.current < limits.offlineDocuments.limit;
      default:
        return false;
    }
  }

  /**
   * Check feature access
   */
  checkFeatureAccess(feature: string): FeatureAccess {
    const currentPlan = this.userPlan?.plan || 'free';

    const featureRequirements: Record<string, string> = {
      advanced_ocr: 'essential',
      family_sharing: 'family',
      unlimited_storage: 'premium',
      legal_templates: 'essential',
      will_generator: 'family',
      emergency_access: 'family',
      api_access: 'premium',
    };

    const requiredPlan = featureRequirements[feature];

    if (
      !requiredPlan ||
      this.isPlanSufficient(currentPlan, requiredPlan as any)
    ) {
      return {
        feature,
        hasAccess: true,
      };
    }

    return {
      feature,
      hasAccess: false,
      requiredPlan: requiredPlan as any,
      upgradeUrl: `${this.WEB_BASE_URL}/upgrade?feature=${feature}&from=mobile`,
    };
  }

  /**
   * Check if current plan is sufficient
   */
  private isPlanSufficient(currentPlan: string, requiredPlan: string): boolean {
    const planHierarchy = ['free', 'essential', 'family', 'premium'];
    const currentLevel = planHierarchy.indexOf(currentPlan);
    const requiredLevel = planHierarchy.indexOf(requiredPlan);
    return currentLevel >= requiredLevel;
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(
    type: 'capsules' | 'documents' | 'offline' | 'scans'
  ): Promise<void> {
    if (!this.userId) return;

    const columnMap: Record<string, string> = {
      documents: 'document_count',
      scans: 'scans_this_month',
      capsules: 'time_capsule_count',
      offline: 'offline_document_count',
    };

    const column = columnMap[type];
    if (!column) return;

    await this.supabase.rpc('increment_usage', {
      user_id: this.userId,
      column_name: column,
    });

    // Invalidate cache
    this.lastLimitCheck = null;
  }

  /**
   * Open upgrade flow
   */
  async openUpgradeFlow(feature?: string): Promise<void> {
    let url = `${this.WEB_BASE_URL}/upgrade?from=mobile`;

    if (feature) {
      url += `&feature=${feature}`;
    }

    if (this.userId) {
      url += `&user=${this.userId}`;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('FreemiumManager: Failed to open upgrade URL', error);
    }
  }

  /**
   * Get usage percentage for a specific limit
   */
  getUsagePercentage(limitType: keyof UsageLimits): number {
    if (!this.cachedLimits) return 0;

    const limit = this.cachedLimits[limitType];
    if (limit.limit === Infinity) return 0;

    return Math.min(100, Math.round((limit.current / limit.limit) * 100));
  }

  /**
   * Get upgrade benefits for next plan
   */
  getUpgradeBenefits(): string[] {
    const currentPlan = this.userPlan?.plan || 'free';

    const benefits: Record<string, string[]> = {
      free: [
        '100 documents (10x more)',
        '1GB storage (10x more)',
        'Advanced OCR scanning',
        '50 scans per month',
        'Email support',
      ],
      essential: [
        '500 documents (5x more)',
        '5GB storage (5x more)',
        'Family sharing features',
        'Will generator access',
        '200 scans per month',
        'Priority support',
      ],
      family: [
        'Unlimited everything',
        'API access',
        'Custom integrations',
        'White-label options',
        'Dedicated support',
      ],
    };

    return benefits[currentPlan] || [];
  }

  /**
   * Reset monthly usage counters
   */
  async resetMonthlyUsage(): Promise<void> {
    if (!this.userId) return;

    await this.supabase
      .from('user_usage')
      .update({ scans_this_month: 0 })
      .eq('user_id', this.userId);

    // Invalidate cache
    this.lastLimitCheck = null;
  }

  /**
   * Get current plan details
   */
  getCurrentPlan(): null | UserPlan {
    return this.userPlan;
  }

  /**
   * Check if user is on premium plan
   */
  isPremium(): boolean {
    return this.userPlan?.plan === 'premium';
  }

  /**
   * Check if user is on paid plan
   */
  isPaidPlan(): boolean {
    return this.userPlan?.plan !== 'free';
  }
}
