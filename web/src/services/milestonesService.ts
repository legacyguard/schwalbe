
/**
 * Legacy Milestone System Service
 * Handles milestone tracking, celebrations, and progress monitoring
 */

import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_MILESTONE_TEMPLATES,
  type LegacyMilestone,
  MILESTONE_LEVELS,
  type MilestoneAnalytics,
  type MilestoneLevel,
  type MilestoneProgress,
  type MilestoneTriggerEvent,
} from '@/types/milestones';

export class MilestonesService {
  private readonly MILESTONE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private milestoneCache = new Map<
    string,
    { data: LegacyMilestone[]; timestamp: number }
  >();

  /**
   * Initialize milestones for a new user
   */
  async initializeUserMilestones(userId: string): Promise<void> {
    try {
      const milestones = await this.createMilestonesFromTemplates(userId);

      // Map LegacyMilestone to database schema
      const dbMilestones = milestones.map(milestone => ({
        id: milestone.id,
        user_id: userId,
        category: milestone.category || 'foundation',
        title: milestone.title,
        description: milestone.description,
        type: 'first_document' as const, // Use valid enum value
        criteria_type: 'action_completed' as const,
        criteria_threshold: '1',
        criteria_current_value: '0',
        criteria_is_complete: false,
        completed_at: null,
        celebration_text: milestone.celebration?.celebrationText || null,
        celebration_family_impact_message: milestone.celebration?.familyImpactMessage || null,
        celebration_color: milestone.celebration?.celebrationColor || null,
        celebration_emotional_framing: milestone.celebration?.emotionalFraming || null,
        celebration_icon: milestone.celebration?.celebrationIcon || null,
        celebration_should_show: false,
        level: 'foundation' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('legacy_milestones')
        .insert(dbMilestones);

      if (error) throw error;

      // Initialize milestone progress tracking
      await this.updateMilestoneProgress(userId);
    } catch (error) {
      console.error('Failed to initialize user milestones:', error);
      throw error;
    }
  }

  /**
   * Check and update milestones based on trigger events
   */
  async checkMilestones(
    event: MilestoneTriggerEvent
  ): Promise<LegacyMilestone[]> {
    try {
      const milestones = await this.getUserMilestones(event.userId);
      const completedMilestones: LegacyMilestone[] = [];

      for (const milestone of milestones) {
        if (milestone.completedAt) continue; // Already completed

        if (await this.shouldCheckMilestone(milestone, event)) {
          const updatedMilestone = await this.evaluateMilestone(
            milestone,
            event.userId
          );

          if (
            updatedMilestone.criteria.isComplete &&
            !milestone.criteria.isComplete
          ) {
            // Milestone just completed!
            updatedMilestone.completedAt = new Date().toISOString();
            updatedMilestone.celebration.shouldShow = true;

            await this.saveMilestone(updatedMilestone);
            completedMilestones.push(updatedMilestone);

            // Trigger celebration
            await this.triggerMilestoneCelebration(updatedMilestone);
          } else if (
            updatedMilestone.progress.percentage !==
            milestone.progress.percentage
          ) {
            // Progress updated
            await this.saveMilestone(updatedMilestone);
          }
        }
      }

      // Update overall progress
      if (completedMilestones.length > 0) {
        await this.updateMilestoneProgress(event.userId);
      }

      return completedMilestones;
    } catch (error) {
      console.error('Milestone check failed:', error);
      throw error;
    }
  }

  /**
   * Get all milestones for a user
   */
  async getUserMilestones(userId: string): Promise<LegacyMilestone[]> {
    const cacheKey = `milestones_${userId}`;
    const cached = this.milestoneCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.MILESTONE_CACHE_TTL) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('legacy_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map database results to LegacyMilestone interface using the LegacyMilestone database type
      const mappedMilestones = (data || []).map((dbMilestone: any) => ({
        id: dbMilestone.id,
        userId: dbMilestone.user_id,
        title: dbMilestone.title,
        description: dbMilestone.description,
        category: dbMilestone.category,
        type: dbMilestone.type,
        criteria: {
          type: dbMilestone.criteria_type,
          threshold: dbMilestone.criteria_threshold,
          currentValue: dbMilestone.criteria_current_value,
          isComplete: dbMilestone.criteria_is_complete || false,
        },
        celebration: {
          shouldShow: dbMilestone.celebration_should_show || false,
          celebrationText: dbMilestone.celebration_text || 'Milestone Completed!',
          celebrationIcon: dbMilestone.celebration_icon || '🎉',
          celebrationColor: dbMilestone.celebration_color || '#10B981',
          emotionalFraming: dbMilestone.celebration_emotional_framing || 'Great progress!',
          familyImpactMessage: dbMilestone.celebration_family_impact_message || 'This milestone strengthens your family\'s protection.',
        },
        progress: {
          percentage: (dbMilestone.criteria_is_complete || false) ? 100 : 0,
          completedSteps: (dbMilestone.criteria_is_complete || false) ? 1 : 0,
          totalSteps: 1,
          stepsCompleted: (dbMilestone.criteria_is_complete || false) ? 1 : 0,
        },
        completedAt: dbMilestone.completed_at || undefined,
        createdAt: dbMilestone.created_at || new Date().toISOString(),
        updatedAt: dbMilestone.updated_at || new Date().toISOString(),
        metadata: {
          difficulty: 'medium' as const,
          estimatedTime: '5 minutes',
          priority: 'medium' as const,
          tags: [],
          version: '1.0',
        },
        rewards: {
          points: 0,
          badges: [],
          emotionalReward: '',
          familyImpactBoost: 0,
        },
        triggers: {
          events: [],
          conditions: [],
          autoCheck: false,
        },
      }));

      // Cache the results
      this.milestoneCache.set(cacheKey, {
        data: mappedMilestones,
        timestamp: Date.now(),
      });

      return mappedMilestones;
    } catch (error) {
      console.error('Failed to fetch user milestones:', error);
      throw error;
    }
  }

  /**
   * Get milestone progress summary
   */
  async getMilestoneProgress(userId: string): Promise<MilestoneProgress> {
    try {
      const milestones = await this.getUserMilestones(userId);
      const completedMilestones = milestones.filter(m => m.completedAt);
      const totalMilestones = milestones.length;
      const overallProgress =
        totalMilestones > 0
          ? (completedMilestones.length / totalMilestones) * 100
          : 0;

      // Calculate category progress
      const categoryProgress = this.calculateCategoryProgress(milestones);

      // Determine current level
      const currentLevel = this.determineUserLevel(
        overallProgress,
        completedMilestones
      );
      const nextLevel = this.getNextLevel(currentLevel);

      // Get recent achievements (last 7 days)
      const recentAchievements = completedMilestones.filter(m => {
        if (!m.completedAt) return false;
        const completedDate = new Date(m.completedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return completedDate > sevenDaysAgo;
      });

      // Get pending celebrations
      const pendingCelebrations = milestones.filter(
        m => m.completedAt && m.celebration.shouldShow
      );

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        milestones,
        userId
      );

      return {
        userId,
        totalMilestones,
        completedMilestones: completedMilestones.length,
        overallProgress: Math.round(overallProgress),
        currentLevel,
        nextLevel,
        categoryProgress,
        recentAchievements,
        pendingCelebrations,
        recommendations,
      };
    } catch (error) {
      console.error('Failed to calculate milestone progress:', error);
      throw error;
    }
  }

  /**
   * Manually trigger milestone evaluation (for debugging or manual checks)
   */
  async evaluateAllMilestones(userId: string): Promise<void> {
    try {
      const milestones = await this.getUserMilestones(userId);

      for (const milestone of milestones) {
        if (!milestone.completedAt) {
          const updatedMilestone = await this.evaluateMilestone(
            milestone,
            userId
          );
          await this.saveMilestone(updatedMilestone);
        }
      }

      await this.updateMilestoneProgress(userId);
    } catch (error) {
      console.error('Milestone evaluation failed:', error);
      throw error;
    }
  }

  /**
   * Mark celebration as viewed
   */
  async markCelebrationViewed(milestoneId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('legacy_milestones')
        .update({
          celebration: { shouldShow: false },
          updated_at: new Date().toISOString(),
        })
        .eq('id', milestoneId);

      if (error) throw error;

      // Clear cache
      this.clearUserCache(milestoneId);
    } catch (error) {
      console.error('Failed to mark celebration as viewed:', error);
      throw error;
    }
  }

  /**
   * Get milestone analytics
   */
  async getMilestoneAnalytics(
    userId: string,
    timeframe?: { end: string; start: string }
  ): Promise<MilestoneAnalytics> {
    try {
      const milestones = await this.getUserMilestones(userId);

      // Filter by timeframe if provided
      const filteredMilestones = timeframe
        ? milestones.filter(m => {
            if (!m.completedAt) return false;
            const completedDate = new Date(m.completedAt);
            return (
              completedDate >= new Date(timeframe.start) &&
              completedDate <= new Date(timeframe.end)
            );
          })
        : milestones;

      return this.calculateMilestoneAnalytics(
        userId,
        filteredMilestones,
        timeframe
      );
    } catch (error) {
      console.error('Failed to calculate milestone analytics:', error);
      throw error;
    }
  }

  // Private helper methods

  private async createMilestonesFromTemplates(
    userId: string
  ): Promise<LegacyMilestone[]> {
    const milestones: LegacyMilestone[] = [];
    const now = new Date().toISOString();

    for (const template of DEFAULT_MILESTONE_TEMPLATES) {
      const milestone: LegacyMilestone = {
        id: `${userId}_${template.id}`,
        userId,
        type: template.id as LegacyMilestone['type'],
        title: template.name,
        description: template.description,
        category: template.category,
        criteria: {
          ...template.criteria,
          currentValue: 0,
          isComplete: false,
        },
        progress: {
          percentage: 0,
          stepsCompleted: 0,
          totalSteps: 1,
          nextAction: this.getNextActionForMilestone(template.id),
          nextActionUrl: this.getNextActionUrlForMilestone(template.id),
        },
        celebration: template.celebration,
        rewards: template.rewards,
        triggers: template.triggers,
        metadata: template.metadata,
        createdAt: now,
        updatedAt: now,
      };

      milestones.push(milestone);
    }

    // Add additional milestone types
    milestones.push(...this.createAdditionalMilestones(userId, now));

    return milestones;
  }

  private createAdditionalMilestones(
    userId: string,
    now: string
  ): LegacyMilestone[] {
    return [
      {
        id: `${userId}_protection_50`,
        userId,
        type: 'protection_threshold',
        title: 'Family Shield Activated',
        description: 'Reach 50% family protection level',
        category: 'protection',
        criteria: {
          type: 'protection_percentage',
          threshold: 50,
          currentValue: 0,
          isComplete: false,
        },
        progress: {
          percentage: 0,
          stepsCompleted: 0,
          totalSteps: 1,
          nextAction: 'Upload essential documents',
          nextActionUrl: '/vault',
        },
        celebration: {
          shouldShow: true,
          celebrationText:
            'Your Family Shield is now active! 50% protection achieved!',
          familyImpactMessage:
            'Your family now has solid protection for essential scenarios',
          emotionalFraming:
            'Peace of mind grows stronger with each protective step',
          celebrationIcon: '🛡️',
          celebrationColor: 'blue',
        },
        rewards: {
          protectionIncrease: 25,
          timeSaved: 5,
          features: ['family_insights', 'protection_analysis'],
          badges: ['family_shield'],
        },
        triggers: {
          conditions: ['document_uploaded', 'document_updated'],
          autoCheck: true,
          checkFrequency: 'immediate',
        },
        metadata: {
          difficulty: 'medium',
          estimatedTime: '2 hours',
          priority: 'high',
          tags: ['protection', 'milestone'],
          version: '1.0',
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `${userId}_family_complete`,
        userId,
        type: 'family_complete',
        title: 'Family Circle Complete',
        description: 'Add and secure all family members',
        category: 'family',
        criteria: {
          type: 'family_members',
          threshold: 3,
          currentValue: 0,
          isComplete: false,
        },
        progress: {
          percentage: 0,
          stepsCompleted: 0,
          totalSteps: 1,
          nextAction: 'Add family members',
          nextActionUrl: '/family',
        },
        celebration: {
          shouldShow: true,
          celebrationText:
            'Your Family Circle shines complete! Everyone you love is protected!',
          familyImpactMessage:
            'Your entire family now benefits from comprehensive legacy planning',
          emotionalFraming: 'Love expressed through thoughtful preparation',
          celebrationIcon: '👨‍👩‍👧‍👦',
          celebrationColor: 'pink',
        },
        rewards: {
          protectionIncrease: 30,
          timeSaved: 8,
          features: ['family_collaboration', 'shared_insights'],
          badges: ['family_guardian'],
        },
        triggers: {
          conditions: ['family_member_added'],
          autoCheck: true,
          checkFrequency: 'immediate',
        },
        metadata: {
          difficulty: 'medium',
          estimatedTime: '1 hour',
          priority: 'medium',
          tags: ['family', 'collaboration'],
          version: '1.0',
        },
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private async shouldCheckMilestone(
    milestone: LegacyMilestone,
    event: MilestoneTriggerEvent
  ): Promise<boolean> {
    if (!milestone.triggers.autoCheck) return false;
    if (milestone.completedAt) return false;

    // Check if event type matches milestone triggers
    const eventMatches = milestone.triggers.conditions.some(condition => {
      switch (condition) {
        case 'document_uploaded':
          return event.type === 'document_uploaded';
        case 'document_updated':
          return event.type === 'document_updated';
        case 'family_member_added':
          return event.type === 'family_member_added';
        case 'review_completed':
          return event.type === 'review_completed';
        default:
          return false;
      }
    });

    return eventMatches;
  }

  private async evaluateMilestone(
    milestone: LegacyMilestone,
    userId: string
  ): Promise<LegacyMilestone> {
    const updatedMilestone = { ...milestone };

    switch (milestone.criteria.type) {
      case 'document_count': {
        const docCount = await this.getDocumentCount(userId);
        updatedMilestone.criteria.currentValue = docCount;
        updatedMilestone.criteria.isComplete =
          docCount >= Number(milestone.criteria.threshold);
        updatedMilestone.progress.percentage = Math.min(
          100,
          (docCount / Number(milestone.criteria.threshold)) * 100
        );
        break;
      }

      case 'protection_percentage': {
        const protectionLevel = await this.calculateProtectionLevel(userId);
        updatedMilestone.criteria.currentValue = protectionLevel;
        updatedMilestone.criteria.isComplete =
          protectionLevel >= Number(milestone.criteria.threshold);
        updatedMilestone.progress.percentage = Math.min(
          100,
          (protectionLevel / Number(milestone.criteria.threshold)) * 100
        );
        break;
      }

      case 'family_members': {
        const familyCount = await this.getFamilyMemberCount(userId);
        updatedMilestone.criteria.currentValue = familyCount;
        updatedMilestone.criteria.isComplete =
          familyCount >= Number(milestone.criteria.threshold);
        updatedMilestone.progress.percentage = Math.min(
          100,
          (familyCount / Number(milestone.criteria.threshold)) * 100
        );
        break;
      }

      case 'review_score': {
        const reviewScore = await this.getAverageReviewScore(userId);
        updatedMilestone.criteria.currentValue = reviewScore;
        updatedMilestone.criteria.isComplete =
          reviewScore >= Number(milestone.criteria.threshold);
        updatedMilestone.progress.percentage = Math.min(
          100,
          (reviewScore / Number(milestone.criteria.threshold)) * 100
        );
        break;
      }
    }

    updatedMilestone.progress.stepsCompleted = updatedMilestone.criteria
      .isComplete
      ? 1
      : 0;
    updatedMilestone.lastCheckedAt = new Date().toISOString();
    updatedMilestone.updatedAt = new Date().toISOString();

    return updatedMilestone;
  }

  private async getDocumentCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting document count:', error);
      return 0;
    }

    return count || 0;
  }

  private async calculateProtectionLevel(userId: string): Promise<number> {
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('type')
        .eq('user_id', userId);

      if (!documents) return 0;

      const essentialDocs = [
        'will',
        'power_of_attorney',
        'healthcare_directive',
        'insurance_policy',
      ];
      const hasEssential = essentialDocs.filter(type =>
        documents.some(doc => (doc as any).type === type || (doc as any).document_type === type)
      );

      const basePercentage = (hasEssential.length / essentialDocs.length) * 70;
      const bonusPercentage = Math.min(30, documents.length * 3);

      return Math.min(100, Math.round(basePercentage + bonusPercentage));
    } catch (error) {
      console.error('Error calculating protection level:', error);
      return 0;
    }
  }

  private async getFamilyMemberCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting family member count:', error);
      return 0;
    }

    return count || 0;
  }

  private async getAverageReviewScore(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('document_reviews')
      .select('score')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) return 0;

    const scores = data.map(review => (review as any).score || (review as any).rating || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private async triggerMilestoneCelebration(
    milestone: LegacyMilestone
  ): Promise<void> {
    // Store celebration event
    try {
      await (supabase as any).from('milestone_celebrations').insert({
        milestone_id: milestone.id,
        user_id: milestone.userId,
        celebration_data: milestone.celebration,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to store celebration event:', error);
    }
  }

  private async saveMilestone(milestone: LegacyMilestone): Promise<void> {
    // Map LegacyMilestone to database schema
    const dbMilestone = {
      id: milestone.id,
      user_id: milestone.userId,
      category: milestone.category,
      title: milestone.title,
      description: milestone.description,
      type: milestone.type as any,
      criteria_type: milestone.criteria.type,
      criteria_threshold: String(milestone.criteria.threshold),
      criteria_current_value: String(milestone.criteria.currentValue),
      criteria_is_complete: milestone.criteria.isComplete,
      completed_at: milestone.completedAt || null,
      celebration_text: milestone.celebration.celebrationText,
      celebration_family_impact_message: milestone.celebration.familyImpactMessage,
      celebration_color: milestone.celebration.celebrationColor,
      celebration_emotional_framing: milestone.celebration.emotionalFraming,
      celebration_icon: milestone.celebration.celebrationIcon,
      celebration_should_show: milestone.celebration.shouldShow,
      level: 'foundation' as const,
      created_at: milestone.createdAt,
      updated_at: milestone.updatedAt,
    };

    const { error } = await supabase
      .from('legacy_milestones')
      .upsert(dbMilestone, { onConflict: 'id' });

    if (error) throw error;

    // Clear cache for this user
    this.clearUserCache(milestone.userId);
  }

  private async updateMilestoneProgress(userId: string): Promise<void> {
    const progress = await this.getMilestoneProgress(userId);

    // Store or update progress record
    await (supabase as any).from('milestone_progress').upsert(
      {
        user_id: userId,
        progress_data: progress,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }

  private calculateCategoryProgress(
    milestones: LegacyMilestone[]
  ): MilestoneProgress['categoryProgress'] {
    const categories = [
      'foundation',
      'protection',
      'family',
      'professional',
      'maintenance',
      'mastery',
    ] as const;
    const categoryProgress = {} as MilestoneProgress['categoryProgress'];

    for (const category of categories) {
      const categoryMilestones = milestones.filter(
        m => m.category === category
      );
      const completedCategory = categoryMilestones.filter(m => m.completedAt);

      categoryProgress[category] = {
        completed: completedCategory.length,
        total: categoryMilestones.length,
        percentage:
          categoryMilestones.length > 0
            ? Math.round(
                (completedCategory.length / categoryMilestones.length) * 100
              )
            : 0,
      };
    }

    return categoryProgress;
  }

  private determineUserLevel(
    overallProgress: number,
    completedMilestones: LegacyMilestone[]
  ): MilestoneLevel {
    // Find the highest level the user qualifies for
    for (let i = MILESTONE_LEVELS.length - 1; i >= 0; i--) {
      const level = MILESTONE_LEVELS[i];

      if (overallProgress >= level.progressThreshold) {
        // Check if they meet the requirements
        if (
          completedMilestones.length >= level.requirements.milestonesRequired
        ) {
          // Check specific milestone requirements if any
          if (level.requirements.specificMilestones) {
            const hasSpecific = level.requirements.specificMilestones.every(
              requiredId =>
                completedMilestones.some(m => m.id.includes(requiredId))
            );
            if (!hasSpecific) continue;
          }

          // Check category requirements if any
          if (level.requirements.categoriesRequired) {
            const completedCategories = new Set(
              completedMilestones.map(m => m.category)
            );
            const hasCategories = level.requirements.categoriesRequired.every(
              cat => completedCategories.has(cat)
            );
            if (!hasCategories) continue;
          }

          return level;
        }
      }
    }

    return MILESTONE_LEVELS[0]; // Default to first level
  }

  private getNextLevel(currentLevel: MilestoneLevel): MilestoneLevel | null {
    const currentIndex = MILESTONE_LEVELS.findIndex(
      l => l.level === currentLevel.level
    );
    return currentIndex < MILESTONE_LEVELS.length - 1
      ? MILESTONE_LEVELS[currentIndex + 1]
      : null;
  }

  private async generateRecommendations(
    milestones: LegacyMilestone[],
    _userId: string
  ): Promise<MilestoneProgress['recommendations']> {
    const incompleteMilestones = milestones.filter(m => !m.completedAt);
    const recommendations: MilestoneProgress['recommendations'] = [];

    // Sort by priority and progress
    const sortedMilestones = incompleteMilestones.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.metadata.priority];
      const bPriority = priorityOrder[b.metadata.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.progress.percentage - a.progress.percentage;
    });

    // Take top 3 recommendations
    for (const milestone of sortedMilestones.slice(0, 3)) {
      recommendations.push({
        milestone,
        reason: this.generateRecommendationReason(milestone),
        estimatedImpact: this.generateEstimatedImpact(milestone),
      });
    }

    return recommendations;
  }

  private generateRecommendationReason(milestone: LegacyMilestone): string {
    if (milestone.progress.percentage > 50) {
      return `You're ${milestone.progress.percentage}% complete! Just a little more to achieve this milestone.`;
    } else if (
      milestone.metadata.priority === 'critical' ||
      milestone.metadata.priority === 'high'
    ) {
      return `This milestone significantly improves your family's protection level.`;
    } else {
      return `Completing this milestone unlocks valuable features and insights.`;
    }
  }

  private generateEstimatedImpact(milestone: LegacyMilestone): string {
    const rewards = milestone.rewards;
    const impacts: string[] = [];

    if (rewards.protectionIncrease) {
      impacts.push(`+${rewards.protectionIncrease}% family protection`);
    }
    if (rewards.timeSaved) {
      impacts.push(`${rewards.timeSaved} hours saved`);
    }
    if (rewards.features?.length) {
      impacts.push(`${rewards.features.length} new features unlocked`);
    }

    return impacts.length > 0
      ? impacts.join(', ')
      : 'Valuable progress toward legacy completion';
  }

  private calculateMilestoneAnalytics(
    userId: string,
    milestones: LegacyMilestone[],
    timeframe?: { end: string; start: string }
  ): MilestoneAnalytics {
    const completedMilestones = milestones.filter(m => m.completedAt);
    const now = new Date();

    // Calculate completion times
    const completionTimes = completedMilestones.map(m => {
      const created = new Date(m.createdAt).getTime();
      const completed = new Date(m.completedAt || '').getTime();
      return (completed - created) / (1000 * 60 * 60); // hours
    });

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) /
          completionTimes.length
        : 0;

    const completionRate =
      milestones.length > 0
        ? (completedMilestones.length / milestones.length) * 100
        : 0;

    // Calculate category and difficulty preferences
    const categoryCount = completedMilestones.reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostActiveCategory =
      (Object.entries(categoryCount).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as LegacyMilestone['category']) || 'foundation';

    const difficultyCount = completedMilestones.reduce(
      (acc, m) => {
        acc[m.metadata.difficulty] = (acc[m.metadata.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredDifficulty =
      (Object.entries(difficultyCount).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as LegacyMilestone['metadata']['difficulty']) || 'easy';

    // Calculate impact metrics
    const totalProtectionIncrease = completedMilestones.reduce(
      (sum, m) => sum + (m.rewards.protectionIncrease || 0),
      0
    );

    const totalTimeSaved = completedMilestones.reduce(
      (sum, m) => sum + (m.rewards.timeSaved || 0),
      0
    );

    const featuresUnlocked = Array.from(
      new Set(completedMilestones.flatMap(m => m.rewards.features || []))
    );

    return {
      userId,
      timeframe: timeframe || {
        start: new Date(now.getFullYear(), 0, 1).toISOString(),
        end: now.toISOString(),
      },
      milestonesCompleted: completedMilestones.length,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      mostActiveCategory,
      preferredDifficulty,
      completionTrend: 'stable', // Would need historical data to calculate
      totalProtectionIncrease,
      totalTimeSaved,
      featuresUnlocked,
      celebrationEngagement: 0.8, // Would track from user interactions
      recommendationFollowRate: 0.6, // Would track from user actions
      averageGapBetweenMilestones: 7, // days, would calculate from completion dates
    };
  }

  private getNextActionForMilestone(milestoneId: string): string {
    switch (milestoneId) {
      case 'first_document':
        return 'Upload your first document';
      case 'protection_50':
        return 'Add essential documents';
      case 'family_complete':
        return 'Add family members';
      default:
        return 'Continue your legacy journey';
    }
  }

  private getNextActionUrlForMilestone(milestoneId: string): string {
    switch (milestoneId) {
      case 'first_document':
      case 'protection_50':
        return '/vault';
      case 'family_complete':
        return '/family';
      default:
        return '/';
    }
  }

  private clearUserCache(userIdOrMilestoneId: string): void {
    const keysToDelete = Array.from(this.milestoneCache.keys()).filter(key =>
      key.includes(userIdOrMilestoneId)
    );

    keysToDelete.forEach(key => this.milestoneCache.delete(key));
  }
}

export const milestonesService = new MilestonesService();
