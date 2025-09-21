import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'liquid';
  speed?: 'slow' | 'medium' | 'fast';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
  speed = 'medium',
}) => {
  const baseClasses = 'relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-lg',
  };

  const speedValues = {
    slow: 3,
    medium: 2,
    fast: 1,
  };

  const getAnimationVariants = (): { initial: any; animate: any } => {
    switch (animation) {
      case 'pulse':
        return {
          initial: { opacity: 1 },
          animate: {
            opacity: [1, 0.5, 1],
            transition: {
              duration: speedValues[speed],
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      case 'wave':
        return {
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.02, 1],
            transition: {
              duration: speedValues[speed],
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      case 'shimmer':
        return {
          initial: { x: '-100%' },
          animate: {
            x: '100%',
            transition: {
              duration: speedValues[speed] * 1.5,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            },
          },
        };
      case 'liquid':
        return {
          initial: { borderRadius: '4px' },
          animate: {
            borderRadius: ['4px', '16px', '8px', '4px'],
            transition: {
              duration: speedValues[speed],
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
        };
    }
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : 'auto'),
      }}
    >
      {/* Shimmer overlay */}
      {animation === 'shimmer' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Liquid animation */}
      {animation === 'liquid' && (
        <motion.div
          className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-100"
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Pulse/Wave animation */}
      {(animation === 'pulse' || animation === 'wave') && (
        <motion.div
          className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-100"
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
        />
      )}
    </div>
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="text" />
);

export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="circular" width="2.5rem" height="2.5rem" />
);

export const SkeletonButton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="rounded" height="2.5rem" className="min-w-[100px]" />
);

export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant'> & {
  hasImage?: boolean;
  lines?: number;
}> = ({
  hasImage = false,
  lines = 3,
  className,
  ...props
}) => (
  <div className={cn('space-y-3 p-4', className)}>
    {hasImage && <Skeleton variant="rectangular" height="200px" className="w-full" {...props} />}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          {...props}
        />
      ))}
    </div>
  </div>
);

// Progressive loading skeleton that builds content piece by piece
interface ProgressiveSkeletonProps {
  steps: Array<{
    component: React.ReactNode;
    delay: number;
  }>;
  className?: string;
  onComplete?: () => void;
}

export const ProgressiveSkeleton: React.FC<ProgressiveSkeletonProps> = ({
  steps,
  className,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (currentStep >= steps.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, steps[currentStep]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  return (
    <div className={cn('progressive-skeleton', className)}>
      {steps.slice(0, currentStep + 1).map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
        >
          {step.component}
        </motion.div>
      ))}

      {/* Loading indicator */}
      {!isComplete && (
        <motion.div
          className="flex items-center justify-center mt-4 space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">Loading content...</span>
        </motion.div>
      )}
    </div>
  );
};

// Smart skeleton that adapts based on content type
interface SmartSkeletonProps {
  type: 'article' | 'profile' | 'dashboard' | 'form' | 'list';
  className?: string;
  animated?: boolean;
}

export const SmartSkeleton: React.FC<SmartSkeletonProps> = ({
  type,
  className,
  animated = true,
}) => {
  const animation = animated ? 'shimmer' : 'pulse';

  const skeletons = {
    article: (
      <div className={cn('space-y-4', className)}>
        <Skeleton variant="rectangular" height="200px" animation={animation} />
        <Skeleton variant="text" width="80%" animation={animation} />
        <Skeleton variant="text" width="100%" animation={animation} />
        <Skeleton variant="text" width="60%" animation={animation} />
      </div>
    ),
    profile: (
      <div className={cn('flex items-center space-x-4', className)}>
        <SkeletonAvatar animation={animation} />
        <div className="space-y-2">
          <Skeleton variant="text" width="120px" animation={animation} />
          <Skeleton variant="text" width="80px" animation={animation} />
        </div>
      </div>
    ),
    dashboard: (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} animation={animation} />
        ))}
      </div>
    ),
    form: (
      <div className={cn('space-y-4', className)}>
        <Skeleton variant="text" width="100px" animation={animation} />
        <Skeleton variant="rectangular" height="40px" animation={animation} />
        <Skeleton variant="text" width="120px" animation={animation} />
        <Skeleton variant="rectangular" height="40px" animation={animation} />
        <SkeletonButton animation={animation} />
      </div>
    ),
    list: (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <SkeletonAvatar animation={animation} />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" width="80%" animation={animation} />
              <Skeleton variant="text" width="60%" animation={animation} />
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return skeletons[type];
};

export default Skeleton;