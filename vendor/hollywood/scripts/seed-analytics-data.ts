#!/usr/bin/env node

/**
 * Seed Analytics Data Script
 * Populates the quick_insights and legacy_milestones tables with test data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // console.error('Missing environment variables. Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuickInsightSeed {
  action_text?: string;
  action_url?: string;
  actionable: boolean;
  description: string;
  document_id?: string;
  family_impact: Record<string, any>;
  impact: 'high' | 'low' | 'medium';
  metadata: Record<string, any>;
  priority: 'important' | 'nice_to_have' | 'urgent';
  title: string;
  type:
    | 'completion_gap'
    | 'document_analysis'
    | 'family_impact'
    | 'protection_level'
    | 'time_saved'
    | 'urgent_action';
  user_id: string;
  value?: string;
}

interface LegacyMilestoneSeed {
  category:
    | 'family'
    | 'foundation'
    | 'maintenance'
    | 'mastery'
    | 'professional'
    | 'protection';
  celebration_should_show: boolean;
  celebration_text?: string;
  criteria_current_value: string;
  criteria_is_complete: boolean;
  criteria_threshold: string;
  criteria_type:
    | 'action_completed'
    | 'document_count'
    | 'family_members'
    | 'protection_percentage'
    | 'review_score'
    | 'time_based';
  description: string;
  metadata: Record<string, any>;
  progress_next_action?: string;
  progress_next_action_url?: string;
  progress_percentage: number;
  progress_steps_completed: number;
  progress_total_steps: number;
  rewards: Record<string, any>;
  title: string;
  type:
    | 'annual_update'
    | 'family_complete'
    | 'first_document'
    | 'legacy_complete'
    | 'professional_review'
    | 'protection_threshold';
  user_id: string;
}

async function seedQuickInsights(userId: string) {
  // console.log('Seeding quick insights...');

  const insights: QuickInsightSeed[] = [
    {
      user_id: userId,
      type: 'urgent_action',
      title: 'Will Update Needed',
      description:
        "Your will hasn't been updated in 2 years. Family changes may require revisions.",
      value: '2 years',
      impact: 'high',
      priority: 'urgent',
      actionable: true,
      action_text: 'Review Will',
      action_url: '/documents/will',
      metadata: {
        lastUpdate: '2022-01-15',
        familyChanges: ['New child', 'Property purchase'],
      },
      family_impact: {
        affectedMembers: 3,
        riskLevel: 'high',
      },
    },
    {
      user_id: userId,
      type: 'protection_level',
      title: 'Protection Score Improved',
      description: 'Your family protection level increased by 15% this month.',
      value: '+15%',
      impact: 'medium',
      priority: 'nice_to_have',
      actionable: false,
      metadata: {
        trend: 'increasing',
        completedItems: 3,
      },
      family_impact: {
        affectedMembers: 4,
        improvement: true,
      },
    },
    {
      user_id: userId,
      type: 'time_saved',
      title: 'Time Saved This Month',
      description:
        'Automated document management saved you 4 hours of administrative work.',
      value: '4 hours',
      impact: 'low',
      priority: 'nice_to_have',
      actionable: false,
      metadata: {
        automatedTasks: 12,
        documentsProcessed: 8,
      },
      family_impact: {},
    },
    {
      user_id: userId,
      type: 'family_impact',
      title: 'Family Access Improved',
      description:
        '3 family members now have secure access to emergency documents.',
      value: '3 members',
      impact: 'high',
      priority: 'important',
      actionable: true,
      action_text: 'Add More Members',
      action_url: '/family',
      metadata: {
        recentlyAdded: ['Sarah (Spouse)', 'John (Son)'],
        pendingInvites: 1,
      },
      family_impact: {
        newAccess: 3,
        documentTypes: ['medical', 'insurance', 'will'],
      },
    },
    {
      user_id: userId,
      type: 'completion_gap',
      title: 'Insurance Review Due',
      description:
        'Annual insurance review is due next month. Schedule with your advisor.',
      value: '30 days',
      impact: 'medium',
      priority: 'important',
      actionable: true,
      action_text: 'Schedule Review',
      action_url: '/professional-network',
      metadata: {
        lastReview: '2023-03-01',
        advisor: 'Jane Smith, CFP',
      },
      family_impact: {
        coverage: 'life insurance',
        beneficiaries: 2,
      },
    },
    {
      user_id: userId,
      type: 'document_analysis',
      title: 'Healthcare Proxy Missing',
      description:
        "You haven't designated a healthcare proxy. This is critical for medical emergencies.",
      value: 'Missing',
      impact: 'high',
      priority: 'urgent',
      actionable: true,
      action_text: 'Create Healthcare Proxy',
      action_url: '/documents/healthcare-proxy',
      metadata: {
        documentType: 'healthcare',
        legalRequirement: true,
      },
      family_impact: {
        emergencyImpact: 'critical',
        affectedMembers: 'all',
      },
    },
  ];

  const { error } = await supabase
    .from('quick_insights')
    .insert(insights)
    .select();

  if (error) {
    // console.error('Error seeding quick insights:', error);
  } else {
    // console.log(`Seeded ${data?.length || 0} quick insights`);
  }
}

async function seedLegacyMilestones(userId: string) {
  // console.log('Seeding legacy milestones...');

  const milestones: LegacyMilestoneSeed[] = [
    {
      user_id: userId,
      type: 'first_document',
      title: 'First Document Uploaded',
      description:
        "Great start! You've uploaded your first important document.",
      category: 'foundation',
      criteria_type: 'document_count',
      criteria_threshold: '1',
      criteria_current_value: '5',
      criteria_is_complete: true,
      progress_percentage: 100,
      progress_steps_completed: 1,
      progress_total_steps: 1,
      celebration_should_show: false,
      celebration_text:
        "You're officially on your way to protecting your family's future!",
      rewards: {
        badge: 'starter',
        points: 100,
      },
      metadata: {
        completedDate: '2024-01-15',
      },
    },
    {
      user_id: userId,
      type: 'protection_threshold',
      title: '50% Protection Level',
      description: 'Your family protection is halfway complete.',
      category: 'protection',
      criteria_type: 'protection_percentage',
      criteria_threshold: '50',
      criteria_current_value: '65',
      criteria_is_complete: true,
      progress_percentage: 100,
      progress_steps_completed: 1,
      progress_total_steps: 1,
      celebration_should_show: false,
      celebration_text: 'Your family is significantly more protected!',
      rewards: {
        badge: 'protector',
        points: 250,
      },
      metadata: {
        protectionAreas: ['will', 'insurance', 'medical'],
      },
    },
    {
      user_id: userId,
      type: 'family_complete',
      title: 'Family Network Established',
      description:
        "You've added at least 3 family members to your legacy network.",
      category: 'family',
      criteria_type: 'family_members',
      criteria_threshold: '3',
      criteria_current_value: '2',
      criteria_is_complete: false,
      progress_percentage: 67,
      progress_steps_completed: 2,
      progress_total_steps: 3,
      progress_next_action: 'Add one more family member',
      progress_next_action_url: '/family',
      celebration_should_show: false,
      rewards: {
        badge: 'family_first',
        points: 200,
      },
      metadata: {
        currentMembers: ['Sarah Johnson', 'John Doe'],
      },
    },
    {
      user_id: userId,
      type: 'professional_review',
      title: 'Professional Review Complete',
      description: 'Your documents have been reviewed by a legal professional.',
      category: 'professional',
      criteria_type: 'action_completed',
      criteria_threshold: '1',
      criteria_current_value: '0',
      criteria_is_complete: false,
      progress_percentage: 0,
      progress_steps_completed: 0,
      progress_total_steps: 1,
      progress_next_action: 'Schedule professional review',
      progress_next_action_url: '/professional-network',
      celebration_should_show: false,
      rewards: {
        badge: 'verified',
        points: 500,
      },
      metadata: {
        reviewType: 'legal',
        estimatedCost: 250,
      },
    },
    {
      user_id: userId,
      type: 'annual_update',
      title: 'Annual Review Completed',
      description: 'Keep your legacy plan current with annual reviews.',
      category: 'maintenance',
      criteria_type: 'time_based',
      criteria_threshold: '365',
      criteria_current_value: '180',
      criteria_is_complete: false,
      progress_percentage: 49,
      progress_steps_completed: 180,
      progress_total_steps: 365,
      progress_next_action: 'Review in 185 days',
      progress_next_action_url: '/review',
      celebration_should_show: false,
      rewards: {
        badge: 'consistent',
        points: 150,
      },
      metadata: {
        lastReview: '2024-01-01',
        nextReview: '2025-01-01',
      },
    },
  ];

  const { error } = await supabase
    .from('legacy_milestones')
    .insert(milestones)
    .select();

  if (error) {
    // console.error('Error seeding legacy milestones:', error);
  } else {
    // console.log(`Seeded ${data?.length || 0} legacy milestones`);
  }
}

async function seedInsightAnalytics(userId: string) {
  // console.log('Seeding insight analytics...');

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const analytics = {
    user_id: userId,
    timeframe_start: thirtyDaysAgo.toISOString(),
    timeframe_end: now.toISOString(),
    total_insights: 6,
    actionable_insights: 4,
    completed_actions: 2,
    average_protection_level: 78,
    total_time_saved: 12.5,
    top_categories: {
      protection: 2,
      family: 2,
      documents: 1,
      maintenance: 1,
    },
    trend_data: {
      protection_trend: 'increasing',
      activity_trend: 'stable',
      engagement_trend: 'high',
    },
  };

  const { error } = await supabase.from('insight_analytics').insert(analytics);

  if (error) {
    // console.error('Error seeding insight analytics:', error);
  } else {
    // console.log('Seeded insight analytics');
  }
}

async function seedMilestoneAnalytics(userId: string) {
  // console.log('Seeding milestone analytics...');

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const analytics = {
    user_id: userId,
    timeframe_start: thirtyDaysAgo.toISOString(),
    timeframe_end: now.toISOString(),
    milestones_completed: 3,
    average_completion_time_hours: 48,
    completion_rate: 65,
    most_active_category: 'protection',
    preferred_difficulty: 'medium',
    completion_trend: 'improving',
    total_protection_increase: 15,
    total_time_saved: 12,
    features_unlocked: {
      professional_network: true,
      family_sharing: true,
      automated_reminders: true,
    },
    celebration_engagement: 85,
    recommendation_follow_rate: 70,
  };

  const { error } = await supabase
    .from('milestone_analytics')
    .insert(analytics);

  if (error) {
    // console.error('Error seeding milestone analytics:', error);
  } else {
    // console.log('Seeded milestone analytics');
  }
}

async function main() {
  // console.log('Starting seed process...');

  // Get the first user to use for seeding
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (userError || !users || users.length === 0) {
    // console.error('No users found. Please create a user first.');
    return;
  }

  const userId = users[0].id;
  // console.log(`Using user ID: ${userId}`);

  try {
    // Check if tables exist by attempting to query them
    const { error: tableCheckError } = await supabase
      .from('quick_insights')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === '42P01') {
      // console.error('Tables do not exist. Please run migrations first.');
      // console.log('Run: supabase db push --linked');
      return;
    }

    // Clear existing data (optional)
    // console.log('Clearing existing seed data...');
    await supabase.from('quick_insights').delete().eq('user_id', userId);
    await supabase.from('legacy_milestones').delete().eq('user_id', userId);
    await supabase.from('insight_analytics').delete().eq('user_id', userId);
    await supabase.from('milestone_analytics').delete().eq('user_id', userId);

    // Seed data
    await seedQuickInsights(userId);
    await seedLegacyMilestones(userId);
    await seedInsightAnalytics(userId);
    await seedMilestoneAnalytics(userId);

    // console.log('✅ Seed process completed successfully!');
  } catch (_error) {
    // console.error('Error during seed process:', _error);
    process.exit(1);
  }
}

main();
