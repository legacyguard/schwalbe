
import { type Context, useCallback, useContext, useState } from 'react';
import type { FireflyContextValue, FireflyEventType } from './fireflyTypes';

// This context is defined in FireflyContext.tsx
declare const FireflyContext: Context<FireflyContextValue | null>;

export const useFirefly = (): FireflyContextValue => {
  const context = useContext(FireflyContext);
  if (!context) {
    throw new Error('useFirefly must be used within a FireflyProvider');
  }
  return context;
};

export const useFireflyGuidance = () => {
  const { guideToElement, isGuidingToTarget } = useFirefly();
  const [currentTarget, setCurrentTarget] = useState<null | string>(null);

  const guideToTarget = useCallback(
    (selector: string, duration: number = 3000) => {
      setCurrentTarget(selector);
      guideToElement(selector, duration);
    },
    [guideToElement]
  );

  return {
    guideToTarget,
    isGuidingToTarget,
    currentTarget,
  };
};

export const useFireflyCelebration = () => {
  const { celebrate, isCelebrating } = useFirefly();
  const [lastCelebration, setLastCelebration] =
    useState<FireflyEventType | null>(null);

  const triggerCelebration = useCallback(
    (event: FireflyEventType, duration: number = 2000) => {
      setLastCelebration(event);
      celebrate(event, duration);
    },
    [celebrate]
  );

  return {
    triggerCelebration,
    isCelebrating,
    lastCelebration,
  };
};
