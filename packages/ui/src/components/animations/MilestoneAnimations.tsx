// Milestone Animations - Celebration and achievement animations with personality adaptation
// Provides meaningful feedback for user accomplishments and progress milestones

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AnimationSystem } from '../../lib/animation-system';
import {
  Award,
  CheckCircle,
  Crown,
  Gift,
  Heart,
  Shield,
  Star,
  Trophy,
} from 'lucide-react';
import type {
  MilestoneCelebrationProps,
  PersonalityMode,
} from '@schwalbe/shared/types/animations';

const iconComponents = {
  trophy: Trophy,
  star: Star,
  heart: Heart,
  shield: Shield,
  crown: Crown,
  gift: Gift,
  award: Award,
};

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  isVisible,
  onComplete,
  autoHide = true,
  duration = 4000,
}) => {
  // Mock personality manager for now
  const personalityMode: PersonalityMode = 'adaptive';
  const adaptedMode = personalityMode;
  
  const [isCompleted, setIsCompleted] = useState(false);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(adaptedMode);

  const IconComponent = iconComponents[milestone.icon];

  // Auto-hide logic
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        setIsCompleted(true);
        setTimeout(() => onComplete?.(), 500);
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, autoHide, duration, onComplete]);

  // Get personality-specific styling
  const getPersonalityTheme = () => {
    switch (adaptedMode) {
      case 'empathetic':
        return {
          primary: 'from-emerald-400 via-emerald-500 to-emerald-600',
          secondary: 'from-emerald-100 to-emerald-200',
          accent: 'text-emerald-600',
          glow: 'shadow-emerald-500/50',
        };
      case 'pragmatic':
        return {
          primary: 'from-blue-500 via-blue-600 to-blue-700',
          secondary: 'from-blue-100 to-blue-200',
          accent: 'text-blue-600',
          glow: 'shadow-blue-500/50',
        };
      default:
        return {
          primary: 'from-purple-400 via-purple-500 to-purple-600',
          secondary: 'from-purple-100 to-purple-200',
          accent: 'text-purple-600',
          glow: 'shadow-purple-500/50',
        };
    }
  };

  const theme = getPersonalityTheme();

  // Create celebration particles
  const createParticles = () => {
    const particles = [];
    const particleCount = shouldReduceMotion
      ? 0
      : adaptedMode === 'empathetic'
        ? 20
        : 12;

    for (let i = 0; i < particleCount; i++) {
      particles.push(
        <motion.div
          key={i}
          className={`absolute w-2 h-2 bg-gradient-to-r ${theme.primary} rounded-full`}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 200 - 50,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: adaptedMode === 'pragmatic' ? 1.5 : 2.5,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      );
    }
    return particles;
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.8,
      y: shouldReduceMotion ? 0 : 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : animConfig.duration * 1.5,
        ease: animConfig.ease,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.1,
      y: shouldReduceMotion ? 0 : -20,
      transition: {
        duration: shouldReduceMotion ? 0.1 : animConfig.duration,
        ease: 'easeInOut',
      },
    },
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: shouldReduceMotion ? ('tween' as const) : ('spring' as const),
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
  } as const;

  const pulseVariants = {
    animate: shouldReduceMotion
      ? {}
      : {
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        },
  } as const;

  return (
    <AnimatePresence>
      {isVisible && !isCompleted && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCompleted(true);
              setTimeout(() => onComplete?.(), 500);
            }}
          />

          {/* Main celebration container */}
          <motion.div
            className='relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center overflow-hidden'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            {/* Background decoration */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${theme.secondary} opacity-20`}
              variants={pulseVariants}
              animate='animate'
            />

            {/* Celebration particles */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                {createParticles()}
              </div>
            </div>

            {/* Main content */}
            <div className='relative z-10'>
              {/* Icon with glow effect */}
              <motion.div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${theme.primary} text-white shadow-2xl ${theme.glow} mb-6`}
                variants={iconVariants}
              >
                <IconComponent className='w-10 h-10' />

                {/* Glow rings */}
                {!shouldReduceMotion && (
                  <>
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.primary} opacity-30`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.primary} opacity-20`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0, 0.2],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      }}
                    />
                  </>
                )}
              </motion.div>

              {/* Achievement text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: animConfig.duration }}
              >
                <h2 className={`text-2xl font-bold ${theme.accent} mb-2`}>
                  {adaptedMode === 'empathetic' && '🎉 '}
                  Milestone Achieved!
                  {adaptedMode === 'empathetic' && ' 🎉'}
                </h2>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                  {milestone.title}
                </h3>

                <p className='text-gray-600 leading-relaxed mb-6'>
                  {milestone.description}
                </p>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                className='flex items-center justify-center space-x-2 mb-6'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: animConfig.duration }}
              >
                <CheckCircle className={`w-5 h-5 ${theme.accent}`} />
                <span className='text-sm text-gray-600 font-medium'>
                  {adaptedMode === 'empathetic'
                    ? 'Another step closer to peace of mind'
                    : adaptedMode === 'pragmatic'
                      ? 'System security enhanced'
                      : 'Progress updated successfully'}
                </span>
              </motion.div>

              {/* Action button */}
              <motion.button
                className={`px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: animConfig.duration }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                onClick={() => {
                  setIsCompleted(true);
                  setTimeout(() => onComplete?.(), 500);
                }}
              >
                {adaptedMode === 'empathetic'
                  ? 'Continue the Journey'
                  : 'Continue'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ProgressRingProps {
  animated?: boolean;
  className?: string;
  progress: number;
  showPercentage?: boolean;
  size?: 'lg' | 'md' | 'sm';
  strokeWidth?: number;
}

export const AdaptiveProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  strokeWidth,
  showPercentage = true,
  animated = true,
  className = '',
}) => {
  // Mock personality for now
  const personalityMode: PersonalityMode = 'adaptive';
  const adaptedMode = personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const sizeConfig = {
    sm: { diameter: 60, stroke: 3 },
    md: { diameter: 80, stroke: 4 },
    lg: { diameter: 120, stroke: 6 },
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - (strokeWidth || config.stroke)) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    switch (adaptedMode) {
      case 'empathetic':
        return 'stroke-emerald-500';
      case 'pragmatic':
        return 'stroke-blue-600';
      default:
        return 'stroke-purple-500';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        width={config.diameter}
        height={config.diameter}
        className='transform -rotate-90'
      >
        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth || config.stroke}
          fill='none'
          className='text-gray-200'
        />

        {/* Progress circle */}
        <motion.circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth || config.stroke}
          fill='none'
          strokeLinecap='round'
          className={getStrokeColor()}
          {...(animated
            ? {
                initial: { strokeDashoffset: circumference },
                animate: { strokeDashoffset },
                ...(shouldReduceMotion
                  ? {}
                  : {
                      transition: {
                        duration: adaptedMode === 'pragmatic' ? 1 : 2,
                        ease:
                          adaptedMode === 'pragmatic'
                            ? 'easeOut'
                            : [0.25, 0.46, 0.45, 0.94],
                        delay: 0.2,
                      },
                    }),
              }
            : {})}
          style={{
            strokeDasharray,
            strokeDashoffset: animated ? undefined : strokeDashoffset,
          }}
        />
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.span
            className='text-gray-700 font-semibold'
            style={{
              fontSize:
                size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px',
            }}
            {...(animated
              ? {
                  initial: { opacity: 0, scale: 0.5 },
                  animate: { opacity: 1, scale: 1 },
                  ...(shouldReduceMotion
                    ? {}
                    : {
                        transition: {
                          delay: 0.5,
                          duration: 0.5,
                        },
                      }),
                }
              : {})}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

interface AchievementBadgeProps {
  date?: Date;
  description?: string;
  earned: boolean;
  icon: keyof typeof iconComponents;
  onClick?: () => void;
  title: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  icon,
  earned,
  date,
  description,
  onClick,
}) => {
  // Mock personality for now
  const personalityMode: PersonalityMode = 'adaptive';
  const adaptedMode = personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const IconComponent = iconComponents[icon];

  const badgeVariants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: shouldReduceMotion
      ? {}
      : {
          scale: 1.05,
          y: -2,
          transition: {
            duration: 0.2,
            ease: 'easeOut' as const,
          },
        },
    tap: shouldReduceMotion
      ? {}
      : {
          scale: 0.95,
          transition: {
            duration: 0.1,
            ease: 'easeOut' as const,
          },
        },
  } as const;

  const getTheme = () => {
    if (!earned) return 'grayscale';

    switch (adaptedMode) {
      case 'empathetic':
        return 'emerald';
      case 'pragmatic':
        return 'blue';
      default:
        return 'purple';
    }
  };

  const theme = getTheme();

  const themeClasses = {
    grayscale: 'bg-gray-100 text-gray-400 border-gray-200',
    emerald:
      'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 shadow-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 shadow-purple-100',
  };

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all
        ${themeClasses[theme]}
        ${earned ? 'shadow-lg' : 'opacity-60'}
      `}
      variants={badgeVariants}
      initial='rest'
      whileHover='hover'
      whileTap='tap'
      onClick={onClick}
    >
      {/* Achievement icon */}
      <div className='flex items-center justify-center mb-3'>
        <div
          className={`
          p-3 rounded-full
          ${
            earned
              ? theme === 'emerald'
                ? 'bg-emerald-500 text-white'
                : theme === 'blue'
                  ? 'bg-blue-600 text-white'
                  : theme === 'purple'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-300 text-gray-500'
              : 'bg-gray-300 text-gray-500'
          }
        `}
        >
          <IconComponent className='w-6 h-6' />
        </div>

        {/* Earned indicator */}
        {earned && (
          <motion.div
            className='absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-1'
            initial={shouldReduceMotion ? {} : { scale: 0, rotate: -180 }}
            animate={shouldReduceMotion ? {} : { scale: 1, rotate: 0 }}
            transition={
              shouldReduceMotion
                ? {}
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }
            }
          >
            <CheckCircle className='w-4 h-4' />
          </motion.div>
        )}
      </div>

      {/* Badge content */}
      <div className='text-center'>
        <h4 className='font-semibold text-sm mb-1'>{title}</h4>
        {earned && date && (
          <p className='text-xs opacity-75'>{date.toLocaleDateString()}</p>
        )}
        {description && (
          <p className='text-xs opacity-75 mt-2 line-clamp-2'>{description}</p>
        )}
      </div>
    </motion.div>
  );
};

export default {
  MilestoneCelebration,
  AdaptiveProgressRing,
  AchievementBadge,
};