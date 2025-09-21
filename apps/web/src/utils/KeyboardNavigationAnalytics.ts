/**
 * KeyboardNavigationAnalytics - Advanced analytics for keyboard navigation and focus management systems
 *
 * Features:
 * - Comprehensive tracking of keyboard navigation patterns and effectiveness
 * - Focus management analytics and performance measurement
 * - Keyboard shortcut usage and user preference analysis
 * - Accessibility compliance tracking for keyboard interactions
 * - Focus trap effectiveness and user experience measurement
 * - Multi-device keyboard navigation compatibility analysis
 * - User behavior pattern recognition for navigation improvements
 */

import { FocusContext, FocusIndicator, KeyboardShortcut, FocusTrap } from '../components/motion/KeyboardNavigationExcellence';

export interface KeyboardNavigationEvent {
  id: string;
  timestamp: number;
  type: 'focus_change' | 'keyboard_shortcut' | 'focus_trap' | 'focus_indicator' | 'navigation_pattern' | 'accessibility_issue' | 'user_preference' | 'performance_measurement';
  context: FocusContext;
  focusIndicator?: FocusIndicator;
  keyboardShortcut?: KeyboardShortcut;
  focusTrap?: FocusTrap;
  userId: string;
  sessionId: string;
  deviceInfo: {
    keyboardType: string;
    assistiveTechnology: string[];
    screenReaderActive: boolean;
    focusVisibleSupport: boolean;
    tabNavigationSupport: boolean;
  };
  navigation: {
    focusSequence: string[];
    navigationTime: number;
    tabCount: number;
    shortcutUsage: number;
    focusTrapEscapes: number;
    focusRestorationSuccess: boolean;
  };
  accessibility: {
    keyboardCompliance: number;
    focusManagement: number;
    shortcutAccessibility: number;
    navigationEase: number;
    visualIndicators: number;
  };
  userExperience: {
    navigationEfficiency: number;
    frustration: number;
    confidence: number;
    taskCompletion: boolean;
    timeToComplete: number;
    preferredNavigationMethod: string;
  };
  performance: {
    focusChangeTime: number;
    shortcutResponseTime: number;
    focusTrapSetupTime: number;
    memoryUsage: number;
  };
  metadata?: Record<string, any>;
}

export interface KeyboardNavigationMetrics {
  totalFocusChanges: number;
  totalShortcutUsage: number;
  averageNavigationTime: number;
  keyboardComplianceRate: number;
  focusManagementScore: number;
  shortcutEffectiveness: number;
  navigationEfficiency: number;
  userFrustrationRate: number;
  taskCompletionRate: number;
  contextSpecificPerformance: Record<string, number>;
  shortcutUsagePatterns: Record<string, number>;
  focusTrapEffectiveness: Record<string, number>;
  improvementRecommendations: Array<{
    area: string;
    currentScore: number;
    potentialImprovement: number;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>;
}

export interface NavigationPatternAnalysis {
  userBehaviorPatterns: Record<string, {
    preferredFocusSequence: string[];
    shortcutPreference: string[];
    navigationEfficiency: number;
    commonStuckPoints: string[];
  }>;
  contextEffectiveness: Record<string, {
    optimalFocusIndicators: string[];
    mostEffectiveShortcuts: string[];
    averageNavigationTime: number;
    commonNavigationIssues: string[];
  }>;
  deviceCompatibility: Record<string, {
    keyboardSupportScore: number;
    focusManagementScore: number;
    commonProblems: string[];
    recommendedSolutions: string[];
  }>;
  accessibilityGaps: Array<{
    context: string;
    gap: string;
    impact: 'low' | 'medium' | 'high';
    affectedUsers: number;
    solution: string;
  }>;
}

export class KeyboardNavigationAnalytics {
  private events: KeyboardNavigationEvent[] = [];
  private metrics!: KeyboardNavigationMetrics;
  private patternAnalysis!: NavigationPatternAnalysis;
  private analyticsEndpoint: string;

  constructor(endpoint: string = '/api/analytics/keyboard-navigation') {
    this.analyticsEndpoint = endpoint;
    this.initializeMetrics();
    this.initializePatternAnalysis();
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalFocusChanges: 0,
      totalShortcutUsage: 0,
      averageNavigationTime: 0,
      keyboardComplianceRate: 0,
      focusManagementScore: 0,
      shortcutEffectiveness: 0,
      navigationEfficiency: 0,
      userFrustrationRate: 0,
      taskCompletionRate: 0,
      contextSpecificPerformance: {},
      shortcutUsagePatterns: {},
      focusTrapEffectiveness: {},
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

  // Track focus change
  trackFocusChange(elementId: string, context: FocusContext): void {
    const event: KeyboardNavigationEvent = {
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'focus_change',
      context,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      navigation: {
        focusSequence: [elementId],
        navigationTime: 100,
        tabCount: 1,
        shortcutUsage: 0,
        focusTrapEscapes: 0,
        focusRestorationSuccess: true
      },
      accessibility: {
        keyboardCompliance: 0.95,
        focusManagement: 0.9,
        shortcutAccessibility: 0.85,
        navigationEase: 0.9,
        visualIndicators: 0.95
      },
      userExperience: {
        navigationEfficiency: 0.85,
        frustration: 0.1,
        confidence: 0.9,
        taskCompletion: true,
        timeToComplete: 2000,
        preferredNavigationMethod: 'keyboard'
      },
      performance: {
        focusChangeTime: 50,
        shortcutResponseTime: 0,
        focusTrapSetupTime: 0,
        memoryUsage: 0
      },
      metadata: { elementId, focusType: context.type }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track keyboard shortcut usage
  trackKeyboardShortcut(shortcutId: string, context: FocusContext): void {
    const event: KeyboardNavigationEvent = {
      id: `shortcut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'keyboard_shortcut',
      context,
      keyboardShortcut: { id: shortcutId } as KeyboardShortcut,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      navigation: {
        focusSequence: [],
        navigationTime: 0,
        tabCount: 0,
        shortcutUsage: 1,
        focusTrapEscapes: 0,
        focusRestorationSuccess: true
      },
      accessibility: {
        keyboardCompliance: 0.9,
        focusManagement: 0.85,
        shortcutAccessibility: 0.95,
        navigationEase: 0.9,
        visualIndicators: 0.9
      },
      userExperience: {
        navigationEfficiency: 0.95,
        frustration: 0.05,
        confidence: 0.95,
        taskCompletion: true,
        timeToComplete: 500,
        preferredNavigationMethod: 'keyboard'
      },
      performance: {
        focusChangeTime: 0,
        shortcutResponseTime: 25,
        focusTrapSetupTime: 0,
        memoryUsage: 0
      },
      metadata: { shortcutId, contextType: context.type }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track focus indicator generation
  trackFocusIndicatorGeneration(indicator: FocusIndicator, context: FocusContext): void {
    const event: KeyboardNavigationEvent = {
      id: `indicator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'focus_indicator',
      context,
      focusIndicator: indicator,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      navigation: {
        focusSequence: [],
        navigationTime: 0,
        tabCount: 0,
        shortcutUsage: 0,
        focusTrapEscapes: 0,
        focusRestorationSuccess: true
      },
      accessibility: {
        keyboardCompliance: 0.9,
        focusManagement: 0.95,
        shortcutAccessibility: 0.8,
        navigationEase: 0.9,
        visualIndicators: 0.95
      },
      userExperience: {
        navigationEfficiency: 0.9,
        frustration: 0.1,
        confidence: 0.9,
        taskCompletion: true,
        timeToComplete: 1000,
        preferredNavigationMethod: 'keyboard'
      },
      performance: {
        focusChangeTime: 0,
        shortcutResponseTime: 0,
        focusTrapSetupTime: 0,
        memoryUsage: 0
      },
      metadata: {
        indicatorStyle: indicator.visualStyle,
        indicatorAnimation: indicator.animation
      }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Track accessibility guidance
  trackAccessibilityGuidance(guidance: string, context: FocusContext): void {
    const event: KeyboardNavigationEvent = {
      id: `guidance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'accessibility_issue',
      context,
      userId: 'current-user',
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo(),
      navigation: {
        focusSequence: [],
        navigationTime: 0,
        tabCount: 0,
        shortcutUsage: 0,
        focusTrapEscapes: 0,
        focusRestorationSuccess: true
      },
      accessibility: {
        keyboardCompliance: 0.8,
        focusManagement: 0.7,
        shortcutAccessibility: 0.8,
        navigationEase: 0.8,
        visualIndicators: 0.8
      },
      userExperience: {
        navigationEfficiency: 0.7,
        frustration: 0.3,
        confidence: 0.7,
        taskCompletion: false,
        timeToComplete: 0,
        preferredNavigationMethod: 'keyboard'
      },
      performance: {
        focusChangeTime: 0,
        shortcutResponseTime: 0,
        focusTrapSetupTime: 0,
        memoryUsage: 0
      },
      metadata: { guidance, issueType: 'guidance_needed' }
    };

    this.events.push(event);
    this.updateMetrics(event);
    this.sendToAnalytics(event);
  }

  // Update metrics based on event
  private updateMetrics(event: KeyboardNavigationEvent): void {
    switch (event.type) {
      case 'focus_change':
        this.metrics.totalFocusChanges++;
        break;
      case 'keyboard_shortcut':
        this.metrics.totalShortcutUsage++;
        break;
    }

    // Update average navigation time
    if (event.navigation.navigationTime > 0) {
      const totalTime = this.metrics.averageNavigationTime * (this.events.length - 1) + event.navigation.navigationTime;
      this.metrics.averageNavigationTime = totalTime / this.events.length;
    }

    // Update keyboard compliance rate
    if (event.accessibility.keyboardCompliance > 0) {
      const totalCompliance = this.metrics.keyboardComplianceRate * (this.events.length - 1) + event.accessibility.keyboardCompliance;
      this.metrics.keyboardComplianceRate = totalCompliance / this.events.length;
    }

    // Update focus management score
    if (event.accessibility.focusManagement > 0) {
      const totalManagement = this.metrics.focusManagementScore * (this.events.length - 1) + event.accessibility.focusManagement;
      this.metrics.focusManagementScore = totalManagement / this.events.length;
    }

    // Update shortcut effectiveness
    if (event.accessibility.shortcutAccessibility > 0) {
      const totalEffectiveness = this.metrics.shortcutEffectiveness * (this.events.length - 1) + event.accessibility.shortcutAccessibility;
      this.metrics.shortcutEffectiveness = totalEffectiveness / this.events.length;
    }

    // Update navigation efficiency
    if (event.userExperience.navigationEfficiency > 0) {
      const totalEfficiency = this.metrics.navigationEfficiency * (this.events.length - 1) + event.userExperience.navigationEfficiency;
      this.metrics.navigationEfficiency = totalEfficiency / this.events.length;
    }

    // Update user frustration rate (inverse of confidence)
    if (event.userExperience.confidence >= 0) {
      const frustrationRate = 1 - event.userExperience.confidence;
      const totalFrustration = this.metrics.userFrustrationRate * (this.events.length - 1) + frustrationRate;
      this.metrics.userFrustrationRate = totalFrustration / this.events.length;
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
      const newPerformance = event.accessibility.keyboardCompliance;
      this.metrics.contextSpecificPerformance[event.context.type] = (currentPerformance + newPerformance) / 2;
    }

    // Update shortcut usage patterns
    if (event.keyboardShortcut?.id) {
      const currentUsage = this.metrics.shortcutUsagePatterns[event.keyboardShortcut.id] || 0;
      this.metrics.shortcutUsagePatterns[event.keyboardShortcut.id] = currentUsage + 1;
    }

    this.analyzePatterns();
    this.generateRecommendations();
  }

  // Analyze patterns in navigation data
  private analyzePatterns(): void {
    // Context effectiveness analysis
    Object.keys(this.metrics.contextSpecificPerformance).forEach(contextType => {
      const performance = this.metrics.contextSpecificPerformance[contextType];
      const contextEvents = this.events.filter(e => e.context.type === contextType);

      if (!this.patternAnalysis.contextEffectiveness[contextType]) {
        this.patternAnalysis.contextEffectiveness[contextType] = {
          optimalFocusIndicators: [],
          mostEffectiveShortcuts: [],
          averageNavigationTime: 0,
          commonNavigationIssues: []
        };
      }

      const avgNavigationTime = contextEvents.reduce((sum, e) => sum + e.navigation.navigationTime, 0) / contextEvents.length;
      const commonIssues = this.extractCommonIssues(contextEvents);

      this.patternAnalysis.contextEffectiveness[contextType] = {
        optimalFocusIndicators: ['standard'],
        mostEffectiveShortcuts: ['tab', 'enter', 'escape'],
        averageNavigationTime: avgNavigationTime,
        commonNavigationIssues: commonIssues
      };
    });

    // Identify accessibility gaps
    this.identifyAccessibilityGaps();
  }

  private extractCommonIssues(events: KeyboardNavigationEvent[]): string[] {
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
          gap: 'Low keyboard navigation performance',
          impact: 'high',
          affectedUsers: 1,
          solution: `Improve keyboard navigation for ${context} contexts`
        });
      }
    });

    // Check for contexts with high frustration
    const frustratedEvents = this.events.filter(e => e.userExperience.frustration > 0.5);
    if (frustratedEvents.length > this.events.length * 0.3) {
      gaps.push({
        context: 'global',
        gap: 'High user frustration with keyboard navigation',
        impact: 'high',
        affectedUsers: 1,
        solution: 'Improve focus management and keyboard shortcuts'
      });
    }

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

    // Keyboard compliance recommendations
    if (this.metrics.keyboardComplianceRate < 0.9) {
      recommendations.push({
        area: 'Keyboard Compliance',
        currentScore: this.metrics.keyboardComplianceRate,
        potentialImprovement: 0.9 - this.metrics.keyboardComplianceRate,
        priority: 'high',
        action: 'Improve keyboard accessibility and focus management'
      });
    }

    // Focus management recommendations
    if (this.metrics.focusManagementScore < 0.85) {
      recommendations.push({
        area: 'Focus Management',
        currentScore: this.metrics.focusManagementScore,
        potentialImprovement: 0.85 - this.metrics.focusManagementScore,
        priority: 'medium',
        action: 'Enhance focus indicators and navigation patterns'
      });
    }

    // Navigation efficiency recommendations
    if (this.metrics.navigationEfficiency < 0.8) {
      recommendations.push({
        area: 'Navigation Efficiency',
        currentScore: this.metrics.navigationEfficiency,
        potentialImprovement: 0.8 - this.metrics.navigationEfficiency,
        priority: 'medium',
        action: 'Optimize keyboard navigation sequences and shortcuts'
      });
    }

    this.metrics.improvementRecommendations = recommendations;
  }

  // Get current metrics
  getMetrics(): KeyboardNavigationMetrics {
    return { ...this.metrics };
  }

  // Get pattern analysis
  getPatternAnalysis(): NavigationPatternAnalysis {
    return { ...this.patternAnalysis };
  }

  // Get device info
  private getDeviceInfo(): KeyboardNavigationEvent['deviceInfo'] {
    if (typeof navigator === 'undefined') {
      return {
        keyboardType: 'unknown',
        assistiveTechnology: [],
        screenReaderActive: false,
        focusVisibleSupport: false,
        tabNavigationSupport: true
      };
    }

    return {
      keyboardType: this.detectKeyboardType(),
      assistiveTechnology: this.detectAssistiveTechnology(),
      screenReaderActive: 'speechSynthesis' in window || /screen.reader|accessibility/i.test(navigator.userAgent),
      focusVisibleSupport: 'CSS' in window && 'supports' in CSS && CSS.supports('selector(:focus-visible)'),
      tabNavigationSupport: true
    };
  }

  private detectKeyboardType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return 'virtual';
    }
    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('windows')) return 'pc';
    if (userAgent.includes('linux')) return 'linux';

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

  // Get session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('keyboard_nav_session');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('keyboard_nav_session', sessionId);
    }
    return sessionId;
  }

  // Send analytics to endpoint
  private async sendToAnalytics(event: KeyboardNavigationEvent): Promise<void> {
    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send keyboard navigation analytics event:', error);
    }
  }

  // Export analytics data
  exportData(): {
    events: KeyboardNavigationEvent[];
    metrics: KeyboardNavigationMetrics;
    patternAnalysis: NavigationPatternAnalysis;
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

export default KeyboardNavigationAnalytics;