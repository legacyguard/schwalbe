import { useMemo } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityConfig {
  announceInteractions: boolean;
  announceStateChanges: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

export const useSofiaAccessibility = () => {
  const accessibilityConfig = useMemo((): AccessibilityConfig => {
    if (Platform.OS === 'web') {
      // Web accessibility detection
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      return {
        announceInteractions: true,
        announceStateChanges: true,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
        screenReader: false, // Would need additional detection
      };
    }

    // Mobile accessibility detection
    const announceInteractions = true;
    const announceStateChanges = true;
    const reducedMotion = false; // Would need to be detected from system settings
    const highContrast = false; // Would need to be detected from system settings
    const screenReader = false; // Would need AccessibilityInfo.isScreenReaderEnabled()

    return {
      announceInteractions,
      announceStateChanges,
      reducedMotion,
      highContrast,
      screenReader,
    };
  }, []);

  return accessibilityConfig;
};

export const getAccessibilityAnnouncement = (
  context: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting',
  personality: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting',
  action?: 'appeared' | 'interacted' | 'moved' | 'disappeared'
): string => {
  const announcements = {
    idle: {
      empathetic: {
        appeared: "Sofia is here to guide you with care and warmth",
        interacted: "Sofia responds with gentle understanding",
        moved: "Sofia moves gracefully to your touch",
        disappeared: "Sofia fades away peacefully",
      },
      pragmatic: {
        appeared: "Sofia is ready to assist you efficiently",
        interacted: "Sofia acknowledges your interaction",
        moved: "Sofia follows your guidance",
        disappeared: "Sofia completes the interaction",
      },
      celebratory: {
        appeared: "Sofia appears with excitement and energy",
        interacted: "Sofia celebrates your engagement",
        moved: "Sofia dances with joy at your touch",
        disappeared: "Sofia concludes with a flourish",
      },
      comforting: {
        appeared: "Sofia is here to provide calm and reassurance",
        interacted: "Sofia responds with gentle comfort",
        moved: "Sofia moves with soothing grace",
        disappeared: "Sofia fades with peaceful reassurance",
      },
    },
    guiding: {
      empathetic: {
        appeared: "Sofia appears to guide you through this step by step",
        interacted: "Sofia provides gentle guidance",
        moved: "Sofia moves to show you the way",
        disappeared: "Sofia completes the guidance",
      },
      pragmatic: {
        appeared: "Sofia is here to provide clear instructions",
        interacted: "Sofia confirms your progress",
        moved: "Sofia directs your attention",
        disappeared: "Sofia finishes the instruction",
      },
      celebratory: {
        appeared: "Sofia arrives to celebrate your progress",
        interacted: "Sofia cheers your achievements",
        moved: "Sofia moves with enthusiastic guidance",
        disappeared: "Sofia concludes with celebration",
      },
      comforting: {
        appeared: "Sofia is here to help you navigate calmly",
        interacted: "Sofia provides reassuring guidance",
        moved: "Sofia moves with gentle direction",
        disappeared: "Sofia completes the guidance peacefully",
      },
    },
    celebrating: {
      empathetic: {
        appeared: "Sofia appears to celebrate your wonderful progress",
        interacted: "Sofia shares in your joy",
        moved: "Sofia moves with celebratory grace",
        disappeared: "Sofia concludes the celebration warmly",
      },
      pragmatic: {
        appeared: "Sofia is here to acknowledge your achievement",
        interacted: "Sofia confirms your success",
        moved: "Sofia moves to highlight your progress",
        disappeared: "Sofia completes the acknowledgment",
      },
      celebratory: {
        appeared: "Sofia bursts in to celebrate your amazing work",
        interacted: "Sofia joins in your excitement",
        moved: "Sofia dances with celebration",
        disappeared: "Sofia ends with triumphant joy",
      },
      comforting: {
        appeared: "Sofia appears to gently celebrate your progress",
        interacted: "Sofia shares quiet joy in your success",
        moved: "Sofia moves with gentle celebration",
        disappeared: "Sofia concludes with warm pride",
      },
    },
    helping: {
      empathetic: {
        appeared: "Sofia is here to help you with care and support",
        interacted: "Sofia provides helpful assistance",
        moved: "Sofia moves to assist you better",
        disappeared: "Sofia completes the help session",
      },
      pragmatic: {
        appeared: "Sofia is ready to provide practical help",
        interacted: "Sofia offers efficient assistance",
        moved: "Sofia positions to help effectively",
        disappeared: "Sofia finishes providing help",
      },
      celebratory: {
        appeared: "Sofia arrives enthusiastically to help you",
        interacted: "Sofia helps with energetic support",
        moved: "Sofia moves dynamically to assist",
        disappeared: "Sofia concludes the help with energy",
      },
      comforting: {
        appeared: "Sofia is here to help you calmly and patiently",
        interacted: "Sofia provides gentle assistance",
        moved: "Sofia moves with reassuring help",
        disappeared: "Sofia completes the help peacefully",
      },
    },
    waiting: {
      empathetic: {
        appeared: "Sofia is here patiently, ready when you are",
        interacted: "Sofia responds with patient understanding",
        moved: "Sofia moves with gentle patience",
        disappeared: "Sofia waits quietly for next time",
      },
      pragmatic: {
        appeared: "Sofia is available when you need assistance",
        interacted: "Sofia provides patient help",
        moved: "Sofia moves calmly to assist",
        disappeared: "Sofia remains ready for later",
      },
      celebratory: {
        appeared: "Sofia waits excitedly for your next adventure",
        interacted: "Sofia helps with enthusiastic patience",
        moved: "Sofia moves with eager anticipation",
        disappeared: "Sofia looks forward to helping again",
      },
      comforting: {
        appeared: "Sofia is here calmly, with all the time you need",
        interacted: "Sofia provides patient, gentle help",
        moved: "Sofia moves with soothing patience",
        disappeared: "Sofia remains peacefully available",
      },
    },
  };

  const contextAnnouncements = announcements[context] || announcements.idle;
  const personalityAnnouncements = contextAnnouncements[personality] || contextAnnouncements.empathetic;
  return personalityAnnouncements[action || 'appeared'] || personalityAnnouncements.appeared;
};

export const getHapticPattern = (
  context: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting',
  personality: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting',
  intensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const patterns = {
    idle: {
      empathetic: { light: [50], medium: [100], strong: [150] },
      pragmatic: { light: [30], medium: [60], strong: [90] },
      celebratory: { light: [40, 20, 40], medium: [80, 40, 80], strong: [120, 60, 120] },
      comforting: { light: [25], medium: [50], strong: [75] },
    },
    guiding: {
      empathetic: { light: [60], medium: [120], strong: [180] },
      pragmatic: { light: [40], medium: [80], strong: [120] },
      celebratory: { light: [50, 25, 50], medium: [100, 50, 100], strong: [150, 75, 150] },
      comforting: { light: [30], medium: [60], strong: [90] },
    },
    celebrating: {
      empathetic: { light: [70, 30, 70], medium: [140, 60, 140], strong: [200, 80, 200] },
      pragmatic: { light: [50, 20, 50], medium: [100, 40, 100], strong: [150, 60, 150] },
      celebratory: { light: [60, 30, 60, 30, 60], medium: [120, 60, 120, 60, 120], strong: [180, 90, 180, 90, 180] },
      comforting: { light: [40, 20, 40], medium: [80, 40, 80], strong: [120, 60, 120] },
    },
    helping: {
      empathetic: { light: [55], medium: [110], strong: [165] },
      pragmatic: { light: [35], medium: [70], strong: [105] },
      celebratory: { light: [45, 22, 45], medium: [90, 45, 90], strong: [135, 67, 135] },
      comforting: { light: [28], medium: [55], strong: [82] },
    },
    waiting: {
      empathetic: { light: [20], medium: [40], strong: [60] },
      pragmatic: { light: [15], medium: [30], strong: [45] },
      celebratory: { light: [25, 12, 25], medium: [50, 25, 50], strong: [75, 37, 75] },
      comforting: { light: [18], medium: [35], strong: [52] },
    },
  };

  const contextPatterns = patterns[context] || patterns.idle;
  const personalityPatterns = contextPatterns[personality] || contextPatterns.empathetic;
  return personalityPatterns[intensity] || personalityPatterns.medium;
};

export default {
  useSofiaAccessibility,
  getAccessibilityAnnouncement,
  getHapticPattern,
};