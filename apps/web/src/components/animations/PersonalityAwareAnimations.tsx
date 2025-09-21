/**
 * Personality-Aware Animation System for LegacyGuard
 *
 * Integrates Sofia Firefly's personality system with liquid design animations
 * to create emotionally intelligent, contextually aware animation responses.
 */

import React, { ReactNode, useMemo, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { usePerformanceAwareAnimation } from './AnimationProvider';
import { ANIMATION_CONFIG, animationUtils } from '@/config/animations';
import {
  useSofiaPersonality,
  PersonalityState,
  PersonalityMode,
  ContextType,
  shouldUseEmpathetic,
  shouldUsePragmatic,
  shouldUseCelebratory,
  shouldUseComforting
} from '../sofia-firefly/SofiaFireflyPersonality';

// Types for personality-aware animations
interface PersonalityAwareAnimationProps {
  children: ReactNode;
  personality: PersonalityState;
  context?: ContextType;
  className?: string;
  disabled?: boolean;
}

interface AdaptiveAnimationConfig {
  springConfig: {
    tension: number;
    friction: number;
    mass: number;
  };
  duration: number;
  easing: string;
  intensity: 'subtle' | 'medium' | 'strong';
}

interface EmotionalAnimationProps extends PersonalityAwareAnimationProps {
  emotion: 'joy' | 'calm' | 'focus' | 'encouragement' | 'comfort';
  trigger?: 'hover' | 'click' | 'load' | 'success' | 'error';
}

// Personality-based animation configurations
const personalityAnimationConfigs: Record<PersonalityMode, AdaptiveAnimationConfig> = {
  empathetic: {
    springConfig: { tension: 120, friction: 14, mass: 0.8 },
    duration: 400,
    easing: 'easeOutCubic',
    intensity: 'medium',
  },
  pragmatic: {
    springConfig: { tension: 180, friction: 12, mass: 0.6 },
    duration: 250,
    easing: 'easeOutQuad',
    intensity: 'subtle',
  },
  celebratory: {
    springConfig: { tension: 200, friction: 10, mass: 0.5 },
    duration: 600,
    easing: 'easeOutBack',
    intensity: 'strong',
  },
  comforting: {
    springConfig: { tension: 80, friction: 20, mass: 1.2 },
    duration: 800,
    easing: 'easeOutSine',
    intensity: 'subtle',
  },
  nurturing: {
    springConfig: { tension: 100, friction: 18, mass: 1.0 },
    duration: 600,
    easing: 'easeOutSine',
    intensity: 'medium',
  },
  confident: {
    springConfig: { tension: 160, friction: 11, mass: 0.7 },
    duration: 350,
    easing: 'easeOutCubic',
    intensity: 'medium',
  },
};

// Emotional state animation configurations
const emotionalAnimationConfigs: Record<string, AdaptiveAnimationConfig> = {
  joy: {
    springConfig: { tension: 200, friction: 10, mass: 0.5 },
    duration: 500,
    easing: 'easeOutBack',
    intensity: 'strong',
  },
  calm: {
    springConfig: { tension: 80, friction: 25, mass: 1.5 },
    duration: 1000,
    easing: 'easeOutSine',
    intensity: 'subtle',
  },
  focus: {
    springConfig: { tension: 180, friction: 12, mass: 0.6 },
    duration: 300,
    easing: 'easeOutQuad',
    intensity: 'medium',
  },
  encouragement: {
    springConfig: { tension: 150, friction: 15, mass: 0.8 },
    duration: 400,
    easing: 'easeOutCubic',
    intensity: 'medium',
  },
  comfort: {
    springConfig: { tension: 70, friction: 22, mass: 1.3 },
    duration: 900,
    easing: 'easeOutSine',
    intensity: 'subtle',
  },
};

// Personality-Aware Animation Container
export function PersonalityAwareAnimation({
  children,
  personality,
  context = 'idle',
  className = '',
  disabled = false
}: PersonalityAwareAnimationProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  // Get personality-based animation configuration
  const animationConfig = useMemo(() => {
    const baseConfig = personalityAnimationConfigs[personality.mode] || personalityAnimationConfigs.empathetic;

    // Adjust based on confidence level
    const confidenceMultiplier = 0.5 + (personality.confidence * 0.5);

    return {
      ...baseConfig,
      springConfig: {
        tension: baseConfig.springConfig.tension * confidenceMultiplier,
        friction: baseConfig.springConfig.friction * (2 - confidenceMultiplier),
        mass: baseConfig.springConfig.mass,
      },
      duration: baseConfig.duration * (disabled || reducedMotion ? 0.1 : 1),
    };
  }, [personality, disabled, reducedMotion]);

  // Create adaptive spring animation
  const adaptiveSpring = useSpring({
    from: {
      opacity: 0,
      transform: 'translateY(20px) scale(0.95)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
    },
    config: animationUtils.getOptimizedConfig(performanceMode),
    immediate: disabled || reducedMotion,
  });

  return (
    <animated.div
      style={adaptiveSpring}
      className={`personality-aware-animation ${className}`}
      data-personality-mode={personality.mode}
      data-context={context}
      data-confidence={personality.confidence}
    >
      {children}
    </animated.div>
  );
}

// Emotional State Animation Component
export function EmotionalAnimation({
  children,
  personality,
  emotion,
  trigger = 'load',
  className = '',
  disabled = false
}: EmotionalAnimationProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  // Get emotional animation configuration
  const animationConfig = useMemo(() => {
    const baseConfig = emotionalAnimationConfigs[emotion] || emotionalAnimationConfigs.calm;

    // Blend with personality configuration
    const personalityConfig = personalityAnimationConfigs[personality.mode] || personalityAnimationConfigs.empathetic;
    
    // TypeScript assertions: configs are guaranteed to exist due to fallbacks above
    if (!baseConfig) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }
    if (!personalityConfig) {
      throw new Error(`Invalid personality mode: ${personality.mode}`);
    }
    const blendedConfig = {
      springConfig: {
        tension: (baseConfig.springConfig.tension + personalityConfig.springConfig.tension) / 2,
        friction: (baseConfig.springConfig.friction + personalityConfig.springConfig.friction) / 2,
        mass: (baseConfig.springConfig.mass + personalityConfig.springConfig.mass) / 2,
      },
      duration: (baseConfig.duration + personalityConfig.duration) / 2,
      easing: baseConfig.easing,
      intensity: baseConfig.intensity,
    };

    return {
      ...blendedConfig,
      duration: blendedConfig.duration * (disabled || reducedMotion ? 0.1 : 1),
    };
  }, [personality, emotion, disabled, reducedMotion]);

  // Create emotional spring animation
  const emotionalSpring = useSpring({
    from: {
      opacity: 0,
      transform: emotion === 'joy' ? 'translateY(-10px) scale(0.9)' :
                 emotion === 'calm' ? 'translateY(5px) scale(0.98)' :
                 emotion === 'focus' ? 'translateY(0px) scale(0.95)' :
                 emotion === 'encouragement' ? 'translateY(-5px) scale(0.97)' :
                 'translateY(10px) scale(0.96)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
    },
    config: animationUtils.getOptimizedConfig(performanceMode),
    immediate: disabled || reducedMotion,
  });

  return (
    <animated.div
      style={emotionalSpring}
      className={`emotional-animation emotional-${emotion} ${className}`}
      data-emotion={emotion}
      data-trigger={trigger}
      data-personality-mode={personality.mode}
    >
      {children}
    </animated.div>
  );
}

// Context-Aware Animation Wrapper
export function ContextAwareAnimation({
  children,
  personality,
  context,
  className = '',
  disabled = false
}: PersonalityAwareAnimationProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  // Context-specific animation behaviors
  const contextAnimation = useMemo(() => {
    const baseConfig = personalityAnimationConfigs[personality.mode] || personalityAnimationConfigs.empathetic;
    
    // TypeScript assertion: baseConfig is guaranteed to exist due to fallback above
    if (!baseConfig) {
      throw new Error(`Invalid personality mode: ${personality.mode}`);
    }

    switch (context) {
      case 'celebrating':
        return {
          ...baseConfig,
          springConfig: { ...baseConfig.springConfig, tension: 250, friction: 8 },
          duration: 800,
          scale: 1.1,
          rotation: 5,
        };
      case 'guiding':
        return {
          ...baseConfig,
          springConfig: { ...baseConfig.springConfig, tension: 160, friction: 14 },
          duration: 350,
          scale: 1.02,
          rotation: 0,
        };
      case 'helping':
        return {
          ...baseConfig,
          springConfig: { ...baseConfig.springConfig, tension: 100, friction: 18 },
          duration: 600,
          scale: 1.05,
          rotation: -2,
        };
      case 'waiting':
        return {
          ...baseConfig,
          springConfig: { ...baseConfig.springConfig, tension: 60, friction: 25 },
          duration: 1200,
          scale: 0.98,
          rotation: 0,
        };
      default: // idle
        return {
          ...baseConfig,
          springConfig: { ...baseConfig.springConfig, tension: 90, friction: 16 },
          duration: 500,
          scale: 1,
          rotation: 0,
        };
    }
  }, [personality, context]);

  const contextSpring = useSpring({
    from: {
      opacity: 0,
      transform: `translateY(15px) scale(0.95) rotate(${contextAnimation.rotation}deg)`,
    },
    to: {
      opacity: 1,
      transform: `translateY(0px) scale(${contextAnimation.scale}) rotate(0deg)`,
    },
    config: contextAnimation.springConfig,
    immediate: disabled || reducedMotion,
  });

  return (
    <animated.div
      style={contextSpring}
      className={`context-aware-animation context-${context} ${className}`}
      data-context={context}
      data-personality-mode={personality.mode}
    >
      {children}
    </animated.div>
  );
}

// Personality-Responsive Hover Effects
export function PersonalityHoverEffect({
  children,
  personality,
  className = '',
  disabled = false
}: PersonalityAwareAnimationProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const hoverConfig = useMemo(() => {
    const baseConfig = personalityAnimationConfigs[personality.mode];

    // Adjust hover intensity based on personality
    const hoverIntensity = shouldUseCelebratory(personality) ? 1.15 :
                          shouldUseEmpathetic(personality) ? 1.08 :
                          shouldUsePragmatic(personality) ? 1.03 :
                          1.05;

    return {
      ...baseConfig,
      scale: hoverIntensity,
      duration: 200,
    };
  }, [personality]);

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverSpring = useSpring({
    transform: isHovered ? `scale(${hoverConfig.scale})` : 'scale(1)',
    config: hoverConfig.springConfig,
    immediate: disabled || reducedMotion,
  });

  return (
    <animated.div
      style={hoverSpring}
      className={`personality-hover-effect ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-personality-mode={personality.mode}
      data-hover-intensity={hoverConfig.scale}
    >
      {children}
    </animated.div>
  );
}

// Adaptive Loading Animation based on Personality
export function PersonalityAdaptiveLoader({
  personality,
  context = 'idle',
  className = '',
  disabled = false
}: {
  personality: PersonalityState;
  context?: ContextType;
  className?: string;
  disabled?: boolean;
}) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const loaderConfig = useMemo(() => {
    const baseConfig = personalityAnimationConfigs[personality.mode];

    // Adjust loading animation based on context and personality
    const isPatientPersonality = shouldUseComforting(personality) || personality.mode === 'empathetic';
    const isEnergeticPersonality = shouldUseCelebratory(personality) || personality.mode === 'pragmatic';

    return {
      ...baseConfig,
      duration: isPatientPersonality ? 1200 : isEnergeticPersonality ? 600 : 800,
      dots: isPatientPersonality ? 3 : isEnergeticPersonality ? 5 : 4,
    };
  }, [personality]);

  const dotsSpring = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 1 },
    loop: !disabled && !reducedMotion,
    config: loaderConfig.springConfig,
  });

  return (
    <div className={`flex space-x-2 items-center ${className}`}>
      {Array.from({ length: loaderConfig.dots }).map((_, index) => (
        <animated.div
          key={index}
          className="w-2 h-2 bg-primary rounded-full"
          style={{
            ...dotsSpring,
            transform: `scale(${0.8 + (index * 0.1)})`,
          }}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">
        {context === 'waiting' ? 'Take your time...' :
         context === 'guiding' ? 'Getting things ready...' :
         context === 'celebrating' ? 'Almost there!' :
         'Loading...'}
      </span>
    </div>
  );
}

// Export personality-aware animation utilities
export const PersonalityAnimationUtils = {
  // Get animation config for personality
  getPersonalityConfig: (personality: PersonalityState): AdaptiveAnimationConfig => {
    const config = personalityAnimationConfigs[personality.mode] || personalityAnimationConfigs.empathetic;
    if (!config) {
      throw new Error(`Invalid personality mode: ${personality.mode}`);
    }
    return config;
  },

  // Get emotional config
  getEmotionalConfig: (emotion: string): AdaptiveAnimationConfig => {
    const config = emotionalAnimationConfigs[emotion] || emotionalAnimationConfigs.calm;
    if (!config) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }
    return config;
  },

  // Blend personality with emotion
  blendPersonalityEmotion: (
    personality: PersonalityState,
    emotion: string
  ): AdaptiveAnimationConfig => {
    const personalityConfig = personalityAnimationConfigs[personality.mode] || personalityAnimationConfigs.empathetic;
    const emotionalConfig = emotionalAnimationConfigs[emotion] || emotionalAnimationConfigs.calm;
    
    // TypeScript assertions: configs are guaranteed to exist due to fallbacks above
    if (!personalityConfig) {
      throw new Error(`Invalid personality mode: ${personality.mode}`);
    }
    if (!emotionalConfig) {
      throw new Error(`Invalid emotion: ${emotion}`);
    }

    return {
      springConfig: {
        tension: (personalityConfig.springConfig.tension + emotionalConfig.springConfig.tension) / 2,
        friction: (personalityConfig.springConfig.friction + emotionalConfig.springConfig.friction) / 2,
        mass: (personalityConfig.springConfig.mass + emotionalConfig.springConfig.mass) / 2,
      },
      duration: (personalityConfig.duration + emotionalConfig.duration) / 2,
      easing: emotionalConfig.easing,
      intensity: emotionalConfig.intensity,
    };
  },

  // Check if personality should use gentle animations
  shouldUseGentleAnimations: (personality: PersonalityState): boolean => {
    return shouldUseComforting(personality) || shouldUseEmpathetic(personality);
  },

  // Check if personality should use energetic animations
  shouldUseEnergeticAnimations: (personality: PersonalityState): boolean => {
    return shouldUseCelebratory(personality) || shouldUsePragmatic(personality);
  },
};