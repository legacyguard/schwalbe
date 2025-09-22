/**
 * Analytics Service - Real Supabase Metrics
 * Replaces mock data with actual database analytics
 */

import { supabaseClient as supabase } from '@schwalbe/shared/src/supabase/client';
import { logger } from '@schwalbe/shared/src/lib/logger';

export interface AnalyticsMetric {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  description: string;
  trend: number[];
  color: string;
  period: 'day' | 'week' | 'month' | 'year';
}

export interface FamilyMetrics {
  totalMembers: number;
  protectedMembers: number;
  activeGuardians: number;
  emergencyContacts: number;
  protectionScore: number;
  documentsCount: number;
  completedCategories: number;
  lastActivity: string;
  weeklyProgress: number[];
}

export interface DocumentMetrics {
  totalDocuments: number;
  categoriesCompleted: number;
  totalCategories: number;
  averageProcessingTime: number;
  successfulUploads: number;
  failedUploads: number;
  storageUsed: number;
  documentsThisWeek: number;
  documentsThisMonth: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserEngagementMetrics {
  loginFrequency: number;
  sessionDuration: number;
  featuresUsed: string[];
  completionRate: number;
  timeToFirstDocument: number;
  onboardingCompleted: boolean;
  sofiaInteractions: number;
  helpRequestsCount: number;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  storageUsage: number;
  apiCalls: number;
  backgroundJobs: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive family analytics
   */
  static async getFamilyMetrics(): Promise<FamilyMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get family protection metrics (calculated by triggers)
      const { data: protectionMetrics } = await supabase
        .from('family_protection_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get family members
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('protection_status, created_at, last_activity_at')
        .eq('user_id', user.id);

      // Get guardians
      const { data: guardians } = await supabase
        .from('guardians')
        .select('status, created_at')
        .eq('user_id', user.id);

      // Get emergency contacts
      const { data: emergencyContacts } = await supabase
        .from('emergency_contacts')
        .select('created_at')
        .eq('user_id', user.id);

      // Get documents count
      const { data: documents } = await supabase
        .from('documents')
        .select('created_at, category')
        .eq('user_id', user.id);

      // Calculate weekly progress (last 7 days)
      const weeklyProgress = await this.calculateWeeklyProgress(user.id);

      const metrics: FamilyMetrics = {
        totalMembers: familyMembers?.length || 0,
        protectedMembers: familyMembers?.filter(m => m.protection_status === 'protected').length || 0,
        activeGuardians: guardians?.filter(g => g.status === 'active').length || 0,
        emergencyContacts: emergencyContacts?.length || 0,
        protectionScore: protectionMetrics?.protection_score || 0,
        documentsCount: documents?.length || 0,
        completedCategories: new Set(documents?.map(d => d.category)).size || 0,
        lastActivity: protectionMetrics?.last_family_activity_at || new Date().toISOString(),
        weeklyProgress
      };

      logger.info('Calculated family metrics', { metadata: { userId: user.id, score: metrics.protectionScore } });
      return metrics;
    } catch (error) {
      logger.error('Failed to get family metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get document analytics
   */
  static async getDocumentMetrics(): Promise<DocumentMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all documents with metadata
      const { data: documents } = await supabase
        .from('documents')
        .select('category, status, created_at, file_size, processing_time')
        .eq('user_id', user.id);

      // Calculate category breakdown
      const categoryMap = new Map<string, number>();
      documents?.forEach(doc => {
        categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
      });

      const totalDocs = documents?.length || 0;
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0
      }));

      // Calculate time-based metrics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const documentsThisWeek = documents?.filter(d => new Date(d.created_at) > weekAgo).length || 0;
      const documentsThisMonth = documents?.filter(d => new Date(d.created_at) > monthAgo).length || 0;

      // Calculate processing metrics
      const successfulUploads = documents?.filter(d => d.status === 'processed' || d.status === 'completed').length || 0;
      const failedUploads = documents?.filter(d => d.status === 'failed' || d.status === 'error').length || 0;

      const processingTimes = documents?.filter(d => d.processing_time).map(d => d.processing_time) || [];
      const averageProcessingTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

      const storageUsed = documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0;

      const metrics: DocumentMetrics = {
        totalDocuments: totalDocs,
        categoriesCompleted: categoryBreakdown.length,
        totalCategories: 8, // Fixed number of categories in the system
        averageProcessingTime,
        successfulUploads,
        failedUploads,
        storageUsed,
        documentsThisWeek,
        documentsThisMonth,
        categoryBreakdown
      };

      logger.info('Calculated document metrics', { metadata: { userId: user.id, totalDocs } });
      return metrics;
    } catch (error) {
      logger.error('Failed to get document metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get user engagement analytics
   */
  static async getUserEngagementMetrics(): Promise<UserEngagementMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get onboarding progress
      const { data: onboarding } = await supabase
        .from('onboarding_progress')
        .select('completed_at, total_time_spent')
        .eq('user_id', user.id)
        .single();

      // Get user activity logs (if exists)
      const { data: activities } = await supabase
        .from('user_activities')
        .select('action, created_at, session_duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get first document timestamp
      const { data: firstDocument } = await supabase
        .from('documents')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      // Calculate metrics
      const loginFrequency = this.calculateLoginFrequency(activities || []);
      const sessionDuration = this.calculateAverageSessionDuration(activities || []);
      const featuresUsed = this.extractFeaturesUsed(activities || []);
      const timeToFirstDocument = this.calculateTimeToFirstDocument(user.created_at, firstDocument?.created_at);

      const metrics: UserEngagementMetrics = {
        loginFrequency,
        sessionDuration,
        featuresUsed,
        completionRate: onboarding?.completed_at ? 100 : 0,
        timeToFirstDocument,
        onboardingCompleted: !!onboarding?.completed_at,
        sofiaInteractions: activities?.filter(a => a.action.includes('sofia')).length || 0,
        helpRequestsCount: activities?.filter(a => a.action.includes('help')).length || 0
      };

      logger.info('Calculated user engagement metrics', { metadata: { userId: user.id } });
      return metrics;
    } catch (error) {
      logger.error('Failed to get user engagement metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      // Return default metrics if user_activities table doesn't exist
      return {
        loginFrequency: 0,
        sessionDuration: 0,
        featuresUsed: [],
        completionRate: 0,
        timeToFirstDocument: 0,
        onboardingCompleted: false,
        sofiaInteractions: 0,
        helpRequestsCount: 0
      };
    }
  }

  /**
   * Get all analytics metrics formatted for dashboard
   */
  static async getAllMetrics(): Promise<AnalyticsMetric[]> {
    try {
      const [familyMetrics, documentMetrics, engagementMetrics] = await Promise.all([
        this.getFamilyMetrics(),
        this.getDocumentMetrics(),
        this.getUserEngagementMetrics()
      ]);

      const metrics: AnalyticsMetric[] = [
        {
          id: 'family_protection_score',
          title: 'Skóre Ochrany Rodiny',
          value: `${familyMetrics.protectionScore}%`,
          change: this.calculateScoreChange(familyMetrics.weeklyProgress),
          changeType: familyMetrics.protectionScore >= 70 ? 'positive' : 'neutral',
          icon: '🛡️',
          description: 'Celkové skóre ochrany rodiny',
          trend: familyMetrics.weeklyProgress,
          color: 'from-blue-500 to-blue-600',
          period: 'week'
        },
        {
          id: 'total_documents',
          title: 'Celkový Počet Dokumentov',
          value: documentMetrics.totalDocuments,
          change: documentMetrics.documentsThisWeek,
          changeType: documentMetrics.documentsThisWeek > 0 ? 'positive' : 'neutral',
          icon: '📄',
          description: 'Nahraté a spracované dokumenty',
          trend: await this.getDocumentTrend(),
          color: 'from-green-500 to-green-600',
          period: 'week'
        },
        {
          id: 'active_guardians',
          title: 'Aktívni Strážcovia',
          value: familyMetrics.activeGuardians,
          change: 0, // Would need historical data to calculate
          changeType: 'neutral',
          icon: '👥',
          description: 'Počet aktívnych strážcov',
          trend: [familyMetrics.activeGuardians],
          color: 'from-purple-500 to-purple-600',
          period: 'month'
        },
        {
          id: 'completion_rate',
          title: 'Miera Dokončenia',
          value: `${engagementMetrics.completionRate}%`,
          change: 0,
          changeType: engagementMetrics.completionRate === 100 ? 'positive' : 'neutral',
          icon: '✅',
          description: 'Dokončenie onboarding procesu',
          trend: [engagementMetrics.completionRate],
          color: 'from-orange-500 to-orange-600',
          period: 'month'
        },
        {
          id: 'storage_usage',
          title: 'Využitie Úložiska',
          value: this.formatFileSize(documentMetrics.storageUsed),
          change: 0,
          changeType: 'neutral',
          icon: '💾',
          description: 'Celkové využitie úložiska',
          trend: await this.getStorageTrend(),
          color: 'from-indigo-500 to-indigo-600',
          period: 'month'
        },
        {
          id: 'sofia_interactions',
          title: 'Interakcie so Sofiou',
          value: engagementMetrics.sofiaInteractions,
          change: 0,
          changeType: 'positive',
          icon: '🧚‍♀️',
          description: 'Počet konverzácií so Sofia AI',
          trend: [engagementMetrics.sofiaInteractions],
          color: 'from-pink-500 to-pink-600',
          period: 'week'
        }
      ];

      logger.info('Generated analytics metrics', { metadata: { count: metrics.length } });
      return metrics;
    } catch (error) {
      logger.error('Failed to get all metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Calculate weekly progress for last 7 days
   */
  private static async calculateWeeklyProgress(userId: string): Promise<number[]> {
    try {
      const promises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        promises.push(
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
        );
      }

      const results = await Promise.all(promises);
      return results.map(result => result.count || 0);
    } catch (error) {
      logger.error('Failed to calculate weekly progress', { metadata: { error: error instanceof Error ? error.message : String(error) } });
      return [0, 0, 0, 0, 0, 0, 0];
    }
  }

  /**
   * Get document upload trend for last 30 days
   */
  private static async getDocumentTrend(): Promise<number[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get documents for last 30 days, grouped by week
      const trends = [];
      for (let week = 3; week >= 0; week--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (week * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        const { count } = await supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        trends.push(count || 0);
      }

      return trends;
    } catch (error) {
      return [0, 0, 0, 0];
    }
  }

  /**
   * Get storage usage trend
   */
  private static async getStorageTrend(): Promise<number[]> {
    // This would require historical storage data
    // For now, return current usage repeated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [0];

      const { data: documents } = await supabase
        .from('documents')
        .select('file_size')
        .eq('user_id', user.id);

      const totalSize = documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0;
      return [totalSize];
    } catch (error) {
      return [0];
    }
  }

  /**
   * Helper methods
   */
  private static calculateScoreChange(weeklyProgress: number[]): number {
    if (weeklyProgress.length < 2) return 0;
    const lastWeek = weeklyProgress[weeklyProgress.length - 1];
    const previousWeek = weeklyProgress[weeklyProgress.length - 2];
    return lastWeek - previousWeek;
  }

  private static calculateLoginFrequency(activities: any[]): number {
    const logins = activities.filter(a => a.action === 'login');
    const daysWithLogins = new Set(logins.map(l => new Date(l.created_at).toDateString())).size;
    return daysWithLogins;
  }

  private static calculateAverageSessionDuration(activities: any[]): number {
    const sessions = activities.filter(a => a.session_duration);
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + s.session_duration, 0);
    return Math.round(total / sessions.length);
  }

  private static extractFeaturesUsed(activities: any[]): string[] {
    const features = new Set<string>();
    activities.forEach(a => {
      if (a.action.includes('document')) features.add('documents');
      if (a.action.includes('family')) features.add('family');
      if (a.action.includes('guardian')) features.add('guardians');
      if (a.action.includes('sofia')) features.add('sofia');
      if (a.action.includes('emergency')) features.add('emergency');
    });
    return Array.from(features);
  }

  private static calculateTimeToFirstDocument(userCreated: string, firstDocCreated?: string): number {
    if (!firstDocCreated) return 0;
    const userDate = new Date(userCreated);
    const docDate = new Date(firstDocCreated);
    return Math.round((docDate.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24)); // days
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}