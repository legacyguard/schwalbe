// Emergency system service for Dead Man Switch functionality
// Migrated from Hollywood project with adaptations for Schwalbe

import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../lib/logger';
import type {
  EmergencyRule,
  HealthCheckStatus,
  FamilyShieldSettings,
  GuardianNotification,
  SurvivorAccessRequest,
  EmergencyAccessAudit,
  ActivityRecord,
  EmergencySystemStatus,
} from '../types/emergency';

export class EmergencyService {
  constructor(private supabase: SupabaseClient) {}

  // Family Shield Settings
  async getShieldSettings(userId: string): Promise<FamilyShieldSettings | null> {
    const { data, error } = await this.supabase
      .from('family_shield_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching shield settings:', error);
      return null;
    }

    return data;
  }

  async updateShieldSettings(
    userId: string,
    settings: Partial<FamilyShieldSettings>
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('family_shield_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Error updating shield settings:', error);
      return false;
    }

    return true;
  }

  // Emergency Rules
  async getEmergencyRules(userId: string): Promise<EmergencyRule[]> {
    const { data, error } = await this.supabase
      .from('emergency_detection_rules')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true });

    if (error) {
      logger.error('Error fetching emergency rules:', error);
      return [];
    }

    return data || [];
  }

  async updateEmergencyRule(
    ruleId: string,
    updates: Partial<EmergencyRule>
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('emergency_detection_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ruleId);

    if (error) {
      logger.error('Error updating emergency rule:', error);
      return false;
    }

    return true;
  }

  async createEmergencyRule(rule: Omit<EmergencyRule, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('emergency_detection_rules')
      .insert(rule)
      .select('id')
      .single();

    if (error) {
      logger.error('Error creating emergency rule:', error);
      return null;
    }

    return data.id;
  }

  // Health Checks
  async getHealthChecks(userId: string, limit: number = 10): Promise<HealthCheckStatus[]> {
    const { data, error } = await this.supabase
      .from('user_health_checks')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching health checks:', error);
      return [];
    }

    return data || [];
  }

  async recordActivity(activity: ActivityRecord): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_health_checks')
      .insert({
        user_id: activity.user_id,
        check_type: activity.activity_type as any,
        status: 'responded',
        responded_at: new Date().toISOString(),
        response_method: 'dashboard',
        metadata: activity.metadata,
      });

    if (error) {
      logger.error('Error recording activity:', error);
      return false;
    }

    // Update last activity in shield settings
    await this.updateShieldSettings(activity.user_id, {
      last_activity_check: activity.timestamp,
      shield_status: 'active',
    });

    return true;
  }

  // Guardian Notifications
  async getGuardianNotifications(guardianId: string): Promise<GuardianNotification[]> {
    const { data, error } = await this.supabase
      .from('guardian_notifications')
      .select('*')
      .eq('guardian_id', guardianId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching guardian notifications:', error);
      return [];
    }

    return data || [];
  }

  async createGuardianNotification(notification: Omit<GuardianNotification, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('guardian_notifications')
      .insert(notification)
      .select('id')
      .single();

    if (error) {
      logger.error('Error creating guardian notification:', error);
      return null;
    }

    return data.id;
  }

  // Survivor Access Requests
  async getSurvivorAccessRequests(userId: string): Promise<SurvivorAccessRequest[]> {
    const { data, error } = await this.supabase
      .from('survivor_access_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching survivor access requests:', error);
      return [];
    }

    return data || [];
  }

  async createSurvivorAccessRequest(request: Omit<SurvivorAccessRequest, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('survivor_access_requests')
      .insert(request)
      .select('id')
      .single();

    if (error) {
      logger.error('Error creating survivor access request:', error);
      return null;
    }

    return data.id;
  }

  // Audit Logging
  async logEmergencyAccess(audit: Omit<EmergencyAccessAudit, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await this.supabase
      .from('emergency_access_audit')
      .insert(audit);

    if (error) {
      logger.error('Error logging emergency access:', error);
      return false;
    }

    return true;
  }

  // System Status
  async getSystemStatus(userId: string): Promise<EmergencySystemStatus> {
    const settings = await this.getShieldSettings(userId);
    if (!settings) return 'inactive';

    return settings.shield_status as EmergencySystemStatus;
  }

  // Initialize default rules for new user
  async initializeDefaultRules(userId: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('initialize_default_emergency_rules', {
      target_user_id: userId,
    });

    if (error) {
      logger.error('Error initializing default rules:', error);
      return false;
    }

    return true;
  }

  // Check inactivity and trigger notifications
  async checkInactivity(userId: string): Promise<{
    shouldNotify: boolean;
    daysInactive: number;
    lastActivity?: string;
  }> {
    const settings = await this.getShieldSettings(userId);
    if (!settings || !settings.is_shield_enabled) {
      return { shouldNotify: false, daysInactive: 0 };
    }

    const lastActivity = new Date(settings.last_activity_check);
    const daysInactive = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    const thresholdDays = settings.inactivity_period_months * 30;

    return {
      shouldNotify: daysInactive >= thresholdDays,
      daysInactive,
      lastActivity: lastActivity.toISOString(),
    };
  }
}
