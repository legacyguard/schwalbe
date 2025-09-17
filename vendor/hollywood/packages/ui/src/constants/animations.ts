
/**
 * Animation Constants
 * Centralized animation configurations for consistent UI interactions
 */

// Animation speeds
export const AnimationSpeed = {
  fast: 'fast',
  medium: 'medium',
  slow: 'slow',
} as const;

// Press animations for interactive elements
export const PressAnimation = {
  scale: {
    pressStyle: { scale: 0.98 },
    animation: 'medium' as const,
  },
  opacity: {
    pressStyle: { opacity: 0.7 },
    animation: 'fast' as const,
  },
  subtle: {
    pressStyle: { scale: 0.99, opacity: 0.95 },
    animation: 'fast' as const,
  },
} as const;

// Card animations
export const CardAnimation = {
  default: {
    animation: 'medium' as const,
    pressStyle: { scale: 0.98 },
    hoverStyle: { scale: 1.01 },
    enterStyle: { opacity: 0, scale: 0.95 },
    exitStyle: { opacity: 0, scale: 0.95 },
  },
  subtle: {
    animation: 'fast' as const,
    pressStyle: { scale: 0.99 },
    hoverStyle: { scale: 1.005 },
  },
  none: {
    animation: undefined,
    pressStyle: undefined,
    hoverStyle: undefined,
  },
} as const;

// List item animations for staggered effects
export const ListAnimation = {
  item: (index: number) => ({
    animation: 'medium' as const,
    enterStyle: {
      opacity: 0,
      y: 20,
    },
    exitStyle: {
      opacity: 0,
      y: -20,
    },
    animateOnly: ['opacity', 'transform'],
    delay: index * 50, // Stagger effect
  }),
};

// Page transition animations
export const PageAnimation = {
  fadeIn: {
    animation: 'medium' as const,
    enterStyle: { opacity: 0 },
    exitStyle: { opacity: 0 },
  },
  slideUp: {
    animation: 'medium' as const,
    enterStyle: { opacity: 0, y: 20 },
    exitStyle: { opacity: 0, y: -20 },
  },
  slideInRight: {
    animation: 'medium' as const,
    enterStyle: { opacity: 0, x: 20 },
    exitStyle: { opacity: 0, x: -20 },
  },
};

// Modal animations
export const ModalAnimation = {
  default: {
    animation: 'fast' as const,
    enterStyle: { opacity: 0, scale: 0.95 },
    exitStyle: { opacity: 0, scale: 0.95 },
  },
  slideUp: {
    animation: 'medium' as const,
    enterStyle: { opacity: 0, y: 100 },
    exitStyle: { opacity: 0, y: 100 },
  },
};

// Button animations
export const ButtonAnimation = {
  default: {
    animation: 'fast' as const,
    pressStyle: { scale: 0.97 },
    hoverStyle: { scale: 1.02 },
  },
  subtle: {
    animation: 'fast' as const,
    pressStyle: { opacity: 0.8 },
  },
};

// Skeleton loading animations
export const SkeletonAnimation = {
  pulse: {
    animation: 'slow' as const,
    enterStyle: { opacity: 0.5 },
    exitStyle: { opacity: 0.5 },
    animateOnly: ['opacity'],
    loop: true,
  },
};

// Export a hook for using animations with proper typing
export const useAnimations = () => ({
  card: CardAnimation,
  press: PressAnimation,
  list: ListAnimation,
  page: PageAnimation,
  modal: ModalAnimation,
  button: ButtonAnimation,
  skeleton: SkeletonAnimation,
  speed: AnimationSpeed,
});

export default {
  CardAnimation,
  PressAnimation,
  ListAnimation,
  PageAnimation,
  ModalAnimation,
  ButtonAnimation,
  SkeletonAnimation,
  AnimationSpeed,
};
