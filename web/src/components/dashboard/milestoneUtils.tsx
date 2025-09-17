
import { toast } from 'sonner';
import {
  getAdaptiveMilestoneText,
  type SerenityMilestone,
} from '@/lib/path-of-serenity';
import { defaultUserPreferences } from '@/types/user-preferences';
import type { PersonalityMode } from '@/lib/sofia-types';

export function showMilestoneRecognition(
  milestone: SerenityMilestone,
  userId?: string,
  personalityMode?: PersonalityMode
) {
  // Load user preferences for communication style
  let userPreferences = defaultUserPreferences;
  if (userId) {
    const savedPrefs = localStorage.getItem(`preferences_${userId}`);
    if (savedPrefs) {
      try {
        userPreferences = JSON.parse(savedPrefs);
      } catch (_error) {
        // console.error('Error loading user preferences for milestone:', _error);
      }
    }
  }

  // Get personality-aware styling and content
  const getPersonalityContent = (mode: PersonalityMode) => {
    switch (mode) {
      case 'empathetic':
        return {
          bgGradient:
            'from-green-50 to-emerald-50 dark:from-green-950/90 dark:to-emerald-950/90',
          borderColor: 'border-green-200/50 dark:border-green-800/50',
          iconBg: 'from-green-400 to-emerald-500',
          textPrimary: 'text-green-900 dark:text-green-100',
          textSecondary: 'text-green-700 dark:text-green-300',
          textTertiary: 'text-green-600 dark:text-green-400',
          celebrationText: '💚 New Milestone of Love Achieved:',
          duration: 5000,
        };
      case 'pragmatic':
        return {
          bgGradient:
            'from-blue-50 to-slate-50 dark:from-blue-950/90 dark:to-slate-950/90',
          borderColor: 'border-blue-200/50 dark:border-blue-800/50',
          iconBg: 'from-blue-500 to-slate-600',
          textPrimary: 'text-blue-900 dark:text-blue-100',
          textSecondary: 'text-blue-700 dark:text-blue-300',
          textTertiary: 'text-blue-600 dark:text-blue-400',
          celebrationText: '🛡️ System Milestone Completed:',
          duration: 3000,
        };
      default:
        return {
          bgGradient:
            'from-purple-50 to-pink-50 dark:from-purple-950/90 dark:to-pink-950/90',
          borderColor: 'border-purple-200/50 dark:border-purple-800/50',
          iconBg: 'from-purple-500 to-pink-500',
          textPrimary: 'text-purple-900 dark:text-purple-100',
          textSecondary: 'text-purple-700 dark:text-purple-300',
          textTertiary: 'text-purple-600 dark:text-purple-400',
          celebrationText: '🌟 Legacy Milestone Unlocked:',
          duration: 4000,
        };
    }
  };

  const personalityContent = getPersonalityContent(
    personalityMode || 'adaptive'
  );

  // Trigger firefly celebration
  // Note: This is called from outside React component, so we'll use a global event
  window.dispatchEvent(
    new CustomEvent('milestoneUnlocked', {
      detail: { milestone, userId },
    })
  );

  // Get adaptive text for the milestone
  const adaptiveCompletedDescription = getAdaptiveMilestoneText(
    milestone,
    'completedDescription',
    userId,
    userPreferences.communication.style
  );

  // Show toast notification
  toast.success(
    `${personalityContent.celebrationText} ${(milestone as any).title || 'Milestone'}`,
    {
      description: adaptiveCompletedDescription,
      duration: personalityContent.duration,
      className: `bg-gradient-to-r ${personalityContent.bgGradient} border ${personalityContent.borderColor}`,
    }
  );

  return {
    milestone,
    userId,
    personalityMode,
    userPreferences,
    personalityContent,
    adaptiveCompletedDescription,
  };
}
