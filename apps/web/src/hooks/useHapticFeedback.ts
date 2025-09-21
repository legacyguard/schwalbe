import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const triggerSuccess = useCallback(() => {
    // Web haptic feedback - could use vibration API if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const triggerEncouragement = useCallback(() => {
    // Gentle encouragement feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20]);
    }
  }, []);

  return {
    triggerSuccess,
    triggerEncouragement,
  };
};