/**
 * Accessibility Configuration for Emotional Sync
 * Ensures WCAG compliance and screen reader support
 */

export interface AccessibilityLabels {
  // Sofia Firefly
  sofiaFirefly: string;
  sofiaFireflyHint: string;

  // Emotional Messages
  emotionalMessageCard: string;
  emotionalMessageDismiss: string;

  // Achievements
  achievementCelebration: string;
  achievementShare: string;
  achievementContinue: string;

  // Daily Check-in
  dailyCheckInCard: string;
  moodSelection: string;
  protectionScale: string;
  prioritySelection: string;

  // Family Photos
  familyPhotoGrid: string;
  addPhotoButton: string;
  removePhotoButton: string;
}

export const accessibilityLabels: AccessibilityLabels = {
  // Sofia Firefly
  sofiaFirefly: 'Sofia, your AI assistant',
  sofiaFireflyHint: 'Touch and move around the screen to interact with Sofia',

  // Emotional Messages
  emotionalMessageCard: 'Emotional guidance message',
  emotionalMessageDismiss: 'Dismiss message',

  // Achievements
  achievementCelebration: 'Achievement unlocked celebration',
  achievementShare: 'Share achievement',
  achievementContinue: 'Continue',

  // Daily Check-in
  dailyCheckInCard: 'Daily emotional check-in',
  moodSelection: 'Select your current mood',
  protectionScale: 'Rate how protected your family feels on a scale of 1 to 10',
  prioritySelection: 'Choose what would give you most peace of mind today',

  // Family Photos
  familyPhotoGrid: 'Family photos for motivation',
  addPhotoButton: 'Add family photo',
  removePhotoButton: 'Remove photo',
};

export const getAccessibilityProps = (key: keyof AccessibilityLabels, value?: string | number) => {
  const baseLabel = accessibilityLabels[key];

  return {
    accessibilityLabel: value ? `${baseLabel}: ${value}` : baseLabel,
    accessibilityRole: getAccessibilityRole(key),
    accessible: true,
  };
};

const getAccessibilityRole = (key: keyof AccessibilityLabels): string => {
  if (key.includes('Button')) return 'button';
  if (key.includes('Selection')) return 'radiogroup';
  if (key.includes('Scale')) return 'slider';
  if (key.includes('Card')) return 'text';
  return 'none';
};

// Screen reader descriptions for emotional states
export const emotionalStateDescriptions = {
  confident: 'Feeling confident and secure about family protection',
  worried: 'Feeling some concerns about family security',
  motivated: 'Feeling motivated to take protective actions',
  overwhelmed: 'Feeling overwhelmed and needing support',
  neutral: 'Feeling steady and calm about current situation',
};

// Reduced motion preferences
export const shouldReduceMotion = (): boolean => {
  // In a real implementation, this would check system accessibility settings
  // For now, we'll use a simple environment check
  return process.env.EXPO_PUBLIC_REDUCE_MOTION === '1';
};

// High contrast support
export const shouldUseHighContrast = (): boolean => {
  // Similar to reduced motion, this would check system settings
  return process.env.EXPO_PUBLIC_HIGH_CONTRAST === '1';
};