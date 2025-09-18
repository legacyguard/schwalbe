/**
 * Emotional sync hooks exports
 */

export { useSofiaMessages } from './useSofiaMessages';
export { useHapticFeedback } from './useHapticFeedback';
export { useEmotionalState } from './useEmotionalState';

export type {
  UserProgress,
  SofiaMessageContext,
  SofiaMessagesState,
} from './useSofiaMessages';

export type {
  HapticType,
  HapticPattern,
} from './useHapticFeedback';

export type {
  EmotionalState,
  EmotionalAction,
} from './useEmotionalState';