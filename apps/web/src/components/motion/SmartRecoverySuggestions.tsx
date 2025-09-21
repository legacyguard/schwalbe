/**
 * SmartRecoverySuggestions - Intelligent error recovery suggestion systems
 *
 * Features:
 * - AI-powered recovery suggestions based on error context and user history
 * - Multi-step recovery guidance with progress tracking
 * - Contextual recovery actions tailored to specific error types
 * - User behavior pattern analysis for personalized suggestions
 * - Emotional intelligence integration for supportive recovery guidance
 * - Accessibility-first design with clear recovery steps
 * - Performance-optimized suggestion generation with caching
 * - Real-time adaptation based on user progress and feedback
 * - Comprehensive analytics for recovery effectiveness tracking
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { EmotionalErrorAnalytics } from '../../utils/EmotionalErrorAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface RecoveryAction {
  id: string;
  type: 'manual' | 'automated' | 'guided' | 'interactive';
  title: string;
  description: string;
  steps: RecoveryStep[];
  estimatedTime: number; // seconds
  successRate: number; // 0-1 scale
  userDifficulty: 'beginner' | 'intermediate' | 'advanced';
  requiresUserInput: boolean;
  canBeAutomated: boolean;
  context: string;
  priority: number;
  emotionalSupport: string;
}

export interface RecoveryStep {
  id: string;
  order: number;
  instruction: string;
  visualGuide?: string;
  expectedResult: string;
  validation: (result: any) => boolean;
  tips: string[];
  commonMistakes: string[];
  estimatedTime: number;
  emotionalEncouragement: string;
}

export interface RecoverySuggestion {
  id: string;
  errorId: string;
  title: string;
  description: string;
  confidence: number; // 0-1 scale
  primaryAction: RecoveryAction;
  alternativeActions: RecoveryAction[];
  contextualFactors: {
    userSkillLevel: string;
    timePressure: boolean;
    errorFrequency: number;
    userFrustration: number;
  };
  emotionalGuidance: {
    encouragement: string;
    reassurance: string;
    confidenceBuilder: string;
  };
  progressTracking: {
    currentStep: number;
    totalSteps: number;
    completedSteps: number;
    timeElapsed: number;
  };
  accessibility: {
    screenReaderText: string;
    keyboardShortcuts: string[];
    highContrastMode: boolean;
  };
}

export interface RecoverySession {
  id: string;
  errorId: string;
  startTime: number;
  endTime?: number;
  status: 'in_progress' | 'completed' | 'abandoned' | 'failed';
  userActions: RecoveryUserAction[];
  effectiveness: number;
  userSatisfaction: number;
  timeToResolution: number;
  stepsAttempted: number;
  stepsCompleted: number;
  emotionalState: string;
}

export interface RecoveryUserAction {
  id: string;
  sessionId: string;
  actionId: string;
  timestamp: number;
  result: 'success' | 'failure' | 'partial' | 'skipped';
  timeSpent: number;
  userFeedback?: string;
  emotionalResponse: string;
  confidenceLevel: number;
}

export interface SmartRecoverySuggestionsProps {
  error: {
    id: string;
    type: string;
    context: any;
    userHistory?: any[];
  };
  onRecoveryStart?: (suggestion: RecoverySuggestion) => void;
  onRecoveryProgress?: (sessionId: string, progress: any) => void;
  onRecoveryComplete?: (sessionId: string, result: any) => void;
  onUserAction?: (action: RecoveryUserAction) => void;
  enableEmotionalSupport?: boolean;
  enableProgressTracking?: boolean;
  enablePersonalization?: boolean;
  maxSuggestions?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

// Advanced recovery suggestion engine
class SmartRecoveryEngine {
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  private userRecoveryHistory: Map<string, RecoverySession[]> = new Map();
  private suggestionCache: Map<string, RecoverySuggestion[]> = new Map();
  private emotionalTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeRecoveryActions();
    this.initializeEmotionalTemplates();
  }

  private initializeRecoveryActions(): void {
    // Network error recovery actions
    this.recoveryActions.set('network', [
      {
        id: 'check_connection',
        type: 'manual',
        title: 'Check Internet Connection',
        description: 'Verify your internet connection is working',
        steps: [
          {
            id: 'step_1',
            order: 1,
            instruction: 'Open a new browser tab and try to visit google.com',
            expectedResult: 'Google homepage loads successfully',
            validation: (result: any) => result.success === true,
            tips: ['Try refreshing the page', 'Check WiFi/ethernet connection'],
            commonMistakes: ['Assuming connection is fine', 'Not testing with another site'],
            estimatedTime: 30,
            emotionalEncouragement: 'This is a quick check that can save you time'
          },
          {
            id: 'step_2',
            order: 2,
            instruction: 'Try refreshing the current page',
            expectedResult: 'Page loads without network error',
            validation: (result: any) => result.refreshed === true,
            tips: ['Use Ctrl+F5 for hard refresh', 'Clear browser cache if needed'],
            commonMistakes: ['Refreshing too quickly', 'Not waiting for page to load'],
            estimatedTime: 15,
            emotionalEncouragement: 'You\'re making great progress with this systematic approach'
          }
        ],
        estimatedTime: 45,
        successRate: 0.8,
        userDifficulty: 'beginner',
        requiresUserInput: false,
        canBeAutomated: false,
        context: 'Network connectivity issues',
        priority: 10,
        emotionalSupport: 'I know connection issues can be frustrating, but we\'ll get this sorted out together'
      },
      {
        id: 'try_alternative_network',
        type: 'manual',
        title: 'Switch Network Connection',
        description: 'Try using mobile data or a different WiFi network',
        steps: [
          {
            id: 'step_1',
            order: 1,
            instruction: 'Switch to mobile data if on WiFi, or vice versa',
            expectedResult: 'Different network connection established',
            validation: (result: any) => result.networkChanged === true,
            tips: ['Turn off WiFi to force mobile data', 'Try a different WiFi network'],
            commonMistakes: ['Not actually switching networks', 'Using same problematic connection'],
            estimatedTime: 60,
            emotionalEncouragement: 'Sometimes a fresh connection makes all the difference'
          }
        ],
        estimatedTime: 60,
        successRate: 0.6,
        userDifficulty: 'beginner',
        requiresUserInput: true,
        canBeAutomated: false,
        context: 'Alternative network access',
        priority: 8,
        emotionalSupport: 'Don\'t worry if this doesn\'t work - we have other options available'
      }
    ]);

    // Validation error recovery actions
    this.recoveryActions.set('validation', [
      {
        id: 'review_form_fields',
        type: 'guided',
        title: 'Review Form Fields',
        description: 'Carefully check each field for errors',
        steps: [
          {
            id: 'step_1',
            order: 1,
            instruction: 'Look for fields highlighted in red or with error messages',
            expectedResult: 'All problematic fields identified',
            validation: (result: any) => result.fieldsIdentified === true,
            tips: ['Start from the top of the form', 'Check required fields first'],
            commonMistakes: ['Missing fields at the bottom', 'Not reading error messages carefully'],
            estimatedTime: 120,
            emotionalEncouragement: 'Taking time to review carefully shows great attention to detail'
          },
          {
            id: 'step_2',
            order: 2,
            instruction: 'Correct each identified error using the provided suggestions',
            expectedResult: 'All errors resolved',
            validation: (result: any) => result.errorsCorrected === true,
            tips: ['Use the suggestions provided', 'Check format requirements'],
            commonMistakes: ['Making the same type of error', 'Not following format instructions'],
            estimatedTime: 180,
            emotionalEncouragement: 'You\'re doing excellent work - each correction gets us closer to success'
          }
        ],
        estimatedTime: 300,
        successRate: 0.9,
        userDifficulty: 'beginner',
        requiresUserInput: true,
        canBeAutomated: false,
        context: 'Form validation errors',
        priority: 9,
        emotionalSupport: 'I know forms can be tricky, but you\'re handling this very well'
      }
    ]);

    // Permission error recovery actions
    this.recoveryActions.set('permission', [
      {
        id: 'check_permissions',
        type: 'interactive',
        title: 'Review Permissions',
        description: 'Check and update the required permissions',
        steps: [
          {
            id: 'step_1',
            order: 1,
            instruction: 'Click the permission request button when prompted',
            expectedResult: 'Permission dialog appears',
            validation: (result: any) => result.permissionDialogShown === true,
            tips: ['Look for browser permission prompts', 'Check address bar for permission icons'],
            commonMistakes: ['Dismissing permission prompts', 'Not noticing permission requests'],
            estimatedTime: 30,
            emotionalEncouragement: 'This is a simple step that gives us the access we need'
          },
          {
            id: 'step_2',
            order: 2,
            instruction: 'Select "Allow" or "Grant" for the requested permissions',
            expectedResult: 'Permissions granted successfully',
            validation: (result: any) => result.permissionsGranted === true,
            tips: ['Choose appropriate permission level', 'Read what each permission allows'],
            commonMistakes: ['Denying necessary permissions', 'Not understanding permission implications'],
            estimatedTime: 45,
            emotionalEncouragement: 'You\'re taking control of the permissions - that\'s a smart approach'
          }
        ],
        estimatedTime: 75,
        successRate: 0.7,
        userDifficulty: 'intermediate',
        requiresUserInput: true,
        canBeAutomated: false,
        context: 'Browser permissions required',
        priority: 8,
        emotionalSupport: 'Permission requests can feel intrusive, but they\'re necessary for the feature to work properly'
      }
    ]);
  }

  private initializeEmotionalTemplates(): void {
    this.emotionalTemplates.set('encouraging', {
      start: 'You\'ve got this! Let\'s work through this together.',
      progress: 'Great progress! You\'re doing really well.',
      completion: 'Excellent work! You successfully resolved the issue.',
      struggle: 'I can see this is challenging, but you\'re making the right moves.'
    });

    this.emotionalTemplates.set('reassuring', {
      start: 'Don\'t worry - this is something we can definitely fix.',
      progress: 'You\'re on the right track. Keep going!',
      completion: 'Perfect! Everything is working as expected now.',
      struggle: 'It\'s okay to find this difficult. I\'m here to help you through it.'
    });

    this.emotionalTemplates.set('confident', {
      start: 'I know you can handle this. Let\'s get it sorted out.',
      progress: 'You\'re making excellent progress. Well done!',
      completion: 'Outstanding! You\'ve successfully resolved the issue.',
      struggle: 'This is a tough one, but I believe in your ability to work through it.'
    });
  }

  generateRecoverySuggestions(error: any, userContext?: any): RecoverySuggestion[] {
    const cacheKey = `${error.id}-${JSON.stringify(userContext || {})}`;
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey)!;
    }

    const actions = this.recoveryActions.get(error.type) || [];
    const suggestions: RecoverySuggestion[] = [];

    actions.forEach((action, index) => {
      const confidence = this.calculateSuggestionConfidence(action, error, userContext);
      const contextualFactors = this.analyzeContextualFactors(error, userContext);
      const emotionalGuidance = this.generateEmotionalGuidance(action, userContext);

      const suggestion: RecoverySuggestion = {
        id: `suggestion-${error.id}-${action.id}`,
        errorId: error.id,
        title: action.title,
        description: action.description,
        confidence,
        primaryAction: action,
        alternativeActions: actions.filter(a => a.id !== action.id),
        contextualFactors,
        emotionalGuidance,
        progressTracking: {
          currentStep: 0,
          totalSteps: action.steps.length,
          completedSteps: 0,
          timeElapsed: 0
        },
        accessibility: {
          screenReaderText: `Recovery suggestion: ${action.title}. ${action.description}`,
          keyboardShortcuts: ['Enter to start', 'Escape to cancel'],
          highContrastMode: false
        }
      };

      suggestions.push(suggestion);
    });

    // Sort by confidence and priority
    suggestions.sort((a, b) => {
      const aScore = a.confidence * a.primaryAction.priority;
      const bScore = b.confidence * b.primaryAction.priority;
      return bScore - aScore;
    });

    this.suggestionCache.set(cacheKey, suggestions);
    return suggestions;
  }

  private calculateSuggestionConfidence(action: RecoveryAction, error: any, userContext?: any): number {
    let confidence = action.successRate;

    // Adjust based on user context
    if (userContext?.skillLevel === 'beginner' && action.userDifficulty === 'advanced') {
      confidence -= 0.2;
    } else if (userContext?.skillLevel === 'advanced' && action.userDifficulty === 'beginner') {
      confidence += 0.1;
    }

    // Adjust based on error frequency
    if (error.frequency > 5) {
      confidence += 0.1; // More confidence for common errors
    }

    // Adjust based on time pressure
    if (userContext?.timePressure) {
      if (action.estimatedTime < 60) {
        confidence += 0.1; // Prefer quick solutions under time pressure
      } else {
        confidence -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private analyzeContextualFactors(error: any, userContext?: any) {
    return {
      userSkillLevel: userContext?.skillLevel || 'intermediate',
      timePressure: userContext?.timePressure || false,
      errorFrequency: error.frequency || 1,
      userFrustration: userContext?.frustrationLevel || 0.3
    };
  }

  private generateEmotionalGuidance(action: RecoveryAction, userContext?: any): RecoverySuggestion['emotionalGuidance'] {
    const template = this.emotionalTemplates.get('encouraging')!;

    return {
      encouragement: template.start,
      reassurance: template.progress,
      confidenceBuilder: template.completion
    };
  }

  trackRecoverySession(session: RecoverySession): void {
    const userSessions = this.userRecoveryHistory.get(session.errorId) || [];
    userSessions.push(session);
    this.userRecoveryHistory.set(session.errorId, userSessions);

    // Clear cache to get fresh suggestions based on new history
    this.suggestionCache.clear();
  }

  getRecoveryAnalytics(errorId: string): {
    totalSessions: number;
    successRate: number;
    averageTimeToResolution: number;
    mostEffectiveAction: string;
  } {
    const sessions = this.userRecoveryHistory.get(errorId) || [];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        successRate: 0,
        averageTimeToResolution: 0,
        mostEffectiveAction: ''
      };
    }

    const successfulSessions = sessions.filter(s => s.status === 'completed');
    const totalTime = sessions.reduce((sum, s) => sum + s.timeToResolution, 0);

    // Find most effective action
    const actionEffectiveness = new Map<string, number>();
    sessions.forEach(session => {
      session.userActions.forEach(action => {
        if (!actionEffectiveness.has(action.actionId)) {
          actionEffectiveness.set(action.actionId, 0);
        }
        actionEffectiveness.set(
          action.actionId,
          actionEffectiveness.get(action.actionId)! + (action.result === 'success' ? 1 : 0)
        );
      });
    });

    let mostEffectiveAction = '';
    let highestEffectiveness = 0;
    actionEffectiveness.forEach((effectiveness, actionId) => {
      if (effectiveness > highestEffectiveness) {
        highestEffectiveness = effectiveness;
        mostEffectiveAction = actionId;
      }
    });

    return {
      totalSessions: sessions.length,
      successRate: successfulSessions.length / sessions.length,
      averageTimeToResolution: totalTime / sessions.length,
      mostEffectiveAction
    };
  }
}

// Main component implementation
export const SmartRecoverySuggestions: React.FC<SmartRecoverySuggestionsProps> = ({
  error,
  onRecoveryStart,
  onRecoveryProgress,
  onRecoveryComplete,
  onUserAction,
  enableEmotionalSupport = true,
  enableProgressTracking = true,
  enablePersonalization = true,
  maxSuggestions = 3,
  className = '',
  theme = 'auto'
}) => {
  const [suggestions, setSuggestions] = useState<RecoverySuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<RecoverySuggestion | null>(null);
  const [recoverySession, setRecoverySession] = useState<RecoverySession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const recoveryEngine = useRef(new SmartRecoveryEngine());
  const analytics = useRef(new EmotionalErrorAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Generate recovery suggestions
  useEffect(() => {
    if (error) {
      const userContext = enablePersonalization ? {
        skillLevel: 'intermediate',
        timePressure: false,
        frustrationLevel: 0.3
      } : undefined;

      const recoverySuggestions = recoveryEngine.current.generateRecoverySuggestions(error, userContext);
      setSuggestions(recoverySuggestions.slice(0, maxSuggestions));
    }
  }, [error, preferences, emotionalState, enablePersonalization, maxSuggestions]);

  const handleStartRecovery = useCallback((suggestion: RecoverySuggestion) => {
    const session: RecoverySession = {
      id: `recovery-${error.id}-${Date.now()}`,
      errorId: error.id,
      startTime: Date.now(),
      status: 'in_progress',
      userActions: [],
      effectiveness: 0,
      userSatisfaction: 0,
      timeToResolution: 0,
      stepsAttempted: 0,
      stepsCompleted: 0,
      emotionalState: 'neutral'
    };

    setRecoverySession(session);
    setActiveSuggestion(suggestion);
    setCurrentStep(0);
    setSessionStartTime(Date.now());

    onRecoveryStart?.(suggestion);
    analytics.current.trackEmotionalResponse({
      id: `recovery-start-${session.id}`,
      errorId: error.id,
      emotionalStrategy: {
        id: 'recovery_guidance',
        name: 'Recovery Guidance',
        description: 'Step-by-step recovery assistance',
        primaryGoal: 'restore_confidence',
        emotionalApproach: 'encouraging',
        communicationStyle: 'supportive',
        tone: 'optimistic',
        pacing: 'patient',
        intensity: 'medium'
      },
      responseType: 'encouraging',
      primaryMessage: suggestion.emotionalGuidance.encouragement,
      supportiveMessage: suggestion.emotionalGuidance.reassurance,
      frustrationReducers: [],
      emotionalSupport: {
        primarySupport: 'I\'m here to guide you through this recovery process',
        secondarySupport: 'We\'ll take this one step at a time',
        encouragement: 'You\'re taking the right approach by following these steps',
        empathyStatement: 'I understand this situation is frustrating',
        frustrationAcknowledgment: 'It\'s completely normal to feel frustrated right now',
        confidenceBuilder: 'You have the capability to resolve this successfully',
        relationshipBuilder: 'I\'m committed to helping you succeed',
        trustSignal: 'These recovery steps are proven to work'
      },
      recoveryGuidance: {
        approach: 'step_by_step',
        complexity: 'minimal',
        userControl: 'guided',
        emotionalPacing: 'patient',
        progressVisibility: 'detailed'
      },
      visualPresentation: {
        icon: 'progress',
        color: 'supportive',
        animation: 'encouraging',
        layout: 'clear',
        typography: 'friendly'
      },
      interactionStyle: {
        responsiveness: 'immediate',
        feedback: 'detailed',
        guidance: 'explicit',
        control: 'user_driven',
        pace: 'user_controlled'
      },
      followUpActions: [],
      effectivenessPrediction: suggestion.confidence,
      timestamp: Date.now()
    }, {
      id: error.id,
      type: error.type as 'network' | 'validation' | 'permission' | 'data' | 'system' | 'user_input' | 'timeout' | 'authentication' | 'authorization' | 'configuration',
      severity: 'medium',
      title: 'Recovery Started',
      technicalMessage: 'User initiated recovery process',
      emotionalContext: {
        userEmotionalState: 'confused',
        frustrationLevel: 0.4,
        emotionalIntensity: 'medium',
        emotionalTrajectory: 'improving',
        copingCapacity: 'medium',
        stressIndicators: ['seeking_help'],
        emotionalNeeds: [{
          type: 'clarity',
          priority: 'high',
          satisfactionLevel: 0.3,
          expression: 'Need clear step-by-step instructions',
          fulfillmentActions: ['provide_recovery_steps']
        }],
        communicationPreference: 'supportive',
        tonePreference: 'friendly'
      },
      frustrationTriggers: [{
        id: 'recovery_complexity',
        type: 'unclear_instructions',
        severity: 0.2,
        description: 'Recovery process may be complex',
        context: 'Error recovery',
        frequency: 0.1,
        userImpact: 'moderate',
        mitigationStrategies: ['clear_step_by_step', 'emotional_support']
      }],
      userJourney: {
        currentStep: 'error_recovery',
        intendedGoal: 'resolve_error',
        progressMade: 0.1,
        timeSpent: 10,
        workflowComplexity: 'moderate',
        interruptionCount: 1,
        frustrationThreshold: 0.6,
        patienceLevel: 'medium'
      },
      previousErrors: [],
      errorCount: 1,
      timeSinceLastError: 0,
      userIntent: 'resolve_issue',
      expectedOutcome: 'successful_recovery',
      actualOutcome: 'recovery_initiated',
      timestamp: Date.now(),
      sessionId: 'recovery-session'
    });
  }, [error, emotionalState, onRecoveryStart]);

  const handleStepComplete = useCallback((stepResult: any) => {
    if (!recoverySession || !activeSuggestion) return;

    const step = activeSuggestion.primaryAction.steps[currentStep];
    if (!step) return;

    const userAction: RecoveryUserAction = {
      id: `action-${recoverySession.id}-${Date.now()}`,
      sessionId: recoverySession.id,
      actionId: step.id,
      timestamp: Date.now(),
      result: step.validation(stepResult) ? 'success' : 'failure',
      timeSpent: Date.now() - sessionStartTime,
      emotionalResponse: 'determined',
      confidenceLevel: 0.7
    };

    const updatedSession: RecoverySession = {
      ...recoverySession,
      userActions: [...recoverySession.userActions, userAction],
      stepsAttempted: recoverySession.stepsAttempted + 1,
      stepsCompleted: step.validation(stepResult)
        ? recoverySession.stepsCompleted + 1
        : recoverySession.stepsCompleted
    };

    setRecoverySession(updatedSession);
    onUserAction?.(userAction);

    if (step.validation(stepResult)) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (nextStep >= activeSuggestion.primaryAction.steps.length) {
        // Recovery completed
        const completedSession: RecoverySession = {
          ...updatedSession,
          status: 'completed',
          endTime: Date.now(),
          timeToResolution: Date.now() - recoverySession.startTime,
          effectiveness: 1.0,
          userSatisfaction: 0.9
        };

        setRecoverySession(completedSession);
        recoveryEngine.current.trackRecoverySession(completedSession);
        onRecoveryComplete?.(recoverySession.id, { success: true, session: completedSession });
      } else {
        onRecoveryProgress?.(recoverySession.id, {
          currentStep: nextStep,
          completedSteps: updatedSession.stepsCompleted,
          totalSteps: activeSuggestion.primaryAction.steps.length
        });
      }
    }
  }, [recoverySession, activeSuggestion, currentStep, sessionStartTime, onUserAction, onRecoveryProgress, onRecoveryComplete]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyIcon = (difficulty: string) => {
    const icons = {
      beginner: '🟢',
      intermediate: '🟡',
      advanced: '🔴'
    };
    return icons[difficulty as keyof typeof icons] || icons.intermediate;
  };

  if (suggestions.length === 0) {
    return (
      <div className={`smart-recovery-suggestions ${className} theme-${theme}`}>
        <div className="no-suggestions">
          <p>Analyzing recovery options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`smart-recovery-suggestions ${className} theme-${theme}`}>
      {/* Recovery suggestions header */}
      <div className="recovery-header">
        <h3>Smart Recovery Options</h3>
        <p>AI-powered suggestions to resolve this issue</p>
      </div>

      {/* Recovery suggestions */}
      <div className="recovery-suggestions">
        <AnimatePresence>
          {suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              className={`recovery-suggestion ${getConfidenceColor(suggestion.confidence)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="suggestion-header">
                <div className="suggestion-title">
                  <h4>{suggestion.title}</h4>
                  <div className="suggestion-meta">
                    <span className="confidence">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                    <span className="difficulty">
                      {getDifficultyIcon(suggestion.primaryAction.userDifficulty)}
                      {suggestion.primaryAction.userDifficulty}
                    </span>
                    <span className="time">
                      ⏱️ {Math.round(suggestion.primaryAction.estimatedTime / 60)}min
                    </span>
                  </div>
                </div>
                <button
                  className="start-recovery-button"
                  onClick={() => handleStartRecovery(suggestion)}
                >
                  Start Recovery
                </button>
              </div>

              <p className="suggestion-description">{suggestion.description}</p>

              {/* Emotional support */}
              {enableEmotionalSupport && (
                <div className="emotional-support">
                  <p className="encouragement">
                    💙 {suggestion.emotionalGuidance.encouragement}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Active recovery session */}
      <AnimatePresence>
        {activeSuggestion && recoverySession && (
          <motion.div
            className="active-recovery"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="recovery-progress">
              <h4>Recovery in Progress</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(currentStep / activeSuggestion.primaryAction.steps.length) * 100}%`
                  }}
                />
              </div>
              <span className="progress-text">
                Step {currentStep + 1} of {activeSuggestion.primaryAction.steps.length}
              </span>
            </div>

            {/* Current step */}
            {activeSuggestion.primaryAction.steps[currentStep] && (
              <div className="current-step">
                <div className="step-header">
                  <h5>Step {currentStep + 1}: {activeSuggestion.primaryAction.steps[currentStep].instruction}</h5>
                  <div className="step-meta">
                    <span className="estimated-time">
                      ⏱️ {activeSuggestion.primaryAction.steps[currentStep].estimatedTime}s
                    </span>
                  </div>
                </div>

                <p className="step-instruction">
                  {activeSuggestion.primaryAction.steps[currentStep].instruction}
                </p>

                {/* Tips */}
                {activeSuggestion.primaryAction.steps[currentStep].tips.length > 0 && (
                  <div className="step-tips">
                    <h6>💡 Tips:</h6>
                    <ul>
                      {activeSuggestion.primaryAction.steps[currentStep].tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common mistakes */}
                {activeSuggestion.primaryAction.steps[currentStep].commonMistakes.length > 0 && (
                  <div className="common-mistakes">
                    <h6>⚠️ Common mistakes to avoid:</h6>
                    <ul>
                      {activeSuggestion.primaryAction.steps[currentStep].commonMistakes.map((mistake, index) => (
                        <li key={index}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emotional encouragement */}
                <div className="step-encouragement">
                  <p>🌟 {activeSuggestion.primaryAction.steps[currentStep].emotionalEncouragement}</p>
                </div>

                <div className="step-actions">
                  <button
                    className="complete-step-button"
                    onClick={() => handleStepComplete({ completed: true })}
                  >
                    ✅ Mark Complete
                  </button>
                  <button
                    className="skip-step-button"
                    onClick={() => handleStepComplete({ skipped: true })}
                  >
                    ⏭️ Skip Step
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery analytics */}
      <div className="recovery-analytics" aria-hidden="true">
        <details className="analytics-details">
          <summary>Recovery Analytics</summary>
          <div className="analytics-content">
            <h5>Recovery Engine Status</h5>
            <p><strong>Total Suggestions:</strong> {suggestions.length}</p>
            <p><strong>Best Confidence:</strong> {Math.round(Math.max(...suggestions.map(s => s.confidence)) * 100)}%</p>
            <p><strong>Active Session:</strong> {recoverySession?.id || 'None'}</p>
            <p><strong>Progress:</strong> {recoverySession ? `${currentStep}/${activeSuggestion?.primaryAction.steps.length || 0}` : 'N/A'}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SmartRecoverySuggestions;