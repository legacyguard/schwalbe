/**
 * Error Prevention Types - Shared interfaces for error prevention and recovery systems
 *
 * This file contains all the shared TypeScript interfaces used across
 * error prevention components and utilities to avoid circular dependencies.
 */

// Core error context interface
export interface ErrorContext {
  id: string;
  type: 'validation' | 'network' | 'permission' | 'data' | 'user_input' | 'system' | 'timeout' | 'authentication' | 'authorization' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAction: string;
  userIntent: string;
  emotionalImpact: 'frustration' | 'confusion' | 'anxiety' | 'disappointment' | 'anger';
  emotionalState: 'calm' | 'frustrated' | 'confused' | 'anxious' | 'overwhelmed' | 'tired';
  canRecover: boolean;
  recoveryComplexity: 'simple' | 'moderate' | 'complex';
  preventionOpportunity: boolean;
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  userFrustration?: number; // 0-1 scale
  contextData?: Record<string, any>;
  fallbackMessage?: string;
}

// Prevention action interface
export interface PreventionAction {
  id: string;
  label: string;
  type: 'fix' | 'suggest' | 'automate' | 'guide' | 'prevent';
  automated: boolean;
  requiresConfirmation: boolean;
  estimatedTime: number;
}

// Prevention strategy interface
export interface PreventionStrategy {
  id: string;
  type: 'guidance' | 'validation' | 'restriction' | 'suggestion' | 'automation';
  trigger: 'on_focus' | 'on_change' | 'on_submit' | 'on_error' | 'proactive';
  condition: string;
  message: string;
  sofiaMessage?: string;
  action?: PreventionAction;
  visualStyle: 'subtle' | 'noticeable' | 'prominent' | 'urgent';
  delay?: number;
}

// Error recovery step interface
export interface ErrorRecoveryStep {
  id: string;
  title: string;
  description: string;
  sofiaMessage?: string;
  action: PreventionAction;
  visualStyle: 'guidance' | 'instruction' | 'warning' | 'success';
  estimatedTime: number;
  requiresUserInput: boolean;
  canSkip: boolean;
}

// Error prevention sequence interface
export interface ErrorPreventionSequence {
  id: string;
  name: string;
  description: string;
  context: ProgressiveErrorContext;
  preventionStrategies: PreventionStrategy[];
  recoverySteps: ErrorRecoveryStep[];
  fallbackMessage: string;
  fallbackSofiaMessage?: string;
  estimatedPreventionTime: number;
  estimatedRecoveryTime: number;
}

// Analytics event interface
export interface PreventionAnalyticsEvent {
  id: string;
  timestamp: number;
  type: 'prevention_analysis' | 'prevention_applied' | 'prevention_success' | 'prevention_failure' | 'recovery_started' | 'recovery_step_completed' | 'recovery_success' | 'recovery_failure';
  context: ProgressiveErrorContext;
  strategy?: PreventionStrategy;
  sequence?: ErrorPreventionSequence;
  stepId?: string;
  success: boolean;
  duration?: number;
  userEmotionalState: string;
  userExpertise: string;
  metadata?: Record<string, any>;
}

// Prevention metrics interface
export interface PreventionMetrics {
  totalPreventionAttempts: number;
  successfulPreventions: number;
  failedPreventions: number;
  averagePreventionTime: number;
  preventionSuccessRate: number;
  contextSpecificSuccessRates: Record<string, number>;
  userExpertiseImpact: Record<string, number>;
  emotionalStateCorrelation: Record<string, number>;
  mostEffectiveStrategies: Array<{ strategyId: string; successRate: number; usageCount: number }>;
  commonFailurePatterns: Array<{ contextType: string; failureRate: number; commonReasons: string[] }>;
}

// Recovery analytics interface
export interface RecoveryAnalytics {
  totalRecoverySequences: number;
  successfulRecoveries: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
  stepCompletionRates: Record<string, number>;
  abandonmentRate: number;
  userSatisfactionScores: number[];
  mostEffectiveRecoverySteps: Array<{ stepId: string; successRate: number; averageTime: number }>;
}

// Predictive analytics interface
export interface PredictiveAnalytics {
  errorLikelihoodScores: Record<string, number>;
  preventionOpportunityScores: Record<string, number>;
  userRiskProfiles: Record<string, any>;
  contextualRiskFactors: Record<string, number>;
  recommendedStrategies: Record<string, string[]>;
}

// Progressive Error Recovery Types
export interface RecoveryStep {
  id: string;
  order: number;
  title: string;
  description: string;
  instruction: string;
  visualGuide?: string;
  action: {
    type: 'button' | 'input' | 'navigation' | 'file_upload' | 'permission_grant' | 'verification';
    label: string;
    description: string;
    execute: () => void | Promise<void>;
    requiresConfirmation: boolean;
    estimatedTime: number; // seconds
    successRate: number; // 0-1 scale
  };
  validation: {
    check: () => boolean | Promise<boolean>;
    successMessage: string;
    failureMessage: string;
  };
  help: {
    text: string;
    video?: string;
    examples?: string[];
    tips?: string[];
  };
  accessibility: {
    keyboardShortcut?: string;
    voiceCommand?: string;
    screenReaderText: string;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  emotionalSupport: {
    encouragement: string;
    frustrationHandler: string;
    successCelebration: string;
  };
}

export interface RecoverySequence {
  id: string;
  errorId: string;
  errorType: string;
  context: ProgressiveErrorContext;
  steps: RecoveryStep[];
  totalEstimatedTime: number;
  overallSuccessRate: number;
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalIntensity: 'low' | 'medium' | 'high';
  canSkipSteps: boolean;
  requiresSequentialCompletion: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  checkpointFrequency: number; // Save progress every N steps
  fallbackRecovery?: RecoverySequence;
  timestamp: number;
}

// Enhanced ErrorContext for Progressive Error Recovery
export interface ProgressiveErrorContext extends ErrorContext {
  userIntent: 'create' | 'read' | 'update' | 'delete' | 'navigate' | 'search' | 'upload' | 'download' | 'share' | 'configure';
  previousErrors?: string[];
  errorCount?: number;
  timeSinceLastError?: number;
  sessionDuration?: number;
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  location?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek?: 'weekday' | 'weekend';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  impact?: 'personal' | 'business' | 'financial' | 'legal' | 'health';
  recoveryPriority?: 'immediate' | 'soon' | 'when_convenient' | 'optional';
  userPreferences?: Record<string, any>;
  accessibilityNeeds?: string[];
  language?: string;
  timezone?: string;
}
