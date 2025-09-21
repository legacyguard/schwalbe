/**
 * SofiaFirefly Component System
 *
 * A comprehensive, accessible, and performant firefly component system
 * with personality-based behavior and context-aware interactions.
 *
 * Features:
 * - Multiple visual variants (floating, interactive, contextual)
 * - Personality system (empathetic, pragmatic, celebratory, comforting)
 * - Context-aware behavior and messaging
 * - Enhanced accessibility with screen reader support
 * - Performance optimizations with lazy loading
 * - Custom SVG design with personality-based styling
 * - Haptic feedback patterns
 * - Reduced motion support
 */

// Main Components - Direct exports to avoid TypeScript issues
export { SofiaFirefly } from '../SofiaFirefly';
export { SofiaFireflySVG } from '../SofiaFireflySVG';

// Animation System
export {
  useSofiaAnimations,
  createFloatingAnimation,
  createPulseAnimation,
  createWingAnimation,
  createTouchAnimation,
  EasingPresets,
} from '../SofiaFireflyAnimations';

// Personality System
export {
  useSofiaPersonality,
  PersonalityPresets,
  type PersonalityState,
  type PersonalityConfig,
  type InteractionHistory,
} from '../SofiaFireflyPersonality';

// Accessibility System
export {
  useSofiaAccessibility,
  getAccessibilityAnnouncement,
  getHapticPattern,
} from '../SofiaFireflyAccessibility';

// Performance System
export {
  useSofiaPerformance,
  getOptimizedAnimationConfig,
  useLazyAnimation,
} from '../SofiaFireflyPerformance';
// Re-export types for convenience
export type {
  PersonalityState as SofiaPersonalityState,
  PersonalityConfig as SofiaPersonalityConfig,
  InteractionHistory as SofiaInteractionHistory,
} from '../SofiaFireflyPersonality';

export type {
  AccessibilityConfig,
} from '../SofiaFireflyAccessibility';

export type {
  PerformanceConfig,
} from '../SofiaFireflyPerformance';

// Version and metadata
export const SOFIA_FIREFLY_VERSION = '2.0.0';
export const SOFIA_FIREFLY_FEATURES = [
  'Unified component architecture',
  'Custom SVG firefly design',
  'Personality-based behavior',
  'Context-aware messaging',
  'Enhanced accessibility',
  'Performance optimizations',
  'Haptic feedback patterns',
  'Reduced motion support',
  'TypeScript support',
  'Modular architecture',
] as const;

export const SOFIA_FIREFLY_SYSTEM_REQUIREMENTS = {
  react: '>=18.0.0',
  'react-native': '>=0.70.0',
  'react-native-svg': '>=13.0.0',
  tamagui: '>=1.0.0',
} as const;

// Usage examples and documentation
export const SOFIA_FIREFLY_USAGE_EXAMPLES = {
  basic: `
// Basic floating firefly
<SofiaFirefly
  size="medium"
  personality="empathetic"
  context="guiding"
/>
`,
  interactive: `
// Interactive firefly with touch tracking
<SofiaFirefly
  variant="interactive"
  size="large"
  personality="celebratory"
  onTouch={() => console.log('Firefly touched!')}
/>
`,
  contextual: `
// Context-aware firefly
<SofiaFirefly
  variant="contextual"
  context="celebrating"
  message="Congratulations on your progress!"
  personality="empathetic"
/>
`,
} as const;

// Default export removed due to TypeScript issues - use named exports instead