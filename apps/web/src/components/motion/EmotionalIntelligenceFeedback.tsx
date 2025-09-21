import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Emotional intelligence feedback configuration interface
export interface EmotionalFeedbackConfig {
  id: string;
  name: string;
  description: string;
  type: 'encouragement' | 'support' | 'celebration' | 'guidance' | 'empathy' | 'motivation' | 'calm' | 'focus';
  intensity: 'subtle' | 'moderate' | 'strong' | 'adaptive';
  timing: 'immediate' | 'delayed' | 'contextual' | 'predictive';
  context: 'success' | 'error' | 'loading' | 'completion' | 'transition' | 'interaction' | 'universal';
  adaptation: 'static' | 'reactive' | 'predictive' | 'emotional' | 'cognitive';
  personality: 'sofia' | 'professional' | 'friendly' | 'calm' | 'energetic' | 'empathetic';
  language: 'formal' | 'casual' | 'supportive' | 'motivational' | 'gentle' | 'direct';
}

export interface EmotionalState {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'anticipation' | 'trust';
  secondary: string[];
  intensity: number;
  confidence: number;
  context: string;
  triggers: string[];
  coping: string[];
}

export interface EmotionalFeedbackProps {
  config: EmotionalFeedbackConfig;
  emotionalState: EmotionalState;
  trigger: 'success' | 'error' | 'loading' | 'completion' | 'transition' | 'interaction' | 'custom';
  message?: string;
  children?: React.ReactNode;
  enableAnimation?: boolean;
  enableSound?: boolean;
  enableHaptic?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onFeedbackComplete?: (feedback: EmotionalFeedbackResult, duration: number) => void;
  onEmotionalResponse?: (response: EmotionalResponse, state: EmotionalState) => void;
  onAdaptation?: (adaptation: EmotionalAdaptation, reason: string) => void;
}

export interface EmotionalFeedbackResult {
  id: string;
  type: string;
  message: string;
  emotionalTone: string;
  effectiveness: number;
  userResponse: 'positive' | 'neutral' | 'negative' | 'unknown';
  duration: number;
  adaptations: EmotionalAdaptation[];
  recommendations: string[];
}

export interface EmotionalResponse {
  type: 'engagement' | 'dismissal' | 'interaction' | 'emotional_shift';
  intensity: number;
  duration: number;
  context: Record<string, any>;
  timestamp: number;
}

export interface EmotionalAdaptation {
  type: 'tone' | 'intensity' | 'timing' | 'content' | 'style' | 'frequency';
  from: any;
  to: any;
  reason: string;
  confidence: number;
  effectiveness: number;
}

// Emotional intelligence feedback engine
export class EmotionalIntelligenceEngine {
  private static emotionalHistory: Map<string, EmotionalState[]> = new Map();
  private static feedbackHistory: Map<string, EmotionalFeedbackResult[]> = new Map();
  private static adaptationHistory: Map<string, EmotionalAdaptation[]> = new Map();

  static generateEmotionalFeedback(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    customMessage?: string
  ): {
    feedback: EmotionalFeedbackResult;
    adaptations: EmotionalAdaptation[];
    recommendations: string[];
  } {
    // Analyze emotional state and context
    const emotionalContext = this.analyzeEmotionalContext(emotionalState, trigger);
    const userHistory = this.getUserEmotionalHistory(emotionalState, config.id);
    const feedbackHistory = this.getFeedbackHistory(config.id);

    // Generate appropriate message
    const message = customMessage || this.generateContextualMessage(
      config,
      emotionalState,
      trigger,
      emotionalContext
    );

    // Determine emotional tone
    const emotionalTone = this.determineEmotionalTone(
      config,
      emotionalState,
      trigger,
      emotionalContext
    );

    // Calculate effectiveness prediction
    const effectiveness = this.predictEffectiveness(
      config,
      emotionalState,
      trigger,
      userHistory,
      feedbackHistory
    );

    // Generate adaptations
    const adaptations = this.generateEmotionalAdaptations(
      config,
      emotionalState,
      trigger,
      effectiveness,
      userHistory
    );

    // Generate recommendations
    const recommendations = this.generateEmotionalRecommendations(
      config,
      emotionalState,
      trigger,
      effectiveness
    );

    const feedback: EmotionalFeedbackResult = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type,
      message,
      emotionalTone,
      effectiveness,
      userResponse: 'unknown',
      duration: this.calculateOptimalDuration(config, emotionalState, trigger),
      adaptations,
      recommendations,
    };

    return {
      feedback,
      adaptations,
      recommendations,
    };
  }

  private static analyzeEmotionalContext(
    emotionalState: EmotionalState,
    trigger: string
  ): {
    appropriateness: number;
    timing: number;
    intensity: number;
    context: string;
  } {
    // Analyze if the current emotional state is appropriate for the trigger
    const appropriateness = this.calculateEmotionalAppropriateness(emotionalState, trigger);
    const timing = this.calculateOptimalTiming(emotionalState, trigger);
    const intensity = this.calculateEmotionalIntensity(emotionalState, trigger);

    let context = 'neutral';
    if (emotionalState.intensity > 0.8) context = 'intense';
    else if (emotionalState.intensity < 0.3) context = 'calm';
    else if (emotionalState.primary === 'joy') context = 'positive';
    else if (emotionalState.primary === 'sadness' || emotionalState.primary === 'fear') context = 'sensitive';

    return { appropriateness, timing, intensity, context };
  }

  private static calculateEmotionalAppropriateness(
    emotionalState: EmotionalState,
    trigger: string
  ): number {
    // Calculate how appropriate the current emotional state is for the given trigger
    const emotionalWeights: Record<string, Record<string, number>> = {
      'success': {
        'joy': 0.9, 'anticipation': 0.8, 'trust': 0.7,
        'surprise': 0.6, 'fear': 0.2, 'sadness': 0.1
      },
      'error': {
        'fear': 0.7, 'surprise': 0.6, 'anger': 0.5,
        'sadness': 0.4, 'disgust': 0.3, 'joy': 0.1
      },
      'loading': {
        'anticipation': 0.8, 'trust': 0.7, 'joy': 0.4,
        'fear': 0.3, 'surprise': 0.2, 'sadness': 0.1
      },
      'completion': {
        'joy': 0.9, 'trust': 0.8, 'anticipation': 0.7,
        'surprise': 0.6, 'fear': 0.1, 'sadness': 0.1
      },
    };

    const triggerWeights = emotionalWeights[trigger] || {
      'joy': 0.5, 'trust': 0.5, 'anticipation': 0.5,
      'fear': 0.3, 'surprise': 0.3, 'sadness': 0.2
    };

    const stateWeight = triggerWeights[emotionalState.primary] || 0.5;
    const intensityAdjustment = emotionalState.intensity * 0.2;

    return Math.max(0, Math.min(1, stateWeight + intensityAdjustment));
  }

  private static calculateOptimalTiming(
    emotionalState: EmotionalState,
    trigger: string
  ): number {
    // Calculate optimal timing based on emotional state
    let baseTiming = 1.0;

    // Adjust based on emotional intensity
    if (emotionalState.intensity > 0.7) {
      baseTiming *= 0.8; // Faster response for intense emotions
    } else if (emotionalState.intensity < 0.3) {
      baseTiming *= 1.2; // Slower response for calm states
    }

    // Adjust based on emotional state
    if (emotionalState.primary === 'fear' || emotionalState.primary === 'anger') {
      baseTiming *= 0.9; // Faster for negative emotions
    } else if (emotionalState.primary === 'joy' || emotionalState.primary === 'trust') {
      baseTiming *= 1.1; // Slightly slower for positive emotions
    }

    return Math.max(0.1, Math.min(2.0, baseTiming));
  }

  private static calculateEmotionalIntensity(
    emotionalState: EmotionalState,
    trigger: string
  ): number {
    // Calculate appropriate intensity for the feedback
    const baseIntensity = emotionalState.intensity;
    const triggerIntensity = this.getTriggerIntensity(trigger);

    // Blend emotional state and trigger intensity
    const blendedIntensity = (baseIntensity * 0.6) + (triggerIntensity * 0.4);

    return Math.max(0.1, Math.min(1.0, blendedIntensity));
  }

  private static getTriggerIntensity(trigger: string): number {
    const intensities: Record<string, number> = {
      'success': 0.7,
      'error': 0.8,
      'loading': 0.4,
      'completion': 0.9,
      'transition': 0.5,
      'interaction': 0.6,
      'custom': 0.5,
    };

    return intensities[trigger] || 0.5;
  }

  private static generateContextualMessage(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    emotionalContext: any
  ): string {
    // Generate contextually appropriate message based on Sofia's personality
    const sofiaMessages: Record<string, Record<string, string[]>> = {
      'success': {
        'joy': [
          "Wonderful! You've successfully completed this step. I'm proud of your progress!",
          "Excellent work! That was handled beautifully. You're making great strides!",
          "Perfect! You've accomplished something important. How does that feel?",
        ],
        'trust': [
          "Beautifully done! I knew you could handle this with grace.",
          "Wonderful achievement! Your careful approach really paid off.",
          "Excellent! You've shown such thoughtful consideration in this process.",
        ],
        'anticipation': [
          "Fantastic! This milestone brings us closer to your goal. What's next on your mind?",
          "Wonderful progress! I can sense your anticipation for what comes next.",
          "Beautiful work! This achievement opens up new possibilities for you.",
        ],
      },
      'error': {
        'fear': [
          "I understand this might feel concerning, but I'm here to help you through it.",
          "It's completely normal to feel uncertain here. Let's work through this together.",
          "I can sense this is challenging. Take a breath - we'll figure this out step by step.",
        ],
        'surprise': [
          "I see this wasn't what you expected. Let's understand what happened and find the best way forward.",
          "Unexpected challenges can be difficult. I'm here to help you navigate this.",
          "This might feel surprising, but you're capable of handling this. Let's see what we can do.",
        ],
        'anger': [
          "I can understand this might be frustrating. Let's take a moment and approach this calmly.",
          "It's okay to feel challenged by this. I'm here to support you through the difficulty.",
          "This seems difficult - let's work together to find a solution that feels right.",
        ],
      },
      'loading': {
        'anticipation': [
          "I'm working on this for you. I know you're looking forward to seeing the results.",
          "Processing your request with care. I appreciate your patience during this moment.",
          "Taking the time to do this right. Your thoughtful approach deserves careful attention.",
        ],
        'trust': [
          "Carefully processing your information. I want to make sure everything is handled properly.",
          "Working through this step by step. I know this matters to you.",
          "Taking the time to ensure everything is done thoughtfully and thoroughly.",
        ],
        'calm': [
          "Gently processing your request. Sometimes the best things take a moment to unfold.",
          "Working on this with careful attention. I value the importance of doing this right.",
          "Taking the time to handle this properly. Your patience allows for better results.",
        ],
      },
    };

    const triggerMessages = sofiaMessages[trigger] || {};
    const emotionalMessages = triggerMessages[emotionalState.primary] || triggerMessages['trust'] || [
      "I'm here to help you through this. Let's work together to find the best approach.",
      "I understand this is important to you. Let's take this step by step.",
      "You're not alone in this. I'm here to support you every step of the way.",
    ];

    // Select message based on emotional context
    const messageIndex = Math.floor(Math.random() * emotionalMessages.length);
    return emotionalMessages[messageIndex] || "I'm here to help you through this. Let's work together to find the best approach.";
  }

  private static determineEmotionalTone(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    emotionalContext: any
  ): string {
    // Determine the emotional tone for the feedback
    if (config.personality === 'sofia') {
      if (emotionalState.primary === 'joy' || emotionalState.primary === 'trust') {
        return 'warm_celebratory';
      } else if (emotionalState.primary === 'fear' || emotionalState.primary === 'sadness') {
        return 'gentle_supportive';
      } else if (emotionalState.primary === 'anger') {
        return 'calm_empathetic';
      } else {
        return 'professional_supportive';
      }
    }

    // Fallback tone determination
    if (emotionalContext.intensity > 0.7) {
      return 'intense_supportive';
    } else if (emotionalContext.intensity < 0.3) {
      return 'gentle_encouraging';
    } else {
      return 'balanced_professional';
    }
  }

  private static predictEffectiveness(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    userHistory: EmotionalState[],
    feedbackHistory: EmotionalFeedbackResult[]
  ): number {
    // Predict effectiveness based on historical data and current context
    let effectiveness = 0.5; // Base effectiveness

    // Adjust based on emotional appropriateness
    const appropriateness = this.calculateEmotionalAppropriateness(emotionalState, trigger);
    effectiveness += (appropriateness - 0.5) * 0.3;

    // Adjust based on user history
    if (userHistory.length > 0) {
      const recentStates = userHistory.slice(-5);
      const avgIntensity = recentStates.reduce((sum, state) => sum + state.intensity, 0) / recentStates.length;
      effectiveness += (avgIntensity - 0.5) * 0.2;
    }

    // Adjust based on feedback history
    if (feedbackHistory.length > 0) {
      const recentFeedback = feedbackHistory.slice(-3);
      const avgEffectiveness = recentFeedback.reduce((sum, fb) => sum + fb.effectiveness, 0) / recentFeedback.length;
      effectiveness += (avgEffectiveness - 0.5) * 0.1;
    }

    return Math.max(0, Math.min(1, effectiveness));
  }

  private static generateEmotionalAdaptations(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    effectiveness: number,
    userHistory: EmotionalState[]
  ): EmotionalAdaptation[] {
    const adaptations: EmotionalAdaptation[] = [];

    // Adapt intensity based on effectiveness
    if (effectiveness < 0.4) {
      adaptations.push({
        type: 'intensity',
        from: config.intensity,
        to: 'strong',
        reason: 'Low predicted effectiveness - increasing intensity',
        confidence: 0.7,
        effectiveness: 0.3,
      });
    } else if (effectiveness > 0.8) {
      adaptations.push({
        type: 'intensity',
        from: config.intensity,
        to: 'subtle',
        reason: 'High predicted effectiveness - reducing intensity',
        confidence: 0.8,
        effectiveness: 0.9,
      });
    }

    // Adapt timing based on emotional state
    if (emotionalState.intensity > 0.7) {
      adaptations.push({
        type: 'timing',
        from: config.timing,
        to: 'immediate',
        reason: 'High emotional intensity - immediate response needed',
        confidence: 0.9,
        effectiveness: 0.8,
      });
    }

    // Adapt language based on user history
    if (userHistory.length > 0) {
      const recentJoy = userHistory.filter(s => s.primary === 'joy').length;
      const recentTrust = userHistory.filter(s => s.primary === 'trust').length;

      if (recentJoy > recentTrust) {
        adaptations.push({
          type: 'content',
          from: config.language,
          to: 'supportive',
          reason: 'User shows positive emotional patterns - using supportive language',
          confidence: 0.6,
          effectiveness: 0.7,
        });
      }
    }

    return adaptations;
  }

  private static generateEmotionalRecommendations(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string,
    effectiveness: number
  ): string[] {
    const recommendations: string[] = [];

    if (effectiveness < 0.5) {
      recommendations.push('Consider adjusting feedback intensity for better emotional connection');
      recommendations.push('Try using more personalized language based on user emotional state');
    }

    if (emotionalState.intensity > 0.8) {
      recommendations.push('High emotional intensity detected - provide additional emotional support');
      recommendations.push('Consider offering coping strategies or emotional guidance');
    }

    if (config.personality === 'sofia') {
      recommendations.push('Maintain Sofia\'s warm, supportive personality throughout interactions');
      recommendations.push('Use empathetic language that acknowledges user feelings');
    }

    return recommendations;
  }

  private static calculateOptimalDuration(
    config: EmotionalFeedbackConfig,
    emotionalState: EmotionalState,
    trigger: string
  ): number {
    // Calculate optimal duration for the feedback
    let baseDuration = 3000; // 3 seconds base

    // Adjust based on emotional intensity
    if (emotionalState.intensity > 0.7) {
      baseDuration *= 1.5; // Longer for intense emotions
    } else if (emotionalState.intensity < 0.3) {
      baseDuration *= 0.8; // Shorter for calm states
    }

    // Adjust based on trigger type
    const triggerMultipliers: Record<string, number> = {
      'success': 1.2,
      'error': 1.5,
      'loading': 0.8,
      'completion': 1.3,
      'transition': 1.0,
      'interaction': 0.9,
    };

    baseDuration *= triggerMultipliers[trigger] || 1.0;

    return Math.max(1000, Math.min(8000, baseDuration));
  }

  private static getUserEmotionalHistory(
    emotionalState: EmotionalState,
    configId: string
  ): EmotionalState[] {
    return this.emotionalHistory.get(configId) || [];
  }

  private static getFeedbackHistory(configId: string): EmotionalFeedbackResult[] {
    return this.feedbackHistory.get(configId) || [];
  }

  static recordEmotionalState(
    configId: string,
    emotionalState: EmotionalState
  ): void {
    const history = this.emotionalHistory.get(configId) || [];
    history.push(emotionalState);

    // Keep only last 50 states
    if (history.length > 50) {
      history.shift();
    }

    this.emotionalHistory.set(configId, history);
  }

  static recordFeedbackResult(
    configId: string,
    feedback: EmotionalFeedbackResult
  ): void {
    const history = this.feedbackHistory.get(configId) || [];
    history.push(feedback);

    // Keep only last 20 feedback results
    if (history.length > 20) {
      history.shift();
    }

    this.feedbackHistory.set(configId, history);
  }

  static recordAdaptation(
    configId: string,
    adaptation: EmotionalAdaptation
  ): void {
    const history = this.adaptationHistory.get(configId) || [];
    history.push(adaptation);

    // Keep only last 10 adaptations
    if (history.length > 10) {
      history.shift();
    }

    this.adaptationHistory.set(configId, history);
  }
}

const EmotionalIntelligenceFeedback: React.FC<EmotionalFeedbackProps> = ({
  config,
  emotionalState,
  trigger,
  message,
  children,
  enableAnimation = true,
  enableSound = false,
  enableHaptic = false,
  className = '',
  style = {},
  onFeedbackComplete,
  onEmotionalResponse,
  onAdaptation,
}) => {
  const [currentFeedback, setCurrentFeedback] = useState<EmotionalFeedbackResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adaptations, setAdaptations] = useState<EmotionalAdaptation[]>([]);

  const feedbackRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Generate emotional feedback
  const generateFeedback = useCallback(() => {
    const result = EmotionalIntelligenceEngine.generateEmotionalFeedback(
      config,
      emotionalState,
      trigger,
      message
    );

    setCurrentFeedback(result.feedback);
    setAdaptations(result.adaptations);

    // Record the feedback for learning
    EmotionalIntelligenceEngine.recordFeedbackResult(config.id, result.feedback);
    EmotionalIntelligenceEngine.recordEmotionalState(config.id, emotionalState);

    // Apply adaptations
    result.adaptations.forEach(adaptation => {
      EmotionalIntelligenceEngine.recordAdaptation(config.id, adaptation);
      onAdaptation?.(adaptation, adaptation.reason);
    });

    setIsVisible(true);

    // Auto-hide after calculated duration
    const duration = result.feedback.duration;
    setTimeout(() => {
      setIsVisible(false);
      onFeedbackComplete?.(result.feedback, duration);
    }, duration);
  }, [
    config,
    emotionalState,
    trigger,
    message,
    onFeedbackComplete,
    onAdaptation,
  ]);

  // Handle user interaction with feedback
  const handleFeedbackInteraction = useCallback((interactionType: string) => {
    if (!currentFeedback) return;

    const response: EmotionalResponse = {
      type: 'interaction',
      intensity: emotionalState.intensity,
      duration: Date.now() - Date.now(), // Will be calculated properly
      context: { interactionType, trigger },
      timestamp: Date.now(),
    };

    onEmotionalResponse?.(response, emotionalState);
  }, [currentFeedback, emotionalState, trigger, onEmotionalResponse]);

  // Generate feedback on mount and when props change
  useEffect(() => {
    generateFeedback();
  }, [generateFeedback]);

  // Get appropriate animation variants based on emotional tone
  const getAnimationVariants = () => {
    const tone = currentFeedback?.emotionalTone || 'balanced_professional';

    const variants: Record<string, any> = {
      'warm_celebratory': {
        initial: { scale: 0.8, opacity: 0, rotate: -5 },
        animate: { scale: 1, opacity: 1, rotate: 0 },
        exit: { scale: 1.1, opacity: 0, rotate: 5 },
      },
      'gentle_supportive': {
        initial: { scale: 0.9, opacity: 0, y: 10 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.95, opacity: 0, y: -5 },
      },
      'calm_empathetic': {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.98, opacity: 0 },
      },
      'balanced_professional': {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.95, opacity: 0 },
      },
    };

    return variants[tone] || variants['balanced_professional'];
  };

  // Get appropriate colors based on emotional tone
  const getEmotionalColors = (): { background: string; text: string; accent: string } => {
    const tone = currentFeedback?.emotionalTone || 'balanced_professional';

    const colorSchemes: Record<string, { background: string; text: string; accent: string }> = {
      'warm_celebratory': {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        text: '#ffffff',
        accent: '#d97706',
      },
      'gentle_supportive': {
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        text: '#ffffff',
        accent: '#2563eb',
      },
      'calm_empathetic': {
        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        text: '#ffffff',
        accent: '#059669',
      },
      'balanced_professional': {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        text: '#ffffff',
        accent: '#6d28d9',
      },
    };

    // Ensure a valid color scheme is always returned
    const selectedScheme = colorSchemes[tone];
    return selectedScheme || colorSchemes['balanced_professional']!;
  };

  return (
    <AnimatePresence>
      {isVisible && currentFeedback && (
        <motion.div
          ref={feedbackRef}
          className={`emotional-intelligence-feedback ${config.type} ${className}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            maxWidth: '400px',
            width: '90%',
            ...style,
          }}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: 'easeOut',
          }}
          onClick={() => handleFeedbackInteraction('click')}
          onMouseEnter={() => handleFeedbackInteraction('hover')}
        >
          {/* Feedback content */}
          <div
            style={{
              background: getEmotionalColors().background,
              color: getEmotionalColors().text,
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${getEmotionalColors().accent}20`,
            }}
          >
            {/* Sofia avatar */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '24px',
              }}
            >
              🌸
            </div>

            {/* Message */}
            <div
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                marginBottom: '16px',
                fontWeight: '500',
              }}
            >
              {currentFeedback.message}
            </div>

            {/* Emotional indicators */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                opacity: 0.8,
              }}
            >
              <span>💝 Sofia</span>
              <span>{Math.round(currentFeedback.effectiveness * 100)}% effective</span>
            </div>
          </div>

          {/* Progress indicator */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              height: '4px',
              background: getEmotionalColors().accent,
              borderRadius: '0 0 14px 14px',
            }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: currentFeedback.duration / 1000,
              ease: 'linear',
            }}
          />

          {/* Adaptation indicators */}
          {adaptations.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {adaptations.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Preset emotional feedback configurations
export const EncouragingFeedback: React.FC<Omit<EmotionalFeedbackProps, 'config'>> = (props) => (
  <EmotionalIntelligenceFeedback
    {...props}
    config={{
      id: 'encouraging-feedback',
      name: 'Encouraging Feedback',
      description: 'Positive, encouraging feedback to motivate users',
      type: 'encouragement',
      intensity: 'moderate',
      timing: 'immediate',
      context: 'success',
      adaptation: 'reactive',
      personality: 'sofia',
      language: 'supportive',
    }}
  />
);

export const SupportiveFeedback: React.FC<Omit<EmotionalFeedbackProps, 'config'>> = (props) => (
  <EmotionalIntelligenceFeedback
    {...props}
    config={{
      id: 'supportive-feedback',
      name: 'Supportive Feedback',
      description: 'Empathetic, supportive feedback for challenging situations',
      type: 'support',
      intensity: 'adaptive',
      timing: 'contextual',
      context: 'error',
      adaptation: 'emotional',
      personality: 'sofia',
      language: 'gentle',
    }}
  />
);

export const CelebratoryFeedback: React.FC<Omit<EmotionalFeedbackProps, 'config'>> = (props) => (
  <EmotionalIntelligenceFeedback
    {...props}
    config={{
      id: 'celebratory-feedback',
      name: 'Celebratory Feedback',
      description: 'Joyful celebration of user achievements and milestones',
      type: 'celebration',
      intensity: 'strong',
      timing: 'immediate',
      context: 'completion',
      adaptation: 'predictive',
      personality: 'sofia',
      language: 'motivational',
    }}
  />
);

export const GuidanceFeedback: React.FC<Omit<EmotionalFeedbackProps, 'config'>> = (props) => (
  <EmotionalIntelligenceFeedback
    {...props}
    config={{
      id: 'guidance-feedback',
      name: 'Guidance Feedback',
      description: 'Helpful guidance and direction for user actions',
      type: 'guidance',
      intensity: 'moderate',
      timing: 'delayed',
      context: 'interaction',
      adaptation: 'cognitive',
      personality: 'sofia',
      language: 'direct',
    }}
  />
);

export default EmotionalIntelligenceFeedback;