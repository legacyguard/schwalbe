// Family Shield Activation API Contract
// POST /api/emergency/activate-shield

export interface FamilyShieldActivationRequest {
  user_id: string;
  guardian_id: string;
  activation_reason: 'manual' | 'inactivity' | 'health_check' | 'emergency';
  personality_mode?: 'empathetic' | 'pragmatic' | 'adaptive';
  custom_message?: string;
}

export interface GuardianPermissions {
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
}

export interface FamilyShieldActivationResponse {
  success: boolean;
  data: {
    token_id: string;
    access_token: string;
    verification_code: string;
    expires_at: string;
    guardian_name: string;
    guardian_email: string;
    permissions: GuardianPermissions;
    message: string;
  };
}

export interface FamilyShieldActivationError {
  error: string;
}

// HTTP Status Codes
export const FAMILY_SHIELD_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Error Messages
export const FAMILY_SHIELD_ERRORS = {
  MISSING_FIELDS: 'Missing required fields',
  USER_NOT_FOUND: 'User not found',
  GUARDIAN_NOT_FOUND: 'Guardian not found or not authorized',
  TOKEN_CREATION_FAILED: 'Failed to create access token',
  NOTIFICATION_FAILED: 'Failed to send notification',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// Activation Reasons
export const ACTIVATION_REASONS = {
  MANUAL: 'manual',
  INACTIVITY: 'inactivity',
  HEALTH_CHECK: 'health_check',
  EMERGENCY: 'emergency',
} as const;

// Personality Modes
export const PERSONALITY_MODES = {
  EMPATHETIC: 'empathetic',
  PRAGMATIC: 'pragmatic',
  ADAPTIVE: 'adaptive',
} as const;

// Contract Validation
export interface ContractValidation {
  request: FamilyShieldActivationRequest;
  response: FamilyShieldActivationResponse | FamilyShieldActivationError;
  status: keyof typeof FAMILY_SHIELD_STATUS;
}

// Example Usage
export const exampleRequest: FamilyShieldActivationRequest = {
  user_id: 'user-123',
  guardian_id: 'guardian-456',
  activation_reason: 'inactivity',
  personality_mode: 'adaptive',
  custom_message: 'Please help coordinate family matters during this difficult time.',
};

export const exampleResponse: FamilyShieldActivationResponse = {
  success: true,
  data: {
    token_id: 'token-789',
    access_token: 'secure-token-abc123',
    verification_code: '123456',
    expires_at: '2024-02-14T10:30:00Z',
    guardian_name: 'Jane Smith',
    guardian_email: 'jane.smith@example.com',
    permissions: {
      can_access_health_docs: true,
      can_access_financial_docs: true,
      is_child_guardian: false,
      is_will_executor: true,
    },
    message: 'Family Shield activated for Jane Smith',
  },
};

// Notification Message Templates
export interface NotificationTemplate {
  subject: string;
  message: string;
}

export const NOTIFICATION_TEMPLATES = {
  empathetic: {
    subject: '💔 Family Needs Your Loving Support',
    message: `Dear [Guardian Name],

I'm reaching out to you during what may be a very difficult time. [User Name] has designated you as a trusted guardian, and our Family Shield system has been activated.

This means [User Name] may need help, and your caring support could make all the difference right now.

You've been granted secure access to important information that [User Name] prepared specifically for you. This includes guidance, contacts, and documents to help you support the family during this challenging time.

Your access link: [Access URL]
Verification code: [Verification Code]

Please know that [User Name] chose you because they trust your loving heart. Take your time, and remember - you're not alone in this.

With love and support,
The LegacyGuard Family Shield System 💚`,
  },

  pragmatic: {
    subject: '🚨 EMERGENCY ACTIVATION: Family Shield Access',
    message: `Guardian [Guardian Name],

Family Shield Protocol has been activated for [User Name]. You are required to take immediate action.

ACTIVATION REASON: [Activation Reason]
ACCESS EXPIRES: [Expiration Date]

Your secured access credentials:
- Access URL: [Access URL]
- Verification Code: [Verification Code]
- Permission Level: [Permissions]

This system contains:
- Emergency contact directory
- Critical document access
- Family guidance manual
- Step-by-step protocols

Time-sensitive response required. All access is monitored and logged for security.

LegacyGuard Emergency System`,
  },

  adaptive: {
    subject: '⚠️ Family Shield Activated: Your Help is Needed',
    message: `Hi [Guardian Name],

I hope this message finds you well. I'm writing because [User Name] has activated their Family Shield emergency system, and you've been designated as a trusted guardian.

This activation means [User Name] may need support, and they've prepared important information specifically for you to help during this time.

You now have secure access to:
• Emergency contacts and guidance
• Important documents [User Name] wanted you to have
• A detailed family manual with step-by-step instructions
• All the resources you need to help coordinate support

Access your guardian portal here:
[Access URL]

Use verification code: [Verification Code]

[User Name] chose you because they trust you completely. Take things one step at a time, and don't hesitate to reach out to the other contacts for help.

Thank you for being such an important part of [User Name]'s support network.

Warm regards,
LegacyGuard Family Shield System`,
  },
} as const;