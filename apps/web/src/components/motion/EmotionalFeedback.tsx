import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface EmotionalFeedbackProps {
  children?: React.ReactNode;
  emotionalState?: 'calm' | 'anxious' | 'frustrated' | 'excited' | 'confused' | 'overwhelmed' | 'confident' | 'uncertain' | 'satisfied' | 'disappointed';
  context?: 'success' | 'error' | 'loading' | 'completion' | 'waiting' | 'celebration' | 'encouragement' | 'guidance' | 'warning' | 'information';
  intensity?: 'subtle' | 'gentle' | 'moderate' | 'strong' | 'intense';
  trigger?: 'hover' | 'click' | 'complete' | 'error' | 'success' | 'auto';
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onEmotionalChange?: (state: string, context: string) => void;
  onFeedbackComplete?: () => void;
}

interface EmotionalResponse {
  state: string;
  context: string;
  intensity: string;
  message: string;
  animation: string;
  color: string;
  icon: string;
  effects: string[];
}

interface EmotionalPattern {
  name: string;
  emotionalState: string;
  context: string;
  intensity: string;
  trigger: string;
  duration: number;
  delay: number;
}

const EmotionalFeedback: React.FC<EmotionalFeedbackProps> = ({
  children,
  emotionalState = 'calm',
  context = 'information',
  intensity = 'moderate',
  trigger = 'auto',
  duration = 3000,
  delay = 500,
  className = '',
  style = {},
  disabled = false,
  onEmotionalChange,
  onFeedbackComplete,
}) => {
  const [currentResponse, setCurrentResponse] = useState<EmotionalResponse | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Emotional response configurations
  const emotionalResponses: Record<string, EmotionalResponse> = {
    calm_success: {
      state: 'calm',
      context: 'success',
      intensity: 'gentle',
      message: 'Perfect! Everything is working smoothly.',
      animation: 'gentleFloat',
      color: '#10b981',
      icon: '✨',
      effects: ['sparkles', 'gentleGlow'],
    },
    calm_information: {
      state: 'calm',
      context: 'information',
      intensity: 'subtle',
      message: 'Here\'s what you need to know.',
      animation: 'subtlePulse',
      color: '#6b7280',
      icon: 'ℹ️',
      effects: ['softGlow', 'minimalPulse'],
    },
    calm_guidance: {
      state: 'calm',
      context: 'guidance',
      intensity: 'gentle',
      message: 'Let me help you through this step by step.',
      animation: 'gentleWave',
      color: '#3b82f6',
      icon: '👋',
      effects: ['waveMotion', 'softPulse'],
    },
    anxious_waiting: {
      state: 'anxious',
      context: 'waiting',
      intensity: 'moderate',
      message: 'I understand waiting can be difficult. This will be ready soon.',
      animation: 'gentleBounce',
      color: '#f59e0b',
      icon: '⏳',
      effects: ['pulse', 'softShake'],
    },
    anxious_loading: {
      state: 'anxious',
      context: 'loading',
      intensity: 'gentle',
      message: 'Taking a moment to prepare everything for you.',
      animation: 'calmFloat',
      color: '#8b5cf6',
      icon: '🔄',
      effects: ['rotatingBorder', 'calmPulse'],
    },
    frustrated_error: {
      state: 'frustrated',
      context: 'error',
      intensity: 'moderate',
      message: 'I\'m sorry this isn\'t working as expected. Let me help fix this.',
      animation: 'gentleShake',
      color: '#ef4444',
      icon: '😊',
      effects: ['heartBeat', 'warmGlow'],
    },
    frustrated_warning: {
      state: 'frustrated',
      context: 'warning',
      intensity: 'gentle',
      message: 'I see this might be challenging. Would you like some guidance?',
      animation: 'compassionatePulse',
      color: '#f97316',
      icon: '🤝',
      effects: ['warmPulse', 'softGlow'],
    },
    excited_celebration: {
      state: 'excited',
      context: 'celebration',
      intensity: 'strong',
      message: 'Amazing! You\'ve accomplished something wonderful!',
      animation: 'celebrationBurst',
      color: '#ec4899',
      icon: '🎉',
      effects: ['fireworks', 'sparkleBurst', 'bounce'],
    },
    excited_success: {
      state: 'excited',
      context: 'success',
      intensity: 'moderate',
      message: 'Excellent work! You\'re doing fantastic.',
      animation: 'happyBounce',
      color: '#10b981',
      icon: '🌟',
      effects: ['starBurst', 'happyPulse'],
    },
    confused_guidance: {
      state: 'confused',
      context: 'guidance',
      intensity: 'gentle',
      message: 'I can see this might be unclear. Let me explain this more clearly.',
      animation: 'clarifyingPulse',
      color: '#3b82f6',
      icon: '💡',
      effects: ['lightbulbGlow', 'softPulse'],
    },
    confused_information: {
      state: 'confused',
      context: 'information',
      intensity: 'moderate',
      message: 'Let me break this down into simpler steps for you.',
      animation: 'simplifyingFloat',
      color: '#06b6d4',
      icon: '📋',
      effects: ['checklistGlow', 'calmFloat'],
    },
    overwhelmed_loading: {
      state: 'overwhelmed',
      context: 'loading',
      intensity: 'subtle',
      message: 'Taking things one step at a time. This won\'t take long.',
      animation: 'soothingFloat',
      color: '#8b5cf6',
      icon: '🌸',
      effects: ['flowerBloom', 'calmPulse'],
    },
    overwhelmed_information: {
      state: 'overwhelmed',
      context: 'information',
      intensity: 'gentle',
      message: 'Let\'s focus on one thing at a time. You\'ve got this.',
      animation: 'encouragingPulse',
      color: '#10b981',
      icon: '💪',
      effects: ['strengthPulse', 'warmGlow'],
    },
    confident_completion: {
      state: 'confident',
      context: 'completion',
      intensity: 'moderate',
      message: 'You\'ve mastered this! Ready for the next challenge?',
      animation: 'confidentFloat',
      color: '#059669',
      icon: '🏆',
      effects: ['trophyGlow', 'successPulse'],
    },
    confident_success: {
      state: 'confident',
      context: 'success',
      intensity: 'gentle',
      message: 'Perfect execution! You\'re clearly experienced at this.',
      animation: 'professionalPulse',
      color: '#6366f1',
      icon: '👑',
      effects: ['crownGlow', 'elegantPulse'],
    },
    uncertain_guidance: {
      state: 'uncertain',
      context: 'guidance',
      intensity: 'gentle',
      message: 'It\'s completely normal to need clarification. Let me guide you.',
      animation: 'reassuringPulse',
      color: '#3b82f6',
      icon: '🤗',
      effects: ['hugGlow', 'warmPulse'],
    },
    uncertain_information: {
      state: 'uncertain',
      context: 'information',
      intensity: 'moderate',
      message: 'I\'m here to help clarify anything that\'s unclear.',
      animation: 'supportiveFloat',
      color: '#06b6d4',
      icon: '🛡️',
      effects: ['shieldGlow', 'protectivePulse'],
    },
    satisfied_completion: {
      state: 'satisfied',
      context: 'completion',
      intensity: 'gentle',
      message: 'Wonderful! You\'ve completed this successfully.',
      animation: 'satisfiedFloat',
      color: '#10b981',
      icon: '😊',
      effects: ['smileGlow', 'contentPulse'],
    },
    satisfied_success: {
      state: 'satisfied',
      context: 'success',
      intensity: 'subtle',
      message: 'Exactly what we were hoping for. Well done!',
      animation: 'appreciativePulse',
      color: '#059669',
      icon: '🙏',
      effects: ['gratitudeGlow', 'softPulse'],
    },
    disappointed_error: {
      state: 'disappointed',
      context: 'error',
      intensity: 'gentle',
      message: 'I\'m sorry this didn\'t work out as planned. Let\'s try a different approach.',
      animation: 'empatheticPulse',
      color: '#ef4444',
      icon: '💙',
      effects: ['heartGlow', 'compassionatePulse'],
    },
    disappointed_warning: {
      state: 'disappointed',
      context: 'warning',
      intensity: 'moderate',
      message: 'I understand this might be disappointing. Let me help make this right.',
      animation: 'supportiveShake',
      color: '#f97316',
      icon: '🤝',
      effects: ['handGlow', 'supportivePulse'],
    },
  };

  // Emotional pattern configurations
  const emotionalPatterns: Record<string, EmotionalPattern> = {
    calmSuccess: {
      name: 'Calm Success',
      emotionalState: 'calm',
      context: 'success',
      intensity: 'gentle',
      trigger: 'success',
      duration: 2500,
      delay: 300,
    },
    anxiousWaiting: {
      name: 'Anxious Waiting',
      emotionalState: 'anxious',
      context: 'waiting',
      intensity: 'moderate',
      trigger: 'auto',
      duration: 4000,
      delay: 1000,
    },
    frustratedError: {
      name: 'Frustrated Error',
      emotionalState: 'frustrated',
      context: 'error',
      intensity: 'moderate',
      trigger: 'error',
      duration: 5000,
      delay: 200,
    },
    excitedCelebration: {
      name: 'Excited Celebration',
      emotionalState: 'excited',
      context: 'celebration',
      intensity: 'strong',
      trigger: 'complete',
      duration: 3000,
      delay: 100,
    },
    confusedGuidance: {
      name: 'Confused Guidance',
      emotionalState: 'confused',
      context: 'guidance',
      intensity: 'gentle',
      trigger: 'hover',
      duration: 4000,
      delay: 500,
    },
    confidentCompletion: {
      name: 'Confident Completion',
      emotionalState: 'confident',
      context: 'completion',
      intensity: 'moderate',
      trigger: 'complete',
      duration: 2000,
      delay: 200,
    },
  };

  // Get appropriate emotional response
  const getEmotionalResponse = useCallback((): EmotionalResponse => {
    const responseKey = `${emotionalState}_${context}`;
    return emotionalResponses[responseKey] || emotionalResponses.calm_information || {
      state: 'calm',
      context: 'information',
      intensity: 'subtle',
      message: 'Here\'s what you need to know.',
      animation: 'subtlePulse',
      color: '#6b7280',
      icon: 'ℹ️',
      effects: ['softGlow', 'minimalPulse'],
    };
  }, [emotionalState, context]);

  // Show emotional feedback
  const showEmotionalFeedback = useCallback(() => {
    if (disabled) return () => {};

    const response = getEmotionalResponse();
    setCurrentResponse(response);
    setIsVisible(true);
    setShowEffects(true);

    onEmotionalChange?.(emotionalState, context);

    // Auto-hide after duration
    const timer = setTimeout(() => {
      hideEmotionalFeedback();
    }, duration);

    return () => clearTimeout(timer);
  }, [disabled, getEmotionalResponse, onEmotionalChange, emotionalState, context, duration]);

  // Hide emotional feedback
  const hideEmotionalFeedback = useCallback(() => {
    setIsVisible(false);
    setShowEffects(false);
    setCurrentResponse(null);
    onFeedbackComplete?.();
  }, [onFeedbackComplete]);

  // Trigger handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showEmotionalFeedback();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideEmotionalFeedback();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideEmotionalFeedback();
      } else {
        showEmotionalFeedback();
      }
    }
  };

  // Auto-trigger effect
  useEffect(() => {
    if (trigger === 'auto' && !disabled) {
      const timer = setTimeout(() => {
        showEmotionalFeedback();
      }, delay);

      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [trigger, disabled, delay, showEmotionalFeedback]);

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.9,
      y: shouldReduceMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      y: shouldReduceMotion ? 0 : -5,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: 'easeIn',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: shouldReduceMotion ? 1 : 0, rotate: shouldReduceMotion ? 0 : -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : 0.1,
        duration: shouldReduceMotion ? 0 : 0.4,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : 0.2,
        duration: shouldReduceMotion ? 0 : 0.3,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className={`emotional-feedback ${className}`}
      style={{ position: 'relative', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {isVisible && currentResponse && !disabled && (
          <motion.div
            className="emotional-feedback-container"
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '12px',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="emotional-feedback-content"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: '16px',
                padding: '16px 20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                maxWidth: '280px',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <motion.div
                className="emotional-feedback-icon"
                style={{
                  fontSize: '24px',
                  marginBottom: '8px',
                  color: currentResponse.color,
                }}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                {currentResponse.icon}
              </motion.div>

              {/* Message */}
              <motion.div
                className="emotional-feedback-message"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: '#374151',
                  fontWeight: '500',
                }}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                {currentResponse.message}
              </motion.div>

              {/* Emotional effects */}
              {showEffects && !shouldReduceMotion && (
                <motion.div
                  className="emotional-effects"
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    pointerEvents: 'none',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Pulsing glow effect */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${currentResponse.color}20 0%, transparent 70%)`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Sparkle effects */}
                  {currentResponse.effects.includes('sparkles') && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          style={{
                            position: 'absolute',
                            width: '4px',
                            height: '4px',
                            background: currentResponse.color,
                            borderRadius: '50%',
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 100],
                            y: [0, (Math.random() - 0.5) * 100],
                            opacity: [1, 0],
                            scale: [1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Development controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-8 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {emotionalState} • {context} • {intensity}
        </div>
      )}
    </div>
  );
};

// Preset emotional feedback components for easy usage
export const CalmSuccess: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="calm" context="success" />
);

export const AnxiousWaiting: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="anxious" context="waiting" />
);

export const FrustratedError: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="frustrated" context="error" />
);

export const ExcitedCelebration: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="excited" context="celebration" />
);

export const ConfusedGuidance: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="confused" context="guidance" />
);

export const ConfidentCompletion: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="confident" context="completion" />
);

export const EmpatheticSupport: React.FC<Omit<EmotionalFeedbackProps, 'emotionalState' | 'context'>> = (props) => (
  <EmotionalFeedback {...props} emotionalState="frustrated" context="guidance" />
);

export default EmotionalFeedback;