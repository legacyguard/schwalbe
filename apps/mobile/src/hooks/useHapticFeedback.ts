import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

interface HapticFeedbackConfig {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

export const useHapticFeedback = () => {
  const [config, setConfig] = useState<HapticFeedbackConfig>({
    enabled: true, // Will be controlled by feature flags
    intensity: 'medium',
  });

  // Gentle success haptic for positive actions
  const successHaptic = async () => {
    if (!config.enabled) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Soft touch haptic for interactions
  const touchHaptic = async () => {
    if (!config.enabled) return;

    try {
      const impact = config.intensity === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : config.intensity === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium;

      await Haptics.impactAsync(impact);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Warning haptic for important notifications
  const warningHaptic = async () => {
    if (!config.enabled) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Error haptic for failures
  const errorHaptic = async () => {
    if (!config.enabled) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Selection haptic for UI selections
  const selectionHaptic = async () => {
    if (!config.enabled) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Sofia Firefly special haptic - gentle and magical
  const sofiaFireflyHaptic = async () => {
    if (!config.enabled) return;

    try {
      // Triple gentle tap for magical feeling
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 200);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  // Achievement unlock haptic - celebratory
  const achievementHaptic = async () => {
    if (!config.enabled) return;

    try {
      // Escalating celebration pattern
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 150);
      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  return {
    config,
    setConfig,
    successHaptic,
    touchHaptic,
    warningHaptic,
    errorHaptic,
    selectionHaptic,
    sofiaFireflyHaptic,
    achievementHaptic,
  };
};

export default useHapticFeedback;