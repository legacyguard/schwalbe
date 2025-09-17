
// User Preferences and Communication Style Types
// Extends the existing user preference system with Sofia's adaptive personality

import type { CommunicationStyle } from '@/lib/text-manager';

// Re-export CommunicationStyle for convenience
export type { CommunicationStyle } from '@/lib/text-manager';

export interface UserPreferences {
  // New communication preferences for Sofia's adaptive personality
  communication: {
    autoDetection: boolean; // Whether to automatically detect style from user input
    lastDetectionUpdate: null | string; // ISO timestamp of last auto-detection
    style: CommunicationStyle;
  };
  display: {
    compactMode: boolean;
    showTips: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    autoBackup: boolean;
    shareAnalytics: boolean;
  };
}

export const defaultUserPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    reminders: true,
  },
  privacy: {
    shareAnalytics: false,
    autoBackup: false,
  },
  display: {
    compactMode: false,
    showTips: true,
  },
  communication: {
    style: 'default',
    autoDetection: true,
    lastDetectionUpdate: null,
  },
};

// For extending Clerk user metadata (when syncing to cloud)
export interface ClerkUserMetadata {
  communicationAutoDetection?: boolean;
  communicationStyle?: CommunicationStyle;
  preferences?: Partial<UserPreferences>;
}
