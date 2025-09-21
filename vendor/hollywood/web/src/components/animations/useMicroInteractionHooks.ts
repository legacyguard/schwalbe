
import { useContext } from 'react';
import type { Variants } from 'framer-motion';
import { usePersonalityManager } from '../sofia/SofiaContextProvider';

// Micro-interaction animation configurations based on personality
interface PersonalityAnimationConfig {
  adaptive: {
    bounce: number;
    duration: number;
    ease: string;
    scale: number;
  };
  empathetic: {
    bounce: number;
    duration: number;
    ease: string;
    scale: number;
  };
  pragmatic: {
    bounce: number;
    duration: number;
    ease: string;
    scale: number;
  };
}

export const PERSONALITY_CONFIGS: PersonalityAnimationConfig = {
  empathetic: {
    duration: 0.4,
    ease: 'easeOut',
    scale: 1.05,
    bounce: 0.3,
  },
  pragmatic: {
    duration: 0.2,
    ease: 'easeInOut',
    scale: 1.02,
    bounce: 0,
  },
  adaptive: {
    duration: 0.3,
    ease: 'easeOut',
    scale: 1.03,
    bounce: 0.1,
  },
};

// This context is defined in useMicroInteraction.tsx
declare const MicroAnimationContext: {
  globalAnimationScale: number;
  reduceMotion: boolean;
};

export const useMicroAnimation = () => {
  const context = useContext(MicroAnimationContext as any);
  return context || { reduceMotion: false, globalAnimationScale: 1 };
};

// Utility hook for creating custom animated components
export const usePersonalityAnimation = () => {
  const personalityManager = usePersonalityManager();
  const { reduceMotion } = useMicroAnimation() as any;

  return {
    config: personalityManager
      ? PERSONALITY_CONFIGS[personalityManager.getPersonality().mode]
      : PERSONALITY_CONFIGS.adaptive,
    reduceMotion,
    createVariants: (baseVariants: Variants): Variants => {
      if (reduceMotion) return {};

      const config = personalityManager
        ? PERSONALITY_CONFIGS[personalityManager.getPersonality().mode]
        : PERSONALITY_CONFIGS.adaptive;

      // Apply personality-specific timing to variants
      return Object.entries(baseVariants).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value.transition) {
          acc[key] = {
            ...value,
            transition: {
              ...value.transition,
              duration: config.duration,
              ease: config.ease,
            },
          } as any;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Variants);
    },
  };
};
