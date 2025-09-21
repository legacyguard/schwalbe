/**
 * Error State Animations for LegacyGuard
 *
 * Beautiful, contextual error animations that provide clear feedback
 * while maintaining the liquid design aesthetic and emotional intelligence.
 */

import React, { ReactNode } from 'react';
import { animated, useSpring, useSpringValue } from '@react-spring/web';
import { usePerformanceAwareAnimation } from './AnimationProvider';
import { ANIMATION_CONFIG, animationUtils } from '@/config/animations';

// Types
interface ErrorStateProps {
  className?: string;
  type?: 'shake' | 'bounce' | 'fade' | 'slide' | 'scale' | 'pulse';
  severity?: 'error' | 'warning' | 'info';
  message?: string;
  title?: string;
  action?: ReactNode;
  persistent?: boolean;
  onDismiss?: () => void;
}

interface ShakeErrorProps extends ErrorStateProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number;
}

interface ContextualErrorProps extends ErrorStateProps {
  context: 'network' | 'validation' | 'permission' | 'upload' | 'ai' | 'auth';
}

// Shake Error Component
export function ShakeError({
  className = '',
  type = 'shake',
  severity = 'error',
  message,
  title,
  action,
  intensity = 'medium',
  duration = 600,
  persistent = false,
  onDismiss
}: ShakeErrorProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const shakeIntensity = {
    subtle: { x: [-2, 2, -1, 1, 0] },
    medium: { x: [-4, 4, -2, 2, 0] },
    strong: { x: [-8, 8, -4, 4, 0] },
  };

  const shakeSpring = useSpring({
    from: { x: 0 },
    to: shakeIntensity[intensity],
    loop: !reducedMotion && !persistent,
    config: {
      ...animationUtils.getOptimizedConfig(performanceMode),
      duration: duration,
    },
  });

  const severityStyles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <animated.div
      style={shakeSpring}
      className={`p-4 rounded-lg border ${severityStyles[severity]} ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className={iconStyles[severity]}>
          {icons[severity]}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">
              {message}
            </p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </animated.div>
  );
}

// Bounce Error Component
export function BounceError({
  className = '',
  severity = 'error',
  message,
  title,
  action,
  persistent = false,
  onDismiss
}: ErrorStateProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const bounceSpring = useSpring({
    from: { y: -20, opacity: 0 },
    to: { y: 0, opacity: 1 },
    loop: !reducedMotion && !persistent ? { reverse: true } : false,
    config: animationUtils.getOptimizedConfig(performanceMode),
  });

  const severityStyles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <animated.div
      style={bounceSpring}
      className={`p-4 rounded-lg border ${severityStyles[severity]} ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-current rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">
              {message}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </animated.div>
  );
}

// Pulse Error Component
export function PulseError({
  className = '',
  severity = 'error',
  message,
  title,
  action,
  persistent = false,
  onDismiss
}: ErrorStateProps) {
  const { reducedMotion, performanceMode } = usePerformanceAwareAnimation();

  const pulseSpring = useSpring({
    from: { scale: 0.95, opacity: 0.8 },
    to: { scale: 1.05, opacity: 1 },
    loop: !reducedMotion && !persistent,
    config: animationUtils.getOptimizedConfig(performanceMode),
  });

  const severityStyles = {
    error: 'border-red-300 bg-red-100 text-red-900',
    warning: 'border-yellow-300 bg-yellow-100 text-yellow-900',
    info: 'border-blue-300 bg-blue-100 text-blue-900',
  };

  return (
    <animated.div
      style={pulseSpring}
      className={`p-4 rounded-lg border-2 ${severityStyles[severity]} ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">
              {message}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </animated.div>
  );
}

// Contextual Error Component
export function ContextualError({
  className = '',
  context,
  message,
  title,
  action,
  persistent = false,
  onDismiss
}: ContextualErrorProps) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const contextConfig: Record<string, {
    title: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    type: 'shake' | 'bounce' | 'pulse';
  }> = {
    network: {
      title: title || 'Connection Error',
      message: message || 'Please check your internet connection and try again.',
      severity: 'error',
      type: 'shake',
    },
    validation: {
      title: title || 'Validation Error',
      message: message || 'Please check your input and try again.',
      severity: 'warning',
      type: 'bounce',
    },
    permission: {
      title: title || 'Permission Denied',
      message: message || 'You don\'t have permission to perform this action.',
      severity: 'error',
      type: 'shake',
    },
    upload: {
      title: title || 'Upload Failed',
      message: message || 'There was an error uploading your file. Please try again.',
      severity: 'error',
      type: 'shake',
    },
    ai: {
      title: title || 'AI Analysis Error',
      message: message || 'Sofia encountered an error while analyzing your content. Please try again.',
      severity: 'warning',
      type: 'pulse',
    },
    auth: {
      title: title || 'Authentication Error',
      message: message || 'Please sign in to continue.',
      severity: 'info',
      type: 'bounce',
    },
  };

  const config = contextConfig[context] || contextConfig.network; // fallback to network error
  
  // TypeScript assertion: config is guaranteed to exist due to fallback above
  if (!config) {
    throw new Error(`Invalid context: ${context}`);
  }

  const renderErrorComponent = () => {
    switch (config.type) {
      case 'shake':
        return (
          <ShakeError
            className={className}
            type={config.type}
            severity={config.severity}
            title={config.title}
            message={config.message}
            action={action}
            persistent={persistent}
            onDismiss={onDismiss}
          />
        );
      case 'bounce':
        return (
          <BounceError
            className={className}
            severity={config.severity}
            title={config.title}
            message={config.message}
            action={action}
            persistent={persistent}
            onDismiss={onDismiss}
          />
        );
      case 'pulse':
        return (
          <PulseError
            className={className}
            severity={config.severity}
            title={config.title}
            message={config.message}
            action={action}
            persistent={persistent}
            onDismiss={onDismiss}
          />
        );
      default:
        return (
          <ShakeError
            className={className}
            type={config.type}
            severity={config.severity}
            title={config.title}
            message={config.message}
            action={action}
            persistent={persistent}
            onDismiss={onDismiss}
          />
        );
    }
  };

  return renderErrorComponent();
}

// Network Error Component
export function NetworkError({ className = '', message, action }: { className?: string; message?: string; action?: ReactNode }) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const reconnectSpring = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: !reducedMotion,
    config: animationUtils.getOptimizedConfig('medium'),
  });

  return (
    <div className={`flex flex-col items-center space-y-4 p-6 ${className}`}>
      <animated.div style={reconnectSpring}>
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full" />
      </animated.div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connection Lost
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {message || 'Please check your internet connection and try again.'}
        </p>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

// Validation Error Component
export function ValidationError({ className = '', message, title }: { className?: string; message?: string; title?: string }) {
  const { reducedMotion } = usePerformanceAwareAnimation();

  const wiggleSpring = useSpring({
    from: { x: 0 },
    to: { x: [-3, 3, -2, 2, 0] },
    loop: !reducedMotion,
    config: animationUtils.getOptimizedConfig('high'),
  });

  return (
    <animated.div
      style={wiggleSpring}
      className={`p-3 rounded-md bg-yellow-50 border border-yellow-200 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          {title && (
            <p className="text-sm font-medium text-yellow-800">
              {title}
            </p>
          )}
          {message && (
            <p className="text-sm text-yellow-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </animated.div>
  );
}

// Export all error components
export const ErrorStates = {
  Shake: ShakeError,
  Bounce: BounceError,
  Pulse: PulseError,
  Contextual: ContextualError,
  Network: NetworkError,
  Validation: ValidationError,
};