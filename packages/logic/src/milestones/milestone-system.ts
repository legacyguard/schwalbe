/**
 * Legacy Milestone System
 * Tracks and celebrates user progress with emotional family-focused messaging
 */

// Loosen dependency to avoid cross-package type issues
export type EnhancedMilestone = any;
export type MilestoneTriggerConditions = {
  documentsCount: number;
  familyMembersCount: number;
  emergencyContactsCount: number;
  willCompleted: boolean;
  trustScore: number;
  protectionLevel: string;
  daysSinceFirstDocument: number;
  hasInsurance: boolean;
  hasMedical: boolean;
  hasLegal: boolean;
  professionalReviewCompleted: boolean;
};

export interface FamilyContext {
  familyMembersCount: number;
  emergencyContactsCount: number;
  documentsCount: number;
  hasWill: boolean;
  hasInsurance: boolean;
  protectionLevel: string;
}

/**
 * Check for milestone achievements based on current state
 */
export function checkMilestoneAchievements(
  documents: any[],
  willData?: any,
  familyMembersCount: number = 0,
  emergencyContactsCount: number = 0,
  trustScore: number = 0,
  existingMilestones: EnhancedMilestone[] = []
): EnhancedMilestone[] {
  const conditions = buildTriggerConditions(
    documents,
    familyMembersCount,
    emergencyContactsCount,
    trustScore,
    willData
  );
  const newMilestones: EnhancedMilestone[] = [];
  const existingMilestoneIds = new Set(existingMilestones.map(m => m.id));

  // Define all possible milestones
  const potentialMilestones = getPotentialMilestones(conditions);

  // Check each milestone for achievement
  potentialMilestones.forEach(milestone => {
    if (
      !existingMilestoneIds.has(milestone.id) &&
      isMilestoneAchieved(milestone, conditions)
    ) {
      newMilestones.push(milestone);
    }
  });

  return newMilestones;
}

/**
 * Build trigger conditions from current user state
 */
function buildTriggerConditions(
  documents: any[],
  familyMembers: number,
  emergencyContacts: number,
  trustScore: number,
  willData?: any
): MilestoneTriggerConditions {
  // Calculate days since first document
  const firstDocDate =
    documents.length > 0
      ? Math.min(...documents.map(d => new Date(d.created_at).getTime()))
      : Date.now();
  const daysSinceFirst = Math.floor(
    (Date.now() - firstDocDate) / (1000 * 60 * 60 * 24)
  );

  // Check document categories
  const categories = new Set(documents.map(d => d.category).filter(Boolean));

  return {
    documentsCount: documents.length,
    familyMembersCount: familyMembers,
    emergencyContactsCount: emergencyContacts,
    willCompleted: !!willData?.beneficiaries?.length,
    trustScore,
    protectionLevel: getTrustScoreLevel(trustScore),
    daysSinceFirstDocument: Math.max(0, daysSinceFirst),
    hasInsurance: categories.has('insurance'),
    hasMedical: categories.has('medical'),
    hasLegal: categories.has('legal'),
    professionalReviewCompleted: trustScore >= 80, // Assuming professional review pushes trust score high
  };
}

/**
 * Get all potential milestones with their trigger conditions
 */
function getPotentialMilestones(
  conditions: MilestoneTriggerConditions
): EnhancedMilestone[] {
  const familyContext: FamilyContext = {
    familyMembersCount: conditions.familyMembersCount,
    emergencyContactsCount: conditions.emergencyContactsCount,
    documentsCount: conditions.documentsCount,
    hasWill: conditions.willCompleted,
    hasInsurance: conditions.hasInsurance,
    protectionLevel: conditions.protectionLevel,
  };

  return [
    // First Document Milestone
    {
      id: 'first_document_uploaded',
      type: 'first_document',
      title: 'First Stone Placed!',
      description:
        "You've started building your family's foundation of security",
      achievement_date: new Date().toISOString(),
      family_impact_message: generateFamilyImpactStatement(
        'first_document',
        familyContext
      ).primary_message,
      celebration_data: {
        title:
          "Great! You've placed the first stone in your family's mosaic of certainty",
        message: `${conditions.familyMembersCount || 'Your loved ones'} can now breathe easier knowing you're thinking of their future`,
        emoji: '🏗️',
        animation: 'firefly_trail',
      },
      badge_data: {
        icon: 'file-plus',
        color: 'bronze',
        rarity: 'common',
      },
      triggers_next_milestone: 'family_circle_started',
      family_benefit_score: 20,
      emotional_weight: 'high',
    },

    // Family Protection Started
    {
      id: 'family_circle_started',
      type: 'family_protected',
      title: 'Family Circle Started',
      description:
        'Your first family member or emergency contact has access to your protection',
      achievement_date: new Date().toISOString(),
      family_impact_message: `${conditions.familyMembersCount + conditions.emergencyContactsCount} people now have access to help your family in emergencies`,
      celebration_data: {
        title: 'Your Circle of Protection Begins! 👥',
        message:
          'Someone trusted can now help your family when they need it most',
        emoji: '🛡️',
        animation: 'garden_bloom',
      },
      badge_data: {
        icon: 'users',
        color: 'silver',
        rarity: 'common',
      },
      triggers_next_milestone: 'protection_foundation',
      family_benefit_score: 35,
      emotional_weight: 'medium',
    },

    // Protection Foundation (5+ documents)
    {
      id: 'protection_foundation',
      type: 'document_milestone',
      title: 'Protection Foundation Built',
      description:
        "Five essential documents secured - your family's safety net is taking shape",
      achievement_date: new Date().toISOString(),
      family_impact_message:
        'Your family now has access to multiple important documents in any emergency',
      celebration_data: {
        title: 'Strong Foundation Built! 🏗️',
        message:
          "Your family's protection foundation is solid with 5+ secured documents",
        emoji: '📁',
        animation: 'confetti',
      },
      badge_data: {
        icon: 'folder-check',
        color: 'blue',
        rarity: 'rare',
      },
      triggers_next_milestone: 'will_wisdom',
      family_benefit_score: 50,
      emotional_weight: 'medium',
    },

    // Will Completed
    {
      id: 'will_wisdom',
      type: 'will_complete',
      title: 'Will Wisdom Achieved',
      description:
        'Your wishes are crystal clear - your family knows exactly what you want',
      achievement_date: new Date().toISOString(),
      family_impact_message: generateFamilyImpactStatement(
        'will_completed',
        familyContext
      ).primary_message,
      celebration_data: {
        title: 'Your Legacy is Clear! 📋',
        message:
          "Your family won't have to guess your wishes - they'll know for certain",
        emoji: '⚖️',
        animation: 'certificate_glow',
      },
      badge_data: {
        icon: 'scroll',
        color: 'gold',
        rarity: 'epic',
      },
      triggers_next_milestone: 'premium_protection',
      family_benefit_score: 80,
      emotional_weight: 'epic',
    },

    // Premium Protection Level
    {
      id: 'premium_protection',
      type: 'protection_level',
      title: 'Premium Protection Achieved',
      description:
        'Your family enjoys top-tier security and comprehensive protection',
      achievement_date: new Date().toISOString(),
      family_impact_message: `${conditions.familyMembersCount || 'Your family'} now enjoy premium-level protection and peace of mind`,
      celebration_data: {
        title: 'Premium Protection Unlocked! 🏆',
        message: 'Your family is now protected at the highest level possible',
        emoji: '👑',
        animation: 'confetti',
      },
      badge_data: {
        icon: 'crown',
        color: 'gold',
        rarity: 'legendary',
      },
      family_benefit_score: 95,
      emotional_weight: 'epic',
    },

    // Trust Score Milestones
    {
      id: 'trust_score_75',
      type: 'trust_score_milestone',
      title: 'Trust Score: Strong Protection',
      description:
        'Achieved 75+ trust score - your family has strong protection in place',
      achievement_date: new Date().toISOString(),
      family_impact_message:
        'Your family protection system is now rated as strong and reliable',
      celebration_data: {
        title: 'Strong Protection Rating! 📊',
        message: 'Your trust score shows your family is well protected',
        emoji: '📈',
        animation: 'garden_bloom',
      },
      badge_data: {
        icon: 'trending-up',
        color: 'emerald',
        rarity: 'rare',
      },
      family_benefit_score: 75,
      emotional_weight: 'medium',
    },

    // Time-based milestone
    {
      id: 'protection_month_one',
      type: 'time_milestone',
      title: 'One Month of Protection',
      description:
        "Your family has been protected for 30 days - that's peace of mind growing stronger",
      achievement_date: new Date().toISOString(),
      family_impact_message:
        'Your family has enjoyed 30 days of security and protection',
      celebration_data: {
        title: '30 Days of Family Protection! 📅',
        message:
          'A full month of security - your preparation is paying dividends',
        emoji: '🌱',
        animation: 'garden_bloom',
      },
      badge_data: {
        icon: 'calendar',
        color: 'blue',
        rarity: 'rare',
      },
      family_benefit_score: 40,
      emotional_weight: 'medium',
    },

    // Comprehensive Protection
    {
      id: 'comprehensive_guardian',
      type: 'protection_level',
      title: 'Comprehensive Guardian',
      description:
        "Maximum protection achieved - you are the ultimate guardian of your family's future",
      achievement_date: new Date().toISOString(),
      family_impact_message:
        'Your family enjoys the highest possible level of protection and security',
      celebration_data: {
        title: 'Ultimate Protection Achieved! 🛡️',
        message: "You've become the ultimate guardian of your family's future",
        emoji: '🏆',
        animation: 'confetti',
      },
      badge_data: {
        icon: 'shield-check',
        color: 'gold',
        rarity: 'legendary',
      },
      family_benefit_score: 100,
      emotional_weight: 'epic',
    },
  ];
}

/**
 * Check if a specific milestone should be achieved
 */
function isMilestoneAchieved(
  milestone: EnhancedMilestone,
  conditions: MilestoneTriggerConditions
): boolean {
  switch (milestone.id) {
    case 'first_document_uploaded':
      return conditions.documentsCount >= 1;

    case 'family_circle_started':
      return (
        conditions.documentsCount >= 1 &&
        (conditions.familyMembersCount > 0 ||
          conditions.emergencyContactsCount > 0)
      );

    case 'protection_foundation':
      return conditions.documentsCount >= 5;

    case 'will_wisdom':
      return conditions.willCompleted;

    case 'premium_protection':
      return (
        conditions.protectionLevel === 'premium' ||
        conditions.protectionLevel === 'comprehensive'
      );

    case 'trust_score_75':
      return conditions.trustScore >= 75;

    case 'protection_month_one':
      return conditions.daysSinceFirstDocument >= 30;

    case 'comprehensive_guardian':
      return (
        conditions.protectionLevel === 'comprehensive' &&
        conditions.trustScore >= 90 &&
        conditions.willCompleted &&
        conditions.documentsCount >= 10
      );

    default:
      return false;
  }
}

/**
 * Get protection level from trust score
 */
function getTrustScoreLevel(
  score: number
): 'basic' | 'comprehensive' | 'premium' | 'standard' {
  if (score >= 90) return 'comprehensive';
  if (score >= 75) return 'premium';
  if (score >= 50) return 'standard';
  return 'basic';
}

/**
 * Generate family impact statement
 */
function generateFamilyImpactStatement(
  milestoneType: string,
  context: FamilyContext
): { primary_message: string; secondary_message?: string } {
  switch (milestoneType) {
    case 'first_document':
      return {
        primary_message: `Your family now has secure access to ${context.documentsCount} important document${context.documentsCount > 1 ? 's' : ''}. This creates immediate peace of mind.`,
        secondary_message: 'Every document uploaded strengthens your family\'s protection shield.',
      };

    case 'will_completed':
      return {
        primary_message: `${context.familyMembersCount || 'Your loved ones'} now know exactly what your wishes are. No guessing, no confusion, just clarity when they need it most.`,
        secondary_message: 'Your will eliminates uncertainty during emotional times.',
      };

    case 'family_protection':
      return {
        primary_message: `${context.familyMembersCount + context.emergencyContactsCount} people can now help your family access important information during emergencies.`,
        secondary_message: 'Your circle of protection gives your family multiple safety nets.',
      };

    default:
      return {
        primary_message: 'Your family protection has been enhanced with this achievement.',
      };
  }
}

/**
 * Calculate days family has been protected
 */
export function calculateFamilyProtectionDays(
  firstDocumentDate?: string
): number {
  if (!firstDocumentDate) return 0;

  const firstDoc = new Date(firstDocumentDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstDoc.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get next milestone suggestion
 */
export function getNextMilestoneSuggestion(
  conditions: MilestoneTriggerConditions,
  achievedMilestones: string[]
): null | {
  impact: string;
  milestone: string;
  suggestion: string;
  timeEstimate: string;
} {
  if (
    !achievedMilestones.includes('first_document_uploaded') &&
    conditions.documentsCount === 0
  ) {
    return {
      milestone: 'First Document',
      suggestion: 'Upload your first important document',
      timeEstimate: '2 minutes',
      impact: "Start your family's protection journey",
    };
  }

  if (
    !achievedMilestones.includes('family_circle_started') &&
    conditions.familyMembersCount === 0 &&
    conditions.emergencyContactsCount === 0
  ) {
    return {
      milestone: 'Family Circle',
      suggestion: 'Add your first emergency contact',
      timeEstimate: '30 seconds',
      impact: 'Give someone access to help your family immediately',
    };
  }

  if (
    !achievedMilestones.includes('will_wisdom') &&
    !conditions.willCompleted
  ) {
    return {
      milestone: 'Will Completion',
      suggestion: 'Complete your will',
      timeEstimate: '15 minutes',
      impact: 'Give your family absolute clarity about your wishes',
    };
  }

  if (
    !achievedMilestones.includes('protection_foundation') &&
    conditions.documentsCount < 5
  ) {
    return {
      milestone: 'Protection Foundation',
      suggestion: `Add ${5 - conditions.documentsCount} more documents`,
      timeEstimate: `${(5 - conditions.documentsCount) * 2} minutes`,
      impact: 'Build a solid foundation of family protection',
    };
  }

  return null;
}

/**
 * Get milestone progress percentage
 */
export function getMilestoneProgress(conditions: MilestoneTriggerConditions): {
  nextMilestone: string;
  overall: number;
  progressToNext: number;
} {
  let completedWeight = 0;

  // Weight different aspects
  if (conditions.documentsCount >= 1) completedWeight += 10;
  if (
    conditions.familyMembersCount > 0 ||
    conditions.emergencyContactsCount > 0
  )
    completedWeight += 15;
  if (conditions.documentsCount >= 5) completedWeight += 20;
  if (conditions.willCompleted) completedWeight += 25;
  if (conditions.hasInsurance) completedWeight += 10;
  if (conditions.hasMedical) completedWeight += 5;
  if (conditions.hasLegal) completedWeight += 5;
  if (conditions.trustScore >= 75) completedWeight += 10;

  const overallProgress = Math.min(100, completedWeight);

  // Determine next milestone
  let nextMilestone = 'First Document';
  let progressToNext = 0;

  if (conditions.documentsCount === 0) {
    nextMilestone = 'First Document';
    progressToNext = 0;
  } else if (
    conditions.familyMembersCount === 0 &&
    conditions.emergencyContactsCount === 0
  ) {
    nextMilestone = 'Family Circle';
    progressToNext = 25;
  } else if (!conditions.willCompleted) {
    nextMilestone = 'Will Completion';
    progressToNext = 50;
  } else if (conditions.documentsCount < 5) {
    nextMilestone = 'Protection Foundation';
    progressToNext = 75 + (conditions.documentsCount / 5) * 15;
  } else {
    nextMilestone = 'Premium Protection';
    progressToNext = 90 + (conditions.trustScore / 100) * 10;
  }

  return {
    overall: overallProgress,
    nextMilestone,
    progressToNext: Math.min(100, progressToNext),
  };
}