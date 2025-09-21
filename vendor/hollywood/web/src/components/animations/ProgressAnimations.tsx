
// Progress Animations - Adaptive progress indicators based on Sofia's personality
// Provides visual feedback for user actions and milestones

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useAdaptiveAnimation } from './InteractiveAnimations';
import { CheckCircle, Circle, Sparkles, Star } from 'lucide-react';

interface ProgressBarProps {
  animated?: boolean;
  className?: string;
  progress: number;
  showPercentage?: boolean;
}

export const AdaptiveProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
  animated = true,
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  const progressValue = Math.min(100, Math.max(0, progress));

  const barVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: progressValue / 100,
      transition: {
        duration: shouldReduceMotion
          ? 0.1
          : personalityMode === 'pragmatic'
            ? 0.5
            : 1.2,
        ease:
          personalityMode === 'pragmatic'
            ? ('easeOut' as const)
            : [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  } as const;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Background track */}
      <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>
        {/* Progress fill */}
        <motion.div
          className={`h-full origin-left ${
            personalityMode === 'empathetic'
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : personalityMode === 'pragmatic'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-purple-400 to-purple-500'
          }`}
          {...(animated
            ? {
                variants: barVariants,
                initial: 'initial',
                animate: 'animate',
              }
            : {
                style: { transform: `scaleX(${progressValue / 100})` },
              })}
        />

        {/* Animated sparkles for empathetic mode */}
        {personalityMode === 'empathetic' && progressValue > 10 && (
          <motion.div
            className='absolute inset-0 pointer-events-none'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className='absolute top-1/2 transform -translate-y-1/2'
                style={{ left: `${Math.random() * (progressValue - 10) + 5}%` }}
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut' as const,
                }}
              >
                <Sparkles className='w-2 h-2 text-white/80' />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Percentage display */}
      {showPercentage && (
        <motion.div
          className='absolute -top-6 right-0 text-sm font-medium text-gray-600'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progressValue)}%
        </motion.div>
      )}
    </div>
  );
};

interface MilestoneIndicatorProps {
  completed: boolean;
  description?: string;
  index: number;
  isActive?: boolean;
  title: string;
}

export const AdaptiveMilestoneIndicator: React.FC<MilestoneIndicatorProps> = ({
  completed,
  title,
  description,
  index,
  isActive = false,
}) => {
  const { personalityMode, shouldReduceMotion, animationConfig } =
    useAdaptiveAnimation();

  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: animationConfig.duration,
        ease: animationConfig.ease,
      },
    },
  };

  const celebrationVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: personalityMode === 'empathetic' ? [0, 5, -5, 0] : [0, 180, 360],
      transition: {
        duration: personalityMode === 'pragmatic' ? 0.6 : 1.2,
        ease:
          personalityMode === 'pragmatic'
            ? ('easeOut' as const)
            : ([0.25, 0.46, 0.45, 0.94] as const),
      },
    },
  };

  return (
    <motion.div
      className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50' : 'bg-transparent'
      }`}
      {...(shouldReduceMotion
        ? {}
        : {
            variants: containerVariants,
            initial: 'initial',
            animate: 'animate',
          })}
    >
      {/* Icon */}
      <motion.div
        className='flex-shrink-0 relative'
        {...(completed && !shouldReduceMotion
          ? {
              variants: celebrationVariants,
              animate: 'animate',
            }
          : {
              animate: 'initial',
            })}
      >
        {completed ? (
          <div
            className={`relative ${
              personalityMode === 'empathetic'
                ? 'text-emerald-500'
                : personalityMode === 'pragmatic'
                  ? 'text-blue-600'
                  : 'text-purple-500'
            }`}
          >
            <CheckCircle className='w-6 h-6' />
            {personalityMode === 'empathetic' && (
              <motion.div
                className='absolute -top-1 -right-1'
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Star className='w-3 h-3 text-yellow-400 fill-current' />
              </motion.div>
            )}
          </div>
        ) : (
          <Circle className='w-6 h-6 text-gray-300' />
        )}
      </motion.div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <motion.h4
          className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-500'}`}
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: index * 0.1 + 0.2 },
              })}
        >
          {title}
        </motion.h4>
        {description && (
          <motion.p
            className='text-sm text-gray-600 mt-1'
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: index * 0.1 + 0.3 },
                })}
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

interface StepProgressProps {
  className?: string;
  steps: Array<{ active: boolean; completed: boolean; title: string }>;
}

export const AdaptiveStepProgress: React.FC<StepProgressProps> = ({
  steps,
  className = '',
}) => {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step indicator */}
          <motion.div
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step.completed
                ? personalityMode === 'empathetic'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : personalityMode === 'pragmatic'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-purple-500 border-purple-500 text-white'
                : step.active
                  ? personalityMode === 'empathetic'
                    ? 'border-emerald-500 text-emerald-500'
                    : personalityMode === 'pragmatic'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-purple-500 text-purple-500'
                  : 'border-gray-300 text-gray-400'
            }`}
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { scale: 0, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: {
                    delay: index * 0.1,
                    type: personalityMode === 'pragmatic' ? 'tween' : 'spring',
                    ...(personalityMode !== 'pragmatic' && { stiffness: 200 }),
                  },
                })}
          >
            {step.completed ? (
              <CheckCircle className='w-4 h-4' />
            ) : (
              <span className='text-sm font-medium'>{index + 1}</span>
            )}

            {/* Pulse effect for active step */}
            {step.active && !step.completed && !shouldReduceMotion && (
              <motion.div
                className={`absolute inset-0 rounded-full border-2 ${
                  personalityMode === 'empathetic'
                    ? 'border-emerald-500'
                    : personalityMode === 'pragmatic'
                      ? 'border-blue-600'
                      : 'border-purple-500'
                }`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: personalityMode === 'pragmatic' ? 1.5 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }}
              />
            )}
          </motion.div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <motion.div
              className={`flex-1 h-0.5 ${
                steps[index + 1]?.completed || step.completed
                  ? personalityMode === 'empathetic'
                    ? 'bg-emerald-500'
                    : personalityMode === 'pragmatic'
                      ? 'bg-blue-600'
                      : 'bg-purple-500'
                  : 'bg-gray-300'
              }`}
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { scaleX: 0 },
                    animate: { scaleX: 1 },
                    transition: {
                      delay: index * 0.1 + 0.2,
                      duration: personalityMode === 'pragmatic' ? 0.3 : 0.8,
                    },
                  })}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default {
  AdaptiveProgressBar,
  AdaptiveMilestoneIndicator,
  AdaptiveStepProgress,
};
