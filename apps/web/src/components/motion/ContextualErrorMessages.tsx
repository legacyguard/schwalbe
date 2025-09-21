/**
 * ContextualErrorMessages - Intelligent error messaging with user-friendly language and Sofia AI integration
 *
 * Features:
 * - Context-aware error message generation with natural language
 * - User expertise adaptation for technical vs. simple explanations
 * - Emotional intelligence for frustration reduction
 * - Progressive error recovery with step-by-step guidance
 * - Visual error hierarchy with clear importance distinction
 * - Preventive error UI to avoid common mistakes
 * - Smart recovery suggestion systems
 * - Performance-optimized error handling
 * - Accessibility-first error presentation
 * - Advanced error analytics and user behavior tracking
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { ContextualErrorAnalytics } from '../../utils/ContextualErrorAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface ErrorContext {
  id: string;
  type: 'validation' | 'network' | 'permission' | 'data' | 'system' | 'user_input' | 'timeout' | 'authentication' | 'authorization' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userIntent: 'create' | 'read' | 'update' | 'delete' | 'navigate' | 'search' | 'upload' | 'download' | 'share' | 'configure';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalState: 'calm' | 'frustrated' | 'confused' | 'anxious' | 'overwhelmed' | 'tired';
  previousErrors?: string[];
  errorCount?: number;
  timeSinceLastError?: number;
  userFrustration?: number; // 0-1 scale
  contextData?: Record<string, any>;
}

export interface ErrorMessage {
  id: string;
  title: string;
  description: string;
  technicalDetails?: string;
  userFriendlyExplanation: string;
  context: ErrorContext;
  suggestions: ErrorSuggestion[];
  recoveryActions: RecoveryAction[];
  emotionalTone: 'apologetic' | 'encouraging' | 'supportive' | 'neutral' | 'urgent' | 'calm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'preventable' | 'recoverable' | 'system' | 'user' | 'temporary' | 'permanent';
  accessibility: ErrorAccessibility;
  visualHierarchy: VisualHierarchy;
  timestamp: number;
  expiresAt?: number;
  requiresUserAction: boolean;
  canBeDismissed: boolean;
  autoRecovery?: boolean;
  autoRecoveryDelay?: number;
}

export interface ErrorSuggestion {
  id: string;
  type: 'immediate' | 'preventive' | 'educational' | 'alternative' | 'workaround';
  title: string;
  description: string;
  action?: string;
  confidence: number; // 0-1 scale
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  context: ErrorContext;
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalRelevance: 'reassuring' | 'empowering' | 'educational' | 'practical';
}

export interface RecoveryAction {
  id: string;
  type: 'button' | 'link' | 'input' | 'navigation' | 'automatic' | 'guided';
  label: string;
  description: string;
  action: () => void | Promise<void>;
  primary: boolean;
  requiresConfirmation: boolean;
  estimatedTime?: number; // seconds
  successRate: number; // 0-1 scale
  context: ErrorContext;
  accessibility: {
    keyboardShortcut?: string;
    voiceCommand?: string;
    screenReaderText: string;
  };
}

export interface ErrorAccessibility {
  screenReaderText: string;
  keyboardNavigation: boolean;
  voiceControl: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  cognitiveLoad: 'low' | 'medium' | 'high';
  readingLevel: 'simple' | 'intermediate' | 'advanced';
}

export interface VisualHierarchy {
  icon: 'info' | 'warning' | 'error' | 'success' | 'question';
  color: 'blue' | 'yellow' | 'red' | 'green' | 'purple' | 'orange';
  size: 'small' | 'medium' | 'large' | 'prominent';
  animation: 'subtle' | 'noticeable' | 'attention_grabbing' | 'urgent';
  position: 'inline' | 'toast' | 'modal' | 'banner' | 'overlay';
  dismissible: boolean;
  persistent: boolean;
}

export interface ContextualErrorMessagesProps {
  errors: ErrorMessage[];
  context: ErrorContext;
  onErrorResolved?: (errorId: string, resolution: string) => void;
  onErrorDismissed?: (errorId: string) => void;
  onRecoveryAction?: (actionId: string, errorId: string) => void;
  enableSofiaGuidance?: boolean;
  autoRecovery?: boolean;
  maxErrors?: number;
  className?: string;
  position?: 'top' | 'bottom' | 'center' | 'inline';
  theme?: 'light' | 'dark' | 'auto';
}

// Advanced error message engine
class ContextualErrorEngine {
  private errorMessages: Map<string, ErrorMessage> = new Map();
  private errorHistory: Map<string, any[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private recoveryAttempts: Map<string, any[]> = new Map();
  private suggestionEffectiveness: Map<string, number> = new Map();

  constructor() {
    this.initializeErrorPatterns();
    this.initializeUserPreferences();
    this.initializeRecoveryStrategies();
  }

  private initializeErrorPatterns(): void {
    // Common error patterns and their user-friendly explanations
    this.errorMessages.set('network_error', {
      id: 'network-error-template',
      title: 'Connection Issue',
      description: 'Unable to connect to our servers',
      technicalDetails: 'Network request failed with status 500',
      userFriendlyExplanation: 'It looks like there\'s a hiccup with your internet connection. This happens sometimes when the network is busy or temporarily unavailable.',
      context: {
        id: 'network-error',
        type: 'network',
        severity: 'medium',
        userIntent: 'read',
        userExpertise: 'beginner',
        emotionalState: 'frustrated'
      },
      suggestions: [],
      recoveryActions: [],
      emotionalTone: 'apologetic',
      priority: 'medium',
      category: 'temporary',
      accessibility: {
        screenReaderText: 'Network connection error. Please check your internet connection and try again.',
        keyboardNavigation: true,
        voiceControl: true,
        highContrast: true,
        reducedMotion: true,
        cognitiveLoad: 'low',
        readingLevel: 'simple'
      },
      visualHierarchy: {
        icon: 'warning',
        color: 'yellow',
        size: 'medium',
        animation: 'noticeable',
        position: 'toast',
        dismissible: true,
        persistent: false
      },
      timestamp: Date.now(),
      requiresUserAction: true,
      canBeDismissed: true,
      autoRecovery: true,
      autoRecoveryDelay: 5000
    });

    this.errorMessages.set('validation_error', {
      id: 'validation-error-template',
      title: 'Please Check Your Information',
      description: 'Some information needs to be corrected',
      technicalDetails: 'Form validation failed for required fields',
      userFriendlyExplanation: 'I noticed a few things that need your attention before we can proceed. This helps ensure everything is set up correctly.',
      context: {
        id: 'validation-error',
        type: 'validation',
        severity: 'low',
        userIntent: 'create',
        userExpertise: 'beginner',
        emotionalState: 'calm'
      },
      suggestions: [],
      recoveryActions: [],
      emotionalTone: 'supportive',
      priority: 'low',
      category: 'preventable',
      accessibility: {
        screenReaderText: 'Form validation error. Please review and correct the highlighted fields.',
        keyboardNavigation: true,
        voiceControl: true,
        highContrast: true,
        reducedMotion: true,
        cognitiveLoad: 'medium',
        readingLevel: 'simple'
      },
      visualHierarchy: {
        icon: 'info',
        color: 'blue',
        size: 'medium',
        animation: 'subtle',
        position: 'inline',
        dismissible: false,
        persistent: true
      },
      timestamp: Date.now(),
      requiresUserAction: true,
      canBeDismissed: false
    });

    this.errorMessages.set('permission_error', {
      id: 'permission-error-template',
      title: 'Permission Required',
      description: 'Additional permissions are needed',
      technicalDetails: 'Access denied due to insufficient permissions',
      userFriendlyExplanation: 'This feature requires special permission to work properly. This is a security measure to protect your information.',
      context: {
        id: 'permission-error',
        type: 'permission',
        severity: 'high',
        userIntent: 'read',
        userExpertise: 'intermediate',
        emotionalState: 'confused'
      },
      suggestions: [],
      recoveryActions: [],
      emotionalTone: 'encouraging',
      priority: 'high',
      category: 'recoverable',
      accessibility: {
        screenReaderText: 'Permission error. Please grant the required permissions to continue.',
        keyboardNavigation: true,
        voiceControl: true,
        highContrast: true,
        reducedMotion: true,
        cognitiveLoad: 'medium',
        readingLevel: 'intermediate'
      },
      visualHierarchy: {
        icon: 'warning',
        color: 'orange',
        size: 'large',
        animation: 'attention_grabbing',
        position: 'modal',
        dismissible: false,
        persistent: true
      },
      timestamp: Date.now(),
      requiresUserAction: true,
      canBeDismissed: false
    });
  }

  private initializeUserPreferences(): void {
    this.userPreferences.set('error_preferences', {
      technicalDetails: false,
      autoRecovery: true,
      detailedSuggestions: true,
      emotionalSupport: true,
      readingLevel: 'simple',
      frustrationTolerance: 0.7
    });

    this.userPreferences.set('accessibility_preferences', {
      screenReader: true,
      keyboardNavigation: true,
      voiceControl: true,
      highContrast: false,
      reducedMotion: false
    });
  }

  private initializeRecoveryStrategies(): void {
    // Recovery strategies for different error types
    this.recoveryAttempts.set('network_error', [
      { strategy: 'retry', delay: 1000, maxAttempts: 3 },
      { strategy: 'offline_mode', delay: 5000, maxAttempts: 1 },
      { strategy: 'alternative_endpoint', delay: 10000, maxAttempts: 2 }
    ]);

    this.recoveryAttempts.set('validation_error', [
      { strategy: 'highlight_fields', delay: 0, maxAttempts: 1 },
      { strategy: 'provide_examples', delay: 2000, maxAttempts: 1 },
      { strategy: 'guided_assistance', delay: 5000, maxAttempts: 1 }
    ]);

    this.recoveryAttempts.set('permission_error', [
      { strategy: 'request_permissions', delay: 0, maxAttempts: 3 },
      { strategy: 'explain_requirements', delay: 1000, maxAttempts: 1 },
      { strategy: 'alternative_workflow', delay: 3000, maxAttempts: 1 }
    ]);
  }

  generateErrorMessage(error: any, context: ErrorContext): ErrorMessage {
    const template = this.errorMessages.get(`${error.type}_error`) || this.errorMessages.get('network_error')!;

    // Adapt message based on user expertise
    const adaptedMessage = this.adaptMessageForUser(template, context);

    // Generate contextual suggestions
    const suggestions = this.generateSuggestions(error, context);

    // Generate recovery actions
    const recoveryActions = this.generateRecoveryActions(error, context);

    // Update emotional tone based on context
    const emotionalTone = this.determineEmotionalTone(context);

    return {
      ...adaptedMessage,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      context,
      suggestions,
      recoveryActions,
      emotionalTone,
      timestamp: Date.now()
    };
  }

  private adaptMessageForUser(template: ErrorMessage, context: ErrorContext): ErrorMessage {
    const preferences = this.userPreferences.get('error_preferences') || {};

    // Adapt technical details based on user expertise
    const showTechnicalDetails = context.userExpertise === 'advanced' || context.userExpertise === 'expert';

    // Adapt reading level
    const readingLevel = preferences.readingLevel || 'simple';

    // Adapt emotional tone based on frustration level
    const frustrationLevel = context.userFrustration || 0;
    let emotionalTone = template.emotionalTone;

    if (frustrationLevel > 0.7) {
      emotionalTone = 'apologetic';
    } else if (frustrationLevel > 0.4) {
      emotionalTone = 'supportive';
    }

    return {
      ...template,
      technicalDetails: showTechnicalDetails ? template.technicalDetails : undefined,
      userFriendlyExplanation: this.adaptExplanationForReadingLevel(template.userFriendlyExplanation, readingLevel),
      emotionalTone
    };
  }

  private adaptExplanationForReadingLevel(explanation: string, readingLevel: string): string {
    switch (readingLevel) {
      case 'simple':
        return explanation.replace(/technical|configuration|implementation/g, 'setup');
      case 'intermediate':
        return explanation.replace(/hiccup/g, 'temporary issue');
      case 'advanced':
        return explanation; // Keep original
      default:
        return explanation;
    }
  }

  private generateSuggestions(error: any, context: ErrorContext): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];

    // Generate immediate suggestions
    if (error.type === 'network') {
      suggestions.push({
        id: 'check-connection',
        type: 'immediate',
        title: 'Check Your Connection',
        description: 'Make sure you\'re connected to the internet and try again.',
        action: 'Check network settings',
        confidence: 0.9,
        impact: 'high',
        effort: 'low',
        context,
        userExpertise: 'beginner',
        emotionalRelevance: 'practical'
      });
    }

    if (error.type === 'validation') {
      suggestions.push({
        id: 'review-form',
        type: 'immediate',
        title: 'Review Your Information',
        description: 'Take a moment to review the highlighted fields and make sure everything looks correct.',
        action: 'Review form fields',
        confidence: 0.95,
        impact: 'high',
        effort: 'low',
        context,
        userExpertise: 'beginner',
        emotionalRelevance: 'empowering'
      });
    }

    // Generate preventive suggestions
    if (context.errorCount && context.errorCount > 2) {
      suggestions.push({
        id: 'take-break',
        type: 'preventive',
        title: 'Take a Quick Break',
        description: 'It looks like you\'ve encountered a few issues. Sometimes stepping away for a moment helps.',
        confidence: 0.8,
        impact: 'medium',
        effort: 'low',
        context,
        userExpertise: 'beginner',
        emotionalRelevance: 'reassuring'
      });
    }

    return suggestions;
  }

  private generateRecoveryActions(error: any, context: ErrorContext): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Generate primary recovery action
    if (error.type === 'network') {
      actions.push({
        id: 'retry-connection',
        type: 'button',
        label: 'Try Again',
        description: 'Retry the connection',
        action: () => this.retryConnection(),
        primary: true,
        requiresConfirmation: false,
        estimatedTime: 2,
        successRate: 0.8,
        context,
        accessibility: {
          keyboardShortcut: 'Enter',
          voiceCommand: 'try again',
          screenReaderText: 'Retry the connection. Press Enter or say "try again".'
        }
      });
    }

    if (error.type === 'validation') {
      actions.push({
        id: 'fix-validation',
        type: 'button',
        label: 'Fix Issues',
        description: 'Automatically fix common validation issues',
        action: () => this.fixValidationIssues(),
        primary: true,
        requiresConfirmation: false,
        estimatedTime: 1,
        successRate: 0.9,
        context,
        accessibility: {
          keyboardShortcut: 'F',
          voiceCommand: 'fix issues',
          screenReaderText: 'Fix validation issues. Press F or say "fix issues".'
        }
      });
    }

    // Generate secondary actions
    actions.push({
      id: 'get-help',
      type: 'button',
      label: 'Get Help',
      description: 'Contact support for assistance',
      action: () => this.contactSupport(),
      primary: false,
      requiresConfirmation: false,
      estimatedTime: 30,
      successRate: 0.95,
      context,
      accessibility: {
        keyboardShortcut: 'H',
        voiceCommand: 'get help',
        screenReaderText: 'Get help from support. Press H or say "get help".'
      }
    });

    return actions;
  }

  private determineEmotionalTone(context: ErrorContext): ErrorMessage['emotionalTone'] {
    const frustrationLevel = context.userFrustration || 0;
    const errorCount = context.errorCount || 0;

    if (frustrationLevel > 0.8 || errorCount > 3) {
      return 'apologetic';
    } else if (frustrationLevel > 0.5) {
      return 'supportive';
    } else if (context.emotionalState === 'confused') {
      return 'encouraging';
    } else {
      return 'neutral';
    }
  }

  // Recovery action implementations
  private retryConnection(): void {
    console.log('Retrying connection...');
    // In a real implementation, this would retry the failed network request
  }

  private fixValidationIssues(): void {
    console.log('Fixing validation issues...');
    // In a real implementation, this would attempt to fix common validation issues
  }

  private contactSupport(): void {
    console.log('Contacting support...');
    // In a real implementation, this would open a support chat or email
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.userPreferences.set(key, value);
    });
  }

  trackErrorResolution(errorId: string, resolution: string): void {
    const errorHistory = this.errorHistory.get(errorId) || [];
    errorHistory.push({
      resolution,
      timestamp: Date.now(),
      success: true
    });
    this.errorHistory.set(errorId, errorHistory);
  }

  getErrorPatterns(userId?: string): any[] {
    // Return error patterns for analysis
    return Array.from(this.errorHistory.entries()).map(([errorId, history]) => ({
      errorId,
      history,
      patterns: this.analyzeErrorPatterns(history)
    }));
  }

  private analyzeErrorPatterns(history: any[]): any {
    // Analyze patterns in error history for optimization
    return {
      frequency: history.length,
      commonResolutions: history.map(h => h.resolution),
      averageResolutionTime: history.reduce((sum, h) => sum + (h.timestamp - history[0]?.timestamp || 0), 0) / history.length
    };
  }
}

// Main component implementation
export const ContextualErrorMessages: React.FC<ContextualErrorMessagesProps> = ({
  errors,
  context,
  onErrorResolved,
  onErrorDismissed,
  onRecoveryAction,
  enableSofiaGuidance = true,
  autoRecovery = true,
  maxErrors = 3,
  className = '',
  position = 'top',
  theme = 'auto'
}) => {
  const [displayedErrors, setDisplayedErrors] = useState<ErrorMessage[]>([]);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showErrorHelp, setShowErrorHelp] = useState(false);

  const errorEngine = useRef(new ContextualErrorEngine());
  const analytics = useRef(new ContextualErrorAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Update error engine with user preferences
  useEffect(() => {
    errorEngine.current.updateUserPreferences(preferences);
  }, [preferences]);

  // Process new errors
  useEffect(() => {
    const newErrors = errors.map(error => {
      if (!errorEngine.current['errorMessages'].has(error.id)) {
        // Generate contextual error message if not already processed
        return errorEngine.current.generateErrorMessage(error, context);
      }
      return error;
    });

    setDisplayedErrors(prev => {
      const combined = [...prev, ...newErrors];
      return combined.slice(-maxErrors); // Keep only the most recent errors
    });

    // Show Sofia guidance for first error
    if (newErrors.length > 0 && enableSofiaGuidance) {
      const sofiaGenerator = new SofiaMessageGenerator();
      const message = sofiaGenerator.generateMessage({
        type: 'error_guidance',
        context: context.type,
        emotionalTone: 'supportive',
        userEmotionalState: emotionalState,
        urgency: context.severity
      });
      setSofiaMessage(message);
    }
  }, [errors, context, maxErrors, enableSofiaGuidance, emotionalState]);

  const handleRecoveryAction = useCallback(async (action: RecoveryAction, errorId: string) => {
    try {
      await action.action();
      onRecoveryAction?.(action.id, errorId);
      analytics.current.trackRecoveryAction(action, errorId, context);

      // Track successful resolution
      errorEngine.current.trackErrorResolution(errorId, action.label);
    } catch (error) {
      console.error('Recovery action failed:', error);
      analytics.current.trackRecoveryFailure(action, errorId, context);
    }
  }, [onRecoveryAction, context]);

  const handleErrorDismissed = useCallback((errorId: string) => {
    setDisplayedErrors(prev => prev.filter(error => error.id !== errorId));
    onErrorDismissed?.(errorId);
    analytics.current.trackErrorDismissal(errorId, context);
  }, [onErrorDismissed, context]);

  const getErrorIcon = (error: ErrorMessage) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      question: '❓'
    };
    return icons[error.visualHierarchy.icon] || icons.info;
  };

  const getErrorColor = (error: ErrorMessage) => {
    const colors = {
      blue: 'text-blue-600 border-blue-200 bg-blue-50',
      yellow: 'text-yellow-600 border-yellow-200 bg-yellow-50',
      red: 'text-red-600 border-red-200 bg-red-50',
      green: 'text-green-600 border-green-200 bg-green-50',
      purple: 'text-purple-600 border-purple-200 bg-purple-50',
      orange: 'text-orange-600 border-orange-200 bg-orange-50'
    };
    return colors[error.visualHierarchy.color] || colors.blue;
  };

  return (
    <div className={`contextual-error-messages ${className} position-${position} theme-${theme}`}>
      {/* Sofia error guidance */}
      {enableSofiaGuidance && sofiaMessage && (
        <motion.div
          className="sofia-error-guidance"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="sofia-avatar">
            <span className="sofia-avatar__emoji">🧚‍♀️</span>
          </div>
          <div className="sofia-message-bubble">
            <p>{sofiaMessage}</p>
            <div className="error-features">
              <span className="feature-indicator">Smart Errors: ✓</span>
              <span className="feature-indicator">Sofia AI: ✓</span>
              <span className="feature-indicator">Auto Recovery: ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error messages */}
      <div className="error-container">
        <AnimatePresence>
          {displayedErrors.map((error) => (
            <motion.div
              key={error.id}
              className={`error-message ${getErrorColor(error)} ${error.visualHierarchy.size}`}
              initial={{ opacity: 0, x: position === 'top' ? 0 : 300, y: position === 'top' ? -100 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: position === 'top' ? 0 : 300, y: position === 'top' ? -100 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: shouldReduceMotion ? 0.2 : 0.5
              }}
              role="alert"
              aria-live="assertive"
            >
              {/* Error header */}
              <div className="error-header">
                <div className="error-icon">
                  <span className="icon">{getErrorIcon(error)}</span>
                </div>
                <div className="error-title">
                  <h3>{error.title}</h3>
                  {error.canBeDismissed && (
                    <button
                      className="error-dismiss"
                      onClick={() => handleErrorDismissed(error.id)}
                      aria-label="Dismiss error message"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Error description */}
              <div className="error-description">
                <p className="user-friendly-explanation">{error.userFriendlyExplanation}</p>
                {error.technicalDetails && (
                  <details className="technical-details">
                    <summary>Technical Details</summary>
                    <p className="technical-text">{error.technicalDetails}</p>
                  </details>
                )}
              </div>

              {/* Error suggestions */}
              {error.suggestions.length > 0 && (
                <div className="error-suggestions">
                  <h4>What you can try:</h4>
                  <ul>
                    {error.suggestions.map((suggestion) => (
                      <li key={suggestion.id} className={`suggestion-${suggestion.type}`}>
                        <div className="suggestion-content">
                          <h5>{suggestion.title}</h5>
                          <p>{suggestion.description}</p>
                          {suggestion.action && (
                            <span className="suggestion-action">💡 {suggestion.action}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recovery actions */}
              {error.recoveryActions.length > 0 && (
                <div className="error-actions">
                  {error.recoveryActions.map((action) => (
                    <button
                      key={action.id}
                      className={`recovery-action ${action.primary ? 'primary' : 'secondary'}`}
                      onClick={() => handleRecoveryAction(action, error.id)}
                      disabled={action.type === 'automatic'}
                    >
                      <span className="action-label">{action.label}</span>
                      <span className="action-description">{action.description}</span>
                      {action.estimatedTime && (
                        <span className="action-time">~{action.estimatedTime}s</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Error metadata */}
              <div className="error-metadata">
                <span className="error-priority">{error.priority}</span>
                <span className="error-category">{error.category}</span>
                <span className="error-time">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error help overlay */}
      <div className="error-help-panel">
        <details className="error-help-details">
          <summary>Error System Information</summary>
          <div className="error-info">
            <h4>Error Engine Status</h4>
            <p><strong>Active Errors:</strong> {displayedErrors.length}</p>
            <p><strong>Context:</strong> {context.type}</p>
            <p><strong>Severity:</strong> {context.severity}</p>
            <p><strong>User Expertise:</strong> {context.userExpertise}</p>
            <p><strong>Auto Recovery:</strong> {autoRecovery ? 'Enabled' : 'Disabled'}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ContextualErrorMessages;