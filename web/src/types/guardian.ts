
export interface Guardian {
  can_access_financial_docs: boolean;
  can_access_health_docs: boolean;
  // Family Shield permissions
  can_trigger_emergency: boolean;
  created_at: string;
  email: string;
  emergency_contact_priority: number;
  id: string;
  is_active: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  name: string;
  notes?: null | string;
  phone?: null | string;
  relationship?: null | string;
  updated_at: string;
  user_id: string;
}

export interface CreateGuardianRequest {
  can_access_financial_docs?: boolean;
  can_access_health_docs?: boolean;
  // Family Shield permissions
  can_trigger_emergency?: boolean;
  email: string;
  emergency_contact_priority?: number;
  is_child_guardian?: boolean;
  is_will_executor?: boolean;
  name: string;
  notes?: string;
  phone?: string;
  relationship?: string;
}

export interface UpdateGuardianRequest extends Partial<CreateGuardianRequest> {
  is_active?: boolean;
}

export type GuardianRelationship =
  | 'child'
  | 'financial_advisor'
  | 'friend'
  | 'lawyer'
  | 'other'
  | 'parent'
  | 'partner'
  | 'sibling'
  | 'spouse';

export const GUARDIAN_RELATIONSHIPS: {
  label: string;
  value: GuardianRelationship;
}[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'partner', label: 'Partner' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'financial_advisor', label: 'Financial Advisor' },
  { value: 'other', label: 'Other' },
];

// Family Shield types
export interface FamilyShieldSettings {
  created_at: string;
  id: string;
  inactivity_period_months: number;
  is_shield_enabled: boolean;
  last_activity_check: string;
  required_guardians_for_activation: number;
  shield_status: 'active' | 'inactive' | 'pending_verification';
  updated_at: string;
  user_id: string;
}

export interface CreateFamilyShieldSettingsRequest {
  inactivity_period_months?: number;
  is_shield_enabled?: boolean;
  required_guardians_for_activation?: number;
}

export type FamilyShieldActivationType =
  | 'admin_override'
  | 'inactivity_detected'
  | 'manual_guardian';
export type ActivationStatus = 'confirmed' | 'expired' | 'pending' | 'rejected';

export interface FamilyShieldActivationLog {
  activation_type: FamilyShieldActivationType;
  confirmed_at?: null | string;
  created_at: string;
  expired_at?: null | string;
  guardian_email?: null | string;
  guardian_id?: null | string;
  guardian_name?: null | string;
  id: string;
  ip_address?: null | string;
  notes?: null | string;
  status: ActivationStatus;
  token_expires_at: string;
  user_agent?: null | string;
  user_id: string;
  verification_token: string;
}

export type ManualEntryType =
  | 'child_care_instructions'
  | 'custom_instruction'
  | 'document_locations'
  | 'emergency_procedure'
  | 'financial_access'
  | 'funeral_wishes'
  | 'important_contacts'
  | 'property_management';

export interface FamilyGuidanceEntry {
  content: string;
  created_at: string;
  entry_type: ManualEntryType;
  id: string;
  is_auto_generated: boolean;
  is_completed: boolean;
  priority: number;
  related_document_ids: string[];
  tags: string[];
  title: string;
  updated_at: string;
  user_id: string;
}

export interface CreateGuidanceEntryRequest {
  content: string;
  entry_type: ManualEntryType;
  priority?: number;
  related_document_ids?: string[];
  tags?: string[];
  title: string;
}
