/**
 * Guardian Types - Emergency contacts and family protection
 */

export interface Guardian {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  notes?: string;
  is_active: boolean;
  can_trigger_emergency: boolean;
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  emergency_contact_priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGuardianRequest {
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  notes?: string;
  can_trigger_emergency?: boolean;
  can_access_health_docs?: boolean;
  can_access_financial_docs?: boolean;
  is_child_guardian?: boolean;
  is_will_executor?: boolean;
  emergency_contact_priority?: number;
}

export interface UpdateGuardianRequest {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  is_active?: boolean;
  can_trigger_emergency?: boolean;
  can_access_health_docs?: boolean;
  can_access_financial_docs?: boolean;
  is_child_guardian?: boolean;
  is_will_executor?: boolean;
  emergency_contact_priority?: number;
}

export interface GuardianSyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}