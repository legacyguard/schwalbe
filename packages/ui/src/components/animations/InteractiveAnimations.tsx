// Interactive Animations - User interaction feedback with Sofia's personality adaptation
// Provides tactile feedback for buttons, cards, and interactive elements

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type Easing, motion, type Variants } from 'framer-motion';
import type { PersonalityMode } from '@schwalbe/shared/types/animations';

// Context for adaptive animations
interface AdaptiveAnimationContextType {
  animationConfig: {
    duration: number;
    ease: Easing;
  };
  personalityMode: PersonalityMode;
  setPersonalityMode: (mode: PersonalityMode) => void;
  shouldReduceMotion: boolean;
}

const AdaptiveAnimationContext =
  createContext<AdaptiveAnimationContextType | null>(null);

// Hook to use adaptive animation context
export const useAdaptiveAnimation = (): AdaptiveAnimationContextType => {
  const context = useContext(AdaptiveAnimationContext);
  if (!context) {
    // Fallback values when context is not available
    return {
      personalityMode: 'adaptive',
      shouldReduceMotion: false,
      animationConfig: { duration: 0.3, ease: 'easeOut' as Easing },
      setPersonalityMode: () => {},
    };
  }
  return context;
};

// Provider component for adaptive animations
export const AdaptiveAnimationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [personalityMode, setPersonalityMode] =
    useState<PersonalityMode>('adaptive');
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-detect personality mode based on user behavior (mock implementation)
  useEffect(() => {
    // In a real implementation, this would analyze user interactions
    // For now, we'll use a simple heuristic or allow manual setting
    if (typeof window === 'undefined') return;
    
    const savedMode = localStorage.getItem('personalityMode') as PersonalityMode;
    if (
      savedMode &&
      ['adaptive', 'pragmatic', 'empathetic'].includes(savedMode)
    ) {
      setPersonalityMode(savedMode);
    }
  }, []);

  const animationConfig = {
    duration: personalityMode === 'pragmatic' ? 0.2 : 0.3,
    ease: (personalityMode === 'pragmatic' ? 'easeOut' : 'easeInOut') as Easing,
  };

  return (
    <AdaptiveAnimationContext.Provider
      value={{
        personalityMode,
        shouldReduceMotion,
        animationConfig,
        setPersonalityMode,
      }}
    >
      {children}
    </AdaptiveAnimationContext.Provider>
  );
};

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'ghost' | 'primary' | 'secondary';
}

export const AdaptiveAnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  const buttonVariants: Variants = {
    rest: {
      scale: 1,
      boxShadow:
        variant === 'primary'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    hover: shouldReduceMotion
      ? {}
      : {
          scale: personalityMode === 'pragmatic' ? 1.02 : 1.05,
          boxShadow:
            variant === 'primary'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: {
            duration: personalityMode === 'pragmatic' ? 0.15 : 0.3,
            ease:
              personalityMode === 'pragmatic'
                ? 'easeOut'
                : [0.25, 0.46, 0.45, 0.94],
          },
        },
    tap: shouldReduceMotion
      ? {}
      : {
          scale: personalityMode === 'pragmatic' ? 0.98 : 0.95,
          transition: {
            duration: 0.1,
            ease: 'easeOut',
          },
        },
  };

  const baseClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary:
      personalityMode === 'empathetic'
        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
        : personalityMode === 'pragmatic'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  return (
    <motion.button
      className={`
        rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        ${baseClasses[size]} ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      variants={buttonVariants}
      initial='rest'
      whileHover={disabled ? 'rest' : 'hover'}
      whileTap={disabled ? 'rest' : 'tap'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  clickable?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export const AdaptiveAnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverable = true,
  clickable = false,
  onClick,
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  const cardVariants: Variants = {
    rest: {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: shouldReduceMotion
      ? {}
      : {
          scale: personalityMode === 'pragmatic' ? 1.01 : 1.02,
          y: personalityMode === 'empathetic' ? -5 : -2,
          boxShadow:
            personalityMode === 'empathetic'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: {
            duration: personalityMode === 'pragmatic' ? 0.2 : 0.4,
            ease:
              personalityMode === 'pragmatic'
                ? 'easeOut'
                : [0.25, 0.46, 0.45, 0.94],
          },
        },
    tap: shouldReduceMotion
      ? {}
      : {
          scale: 0.98,
          transition: {
            duration: 0.1,
            ease: 'easeOut',
          },
        },
  };

  return (
    <motion.div
      className={`
        bg-white rounded-lg border border-gray-200 transition-colors
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...(hoverable || clickable
        ? {
            variants: cardVariants,
            initial: 'rest',
            whileHover: hoverable ? 'hover' : 'rest',
            whileTap: clickable ? 'tap' : 'rest',
            ...(clickable && onClick ? { onClick } : {}),
          }
        : {
            whileHover: 'rest',
            whileTap: 'rest',
          })}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  index: number;
}

export const AdaptiveAnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion, animationConfig } =
    useAdaptiveAnimation();

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: personalityMode === 'empathetic' ? 20 : 10,
      x: personalityMode === 'pragmatic' ? -10 : 0,
      scale: personalityMode === 'empathetic' ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: animationConfig.duration,
        ease: animationConfig.ease,
        delay: index * 0.1, // Fixed stagger value
      } as any,
    },
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      initial='hidden'
      animate='visible'
      whileInView='visible'
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
    >
      {children}
    </motion.div>
  );
};

interface PulseAnimationProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
}

export const AdaptivePulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive = true,
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  if (shouldReduceMotion || !isActive) {
    return <div className={className}>{children}</div>;
  }

  const pulseVariants: Variants = {
    pulse: {
      scale: personalityMode === 'empathetic' ? [1, 1.05, 1] : [1, 1.02, 1],
      opacity: personalityMode === 'empathetic' ? [1, 0.8, 1] : [1, 0.9, 1],
      transition: {
        duration: personalityMode === 'pragmatic' ? 1.5 : 2.5,
        repeat: Infinity,
        ease:
          personalityMode === 'pragmatic'
            ? 'easeInOut'
            : [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div className={className} variants={pulseVariants} animate='pulse'>
      {children}
    </motion.div>
  );
};

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export const AdaptiveHoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale,
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  const defaultScale =
    personalityMode === 'pragmatic'
      ? 1.02
      : personalityMode === 'empathetic'
        ? 1.08
        : 1.05;
  const scaleValue = scale || defaultScale;

  const hoverVariants: Variants = {
    rest: { scale: 1 },
    hover: shouldReduceMotion
      ? {}
      : {
          scale: scaleValue,
          transition: {
            duration: personalityMode === 'pragmatic' ? 0.15 : 0.3,
            ease:
              personalityMode === 'pragmatic'
                ? 'easeOut'
                : [0.25, 0.46, 0.45, 0.94],
          },
        },
  };

  return (
    <motion.div
      className={className}
      variants={hoverVariants}
      initial='rest'
      whileHover='hover'
    >
      {children}
    </motion.div>
  );
};

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'yellow';
  intensity?: 'high' | 'low' | 'medium';
  isActive?: boolean;
}

export const AdaptiveGlowEffect: React.FC<GlowEffectProps> = ({
  children,
  isActive = true,
  color,
  intensity = 'medium',
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  // Auto-select color based on personality if not provided
  const glowColor =
    color ||
    (personalityMode === 'empathetic'
      ? 'emerald'
      : personalityMode === 'pragmatic'
        ? 'blue'
        : 'purple');

  const glowIntensity = {
    low: '0.3',
    medium: '0.5',
    high: '0.7',
  };

  const glowColors = {
    emerald: `rgba(16, 185, 129, ${glowIntensity[intensity]})`,
    blue: `rgba(37, 99, 235, ${glowIntensity[intensity]})`,
    purple: `rgba(147, 51, 234, ${glowIntensity[intensity]})`,
    yellow: `rgba(245, 158, 11, ${glowIntensity[intensity]})`,
  };

  const glowVariants: Variants = {
    inactive: {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
    },
    active: shouldReduceMotion
      ? {
          boxShadow: `0 0 20px ${glowColors[glowColor]}`,
        }
      : {
          boxShadow: [
            `0 0 5px ${glowColors[glowColor]}`,
            `0 0 20px ${glowColors[glowColor]}`,
            `0 0 5px ${glowColors[glowColor]}`,
          ],
          transition: {
            duration: personalityMode === 'pragmatic' ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
  };

  return (
    <motion.div
      className={className}
      variants={glowVariants}
      animate={isActive ? 'active' : 'inactive'}
    >
      {children}
    </motion.div>
  );
};

export default {
  AdaptiveAnimatedButton,
  AdaptiveAnimatedCard,
  AdaptiveAnimatedListItem,
  AdaptivePulseAnimation,
  AdaptiveHoverScale,
  AdaptiveGlowEffect,
  AdaptiveAnimationProvider,
  useAdaptiveAnimation,
};