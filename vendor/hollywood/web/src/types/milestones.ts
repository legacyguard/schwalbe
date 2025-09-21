
/**
 * Legacy Milestone System Types
 * Interfaces for tracking legacy planning progress and celebrating achievements
 */

export interface LegacyMilestone {
  category:
    | 'family'
    | 'foundation'
    | 'maintenance'
    | 'mastery'
    | 'professional'
    | 'protection';
  // Celebration and messaging
  celebration: {
    celebrationColor: string;
    celebrationIcon: string;
    celebrationText: string;
    emotionalFraming: string;
    familyImpactMessage: string;
    shouldShow: boolean;
  };
  completedAt?: string;
  // Timestamps
  createdAt: string;
  // Milestone criteria
  criteria: {
    currentValue: number | string;
    isComplete: boolean;
    threshold: number | string;
    type:
      | 'action_completed'
      | 'document_count'
      | 'family_members'
      | 'protection_percentage'
      | 'review_score'
      | 'time_based';
  };
  description: string;

  // Family impact data
  family_impact_message?: string;

  familyImpact?: {
    affectedMembers: string[];
    emotionalBenefit?: string;
    riskReduction?: number;
  };

  id: string;

  lastCheckedAt?: string;
  metadata: {
    difficulty: 'easy' | 'epic' | 'hard' | 'medium';
    estimatedTime: string; // e.g., "5 minutes", "1 hour"
    priority: 'critical' | 'high' | 'low' | 'medium';
    tags: string[];
    version: string; // for milestone definition versioning
  };

  // Progress tracking
  progress: {
    nextAction?: string;
    nextActionUrl?: string;
    percentage: number;
    stepsCompleted: number;
    totalSteps: number;
  };

  // Rewards and benefits
  rewards: {
    badges?: string[]; // earned badges
    features?: string[]; // unlocked features
    insights?: string[]; // unlocked insights
    protectionIncrease?: number; // percentage
    timeSaved?: number; // hours
  };

  title: string;

  // Timing and triggers
  triggers: {
    autoCheck: boolean; // Should this be checked automatically
    checkFrequency?: 'daily' | 'immediate' | 'monthly' | 'weekly';
    conditions: string[]; // What conditions trigger this milestone
    dependencies?: string[]; // Other milestones that must be completed first
  };
  type:
    | 'annual_update'
    | 'family_complete'
    | 'first_document'
    | 'legacy_complete'
    | 'professional_review'
    | 'protection_threshold';
  updatedAt: string;
  userId: string;
}

export interface MilestoneProgress {
  // Category progress
  categoryProgress: {
    [key in LegacyMilestone['category']]: {
      completed: number;
      percentage: number;
      total: number;
    };
  };
  completedMilestones: number;
  currentLevel: MilestoneLevel;
  nextLevel: MilestoneLevel | null;
  overallProgress: number; // 0-100
  pendingCelebrations: LegacyMilestone[];

  // Recent achievements
  recentAchievements: LegacyMilestone[];

  // Next recommended actions
  recommendations: {
    estimatedImpact: string;
    milestone: LegacyMilestone;
    reason: string;
  }[];
  totalMilestones: number;

  userId: string;
}

export interface MilestoneLevel {
  benefits: {
    features: string[];
    protectionLevel: string;
    statusMessage: string;
    title: string;
  };
  celebrationMessage: string;
  description: string;
  level: number;
  name: string;
  progressThreshold: number; // percentage needed to reach this level
  requirements: {
    categoriesRequired?: LegacyMilestone['category'][];
    milestonesRequired: number;
    specificMilestones?: string[];
  };
}

export interface MilestoneTriggerEvent {
  actionType?: string;
  documentId?: string;
  familyMemberId?: string;
  metadata?: Record<string, any>;
  reviewId?: string;
  timestamp: string;
  type:
    | 'document_updated'
    | 'document_uploaded'
    | 'family_member_added'
    | 'review_completed'
    | 'time_passed'
    | 'user_action';
  userId: string;
}

export interface MilestoneCelebrationConfig {
  customMessage?: string;
  duration: number; // milliseconds
  playSound: boolean;
  shareOptions: {
    allowSharing: boolean;
    platforms: ('email' | 'family' | 'social')[];
    template: string;
  };
  showAnimation: boolean;
  showModal: boolean;
  style: 'enthusiastic' | 'moderate' | 'subtle';
}

export interface MilestoneAnalytics {
  averageCompletionTime: number; // hours
  averageGapBetweenMilestones: number; // days

  // Behavioral insights
  celebrationEngagement: number; // 0-1
  completionRate: number; // percentage
  completionTrend: 'declining' | 'improving' | 'stable';

  featuresUnlocked: string[];
  // Completion metrics
  milestonesCompleted: number;
  // Progress patterns
  mostActiveCategory: LegacyMilestone['category'];

  preferredDifficulty: LegacyMilestone['metadata']['difficulty'];
  recommendationFollowRate: number; // 0-1
  timeframe: {
    end: string;
    start: string;
  };

  // Impact metrics
  totalProtectionIncrease: number;
  totalTimeSaved: number;
  userId: string;
}

export interface MilestoneTemplate {
  category: LegacyMilestone['category'];
  celebration: LegacyMilestone['celebration'];
  criteria: Omit<LegacyMilestone['criteria'], 'currentValue' | 'isComplete'>;
  description: string;
  id: string;
  metadata: LegacyMilestone['metadata'];
  name: string;
  rewards: LegacyMilestone['rewards'];
  triggers: LegacyMilestone['triggers'];
}

// Predefined milestone levels
export const MILESTONE_LEVELS: MilestoneLevel[] = [
  {
    level: 1,
    name: 'Guardian Awakening',
    description: "You've begun your journey as a Guardian of Memories",
    requirements: {
      milestonesRequired: 1,
      specificMilestones: ['first_document'],
    },
    benefits: {
      title: 'Legacy Foundation',
      features: [
        'Basic document upload',
        'Simple encryption',
        'Family notifications',
      ],
      protectionLevel: '25%',
      statusMessage: 'Your first stone is placed in the family mosaic',
    },
    celebrationMessage:
      "Welcome, Guardian! Your family's story begins with this first precious memory.",
    progressThreshold: 0,
  },
  {
    level: 2,
    name: 'Memory Keeper',
    description: "You're actively building your family's protective foundation",
    requirements: {
      milestonesRequired: 3,
      categoriesRequired: ['foundation', 'protection'],
    },
    benefits: {
      title: 'Enhanced Security',
      features: ['Document templates', 'Basic insights', 'Progress tracking'],
      protectionLevel: '50%',
      statusMessage: "Your family's foundation grows stronger",
    },
    celebrationMessage:
      "You're becoming a true Memory Keeper! Your dedication protects those you love.",
    progressThreshold: 20,
  },
  {
    level: 3,
    name: 'Legacy Architect',
    description: "You're designing comprehensive protection for your family",
    requirements: {
      milestonesRequired: 6,
      categoriesRequired: ['foundation', 'protection', 'family'],
    },
    benefits: {
      title: 'Comprehensive Planning',
      features: [
        'Advanced insights',
        'Family collaboration',
        'Professional network access',
      ],
      protectionLevel: '75%',
      statusMessage: 'Your legacy architecture takes beautiful shape',
    },
    celebrationMessage:
      "Magnificent work, Architect! Your family's future is secure in your careful planning.",
    progressThreshold: 50,
  },
  {
    level: 4,
    name: 'Heritage Guardian',
    description: "You've achieved mastery in legacy protection and family care",
    requirements: {
      milestonesRequired: 10,
      categoriesRequired: [
        'foundation',
        'protection',
        'family',
        'professional',
        'maintenance',
      ],
    },
    benefits: {
      title: 'Master Protection',
      features: [
        'All premium features',
        'Priority support',
        'Advanced analytics',
      ],
      protectionLevel: '95%',
      statusMessage: "You've mastered the art of legacy protection",
    },
    celebrationMessage:
      "You are now a Heritage Guardian! Your family's story will inspire generations.",
    progressThreshold: 90,
  },
];

export const DEFAULT_MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  {
    id: 'first_document',
    name: 'First Document Upload',
    description:
      'Upload your first important document to begin your legacy journey',
    category: 'foundation',
    triggers: {
      conditions: ['document_uploaded'],
      autoCheck: true,
      checkFrequency: 'immediate',
    },
    criteria: {
      type: 'document_count',
      threshold: 1,
    },
    celebration: {
      shouldShow: true,
      celebrationText:
        "Congratulations! You've planted the first seed in your Garden of Legacy!",
      familyImpactMessage:
        'Your family now has secure access to this important document',
      emotionalFraming:
        "This moment marks the beginning of your family's protected future",
      celebrationIcon: '🌱',
      celebrationColor: 'emerald',
    },
    rewards: {
      protectionIncrease: 15,
      timeSaved: 2,
      features: ['basic_insights'],
      badges: ['first_steps'],
    },
    metadata: {
      difficulty: 'easy',
      estimatedTime: '5 minutes',
      priority: 'high',
      tags: ['beginner', 'foundation', 'important'],
      version: '1.0',
    },
  },
];
