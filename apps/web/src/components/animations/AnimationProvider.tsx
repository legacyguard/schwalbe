/**
 * Animation Provider for LegacyGuard
 *
 * Provides centralized animation state management and performance monitoring
 * throughout the application.
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import {
  AnimationContextValue,
  AnimationState,
  AnimationPerformanceMonitor,
  ANIMATION_CONFIG,
} from '@/config/animations';

// Animation state reducer
type AnimationAction =
  | { type: 'START_ANIMATION'; payload: string }
  | { type: 'END_ANIMATION' }
  | { type: 'SET_PERFORMANCE_MODE'; payload: 'high' | 'medium' | 'low' }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean };

const initialState: AnimationState = {
  isAnimating: false,
  currentAnimation: null,
  performanceMode: 'high',
  reducedMotion: false,
};

function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case 'START_ANIMATION':
      return {
        ...state,
        isAnimating: true,
        currentAnimation: action.payload,
      };
    case 'END_ANIMATION':
      return {
        ...state,
        isAnimating: false,
        currentAnimation: null,
      };
    case 'SET_PERFORMANCE_MODE':
      return {
        ...state,
        performanceMode: action.payload,
      };
    case 'SET_REDUCED_MOTION':
      return {
        ...state,
        reducedMotion: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AnimationContext = createContext<AnimationContextValue | undefined>(undefined);

// Performance monitor instance
const performanceMonitor = new AnimationPerformanceMonitor();

// Animation frame loop for performance monitoring
let animationFrameId: number;

const startPerformanceMonitoring = () => {
  const monitor = () => {
    performanceMonitor.updateFrame();
    animationFrameId = requestAnimationFrame(monitor);
  };
  animationFrameId = requestAnimationFrame(monitor);
};

const stopPerformanceMonitoring = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

// Provider component
interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  // Initialize performance monitoring and reduced motion detection
  useEffect(() => {
    startPerformanceMonitoring();

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    dispatch({ type: 'SET_REDUCED_MOTION', payload: mediaQuery.matches });

    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_REDUCED_MOTION', payload: e.matches });
    };

    mediaQuery.addEventListener('change', handleChange);

    // Set initial performance mode
    const initialMode = performanceMonitor.getPerformanceMode();
    dispatch({ type: 'SET_PERFORMANCE_MODE', payload: initialMode });

    // Monitor performance changes
    const performanceInterval = setInterval(() => {
      const currentMode = performanceMonitor.getPerformanceMode();
      if (currentMode !== state.performanceMode) {
        dispatch({ type: 'SET_PERFORMANCE_MODE', payload: currentMode });
      }
    }, 1000);

    return () => {
      stopPerformanceMonitoring();
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(performanceInterval);
    };
  }, [state.performanceMode]);

  // Context value
  const contextValue: AnimationContextValue = {
    performanceMonitor,
    config: ANIMATION_CONFIG,
    state,
    updateState: (updates: Partial<AnimationState>) => {
      if (updates.performanceMode) {
        dispatch({ type: 'SET_PERFORMANCE_MODE', payload: updates.performanceMode });
      }
      if (updates.reducedMotion !== undefined) {
        dispatch({ type: 'SET_REDUCED_MOTION', payload: updates.reducedMotion });
      }
    },
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
}

// Hook to use animation context
export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}

// Hook for animation lifecycle management
export function useAnimationLifecycle(animationName: string) {
  const { state, updateState } = useAnimation();

  const startAnimation = () => {
    updateState({ isAnimating: true, currentAnimation: animationName });
  };

  const endAnimation = () => {
    updateState({ isAnimating: false, currentAnimation: null });
  };

  return {
    isAnimating: state.isAnimating && state.currentAnimation === animationName,
    performanceMode: state.performanceMode,
    reducedMotion: state.reducedMotion,
    startAnimation,
    endAnimation,
  };
}

// Hook for performance-aware animations
export function usePerformanceAwareAnimation() {
  const { state } = useAnimation();

  return {
    performanceMode: state.performanceMode,
    reducedMotion: state.reducedMotion,
    shouldReduceAnimations: state.reducedMotion || state.performanceMode === 'low',
    animationMultiplier: state.reducedMotion ? 0.5 : 1,
  };
}

// Export performance monitor for external use
export { performanceMonitor };