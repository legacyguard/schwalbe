/**
 * Mobile Optimization Utility Functions
 * Non-React utilities for mobile performance and optimization
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Mobile-optimized component props generator
export const mobileOptimized = {
  // Button optimization for touch
  button: (size: 'lg' | 'md' | 'sm' = 'md') => ({
    className: cn(
      'touch-manipulation select-none',
      size === 'sm' && 'min-h-[36px] min-w-[36px]',
      size === 'md' && 'min-h-[44px] min-w-[44px]',
      size === 'lg' && 'min-h-[56px] min-w-[56px]'
    ),
    style: {
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none' as any,
      WebkitUserSelect: 'none' as any,
      userSelect: 'none',
    },
  }),

  // Input field optimization
  input: () => ({
    className: cn(
      'text-[16px] sm:text-sm', // Prevent zoom on iOS
      'touch-manipulation'
    ),
    autoComplete: 'on',
    autoCapitalize: 'off',
    autoCorrect: 'off',
    spellCheck: false,
  }),

  // Scrollable area optimization
  scroll: (direction: 'both' | 'horizontal' | 'vertical' = 'vertical') => ({
    className: cn(
      'overscroll-contain',
      direction === 'vertical' && 'overflow-y-auto overflow-x-hidden',
      direction === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
      direction === 'both' && 'overflow-auto'
    ),
    style: {
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
    },
  }),
};

// Performance optimization utilities
export const mobileAnalytics = {
  // Track performance metrics
  measurePerformance: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();

    if ('performance' in window && 'measure' in performance) {
      try {
        performance.mark(`${name}-start`);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      } catch {
        // Fallback for unsupported browsers
      }
    }

    return end - start;
  },

  // Device capability detection
  getDeviceCapabilities: () => ({
    hasTouch: 'ontouchstart' in window,
    hasHover: window.matchMedia('(hover: hover)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches,
    connectionSpeed: (navigator as any).connection?.effectiveType || 'unknown',
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
  }),
};

// Utility functions for mobile optimization
export function renderMobileOptimized<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  props: T & {
    breakpoint?: number;
    desktopClassName?: string;
    mobileClassName?: string;
  }
) {
  const {
    mobileClassName,
    desktopClassName,
    breakpoint = 768,
    ...componentProps
  } = props;

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < breakpoint;
  const optimizedClassName = isMobile ? mobileClassName : desktopClassName;

  return React.createElement(Component, {
    ...(componentProps as T),
    className: cn(componentProps.className as string, optimizedClassName),
  });
}
