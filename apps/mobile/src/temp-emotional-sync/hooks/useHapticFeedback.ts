/**
 * Haptic Feedback Hook for Emotional Moments
 * Based on mobile-sync-proposal.md specifications
 */

import { useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'encouragement' | 'success' | 'comfort' | 'achievement' | 'guidance' | 'error';

export interface HapticPattern {
  type: 'impact' | 'notification' | 'selection';
  style?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
  pattern?: number[];
  duration?: number;
}

export const useHapticFeedback = () => {
  // Haptic patterns for different emotional moments
  const hapticPatterns: Record<HapticType, HapticPattern> = {
    // Gentle encouragement (Sofia suggestion appears)
    encouragement: {
      type: 'impact',
      style: 'light',
      pattern: [10], // Single gentle tap
      duration: 10,
    },

    // Success celebration (document upload complete)
    success: {
      type: 'notification',
      style: 'medium',
      pattern: [20, 10, 20], // Celebratory pattern
      duration: 50,
    },

    // Comfort during errors
    comfort: {
      type: 'impact',
      style: 'soft',
      pattern: [5, 50, 5], // Gentle, slow pattern
      duration: 60,
    },

    // Achievement unlock (milestone reached)
    achievement: {
      type: 'notification',
      style: 'heavy',
      pattern: [30, 20, 30, 20, 30], // Building celebration
      duration: 130,
    },

    // Guidance pulse (drawing attention)
    guidance: {
      type: 'selection',
      pattern: [15], // Subtle attention
      duration: 15,
    },

    // Error feedback
    error: {
      type: 'notification',
      style: 'heavy',
      pattern: [50], // Single strong pulse
      duration: 50,
    },
  };

  // Trigger haptic feedback using Expo Haptics (preferred) or fallback to Vibration
  const triggerHaptic = useCallback(async (hapticType: HapticType, options?: { disabled?: boolean }) => {
    if (options?.disabled) return;

    const pattern = hapticPatterns[hapticType];

    try {
      // Use Expo Haptics for better control (iOS and modern Android)
      if (Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 23)) {
        switch (pattern.type) {
          case 'impact':
            await Haptics.impactAsync(
              pattern.style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
              pattern.style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
              Haptics.ImpactFeedbackStyle.Heavy
            );
            break;

          case 'notification':
            await Haptics.notificationAsync(
              pattern.style === 'light' ? Haptics.NotificationFeedbackType.Warning :
              pattern.style === 'medium' ? Haptics.NotificationFeedbackType.Success :
              Haptics.NotificationFeedbackType.Error
            );
            break;

          case 'selection':
            await Haptics.selectionAsync();
            break;
        }
      } else {
        // Fallback to basic vibration for older devices
        if (pattern.pattern && pattern.pattern.length > 1) {
          Vibration.vibrate(pattern.pattern);
        } else {
          Vibration.vibrate(pattern.duration || 50);
        }
      }
    } catch (error) {
      // Fallback to basic vibration if Expo Haptics fails
      console.warn('Haptic feedback failed, using basic vibration:', error);
      if (pattern.pattern && pattern.pattern.length > 1) {
        Vibration.vibrate(pattern.pattern);
      } else {
        Vibration.vibrate(pattern.duration || 50);
      }
    }
  }, []);

  // Specific haptic methods for common use cases
  const triggerEncouragement = useCallback((disabled?: boolean) => {
    triggerHaptic('encouragement', { disabled });
  }, [triggerHaptic]);

  const triggerSuccess = useCallback((disabled?: boolean) => {
    triggerHaptic('success', { disabled });
  }, [triggerHaptic]);

  const triggerComfort = useCallback((disabled?: boolean) => {
    triggerHaptic('comfort', { disabled });
  }, [triggerHaptic]);

  const triggerAchievement = useCallback((disabled?: boolean) => {
    triggerHaptic('achievement', { disabled });
  }, [triggerHaptic]);

  const triggerGuidance = useCallback((disabled?: boolean) => {
    triggerHaptic('guidance', { disabled });
  }, [triggerHaptic]);

  const triggerError = useCallback((disabled?: boolean) => {
    triggerHaptic('error', { disabled });
  }, [triggerHaptic]);

  // Sequence of haptics for complex emotions
  const triggerSequence = useCallback(async (sequence: HapticType[], delay = 100, disabled?: boolean) => {
    if (disabled) return;

    for (let i = 0; i < sequence.length; i++) {
      await triggerHaptic(sequence[i]);
      if (i < sequence.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [triggerHaptic]);

  // Cancel any ongoing vibrations
  const cancelHaptics = useCallback(() => {
    Vibration.cancel();
  }, []);

  return {
    // Generic method
    triggerHaptic,

    // Specific emotional haptics
    triggerEncouragement,
    triggerSuccess,
    triggerComfort,
    triggerAchievement,
    triggerGuidance,
    triggerError,

    // Advanced features
    triggerSequence,
    cancelHaptics,

    // Available patterns for reference
    hapticPatterns,
  };
};