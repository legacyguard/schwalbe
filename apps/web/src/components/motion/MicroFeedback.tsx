import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type FeedbackType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'celebration'
  | 'encouragement'
  | 'guidance'
  | 'validation';

export type FeedbackStyle = 'toast' | 'inline' | 'floating' | 'badge' | 'pulse';

interface MicroFeedbackProps {
  type: FeedbackType;
  message: string;
  description?: string;
  style?: FeedbackStyle;
  duration?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  contextual?: boolean;
  emotional?: boolean;
}

const feedbackConfig = {
  success: {
    icon: '✓',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    borderColor: 'border-green-200',
    glowColor: 'shadow-green-100',
  },
  error: {
    icon: '⚠',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    borderColor: 'border-red-200',
    glowColor: 'shadow-red-100',
  },
  warning: {
    icon: '!',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    borderColor: 'border-yellow-200',
    glowColor: 'shadow-yellow-100',
  },
  info: {
    icon: 'i',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    borderColor: 'border-blue-200',
    glowColor: 'shadow-blue-100',
  },
  celebration: {
    icon: '🎉',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    borderColor: 'border-purple-200',
    glowColor: 'shadow-purple-100',
  },
  encouragement: {
    icon: '💪',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    borderColor: 'border-indigo-200',
    glowColor: 'shadow-indigo-100',
  },
  guidance: {
    icon: '👆',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    borderColor: 'border-teal-200',
    glowColor: 'shadow-teal-100',
  },
  validation: {
    icon: '✅',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    borderColor: 'border-emerald-200',
    glowColor: 'shadow-emerald-100',
  },
};

const styleConfig = {
  toast: {
    position: 'fixed top-4 right-4 z-50',
    animation: 'slideInRight',
  },
  inline: {
    position: 'relative',
    animation: 'fadeInUp',
  },
  floating: {
    position: 'absolute -top-2 -right-2 z-10',
    animation: 'bounceIn',
  },
  badge: {
    position: 'relative inline-block',
    animation: 'scaleIn',
  },
  pulse: {
    position: 'relative',
    animation: 'pulse',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-3 py-2',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    padding: 'px-4 py-3',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};

export const MicroFeedback: React.FC<MicroFeedbackProps> = ({
  type,
  message,
  description,
  style = 'toast',
  duration = 3000,
  position = 'right',
  size = 'md',
  className,
  onDismiss,
  autoHide = true,
  contextual = true,
  emotional = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [contextualMessage, setContextualMessage] = useState(message);

  const config = feedbackConfig[type];
  const styleConf = styleConfig[style];
  const sizeConf = sizeConfig[size];

  // Contextual message enhancement
  useEffect(() => {
    if (contextual) {
      const enhancedMessage = enhanceMessage(message, type, emotional);
      setContextualMessage(enhancedMessage);
    }
  }, [message, type, contextual, emotional]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
    
    // Explicitly return undefined when condition is not met
    return undefined;
  }, [autoHide, duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const getAnimationVariants = () => {
    switch (styleConf.animation) {
      case 'slideInRight':
        return {
          initial: { opacity: 0, x: 100, scale: 0.8 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: 100, scale: 0.8 },
        };
      case 'fadeInUp':
        return {
          initial: { opacity: 0, y: 20, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.9 },
        };
      case 'bounceIn':
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.3 },
        };
      case 'scaleIn':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
        };
      case 'pulse':
        return {
          initial: { opacity: 0.7, scale: 1 },
          animate: { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] },
          exit: { opacity: 0, scale: 0.8 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'micro-feedback',
            styleConf.position,
            config.bgColor,
            config.borderColor,
            config.glowColor,
            sizeConf.padding,
            sizeConf.text,
            'border rounded-lg shadow-lg backdrop-blur-sm',
            'flex items-start gap-2 max-w-sm',
            className
          )}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: 0.3,
          }}
        >
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0',
            sizeConf.icon,
            config.color,
            'flex items-center justify-center rounded-full',
            type === 'celebration' && 'animate-bounce',
            type === 'encouragement' && 'animate-pulse'
          )}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium', config.color)}>
              {contextualMessage}
            </p>
            {description && (
              <p className={cn(
                'mt-1 text-xs opacity-75',
                config.color
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity',
                config.color,
                'text-xs font-medium'
              )}
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to enhance messages contextually
const enhanceMessage = (message: string, type: FeedbackType, emotional: boolean): string => {
  if (!emotional) return message;

  const emotionalEnhancements: Record<FeedbackType, string[]> = {
    success: [
      ' - Well done!',
      ' - Great job!',
      ' - Perfect!',
      ' - Excellent work!',
    ],
    error: [
      ' - Let me help you fix this.',
      ' - We can solve this together.',
      ' - Don\'t worry, I\'m here to help.',
      ' - Let\'s try that again.',
    ],
    warning: [
      ' - Please be careful.',
      ' - Let me guide you through this.',
      ' - I\'m here to help you avoid issues.',
      ' - Let\'s make sure this is right.',
    ],
    info: [
      ' - Good to know!',
      ' - Thanks for the information.',
      ' - I\'ll remember that.',
      ' - Helpful information!',
    ],
    celebration: [
      ' - Amazing achievement!',
      ' - You\'re incredible!',
      ' - Fantastic work!',
      ' - You\'re a star!',
    ],
    encouragement: [
      ' - Keep going!',
      ' - You\'re doing great!',
      ' - Almost there!',
      ' - You\'ve got this!',
    ],
    guidance: [
      ' - Let me help you with that.',
      ' - I\'m here to guide you.',
      ' - We can do this together.',
      ' - I\'ll show you how.',
    ],
    validation: [
      ' - That looks good!',
      ' - Everything checks out!',
      ' - Perfect!',
      ' - All set!',
    ],
  };

  const enhancements = emotionalEnhancements[type] || [];
  if (enhancements.length > 0) {
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return message + randomEnhancement;
  }

  return message;
};

// Specialized feedback components
export const SuccessFeedback: React.FC<Omit<MicroFeedbackProps, 'type'>> = (props) => (
  <MicroFeedback {...props} type="success" />
);

export const ErrorFeedback: React.FC<Omit<MicroFeedbackProps, 'type'>> = (props) => (
  <MicroFeedback {...props} type="error" />
);

export const CelebrationFeedback: React.FC<Omit<MicroFeedbackProps, 'type'>> = (props) => (
  <MicroFeedback {...props} type="celebration" />
);

export const EncouragementFeedback: React.FC<Omit<MicroFeedbackProps, 'type'>> = (props) => (
  <MicroFeedback {...props} type="encouragement" />
);