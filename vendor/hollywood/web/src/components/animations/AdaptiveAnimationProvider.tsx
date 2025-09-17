
// Adaptive Animation Provider - Provides animation context based on Sofia's personality
// Centralizes animation behavior and adapts to user preferences

import React, { createContext, type ReactNode } from 'react';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import {
  type AnimationConfig,
  AnimationSystem,
  useAnimationConfig,
} from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';

interface AnimationContextType {
  animationConfig: AnimationConfig;
  animationSystem: typeof AnimationSystem;
  personalityMode: PersonalityMode;
  shouldReduceMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

interface AdaptiveAnimationProviderProps {
  children: ReactNode;
  forceMode?: PersonalityMode;
}

export const AdaptiveAnimationProvider: React.FC<
  AdaptiveAnimationProviderProps
> = ({ children, forceMode }) => {
  const personalityManager = usePersonalityManager();

  // Determine personality mode for animations
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const personalityMode =
    forceMode || (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  // Get animation configuration
  const animationConfig = useAnimationConfig(personalityMode);
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const contextValue: AnimationContextType = {
    personalityMode,
    animationConfig,
    shouldReduceMotion,
    animationSystem: AnimationSystem,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Hooks are now exported from useAdaptiveAnimation.ts

export default AdaptiveAnimationProvider;
