// SofiaFirefly Web Components - Unified exports for the web version
// This provides the same API as the mobile version but optimized for web

// Main Components
export { SofiaFirefly } from './SofiaFirefly';
export { SofiaFireflySVG } from './SofiaFireflySVG';

// Animation System
export {
  useSofiaAnimations,
  createFloatingAnimation,
  createPulseAnimation,
  createWingAnimation,
  createTouchAnimation,
  EasingPresets,
} from './SofiaFireflyAnimations';

// Personality System
export {
  useSofiaPersonality,
  PersonalityPresets,
  type PersonalityConfig,
  shouldUseEmpathetic,
  shouldUsePragmatic,
  shouldUseCelebratory,
  shouldUseComforting,
} from './SofiaFireflyPersonality';

// Accessibility System
export {
  useSofiaAccessibility,
  getAccessibilityAnnouncement,
  getHapticPattern,
  useFocusManagement,
  announceToScreenReader,
  useKeyboardNavigation,
  useHighContrast,
  useReducedMotion,
  createSkipLink,
} from './SofiaFireflyAccessibility';

// Performance System
export {
  useSofiaPerformance,
  useLazyAnimation,
  useOptimizedRender,
  PerformancePresets,
  getPerformanceInsights,
  type PerformanceConfig,
  type PerformanceMetrics,
} from './SofiaFireflyPerformance';

// Version and metadata
export const SOFIA_FIREFLY_VERSION = '2.0.0-web';
export const SOFIA_FIREFLY_FEATURES = [
  'Personality-driven interactions',
  'Context-aware behavior',
  'Web accessibility compliance',
  'Framer Motion animations',
  'Performance monitoring',
  'Adaptive learning',
  'Cross-browser compatibility',
  'Reduced motion support',
] as const;

export const SOFIA_FIREFLY_SYSTEM_REQUIREMENTS = {
  react: '>=18.0.0',
  'framer-motion': '>=11.0.0',
  typescript: '>=5.0.0',
  browsers: ['Chrome >= 90', 'Firefox >= 88', 'Safari >= 14', 'Edge >= 90'],
} as const;

// Re-export types for convenience
export type { SofiaFireflyProps } from './SofiaFirefly';
export type { SofiaFireflySVGProps } from './SofiaFireflySVG';
export type {
  PersonalityMode,
  ContextType,
  CommunicationStyle,
  PersonalityState,
  InteractionHistory,
} from './SofiaFireflyPersonality';
export type {
  HapticPattern,
  AccessibilityConfig,
} from './SofiaFireflyAccessibility';