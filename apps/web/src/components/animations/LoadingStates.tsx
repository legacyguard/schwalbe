/**
 * Loading State Animations for LegacyGuard
 *
 * Beautiful, contextual loading animations that provide visual feedback
 * during different loading scenarios throughout the application.
 */

import React, { ReactNode } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { usePerformanceAwareAnimation } from './AnimationProvider';

import { animationUtils } from '@/config/animations';

// Types
interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars' | 'skeleton' | 'shimmer';
  color?: 'primary' | 'secondary' | 'muted';
  text?: string;
  showText?: boolean;
}

interface SkeletonProps extends LoadingStateProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
}

interface ProgressLoaderProps extends LoadingStateProps {
  progress?: number; // 0-100
  showPercentage?: boolean;
  isAnimated?: boolean;
}

interface ContextualLoaderProps extends LoadingStateProps {
  context: 'document-processing' | 'ai-analysis' | 'saving' | 'loading' | 'uploading';
  message?: string;
}

// Base Loading Spinner Component
export function LoadingSpinner({
  className = '',
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  showText = false
}: LoadingStateProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
  };

  const spinnerSpring = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: !reducedMotion,
    config: animationUtils.getOptimizedConfig(performanceMode),
  });

  const SpinnerIcon = () => (
    <svg
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const DotsLoader = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <animated.div
          key={index}
          className={`w-2 h-2 ${colorClasses[color].replace('text-', 'bg-')} rounded-full`}
          style={useSpring({
            from: { opacity: 0.3 },
            to: { opacity: 1 },
            loop: !reducedMotion,
            delay: index * 200,
            config: animationUtils.getOptimizedConfig(performanceMode),
          })}
        />
      ))}
    </div>
  );

  const BarsLoader = () => (
    <div className={`flex space-x-1 items-end ${className}`}>
      {[0, 1, 2, 3].map((index) => (
        <animated.div
          key={index}
          className={`w-1 ${colorClasses[color].replace('text-', 'bg-')}`}
          style={useSpring({
            from: { height: '4px' },
            to: { height: index % 2 === 0 ? '16px' : '8px' },
            loop: !reducedMotion,
            delay: index * 100,
            config: animationUtils.getOptimizedConfig(performanceMode),
          })}
        />
      ))}
    </div>
  );

  const PulseLoader = () => {
    const scaleSpring = useSpring({
      from: { scale: 0.8 },
      to: { scale: 1.2 },
      loop: !reducedMotion,
      config: animationUtils.getOptimizedConfig(performanceMode),
    });

    const opacitySpring = useSpring({
      from: { opacity: 1 },
      to: { opacity: 0.5 },
      loop: !reducedMotion,
      config: animationUtils.getOptimizedConfig(performanceMode),
    });

    return (
      <animated.div
        className={`${sizeClasses[size]} ${colorClasses[color].replace('text-', 'bg-')} rounded-full ${className}`}
        style={{
          ...scaleSpring,
          ...opacitySpring,
        }}
      />
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'spinner':
      default:
        return (
          <animated.div style={spinnerSpring}>
            <SpinnerIcon />
          </animated.div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {showText && text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton Loading Component
export function Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  lines = 1
}: SkeletonProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const shimmerSpring = useSpring({
    from: { x: '-100%' },
    to: { x: '100%' },
    loop: !reducedMotion,
    config: animationUtils.getOptimizedConfig('medium'),
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`relative overflow-hidden ${rounded ? 'rounded' : ''}`}
          style={{ width, height }}
        >
          <div className="absolute inset-0 bg-muted animate-pulse" />
          {!reducedMotion && (
            <animated.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
              style={{
                ...shimmerSpring,
                width: '50%',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Progress Loader Component
export function ProgressLoader({
  className = '',
  progress = 0,
  showPercentage = false,
  isAnimated = true,
  text
}: ProgressLoaderProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const progressSpring = useSpring({
    width: `${Math.min(100, Math.max(0, progress))}%`,
    config: animationUtils.getOptimizedConfig(performanceMode),
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
        {showPercentage && (
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <animated.div
          className="h-full bg-primary transition-colors duration-300"
          style={isAnimated && !reducedMotion ? progressSpring : { width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Contextual Loading Component
export function ContextualLoader({
  className = '',
  context,
  message
}: ContextualLoaderProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const contextConfig = {
    'document-processing': {
      text: message || 'Processing document...',
      variant: 'spinner' as const,
      size: 'md' as const,
    },
    'ai-analysis': {
      text: message || 'AI analyzing content...',
      variant: 'dots' as const,
      size: 'md' as const,
    },
    'saving': {
      text: message || 'Saving changes...',
      variant: 'pulse' as const,
      size: 'sm' as const,
    },
    'loading': {
      text: message || 'Loading...',
      variant: 'spinner' as const,
      size: 'md' as const,
    },
    'uploading': {
      text: message || 'Uploading...',
      variant: 'bars' as const,
      size: 'md' as const,
    },
  };

  const config = contextConfig[context];

  return (
    <LoadingSpinner
      className={className}
      size={config.size}
      variant={config.variant}
      text={config.text}
      showText={true}
    />
  );
}

// Document Processing Loader
export function DocumentProcessingLoader({ className = '', message }: { className?: string; message?: string }) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const steps = [
    { label: 'Scanning document', duration: 1000 },
    { label: 'Extracting text', duration: 1500 },
    { label: 'Analyzing content', duration: 2000 },
    { label: 'Categorizing', duration: 1000 },
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 800);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <LoadingSpinner variant="dots" size="lg" />
      <div className="text-center">
        <p className="text-sm font-medium">
          {message || 'Processing your document'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {steps[currentStep]?.label}
        </p>
      </div>
    </div>
  );
}

// AI Analysis Loader
export function AIAnalysisLoader({ className = '', message }: { className?: string; message?: string }) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const analysisSpring = useSpring({
    from: { scale: 0.8, opacity: 0.5 },
    to: { scale: 1.2, opacity: 1 },
    loop: !reducedMotion,
    config: animationUtils.getOptimizedConfig('medium'),
  });

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <animated.div style={analysisSpring}>
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/30 rounded-full animate-pulse" />
        </div>
      </animated.div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {message || 'Sofia is analyzing your content'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
}

// Celebration Loading (for successful operations)
export function CelebrationLoader({ className = '', message }: { className?: string; message?: string }) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const celebrationSpring = useSpring({
    from: { scale: 0, rotate: -180 },
    to: { scale: 1, rotate: 0 },
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <animated.div style={celebrationSpring}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </animated.div>
      <div className="text-center">
        <p className="text-sm font-medium text-green-700">
          {message || 'Success!'}
        </p>
      </div>
    </div>
  );
}

// Export all loading components
export const LoadingStates = {
  Spinner: LoadingSpinner,
  Skeleton,
  Progress: ProgressLoader,
  Contextual: ContextualLoader,
  DocumentProcessing: DocumentProcessingLoader,
  AIAnalysis: AIAnalysisLoader,
  Celebration: CelebrationLoader,
};