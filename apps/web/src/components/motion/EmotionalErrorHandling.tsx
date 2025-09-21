/**
 * EmotionalErrorHandling - Emotionally intelligent error responses to reduce frustration
 *
 * Features:
 * - Emotional intelligence for frustration reduction during errors
 * - Context-aware error messaging based on user emotional state
 * - Visual error hierarchy with clear importance distinction
 * - Preventive error UI to avoid common mistakes
 * - Smart recovery suggestion systems with emotional support
 * - Performance-optimized error handling with emotional adaptation
 * - Accessibility-first emotional error presentation
 * - Advanced emotional analytics and user behavior tracking
 * - Interactive emotional support with real-time adaptation
 * - Frustration prediction and prevention systems
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { EmotionalErrorAnalytics } from '../../utils/EmotionalErrorAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface EmotionalError {
  id: string;
  type: 'validation' | 'network' | 'permission' | 'data' | 'system' | 'user_input' | 'timeout' | 'authentication' | 'authorization' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  technicalMessage: string;
  emotionalContext: EmotionalContext;
  frustrationTriggers: FrustrationTrigger[];
  userJourney: UserJourneyContext;
  previousErrors: string[];
  errorCount: number;
  timeSinceLastError: number;
  userIntent: string;
  expectedOutcome: string;
  actualOutcome: string;
  timestamp: number;
  sessionId: string;
}

export interface EmotionalContext {
  userEmotionalState: 'calm' | 'frustrated' | 'confused' | 'anxious' | 'overwhelmed' | 'tired' | 'angry' | 'disappointed';
  frustrationLevel: number; // 0-1 scale
  emotionalIntensity: 'low' | 'medium' | 'high' | 'extreme';
  emotionalTrajectory: 'improving' | 'stable' | 'worsening' | 'volatile';
  copingCapacity: 'high' | 'medium' | 'low' | 'exhausted';
  stressIndicators: string[];
  emotionalNeeds: EmotionalNeed[];
  communicationPreference: 'direct' | 'supportive' | 'encouraging' | 'empathetic' | 'professional' | 'casual';
  tonePreference: 'formal' | 'friendly' | 'warm' | 'neutral' | 'apologetic' | 'optimistic';
}

export interface FrustrationTrigger {
  id: string;
  type: 'technical_complexity' | 'time_delay' | 'repeated_failures' | 'unclear_instructions' | 'unexpected_behavior' | 'lack_of_feedback' | 'interrupted_workflow' | 'lost_progress';
  severity: number; // 0-1 scale
  description: string;
  context: string;
  frequency: number;
  userImpact: 'minor' | 'moderate' | 'significant' | 'severe';
  mitigationStrategies: string[];
}

export interface EmotionalNeed {
  type: 'reassurance' | 'clarity' | 'control' | 'progress' | 'simplicity' | 'empathy' | 'encouragement' | 'respect' | 'patience' | 'understanding';
  priority: 'low' | 'medium' | 'high' | 'critical';
  satisfactionLevel: number; // 0-1 scale
  expression: string;
  fulfillmentActions: string[];
}

export interface UserJourneyContext {
  currentStep: string;
  intendedGoal: string;
  progressMade: number; // 0-1 scale
  timeSpent: number; // seconds
  workflowComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
  interruptionCount: number;
  frustrationThreshold: number; // 0-1 scale
  patienceLevel: 'high' | 'medium' | 'low' | 'exhausted';
}

export interface EmotionalErrorResponse {
  id: string;
  errorId: string;
  emotionalStrategy: EmotionalStrategy;
  responseType: 'apologetic' | 'empathetic' | 'encouraging' | 'reassuring' | 'solution_focused' | 'progress_oriented';
  primaryMessage: string;
  supportiveMessage: string;
  frustrationReducers: FrustrationReducer[];
  emotionalSupport: EmotionalSupport;
  recoveryGuidance: RecoveryGuidance;
  visualPresentation: VisualPresentation;
  interactionStyle: InteractionStyle;
  followUpActions: FollowUpAction[];
  effectivenessPrediction: number; // 0-1 scale
  timestamp: number;
}

export interface EmotionalStrategy {
  id: string;
  name: string;
  description: string;
  primaryGoal: 'reduce_frustration' | 'provide_clarity' | 'restore_confidence' | 'maintain_engagement' | 'prevent_escalation';
  emotionalApproach: 'empathetic' | 'encouraging' | 'reassuring' | 'apologetic' | 'solution_focused' | 'progress_oriented';
  communicationStyle: 'direct' | 'supportive' | 'nurturing' | 'professional' | 'friendly' | 'warm';
  tone: 'formal' | 'casual' | 'warm' | 'neutral' | 'optimistic' | 'apologetic';
  pacing: 'immediate' | 'measured' | 'gentle' | 'patient';
  intensity: 'low' | 'medium' | 'high' | 'adaptive';
}

export interface FrustrationReducer {
  id: string;
  type: 'acknowledgment' | 'empathy' | 'reassurance' | 'simplification' | 'progress_showing' | 'control_restoration' | 'expectation_management' | 'positive_refocusing';
  technique: string;
  message: string;
  expectedImpact: number; // 0-1 scale
  timing: 'immediate' | 'delayed' | 'progressive';
  duration: number; // seconds
  effectiveness: number; // 0-1 scale
}

export interface EmotionalSupport {
  primarySupport: string;
  secondarySupport: string;
  encouragement: string;
  empathyStatement: string;
  frustrationAcknowledgment: string;
  confidenceBuilder: string;
  relationshipBuilder: string;
  trustSignal: string;
}

export interface RecoveryGuidance {
  approach: 'step_by_step' | 'simplified' | 'alternative' | 'guided' | 'automated' | 'manual';
  complexity: 'minimal' | 'basic' | 'intermediate' | 'comprehensive';
  userControl: 'full' | 'guided' | 'automated' | 'optional';
  emotionalPacing: 'patient' | 'encouraging' | 'supportive' | 'empowering';
  progressVisibility: 'detailed' | 'summary' | 'minimal' | 'celebratory';
}

export interface VisualPresentation {
  icon: 'heart' | 'support' | 'encouragement' | 'apology' | 'solution' | 'progress' | 'understanding' | 'patience';
  color: 'warm' | 'cool' | 'neutral' | 'supportive' | 'encouraging' | 'calm' | 'gentle' | 'professional';
  animation: 'gentle' | 'subtle' | 'smooth' | 'reassuring' | 'encouraging' | 'supportive';
  layout: 'centered' | 'comfortable' | 'clear' | 'spacious' | 'focused' | 'balanced';
  typography: 'soft' | 'clear' | 'friendly' | 'professional' | 'supportive' | 'encouraging';
}

export interface InteractionStyle {
  responsiveness: 'immediate' | 'gentle' | 'patient' | 'adaptive';
  feedback: 'detailed' | 'summary' | 'minimal' | 'encouraging';
  guidance: 'explicit' | 'suggestive' | 'optional' | 'contextual';
  control: 'user_driven' | 'guided' | 'assisted' | 'automated';
  pace: 'user_controlled' | 'suggested' | 'moderate' | 'relaxed';
}

export interface FollowUpAction {
  id: string;
  type: 'encouragement' | 'guidance' | 'support' | 'progress_check' | 'emotional_check' | 'confidence_build';
  trigger: 'immediate' | 'delayed' | 'progress_based' | 'time_based' | 'interaction_based';
  condition: string;
  action: string;
  emotionalGoal: string;
  expectedOutcome: string;
}

export interface EmotionalErrorHandlingProps {
  error: EmotionalError;
  onEmotionalResponse?: (response: EmotionalErrorResponse) => void;
  onFrustrationReduced?: (errorId: string, reduction: number) => void;
  onUserEngagement?: (errorId: string, engagement: string) => void;
  enableSofiaSupport?: boolean;
  autoRecovery?: boolean;
  frustrationThreshold?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

// Advanced emotional error handling engine
class EmotionalErrorEngine {
  private emotionalStrategies: Map<string, EmotionalStrategy> = new Map();
  private frustrationReducers: Map<string, FrustrationReducer[]> = new Map();
  private emotionalResponses: Map<string, EmotionalErrorResponse> = new Map();
  private userEmotionalHistory: Map<string, any[]> = new Map();

  constructor() {
    this.initializeEmotionalStrategies();
    this.initializeFrustrationReducers();
    this.initializeUserPreferences();
  }

  private initializeEmotionalStrategies(): void {
    // Empathetic strategy for frustrated users
    this.emotionalStrategies.set('empathetic_frustrated', {
      id: 'empathetic_frustrated',
      name: 'Empathetic Support',
      description: 'Provide understanding and emotional support for frustrated users',
      primaryGoal: 'reduce_frustration',
      emotionalApproach: 'empathetic',
      communicationStyle: 'supportive',
      tone: 'warm',
      pacing: 'gentle',
      intensity: 'medium'
    });

    // Encouraging strategy for confused users
    this.emotionalStrategies.set('encouraging_confused', {
      id: 'encouraging_confused',
      name: 'Encouraging Guidance',
      description: 'Build confidence and provide clear direction for confused users',
      primaryGoal: 'provide_clarity',
      emotionalApproach: 'encouraging',
      communicationStyle: 'nurturing',
      tone: 'optimistic',
      pacing: 'patient',
      intensity: 'medium'
    });

    // Reassuring strategy for anxious users
    this.emotionalStrategies.set('reassuring_anxious', {
      id: 'reassuring_anxious',
      name: 'Reassuring Support',
      description: 'Reduce anxiety and provide stability for anxious users',
      primaryGoal: 'restore_confidence',
      emotionalApproach: 'reassuring',
      communicationStyle: 'supportive',
      tone: 'neutral',
      pacing: 'measured',
      intensity: 'low'
    });

    // Apologetic strategy for disappointed users
    this.emotionalStrategies.set('apologetic_disappointed', {
      id: 'apologetic_disappointed',
      name: 'Apologetic Resolution',
      description: 'Take responsibility and provide solutions for disappointed users',
      primaryGoal: 'maintain_engagement',
      emotionalApproach: 'apologetic',
      communicationStyle: 'professional',
      tone: 'apologetic',
      pacing: 'immediate',
      intensity: 'high'
    });

    // Solution-focused strategy for overwhelmed users
    this.emotionalStrategies.set('solution_focused_overwhelmed', {
      id: 'solution_focused_overwhelmed',
      name: 'Solution-Focused Approach',
      description: 'Break down problems and provide clear solutions for overwhelmed users',
      primaryGoal: 'prevent_escalation',
      emotionalApproach: 'solution_focused',
      communicationStyle: 'direct',
      tone: 'formal',
      pacing: 'measured',
      intensity: 'adaptive'
    });
  }

  private initializeFrustrationReducers(): void {
    // Acknowledgment reducers
    this.frustrationReducers.set('acknowledgment', [
      {
        id: 'acknowledge_feelings',
        type: 'acknowledgment',
        technique: 'Direct acknowledgment of user emotions',
        message: 'I can see this is frustrating for you.',
        expectedImpact: 0.3,
        timing: 'immediate',
        duration: 3,
        effectiveness: 0.8
      },
      {
        id: 'validate_experience',
        type: 'acknowledgment',
        technique: 'Validation of user experience',
        message: 'I understand this isn\'t the experience you were expecting.',
        expectedImpact: 0.25,
        timing: 'immediate',
        duration: 3,
        effectiveness: 0.75
      }
    ]);

    // Empathy reducers
    this.frustrationReducers.set('empathy', [
      {
        id: 'show_understanding',
        type: 'empathy',
        technique: 'Demonstrate understanding of user situation',
        message: 'I completely understand how frustrating this must be.',
        expectedImpact: 0.4,
        timing: 'immediate',
        duration: 4,
        effectiveness: 0.85
      },
      {
        id: 'share_perspective',
        type: 'empathy',
        technique: 'Help user see situation from different angle',
        message: 'This happens sometimes, and I\'m here to help you through it.',
        expectedImpact: 0.35,
        timing: 'delayed',
        duration: 4,
        effectiveness: 0.8
      }
    ]);

    // Reassurance reducers
    this.frustrationReducers.set('reassurance', [
      {
        id: 'provide_stability',
        type: 'reassurance',
        technique: 'Assure user of positive resolution',
        message: 'Don\'t worry, we\'ll get this sorted out together.',
        expectedImpact: 0.45,
        timing: 'immediate',
        duration: 3,
        effectiveness: 0.9
      },
      {
        id: 'restore_confidence',
        type: 'reassurance',
        technique: 'Build user confidence in resolution',
        message: 'You\'re in good hands - I\'ll guide you through this step by step.',
        expectedImpact: 0.4,
        timing: 'progressive',
        duration: 5,
        effectiveness: 0.85
      }
    ]);

    // Progress showing reducers
    this.frustrationReducers.set('progress_showing', [
      {
        id: 'highlight_progress',
        type: 'progress_showing',
        technique: 'Show user what has been accomplished',
        message: 'You\'ve already made good progress - we\'re almost there.',
        expectedImpact: 0.5,
        timing: 'progressive',
        duration: 4,
        effectiveness: 0.9
      },
      {
        id: 'break_down_remaining',
        type: 'progress_showing',
        technique: 'Show manageable next steps',
        message: 'Just a couple more simple steps and we\'ll be done.',
        expectedImpact: 0.45,
        timing: 'progressive',
        duration: 4,
        effectiveness: 0.85
      }
    ]);
  }

  private initializeUserPreferences(): void {
    // Emotional handling preferences
    this.userEmotionalHistory.set('emotional_preferences', [{
      communicationStyle: 'supportive',
      tonePreference: 'warm',
      frustrationTolerance: 0.7,
      emotionalSupport: true,
      progressVisibility: true,
      reassuranceFrequency: 'moderate',
      empathyLevel: 'high'
    }]);
  }

  generateEmotionalResponse(error: EmotionalError): EmotionalErrorResponse {
    const emotionalStrategy = this.selectEmotionalStrategy(error);
    const frustrationReducers = this.selectFrustrationReducers(error);
    const emotionalSupport = this.generateEmotionalSupport(error, emotionalStrategy);
    const recoveryGuidance = this.generateRecoveryGuidance(error, emotionalStrategy);
    const visualPresentation = this.selectVisualPresentation(error, emotionalStrategy);
    const interactionStyle = this.selectInteractionStyle(error, emotionalStrategy);
    const followUpActions = this.generateFollowUpActions(error, emotionalStrategy);

    const response: EmotionalErrorResponse = {
      id: `emotional-response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      errorId: error.id,
      emotionalStrategy,
      responseType: emotionalStrategy.emotionalApproach as any,
      primaryMessage: this.generatePrimaryMessage(error, emotionalStrategy),
      supportiveMessage: this.generateSupportiveMessage(error, emotionalStrategy),
      frustrationReducers,
      emotionalSupport,
      recoveryGuidance,
      visualPresentation,
      interactionStyle,
      followUpActions,
      effectivenessPrediction: this.predictEffectiveness(error, emotionalStrategy),
      timestamp: Date.now()
    };

    this.emotionalResponses.set(response.id, response);
    return response;
  }

  private selectEmotionalStrategy(error: EmotionalError): EmotionalStrategy {
    const emotionalApproach = this.determineEmotionalApproach(error.emotionalContext);
    const key = `${emotionalApproach}_${error.emotionalContext.userEmotionalState}`;
    return this.emotionalStrategies.get(key) || this.emotionalStrategies.get('empathetic_frustrated')!;
  }

  private determineEmotionalApproach(context: EmotionalContext): string {
    // Determine emotional approach based on user emotional state and context
    switch (context.userEmotionalState) {
      case 'frustrated':
        return 'empathetic';
      case 'confused':
        return 'encouraging';
      case 'anxious':
        return 'reassuring';
      case 'disappointed':
        return 'apologetic';
      case 'overwhelmed':
        return 'solution_focused';
      case 'angry':
        return 'empathetic';
      case 'tired':
        return 'encouraging';
      case 'calm':
        return 'solution_focused';
      default:
        return 'empathetic';
    }
  }

  private selectFrustrationReducers(error: EmotionalError): FrustrationReducer[] {
    const reducers: FrustrationReducer[] = [];

    // Select based on frustration level
    if (error.emotionalContext.frustrationLevel > 0.8) {
      reducers.push(...this.frustrationReducers.get('acknowledgment')!);
      reducers.push(...this.frustrationReducers.get('empathy')!);
      reducers.push(...this.frustrationReducers.get('reassurance')!);
    } else if (error.emotionalContext.frustrationLevel > 0.5) {
      reducers.push(...this.frustrationReducers.get('empathy')!);
      reducers.push(...this.frustrationReducers.get('reassurance')!);
    } else {
      reducers.push(...this.frustrationReducers.get('progress_showing')!);
    }

    return reducers.slice(0, 3); // Limit to 3 most effective reducers
  }

  private generateEmotionalSupport(error: EmotionalError, strategy: EmotionalStrategy): EmotionalSupport {
    return {
      primarySupport: this.generateContextualSupport(error, strategy),
      secondarySupport: this.generateSecondarySupport(error, strategy),
      encouragement: this.generateEncouragement(error, strategy),
      empathyStatement: this.generateEmpathyStatement(error, strategy),
      frustrationAcknowledgment: this.generateFrustrationAcknowledgment(error, strategy),
      confidenceBuilder: this.generateConfidenceBuilder(error, strategy),
      relationshipBuilder: this.generateRelationshipBuilder(error, strategy),
      trustSignal: this.generateTrustSignal(error, strategy)
    };
  }

  private generatePrimaryMessage(error: EmotionalError, strategy: EmotionalStrategy): string {
    const templates = {
      empathetic: `I can see this is really frustrating, and I'm truly sorry you're experiencing this difficulty.`,
      encouraging: `I know this is challenging, but you're doing great and we're going to get through this together.`,
      reassuring: `Don't worry - this is something we can definitely resolve, and I'm here to help you every step of the way.`,
      apologetic: `I sincerely apologize for the inconvenience this has caused you. This isn't the experience we want for you.`,
      solution_focused: `Let's focus on getting this resolved quickly. I have a clear path forward that should solve this issue.`,
      progress_oriented: `You've already made progress by getting this far. Let's build on that momentum to complete the solution.`
    };

    return templates[strategy.emotionalApproach] || templates.empathetic;
  }

  private generateSupportiveMessage(error: EmotionalError, strategy: EmotionalStrategy): string {
    const userName = 'there'; // In real implementation, get from user context
    const supportMessages = {
      empathetic: `I understand how ${error.emotionalContext.userEmotionalState} this must make you feel, ${userName}.`,
      encouraging: `You're taking the right approach by seeking help, ${userName}. That shows real determination.`,
      reassuring: `This happens sometimes, ${userName}, and it's not your fault. These things can be tricky.`,
      apologetic: `I appreciate your patience, ${userName}. We don't take your time and trust lightly.`,
      solution_focused: `Let's work together systematically, ${userName}. We'll break this down into manageable steps.`,
      progress_oriented: `Every expert was once a beginner, ${userName}. You're learning and growing through this process.`
    };

    return supportMessages[strategy.emotionalApproach] || supportMessages.empathetic;
  }

  private generateContextualSupport(error: EmotionalError, strategy: EmotionalStrategy): string {
    // Generate support based on specific error context
    if (error.type === 'network') {
      return 'I know waiting for connections can be really frustrating, especially when you\'re trying to get something important done.';
    } else if (error.type === 'validation') {
      return 'I understand that filling out forms and getting validation errors can feel tedious and discouraging.';
    } else if (error.type === 'permission') {
      return 'I know dealing with permission requests can feel intrusive and confusing.';
    } else {
      return 'I can see this technical issue is disrupting your workflow, and I appreciate you working through it with me.';
    }
  }

  private generateSecondarySupport(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'Remember, this difficulty doesn\'t reflect on your abilities - these things happen to everyone sometimes.';
  }

  private generateEncouragement(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'You\'re taking a positive step by working to resolve this, and that shows real initiative and capability.';
  }

  private generateEmpathyStatement(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'I truly understand how this situation feels, and I want to help make it better for you.';
  }

  private generateFrustrationAcknowledgment(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'I can see this is frustrating, and I want to acknowledge that your feelings are completely valid.';
  }

  private generateConfidenceBuilder(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'You have the capability to get through this - you\'ve already shown that by seeking a solution.';
  }

  private generateRelationshipBuilder(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'I value you as a user and appreciate the opportunity to help resolve this issue for you.';
  }

  private generateTrustSignal(error: EmotionalError, strategy: EmotionalStrategy): string {
    return 'I\'m committed to helping you succeed and will be here with you through each step of the resolution.';
  }

  private generateRecoveryGuidance(error: EmotionalError, strategy: EmotionalStrategy): RecoveryGuidance {
    return {
      approach: 'step_by_step',
      complexity: error.emotionalContext.userEmotionalState === 'overwhelmed' ? 'minimal' : 'basic',
      userControl: 'guided',
      emotionalPacing: 'patient',
      progressVisibility: 'detailed'
    };
  }

  private selectVisualPresentation(error: EmotionalError, strategy: EmotionalStrategy): VisualPresentation {
    return {
      icon: 'support',
      color: 'supportive',
      animation: 'reassuring',
      layout: 'comfortable',
      typography: 'friendly'
    };
  }

  private selectInteractionStyle(error: EmotionalError, strategy: EmotionalStrategy): InteractionStyle {
    return {
      responsiveness: 'gentle',
      feedback: 'encouraging',
      guidance: 'explicit',
      control: 'guided',
      pace: 'user_controlled'
    };
  }

  private generateFollowUpActions(error: EmotionalError, strategy: EmotionalStrategy): FollowUpAction[] {
    return [
      {
        id: 'encouragement_followup',
        type: 'encouragement',
        trigger: 'progress_based',
        condition: 'after_30_seconds',
        action: 'Provide additional encouragement',
        emotionalGoal: 'Maintain user motivation',
        expectedOutcome: 'Sustained user engagement'
      },
      {
        id: 'emotional_check',
        type: 'emotional_check',
        trigger: 'time_based',
        condition: 'after_2_minutes',
        action: 'Check user emotional state',
        emotionalGoal: 'Ensure user comfort',
        expectedOutcome: 'Improved user experience'
      }
    ];
  }

  private predictEffectiveness(error: EmotionalError, strategy: EmotionalStrategy): number {
    // Predict effectiveness based on emotional context and strategy alignment
    let effectiveness = 0.5; // Base effectiveness

    // Adjust based on emotional state alignment
    if (strategy.emotionalApproach === 'empathetic' && error.emotionalContext.userEmotionalState === 'frustrated') {
      effectiveness += 0.2;
    }

    // Adjust based on frustration level
    effectiveness += (1 - error.emotionalContext.frustrationLevel) * 0.3;

    // Adjust based on coping capacity
    if (error.emotionalContext.copingCapacity === 'high') {
      effectiveness += 0.1;
    } else if (error.emotionalContext.copingCapacity === 'low') {
      effectiveness -= 0.1;
    }

    return Math.max(0, Math.min(1, effectiveness));
  }

  updateUserEmotionalHistory(userId: string, emotionalData: any): void {
    const history = this.userEmotionalHistory.get(userId) || [];
    history.push({
      ...emotionalData,
      timestamp: Date.now()
    });
    this.userEmotionalHistory.set(userId, history);
  }

  getEmotionalResponse(responseId: string): EmotionalErrorResponse | undefined {
    return this.emotionalResponses.get(responseId);
  }

  getFrustrationReducers(type: string): FrustrationReducer[] {
    return this.frustrationReducers.get(type) || [];
  }
}

// Main component implementation
export const EmotionalErrorHandling: React.FC<EmotionalErrorHandlingProps> = ({
  error,
  onEmotionalResponse,
  onFrustrationReduced,
  onUserEngagement,
  enableSofiaSupport = true,
  autoRecovery = true,
  frustrationThreshold = 0.7,
  className = '',
  theme = 'auto'
}) => {
  const [emotionalResponse, setEmotionalResponse] = useState<EmotionalErrorResponse | null>(null);
  const [frustrationLevel, setFrustrationLevel] = useState(error.emotionalContext.frustrationLevel);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showEmotionalSupport, setShowEmotionalSupport] = useState(false);

  const emotionalEngine = useRef(new EmotionalErrorEngine());
  const analytics = useRef(new EmotionalErrorAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Generate emotional response
  useEffect(() => {
    if (error && !emotionalResponse) {
      const response = emotionalEngine.current.generateEmotionalResponse(error);
      setEmotionalResponse(response);

      // Show Sofia support if enabled
      if (enableSofiaSupport) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'emotional_support',
          context: error.type,
          emotionalTone: 'empathetic',
          userEmotionalState: emotionalState,
          urgency: error.severity
        });
        setSofiaMessage(message);
      }

      // Track emotional response
      onEmotionalResponse?.(response);
      analytics.current.trackEmotionalResponse(response, error);
    }
  }, [error, emotionalResponse, enableSofiaSupport, emotionalState, onEmotionalResponse]);

  const handleFrustrationReduction = useCallback((reduction: number) => {
    setFrustrationLevel(prev => Math.max(0, prev - reduction));
    onFrustrationReduced?.(error.id, reduction);
    analytics.current.trackFrustrationReduction(error.id, reduction);
  }, [error.id, onFrustrationReduced]);

  const handleUserEngagement = useCallback((engagement: string) => {
    onUserEngagement?.(error.id, engagement);
    analytics.current.trackUserEngagement(error.id, engagement);
  }, [error.id, onUserEngagement]);

  const getEmotionalIcon = (response: EmotionalErrorResponse) => {
    const icons = {
      heart: '💙',
      support: '🤝',
      encouragement: '🌟',
      apology: '🙏',
      solution: '🔧',
      progress: '📈',
      understanding: '💡',
      patience: '⏳'
    };
    return icons[response.visualPresentation.icon] || icons.support;
  };

  const getEmotionalColor = (response: EmotionalErrorResponse) => {
    const colors = {
      warm: 'bg-amber-50 border-amber-200 text-amber-800',
      cool: 'bg-blue-50 border-blue-200 text-blue-800',
      neutral: 'bg-gray-50 border-gray-200 text-gray-800',
      supportive: 'bg-green-50 border-green-200 text-green-800',
      encouraging: 'bg-purple-50 border-purple-200 text-purple-800',
      calm: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      gentle: 'bg-pink-50 border-pink-200 text-pink-800',
      professional: 'bg-slate-50 border-slate-200 text-slate-800'
    };
    return colors[response.visualPresentation.color] || colors.supportive;
  };

  if (!emotionalResponse) {
    return (
      <div className={`emotional-error-handling ${className} theme-${theme}`}>
        <div className="emotional-loading">
          <p>Preparing emotional support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`emotional-error-handling ${className} theme-${theme}`}>
      {/* Sofia emotional support */}
      {enableSofiaSupport && sofiaMessage && (
        <motion.div
          className="sofia-emotional-support"
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
            <div className="emotional-features">
              <span className="feature-indicator">Emotional AI: ✓</span>
              <span className="feature-indicator">Frustration Reduction: ✓</span>
              <span className="feature-indicator">Supportive: ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main emotional error response */}
      <motion.div
        className={`emotional-error-response ${getEmotionalColor(emotionalResponse)}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Emotional header */}
        <div className="emotional-header">
          <div className="emotional-icon">
            <span className="icon">{getEmotionalIcon(emotionalResponse)}</span>
          </div>
          <div className="emotional-title">
            <h3>{emotionalResponse.primaryMessage}</h3>
          </div>
        </div>

        {/* Supportive message */}
        <div className="emotional-support-message">
          <p>{emotionalResponse.supportiveMessage}</p>
        </div>

        {/* Frustration reducers */}
        {emotionalResponse.frustrationReducers.length > 0 && (
          <div className="frustration-reducers">
            <h4>Here's what I'm doing to help:</h4>
            <div className="reducers-list">
              {emotionalResponse.frustrationReducers.map((reducer) => (
                <motion.div
                  key={reducer.id}
                  className="frustration-reducer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="reducer-icon">✨</div>
                  <div className="reducer-content">
                    <p>{reducer.message}</p>
                    <div className="reducer-meta">
                      <span className="impact">Impact: {Math.round(reducer.expectedImpact * 100)}%</span>
                      <span className="timing">{reducer.timing}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional support details */}
        <div className="emotional-support-details">
          <details className="emotional-support-accordion">
            <summary>More Emotional Support</summary>
            <div className="support-content">
              <div className="support-item">
                <h5>Encouragement</h5>
                <p>{emotionalResponse.emotionalSupport.encouragement}</p>
              </div>
              <div className="support-item">
                <h5>Empathy</h5>
                <p>{emotionalResponse.emotionalSupport.empathyStatement}</p>
              </div>
              <div className="support-item">
                <h5>Confidence Building</h5>
                <p>{emotionalResponse.emotionalSupport.confidenceBuilder}</p>
              </div>
              <div className="support-item">
                <h5>Trust Signal</h5>
                <p>{emotionalResponse.emotionalSupport.trustSignal}</p>
              </div>
            </div>
          </details>
        </div>

        {/* Recovery guidance */}
        <div className="recovery-guidance">
          <h4>Recovery Approach</h4>
          <div className="guidance-details">
            <div className="guidance-item">
              <span className="guidance-label">Approach:</span>
              <span className="guidance-value">{emotionalResponse.recoveryGuidance.approach.replace('_', ' ')}</span>
            </div>
            <div className="guidance-item">
              <span className="guidance-label">Complexity:</span>
              <span className="guidance-value">{emotionalResponse.recoveryGuidance.complexity}</span>
            </div>
            <div className="guidance-item">
              <span className="guidance-label">Control:</span>
              <span className="guidance-value">{emotionalResponse.recoveryGuidance.userControl}</span>
            </div>
            <div className="guidance-item">
              <span className="guidance-label">Pacing:</span>
              <span className="guidance-value">{emotionalResponse.recoveryGuidance.emotionalPacing}</span>
            </div>
          </div>
        </div>

        {/* Effectiveness indicator */}
        <div className="effectiveness-indicator">
          <div className="effectiveness-bar">
            <div
              className="effectiveness-fill"
              style={{ width: `${emotionalResponse.effectivenessPrediction * 100}%` }}
            />
          </div>
          <span className="effectiveness-text">
            {Math.round(emotionalResponse.effectivenessPrediction * 100)}% effective for your situation
          </span>
        </div>

        {/* Interaction controls */}
        <div className="emotional-controls">
          <button
            className="emotional-button primary"
            onClick={() => handleFrustrationReduction(0.2)}
          >
            This Helps
          </button>
          <button
            className="emotional-button secondary"
            onClick={() => setShowEmotionalSupport(!showEmotionalSupport)}
          >
            More Support
          </button>
          <button
            className="emotional-button tertiary"
            onClick={() => handleUserEngagement('continued_engagement')}
          >
            Continue
          </button>
        </div>
      </motion.div>

      {/* Additional emotional support panel */}
      <AnimatePresence>
        {showEmotionalSupport && (
          <motion.div
            className="additional-emotional-support"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4>Additional Support Options</h4>
            <div className="support-options">
              <div className="support-option">
                <h5>Take a Break</h5>
                <p>Sometimes stepping away for a moment helps reduce frustration.</p>
                <button className="support-action">Take Break</button>
              </div>
              <div className="support-option">
                <h5>Simplify the Process</h5>
                <p>I can show you a simpler way to accomplish your goal.</p>
                <button className="support-action">Show Simple Way</button>
              </div>
              <div className="support-option">
                <h5>Get Human Help</h5>
                <p>Connect with a support specialist who can help personally.</p>
                <button className="support-action">Get Human Help</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotional analytics panel */}
      <div className="emotional-analytics-panel" aria-hidden="true">
        <details className="emotional-details">
          <summary>Emotional Support System Information</summary>
          <div className="emotional-info">
            <h4>Emotional Engine Status</h4>
            <p><strong>Response ID:</strong> {emotionalResponse.id}</p>
            <p><strong>Strategy:</strong> {emotionalResponse.emotionalStrategy.name}</p>
            <p><strong>Approach:</strong> {emotionalResponse.emotionalStrategy.emotionalApproach}</p>
            <p><strong>Effectiveness:</strong> {Math.round(emotionalResponse.effectivenessPrediction * 100)}%</p>
            <p><strong>Frustration Level:</strong> {Math.round(frustrationLevel * 100)}%</p>
            <p><strong>User State:</strong> {error.emotionalContext.userEmotionalState}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default EmotionalErrorHandling;