// Emergency system types for Dead Man Switch functionality
// Migrated from Hollywood project with adaptations for Schwalbe

export interface EmergencyRule {
  id: string;
  user_id: string;
  rule_name: string;
  description?: string;
  rule_type: 'inactivity' | 'health_check' | 'guardian_manual' | 'suspicious_activity';
  is_enabled: boolean;
  trigger_conditions: TriggerCondition[];
  response_actions: ResponseAction[];
  priority: number;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface TriggerCondition {
  type: string;
  threshold_value: number;
  threshold_unit: string;
  comparison_operator: string;
}

export interface ResponseAction {
  type: string;
  priority: number;
  delay_minutes: number;
}

export interface HealthCheckStatus {
  id: string;
  user_id: string;
  check_type: 'login' | 'document_access' | 'api_ping' | 'manual_confirmation';
  status: 'responded' | 'missed' | 'pending';
  scheduled_at: string;
  responded_at?: string;
  response_method?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FamilyShieldSettings {
  id: string;
  user_id: string;
  inactivity_period_months: number;
  required_guardians_for_activation: number;
  is_shield_enabled: boolean;
  last_activity_check: string;
  shield_status: 'inactive' | 'pending_verification' | 'active';
  created_at: string;
  updated_at: string;
}

export interface GuardianNotification {
  id: string;
  guardian_id: string;
  user_id: string;
  notification_type: 'activation_request' | 'verification_needed' | 'shield_activated' | 'status_update';
  title: string;
  message: string;
  action_required: boolean;
  action_url?: string;
  verification_token?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  delivery_method: 'email' | 'sms' | 'push' | 'all';
  sent_at?: string;
  read_at?: string;
  responded_at?: string;
  expires_at?: string;
  delivery_error?: string;
  attempted_at?: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
}

export interface SurvivorAccessRequest {
  id: string;
  user_id: string;
  access_token: string;
  requester_email: string;
  requester_name?: string;
  relationship?: string;
  purpose: string;
  requested_access_types: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface EmergencyAccessAudit {
  id: string;
  user_id: string;
  accessor_type: 'guardian' | 'survivor' | 'system' | 'admin';
  accessor_id?: string;
  access_type: string;
  resource_type: string;
  resource_id?: string;
  action: 'view' | 'download' | 'modify' | 'delete' | 'create';
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Dead Man Switch component props
export interface DeadMansSwitchProps {
  className?: string;
  onEmergencyTriggered?: (ruleId: string) => void;
  onHealthCheckMissed?: (checkId: string) => void;
  personalityMode?: 'empathetic' | 'pragmatic' | 'adaptive';
}

// Activity recording types
export interface ActivityRecord {
  user_id: string;
  activity_type: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Emergency system status
export type EmergencySystemStatus = 'active' | 'inactive' | 'pending' | 'triggered';

// Notification types for UI
export interface EmergencyNotification {
  id: string;
  type: 'warning' | 'alert' | 'confirmation';
  title: string;
  message: string;
  action_required: boolean;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
