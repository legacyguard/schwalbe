
import { createContext, useContext } from 'react';
import type { PersonalityMode } from '@/lib/sofia-types';
import { type AnimationConfig, AnimationSystem } from '@/lib/animation-system';

interface AnimationContextType {
  animationConfig: AnimationConfig;
  animationSystem: typeof AnimationSystem;
  personalityMode: PersonalityMode;
  shouldReduceMotion: boolean;
}

// Create the actual React context
const AnimationContext = createContext<AnimationContextType | null>(null);

/**
 * Hook to access animation context
 */
export const useAdaptiveAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (!context) {
    // Return default context instead of throwing error
    return {
      personalityMode: 'adaptive',
      animationConfig: { duration: 0.3, ease: 'easeOut', delay: 0 },
      shouldReduceMotion: false,
      animationSystem: AnimationSystem,
    };
  }
  return context;
};

/**
 * Hook for creating personality-aware animation variants
 */
export const useAnimationVariants = () => {
  const { personalityMode, shouldReduceMotion, animationSystem } =
    useAdaptiveAnimation();

  if (shouldReduceMotion) {
    return {
      pageTransition: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      staggerContainer: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      staggerItem: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
    };
  }

  return {
    pageTransition: animationSystem.createPageTransition(personalityMode),
    staggerContainer: animationSystem.createStaggerContainer(personalityMode),
    staggerItem: animationSystem.createStaggerItem(personalityMode),
    celebration: animationSystem.createCelebrationVariants(personalityMode),
  };
};
