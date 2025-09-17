import { logger } from './logger';

/**
 * A/B Testing System for Schwalbe
 * Tracks onboarding metrics and conversions
 */

interface OnboardingMetric {
  userId: string;
  step: string;
  action: 'started' | 'completed' | 'abandoned';
  timestamp: Date;
  timeSpent?: number;
}

interface ConversionEvent {
  userId: string;
  testId: string;
  event: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface ProfessionalReviewEvent {
  userId: string;
  action: 'button_viewed' | 'button_clicked' | 'flow_started' | 'flow_completed';
  trustScore?: number;
  timestamp: Date;
}

interface TrustScoreEvent {
  userId: string;
  action: 'viewed' | 'clicked' | 'tooltip_opened';
  score: number;
  timestamp: Date;
}

class ABTestingSystem {
  private onboardingMetrics: OnboardingMetric[] = [];
  private conversions: ConversionEvent[] = [];
  private professionalReviewEvents: ProfessionalReviewEvent[] = [];
  private trustScoreEvents: TrustScoreEvent[] = [];

  trackOnboardingMetric(
    userId: string,
    step: string,
    action: 'started' | 'completed' | 'abandoned',
    timeSpent?: number
  ) {
    const metric: OnboardingMetric = {
      userId,
      step,
      action,
      timestamp: new Date(),
      timeSpent,
    };

    this.onboardingMetrics.push(metric);
    
    // In a real implementation, this would send to an analytics service
    logger.info('Onboarding metric tracked:', metric);
  }

  trackConversion(
    userId: string,
    testId: string,
    event: string,
    value: number,
    metadata?: Record<string, any>
  ) {
    const conversion: ConversionEvent = {
      userId,
      testId,
      event,
      value,
      metadata,
      timestamp: new Date(),
    };

    this.conversions.push(conversion);
    
    // In a real implementation, this would send to an analytics service
    logger.info('Conversion tracked:', conversion);
  }

  trackProfessionalReviewConversion(
    userId: string,
    action: 'button_viewed' | 'button_clicked' | 'flow_started' | 'flow_completed',
    trustScore?: number
  ) {
    const event: ProfessionalReviewEvent = {
      userId,
      action,
      trustScore,
      timestamp: new Date(),
    };

    this.professionalReviewEvents.push(event);
    
    // In a real implementation, this would send to an analytics service
    logger.info('Professional review event tracked:', event);
  }

  trackTrustScoreInteraction(
    userId: string,
    action: 'viewed' | 'clicked' | 'tooltip_opened',
    score: number
  ) {
    const event: TrustScoreEvent = {
      userId,
      action,
      score,
      timestamp: new Date(),
    };

    this.trustScoreEvents.push(event);
    
    // In a real implementation, this would send to an analytics service
    logger.info('Trust score interaction tracked:', event);
  }

  // Get metrics for analysis
  getOnboardingMetrics(userId?: string): OnboardingMetric[] {
    if (userId) {
      return this.onboardingMetrics.filter(metric => metric.userId === userId);
    }
    return this.onboardingMetrics;
  }

  getConversions(testId?: string): ConversionEvent[] {
    if (testId) {
      return this.conversions.filter(conversion => conversion.testId === testId);
    }
    return this.conversions;
  }

  getProfessionalReviewEvents(userId?: string): ProfessionalReviewEvent[] {
    if (userId) {
      return this.professionalReviewEvents.filter(event => event.userId === userId);
    }
    return this.professionalReviewEvents;
  }

  getTrustScoreEvents(userId?: string): TrustScoreEvent[] {
    if (userId) {
      return this.trustScoreEvents.filter(event => event.userId === userId);
    }
    return this.trustScoreEvents;
  }
}

// Export singleton instance
export const abTestingSystem = new ABTestingSystem();