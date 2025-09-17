
/**
 * Freemium Service
 * Manages freemium features and limitations
 */

export type FreemiumFeature =
  | 'advanced_encryption'
  | 'ai_assistance'
  | 'basic_documents'
  | 'cloud_storage'
  | 'premium_templates'
  | 'team_collaboration';

export interface FreemiumPlan {
  features: FreemiumFeature[];
  id: string;
  limits: FreemiumLimits;
  name: string;
}

export interface FreemiumLimits {
  maxAIRequestsPerMonth: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxTeamMembers: number;
  maxTemplates: number;
}

export class FreemiumService {
  private static instance: FreemiumService;
  private currentPlan: FreemiumPlan;

  private constructor() {
    // Initialize with free plan
    this.currentPlan = this.getFreePlan();
  }

  static getInstance(): FreemiumService {
    if (!FreemiumService.instance) {
      FreemiumService.instance = new FreemiumService();
    }
    return FreemiumService.instance;
  }

  private getFreePlan(): FreemiumPlan {
    return {
      id: 'free',
      name: 'Free',
      features: ['basic_documents', 'cloud_storage'],
      limits: {
        maxDocuments: 10,
        maxStorageMB: 100,
        maxAIRequestsPerMonth: 10,
        maxTeamMembers: 1,
        maxTemplates: 3,
      },
    };
  }

  private getPremiumPlan(): FreemiumPlan {
    return {
      id: 'premium',
      name: 'Premium',
      features: [
        'basic_documents',
        'cloud_storage',
        'ai_assistance',
        'premium_templates',
        'advanced_encryption',
        'team_collaboration',
      ],
      limits: {
        maxDocuments: -1, // unlimited
        maxStorageMB: 10000,
        maxAIRequestsPerMonth: 1000,
        maxTeamMembers: 10,
        maxTemplates: -1, // unlimited
      },
    };
  }

  getCurrentPlan(): FreemiumPlan {
    return this.currentPlan;
  }

  hasFeature(feature: FreemiumFeature): boolean {
    return this.currentPlan.features.includes(feature);
  }

  checkLimit(limitType: keyof FreemiumLimits, currentUsage: number): boolean {
    const limit = this.currentPlan.limits[limitType];
    return limit === -1 || currentUsage < limit;
  }

  getRemainingQuota(
    limitType: keyof FreemiumLimits,
    currentUsage: number
  ): number {
    const limit = this.currentPlan.limits[limitType];
    if (limit === -1) return -1; // unlimited
    return Math.max(0, limit - currentUsage);
  }

  upgradeToPremium(): void {
    this.currentPlan = this.getPremiumPlan();
  }

  downgradeToFree(): void {
    this.currentPlan = this.getFreePlan();
  }
}

export const freemiumService = FreemiumService.getInstance();
