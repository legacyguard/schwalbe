
/**
 * A/B Testing System for LegacyGuard
 * Tracks onboarding variations, conversion metrics, and feature effectiveness
 */

export type ABTestVariant = 'control' | 'variant_a' | 'variant_b' | 'variant_c';

export interface ABTestConfig {
  endDate?: string;
  isActive: boolean;
  startDate: string;
  testName: string;
  variants: {
    [key in ABTestVariant]?: {
      description: string;
      enabled: boolean;
      name: string;
      weight: number;
    };
  };
}

export interface ConversionMetric {
  metadata?: Record<string, any>;
  metric: string;
  sessionId: string;
  testName: string;
  timestamp: string;
  userId: string;
  value: number | string;
  variant: ABTestVariant;
}

export interface UserTestAssignment {
  assignments: Record<string, ABTestVariant>;
  createdAt: string;
  sessionId: string;
  userId: string;
}

class ABTestingSystem {
  private assignments: Map<string, Record<string, ABTestVariant>> = new Map();
  private metrics: ConversionMetric[] = [];
  private testConfigs: Map<string, ABTestConfig> = new Map();

  constructor() {
    this.initializeDefaultTests();
  }

  /**
   * Initialize default A/B tests
   */
  private initializeDefaultTests() {
    // Onboarding Flow Test
    this.testConfigs.set('onboarding_flow_v1', {
      testName: 'onboarding_flow_v1',
      variants: {
        control: {
          name: 'Current Onboarding',
          description: 'Original 4-step onboarding flow',
          weight: 50,
          enabled: true,
        },
        variant_a: {
          name: 'Emotion-First Onboarding',
          description: 'Starts with family impact messaging',
          weight: 50,
          enabled: true,
        },
      },
      isActive: true,
      startDate: new Date().toISOString(),
    });

    // Trust Score Display Test
    this.testConfigs.set('trust_score_display_v1', {
      testName: 'trust_score_display_v1',
      variants: {
        control: {
          name: 'No Trust Score',
          description: 'Standard dashboard without trust score',
          weight: 33,
          enabled: true,
        },
        variant_a: {
          name: 'Progress Ring',
          description: 'Trust score as circular progress indicator',
          weight: 33,
          enabled: true,
        },
        variant_b: {
          name: 'Badge Display',
          description: 'Trust score as prominent badge',
          weight: 34,
          enabled: true,
        },
      },
      isActive: true,
      startDate: new Date().toISOString(),
    });

    // Professional Review CTA Test
    this.testConfigs.set('professional_review_cta_v1', {
      testName: 'professional_review_cta_v1',
      variants: {
        control: {
          name: 'Standard Button',
          description: 'Simple "Request Review" button',
          weight: 25,
          enabled: true,
        },
        variant_a: {
          name: 'Trust Score Boost',
          description: 'Emphasizes trust score increase',
          weight: 25,
          enabled: true,
        },
        variant_b: {
          name: 'Family Protection',
          description: 'Emphasizes family protection benefits',
          weight: 25,
          enabled: true,
        },
        variant_c: {
          name: 'Urgency Frame',
          description: 'Emphasizes legal compliance urgency',
          weight: 25,
          enabled: true,
        },
      },
      isActive: true,
      startDate: new Date().toISOString(),
    });
  }

  /**
   * Get variant assignment for a user and test
   */
  getVariant(userId: string, testName: string): ABTestVariant {
    const userKey = userId || 'anonymous';

    // Get existing assignment
    if (this.assignments.has(userKey)) {
      const userAssignments = this.assignments.get(userKey)!;
      if (userAssignments[testName]) {
        return userAssignments[testName];
      }
    }

    // Create new assignment
    const variant = this.assignVariant(testName);

    // Store assignment
    const userAssignments = this.assignments.get(userKey) || {};
    userAssignments[testName] = variant;
    this.assignments.set(userKey, userAssignments);

    return variant;
  }

  /**
   * Assign variant based on test configuration
   */
  private assignVariant(testName: string): ABTestVariant {
    const config = this.testConfigs.get(testName);
    if (!config || !config.isActive) {
      return 'control';
    }

    const variants = Object.entries(config.variants).filter(
      ([_, variant]) => variant?.enabled
    );

    if (variants.length === 0) {
      return 'control';
    }

    // Weighted random selection
    const totalWeight = variants.reduce(
      (sum, [_, variant]) => sum + (variant?.weight || 0),
      0
    );
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const [variantKey, variant] of variants) {
      currentWeight += variant?.weight || 0;
      if (random <= currentWeight) {
        return variantKey as ABTestVariant;
      }
    }

    return 'control';
  }

  /**
   * Track conversion metric
   */
  trackConversion(
    userId: string,
    testName: string,
    metric: string,
    value: number | string,
    metadata?: Record<string, any>
  ): void {
    const variant = this.getVariant(userId, testName);
    const sessionId = this.getSessionId();

    const conversionMetric: ConversionMetric = {
      userId,
      sessionId,
      testName,
      variant,
      metric,
      value,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(conversionMetric);

    // In production, send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_name: testName,
        variant: variant,
        metric: metric,
        value: value,
        custom_parameters: metadata,
      });
    }
  }

  /**
   * Track key onboarding metrics
   */
  trackOnboardingMetric(
    userId: string,
    step: string,
    action: 'abandoned' | 'completed' | 'started',
    timeSpent?: number
  ): void {
    this.trackConversion(
      userId,
      'onboarding_flow_v1',
      `onboarding_${step}_${action}`,
      1,
      {
        step,
        action,
        timeSpent,
      }
    );
  }

  /**
   * Track trust score interaction
   */
  trackTrustScoreInteraction(
    userId: string,
    interaction: 'clicked' | 'tooltip_opened' | 'viewed',
    currentScore: number
  ): void {
    this.trackConversion(
      userId,
      'trust_score_display_v1',
      `trust_score_${interaction}`,
      1,
      {
        interaction,
        currentScore,
      }
    );
  }

  /**
   * Track professional review conversion
   */
  trackProfessionalReviewConversion(
    userId: string,
    action:
      | 'button_clicked'
      | 'button_viewed'
      | 'flow_completed'
      | 'flow_started',
    trustScore?: number
  ): void {
    this.trackConversion(
      userId,
      'professional_review_cta_v1',
      `professional_review_${action}`,
      1,
      {
        action,
        trustScore,
      }
    );
  }

  /**
   * Get session ID (or create one)
   */
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('ab_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('ab_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get test configuration
   */
  getTestConfig(testName: string): ABTestConfig | undefined {
    return this.testConfigs.get(testName);
  }

  /**
   * Get all metrics for a test
   */
  getTestMetrics(testName: string): ConversionMetric[] {
    return this.metrics.filter(metric => metric.testName === testName);
  }

  /**
   * Calculate conversion rates for a test
   */
  getConversionRates(testName: string): Record<ABTestVariant, any> {
    const testMetrics = this.getTestMetrics(testName);
    const results: Record<string, any> = {};

    // Group by variant
    const variantMetrics = testMetrics.reduce(
      (acc, metric) => {
        if (!acc[metric.variant]) {
          acc[metric.variant] = [];
        }
        acc[metric.variant].push(metric);
        return acc;
      },
      {} as Record<ABTestVariant, ConversionMetric[]>
    );

    // Calculate rates for each variant
    Object.entries(variantMetrics).forEach(([variant, metrics]) => {
      const uniqueUsers = new Set(metrics.map(m => m.userId)).size;
      const conversions = metrics.filter(
        m =>
          m.metric.includes('completed') ||
          m.metric.includes('flow_completed') ||
          m.metric.includes('button_clicked')
      ).length;

      results[variant] = {
        users: uniqueUsers,
        conversions,
        conversionRate: uniqueUsers > 0 ? (conversions / uniqueUsers) * 100 : 0,
        metrics: metrics.length,
      };
    });

    return results;
  }

  /**
   * Check if variant is winning (simple statistical significance approximation)
   */
  getWinningVariant(
    testName: string
  ): null | { confidence: number; variant: ABTestVariant } {
    const rates = this.getConversionRates(testName);
    const variants = Object.entries(rates);

    if (variants.length < 2) return null;

    // Simple winner detection based on conversion rate and sample size
    const sortedVariants = variants.sort(
      ([, a], [, b]) => b.conversionRate - a.conversionRate
    );
    const [winnerKey, winner] = sortedVariants[0];
    const [_runnerUpKey, runnerUp] = sortedVariants[1];

    // Basic confidence calculation (simplified)
    const sampleSizeThreshold = 100;
    const conversionDifference =
      winner.conversionRate - runnerUp.conversionRate;

    if (winner.users < sampleSizeThreshold) {
      return { variant: winnerKey as ABTestVariant, confidence: 0 };
    }

    const confidence = Math.min(95, Math.max(50, conversionDifference * 10));

    return { variant: winnerKey as ABTestVariant, confidence };
  }
}

// Singleton instance
export const abTestingSystem = new ABTestingSystem();

// React hook for easy integration
export function useABTest(testName: string, userId?: string) {
  const variant = abTestingSystem.getVariant(userId || 'anonymous', testName);

  const trackConversion = (
    metric: string,
    value: number | string,
    metadata?: Record<string, any>
  ) => {
    abTestingSystem.trackConversion(
      userId || 'anonymous',
      testName,
      metric,
      value,
      metadata
    );
  };

  return {
    variant,
    trackConversion,
    isVariant: (targetVariant: ABTestVariant) => variant === targetVariant,
  };
}
