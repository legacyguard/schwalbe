
export type EmergencyTriggerType =
  | 'admin_override'
  | 'health_check_failure'
  | 'inactivity_detected'
  | 'manual_guardian';
export type EmergencyStatus =
  | 'cancelled'
  | 'confirmed'
  | 'expired'
  | 'pending'
  | 'rejected';
export type ShieldStatus =
  | 'active'
  | 'inactive'
  | 'pending_verification'
  | 'triggered';

// Core Emergency Detection Types
export interface EmergencyDetectionRule {
  description: string;
  id: string;
  is_enabled: boolean;
  name: string;
  response_actions: EmergencyResponseAction[];
  rule_type:
    | 'guardian_manual'
    | 'health_check'
    | 'inactivity'
    | 'suspicious_activity';
  trigger_conditions: EmergencyTriggerCondition[];
}

export interface EmergencyTriggerCondition {
  comparison_operator:
    | 'equal_to'
    | 'greater_than'
    | 'less_than'
    | 'not_equal_to';
  metadata?: Record<string, any>;
  threshold_unit: 'attempts' | 'days' | 'guardians' | 'months' | 'weeks';
  threshold_value: number;
  type: 'activity_based' | 'document_based' | 'guardian_based' | 'time_based';
}

export interface EmergencyResponseAction {
  delay_minutes: number;
  message_template?: string;
  metadata?: Record<string, any>;
  priority: number;
  target_guardians?: string[]; // Guardian IDs
  type:
    | 'activate_shield'
    | 'create_alert'
    | 'log_event'
    | 'notify_guardians'
    | 'send_email';
}

// Emergency Activation System
export interface EmergencyActivation {
  confirmed_at?: null | string;
  created_at: string;
  expired_at?: null | string;
  guardian_email?: null | string;
  guardian_id?: null | string;
  guardian_name?: null | string;
  id: string;
  ip_address?: null | string;
  notes?: null | string;
  status: EmergencyStatus;
  token_expires_at: string;
  trigger_type: EmergencyTriggerType;
  user_agent?: null | string;
  user_id: string;
  verification_token: string;
}

// Emergency Dashboard Types
export interface EmergencyDashboardData {
  access_permissions: GuardianPermissions;
  activation_details: EmergencyActivation;
  available_documents: EmergencyDocument[];
  contact_information: EmergencyContact[];
  time_capsules: EmergencyTimeCapsule[];
  user_info: {
    email: string;
    last_activity: string;
    name: string;
    shield_status: ShieldStatus;
  };
}

export interface EmergencyDocument {
  access_level: 'financial' | 'general' | 'health' | 'legal' | 'personal';
  description?: string;
  document_type: string;
  file_name: string;
  id: string;
  is_accessible: boolean;
  last_updated: string;
}

export interface GuardianPermissions {
  can_access_financial_docs: boolean;
  can_access_health_docs: boolean;
  can_trigger_emergency: boolean;
  emergency_contact_priority: number;
  is_child_guardian: boolean;
  is_will_executor: boolean;
}

export interface EmergencyContact {
  email: string;
  is_notified: boolean;
  name: string;
  phone?: string;
  priority: number;
  relationship: string;
}

export interface EmergencyTimeCapsule {
  access_token: string;
  created_at: string;
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  id: string;
  is_available: boolean;
  message_preview?: string;
  message_title: string;
}

// Detection Engine Configuration
export interface DetectionEngineConfig {
  cooldown_period_hours: number;
  guardian_verification_timeout_days: number;
  health_check_frequency_hours: number;
  inactivity_threshold_days: number;
  max_activation_attempts: number;
  notification_escalation_hours: number[];
}

export interface ActivityTracker {
  activity_score: number; // Weighted score based on recent activity
  consecutive_missed_checks: number;
  health_check_status: 'critical' | 'healthy' | 'unresponsive' | 'warning';
  inactivity_days: number;
  last_api_activity: string;
  last_document_access: string;
  last_login: string;
  user_id: string;
}

// Guardian Notification System
export interface GuardianNotification {
  action_required: boolean;
  action_url?: string;
  delivery_method: 'all' | 'email' | 'push' | 'sms';
  expires_at?: string;
  guardian_id: string;
  id: string;
  message: string;
  notification_type:
    | 'activation_request'
    | 'shield_activated'
    | 'status_update'
    | 'verification_needed';
  priority: 'high' | 'low' | 'medium' | 'urgent';
  read_at?: string;
  responded_at?: string;
  sent_at?: string;
  title: string;
  user_id: string;
  verification_token?: string;
}

// Survivor Interface Types
export interface SurvivorAccessRequest {
  purpose?: string;
  relationship?: string;
  requested_access_types: string[];
  requester_email?: string;
  requester_name?: string;
  token: string;
}

export interface SurvivorInterface {
  available_resources: SurvivorResource[];
  emergency_contacts: EmergencyContact[];
  guidance_entries: SurvivorGuidanceEntry[];
  important_documents: EmergencyDocument[];
  time_capsules: EmergencyTimeCapsule[];
  user_info: {
    memorial_message?: string;
    name: string;
    profile_photo_url?: string;
  };
}

export interface SurvivorResource {
  access_level: 'guardian_verified' | 'immediate' | 'legal_required';
  category:
    | 'contacts'
    | 'financial'
    | 'instructions'
    | 'legal'
    | 'medical'
    | 'personal';
  description: string;
  id: string;
  is_available: boolean;
  metadata?: Record<string, any>;
  resource_type: 'contact' | 'document' | 'instruction' | 'time_capsule';
  title: string;
}

export interface SurvivorGuidanceEntry {
  category: string;
  completion_notes?: string;
  content: string;
  created_at: string;
  id: string;
  is_completed: boolean;
  priority: number;
  related_documents: string[];
  title: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateEmergencyActivationRequest {
  guardian_id?: string;
  notes?: string;
  trigger_type: EmergencyTriggerType;
  user_id: string;
}

export interface ConfirmEmergencyActivationRequest {
  additional_notes?: string;
  guardian_confirmation: boolean;
  verification_token: string;
}

export interface EmergencyActivationResponse {
  activation_id?: string;
  expires_at?: string;
  message: string;
  next_steps?: string[];
  success: boolean;
  verification_token?: string;
}

// Health Check System
export interface UserHealthCheck {
  check_type: 'api_ping' | 'document_access' | 'login' | 'manual_confirmation';
  metadata?: Record<string, any>;
  responded_at?: string;
  response_method?: string;
  scheduled_at: string;
  status: 'missed' | 'pending' | 'responded';
  user_id: string;
}

export const DEFAULT_DETECTION_CONFIG: DetectionEngineConfig = {
  inactivity_threshold_days: 180, // 6 months
  health_check_frequency_hours: 24, // Daily check
  guardian_verification_timeout_days: 7,
  max_activation_attempts: 3,
  cooldown_period_hours: 24,
  notification_escalation_hours: [0, 24, 72, 168], // Immediate, 1 day, 3 days, 1 week
};

export const EMERGENCY_PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type EmergencyPriority =
  (typeof EMERGENCY_PRIORITY_LEVELS)[keyof typeof EMERGENCY_PRIORITY_LEVELS];
