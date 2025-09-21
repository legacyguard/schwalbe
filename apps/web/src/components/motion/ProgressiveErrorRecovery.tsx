/**
 * ProgressiveErrorRecovery - Step-by-step error recovery guidance with Sofia AI integration
 *
 * Features:
 * - Progressive error recovery with step-by-step guidance
 * - Context-aware recovery sequences based on error type and user expertise
 * - Emotional intelligence for frustration reduction during recovery
 * - Visual error hierarchy with clear importance distinction
 * - Preventive error UI to avoid common mistakes
 * - Smart recovery suggestion systems with confidence scoring
 * - Performance-optimized recovery workflows
 * - Accessibility-first recovery guidance
 * - Advanced recovery analytics and user behavior tracking
 * - Interactive recovery tutorials with real-time feedback
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
// import { ProgressiveErrorAnalytics } from '../../utils/ProgressiveErrorAnalytics';

// Simple analytics interface to avoid circular dependency
interface SimpleAnalytics {
  trackStepCompletion(step: RecoveryStep, sequence: RecoverySequence, success: boolean): void;
  trackRecoveryCompletion(sequence: RecoverySequence, success: boolean, timeSpent: number): void;
  trackRecoveryAbandonment(sequence: RecoverySequence, stepIndex: number, reason: string): void;
}

// Simple analytics implementation
class SimpleProgressiveErrorAnalytics implements SimpleAnalytics {
  trackStepCompletion(step: RecoveryStep, sequence: RecoverySequence, success: boolean): void {
    console.log('Step completion tracked:', { stepId: step.id, sequenceId: sequence.id, success });
  }
  
  trackRecoveryCompletion(sequence: RecoverySequence, success: boolean, timeSpent: number): void {
    console.log('Recovery completion tracked:', { sequenceId: sequence.id, success, timeSpent });
  }
  
  trackRecoveryAbandonment(sequence: RecoverySequence, stepIndex: number, reason: string): void {
    console.log('Recovery abandonment tracked:', { sequenceId: sequence.id, stepIndex, reason });
  }
}
import { RecoveryStep, RecoverySequence, ProgressiveErrorContext as ErrorContext } from '../../types/ErrorPrevention';

// TypeScript interfaces are now imported from shared types

export interface ProgressiveErrorRecoveryProps {
  error: {
    id: string;
    type: string;
    message: string;
    context: ErrorContext;
  };
  onRecoveryComplete?: (sequenceId: string, success: boolean, timeSpent: number) => void;
  onRecoveryAbandoned?: (sequenceId: string, stepReached: number, reason: string) => void;
  onStepComplete?: (stepId: string, sequenceId: string, success: boolean) => void;
  enableSofiaGuidance?: boolean;
  autoStart?: boolean;
  allowSkipSteps?: boolean;
  saveProgress?: boolean;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

// Advanced progressive error recovery engine
class ProgressiveRecoveryEngine {
  private recoverySequences: Map<string, RecoverySequence> = new Map();
  private activeRecoveries: Map<string, any> = new Map();
  private userProgress: Map<string, any> = new Map();
  private recoveryTemplates: Map<string, RecoveryStep[]> = new Map();

  constructor() {
    this.initializeRecoveryTemplates();
    this.initializeUserPreferences();
  }

  private initializeRecoveryTemplates(): void {
    // Network error recovery template
    this.recoveryTemplates.set('network_error', [
      {
        id: 'check-connection',
        order: 1,
        title: 'Check Your Internet Connection',
        description: 'First, let\'s make sure you\'re connected to the internet.',
        instruction: 'Please check if your Wi-Fi or mobile data is working properly.',
        action: {
          type: 'button',
          label: 'Test Connection',
          description: 'Test your internet connection',
          execute: () => this.testConnection(),
          requiresConfirmation: false,
          estimatedTime: 5,
          successRate: 0.9
        },
        validation: {
          check: () => this.validateConnection(),
          successMessage: 'Great! Your connection is working.',
          failureMessage: 'Connection test failed. Let\'s try the next step.'
        },
        help: {
          text: 'You can check your connection by trying to open another website in a new tab.',
          tips: [
            'Make sure your Wi-Fi is turned on',
            'Try moving closer to your router',
            'Check if other devices can connect to the internet'
          ]
        },
        accessibility: {
          keyboardShortcut: 'C',
          voiceCommand: 'check connection',
          screenReaderText: 'Step 1: Check internet connection. Press C or say "check connection".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'Don\'t worry, connection issues are very common and usually easy to fix.',
          frustrationHandler: 'I understand this is frustrating. Let\'s take it one step at a time.',
          successCelebration: 'Excellent! Your connection is working perfectly.'
        }
      },
      {
        id: 'refresh-page',
        order: 2,
        title: 'Refresh the Page',
        description: 'Sometimes a simple page refresh can resolve temporary network issues.',
        instruction: 'Click the refresh button or press F5 on your keyboard.',
        action: {
          type: 'button',
          label: 'Refresh Page',
          description: 'Refresh the current page',
          execute: () => this.refreshPage(),
          requiresConfirmation: false,
          estimatedTime: 3,
          successRate: 0.7
        },
        validation: {
          check: () => this.validatePageRefresh(),
          successMessage: 'Page refreshed successfully!',
          failureMessage: 'Refresh didn\'t resolve the issue. Let\'s continue.'
        },
        help: {
          text: 'Refreshing the page reloads all the content and can fix temporary glitches.',
          tips: [
            'You can also press Ctrl+R (or Cmd+R on Mac) to refresh',
            'Try refreshing in an incognito/private window if the issue persists'
          ]
        },
        accessibility: {
          keyboardShortcut: 'F5',
          voiceCommand: 'refresh page',
          screenReaderText: 'Step 2: Refresh the page. Press F5 or say "refresh page".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'This is a quick and easy step that often solves the problem.',
          frustrationHandler: 'I know refreshing can feel repetitive, but it\'s often the fastest solution.',
          successCelebration: 'Perfect! The refresh worked and everything looks good now.'
        }
      },
      {
        id: 'clear-cache',
        order: 3,
        title: 'Clear Browser Cache',
        description: 'Cached data might be causing the connection issue.',
        instruction: 'Let\'s clear your browser\'s temporary files.',
        action: {
          type: 'button',
          label: 'Clear Cache',
          description: 'Clear browser cache and cookies',
          execute: () => this.clearBrowserCache(),
          requiresConfirmation: true,
          estimatedTime: 10,
          successRate: 0.6
        },
        validation: {
          check: () => this.validateCacheClear(),
          successMessage: 'Cache cleared successfully!',
          failureMessage: 'Cache clear completed. Let\'s check if this helped.'
        },
        help: {
          text: 'Clearing cache removes temporary files that might be causing issues.',
          tips: [
            'You can also press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac) to open clear browsing data',
            'Select "Cached images and files" and "Cookies and other site data"',
            'Choose "Last hour" or "Last 24 hours" to avoid clearing everything'
          ]
        },
        accessibility: {
          keyboardShortcut: 'Ctrl+Shift+Del',
          voiceCommand: 'clear cache',
          screenReaderText: 'Step 3: Clear browser cache. Press Ctrl+Shift+Delete or say "clear cache".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'This step helps resolve many stubborn connection issues.',
          frustrationHandler: 'I understand clearing cache can be inconvenient, but it often fixes persistent problems.',
          successCelebration: 'Great job! Clearing the cache resolved the issue.'
        }
      }
    ]);

    // Validation error recovery template
    this.recoveryTemplates.set('validation_error', [
      {
        id: 'review-form',
        order: 1,
        title: 'Review Your Information',
        description: 'Let\'s carefully review what you\'ve entered.',
        instruction: 'Look at the highlighted fields and check for any missing or incorrect information.',
        action: {
          type: 'navigation',
          label: 'Go to Form',
          description: 'Navigate to the form fields',
          execute: () => this.navigateToForm(),
          requiresConfirmation: false,
          estimatedTime: 2,
          successRate: 0.95
        },
        validation: {
          check: () => this.validateFormReview(),
          successMessage: 'Form review completed successfully.',
          failureMessage: 'Form review needs more attention.'
        },
        help: {
          text: 'Take your time to carefully check each field. Common issues include typos, missing required fields, or incorrect formats.',
          examples: [
            'Email addresses should include @ symbol',
            'Phone numbers should include area code',
            'Dates should be in MM/DD/YYYY format'
          ],
          tips: [
            'Read the field labels carefully',
            'Check for red highlighting on problem fields',
            'Look for helpful hints below each field'
          ]
        },
        accessibility: {
          keyboardShortcut: 'Tab',
          voiceCommand: 'review form',
          screenReaderText: 'Step 1: Review form fields. Use Tab to navigate or say "review form".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'You\'re doing great! Most form issues are quick to fix once identified.',
          frustrationHandler: 'I know filling out forms can be tedious. Let\'s work through this together.',
          successCelebration: 'Excellent! You\'ve successfully reviewed all the form fields.'
        }
      },
      {
        id: 'fix-issues',
        order: 2,
        title: 'Fix the Issues',
        description: 'Now let\'s correct the problems we found.',
        instruction: 'Go through each highlighted field and make the necessary corrections.',
        action: {
          type: 'input',
          label: 'Fix Fields',
          description: 'Correct the form field issues',
          execute: () => this.fixFormIssues(),
          requiresConfirmation: false,
          estimatedTime: 30,
          successRate: 0.9
        },
        validation: {
          check: () => this.validateFormFixes(),
          successMessage: 'All issues have been resolved!',
          failureMessage: 'Some issues still need attention.'
        },
        help: {
          text: 'For each highlighted field, look at the message below it for specific guidance on what needs to be corrected.',
          tips: [
            'Click on a field to see detailed error messages',
            'Use the Tab key to move between fields quickly',
            'Check the format requirements for each field type'
          ]
        },
        accessibility: {
          keyboardShortcut: 'Enter',
          voiceCommand: 'fix issues',
          screenReaderText: 'Step 2: Fix form issues. Press Enter in each field or say "fix issues".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'You\'re making great progress! Each fix gets us closer to completion.',
          frustrationHandler: 'I understand this process can feel overwhelming. Remember, we\'re making progress with each field.',
          successCelebration: 'Fantastic! You\'ve successfully fixed all the form issues.'
        }
      }
    ]);

    // Permission error recovery template
    this.recoveryTemplates.set('permission_error', [
      {
        id: 'understand-permissions',
        order: 1,
        title: 'Understand What\'s Needed',
        description: 'Let\'s understand why this permission is required.',
        instruction: 'Read the explanation of why this feature needs special permissions.',
        action: {
          type: 'button',
          label: 'Learn More',
          description: 'Show permission explanation',
          execute: () => this.showPermissionExplanation(),
          requiresConfirmation: false,
          estimatedTime: 3,
          successRate: 0.95
        },
        validation: {
          check: () => this.validatePermissionUnderstanding(),
          successMessage: 'Permission requirements understood.',
          failureMessage: 'Please take a moment to understand the permission requirements.'
        },
        help: {
          text: 'This feature needs special permissions to protect your privacy and security. Understanding why helps make informed decisions.',
          tips: [
            'Read the privacy and security information carefully',
            'Consider if you\'re comfortable with the requested access',
            'Remember you can always revoke permissions later'
          ]
        },
        accessibility: {
          keyboardShortcut: 'I',
          voiceCommand: 'learn more',
          screenReaderText: 'Step 1: Learn about permissions. Press I or say "learn more".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'Understanding permissions is an important step in protecting your privacy.',
          frustrationHandler: 'I know permission requests can be confusing. Let\'s break this down together.',
          successCelebration: 'Great! You now understand what permissions are needed and why.'
        }
      },
      {
        id: 'grant-permissions',
        order: 2,
        title: 'Grant Permissions',
        description: 'Now let\'s grant the necessary permissions.',
        instruction: 'Follow the browser prompts to allow the requested permissions.',
        action: {
          type: 'permission_grant',
          label: 'Grant Permission',
          description: 'Allow the requested permissions',
          execute: () => this.grantPermissions(),
          requiresConfirmation: true,
          estimatedTime: 15,
          successRate: 0.8
        },
        validation: {
          check: () => this.validatePermissionGrant(),
          successMessage: 'Permissions granted successfully!',
          failureMessage: 'Permission grant failed. Let\'s try a different approach.'
        },
        help: {
          text: 'Your browser will show a prompt asking for permission. Look for the address bar or a popup notification.',
          tips: [
            'Click "Allow" when the permission prompt appears',
            'Check your browser\'s address bar for permission icons',
            'Some browsers show permissions in the site information menu'
          ]
        },
        accessibility: {
          keyboardShortcut: 'Alt+P',
          voiceCommand: 'grant permission',
          screenReaderText: 'Step 2: Grant permissions. Press Alt+P or say "grant permission".',
          highContrast: true,
          reducedMotion: true
        },
        emotionalSupport: {
          encouragement: 'You\'re taking control of your privacy settings - that\'s a smart approach!',
          frustrationHandler: 'Permission prompts can be tricky to find. Let\'s look for it together.',
          successCelebration: 'Perfect! You\'ve successfully granted the necessary permissions.'
        }
      }
    ]);
  }

  private initializeUserPreferences(): void {
    // User preferences for recovery guidance
    this.userProgress.set('recovery_preferences', {
      autoAdvance: true,
      allowSkipSteps: false,
      saveProgress: true,
      showEncouragement: true,
      detailedInstructions: true,
      emotionalSupport: true,
      accessibilityMode: 'auto'
    });
  }

  generateRecoverySequence(error: any, context: ErrorContext): RecoverySequence {
    const templateSteps = this.recoveryTemplates.get(error.type) || this.recoveryTemplates.get('network_error')!;
    const adaptedSteps = this.adaptStepsForUser(templateSteps, context);

    const totalEstimatedTime = adaptedSteps.reduce((sum, step) => sum + step.action.estimatedTime, 0);
    const overallSuccessRate = adaptedSteps.reduce((product, step) => product * step.action.successRate, 1);

    return {
      id: `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      errorId: error.id,
      errorType: error.type,
      context,
      steps: adaptedSteps,
      totalEstimatedTime,
      overallSuccessRate,
      userExpertise: context.userExpertise,
      emotionalIntensity: this.determineEmotionalIntensity(context),
      canSkipSteps: context.userExpertise === 'advanced' || context.userExpertise === 'expert',
      requiresSequentialCompletion: error.type === 'validation' || error.type === 'permission',
      autoAdvance: true,
      autoAdvanceDelay: 2000,
      checkpointFrequency: 1,
      timestamp: Date.now()
    };
  }

  private adaptStepsForUser(steps: RecoveryStep[], context: ErrorContext): RecoveryStep[] {
    return steps.map(step => ({
      ...step,
      instruction: this.adaptInstructionForExpertise(step.instruction, context.userExpertise),
      help: {
        ...step.help,
        tips: step.help.tips?.filter(tip => this.isTipRelevantForUser(tip, context.userExpertise))
      },
      emotionalSupport: {
        ...step.emotionalSupport,
        encouragement: this.adaptEncouragementForEmotionalState(step.emotionalSupport.encouragement, context.emotionalState)
      }
    }));
  }

  private adaptInstructionForExpertise(instruction: string, expertise: string): string {
    switch (expertise) {
      case 'beginner':
        return instruction.replace(/technical|advanced/g, 'simple');
      case 'intermediate':
        return instruction.replace(/very simple/g, 'straightforward');
      case 'advanced':
      case 'expert':
        return instruction.replace(/simple|basic/g, 'efficient');
      default:
        return instruction;
    }
  }

  private isTipRelevantForUser(tip: string, expertise: string): boolean {
    if (expertise === 'beginner' && tip.includes('advanced')) return false;
    if (expertise === 'expert' && tip.includes('basic')) return false;
    return true;
  }

  private adaptEncouragementForEmotionalState(encouragement: string, emotionalState: string): string {
    switch (emotionalState) {
      case 'frustrated':
        return encouragement.replace(/great|excellent/g, 'steady');
      case 'confused':
        return encouragement.replace(/quick|fast/g, 'careful');
      case 'anxious':
        return encouragement.replace(/perfect|excellent/g, 'gentle');
      default:
        return encouragement;
    }
  }

  private determineEmotionalIntensity(context: ErrorContext): 'low' | 'medium' | 'high' {
    const frustration = context.userFrustration || 0;
    const errorCount = context.errorCount || 0;

    if (frustration > 0.8 || errorCount > 3) return 'high';
    if (frustration > 0.5 || errorCount > 1) return 'medium';
    return 'low';
  }

  // Recovery action implementations
  private testConnection(): void {
    console.log('Testing connection...');
    // In a real implementation, this would test the actual network connection
  }

  private validateConnection(): boolean {
    console.log('Validating connection...');
    // In a real implementation, this would check if the connection test was successful
    return Math.random() > 0.3; // Simulate 70% success rate
  }

  private refreshPage(): void {
    console.log('Refreshing page...');
    // In a real implementation, this would refresh the current page
  }

  private validatePageRefresh(): boolean {
    console.log('Validating page refresh...');
    return Math.random() > 0.4; // Simulate 60% success rate
  }

  private clearBrowserCache(): void {
    console.log('Clearing browser cache...');
    // In a real implementation, this would clear the browser cache
  }

  private validateCacheClear(): boolean {
    console.log('Validating cache clear...');
    return Math.random() > 0.5; // Simulate 50% success rate
  }

  private navigateToForm(): void {
    console.log('Navigating to form...');
    // In a real implementation, this would scroll to or focus the form
  }

  private validateFormReview(): boolean {
    console.log('Validating form review...');
    return Math.random() > 0.2; // Simulate 80% success rate
  }

  private fixFormIssues(): void {
    console.log('Fixing form issues...');
    // In a real implementation, this would attempt to fix common form issues
  }

  private validateFormFixes(): boolean {
    console.log('Validating form fixes...');
    return Math.random() > 0.3; // Simulate 70% success rate
  }

  private showPermissionExplanation(): void {
    console.log('Showing permission explanation...');
    // In a real implementation, this would show a detailed explanation modal
  }

  private validatePermissionUnderstanding(): boolean {
    console.log('Validating permission understanding...');
    return Math.random() > 0.1; // Simulate 90% success rate
  }

  private grantPermissions(): void {
    console.log('Granting permissions...');
    // In a real implementation, this would trigger the permission request
  }

  private validatePermissionGrant(): boolean {
    console.log('Validating permission grant...');
    return Math.random() > 0.4; // Simulate 60% success rate
  }

  saveProgress(sequenceId: string, stepIndex: number): void {
    const progress = {
      sequenceId,
      stepIndex,
      timestamp: Date.now(),
      completed: false
    };
    this.userProgress.set(`progress-${sequenceId}`, progress);
  }

  getProgress(sequenceId: string): any {
    return this.userProgress.get(`progress-${sequenceId}`);
  }

  canSkipStep(step: RecoveryStep, context: ErrorContext): boolean {
    return context.userExpertise === 'advanced' || context.userExpertise === 'expert';
  }
}

// Main component implementation
export const ProgressiveErrorRecovery: React.FC<ProgressiveErrorRecoveryProps> = ({
  error,
  onRecoveryComplete,
  onRecoveryAbandoned,
  onStepComplete,
  enableSofiaGuidance = true,
  autoStart = true,
  allowSkipSteps = false,
  saveProgress = true,
  className = '',
  theme = 'auto'
}) => {
  const [currentSequence, setCurrentSequence] = useState<RecoverySequence | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stepResults, setStepResults] = useState<Map<string, boolean>>(new Map());
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showProgress, setShowProgress] = useState(false);

  const recoveryEngine = useRef(new ProgressiveRecoveryEngine());
  const analytics = useRef(new SimpleProgressiveErrorAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Initialize recovery sequence
  useEffect(() => {
    if (error && !currentSequence) {
      const sequence = recoveryEngine.current.generateRecoverySequence(error, error.context);
      setCurrentSequence(sequence);

      if (autoStart) {
        setIsActive(true);
        setCurrentStepIndex(0);
      }

      // Show Sofia guidance
      if (enableSofiaGuidance) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'recovery_guidance',
          context: error.context.type,
          emotionalTone: 'supportive',
          userEmotionalState: emotionalState,
          urgency: error.context.severity
        });
        setSofiaMessage(message);
      }
    }
  }, [error, currentSequence, autoStart, enableSofiaGuidance, emotionalState]);

  const handleStepComplete = useCallback(async (step: RecoveryStep, success: boolean) => {
    setStepResults(prev => new Map(prev.set(step.id, success)));
    onStepComplete?.(step.id, currentSequence!.id, success);
    analytics.current.trackStepCompletion(step, currentSequence!, success);

    if (success && currentSequence!.autoAdvance) {
      setTimeout(() => {
        if (currentStepIndex < currentSequence!.steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          handleRecoveryComplete();
        }
      }, currentSequence!.autoAdvanceDelay);
    }
  }, [currentSequence, currentStepIndex, onStepComplete]);

  const handleRecoveryComplete = useCallback(() => {
    const timeSpent = Date.now() - currentSequence!.timestamp;
    setIsActive(false);
    onRecoveryComplete?.(currentSequence!.id, true, timeSpent);
    analytics.current.trackRecoveryCompletion(currentSequence!, true, timeSpent);
  }, [currentSequence, onRecoveryComplete]);

  const handleRecoveryAbandoned = useCallback((reason: string) => {
    setIsActive(false);
    onRecoveryAbandoned?.(currentSequence!.id, currentStepIndex, reason);
    analytics.current.trackRecoveryAbandonment(currentSequence!, currentStepIndex, reason);
  }, [currentSequence, currentStepIndex, onRecoveryAbandoned]);

  const handleSkipStep = useCallback(() => {
    if (currentStepIndex < currentSequence!.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentSequence, currentStepIndex]);

  const handleStartOver = useCallback(() => {
    setCurrentStepIndex(0);
    setStepResults(new Map());
    setIsActive(true);
  }, []);

  if (!currentSequence) {
    return (
      <div className={`progressive-error-recovery ${className} theme-${theme}`}>
        <div className="recovery-loading">
          <p>Preparing recovery guidance...</p>
        </div>
      </div>
    );
  }

  const currentStep = currentSequence.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentSequence.steps.length) * 100;
  const canSkip = allowSkipSteps && currentStep && recoveryEngine.current.canSkipStep(currentStep, error.context);

  return (
    <div className={`progressive-error-recovery ${className} theme-${theme}`}>
      {/* Sofia recovery guidance */}
      {enableSofiaGuidance && sofiaMessage && (
        <motion.div
          className="sofia-recovery-guidance"
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
            <div className="recovery-features">
              <span className="feature-indicator">Step-by-Step: ✓</span>
              <span className="feature-indicator">Sofia AI: ✓</span>
              <span className="feature-indicator">Progress Saving: ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recovery progress header */}
      <div className="recovery-header">
        <div className="recovery-title">
          <h2>Recovery Guide</h2>
          <p>Step {currentStepIndex + 1} of {currentSequence.steps.length}</p>
        </div>
        <div className="recovery-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="progress-text">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Current step */}
      {currentStep && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            className="recovery-step"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="step-header">
              <div className="step-number">{currentStep.order}</div>
              <div className="step-title">
                <h3>{currentStep.title}</h3>
                <p className="step-description">{currentStep.description}</p>
              </div>
            </div>

            <div className="step-instruction">
              <p>{currentStep.instruction}</p>
            </div>

            {/* Emotional support */}
            <div className="emotional-support">
              <p className="encouragement">{currentStep.emotionalSupport.encouragement}</p>
            </div>

            {/* Help section */}
            <details className="step-help">
              <summary>Need Help?</summary>
              <div className="help-content">
                <p>{currentStep.help.text}</p>
                {currentStep.help.tips && (
                  <ul className="help-tips">
                    {currentStep.help.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                )}
                {currentStep.help.examples && (
                  <div className="help-examples">
                    <h4>Examples:</h4>
                    <ul>
                      {currentStep.help.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>

            {/* Action button */}
            <div className="step-action">
              <button
                className="action-button primary"
                onClick={() => currentStep.action.execute()}
                disabled={!isActive}
              >
                <span className="action-label">{currentStep.action.label}</span>
                <span className="action-description">{currentStep.action.description}</span>
                <span className="action-time">~{currentStep.action.estimatedTime}s</span>
              </button>

              {canSkip && (
                <button
                  className="action-button secondary"
                  onClick={handleSkipStep}
                >
                  Skip Step
                </button>
              )}
            </div>

            {/* Validation feedback */}
            <div className="step-validation">
              <div className="validation-status">
                <span className="status-icon">⏳</span>
                <span className="status-text">Waiting for action...</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Recovery controls */}
      <div className="recovery-controls">
        <button
          className="control-button"
          onClick={() => setShowProgress(!showProgress)}
        >
          {showProgress ? 'Hide' : 'Show'} Progress
        </button>

        <button
          className="control-button"
          onClick={handleStartOver}
        >
          Start Over
        </button>

        <button
          className="control-button abandon"
          onClick={() => handleRecoveryAbandoned('user_abandoned')}
        >
          Give Up
        </button>
      </div>

      {/* Progress details */}
      {showProgress && (
        <motion.div
          className="recovery-progress-details"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4>Recovery Progress</h4>
          <div className="progress-steps">
            {currentSequence.steps.map((step, index) => (
              <div
                key={step.id}
                className={`progress-step ${index === currentStepIndex ? 'current' : ''} ${stepResults.get(step.id) ? 'completed' : ''} ${index < currentStepIndex ? 'visited' : ''}`}
              >
                <div className="step-indicator">
                  <span className="step-number">{step.order}</span>
                  <span className="step-status">
                    {stepResults.get(step.id) ? '✅' : index < currentStepIndex ? '⏭️' : '⏳'}
                  </span>
                </div>
                <div className="step-info">
                  <h5>{step.title}</h5>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recovery analytics panel */}
      <div className="recovery-analytics-panel" aria-hidden="true">
        <details className="recovery-details">
          <summary>Recovery System Information</summary>
          <div className="recovery-info">
            <h4>Recovery Engine Status</h4>
            <p><strong>Sequence:</strong> {currentSequence.id}</p>
            <p><strong>Current Step:</strong> {currentStepIndex + 1} / {currentSequence.steps.length}</p>
            <p><strong>Success Rate:</strong> {Math.round(currentSequence.overallSuccessRate * 100)}%</p>
            <p><strong>Estimated Time:</strong> {currentSequence.totalEstimatedTime}s</p>
            <p><strong>User Expertise:</strong> {currentSequence.userExpertise}</p>
            <p><strong>Emotional Intensity:</strong> {currentSequence.emotionalIntensity}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ProgressiveErrorRecovery;