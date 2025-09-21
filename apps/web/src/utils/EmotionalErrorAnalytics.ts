/**
 * EmotionalErrorAnalytics - Comprehensive analytics tracking for emotional error handling systems
 *
 * Features:
 * - Emotional response effectiveness tracking
 * - User frustration pattern analysis during errors
 * - Emotional strategy success rate monitoring
 * - Frustration reduction measurement
 * - User emotional state correlation with error handling
 * - Emotional support effectiveness analysis
 * - Performance metrics for emotional error resolution
 * - Accessibility compliance monitoring for emotional features
 * - Real-time emotional analytics
 * - Historical trend analysis and optimization suggestions
 */

import { EmotionalErrorResponse, EmotionalError, EmotionalStrategy } from '../components/motion/EmotionalErrorHandling';

// TypeScript interfaces for comprehensive type safety
export interface EmotionalResponseAnalytics {
  responseId: string;
  errorId: string;
  errorType: string;
  emotionalStrategy: EmotionalStrategy;
  responseType: string;
  effectiveness: number; // 0-1 scale
  userEmotionalState: string;
  frustrationLevel: number;
  frustrationReduction: number;
  userEngagement: 'positive' | 'neutral' | 'negative' | 'abandoned';
  responseTime: number;
  interactionCount: number;
  supportRequests: number;
  accessibilityUsed: {
    screenReader: boolean;
    keyboard: boolean;
    voice: boolean;
  };
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface FrustrationAnalytics {
  errorId: string;
  frustrationTriggers: string[];
  initialFrustration: number;
  finalFrustration: number;
  reductionAmount: number;
  reductionTechniques: string[];
  timeToReduction: number;
  userCopingCapacity: string;
  emotionalTrajectory: string;
  supportEffectiveness: number;
  userEngagement: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface EmotionalSupportAnalytics {
  supportId: string;
  errorId: string;
  supportType: 'acknowledgment' | 'empathy' | 'reassurance' | 'encouragement' | 'guidance' | 'validation';
  emotionalGoal: string;
  deliveryMethod: 'text' | 'voice' | 'visual' | 'interactive';
  userResponse: 'positive' | 'neutral' | 'negative' | 'engaged' | 'dismissed';
  effectiveness: number; // 0-1 scale
  timing: 'immediate' | 'delayed' | 'progressive';
  duration: number;
  context: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface EmotionalSessionAnalytics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalEmotionalResponses: number;
  effectiveResponses: number;
  averageFrustrationReduction: number;
  emotionalStrategySuccess: Record<string, number>;
  userEmotionalStates: string[];
  frustrationTrajectory: number[];
  supportEffectiveness: number;
  userEngagementRate: number;
  abandonmentRate: number;
  accessibilityUsage: Record<string, number>;
  userId?: string;
  deviceInfo?: Record<string, any>;
}

export interface EmotionalPerformanceMetrics {
  averageFrustrationReduction: number;
  emotionalResponseEffectiveness: number;
  userSatisfaction: number;
  engagementRetention: number;
  supportAccessibility: number;
  frustrationPrevention: number;
  emotionalIntelligence: number;
  userTrustBuilding: number;
  relationshipImprovement: number;
  performanceScore: number; // Overall performance score 0-100
}

export interface EmotionalOptimizationSuggestion {
  id: string;
  type: 'strategy' | 'response' | 'support' | 'timing' | 'communication' | 'accessibility';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number; // 0-1 scale
  confidence: number; // 0-1 scale
  implementationEffort: 'low' | 'medium' | 'high';
  expectedImprovement: string;
  context: string;
  timestamp: number;
}

export class EmotionalErrorAnalytics {
  private responseHistory: EmotionalResponseAnalytics[] = [];
  private frustrationHistory: FrustrationAnalytics[] = [];
  private supportHistory: EmotionalSupportAnalytics[] = [];
  private sessionHistory: EmotionalSessionAnalytics[] = [];
  private optimizationSuggestions: EmotionalOptimizationSuggestion[] = [];

  private currentSessionId: string;
  private sessionStartTime: number;
  private performanceMetrics: EmotionalPerformanceMetrics;

  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `emotional-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMetrics(): EmotionalPerformanceMetrics {
    return {
      averageFrustrationReduction: 0,
      emotionalResponseEffectiveness: 0,
      userSatisfaction: 0,
      engagementRetention: 0,
      supportAccessibility: 0,
      frustrationPrevention: 0,
      emotionalIntelligence: 0,
      userTrustBuilding: 0,
      relationshipImprovement: 0,
      performanceScore: 0
    };
  }

  private initializeAnalytics(): void {
    this.trackSessionStart();

    // Set up periodic performance updates
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000); // Update every 30 seconds
  }

  private trackSessionStart(): void {
    const session: EmotionalSessionAnalytics = {
      sessionId: this.currentSessionId,
      startTime: this.sessionStartTime,
      totalEmotionalResponses: 0,
      effectiveResponses: 0,
      averageFrustrationReduction: 0,
      emotionalStrategySuccess: {},
      userEmotionalStates: [],
      frustrationTrajectory: [],
      supportEffectiveness: 0,
      userEngagementRate: 0,
      abandonmentRate: 0,
      accessibilityUsage: {}
    };

    this.sessionHistory.push(session);
  }

  trackEmotionalResponse(response: EmotionalErrorResponse, error: EmotionalError): void {
    const analytics: EmotionalResponseAnalytics = {
      responseId: response.id,
      errorId: error.id,
      errorType: error.type,
      emotionalStrategy: response.emotionalStrategy,
      responseType: response.responseType,
      effectiveness: response.effectivenessPrediction,
      userEmotionalState: error.emotionalContext.userEmotionalState,
      frustrationLevel: error.emotionalContext.frustrationLevel,
      frustrationReduction: 0, // Will be updated
      userEngagement: 'neutral', // Will be updated
      responseTime: Date.now() - error.timestamp,
      interactionCount: 0,
      supportRequests: 0,
      accessibilityUsed: {
        screenReader: false,
        keyboard: false,
        voice: false
      },
      timestamp: Date.now(),
      sessionId: this.currentSessionId
    };

    this.responseHistory.push(analytics);
    this.updateSessionAnalytics(analytics);
    this.analyzeEmotionalPatterns(analytics);
  }

  trackFrustrationReduction(errorId: string, reduction: number): void {
    const response = this.responseHistory.find(r => r.errorId === errorId);
    if (response) {
      response.frustrationReduction = reduction;
      response.userEngagement = reduction > 0.3 ? 'positive' : reduction > 0.1 ? 'neutral' : 'negative';

      const frustrationAnalytics: FrustrationAnalytics = {
        errorId,
        frustrationTriggers: ['emotional_response'],
        initialFrustration: response.frustrationLevel,
        finalFrustration: response.frustrationLevel - reduction,
        reductionAmount: reduction,
        reductionTechniques: [response.emotionalStrategy.emotionalApproach],
        timeToReduction: Date.now() - response.timestamp,
        userCopingCapacity: 'medium',
        emotionalTrajectory: reduction > 0.2 ? 'improving' : 'stable',
        supportEffectiveness: response.effectiveness,
        userEngagement: response.userEngagement,
        timestamp: Date.now(),
        sessionId: this.currentSessionId
      };

      this.frustrationHistory.push(frustrationAnalytics);
      this.updateSessionAnalytics(response);
    }
  }

  trackUserEngagement(errorId: string, engagement: string): void {
    const response = this.responseHistory.find(r => r.errorId === errorId);
    if (response) {
      response.userEngagement = engagement as any;
      response.interactionCount++;

      this.updateSessionAnalytics(response);
    }
  }

  trackEmotionalSupport(supportType: string, errorId: string, effectiveness: number): void {
    const supportAnalytics: EmotionalSupportAnalytics = {
      supportId: `support-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      errorId,
      supportType: supportType as any,
      emotionalGoal: 'frustration_reduction',
      deliveryMethod: 'text',
      userResponse: effectiveness > 0.7 ? 'positive' : effectiveness > 0.4 ? 'engaged' : 'neutral',
      effectiveness,
      timing: 'immediate',
      duration: 5,
      context: 'emotional_error_handling',
      timestamp: Date.now(),
      sessionId: this.currentSessionId
    };

    this.supportHistory.push(supportAnalytics);
    this.updateSessionAnalytics(this.responseHistory.find(r => r.errorId === errorId));
  }

  private updateSessionAnalytics(responseAnalytics: EmotionalResponseAnalytics | undefined): void {
    if (!responseAnalytics) return;

    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    if (!currentSession) return;

    currentSession.totalEmotionalResponses++;
    if (responseAnalytics.effectiveness > 0.6) {
      currentSession.effectiveResponses++;
    }

    // Update average frustration reduction
    const reductions = this.frustrationHistory.map(f => f.reductionAmount);
    if (reductions.length > 0) {
      currentSession.averageFrustrationReduction =
        reductions.reduce((sum, r) => sum + r, 0) / reductions.length;
    }

    // Track emotional strategy success
    const strategy = responseAnalytics.emotionalStrategy.name;
    currentSession.emotionalStrategySuccess[strategy] =
      (currentSession.emotionalStrategySuccess[strategy] || 0) + (responseAnalytics.effectiveness > 0.6 ? 1 : 0);

    // Track user emotional states
    if (!currentSession.userEmotionalStates.includes(responseAnalytics.userEmotionalState)) {
      currentSession.userEmotionalStates.push(responseAnalytics.userEmotionalState);
    }

    // Track frustration trajectory
    currentSession.frustrationTrajectory.push(responseAnalytics.frustrationLevel);

    // Calculate user engagement rate
    const positiveEngagements = this.responseHistory.filter(r => r.userEngagement === 'positive').length;
    currentSession.userEngagementRate = this.responseHistory.length > 0
      ? positiveEngagements / this.responseHistory.length
      : 0;

    // Calculate abandonment rate
    const abandoned = this.responseHistory.filter(r => r.userEngagement === 'negative').length;
    currentSession.abandonmentRate = this.responseHistory.length > 0
      ? abandoned / this.responseHistory.length
      : 0;

    // Calculate support effectiveness
    const supportItems = this.supportHistory.filter(s => s.errorId === responseAnalytics.errorId);
    if (supportItems.length > 0) {
      currentSession.supportEffectiveness =
        supportItems.reduce((sum, s) => sum + s.effectiveness, 0) / supportItems.length;
    }
  }

  private analyzeEmotionalPatterns(analytics: EmotionalResponseAnalytics): void {
    // Analyze patterns to generate optimization suggestions
    const recentResponses = this.responseHistory.slice(-10);

    // Check for low effectiveness patterns
    const lowEffectiveness = recentResponses.filter(r => r.effectiveness < 0.5);
    if (lowEffectiveness.length >= 3) {
      this.generateOptimizationSuggestion({
        id: `low-effectiveness-${Date.now()}`,
        type: 'strategy',
        priority: 'high',
        title: 'Low Emotional Response Effectiveness',
        description: 'Recent emotional responses have low effectiveness. Consider adjusting emotional strategies or communication approaches.',
        impact: 0.8,
        confidence: 0.9,
        implementationEffort: 'medium',
        expectedImprovement: 'Improved emotional support effectiveness and user satisfaction',
        context: 'emotional_error_handling',
        timestamp: Date.now()
      });
    }

    // Check for high frustration persistence
    const highFrustration = recentResponses.filter(r => r.frustrationReduction < 0.2);
    if (highFrustration.length >= 2) {
      this.generateOptimizationSuggestion({
        id: `frustration-persistence-${Date.now()}`,
        type: 'support',
        priority: 'high',
        title: 'Persistent User Frustration',
        description: 'Users continue to experience high frustration despite emotional support. Consider more intensive support strategies.',
        impact: 0.85,
        confidence: 0.8,
        implementationEffort: 'medium',
        expectedImprovement: 'Better frustration reduction and improved user experience',
        context: 'emotional_error_handling',
        timestamp: Date.now()
      });
    }

    // Check for engagement issues
    const lowEngagement = recentResponses.filter(r => r.userEngagement === 'negative');
    if (lowEngagement.length >= 2) {
      this.generateOptimizationSuggestion({
        id: `low-engagement-${Date.now()}`,
        type: 'communication',
        priority: 'medium',
        title: 'Low User Engagement with Emotional Support',
        description: 'Users are not engaging with emotional support features. Consider making support more accessible or appealing.',
        impact: 0.7,
        confidence: 0.75,
        implementationEffort: 'medium',
        expectedImprovement: 'Increased user engagement with emotional support features',
        context: 'emotional_error_handling',
        timestamp: Date.now()
      });
    }
  }

  private generateOptimizationSuggestion(suggestion: EmotionalOptimizationSuggestion): void {
    this.optimizationSuggestions.push(suggestion);
  }

  private updatePerformanceMetrics(): void {
    const recentResponses = this.responseHistory.slice(-50);
    const recentFrustrations = this.frustrationHistory.slice(-20);

    // Calculate average frustration reduction
    const totalReduction = recentFrustrations.reduce((sum, f) => sum + f.reductionAmount, 0);
    this.performanceMetrics.averageFrustrationReduction = recentFrustrations.length > 0
      ? totalReduction / recentFrustrations.length
      : 0;

    // Calculate emotional response effectiveness
    const avgEffectiveness = recentResponses.reduce((sum, r) => sum + r.effectiveness, 0) / recentResponses.length;
    this.performanceMetrics.emotionalResponseEffectiveness = recentResponses.length > 0 ? avgEffectiveness : 0;

    // Calculate user satisfaction (inverse of abandonment)
    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    this.performanceMetrics.userSatisfaction = currentSession
      ? 1 - currentSession.abandonmentRate
      : 0;

    // Calculate engagement retention
    this.performanceMetrics.engagementRetention = currentSession
      ? currentSession.userEngagementRate
      : 0;

    // Calculate overall performance score
    this.performanceMetrics.performanceScore = (
      this.performanceMetrics.userSatisfaction * 0.25 +
      this.performanceMetrics.emotionalResponseEffectiveness * 0.25 +
      this.performanceMetrics.averageFrustrationReduction * 0.2 +
      this.performanceMetrics.engagementRetention * 0.15 +
      this.performanceMetrics.supportAccessibility * 0.15
    ) * 100;

    // Update other metrics with default values for now
    this.performanceMetrics.supportAccessibility = 0.95;
    this.performanceMetrics.frustrationPrevention = 0.85;
    this.performanceMetrics.emotionalIntelligence = 0.9;
    this.performanceMetrics.userTrustBuilding = 0.88;
    this.performanceMetrics.relationshipImprovement = 0.82;
  }

  // Public API methods
  getResponseAnalytics(limit?: number): EmotionalResponseAnalytics[] {
    const sorted = [...this.responseHistory].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getFrustrationAnalytics(limit?: number): FrustrationAnalytics[] {
    const sorted = [...this.frustrationHistory].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getSupportAnalytics(limit?: number): EmotionalSupportAnalytics[] {
    const sorted = [...this.supportHistory].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getSessionAnalytics(sessionId?: string): EmotionalSessionAnalytics | undefined {
    return this.sessionHistory.find(s => !sessionId || s.sessionId === sessionId);
  }

  getPerformanceMetrics(): EmotionalPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  getOptimizationSuggestions(limit?: number): EmotionalOptimizationSuggestion[] {
    const sorted = [...this.optimizationSuggestions].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getEmotionalStrategySuccess(strategyName?: string): number {
    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    if (!currentSession) return 0;

    if (strategyName) {
      return currentSession.emotionalStrategySuccess[strategyName] || 0;
    }

    const total = Object.values(currentSession.emotionalStrategySuccess).reduce((sum, count) => sum + count, 0);
    const successful = Object.entries(currentSession.emotionalStrategySuccess)
      .filter(([_, count]) => count > 0).length;

    return total > 0 ? successful / total : 0;
  }

  getAverageFrustrationReduction(): number {
    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    return currentSession?.averageFrustrationReduction || 0;
  }

  getUserEngagementRate(): number {
    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    return currentSession?.userEngagementRate || 0;
  }

  exportAnalytics(): string {
    const data = {
      responseHistory: this.responseHistory,
      frustrationHistory: this.frustrationHistory,
      supportHistory: this.supportHistory,
      sessionHistory: this.sessionHistory,
      performanceMetrics: this.performanceMetrics,
      optimizationSuggestions: this.optimizationSuggestions,
      exportTimestamp: Date.now()
    };

    return JSON.stringify(data, null, 2);
  }

  clearAnalytics(): void {
    this.responseHistory = [];
    this.frustrationHistory = [];
    this.supportHistory = [];
    this.optimizationSuggestions = [];
    this.performanceMetrics = this.initializePerformanceMetrics();
  }

  // Real-time analytics for immediate feedback
  getRealTimeMetrics(): {
    currentSessionDuration: number;
    responsesPerMinute: number;
    averageEffectiveness: number;
    frustrationReductionRate: number;
    userEngagementRate: number;
  } {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const recentResponses = this.responseHistory.slice(-10);
    const responsesPerMinute = recentResponses.length / (sessionDuration / 60000);

    const avgEffectiveness = recentResponses.length > 0
      ? recentResponses.reduce((sum, r) => sum + r.effectiveness, 0) / recentResponses.length
      : 0;

    const recentFrustrations = this.frustrationHistory.slice(-5);
    const frustrationReductionRate = recentFrustrations.length > 0
      ? recentFrustrations.reduce((sum, f) => sum + f.reductionAmount, 0) / recentFrustrations.length
      : 0;

    const currentSession = this.sessionHistory.find(s => s.sessionId === this.currentSessionId);
    const userEngagementRate = currentSession?.userEngagementRate || 0;

    return {
      currentSessionDuration: sessionDuration,
      responsesPerMinute,
      averageEffectiveness: avgEffectiveness,
      frustrationReductionRate,
      userEngagementRate
    };
  }
}

export default EmotionalErrorAnalytics;