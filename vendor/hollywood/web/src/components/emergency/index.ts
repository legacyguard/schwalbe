
// Emergency System Components - Phase 3A: Family Shield System
// Complete emergency protection and guardian notification system

export { DeadMansSwitchManager } from './DeadMansSwitchManager';
export { EmergencyContactSystem } from './EmergencyContactSystem';
export { FamilyProtectionDashboard } from './FamilyProtectionDashboard';
export { GuardianNotificationCenter } from './GuardianNotificationCenter';

// Emergency system types and interfaces
export interface EmergencyStatus {
  guardiansCount: number;
  isActive: boolean;
  lastCheck: Date | null;
  notificationsCount: number;
  switchStatus: 'active' | 'inactive' | 'pending' | 'triggered';
}

export interface EmergencyConfig {
  enableHealthChecks: boolean;
  inactivityThreshold: number; // days
  notificationMethods: ('email' | 'push' | 'sms')[];
  personalityMode: 'adaptive' | 'empathetic' | 'pragmatic';
  requiredGuardians: number;
}

// Emergency system constants
export const EMERGENCY_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_TYPES = {
  ACTIVATION_REQUEST: 'activation_request',
  VERIFICATION_NEEDED: 'verification_needed',
  SHIELD_ACTIVATED: 'shield_activated',
  STATUS_UPDATE: 'status_update',
} as const;

export const DELIVERY_METHODS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  ALL: 'all',
} as const;

// Emergency system utilities
export const EmergencyUtils = {
  /**
   * Format time since last activity
   */
  formatTimeSince: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0)
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  /**
   * Get priority color class
   */
  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  /**
   * Get status icon
   */
  getStatusIcon: (status: string): string => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'pending':
        return '🟡';
      case 'triggered':
        return '🔴';
      case 'inactive':
        return '⚫';
      default:
        return '❓';
    }
  },

  /**
   * Generate emergency message based on personality
   */
  generateEmergencyMessage: (
    type: string,
    personalityMode: 'adaptive' | 'empathetic' | 'pragmatic',
    recipientName?: string
  ): { message: string; title: string } => {
    const name = recipientName || 'Guardian';

    const templates = {
      empathetic: {
        activation: {
          title: `💔 ${name}, We Need Your Loving Heart`,
          message: `Dear ${name}, our family needs your caring support right now. Something may have happened and we need trusted friends like you to help us through this. Please respond when you can - your love and care mean everything to us. 🙏💚`,
        },
        wellness: {
          title: `💚 Gentle Check-In from Your Loved Ones`,
          message: `Hello beautiful ${name}! Just reaching out with love to make sure you're doing well. Your wellbeing matters so much to us. No pressure - just let us know you're okay when you have a moment. Sending you warmth and care! 💚`,
        },
      },
      pragmatic: {
        activation: {
          title: `🚨 EMERGENCY ACTIVATION: ${name.toUpperCase()}`,
          message: `URGENT RESPONSE REQUIRED: Emergency detection system has triggered Family Shield Protocol. Guardian ${name} required to review situation immediately and authorize emergency procedures. Time-sensitive action needed.`,
        },
        wellness: {
          title: `📊 System Wellness Verification: ${name}`,
          message: `Guardian ${name}: Automated wellness check initiated. Please confirm operational status within 48 hours to maintain system continuity. This is part of routine family protection monitoring.`,
        },
      },
      adaptive: {
        activation: {
          title: `⚠️ Emergency Alert: Support Needed, ${name}`,
          message: `Hi ${name}, this is an emergency notification from your family's protection system. We need your help with a serious situation. Please respond as soon as possible to help us coordinate the right support. Thank you for being there for us.`,
        },
        wellness: {
          title: `🤝 Wellness Check: ${name}`,
          message: `Hi ${name}! Hope you're doing well. We'd appreciate a quick check-in to know you're okay. This helps keep our family protection network strong and connected. Thanks for being such an important part of our support system!`,
        },
      },
    };

    return (
      templates[personalityMode][
        type as keyof (typeof templates)[typeof personalityMode]
      ] || {
        title: 'Family Protection Notification',
        message: 'This is a notification from your family protection system.',
      }
    );
  },
};

// Export default emergency system info
export default {
  version: '3.0.0',
  phase: '3A',
  name: 'Family Shield System',
  description:
    "Complete emergency protection system with Dead Man's Switch and Guardian notifications",
  features: [
    "Dead Man's Switch with inactivity detection",
    'Emergency contact management',
    'Guardian notification system',
    'Personality-aware communications',
    'Health check monitoring',
    'Emergency activation protocols',
    'Real-time status dashboard',
    'Multi-channel notifications',
  ],
  components: [
    'DeadMansSwitchManager - Core emergency detection',
    'EmergencyContactSystem - Guardian management',
    'GuardianNotificationCenter - Communication hub',
    'FamilyProtectionDashboard - Central command center',
  ],
};
