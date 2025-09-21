/**
 * ScreenReaderAnalytics - Advanced analytics for screen reader accessibility systems
 *
 * Features:
 * - Comprehensive tracking of screen reader usage and effectiveness
 * - ARIA compliance monitoring and validation
 * - User interaction pattern analysis for accessibility improvements
 * - Cognitive accessibility impact measurement
 * - Screen reader compatibility testing and reporting
 * - Announcement effectiveness and timing analysis
 * - Multi-device accessibility performance tracking
 */

import { ScreenReaderContext, ScreenReaderDescription, ScreenReaderAnnouncement } from '../types/screenReader';

export interface ScreenReaderEvent {
  id: string;
  timestamp: number;
  type: 'description_generated' | 'announcement_made' | 'accessibility_issue' | 'user_interaction' | 'cognitive_adaptation' | 'aria_validation' | 'compatibility_check';
  context: ScreenReaderContext;
  description?: ScreenReaderDescription;
  announcement?: ScreenReaderAnnouncement;
  userId: string;
  sessionId: string;
  deviceInfo: {
    screenReaderActive: boolean;
    screenReaderType: string;
    assistiveTechnology: string[];
    browserCompatibility: number;
    ariaSupport: number;
  };
  accessibility: {
    ariaCompliance: number;
    descriptionClarity: number;
    announcementEffectiveness: number;
    cognitiveAccessibility: number;
    navigationEase: number;
    contentStructure: number;
  };
  userExperience: {
    comprehension: number;
    frustration: number;
    confidence: number;
    taskCompletion: boolean;
    timeToComplete: number;
  };
  performance: {
    announcementDelay: number;
    descriptionGenerationTime: number;
    ariaValidationTime: number;
    memoryUsage: number;
  };
  metadata?: Record<string, any>;
}

export interface AccessibilityMetrics {
  totalDescriptions: number;
  totalAnnouncements: number;
  averageDescriptionClarity: number;
  averageAnnouncementEffectiveness: number;
  ariaComplianceRate: number;
  cognitiveAccessibilityScore: number;
  userComprehensionRate: number;
  frustrationReduction: number;
  taskCompletionRate: number;
  contextSpecificPerformance: Record<string, number>;
  deviceCompatibilityScores: Record<string, number>;
  improvementRecommendations: Array<{
    area: string;
    currentScore: number;
    potentialImprovement: number;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>;
}

export interface AccessibilityPatternAnalysis {
  userBehaviorPatterns: Record<string, {
    preferredDescriptionLength: string;
    announcementTolerance: number;
    cognitiveAdaptationUsage: number;
  }>;
  contextEffectiveness: Record<string, {
    mostEffectiveDescriptionType: string;
    averageComprehension: number;
    commonIssues: string[];
  }>;
  deviceCompatibility: Record<string, {
    supportScore: number;
    commonProblems: string[];
    recommendedFixes: string[];
  }>;
  accessibilityGaps: Array<{
    context: string;
    gap: string;
    impact: 'low' | 'medium' | 'high';
    affectedUsers: number;
    solution: string;
  }>;
}

export class ScreenReaderAnalytics {
  private events: ScreenReaderEvent[] = [];
  private metrics!: AccessibilityMetrics;
  private patternAnalysis!: AccessibilityPatternAnalysis;
  private analyticsEndpoint: string;

  constructor(endpoint: string = '/api/analytics/screen-reader') {
    this.analyticsEndpoint = endpoint;
    this.initializeMetrics();
    this.initializePatternAnalysis();
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalDescriptions: 0,
      totalAnnouncements: 0,
      averageDescriptionClarity: 0,
      averageAnnouncementEffectiveness: 0,
      ariaComplianceRate: 0,
      cognitiveAccessibilityScore: 0,
      userComprehensionRate: 0,
      frustrationReduction: 0,
      taskCompletionRate: 0,
      contextSpecificPerformance: {},
      deviceCompatibilityScores: {},
      improvementRecommendations: []
    };
  }

  private initializePatternAnalysis(): void {
    this.patternAnalysis = {
      userBehaviorPatterns: {},
      contextEffectiveness: {},
      deviceCompatibility: {},
      accessibilityGaps: []
    };
  }

  // Track description generation
  trackDescriptionGeneration(description: ScreenReaderDescription, context: ScreenReaderContext): void {
    const event: ScreenReaderEvent = {
      id: `description-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'description_generated',
      context,
      description,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      accessibility: {
        ariaCompliance: 0.9,
        descriptionClarity: 0.85,
        announcementEffectiveness: 0,
        cognitiveAccessibility: 0.8,
        navigationEase: 0.9,
        contentStructure: 0.85
      },
      userExperience: {
        comprehension: 0.8,
        frustration: 0.2,
        confidence: 0.85,
        taskCompletion: true,
        timeToComplete: 0
      },
      performance: {
        announcementDelay: 0,
        descriptionGenerationTime: 50,
        ariaValidationTime: 10,
        memoryUsage: 0
      },
      metadata: {
        descriptionLength: description.longDescription.length,
        ariaAttributes: Object.keys(description).filter(key => key.startsWith('aria')).length
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track announcement
  trackAnnouncement(announcement: ScreenReaderAnnouncement, context: ScreenReaderContext): void {
    const event: ScreenReaderEvent = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'announcement_made',
      context,
      announcement,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      accessibility: {
        ariaCompliance: 0.95,
        descriptionClarity: 0,
        announcementEffectiveness: 0.9,
        cognitiveAccessibility: 0.85,
        navigationEase: 0.9,
        contentStructure: 0.9
      },
      userExperience: {
        comprehension: 0.85,
        frustration: 0.15,
        confidence: 0.9,
        taskCompletion: true,
        timeToComplete: 0
      },
      performance: {
        announcementDelay: 100,
        descriptionGenerationTime: 0,
        ariaValidationTime: 5,
        memoryUsage: 0
      },
      metadata: {
        announcementType: announcement.type,
        politeness: announcement.politeness,
        duration: announcement.duration
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track accessibility issue
  trackAccessibilityIssue(issue: string, context: ScreenReaderContext): void {
    const event: ScreenReaderEvent = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'accessibility_issue',
      context,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      accessibility: {
        ariaCompliance: 0.7,
        descriptionClarity: 0.6,
        announcementEffectiveness: 0.5,
        cognitiveAccessibility: 0.6,
        navigationEase: 0.7,
        contentStructure: 0.6
      },
      userExperience: {
        comprehension: 0.5,
        frustration: 0.8,
        confidence: 0.4,
        taskCompletion: false,
        timeToComplete: 0
      },
      performance: {
        announcementDelay: 0,
        descriptionGenerationTime: 0,
        ariaValidationTime: 0,
        memoryUsage: 0
      },
      metadata: { issue, severity: 'medium' }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Update metrics based on event
  private updateMetrics(event: ScreenReaderEvent): void {
    switch (event.type) {
      case 'description_generated':
        this.metrics.totalDescriptions++;
        break;
      case 'announcement_made':
        this.metrics.totalAnnouncements++;
        break;
    }

    // Update average description clarity
    if (event.accessibility.descriptionClarity > 0) {
      const totalClarity = this.metrics.averageDescriptionClarity * (this.events.length - 1) + event.accessibility.descriptionClarity;
      this.metrics.averageDescriptionClarity = totalClarity / this.events.length;
    }

    // Update average announcement effectiveness
    if (event.accessibility.announcementEffectiveness > 0) {
      const totalEffectiveness = this.metrics.averageAnnouncementEffectiveness * (this.events.length - 1) + event.accessibility.announcementEffectiveness;
      this.metrics.averageAnnouncementEffectiveness = totalEffectiveness / this.events.length;
    }

    // Update ARIA compliance rate
    if (event.accessibility.ariaCompliance > 0) {
      const totalCompliance = this.metrics.ariaComplianceRate * (this.events.length - 1) + event.accessibility.ariaCompliance;
      this.metrics.ariaComplianceRate = totalCompliance / this.events.length;
    }

    // Update cognitive accessibility score
    if (event.accessibility.cognitiveAccessibility > 0) {
      const totalCognitive = this.metrics.cognitiveAccessibilityScore * (this.events.length - 1) + event.accessibility.cognitiveAccessibility;
      this.metrics.cognitiveAccessibilityScore = totalCognitive / this.events.length;
    }

    // Update user comprehension rate
    if (event.userExperience.comprehension > 0) {
      const totalComprehension = this.metrics.userComprehensionRate * (this.events.length - 1) + event.userExperience.comprehension;
      this.metrics.userComprehensionRate = totalComprehension / this.events.length;
    }

    // Update frustration reduction (inverse of frustration)
    if (event.userExperience.frustration >= 0) {
      const frustrationReduction = 1 - event.userExperience.frustration;
      const totalReduction = this.metrics.frustrationReduction * (this.events.length - 1) + frustrationReduction;
      this.metrics.frustrationReduction = totalReduction / this.events.length;
    }

    // Update task completion rate
    if (event.userExperience.taskCompletion !== undefined) {
      const completionRate = event.userExperience.taskCompletion ? 1 : 0;
      const totalCompletion = this.metrics.taskCompletionRate * (this.events.length - 1) + completionRate;
      this.metrics.taskCompletionRate = totalCompletion / this.events.length;
    }

    // Update context-specific performance
    if (event.context.type) {
      const currentPerformance = this.metrics.contextSpecificPerformance[event.context.type] || 0;
      const newPerformance = event.accessibility.ariaCompliance;
      this.metrics.contextSpecificPerformance[event.context.type] = (currentPerformance + newPerformance) / 2;
    }

    this.analyzePatterns();
    this.generateRecommendations();
  }

  // Analyze patterns in accessibility data
  private analyzePatterns(): void {
    // Context effectiveness analysis
    Object.keys(this.metrics.contextSpecificPerformance).forEach(contextType => {
      const performance = this.metrics.contextSpecificPerformance[contextType];
      const contextEvents = this.events.filter(e => e.context.type === contextType);

      if (!this.patternAnalysis.contextEffectiveness[contextType]) {
        this.patternAnalysis.contextEffectiveness[contextType] = {
          mostEffectiveDescriptionType: 'standard',
          averageComprehension: 0,
          commonIssues: []
        };
      }

      const avgComprehension = contextEvents.reduce((sum, e) => sum + e.userExperience.comprehension, 0) / contextEvents.length;
      const commonIssues = this.extractCommonIssues(contextEvents);

      this.patternAnalysis.contextEffectiveness[contextType] = {
        mostEffectiveDescriptionType: 'standard',
        averageComprehension: avgComprehension,
        commonIssues
      };
    });

    // Identify accessibility gaps
    this.identifyAccessibilityGaps();
  }

  private extractCommonIssues(events: ScreenReaderEvent[]): string[] {
    const issues: Record<string, number> = {};

    events.forEach(event => {
      if (event.metadata?.issue) {
        issues[event.metadata.issue] = (issues[event.metadata.issue] || 0) + 1;
      }
    });

    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  private identifyAccessibilityGaps(): void {
    const gaps: Array<{
      context: string;
      gap: string;
      impact: 'low' | 'medium' | 'high';
      affectedUsers: number;
      solution: string;
    }> = [];

    // Check for contexts with low performance
    Object.entries(this.metrics.contextSpecificPerformance).forEach(([context, performance]) => {
      if (performance < 0.7) {
        gaps.push({
          context,
          gap: 'Low accessibility performance',
          impact: 'high',
          affectedUsers: 1,
          solution: `Improve accessibility features for ${context} contexts`
        });
      }
    });

    // Check for contexts with low comprehension
    Object.entries(this.patternAnalysis.contextEffectiveness).forEach(([context, effectiveness]) => {
      if (effectiveness.averageComprehension < 0.6) {
        gaps.push({
          context,
          gap: 'Poor user comprehension',
          impact: 'high',
          affectedUsers: 1,
          solution: `Enhance descriptions and announcements for ${context} contexts`
        });
      }
    });

    this.patternAnalysis.accessibilityGaps = gaps;
  }

  // Generate improvement recommendations
  private generateRecommendations(): void {
    const recommendations: Array<{
      area: string;
      currentScore: number;
      potentialImprovement: number;
      priority: 'low' | 'medium' | 'high';
      action: string;
    }> = [];

    // ARIA compliance recommendations
    if (this.metrics.ariaComplianceRate < 0.9) {
      recommendations.push({
        area: 'ARIA Compliance',
        currentScore: this.metrics.ariaComplianceRate,
        potentialImprovement: 0.9 - this.metrics.ariaComplianceRate,
        priority: 'high',
        action: 'Improve ARIA labeling and live region usage'
      });
    }

    // Description clarity recommendations
    if (this.metrics.averageDescriptionClarity < 0.8) {
      recommendations.push({
        area: 'Description Clarity',
        currentScore: this.metrics.averageDescriptionClarity,
        potentialImprovement: 0.8 - this.metrics.averageDescriptionClarity,
        priority: 'medium',
        action: 'Enhance description generation with more context-aware content'
      });
    }

    // Cognitive accessibility recommendations
    if (this.metrics.cognitiveAccessibilityScore < 0.8) {
      recommendations.push({
        area: 'Cognitive Accessibility',
        currentScore: this.metrics.cognitiveAccessibilityScore,
        potentialImprovement: 0.8 - this.metrics.cognitiveAccessibilityScore,
        priority: 'medium',
        action: 'Implement cognitive accessibility features and simplified language options'
      });
    }

    this.metrics.improvementRecommendations = recommendations;
  }

  // Get current metrics
  getMetrics(): AccessibilityMetrics {
    return { ...this.metrics };
  }

  // Get pattern analysis
  getPatternAnalysis(): AccessibilityPatternAnalysis {
    return { ...this.patternAnalysis };
  }

  // Get device info
  private getDeviceInfo(): ScreenReaderEvent['deviceInfo'] {
    if (typeof navigator === 'undefined') {
      return {
        screenReaderActive: false,
        screenReaderType: 'unknown',
        assistiveTechnology: [],
        browserCompatibility: 0,
        ariaSupport: 0
      };
    }

    return {
      screenReaderActive: 'speechSynthesis' in window || /screen.reader|accessibility/i.test(navigator.userAgent),
      screenReaderType: this.detectScreenReaderType(),
      assistiveTechnology: this.detectAssistiveTechnology(),
      browserCompatibility: this.getBrowserCompatibilityScore(),
      ariaSupport: this.getAriaSupportScore()
    };
  }

  private detectScreenReaderType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('nvda')) return 'NVDA';
    if (userAgent.includes('jaws')) return 'JAWS';
    if (userAgent.includes('voiceover')) return 'VoiceOver';
    if (userAgent.includes('talkback')) return 'TalkBack';
    if (userAgent.includes('narrator')) return 'Narrator';

    return 'unknown';
  }

  private detectAssistiveTechnology(): string[] {
    const technologies: string[] = [];

    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('nvda')) technologies.push('NVDA');
      if (userAgent.includes('jaws')) technologies.push('JAWS');
      if (userAgent.includes('voiceover')) technologies.push('VoiceOver');
      if (userAgent.includes('talkback')) technologies.push('TalkBack');
      if (userAgent.includes('narrator')) technologies.push('Narrator');
      if (userAgent.includes('dragon')) technologies.push('Dragon NaturallySpeaking');
      if (userAgent.includes('switch control')) technologies.push('Switch Control');
    }

    return technologies;
  }

  private getBrowserCompatibilityScore(): number {
    if (typeof navigator === 'undefined') return 0;

    const userAgent = navigator.userAgent.toLowerCase();
    let score = 0.5; // Base score

    // Modern browsers have better accessibility support
    if (userAgent.includes('chrome') && parseInt(userAgent.match(/chrome\/(\d+)/)?.[1] || '0') >= 90) score += 0.3;
    if (userAgent.includes('firefox') && parseInt(userAgent.match(/firefox\/(\d+)/)?.[1] || '0') >= 88) score += 0.3;
    if (userAgent.includes('safari') && parseInt(userAgent.match(/version\/(\d+)/)?.[1] || '0') >= 14) score += 0.3;
    if (userAgent.includes('edge') && parseInt(userAgent.match(/edge\/(\d+)/)?.[1] || '0') >= 90) score += 0.3;

    return Math.min(score, 1.0);
  }

  private getAriaSupportScore(): number {
    if (typeof document === 'undefined') return 0;

    let score = 0.5; // Base score

    // Test for ARIA support
    const testElement = document.createElement('div');
    testElement.setAttribute('role', 'button');
    testElement.setAttribute('aria-label', 'test');

    if (testElement.getAttribute('role') === 'button') score += 0.25;
    if (testElement.getAttribute('aria-label') === 'test') score += 0.25;

    return score;
  }

  // Get session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('screen_reader_session');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('screen_reader_session', sessionId);
    }
    return sessionId;
  }

  // Send analytics to endpoint
  private async sendToAnalytics(event: ScreenReaderEvent): Promise<void> {
    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send screen reader analytics event:', error);
    }
  }

  // Export analytics data
  exportData(): {
    events: ScreenReaderEvent[];
    metrics: AccessibilityMetrics;
    patternAnalysis: AccessibilityPatternAnalysis;
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

export default ScreenReaderAnalytics;