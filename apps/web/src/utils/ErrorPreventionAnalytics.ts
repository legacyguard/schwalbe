/**
 * ErrorPreventionAnalytics - Advanced analytics for error prevention and recovery systems
 *
 * Features:
 * - Comprehensive tracking of prevention strategy effectiveness
 * - Recovery sequence analytics and success metrics
 * - User behavior pattern analysis for proactive prevention
 * - Emotional impact tracking and correlation analysis
 * - Performance metrics for prevention and recovery systems
 * - Predictive analytics for error likelihood
 */

import { 
  ErrorContext, 
  PreventionStrategy, 
  ErrorPreventionSequence,
  PreventionAnalyticsEvent,
  PreventionMetrics,
  RecoveryAnalytics,
  PredictiveAnalytics
} from '../types/ErrorPrevention';

// Interfaces are now imported from shared types file

export class ErrorPreventionAnalytics {
  private events: PreventionAnalyticsEvent[] = [];
  private metrics!: PreventionMetrics;
  private recoveryAnalytics!: RecoveryAnalytics;
  private predictiveAnalytics!: PredictiveAnalytics;
  private analyticsEndpoint: string;

  constructor(endpoint: string = '/api/analytics/error-prevention') {
    this.analyticsEndpoint = endpoint;
    this.initializeMetrics();
    this.initializeRecoveryAnalytics();
    this.initializePredictiveAnalytics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalPreventionAttempts: 0,
      successfulPreventions: 0,
      failedPreventions: 0,
      averagePreventionTime: 0,
      preventionSuccessRate: 0,
      contextSpecificSuccessRates: {},
      userExpertiseImpact: {},
      emotionalStateCorrelation: {},
      mostEffectiveStrategies: [],
      commonFailurePatterns: []
    };
  }

  private initializeRecoveryAnalytics(): void {
    this.recoveryAnalytics = {
      totalRecoverySequences: 0,
      successfulRecoveries: 0,
      averageRecoveryTime: 0,
      recoverySuccessRate: 0,
      stepCompletionRates: {},
      abandonmentRate: 0,
      userSatisfactionScores: [],
      mostEffectiveRecoverySteps: []
    };
  }

  private initializePredictiveAnalytics(): void {
    this.predictiveAnalytics = {
      errorLikelihoodScores: {},
      preventionOpportunityScores: {},
      userRiskProfiles: {},
      contextualRiskFactors: {},
      recommendedStrategies: {}
    };
  }

  // Track prevention analysis
  trackPreventionAnalysis(context: ErrorContext, result: {
    strategies: PreventionStrategy[];
    confidence: number;
    priority: 'low' | 'medium' | 'high';
  }): void {
    const event: PreventionAnalyticsEvent = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'prevention_analysis',
      context,
      success: result.strategies.length > 0,
      userEmotionalState: context.emotionalImpact,
      userExpertise: context.userExpertise,
      metadata: {
        strategyCount: result.strategies.length,
        confidence: result.confidence,
        priority: result.priority
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track prevention strategy application
  trackPreventionSuccess(strategyId: string, context: ErrorContext): void {
    const event: PreventionAnalyticsEvent = {
      id: `prevention-success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'prevention_success',
      context,
      strategy: { id: strategyId } as PreventionStrategy,
      success: true,
      userEmotionalState: context.emotionalImpact,
      userExpertise: context.userExpertise,
      metadata: { strategyId }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track prevention failure
  trackPreventionFailure(strategyId: string, context: ErrorContext): void {
    const event: PreventionAnalyticsEvent = {
      id: `prevention-failure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'prevention_failure',
      context,
      strategy: { id: strategyId } as PreventionStrategy,
      success: false,
      userEmotionalState: context.emotionalImpact,
      userExpertise: context.userExpertise,
      metadata: { strategyId }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track recovery step completion
  trackRecoveryStepSuccess(stepId: string, context: ErrorContext): void {
    const event: PreventionAnalyticsEvent = {
      id: `recovery-step-success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'recovery_step_completed',
      context,
      stepId,
      success: true,
      userEmotionalState: context.emotionalImpact,
      userExpertise: context.userExpertise,
      metadata: { stepId }
    };

    this.events.push(event);
    this.updateRecoveryAnalytics(event);
    this.sendToAnalytics(event);
  }

  // Track recovery step failure
  trackRecoveryStepFailure(stepId: string, context: ErrorContext): void {
    const event: PreventionAnalyticsEvent = {
      id: `recovery-step-failure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'recovery_step_completed',
      context,
      stepId,
      success: false,
      userEmotionalState: context.emotionalImpact,
      userExpertise: context.userExpertise,
      metadata: { stepId }
    };

    this.events.push(event);
    this.updateRecoveryAnalytics(event);
    this.sendToAnalytics(event);
  }

  // Update prevention metrics
  private updateMetrics(event: PreventionAnalyticsEvent): void {
    switch (event.type) {
      case 'prevention_analysis':
        this.metrics.totalPreventionAttempts++;
        break;
      case 'prevention_success':
        this.metrics.successfulPreventions++;
        break;
      case 'prevention_failure':
        this.metrics.failedPreventions++;
        break;
    }

    // Update success rate
    this.metrics.preventionSuccessRate =
      this.metrics.totalPreventionAttempts > 0
        ? this.metrics.successfulPreventions / this.metrics.totalPreventionAttempts
        : 0;

    // Update context-specific success rates
    if (!this.metrics.contextSpecificSuccessRates[event.context.type]) {
      this.metrics.contextSpecificSuccessRates[event.context.type] = 0;
    }

    // Update user expertise impact
    if (!this.metrics.userExpertiseImpact[event.userExpertise]) {
      this.metrics.userExpertiseImpact[event.userExpertise] = 0;
    }

    // Update emotional state correlation
    if (!this.metrics.emotionalStateCorrelation[event.userEmotionalState]) {
      this.metrics.emotionalStateCorrelation[event.userEmotionalState] = 0;
    }

    this.updateMostEffectiveStrategies();
    this.updateCommonFailurePatterns();
  }

  // Update recovery analytics
  private updateRecoveryAnalytics(event: PreventionAnalyticsEvent): void {
    if (event.type === 'recovery_step_completed') {
      // Update step completion rates
      if (!this.recoveryAnalytics.stepCompletionRates[event.stepId!]) {
        this.recoveryAnalytics.stepCompletionRates[event.stepId!] = 0;
      }

      // Update most effective recovery steps
      this.updateMostEffectiveRecoverySteps();
    }
  }

  // Update most effective strategies
  private updateMostEffectiveStrategies(): void {
    const strategyStats = new Map<string, { successes: number; total: number }>();

    this.events.forEach(event => {
      if (event.strategy && event.type.includes('prevention')) {
        const id = event.strategy.id;
        const current = strategyStats.get(id) || { successes: 0, total: 0 };

        current.total++;
        if (event.success) {
          current.successes++;
        }

        strategyStats.set(id, current);
      }
    });

    this.metrics.mostEffectiveStrategies = Array.from(strategyStats.entries())
      .map(([strategyId, stats]) => ({
        strategyId,
        successRate: stats.total > 0 ? stats.successes / stats.total : 0,
        usageCount: stats.total
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }

  // Update common failure patterns
  private updateCommonFailurePatterns(): void {
    const contextFailures = new Map<string, { failures: number; total: number }>();

    this.events.forEach(event => {
      if (event.type === 'prevention_failure') {
        const contextType = event.context.type;
        const current = contextFailures.get(contextType) || { failures: 0, total: 0 };

        current.total++;
        current.failures++;

        contextFailures.set(contextType, current);
      }
    });

    this.metrics.commonFailurePatterns = Array.from(contextFailures.entries())
      .map(([contextType, stats]) => ({
        contextType,
        failureRate: stats.total > 0 ? stats.failures / stats.total : 0,
        commonReasons: this.analyzeFailureReasons(contextType)
      }))
      .sort((a, b) => b.failureRate - a.failureRate);
  }

  // Update most effective recovery steps
  private updateMostEffectiveRecoverySteps(): void {
    const stepStats = new Map<string, { successes: number; total: number; totalTime: number }>();

    this.events.forEach(event => {
      if (event.stepId && event.type === 'recovery_step_completed') {
        const id = event.stepId;
        const current = stepStats.get(id) || { successes: 0, total: 0, totalTime: 0 };

        current.total++;
        if (event.success) {
          current.successes++;
        }

        stepStats.set(id, current);
      }
    });

    this.recoveryAnalytics.mostEffectiveRecoverySteps = Array.from(stepStats.entries())
      .map(([stepId, stats]) => ({
        stepId,
        successRate: stats.total > 0 ? stats.successes / stats.total : 0,
        averageTime: stats.totalTime / stats.total
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }

  // Analyze failure reasons for a context type
  private analyzeFailureReasons(contextType: string): string[] {
    // This would analyze the metadata and context to determine common failure reasons
    const commonReasons: Record<string, string[]> = {
      'validation': ['Invalid input format', 'Missing required fields', 'Data type mismatch'],
      'network': ['Connection timeout', 'Server unavailable', 'DNS resolution failure'],
      'permission': ['Access denied', 'Insufficient privileges', 'Feature not available'],
      'data': ['Invalid data format', 'Missing dependencies', 'Corrupted data'],
      'user_input': ['Unclear instructions', 'Complex interface', 'Missing guidance'],
      'system': ['Resource exhaustion', 'Service unavailable', 'Configuration error'],
      'timeout': ['Slow response', 'Heavy load', 'Network latency']
    };

    return commonReasons[contextType] || ['Unknown failure reason'];
  }

  // Get current metrics
  getMetrics(): PreventionMetrics {
    return { ...this.metrics };
  }

  // Get recovery analytics
  getRecoveryAnalytics(): RecoveryAnalytics {
    return { ...this.recoveryAnalytics };
  }

  // Get predictive analytics
  getPredictiveAnalytics(): PredictiveAnalytics {
    return { ...this.predictiveAnalytics };
  }

  // Calculate error likelihood for a context
  calculateErrorLikelihood(context: ErrorContext): number {
    const baseLikelihood = 0.1; // 10% base error rate

    // Adjust based on context type
    const contextMultipliers: Record<string, number> = {
      'validation': 0.3,
      'network': 0.2,
      'permission': 0.15,
      'data': 0.25,
      'user_input': 0.4,
      'system': 0.1,
      'timeout': 0.2
    };

    // Adjust based on user expertise
    const expertiseMultipliers: Record<string, number> = {
      'beginner': 2.0,
      'intermediate': 1.0,
      'advanced': 0.5,
      'expert': 0.3
    };

    // Adjust based on emotional state
    const emotionalMultipliers: Record<string, number> = {
      'frustration': 1.5,
      'confusion': 1.8,
      'anxiety': 1.3,
      'disappointment': 1.2,
      'anger': 2.0
    };

    const contextMultiplier = contextMultipliers[context.type] || 1.0;
    const expertiseMultiplier = expertiseMultipliers[context.userExpertise] || 1.0;
    const emotionalMultiplier = emotionalMultipliers[context.emotionalImpact] || 1.0;

    return Math.min(baseLikelihood * contextMultiplier * expertiseMultiplier * emotionalMultiplier, 1.0);
  }

  // Get recommended prevention strategies for a context
  getRecommendedStrategies(context: ErrorContext): string[] {
    const recommendations = this.predictiveAnalytics.recommendedStrategies[context.type] || [];

    // If no specific recommendations, return general strategies
    if (recommendations.length === 0) {
      return ['input-validation', 'user-guidance', 'error-recovery'];
    }

    return recommendations;
  }

  // Send analytics to endpoint
  private async sendToAnalytics(event: PreventionAnalyticsEvent): Promise<void> {
    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Export analytics data
  exportData(): {
    events: PreventionAnalyticsEvent[];
    metrics: PreventionMetrics;
    recoveryAnalytics: RecoveryAnalytics;
    predictiveAnalytics: PredictiveAnalytics;
  } {
    return {
      events: [...this.events],
      metrics: this.getMetrics(),
      recoveryAnalytics: this.getRecoveryAnalytics(),
      predictiveAnalytics: this.getPredictiveAnalytics()
    };
  }

  // Clear analytics data
  clearData(): void {
    this.events = [];
    this.initializeMetrics();
    this.initializeRecoveryAnalytics();
    this.initializePredictiveAnalytics();
  }
}

export default ErrorPreventionAnalytics;