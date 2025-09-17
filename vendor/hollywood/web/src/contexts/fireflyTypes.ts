
import type React from 'react';
import type { CommunicationStyle } from '@/types/user-preferences';

export type FireflyEventType =
  | 'achievement_unlocked'
  | 'challenge_started'
  | 'document_upload'
  | 'emergency_activated'
  | 'guardian_added'
  | 'milestone'
  | 'time_capsule_created'
  | 'will_completed'
  | null;

export interface FireflyState {
  celebrateEvent?: FireflyEventType;
  interactionCount: number;
  isVisible: boolean;
  mode?: CommunicationStyle;
  targetElement?: string;
}

export interface FireflyContextValue {
  celebrate: (event: FireflyEventType, duration?: number) => void;

  guideToElement: (selector: string, duration?: number) => void;
  hideFirefly: () => void;
  isCelebrating: boolean;
  // Utilities
  isGuidingToTarget: boolean;
  onInteraction: () => void;
  setMode: (mode: CommunicationStyle) => void;

  // Actions
  showFirefly: () => void;
  // State
  state: FireflyState;
}

export interface FireflyProviderProps {
  autoShow?: boolean;
  children: React.ReactNode;
  initialMode?: CommunicationStyle;
}
