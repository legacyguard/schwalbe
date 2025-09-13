// Protocol Inactivity Checker API Contract
// POST /api/emergency/protocol-inactivity-checker

export interface FamilyShieldSettings {
  id: string;
  user_id: string;
  inactivity_period_months: number;
  required_guardians_for_activation: number;
  is_shield_enabled: boolean;
  last_activity_check: string;
  shield_status: 'inactive' | 'pending_verification' | 'active';
}

export interface Guardian {
  id: string;
  user_id: string;
  name: string;
  email: string;
  can_trigger_emergency: boolean;
  emergency_contact_priority: number;
}

export interface ProtocolInactivityCheckResponse {
  message: string;
  processed: number;
  triggered: number;
}

export interface ProtocolInactivityCheckError {
  error: string;
}

// HTTP Status Codes
export const PROTOCOL_CHECK_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
} as const;

// Error Messages
export const PROTOCOL_CHECK_ERRORS = {
  PROTOCOL_ERROR: 'Error fetching protocol users',
  USER_ERROR: 'Error processing user',
  INTERNAL_ERROR: 'Error in inactivity checker',
} as const;

// Contract Validation
export interface ContractValidation {
  response: ProtocolInactivityCheckResponse | ProtocolInactivityCheckError;
  status: keyof typeof PROTOCOL_CHECK_STATUS;
}

// Example Response
export const exampleResponse: ProtocolInactivityCheckResponse = {
  message: 'Inactivity check completed',
  processed: 10,
  triggered: 3,
};