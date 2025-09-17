/**
 * Mobile Optimization Constants
 * Responsive design helpers and mobile-specific constants
 */

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Touch gesture thresholds
export const touchThresholds = {
  swipeDistance: 50,
  swipeVelocity: 0.3,
  tapTimeout: 300,
  doubleTapDelay: 400,
  longPressDelay: 500,
} as const;

// Performance optimization constants
export const performanceConfig = {
  lazyLoadThreshold: '50px',
  debounceDelay: 150,
  throttleDelay: 100,
  virtualScrollBuffer: 5,
} as const;
