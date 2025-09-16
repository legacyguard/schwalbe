import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import type {
  FireflyEventType,
  FireflyState,
  FireflyContextValue,
  FireflyProviderProps,
  CommunicationStyle,
} from '@schwalbe/shared/types/animations';

const FireflyContext = createContext<FireflyContextValue | undefined>(
  undefined
);

export const useFirefly = (): FireflyContextValue => {
  const context = useContext(FireflyContext);
  if (!context) {
    throw new Error('useFirefly must be used within a FireflyProvider');
  }
  return context;
};

export const FireflyProvider: React.FC<FireflyProviderProps> = ({
  children,
  initialMode,
  autoShow = true,
}) => {
  const [state, setState] = useState<FireflyState>({
    isVisible: autoShow,
    mode: initialMode,
    targetElement: undefined,
    celebrateEvent: null,
    interactionCount: 0,
  });

  // Show/hide firefly
  const showFirefly = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hideFirefly = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      targetElement: undefined,
      celebrateEvent: null,
    }));
  }, []);

  // Set communication mode
  const setMode = useCallback((mode: CommunicationStyle) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  // Guide to specific element
  const guideToElement = useCallback(
    (selector: string, duration: number = 3000) => {
      setState(prev => ({
        ...prev,
        targetElement: selector,
        celebrateEvent: null,
        isVisible: true,
      }));

      // Clear guidance after duration
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, targetElement: undefined }));
      }, duration);

      return () => clearTimeout(timeout);
    },
    []
  );

  // Trigger celebration
  const celebrate = useCallback(
    (event: FireflyEventType, duration: number = 4000) => {
      if (!event) return;

      setState(prev => ({
        ...prev,
        celebrateEvent: event,
        targetElement: undefined,
        isVisible: true,
      }));

      // Clear celebration after duration
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, celebrateEvent: null }));
      }, duration);

      return () => clearTimeout(timeout);
    },
    []
  );

  // Handle firefly interaction
  const onInteraction = useCallback(() => {
    setState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
    }));
  }, []);

  // Computed properties
  const isGuidingToTarget = Boolean(state.targetElement);
  const isCelebrating = Boolean(state.celebrateEvent);

  const contextValue: FireflyContextValue = {
    state,
    showFirefly,
    hideFirefly,
    setMode,
    guideToElement,
    celebrate,
    onInteraction,
    isGuidingToTarget,
    isCelebrating,
  };

  return (
    <FireflyContext.Provider value={contextValue}>
      {children}
    </FireflyContext.Provider>
  );
};

// Convenience hooks for specific events
export const useFireflyGuidance = () => {
  const { guideToElement, state } = useFirefly();

  return {
    guideToUpload: () => guideToElement('#document-upload-button', 4000),
    guideToGuardians: () => guideToElement('#guardians-section', 4000),
    guideToSettings: () => guideToElement('#settings-button', 3000),
    guideToMilestones: () => guideToElement('#milestones-section', 4000),
    isGuiding: Boolean(state.targetElement),
  };
};

export const useFireflyCelebration = () => {
  const { celebrate, state } = useFirefly();

  return {
    celebrateMilestone: () => celebrate('milestone', 5000),
    celebrateUpload: () => celebrate('document_upload', 3000),
    celebrateGuardian: () => celebrate('guardian_added', 4000),
    celebrateWill: () => celebrate('will_completed', 6000),
    celebrateTimeCapsule: () => celebrate('time_capsule_created', 4000),
    celebrateEmergency: () => celebrate('emergency_activated', 8000),
    isCelebrating: Boolean(state.celebrateEvent),
    currentCelebration: state.celebrateEvent,
  };
};

export default FireflyProvider;