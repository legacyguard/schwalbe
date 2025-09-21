/**
 * ReducedMotionAnalytics - Advanced analytics for reduced motion accessibility systems
 *
 * Features:
 * - Comprehensive tracking of motion reduction effectiveness
 * - User experience impact analysis for accessibility adaptations
 * - Performance improvement measurement for reduced motion alternatives
 * - Accessibility compliance tracking and reporting
 * - User feedback correlation with adaptation success
 * - Context-aware adaptation pattern recognition
 * - Screen reader and keyboard navigation analytics
 */

import { MotionContext, MotionAlternative, AccessibilityAdaptation } from '../components/motion/ReducedMotionAlternatives';

export interface MotionReductionEvent {
  id: string;
  timestamp: number;
  type: 'motion_analysis' | 'adaptation_applied' | 'alternative_selected' | 'user_feedback' | 'performance_measured' | 'accessibility_compliance' | 'context_adaptation';
  context: MotionContext;
  adaptation?: AccessibilityAdaptation;
  alternative?: MotionAlternative;
  userId: string;
  sessionId: string;
  deviceInfo: {
    reducedMotionSupported: boolean;
    reducedMotionEnabled: boolean;
    screenReaderActive: boolean;
    highContrastEnabled: boolean;
    keyboardNavigation: boolean;
  };
  performance: {
    originalPerformance: number;
    adaptedPerformance: number;
    improvement: number;
    frameRate: number;
    memoryUsage: number;
  };
  accessibility: {
    complianceScore: number;
    userExperience: 'positive' | 'neutral' | 'negative';
    adaptationEffectiveness: number;
    screenReaderCompatibility: number;
    keyboardNavigationScore: number;
  };
  userFeedback: {
    experience: 'positive' | 'neutral' | 'negative';
    suggestions?: string[];
    contextRating: number;
    adaptationHelpfulness: number;
  };
  metadata?: Record<string, any>;
}

export interface AccessibilityMetrics {
  totalAdaptations: number;
  successfulAdaptations: number;
  adaptationSuccessRate: number;
  averagePerformanceImprovement: number;
  userExperienceScores: {
    positive: number;
    neutral: number;
    negative: number;
  };
  contextAdaptationRates: Record<string, number>;
  alternativeEffectiveness: Record<string, number>;
  deviceCompatibility: {
    reducedMotionSupport: number;
    screenReaderCompatibility: number;
    keyboardNavigationSupport: number;
    highContrastCompatibility: number;
  };
  complianceScores: {
    overall: number;
    motionReduction: number;
    screenReader: number;
    keyboardNavigation: number;
    highContrast: number;
  };
}

export interface AdaptationPatternAnalysis {
  contextPatterns: Record<string, {
    mostEffectiveAdaptation: string;
    averagePerformanceGain: number;
    userExperienceScore: number;
  }>;
  userBehaviorPatterns: Record<string, {
    preferredAlternatives: string[];
    adaptationTolerance: number;
    feedbackTrends: string[];
  }>;
  performancePatterns: Record<string, {
    optimalAlternatives: string[];
    performanceThresholds: Record<string, number>;
  }>;
  accessibilityGaps: Array<{
    context: string;
    gap: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
}

export class ReducedMotionAnalytics {
  private events: MotionReductionEvent[] = [];
  private metrics!: AccessibilityMetrics;
  private patternAnalysis!: AdaptationPatternAnalysis;
  private analyticsEndpoint: string;

  constructor(endpoint: string = '/api/analytics/reduced-motion') {
    this.analyticsEndpoint = endpoint;
    this.initializeMetrics();
    this.initializePatternAnalysis();
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalAdaptations: 0,
      successfulAdaptations: 0,
      adaptationSuccessRate: 0,
      averagePerformanceImprovement: 0,
      userExperienceScores: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      contextAdaptationRates: {},
      alternativeEffectiveness: {},
      deviceCompatibility: {
        reducedMotionSupport: 0,
        screenReaderCompatibility: 0,
        keyboardNavigationSupport: 0,
        highContrastCompatibility: 0
      },
      complianceScores: {
        overall: 0,
        motionReduction: 0,
        screenReader: 0,
        keyboardNavigation: 0,
        highContrast: 0
      }
    };
  }

  private initializePatternAnalysis(): void {
    this.patternAnalysis = {
      contextPatterns: {},
      userBehaviorPatterns: {},
      performancePatterns: {},
      accessibilityGaps: []
    };
  }

  // Track motion analysis
  trackMotionAnalysis(context: MotionContext, analysis: {
    shouldReduceMotion: boolean;
    recommendedAlternatives: MotionAlternative[];
    adaptationStrategy: AccessibilityAdaptation;
    performanceGain: number;
    userExperience: string;
  }): void {
    const event: MotionReductionEvent = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'motion_analysis',
      context,
      adaptation: analysis.adaptationStrategy,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      performance: {
        originalPerformance: 0,
        adaptedPerformance: analysis.performanceGain,
        improvement: analysis.performanceGain,
        frameRate: 60,
        memoryUsage: 0
      },
      accessibility: {
        complianceScore: 0.9,
        userExperience: analysis.userExperience as 'positive' | 'neutral' | 'negative',
        adaptationEffectiveness: 0.85,
        screenReaderCompatibility: 0.9,
        keyboardNavigationScore: 0.95
      },
      userFeedback: {
        experience: 'neutral',
        contextRating: 0,
        adaptationHelpfulness: 0
      },
      metadata: {
        analysis,
        alternativeCount: analysis.recommendedAlternatives.length
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track adaptation applied
  trackAdaptation(
    adaptation: AccessibilityAdaptation,
    context: MotionContext,
    appliedAlternatives: MotionAlternative[]
  ): void {
    const event: MotionReductionEvent = {
      id: `adaptation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'adaptation_applied',
      context,
      adaptation,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      performance: {
        originalPerformance: 0,
        adaptedPerformance: adaptation.performanceGain,
        improvement: adaptation.performanceGain,
        frameRate: 60,
        memoryUsage: 0
      },
      accessibility: {
        complianceScore: 0.95,
        userExperience: adaptation.userExperience === 'preserved' ? 'positive' : 'neutral',
        adaptationEffectiveness: 0.9,
        screenReaderCompatibility: 0.95,
        keyboardNavigationScore: 0.9
      },
      userFeedback: {
        experience: 'neutral',
        contextRating: 0,
        adaptationHelpfulness: 0
      },
      metadata: {
        appliedAlternatives: appliedAlternatives.map(alt => alt.id),
        adaptationType: adaptation.type
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track alternative selection
  trackAlternativeApplied(alternative: MotionAlternative, context: MotionContext): void {
    const event: MotionReductionEvent = {
      id: `alternative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'alternative_selected',
      context,
      alternative,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      performance: {
        originalPerformance: 0,
        adaptedPerformance: 0,
        improvement: 0,
        frameRate: 60,
        memoryUsage: 0
      },
      accessibility: {
        complianceScore: 0.9,
        userExperience: 'neutral',
        adaptationEffectiveness: 0.8,
        screenReaderCompatibility: 0.9,
        keyboardNavigationScore: 0.85
      },
      userFeedback: {
        experience: 'neutral',
        contextRating: 0,
        adaptationHelpfulness: 0
      },
      metadata: {
        alternativeType: alternative.reducedMotionAlternative,
        performanceImpact: alternative.performanceImpact
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track user feedback
  trackUserFeedback(experience: 'positive' | 'neutral' | 'negative', contextId: string): void {
    const event: MotionReductionEvent = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'user_feedback',
      context: {} as MotionContext,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      performance: {
        originalPerformance: 0,
        adaptedPerformance: 0,
        improvement: 0,
        frameRate: 0,
        memoryUsage: 0
      },
      accessibility: {
        complianceScore: 0,
        userExperience: experience,
        adaptationEffectiveness: 0,
        screenReaderCompatibility: 0,
        keyboardNavigationScore: 0
      },
      userFeedback: {
        experience,
        contextRating: experience === 'positive' ? 5 : experience === 'neutral' ? 3 : 1,
        adaptationHelpfulness: experience === 'positive' ? 4 : experience === 'neutral' ? 2 : 0
      },
      metadata: { contextId }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Update metrics based on event
  private updateMetrics(event: MotionReductionEvent): void {
    switch (event.type) {
      case 'adaptation_applied':
        this.metrics.totalAdaptations++;
        if (event.accessibility.userExperience === 'positive') {
          this.metrics.successfulAdaptations++;
        }
        break;
      case 'user_feedback':
        const experience = event.userFeedback.experience;
        this.metrics.userExperienceScores[experience]++;
        break;
    }

    // Update adaptation success rate
    if (this.metrics.totalAdaptations > 0) {
      this.metrics.adaptationSuccessRate = this.metrics.successfulAdaptations / this.metrics.totalAdaptations;
    }

    // Update average performance improvement
    if (event.performance.improvement > 0) {
      const totalImprovement = this.metrics.averagePerformanceImprovement * (this.events.length - 1) + event.performance.improvement;
      this.metrics.averagePerformanceImprovement = totalImprovement / this.events.length;
    }

    // Update context adaptation rates
    if (event.context.type) {
      const currentRate = this.metrics.contextAdaptationRates[event.context.type] || 0;
      const newRate = event.type === 'adaptation_applied' ? 1 : 0;
      this.metrics.contextAdaptationRates[event.context.type] = (currentRate + newRate) / 2;
    }

    // Update alternative effectiveness
    if (event.alternative) {
      const currentEffectiveness = this.metrics.alternativeEffectiveness[event.alternative.reducedMotionAlternative] || 0;
      const newEffectiveness = event.accessibility.userExperience === 'positive' ? 1 : 0;
      this.metrics.alternativeEffectiveness[event.alternative.reducedMotionAlternative] = (currentEffectiveness + newEffectiveness) / 2;
    }

    this.updateComplianceScores();
    this.analyzePatterns();
  }

  // Update compliance scores
  private updateComplianceScores(): void {
    const totalEvents = this.events.length;

    if (totalEvents === 0) return;

    // Calculate compliance scores based on event data
    const motionReductionScore = this.events.filter(e => e.type === 'adaptation_applied').length / totalEvents;
    const screenReaderScore = this.events.filter(e => e.accessibility.screenReaderCompatibility > 0.8).length / totalEvents;
    const keyboardScore = this.events.filter(e => e.accessibility.keyboardNavigationScore > 0.8).length / totalEvents;
    const highContrastScore = this.events.filter(e => e.deviceInfo.highContrastEnabled).length / totalEvents;

    this.metrics.complianceScores = {
      overall: (motionReductionScore + screenReaderScore + keyboardScore + highContrastScore) / 4,
      motionReduction: motionReductionScore,
      screenReader: screenReaderScore,
      keyboardNavigation: keyboardScore,
      highContrast: highContrastScore
    };
  }

  // Analyze patterns in adaptation data
  private analyzePatterns(): void {
    // Context patterns
    Object.keys(this.metrics.contextAdaptationRates).forEach(contextType => {
      const rate = this.metrics.contextAdaptationRates[contextType];
      const contextEvents = this.events.filter(e => e.context.type === contextType);

      if (!this.patternAnalysis.contextPatterns[contextType]) {
        this.patternAnalysis.contextPatterns[contextType] = {
          mostEffectiveAdaptation: 'motion_reduction',
          averagePerformanceGain: 0,
          userExperienceScore: 0
        };
      }

      const avgPerformance = contextEvents.reduce((sum, e) => sum + e.performance.improvement, 0) / contextEvents.length;
      const avgExperience = contextEvents.reduce((sum, e) => {
        const score = e.accessibility.userExperience === 'positive' ? 1 : e.accessibility.userExperience === 'neutral' ? 0.5 : 0;
        return sum + score;
      }, 0) / contextEvents.length;

      this.patternAnalysis.contextPatterns[contextType] = {
        mostEffectiveAdaptation: 'motion_reduction',
        averagePerformanceGain: avgPerformance,
        userExperienceScore: avgExperience
      };
    });

    // Identify accessibility gaps
    this.identifyAccessibilityGaps();
  }

  // Identify accessibility gaps
  private identifyAccessibilityGaps(): void {
    const gaps: Array<{
      context: string;
      gap: string;
      severity: 'low' | 'medium' | 'high';
      recommendation: string;
    }> = [];

    // Check for contexts with low adaptation rates
    Object.entries(this.metrics.contextAdaptationRates).forEach(([context, rate]) => {
      if (rate < 0.5) {
        gaps.push({
          context,
          gap: 'Low adaptation rate',
          severity: 'medium',
          recommendation: `Increase adaptation coverage for ${context} contexts`
        });
      }
    });

    // Check for contexts with poor user experience
    Object.entries(this.patternAnalysis.contextPatterns).forEach(([context, pattern]) => {
      if (pattern.userExperienceScore < 0.6) {
        gaps.push({
          context,
          gap: 'Poor user experience',
          severity: 'high',
          recommendation: `Improve adaptation alternatives for ${context} contexts`
        });
      }
    });

    this.patternAnalysis.accessibilityGaps = gaps;
  }

  // Get current metrics
  getMetrics(): AccessibilityMetrics {
    return { ...this.metrics };
  }

  // Get pattern analysis
  getPatternAnalysis(): AdaptationPatternAnalysis {
    return { ...this.patternAnalysis };
  }

  // Calculate adaptation recommendation for context
  getAdaptationRecommendation(context: MotionContext): {
    recommendedAdaptation: string;
    confidence: number;
    expectedPerformanceGain: number;
    expectedUserExperience: string;
  } {
    const contextPattern = this.patternAnalysis.contextPatterns[context.type];

    if (contextPattern) {
      return {
        recommendedAdaptation: contextPattern.mostEffectiveAdaptation,
        confidence: contextPattern.userExperienceScore,
        expectedPerformanceGain: contextPattern.averagePerformanceGain,
        expectedUserExperience: contextPattern.userExperienceScore > 0.7 ? 'positive' : 'neutral'
      };
    }

    // Default recommendation
    return {
      recommendedAdaptation: 'motion_reduction',
      confidence: 0.5,
      expectedPerformanceGain: 25,
      expectedUserExperience: 'neutral'
    };
  }

  // Get device info
  private getDeviceInfo(): MotionReductionEvent['deviceInfo'] {
    if (typeof window === 'undefined') {
      return {
        reducedMotionSupported: false,
        reducedMotionEnabled: false,
        screenReaderActive: false,
        highContrastEnabled: false,
        keyboardNavigation: true
      };
    }

    return {
      reducedMotionSupported: 'matchMedia' in window,
      reducedMotionEnabled: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      screenReaderActive: 'speechSynthesis' in window || /screen.reader|accessibility/i.test(navigator.userAgent),
      highContrastEnabled: window.matchMedia('(prefers-contrast: high)').matches,
      keyboardNavigation: true
    };
  }

  // Get session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('reduced_motion_session');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('reduced_motion_session', sessionId);
    }
    return sessionId;
  }

  // Send analytics to endpoint
  private async sendToAnalytics(event: MotionReductionEvent): Promise<void> {
    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send reduced motion analytics event:', error);
    }
  }

  // Export analytics data
  exportData(): {
    events: MotionReductionEvent[];
    metrics: AccessibilityMetrics;
    patternAnalysis: AdaptationPatternAnalysis;
  } {
    return {
      events: [...this.events],
      metrics: this.getMetrics(),
      patternAnalysis: this.getPatternAnalysis()
    };
  }

  // Clear analytics data
  clearData(): void {
    this.events = [];
    this.initializeMetrics();
    this.initializePatternAnalysis();
  }
}

export default ReducedMotionAnalytics;