
import React, { useContext } from 'react';
import type { Variants } from 'framer-motion';
// useSofia import removed as unused

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

const PERSONALITY_CONFIGS: PersonalityAnimationConfig = {
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

// Context for sharing animation state
interface MicroAnimationContextType {
  globalAnimationScale: number;
  reduceMotion: boolean;
}

const MicroAnimationContext = React.createContext<MicroAnimationContextType>({
  reduceMotion: false,
  globalAnimationScale: 1,
});

export const useMicroAnimation = () => useContext(MicroAnimationContext);

// Provider component for micro-animation system
interface MicroAnimationProviderProps {
  children: React.ReactNode;
  globalAnimationScale?: number;
  reduceMotion?: boolean;
}

export const MicroAnimationProvider: React.FC<MicroAnimationProviderProps> = ({
  children,
  reduceMotion = false,
  globalAnimationScale = 1,
}) => {
  return (
    <MicroAnimationContext.Provider
      value={{ reduceMotion, globalAnimationScale }}
    >
      {children}
    </MicroAnimationContext.Provider>
  );
};

// Utility hook for creating custom animated components
export const usePersonalityAnimation = () => {
  // TODO: Implement proper personality integration
  // const { personality } = useSofia();
  const { reduceMotion } = useMicroAnimation();

  return {
    config: PERSONALITY_CONFIGS.adaptive, // Default to adaptive for now
    reduceMotion,
    createVariants: (baseVariants: Variants): Variants => {
      if (reduceMotion) return {};

      const config = PERSONALITY_CONFIGS.adaptive; // Default to adaptive for now

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
