import React from 'react';
import { motion, Variants } from 'framer-motion';

import { cn } from '@/lib/utils';

interface BreathingAnimationProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'gentle' | 'prominent';
  speed?: 'slow' | 'medium' | 'fast';
  trigger?: 'always' | 'hover' | 'focus' | 'in-view';
  scale?: { min: number; max: number };
  opacity?: { min: number; max: number };
  glow?: boolean;
  color?: string;
}

const breathingVariants: Record<string, Variants> = {
  subtle: {
    initial: { scale: 1, opacity: 0.8 },
    breathe: {
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        ease: 'easeInOut',
      },
    },
  },
  gentle: {
    initial: { scale: 1, opacity: 0.9 },
    breathe: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      scale: [1, 1.08, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  },
  prominent: {
    initial: { scale: 1, opacity: 0.7 },
    breathe: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  },
};

const speedMultipliers = {
  slow: 1.5,
  medium: 1,
  fast: 0.7,
};

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  children,
  className,
  intensity = 'gentle',
  speed = 'medium',
  trigger = 'always',
  scale = { min: 1, max: 1.05 },
  opacity = { min: 0.9, max: 1 },
  glow = false,
  color = '#3B82F6',
}) => {
  const variants = breathingVariants[intensity];
  const speedMultiplier = speedMultipliers[speed];

  const customVariants = {
    ...variants,
    breathe: {
      scale: [scale.min, scale.max, scale.min],
      opacity: [opacity.min, opacity.max, opacity.min],
      transition: {
        duration: 3 * speedMultiplier,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      scale: [scale.min, scale.max * 1.2, scale.min],
      opacity: [opacity.min, opacity.max, opacity.min],
      transition: {
        duration: 1.5 * speedMultiplier,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={cn(
        'breathing-animation-container',
        glow && 'breathing-glow',
        className
      )}
      variants={customVariants}
      initial="initial"
      animate={trigger === 'always' ? 'breathe' : 'initial'}
      whileHover={trigger === 'hover' ? 'hover' : undefined}
      whileFocus={trigger === 'focus' ? 'hover' : undefined}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
      {glow && (
        <motion.div
          className="breathing-glow-effect absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 * speedMultiplier,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

// Specialized breathing components for common use cases
export const BreathingButton: React.FC<Omit<BreathingAnimationProps, 'children'> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white shadow-md',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <BreathingAnimation
      {...props}
      className={cn(
        'breathing-button relative rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        props.className
      )}
    >
      <motion.button
        onClick={onClick}
        className="relative z-10 w-full h-full flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.button>
    </BreathingAnimation>
  );
};

export const BreathingCard: React.FC<Omit<BreathingAnimationProps, 'children'> & {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}> = ({
  children,
  padding = 'md',
  shadow = 'md',
  ...props
}) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <BreathingAnimation
      {...props}
      className={cn(
        'breathing-card bg-white rounded-xl border border-gray-100',
        paddingStyles[padding],
        shadowStyles[shadow],
        props.className
      )}
    >
      {children}
    </BreathingAnimation>
  );
};

export const BreathingIcon: React.FC<Omit<BreathingAnimationProps, 'children'> & {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({
  icon,
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <BreathingAnimation
      {...props}
      className={cn(
        'breathing-icon flex items-center justify-center',
        sizeStyles[size],
        props.className
      )}
    >
      {icon}
    </BreathingAnimation>
  );
};