/**
 * ErrorPreventionFeedback - Advanced error prevention and intelligent error handling system
 *
 * Features:
 * - Proactive error prevention through intelligent UI guidance
 * - Context-aware error detection and prevention mechanisms
 * - Emotional error handling to reduce user frustration
 * - Progressive error recovery with step-by-step guidance
 * - Smart validation with real-time feedback
 * - Sofia AI integration for empathetic error messaging
 * - Accessibility-first error communication
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { ErrorPreventionAnalytics } from '../../utils/ErrorPreventionAnalytics';

// Import shared types to avoid circular dependencies
import { 
  ErrorContext,
  PreventionStrategy,
  PreventionAction,
  ErrorRecoveryStep,
  ErrorPreventionSequence
} from '../../types/ErrorPrevention';

export interface ErrorPreventionFeedbackProps {
  context: ErrorContext;
  isActive: boolean;
  onPreventionApplied?: (strategyId: string, success: boolean) => void;
  onRecoveryStepComplete?: (stepId: string, sequenceId: string, success: boolean) => void;
  onErrorPrevented?: (context: ErrorContext, strategy: PreventionStrategy) => void;
  onErrorRecovered?: (context: ErrorContext, sequence: ErrorPreventionSequence) => void;
  autoApplyPrevention?: boolean;
  showSofia?: boolean;
  allowAutomation?: boolean;
  className?: string;
}

// Advanced error prevention engine
class ErrorPreventionEngine {
  private preventionRules: Map<string, PreventionStrategy[]> = new Map();
  private userErrorHistory: Map<string, any[]> = new Map();
  private contextPatterns: Map<string, any> = new Map();

  constructor() {
    this.initializePreventionRules();
  }

  private initializePreventionRules(): void {
    // Validation error prevention
    this.preventionRules.set('validation', [
      {
        id: 'email-format-validation',
        type: 'validation',
        trigger: 'on_change',
        condition: 'input.type === "email" && !isValidEmail(input.value)',
        message: 'Please enter a valid email address',
        sofiaMessage: 'I can help you format your email correctly. 📧',
        visualStyle: 'subtle',
        action: {
          id: 'suggest-corrections',
          label: 'Show email format tips',
          type: 'suggest',
          automated: false,
          requiresConfirmation: false,
          estimatedTime: 30
        }
      },
      {
        id: 'required-field-prevention',
        type: 'guidance',
        trigger: 'on_focus',
        condition: 'field.required && !field.value',
        message: 'This field is required',
        sofiaMessage: 'This is an important field - I\'ll help you fill it out. 🌟',
        visualStyle: 'noticeable',
        action: {
          id: 'highlight-required',
          label: 'Highlight all required fields',
          type: 'guide',
          automated: true,
          requiresConfirmation: false,
          estimatedTime: 5
        }
      }
    ]);

    // Network error prevention
    this.preventionRules.set('network', [
      {
        id: 'offline-detection',
        type: 'restriction',
        trigger: 'on_submit',
        condition: '!navigator.onLine',
        message: 'You appear to be offline. Please check your connection.',
        sofiaMessage: 'I notice you might be offline. Let me help you save your work locally. 📱',
        visualStyle: 'prominent',
        action: {
          id: 'save-locally',
          label: 'Save work locally',
          type: 'automate',
          automated: true,
          requiresConfirmation: false,
          estimatedTime: 10
        }
      }
    ]);

    // Permission error prevention
    this.preventionRules.set('permission', [
      {
        id: 'camera-permission-check',
        type: 'suggestion',
        trigger: 'on_focus',
        condition: 'requiresCamera && !hasCameraPermission',
        message: 'Camera access is required for this feature',
        sofiaMessage: 'You\'ll need camera access for this. I can guide you through the permission settings. 📷',
        visualStyle: 'noticeable',
        action: {
          id: 'request-permission',
          label: 'Request camera permission',
          type: 'automate',
          automated: true,
          requiresConfirmation: true,
          estimatedTime: 15
        }
      }
    ]);
  }

  analyzePreventionOpportunities(context: ErrorContext): {
    strategies: PreventionStrategy[];
    confidence: number;
    priority: 'low' | 'medium' | 'high';
  } {
    const { type, severity, userExpertise, canRecover } = context;

    // Get relevant prevention rules
    const relevantRules = this.preventionRules.get(type) || [];

    // Filter rules based on context
    const applicableStrategies = relevantRules.filter(rule => {
      // Check if rule condition would apply (simplified for demo)
      return this.evaluateCondition(rule.condition, context);
    });

    // Adapt strategies based on user expertise
    const adaptedStrategies = applicableStrategies.map(strategy => ({
      ...strategy,
      visualStyle: this.adaptVisualStyle(strategy.visualStyle, userExpertise, severity),
      delay: this.calculateOptimalDelay(strategy, context)
    }));

    // Calculate confidence and priority
    const confidence = this.calculateConfidence(context, adaptedStrategies.length);
    const priority = this.determinePriority(severity, canRecover, userExpertise);

    return {
      strategies: adaptedStrategies,
      confidence,
      priority
    };
  }

  private evaluateCondition(condition: string, context: ErrorContext): boolean {
    // Simplified condition evaluation - in real implementation this would be more sophisticated
    const { type, severity, userExpertise } = context;

    // Basic rule matching
    if (condition.includes('validation') && type === 'validation') return true;
    if (condition.includes('network') && type === 'network') return true;
    if (condition.includes('permission') && type === 'permission') return true;

    return false;
  }

  private adaptVisualStyle(
    baseStyle: PreventionStrategy['visualStyle'],
    expertise: ErrorContext['userExpertise'],
    severity: ErrorContext['severity']
  ): PreventionStrategy['visualStyle'] {
    if (expertise === 'beginner' && severity === 'high') {
      return 'prominent';
    }
    if (expertise === 'expert' && severity === 'low') {
      return 'subtle';
    }
    return baseStyle;
  }

  private calculateOptimalDelay(strategy: PreventionStrategy, context: ErrorContext): number {
    const { userExpertise, emotionalImpact } = context;

    let delay = strategy.delay || 0;

    // Adjust delay based on user expertise
    if (userExpertise === 'beginner') {
      delay += 500; // Give beginners more time to read
    }

    // Adjust delay based on emotional impact
    if (emotionalImpact === 'frustration') {
      delay += 1000; // Give frustrated users more time
    }

    return delay;
  }

  private calculateConfidence(context: ErrorContext, strategyCount: number): number {
    const { userExpertise, preventionOpportunity } = context;

    let confidence = 0.5; // Base confidence

    if (preventionOpportunity) confidence += 0.3;
    if (strategyCount > 0) confidence += 0.2;
    if (userExpertise === 'advanced') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private determinePriority(
    severity: ErrorContext['severity'],
    canRecover: boolean,
    userExpertise: ErrorContext['userExpertise']
  ): 'low' | 'medium' | 'high' {
    if (severity === 'critical' && !canRecover) return 'high';
    if (severity === 'high' || userExpertise === 'beginner') return 'medium';
    return 'low';
  }

  learnFromPrevention(preventionId: string, context: ErrorContext, success: boolean): void {
    const history = this.userErrorHistory.get(context.type) || [];
    history.push({
      preventionId,
      context,
      success,
      timestamp: Date.now()
    });
    this.userErrorHistory.set(context.type, history);
  }
}

// Recovery sequence orchestrator
class RecoverySequenceOrchestrator {
  generateRecoverySequence(context: ErrorContext): ErrorPreventionSequence {
    const { type, severity, canRecover, recoveryComplexity, userExpertise } = context;

    // Generate context-specific recovery steps
    const recoverySteps = this.generateRecoverySteps(context);

    // Create prevention strategies for future occurrences
    const preventionStrategies = this.generatePreventionStrategies(context);

    return {
      id: `recovery-${type}-${Date.now()}`,
      name: `${type} Error Recovery`,
      description: `Recovery sequence for ${type} error`,
      context,
      preventionStrategies,
      recoverySteps,
      fallbackMessage: this.getFallbackMessage(context),
      estimatedPreventionTime: preventionStrategies.length * 30,
      estimatedRecoveryTime: recoverySteps.reduce((total, step) => total + step.estimatedTime, 0)
    };
  }

  private generateRecoverySteps(context: ErrorContext): ErrorRecoveryStep[] {
    const { type, severity, canRecover, userExpertise } = context;

    const baseSteps: ErrorRecoveryStep[] = [];

    // Add context-specific recovery steps
    switch (type) {
      case 'validation':
        baseSteps.push(
          {
            id: 'check-input',
            title: 'Review Your Input',
            description: 'Let\'s check what you entered for any obvious issues',
            action: {
              id: 'highlight-issues',
              label: 'Highlight problems',
              type: 'guide',
              automated: true,
              requiresConfirmation: false,
              estimatedTime: 10
            },
            visualStyle: 'guidance',
            estimatedTime: 15,
            requiresUserInput: false,
            canSkip: false
          }
        );
        break;

      case 'network':
        baseSteps.push(
          {
            id: 'check-connection',
            title: 'Check Connection',
            description: 'Let\'s verify your internet connection',
            action: {
              id: 'test-connection',
              label: 'Test connection',
              type: 'automate',
              automated: true,
              requiresConfirmation: false,
              estimatedTime: 5
            },
            visualStyle: 'instruction',
            estimatedTime: 10,
            requiresUserInput: false,
            canSkip: true
          }
        );
        break;

      case 'permission':
        baseSteps.push(
          {
            id: 'request-permission',
            title: 'Request Permission',
            description: 'We need to request the necessary permission',
            action: {
              id: 'request-permission',
              label: 'Request permission',
              type: 'automate',
              automated: true,
              requiresConfirmation: true,
              estimatedTime: 15
            },
            visualStyle: 'instruction',
            estimatedTime: 20,
            requiresUserInput: true,
            canSkip: false
          }
        );
        break;
    }

    // Adapt steps based on user expertise
    if (userExpertise === 'beginner') {
      // Add more detailed steps for beginners
      baseSteps.forEach(step => {
        step.estimatedTime *= 1.5;
        step.description = `Beginner-friendly: ${step.description}`;
      });
    }

    return baseSteps;
  }

  private generatePreventionStrategies(context: ErrorContext): PreventionStrategy[] {
    // Generate strategies to prevent this error in the future
    const strategies: PreventionStrategy[] = [];

    switch (context.type) {
      case 'validation':
        strategies.push({
          id: 'input-validation',
          type: 'validation',
          trigger: 'on_change',
          condition: 'input.required && !input.value',
          message: 'This field is required to continue',
          visualStyle: 'subtle'
        });
        break;

      case 'network':
        strategies.push({
          id: 'offline-detection',
          type: 'restriction',
          trigger: 'on_submit',
          condition: '!navigator.onLine',
          message: 'You appear to be offline',
          visualStyle: 'noticeable'
        });
        break;
    }

    return strategies;
  }

  private getFallbackMessage(context: ErrorContext): string {
    const fallbackMessages: Record<ErrorContext['type'], string> = {
      'validation': 'There seems to be an issue with the information provided. Let me help you fix this.',
      'network': 'We\'re having trouble connecting. Let me help you resolve this connection issue.',
      'permission': 'We need permission to access this feature. Let me guide you through the process.',
      'data': 'There\'s an issue with the data. Let me help you resolve this.',
      'user_input': 'I see there might be an issue with your input. Let me help you correct this.',
      'system': 'A system error occurred. Let me help you work around this issue.',
      'timeout': 'The request timed out. Let me help you try again or find an alternative approach.',
      'authentication': 'Authentication is required. Let me help you sign in securely.',
      'authorization': 'You don\'t have permission for this action. Let me help you find an alternative.',
      'configuration': 'There\'s a configuration issue. Let me help you adjust the settings.'
    };

    return fallbackMessages[context.type] || 'An error occurred. Let me help you resolve this.';
  }
}

// Main component implementation
export const ErrorPreventionFeedback: React.FC<ErrorPreventionFeedbackProps> = ({
  context,
  isActive,
  onPreventionApplied,
  onRecoveryStepComplete,
  onErrorPrevented,
  onErrorRecovered,
  autoApplyPrevention = true,
  showSofia = true,
  allowAutomation = true,
  className = ''
}) => {
  const [preventionStrategies, setPreventionStrategies] = useState<PreventionStrategy[]>([]);
  const [recoverySequence, setRecoverySequence] = useState<ErrorPreventionSequence | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPreventing, setIsPreventing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [sofiaMessage, setSofiaMessage] = useState('');

  const preventionEngine = useRef(new ErrorPreventionEngine());
  const recoveryOrchestrator = useRef(new RecoverySequenceOrchestrator());
  const analytics = useRef(new ErrorPreventionAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();

  // Analyze prevention opportunities when context changes
  useEffect(() => {
    if (isActive && context) {
      const result = preventionEngine.current.analyzePreventionOpportunities(context);

      setPreventionStrategies(result.strategies);

      // Generate Sofia message
      if (showSofia) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'error_prevention',
          context: context.type,
          emotionalTone: 'supportive',
          userEmotionalState: emotionalState,
          urgency: context.severity === 'critical' ? 'high' : 'medium'
        });
        setSofiaMessage(message);
      }

      // Track prevention analysis
      analytics.current.trackPreventionAnalysis(context, result);
    }
  }, [isActive, context, showSofia, emotionalState]);

  // Auto-apply prevention strategies
  useEffect(() => {
    if (autoApplyPrevention && preventionStrategies.length > 0 && !isPreventing) {
      setIsPreventing(true);

      preventionStrategies.forEach((strategy, index) => {
        setTimeout(() => {
          applyPreventionStrategy(strategy);
        }, index * 1000);
      });
    }
  }, [autoApplyPrevention, preventionStrategies, isPreventing]);

  const applyPreventionStrategy = useCallback((strategy: PreventionStrategy) => {
    if (!allowAutomation && strategy.action?.automated) return;

    // Apply the prevention strategy
    console.log('Applying prevention strategy:', strategy);

    // Simulate prevention application
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      onPreventionApplied?.(strategy.id, success);

      if (success) {
        onErrorPrevented?.(context, strategy);
        analytics.current.trackPreventionSuccess(strategy.id, context);
      } else {
        // Fall back to recovery sequence
        const sequence = recoveryOrchestrator.current.generateRecoverySequence(context);
        setRecoverySequence(sequence);
        setIsRecovering(true);
        analytics.current.trackPreventionFailure(strategy.id, context);
      }
    }, strategy.action?.estimatedTime || 1000);
  }, [allowAutomation, onPreventionApplied, onErrorPrevented, context]);

  const executeRecoveryStep = useCallback((step: ErrorRecoveryStep) => {
    console.log('Executing recovery step:', step);

    // Simulate step execution
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for recovery
      onRecoveryStepComplete?.(step.id, recoverySequence!.id, success);

      if (success) {
        analytics.current.trackRecoveryStepSuccess(step.id, context);
      } else {
        analytics.current.trackRecoveryStepFailure(step.id, context);
      }
    }, step.estimatedTime * 1000);
  }, [onRecoveryStepComplete, recoverySequence, context]);

  const generateSofiaMessage = useCallback((context: ErrorContext): string => {
    const sofiaGenerator = new SofiaMessageGenerator();

    return sofiaGenerator.generateMessage({
      type: 'error_recovery',
      context: context.type,
      emotionalTone: 'encouraging',
      userEmotionalState: emotionalState,
      urgency: context.severity === 'critical' ? 'high' : 'medium'
    });
  }, [emotionalState]);

  // Prevention strategy variants
  const getPreventionVariants = (style: PreventionStrategy['visualStyle']) => {
    const baseVariants = {
      hidden: { opacity: 0, x: -20, scale: 0.9 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
      },
      exit: { opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }
    };

    if (style === 'urgent') {
      return {
        ...baseVariants,
        visible: {
          ...baseVariants.visible,
          scale: [1, 1.05, 1],
          transition: {
            ...baseVariants.visible.transition,
            scale: { repeat: Infinity, duration: 1 }
          }
        }
      };
    }

    return baseVariants;
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className={`error-prevention-feedback ${className}`}>
      {/* Sofia error prevention message */}
      {showSofia && sofiaMessage && (
        <motion.div
          className="error-prevention-sofia"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="sofia-avatar">
            <span className="sofia-avatar__emoji">🧚‍♀️</span>
          </div>
          <div className="sofia-message-bubble">
            <p>{sofiaMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Prevention strategies */}
      <AnimatePresence>
        {preventionStrategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            className={`prevention-strategy prevention-strategy--${strategy.visualStyle}`}
            variants={getPreventionVariants(strategy.visualStyle)}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="prevention-content">
              <h4 className="prevention-title">{strategy.message}</h4>

              {strategy.sofiaMessage && (
                <p className="prevention-sofia-message">{strategy.sofiaMessage}</p>
              )}

              {strategy.action && (
                <button
                  className={`prevention-action prevention-action--${strategy.action.type}`}
                  onClick={() => applyPreventionStrategy(strategy)}
                  disabled={!allowAutomation && strategy.action.automated}
                >
                  {strategy.action.label}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Recovery sequence */}
      {recoverySequence && (
        <motion.div
          className="recovery-sequence"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="recovery-title">Let me help you fix this</h3>

          {recoverySequence.recoverySteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`recovery-step recovery-step--${step.visualStyle}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="recovery-step-content">
                <h4 className="recovery-step-title">{step.title}</h4>
                <p className="recovery-step-description">{step.description}</p>

                <button
                  className="recovery-step-action"
                  onClick={() => executeRecoveryStep(step)}
                >
                  {step.action.label}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Fallback message */}
      {preventionStrategies.length === 0 && !recoverySequence && (
        <motion.div
          className="error-fallback"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="fallback-message">
            <p>{context.fallbackMessage || 'I\'m here to help you resolve this issue.'}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ErrorPreventionFeedback;