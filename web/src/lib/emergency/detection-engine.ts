
import { createClient } from '@supabase/supabase-js';
import {
  type ActivityTracker,
  DEFAULT_DETECTION_CONFIG,
  type DetectionEngineConfig,
  type EmergencyActivation,
  type EmergencyTriggerType,
  type ShieldStatus,
  type UserHealthCheck,
} from '@/types/emergency';

export class EmergencyDetectionEngine {
  private config: DetectionEngineConfig;
  private supabaseUrl: string;
  private supabaseServiceKey: string;

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    config: Partial<DetectionEngineConfig> = {}
  ) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseServiceKey = supabaseServiceKey;
    this.config = { ...DEFAULT_DETECTION_CONFIG, ...config };
  }

  private getServiceClient() {
    return createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async checkUserActivity(userId: string): Promise<ActivityTracker> {
    const supabase = this.getServiceClient();

    // Get user's last activities from various sources
    const [authResponse, documentsResponse, profileResponse] =
      await Promise.all([
        // Check last authentication activity
        supabase.auth.admin.getUserById(userId),

        // Check last document access
        supabase
          .from('documents')
          .select('updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1),

        // Check profile/settings activity
        supabase
          .from('profiles')
          .select('updated_at, last_seen_at')
          .eq('user_id', userId)
          .single(),
      ]);

    const now = new Date();
    const lastLogin = authResponse.data.user?.last_sign_in_at
      ? new Date(authResponse.data.user.last_sign_in_at)
      : new Date(0);

    const lastDocumentAccess = documentsResponse.data?.[0]?.updated_at
      ? new Date(documentsResponse.data[0].updated_at)
      : new Date(0);

    const lastProfileActivity = profileResponse.data?.last_seen_at
      ? new Date(profileResponse.data.last_seen_at)
      : new Date(0);

    // Calculate the most recent activity
    const lastActivity = new Date(
      Math.max(
        lastLogin.getTime(),
        lastDocumentAccess.getTime(),
        lastProfileActivity.getTime()
      )
    );

    // Calculate inactivity days
    const inactivityMs = now.getTime() - lastActivity.getTime();
    const inactivityDays = Math.floor(inactivityMs / (1000 * 60 * 60 * 24));

    // Calculate activity score (0-100)
    let activityScore = 100;
    if (inactivityDays > 0) {
      activityScore = Math.max(
        0,
        100 - (inactivityDays / this.config.inactivity_threshold_days) * 100
      );
    }

    // Determine health check status
    let healthCheckStatus: ActivityTracker['health_check_status'] = 'healthy';
    if (inactivityDays > this.config.inactivity_threshold_days * 0.5) {
      healthCheckStatus = 'warning';
    }
    if (inactivityDays > this.config.inactivity_threshold_days * 0.8) {
      healthCheckStatus = 'critical';
    }
    if (inactivityDays > this.config.inactivity_threshold_days) {
      healthCheckStatus = 'unresponsive';
    }

    // Get consecutive missed health checks
    const { data: healthChecks } = await supabase
      .from('user_health_checks')
      .select('status')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })
      .limit(10);

    const consecutiveMissed = this.calculateConsecutiveMissed(
      healthChecks?.map(check => check.status) || []
    );

    return {
      user_id: userId,
      last_login: lastLogin.toISOString(),
      last_document_access: lastDocumentAccess.toISOString(),
      last_api_activity: lastActivity.toISOString(),
      activity_score: activityScore,
      inactivity_days: inactivityDays,
      health_check_status: healthCheckStatus,
      consecutive_missed_checks: consecutiveMissed,
    };
  }

  private calculateConsecutiveMissed(statuses: string[]): number {
    let consecutive = 0;
    for (const status of statuses) {
      if (status === 'missed') {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  }

  async evaluateEmergencyTriggers(userId: string): Promise<{
    reasons: string[];
    recommendations: string[];
    severity: 'critical' | 'high' | 'low' | 'medium';
    shouldTrigger: boolean;
    triggerType: EmergencyTriggerType | null;
  }> {
    const supabase = this.getServiceClient();

    // Get user's shield settings
    const { data: shieldSettings } = await supabase
      .from('family_shield_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!shieldSettings?.is_shield_enabled) {
      return {
        shouldTrigger: false,
        triggerType: null,
        severity: 'low',
        reasons: ['Emergency shield is not enabled'],
        recommendations: ['Enable Emergency Shield in settings'],
      };
    }

    const activityTracker = await this.checkUserActivity(userId);
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let severity: 'critical' | 'high' | 'low' | 'medium' = 'low';
    let shouldTrigger = false;
    let triggerType: EmergencyTriggerType | null = null;

    // Check inactivity-based triggers
    const inactivityThreshold = shieldSettings.inactivity_period_months * 30; // Convert to days

    if (activityTracker.inactivity_days > inactivityThreshold) {
      shouldTrigger = true;
      triggerType = 'inactivity_detected';
      severity = 'critical';
      reasons.push(
        `User inactive for ${activityTracker.inactivity_days} days (threshold: ${inactivityThreshold})`
      );
      recommendations.push('Immediate guardian notification required');
    } else if (activityTracker.inactivity_days > inactivityThreshold * 0.8) {
      severity = 'high';
      reasons.push(
        `User approaching inactivity threshold: ${activityTracker.inactivity_days}/${inactivityThreshold} days`
      );
      recommendations.push('Send warning notification to user');
    } else if (activityTracker.inactivity_days > inactivityThreshold * 0.5) {
      severity = 'medium';
      reasons.push(
        `Extended inactivity detected: ${activityTracker.inactivity_days} days`
      );
      recommendations.push('Send gentle activity reminder');
    }

    // Check health check failures
    if (activityTracker.consecutive_missed_checks >= 5) {
      shouldTrigger = true;
      triggerType = 'health_check_failure';
      severity = 'high';
      reasons.push(
        `${activityTracker.consecutive_missed_checks} consecutive missed health checks`
      );
      recommendations.push('Escalate to guardian verification');
    } else if (activityTracker.consecutive_missed_checks >= 3) {
      severity = 'medium';
      reasons.push(
        `${activityTracker.consecutive_missed_checks} missed health checks`
      );
      recommendations.push('Increase health check frequency');
    }

    // Check for existing pending activations
    const { data: pendingActivations } = await supabase
      .from('family_shield_activation_log')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte(
        'created_at',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (pendingActivations && pendingActivations.length > 0) {
      shouldTrigger = false; // Don't trigger if already pending
      reasons.push('Activation already pending guardian verification');
      recommendations.push('Wait for guardian response');
    }

    return {
      shouldTrigger,
      triggerType,
      severity,
      reasons,
      recommendations,
    };
  }

  async triggerEmergencyActivation(
    userId: string,
    triggerType: EmergencyTriggerType,
    guardianId?: string,
    notes?: string
  ): Promise<{ activationId?: string; error?: string; success: boolean }> {
    const supabase = this.getServiceClient();

    try {
      // Check if user has emergency-enabled guardians
      const { data: guardians } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('can_trigger_emergency', true)
        .order('emergency_contact_priority', { ascending: true });

      if (!guardians || guardians.length === 0) {
        return {
          success: false,
          error: 'No emergency-enabled guardians configured',
        };
      }

      // Get shield settings to check requirements
      const { data: shieldSettings } = await supabase
        .from('family_shield_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!shieldSettings?.is_shield_enabled) {
        return {
          success: false,
          error: 'Emergency shield is not enabled',
        };
      }

      // Create activation log entry
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + this.config.guardian_verification_timeout_days
      );

      const guardianInfo =
        guardians.find(g => g.id === guardianId) || guardians[0];

      const { data: activation, error: activationError } = await supabase
        .from('family_shield_activation_log')
        .insert({
          user_id: userId,
          guardian_id: guardianInfo.id,
          activation_type: triggerType,
          verification_token: verificationToken,
          token_expires_at: expiresAt.toISOString(),
          guardian_email: guardianInfo.email,
          guardian_name: guardianInfo.name,
          notes: notes || `Automatic activation triggered: ${triggerType}`,
        })
        .select()
        .single();

      if (activationError || !activation) {
        return {
          success: false,
          error: activationError?.message || 'Failed to create activation log',
        };
      }

      // Update shield status to pending verification
      await supabase
        .from('family_shield_settings')
        .update({
          shield_status: 'pending_verification',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Queue guardian notifications (to be handled by notification service)
      await this.queueGuardianNotifications(userId, activation.id, guardians);

      return {
        success: true,
        activationId: activation.id,
      };
    } catch (error) {
      console.error('Error triggering emergency activation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async queueGuardianNotifications(
    userId: string,
    activationId: string,
    guardians: any[]
  ): Promise<void> {
    const supabase = this.getServiceClient();

    // Create notification entries for each guardian
    const notifications = guardians.map(guardian => ({
      guardian_id: guardian.id,
      user_id: userId,
      activation_id: activationId,
      notification_type: 'activation_request',
      title: 'Emergency Activation Request',
      message: `Emergency activation requested for ${guardian.name}. Please verify and respond within ${this.config.guardian_verification_timeout_days} days.`,
      action_required: true,
      priority: 'urgent',
      delivery_method: 'email',
      expires_at: new Date(
        Date.now() +
          this.config.guardian_verification_timeout_days * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));

    // Insert notification queue entries
    await (supabase as any).from('guardian_notifications').insert(notifications);
  }

  async processHealthCheck(
    userId: string,
    checkType: UserHealthCheck['check_type'],
    responded: boolean = true
  ): Promise<void> {
    const supabase = this.getServiceClient();

    // Record the health check
    await (supabase as any).from('user_health_checks').insert({
      user_id: userId,
      check_type: checkType,
      status: responded ? 'responded' : 'missed',
      scheduled_at: new Date().toISOString(),
      responded_at: responded ? new Date().toISOString() : null,
    });

    // Update last activity in shield settings
    if (responded) {
      await supabase
        .from('family_shield_settings')
        .update({
          last_activity_check: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }

    // If missed, evaluate if emergency triggers should be checked
    if (!responded) {
      const evaluation = await this.evaluateEmergencyTriggers(userId);

      if (evaluation.shouldTrigger && evaluation.triggerType) {
        await this.triggerEmergencyActivation(
          userId,
          evaluation.triggerType,
          undefined,
          `Automatic trigger after health check failure: ${evaluation.reasons.join(', ')}`
        );
      }
    }
  }

  async getActivationStatus(userId: string): Promise<{
    activityScore: number;
    hasActiveShield: boolean;
    lastActivity: string;
    pendingActivations: EmergencyActivation[];
    shieldStatus: ShieldStatus;
  }> {
    const supabase = this.getServiceClient();

    // Get shield settings and status
    const { data: shieldSettings } = await supabase
      .from('family_shield_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get pending activations
    const { data: activations } = await supabase
      .from('family_shield_activation_log')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // Get activity tracker
    const activityTracker = await this.checkUserActivity(userId);

    return {
      hasActiveShield: shieldSettings?.is_shield_enabled || false,
      shieldStatus:
        (shieldSettings?.shield_status as ShieldStatus) || 'inactive',
      pendingActivations: activations || [],
      lastActivity: activityTracker.last_api_activity,
      activityScore: activityTracker.activity_score,
    };
  }
}

export default EmergencyDetectionEngine;
