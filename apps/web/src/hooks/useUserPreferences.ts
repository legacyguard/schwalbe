// Stub implementation for useUserPreferences hook
export const useUserPreferences = () => {
  return {
    preferences: {
      notifications: {
        maxNotifications: 3,
        preferredPosition: { x: 'right' as const, y: 'top' as const },
        quietHours: { start: 22, end: 8 },
        emotionalSensitivity: 'medium' as const,
        notificationStyle: 'toast' as const,
        autoRead: false,
        smartTiming: true
      }
    },
    updatePreferences: (prefs: any) => {}
  };
};