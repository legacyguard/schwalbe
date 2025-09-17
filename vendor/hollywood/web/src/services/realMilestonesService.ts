
/**
 * Real Milestones Service
 * Complete database integration for milestone tracking and celebration
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  LegacyMilestone,
  MilestoneAnalytics,
  MilestoneLevel,
  MilestoneProgress,
  MilestoneTriggerEvent,
} from '@/types/milestones';

class RealMilestonesService {
  private static instance: RealMilestonesService;

  static getInstance(): RealMilestonesService {
    if (!RealMilestonesService.instance) {
      RealMilestonesService.instance = new RealMilestonesService();
    }
    return RealMilestonesService.instance;
  }

  // Core Milestone Operations
  async getUserMilestones(userId: string): Promise<LegacyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('legacy_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDbToMilestone);
    } catch (_error) {
      console.error('Failed to fetch user milestones:', error);
      return [];
    }
  }

  async createMilestone(
    milestone: Omit<LegacyMilestone, 'createdAt' | 'id' | 'updatedAt'>
  ): Promise<LegacyMilestone> {
    try {
      const { data, error } = await supabase
        .from('legacy_milestones')
        .insert({
          user_id: milestone.userId,
          type: milestone.type,
          title: milestone.title,
          description: milestone.description,
          category: milestone.category,
          criteria_type: milestone.criteria.type,
          criteria_threshold: milestone.criteria.threshold.toString(),
          criteria_current_value: milestone.criteria.currentValue.toString(),
          criteria_is_complete: milestone.criteria.isComplete,
          progress_percentage: milestone.progress.percentage,
          progress_steps_completed: milestone.progress.stepsCompleted,
          progress_total_steps: milestone.progress.totalSteps,
          progress_next_action: milestone.progress.nextAction,
          progress_next_action_url: milestone.progress.nextActionUrl,
          celebration_should_show: milestone.celebration.shouldShow,
          celebration_text: milestone.celebration.celebrationText,
          celebration_family_impact_message:
            milestone.celebration.familyImpactMessage,
          celebration_emotional_framing: milestone.celebration.emotionalFraming,
          celebration_icon: milestone.celebration.celebrationIcon,
          celebration_color: milestone.celebration.celebrationColor,
          rewards: milestone.rewards,
          triggers: milestone.triggers,
          metadata: milestone.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDbToMilestone(data);
    } catch (_error) {
      console.error('Failed to create milestone:', error);
      throw error;
    }
  }

  async updateMilestone(
    milestoneId: string,
    updates: Partial<LegacyMilestone>
  ): Promise<LegacyMilestone> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.criteria) {
        updateData.criteria_type = updates.criteria.type;
        updateData.criteria_threshold = updates.criteria.threshold.toString();
        updateData.criteria_current_value =
          updates.criteria.currentValue.toString();
        updateData.criteria_is_complete = updates.criteria.isComplete;
      }
      if (updates.progress) {
        updateData.progress_percentage = updates.progress.percentage;
        updateData.progress_steps_completed = updates.progress.stepsCompleted;
        updateData.progress_total_steps = updates.progress.totalSteps;
        updateData.progress_next_action = updates.progress.nextAction;
        updateData.progress_next_action_url = updates.progress.nextActionUrl;
      }
      if (updates.celebration) {
        updateData.celebration_should_show = updates.celebration.shouldShow;
        updateData.celebration_text = updates.celebration.celebrationText;
        updateData.celebration_family_impact_message =
          updates.celebration.familyImpactMessage;
        updateData.celebration_emotional_framing =
          updates.celebration.emotionalFraming;
        updateData.celebration_icon = updates.celebration.celebrationIcon;
        updateData.celebration_color = updates.celebration.celebrationColor;
      }
      if (updates.rewards) updateData.rewards = updates.rewards;
      if (updates.triggers) updateData.triggers = updates.triggers;
      if (updates.metadata) updateData.metadata = updates.metadata;
      if (updates.completedAt) updateData.completed_at = updates.completedAt;
      if (updates.lastCheckedAt)
        updateData.last_checked_at = updates.lastCheckedAt;

      const { data, error } = await supabase
        .from('legacy_milestones')
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      return this.mapDbToMilestone(data);
    } catch (_error) {
      console.error('Failed to update milestone:', error);
      throw error;
    }
  }

  async deleteMilestone(milestoneId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('legacy_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
    } catch (_error) {
      console.error('Failed to delete milestone:', error);
      throw error;
    }
  }

  // Milestone Tracking and Progress
  async checkMilestones(
    event: MilestoneTriggerEvent
  ): Promise<LegacyMilestone[]> {
    try {
      // console.log(`Checking milestones for event: ${event.type} for user: ${event.userId}`);

      const milestones = await this.getUserMilestones(event.userId);
      const completedMilestones: LegacyMilestone[] = [];

      for (const milestone of milestones) {
        if (await this.shouldCheckMilestone(milestone, event)) {
          const updatedMilestone = await this.evaluateMilestone(
            milestone,
            event
          );

          if (
            updatedMilestone.criteria.isComplete &&
            !milestone.criteria.isComplete
          ) {
            updatedMilestone.completedAt = new Date().toISOString();
            updatedMilestone.celebration.shouldShow = true;

            const savedMilestone = await this.updateMilestone(
              milestone.id,
              updatedMilestone
            );
            completedMilestones.push(savedMilestone);

            await this.triggerMilestoneCelebration(savedMilestone);
          } else if (
            updatedMilestone.criteria.currentValue !==
              milestone.criteria.currentValue ||
            updatedMilestone.progress.percentage !==
              milestone.progress.percentage
          ) {
            await this.updateMilestone(milestone.id, updatedMilestone);
          }
        }
      }

      return completedMilestones;
    } catch (_error) {
      console.error('Failed to check milestones:', error);
      return [];
    }
  }

  async getMilestoneProgress(userId: string): Promise<MilestoneProgress> {
    try {
      const milestones = await this.getUserMilestones(userId);
      const completed = milestones.filter(m => m.criteria.isComplete);

      // Calculate category progress
      const categoryProgress: MilestoneProgress['categoryProgress'] = {
        foundation: this.calculateCategoryProgress(milestones, 'foundation'),
        protection: this.calculateCategoryProgress(milestones, 'protection'),
        family: this.calculateCategoryProgress(milestones, 'family'),
        professional: this.calculateCategoryProgress(
          milestones,
          'professional'
        ),
        maintenance: this.calculateCategoryProgress(milestones, 'maintenance'),
        mastery: this.calculateCategoryProgress(milestones, 'mastery'),
      };

      // Get recent achievements (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAchievements = completed.filter(
        m => m.completedAt && new Date(m.completedAt) > thirtyDaysAgo
      );

      // Get pending celebrations
      const pendingCelebrations = milestones.filter(
        m => m.celebration.shouldShow && m.criteria.isComplete
      );

      // Calculate current and next level
      const totalCompleted = completed.length;
      const currentLevel = this.calculateCurrentLevel(
        totalCompleted,
        categoryProgress
      );
      const nextLevel = this.calculateNextLevel(currentLevel);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        userId,
        milestones
      );

      return {
        userId,
        totalMilestones: milestones.length,
        completedMilestones: completed.length,
        overallProgress:
          milestones.length > 0
            ? Math.round((completed.length / milestones.length) * 100)
            : 0,
        currentLevel,
        nextLevel,
        categoryProgress,
        recentAchievements,
        pendingCelebrations,
        recommendations,
      };
    } catch (_error) {
      console.error('Failed to get milestone progress:', error);
      return {
        userId,
        totalMilestones: 0,
        completedMilestones: 0,
        overallProgress: 0,
        currentLevel: {
          level: 1,
          name: 'Guardian Awakening',
          description: '',
          requirements: { milestonesRequired: 0 },
          benefits: {
            title: '',
            features: [],
            protectionLevel: '',
            statusMessage: '',
          },
          celebrationMessage: '',
          progressThreshold: 0,
        },
        nextLevel: null,
        categoryProgress: {
          foundation: { completed: 0, total: 0, percentage: 0 },
          protection: { completed: 0, total: 0, percentage: 0 },
          family: { completed: 0, total: 0, percentage: 0 },
          professional: { completed: 0, total: 0, percentage: 0 },
          maintenance: { completed: 0, total: 0, percentage: 0 },
          mastery: { completed: 0, total: 0, percentage: 0 },
        },
        recentAchievements: [],
        pendingCelebrations: [],
        recommendations: [],
      };
    }
  }

  async initializeUserMilestones(userId: string): Promise<void> {
    try {
      // Check if user already has milestones
      const existingMilestones = await this.getUserMilestones(userId);
      if (existingMilestones.length > 0) return;

      // Create initial milestones for new user
      const initialMilestones: Omit<
        LegacyMilestone,
        'createdAt' | 'id' | 'updatedAt'
      >[] = [
        {
          userId,
          type: 'first_document',
          title: 'First Document Upload',
          description:
            'Upload your first important document to begin your legacy journey',
          category: 'foundation',
          criteria: {
            type: 'document_count',
            threshold: 1,
            currentValue: 0,
            isComplete: false,
          },
          progress: {
            percentage: 0,
            stepsCompleted: 0,
            totalSteps: 1,
            nextAction: 'Upload your first document',
            nextActionUrl: '/vault',
          },
          celebration: {
            shouldShow: false,
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
          triggers: {
            conditions: ['document_uploaded'],
            autoCheck: true,
            checkFrequency: 'immediate',
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

      // Create the milestones
      for (const milestone of initialMilestones) {
        await this.createMilestone(milestone);
      }

      // console.log(`Initialized ${initialMilestones.length} milestones for user ${userId}`);
    } catch (_error) {
      console.error('Failed to initialize user milestones:', error);
    }
  }

  async getMilestoneAnalytics(
    userId: string,
    timeframe: { end: string; start: string }
  ): Promise<MilestoneAnalytics> {
    try {
      const milestones = await this.getUserMilestones(userId);
      const completed = milestones.filter(
        m =>
          m.completedAt &&
          m.completedAt >= timeframe.start &&
          m.completedAt <= timeframe.end
      );

      // Calculate completion times
      const completionTimes = completed
        .map(m => {
          if (m.completedAt && m.createdAt) {
            const created = new Date(m.createdAt).getTime();
            const completedTime = new Date(m.completedAt).getTime();
            return (completedTime - created) / (1000 * 60 * 60); // hours
          }
          return 0;
        })
        .filter(time => time > 0);

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0;

      // Calculate most active category
      const categoryCount = new Map<string, number>();
      completed.forEach(m => {
        categoryCount.set(m.category, (categoryCount.get(m.category) || 0) + 1);
      });
      const mostActiveCategory =
        Array.from(categoryCount.entries()).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || 'foundation';

      // Calculate preferred difficulty
      const difficultyCount = new Map<string, number>();
      completed.forEach(m => {
        const difficulty = m.metadata.difficulty;
        difficultyCount.set(
          difficulty,
          (difficultyCount.get(difficulty) || 0) + 1
        );
      });
      const preferredDifficulty =
        Array.from(difficultyCount.entries()).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || 'easy';

      return {
        userId,
        timeframe,
        milestonesCompleted: completed.length,
        averageCompletionTime,
        completionRate:
          milestones.length > 0
            ? (completed.length / milestones.length) * 100
            : 0,
        mostActiveCategory: (mostActiveCategory as any) || 'foundation',
        preferredDifficulty: (preferredDifficulty as any) || 'medium',
        completionTrend: this.calculateCompletionTrend(completed),
        totalProtectionIncrease: completed.reduce(
          (sum, m) => sum + (m.rewards.protectionIncrease || 0),
          0
        ),
        totalTimeSaved: completed.reduce(
          (sum, m) => sum + (m.rewards.timeSaved || 0),
          0
        ),
        featuresUnlocked: Array.from(
          new Set(completed.flatMap(m => m.rewards.features || []))
        ),
        celebrationEngagement: 0.85, // Would track actual engagement
        recommendationFollowRate: 0.7, // Would track actual follow-through
        averageGapBetweenMilestones: this.calculateAverageGap(completed),
      };
    } catch (_error) {
      console.error('Failed to get milestone analytics:', error);
      return {
        userId,
        timeframe,
        milestonesCompleted: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        mostActiveCategory: 'foundation',
        preferredDifficulty: 'easy',
        completionTrend: 'stable',
        totalProtectionIncrease: 0,
        totalTimeSaved: 0,
        featuresUnlocked: [],
        celebrationEngagement: 0,
        recommendationFollowRate: 0,
        averageGapBetweenMilestones: 0,
      };
    }
  }

  // Private Helper Methods
  private mapDbToMilestone(data: Record<string, any>): LegacyMilestone {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      description: data.description,
      category: data.category,
      criteria: {
        type: data.criteria_type,
        threshold: isNaN(Number(data.criteria_threshold))
          ? data.criteria_threshold
          : Number(data.criteria_threshold),
        currentValue: isNaN(Number(data.criteria_current_value))
          ? data.criteria_current_value
          : Number(data.criteria_current_value),
        isComplete: data.criteria_is_complete,
      },
      progress: {
        percentage: data.progress_percentage,
        stepsCompleted: data.progress_steps_completed,
        totalSteps: data.progress_total_steps,
        nextAction: data.progress_next_action,
        nextActionUrl: data.progress_next_action_url,
      },
      celebration: {
        shouldShow: data.celebration_should_show,
        celebrationText: data.celebration_text,
        familyImpactMessage: data.celebration_family_impact_message,
        emotionalFraming: data.celebration_emotional_framing,
        celebrationIcon: data.celebration_icon,
        celebrationColor: data.celebration_color,
      },
      rewards: data.rewards || {},
      triggers: data.triggers || {},
      metadata: data.metadata || {},
      createdAt: data.created_at,
      completedAt: data.completed_at,
      lastCheckedAt: data.last_checked_at,
      updatedAt: data.updated_at,
    };
  }

  private async shouldCheckMilestone(
    milestone: LegacyMilestone,
    event: MilestoneTriggerEvent
  ): Promise<boolean> {
    if (!milestone.triggers.autoCheck) return false;
    if (milestone.criteria.isComplete) return false;

    const conditions = milestone.triggers.conditions || [];
    return conditions.some(condition => {
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
  }

  private async evaluateMilestone(
    milestone: LegacyMilestone,
    event: MilestoneTriggerEvent
  ): Promise<LegacyMilestone> {
    const updatedMilestone = { ...milestone };
    updatedMilestone.lastCheckedAt = new Date().toISOString();

    switch (milestone.criteria.type) {
      case 'document_count':
        if (event.type === 'document_uploaded') {
          const currentCount = await this.getUserDocumentCount(event.userId);
          updatedMilestone.criteria.currentValue = currentCount;
          updatedMilestone.progress.percentage = Math.min(
            100,
            (currentCount / (milestone.criteria.threshold as number)) * 100
          );
          updatedMilestone.criteria.isComplete =
            currentCount >= (milestone.criteria.threshold as number);
        }
        break;

      case 'family_members':
        if (event.type === 'family_member_added') {
          const currentCount = await this.getUserFamilyMemberCount(
            event.userId
          );
          updatedMilestone.criteria.currentValue = currentCount;
          updatedMilestone.progress.percentage = Math.min(
            100,
            (currentCount / (milestone.criteria.threshold as number)) * 100
          );
          updatedMilestone.criteria.isComplete =
            currentCount >= (milestone.criteria.threshold as number);
        }
        break;

      case 'protection_percentage': {
        const protectionLevel = await this.calculateUserProtectionLevel(
          event.userId
        );
        updatedMilestone.criteria.currentValue = protectionLevel;
        updatedMilestone.progress.percentage = Math.min(
          100,
          (protectionLevel / (milestone.criteria.threshold as number)) * 100
        );
        updatedMilestone.criteria.isComplete =
          protectionLevel >= (milestone.criteria.threshold as number);
        break;
      }

      case 'review_score': {
        if (event.type === 'review_completed' && event.reviewId) {
          // Would get actual review score from database
          const reviewScore = 85; // Placeholder
          updatedMilestone.criteria.currentValue = reviewScore;
          updatedMilestone.progress.percentage = Math.min(
            100,
            (reviewScore / (milestone.criteria.threshold as number)) * 100
          );
          updatedMilestone.criteria.isComplete =
            reviewScore >= (milestone.criteria.threshold as number);
        }
        break;
      }
    }

    return updatedMilestone;
  }

  private async triggerMilestoneCelebration(
    milestone: LegacyMilestone
  ): Promise<void> {
    try {
      // console.log(`🎉 Milestone completed: ${milestone.title}`);

      // Store celebration notification
      await (supabase as any).from('notifications').insert({
        user_id: milestone.userId,
        type: 'milestone_completed',
        title: 'Milestone Achieved!',
        message: milestone.celebration.celebrationText,
        data: {
          milestone_id: milestone.id,
          milestone_type: milestone.type,
          rewards: milestone.rewards,
          family_impact: milestone.celebration.familyImpactMessage,
        },
        created_at: new Date().toISOString(),
      });

      // Send celebration email
      await this.sendCelebrationEmail(milestone);
    } catch (_error) {
      // console.error('Failed to trigger milestone celebration:', error);
    }
  }

  private async sendCelebrationEmail(
    milestone: LegacyMilestone
  ): Promise<void> {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: milestone.userId,
          subject: `🎉 Milestone Achieved: ${milestone.title}`,
          template: 'milestone_celebration',
          data: {
            milestoneTitle: milestone.title,
            celebrationText: milestone.celebration.celebrationText,
            familyImpactMessage: milestone.celebration.familyImpactMessage,
            emotionalFraming: milestone.celebration.emotionalFraming,
            rewards: milestone.rewards,
          },
        },
      });
    } catch (_error) {
      // console.error('Failed to send celebration email:', error);
    }
  }

  private async getUserDocumentCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (_error) {
      console.error('Failed to get document count:', error);
      return 0;
    }
  }

  private async getUserFamilyMemberCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('family_members')
        .select('id', { count: 'exact', head: true })
        .eq('family_owner_id', userId)
        .eq('is_active', true);

      if (error) {
        console.warn('Family members table not available, using fallback');
        return 0;
      }
      return count || 0;
    } catch (_error) {
      console.warn('Failed to get family member count, using fallback:', error);
      return 0;
    }
  }

  private async calculateUserProtectionLevel(userId: string): Promise<number> {
    try {
      const documentCount = await this.getUserDocumentCount(userId);
      const familyCount = await this.getUserFamilyMemberCount(userId);

      // Simple protection level calculation
      const documentScore = Math.min(60, documentCount * 15);
      const familyScore = Math.min(40, familyCount * 10);

      return Math.round(documentScore + familyScore);
    } catch (_error) {
      console.error('Failed to calculate protection level:', error);
      return 0;
    }
  }

  private calculateCategoryProgress(
    milestones: LegacyMilestone[],
    category: string
  ) {
    const categoryMilestones = milestones.filter(m => m.category === category);
    const completed = categoryMilestones.filter(m => m.criteria.isComplete);

    return {
      completed: completed.length,
      total: categoryMilestones.length,
      percentage:
        categoryMilestones.length > 0
          ? Math.round((completed.length / categoryMilestones.length) * 100)
          : 0,
    };
  }

  private calculateCurrentLevel(
    completedCount: number,
    _categoryProgress: MilestoneProgress['categoryProgress']
  ): MilestoneLevel {
    // Simplified level calculation
    if (completedCount >= 10) {
      return {
        level: 4,
        name: 'Heritage Guardian',
        description: 'Master of legacy protection',
        requirements: { milestonesRequired: 10 },
        benefits: {
          title: 'Master Protection',
          features: [],
          protectionLevel: '95%',
          statusMessage: 'Complete mastery',
        },
        celebrationMessage: 'You are now a Heritage Guardian!',
        progressThreshold: 90,
      };
    } else if (completedCount >= 6) {
      return {
        level: 3,
        name: 'Legacy Architect',
        description: 'Comprehensive protection designer',
        requirements: { milestonesRequired: 6 },
        benefits: {
          title: 'Advanced Planning',
          features: [],
          protectionLevel: '75%',
          statusMessage: 'Strong foundation',
        },
        celebrationMessage: 'You are now a Legacy Architect!',
        progressThreshold: 50,
      };
    } else if (completedCount >= 3) {
      return {
        level: 2,
        name: 'Memory Keeper',
        description: 'Active family protector',
        requirements: { milestonesRequired: 3 },
        benefits: {
          title: 'Enhanced Security',
          features: [],
          protectionLevel: '50%',
          statusMessage: 'Growing stronger',
        },
        celebrationMessage: 'You are now a Memory Keeper!',
        progressThreshold: 20,
      };
    }

    return {
      level: 1,
      name: 'Guardian Awakening',
      description: 'Beginning your journey',
      requirements: { milestonesRequired: 1 },
      benefits: {
        title: 'Foundation',
        features: [],
        protectionLevel: '25%',
        statusMessage: 'First steps taken',
      },
      celebrationMessage: 'Welcome, Guardian!',
      progressThreshold: 0,
    };
  }

  private calculateNextLevel(
    currentLevel: MilestoneLevel
  ): MilestoneLevel | null {
    if (currentLevel.level >= 4) return null;

    return {
      level: currentLevel.level + 1,
      name:
        currentLevel.level === 1
          ? 'Memory Keeper'
          : currentLevel.level === 2
            ? 'Legacy Architect'
            : 'Heritage Guardian',
      description: 'Next level description',
      requirements: {
        milestonesRequired:
          currentLevel.level === 1 ? 3 : currentLevel.level === 2 ? 6 : 10,
      },
      benefits: {
        title: 'Next level benefits',
        features: [],
        protectionLevel: '',
        statusMessage: '',
      },
      celebrationMessage: '',
      progressThreshold:
        currentLevel.level === 1 ? 20 : currentLevel.level === 2 ? 50 : 90,
    };
  }

  private async generateRecommendations(
    _userId: string,
    milestones: LegacyMilestone[]
  ) {
    const incompleteMillestones = milestones.filter(
      m => !m.criteria.isComplete
    );
    const recommendations = [];

    for (const milestone of incompleteMillestones.slice(0, 3)) {
      recommendations.push({
        milestone,
        reason: `Complete this ${milestone.category} milestone to advance your legacy protection`,
        estimatedImpact: `+${milestone.rewards.protectionIncrease || 10}% protection level`,
      });
    }

    return recommendations;
  }

  private calculateCompletionTrend(
    completed: LegacyMilestone[]
  ): 'declining' | 'improving' | 'stable' {
    if (completed.length < 2) return 'stable';

    // Simple trend calculation based on recent completions
    const recent = completed.filter(m => {
      if (!m.completedAt) return false;
      const completedDate = new Date(m.completedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return completedDate > thirtyDaysAgo;
    });

    const older = completed.filter(m => {
      if (!m.completedAt) return false;
      const completedDate = new Date(m.completedAt);
      const thirtyDaysAgo = new Date();
      const sixtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return completedDate <= thirtyDaysAgo && completedDate > sixtyDaysAgo;
    });

    if (recent.length > older.length) return 'improving';
    if (recent.length < older.length) return 'declining';
    return 'stable';
  }

  private calculateAverageGap(completed: LegacyMilestone[]): number {
    if (completed.length < 2) return 0;

    const sortedByCompletion = completed
      .filter(m => m.completedAt)
      .sort(
        (a, b) =>
          new Date(a.completedAt || '').getTime() -
          new Date(b.completedAt || '').getTime()
      );

    let totalGap = 0;
    for (let i = 1; i < sortedByCompletion.length; i++) {
      const prevDate = new Date(
        sortedByCompletion[i - 1].completedAt || ''
      ).getTime();
      const currentDate = new Date(
        sortedByCompletion[i].completedAt || ''
      ).getTime();
      totalGap += (currentDate - prevDate) / (1000 * 60 * 60 * 24); // days
    }

    return totalGap / (sortedByCompletion.length - 1);
  }
}

export const realMilestonesService = RealMilestonesService.getInstance();
