
import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

// Configurations and context are now exported from useMicroInteraction.tsx

// Animation type definitions
export type MicroAnimationType =
  | 'button-press'
  | 'card-flip'
  | 'error-shake'
  | 'fade-in-up'
  | 'focus-ring'
  | 'hover-glow'
  | 'hover-lift'
  | 'loading-pulse'
  | 'scale-in'
  | 'slide-reveal'
  | 'success-checkmark'
  | 'tap-bounce';

export interface MicroAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  disabled?: boolean;
  onAnimationComplete?: () => void;
  type: MicroAnimationType;
}

// Context and provider are now exported from useMicroInteraction.tsx

// Main micro-animation component
export const MicroAnimation: React.FC<MicroAnimationProps> = ({
  type,
  children,
  disabled = false,
  delay = 0,
  className = '',
  onAnimationComplete,
}) => {
  // TODO: Implement proper personality-based animations
  // const { personality } = useSofia();
  // const { reduceMotion, globalAnimationScale } = useMicroAnimation();

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // Default animation config for now
  const config = {
    duration: 0.3,
    ease: 'easeOut',
    scale: 1.05,
  };
  const adjustedDuration = config.duration;

  const getAnimationVariants = (): Variants => {
    const baseTransition = {
      duration: adjustedDuration,
      ease: config.ease as any,
      delay,
    };

    switch (type) {
      case 'hover-lift':
        return {
          initial: { scale: 1, y: 0 },
          hover: {
            scale: config.scale,
            y: -2,
            transition: baseTransition,
          },
          tap: { scale: 0.98 },
        };

      case 'hover-glow':
        return {
          initial: {
            scale: 1,
            boxShadow: '0 0 0 rgba(var(--primary), 0)',
          },
          hover: {
            scale: config.scale,
            boxShadow: `0 0 20px rgba(var(--primary), 0.3)`,
            transition: baseTransition,
          },
        };

      case 'tap-bounce':
        return {
          initial: { scale: 1 },
          tap: {
            scale: 0.95,
            transition: {
              ...baseTransition,
              duration: adjustedDuration * 0.5,
            },
          },
          hover: {
            scale: config.scale,
            transition: baseTransition,
          },
        };

      case 'focus-ring':
        return {
          initial: {
            scale: 1,
            boxShadow: '0 0 0 0 rgba(var(--primary), 0)',
          },
          focus: {
            scale: 1.02,
            boxShadow: '0 0 0 3px rgba(var(--primary), 0.3)',
            transition: baseTransition,
          },
        };

      case 'loading-pulse':
        return {
          initial: { opacity: 1, scale: 1 },
          animate: {
            opacity: [1, 0.7, 1],
            scale: [1, 1.05, 1],
            transition: {
              duration: adjustedDuration * 2,
              repeat: Infinity,
              ease: config.ease as any,
            },
          },
        };

      case 'success-checkmark':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: {
            scale: [0, 1.2, 1],
            rotate: 0,
            transition: {
              ...baseTransition,
              duration: adjustedDuration * 1.5,
            },
          },
        };

      case 'error-shake':
        return {
          initial: { x: 0 },
          animate: {
            x: [-10, 10, -10, 10, 0],
            transition: {
              duration: adjustedDuration * 1.5,
              ease: 'easeInOut',
            },
          },
        };

      case 'slide-reveal':
        return {
          initial: {
            opacity: 0,
            x: -20,
            scale: 0.95,
          },
          animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: baseTransition,
          },
          exit: {
            opacity: 0,
            x: 20,
            scale: 0.95,
            transition: baseTransition,
          },
        };

      case 'fade-in-up':
        return {
          initial: {
            opacity: 0,
            y: 20,
            scale: 0.95,
          },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: baseTransition,
          },
          exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: baseTransition,
          },
        };

      case 'scale-in':
        return {
          initial: {
            scale: 0,
            opacity: 0,
          },
          animate: {
            scale: 1,
            opacity: 1,
            transition: {
              ...baseTransition,
              type: 'spring',
              damping: 15,
              stiffness: 300,
            },
          },
          exit: {
            scale: 0,
            opacity: 0,
            transition: baseTransition,
          },
        };

      case 'card-flip':
        return {
          initial: { rotateY: 0 },
          hover: {
            rotateY: 5,
            scale: config.scale,
            transition: baseTransition,
          },
          tap: {
            rotateY: 10,
            scale: 0.98,
            transition: { duration: adjustedDuration * 0.5 },
          },
        };

      case 'button-press':
        return {
          initial: {
            scale: 1,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
          hover: {
            scale: config.scale,
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            y: -1,
            transition: baseTransition,
          },
          tap: {
            scale: 0.98,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            y: 0,
            transition: { duration: adjustedDuration * 0.5 },
          },
        };

      default:
        return {
          initial: { scale: 1 },
          hover: { scale: config.scale },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      className={className}
      variants={variants}
      initial='initial'
      animate='animate'
      whileHover='hover'
      whileTap='tap'
      whileFocus='focus'
      exit='exit'
      {...(onAnimationComplete ? { onAnimationComplete } : {})}
      style={{
        transformOrigin: 'center',
        backfaceVisibility: 'hidden', // Prevent flickering
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
};

// Specialized animation components for common use cases
export const AnimatedButton: React.FC<{
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'ghost' | 'primary' | 'secondary';
}> = ({
  children,
  // _variant = 'primary', // Not used
  className = '',
  onClick,
  disabled = false,
}) => (
  <MicroAnimation type='button-press' disabled={disabled} className={className}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} transition-colors duration-200`}
    >
      {children}
    </button>
  </MicroAnimation>
);

export const AnimatedCard: React.FC<{
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', onClick, hoverable = true }) => (
  <MicroAnimation
    type={hoverable ? 'card-flip' : 'fade-in-up'}
    className={className}
  >
    <div
      onClick={onClick}
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  </MicroAnimation>
);

export const AnimatedInput: React.FC<{
  children: ReactNode;
  className?: string;
  error?: boolean;
  focused?: boolean;
}> = ({
  children,
  className = '',
  // _focused = false, // Not used
  error = false,
}) => (
  <MicroAnimation
    type={error ? 'error-shake' : 'focus-ring'}
    className={className}
  >
    {children}
  </MicroAnimation>
);

// Utility hook is now exported from useMicroInteraction.tsx

export default MicroAnimation;
