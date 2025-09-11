import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  LoadingAnimationType,
  LoadingAnimationProps,
} from '@schwalbe/shared/types/animations';

// Personality-specific loading configurations
const PERSONALITY_LOADING_CONFIGS = {
  empathetic: {
    defaultType: 'heartbeat' as LoadingAnimationType,
    colors: ['#ec4899', '#f97316', '#8b5cf6'],
    duration: 2.0,
    easing: 'easeOut',
  },
  pragmatic: {
    defaultType: 'spinner' as LoadingAnimationType,
    colors: ['#6b7280', '#374151', '#111827'],
    duration: 1.0,
    easing: 'linear',
  },
  adaptive: {
    defaultType: 'wave' as LoadingAnimationType,
    colors: ['#3b82f6', '#10b981', '#06b6d4'],
    duration: 1.5,
    easing: 'easeInOut',
  },
};

// Main loading animation component
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type,
  size = 'md',
  text,
  personalityAdapt = true,
  className = '',
  color,
  duration,
}) => {
  // Mock personality for now - will be replaced with actual personality manager
  const personality = {
    mode: 'adaptive' as 'adaptive' | 'empathetic' | 'pragmatic',
  };

  const config = PERSONALITY_LOADING_CONFIGS[personality.mode];
  const animationType = personalityAdapt
    ? type || config.defaultType
    : type || 'spinner';
  const animationDuration = duration || config.duration;
  const animationColor = color || config.colors[0];

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const renderLoadingAnimation = () => {
    switch (animationType) {
      case 'spinner':
        return (
          <motion.div
            className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full ${className}`}
            style={{ borderTopColor: animationColor }}
            animate={{ rotate: 360 }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map(index => (
              <motion.div
                key={index}
                className={`rounded-full ${
                  size === 'sm' && 'w-2 h-2'
                } ${size === 'md' && 'w-3 h-3'} ${
                  size === 'lg' && 'w-4 h-4'
                } ${size === 'xl' && 'w-5 h-5'}`}
                style={{ backgroundColor: animationColor }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizeClasses[size]} rounded-full ${className}`}
            style={{ backgroundColor: animationColor }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: config.easing,
            }}
          />
        );

      case 'skeleton':
        return (
          <div className={`space-y-2 ${className}`}>
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className='h-4 bg-gray-200 rounded'
                style={{ width: `${100 - index * 10}%` }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              />
            ))}
          </div>
        );

      case 'progress':
        return (
          <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <motion.div
              className='h-full rounded-full'
              style={{ backgroundColor: animationColor }}
              animate={{
                width: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: animationDuration * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        );

      case 'typewriter':
        return (
          <div className={`flex items-center space-x-1 ${className}`}>
            <span style={{ color: animationColor }}>{text || 'Loading...'}</span>
            <motion.span
              style={{ color: animationColor }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              |
            </motion.span>
          </div>
        );

      case 'firefly':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className='absolute w-1 h-1 rounded-full'
                style={{
                  backgroundColor: config.colors[index % config.colors.length],
                }}
                animate={{
                  x: [0, 20, -10, 15, 0],
                  y: [0, -15, 10, -5, 0],
                  opacity: [0.3, 1, 0.7, 1, 0.3],
                  scale: [0.5, 1, 0.8, 1.2, 0.5],
                }}
                transition={{
                  duration: animationDuration * 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'heartbeat':
        return (
          <motion.div
            className={`${sizeClasses[size]} flex items-center justify-center ${className}`}
          >
            <motion.div
              className={`${sizeClasses[size]} text-red-500`}
              animate={{
                scale: [1, 1.3, 1, 1.3, 1],
              }}
              transition={{
                duration: animationDuration,
                repeat: Infinity,
                times: [0, 0.14, 0.28, 0.42, 1],
              }}
            >
              ❤️
            </motion.div>
          </motion.div>
        );

      case 'wave':
        return (
          <div className={`flex items-end space-x-1 ${className}`}>
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className={`rounded-t ${
                  size === 'sm' && 'w-1'
                } ${size === 'md' && 'w-2'} ${size === 'lg' && 'w-3'} ${
                  size === 'xl' && 'w-4'
                }`}
                style={{ backgroundColor: animationColor }}
                animate={{
                  height: [10, 30, 10],
                }}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'bounce':
        return (
          <motion.div
            className={`${sizeClasses[size]} rounded-full ${className}`}
            style={{ backgroundColor: animationColor }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        );

      default:
        return renderLoadingAnimation();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center space-y-3'>
      {renderLoadingAnimation()}
      <AnimatePresence>
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm font-medium ${
              personalityAdapt && {
                'text-pink-600': personality.mode === 'empathetic',
                'text-gray-600': personality.mode === 'pragmatic',
                'text-blue-600': personality.mode === 'adaptive',
              }
            }`}
            style={!personalityAdapt ? { color: animationColor } : {}}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Specialized loading components
export const PageLoader: React.FC<{
  className?: string;
  overlay?: boolean;
  text?: string;
}> = ({ text, overlay = false, className = '' }) => {
  const loadingText = text || 'Loading...';
  const content = (
    <div
      className={`flex items-center justify-center ${
        overlay ? 'min-h-screen' : 'min-h-[200px]'
      } ${className}`}
    >
      <LoadingAnimation
        type='firefly'
        size='lg'
        text={loadingText}
        personalityAdapt={true}
      />
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export const ButtonLoader: React.FC<{
  color?: string;
  size?: 'lg' | 'md' | 'sm';
}> = ({ size = 'sm', color }) => (
  <LoadingAnimation
    type='spinner'
    size={size}
    {...(color ? { color } : {})}
    personalityAdapt={false}
  />
);

export const FormLoader: React.FC<{
  className?: string;
  fields?: number;
}> = ({ fields = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(fields)].map((_, index) => (
      <div key={index} className='space-y-2'>
        <motion.div
          className='h-4 bg-gray-200 rounded w-1/4'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
        <motion.div
          className='h-10 bg-gray-200 rounded'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1 + 0.05,
          }}
        />
      </div>
    ))}
  </div>
);

export const CardLoader: React.FC<{
  className?: string;
  count?: number;
}> = ({ count = 1, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(count)].map((_, index) => (
      <motion.div
        key={index}
        className='border border-gray-200 rounded-lg p-4 space-y-3'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <motion.div
          className='h-6 bg-gray-200 rounded w-3/4'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
        <motion.div
          className='h-4 bg-gray-200 rounded w-1/2'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1 + 0.1,
          }}
        />
        <motion.div
          className='h-20 bg-gray-200 rounded'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1 + 0.2,
          }}
        />
      </motion.div>
    ))}
  </div>
);

export const ProgressLoader: React.FC<{
  className?: string;
  progress: number;
  text?: string;
}> = ({ progress, text, className = '' }) => {
  // Mock personality for now
  const personality = {
    mode: 'adaptive' as 'adaptive' | 'empathetic' | 'pragmatic',
  };
  const config = PERSONALITY_LOADING_CONFIGS[personality.mode];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='flex justify-between text-sm'>
        <span>{text || 'Loading...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <motion.div
          className='h-full rounded-full'
          style={{ backgroundColor: config.colors[0] }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;