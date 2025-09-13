// Emergency Access Verification API Contract
// POST /api/emergency/verify-access

export interface VerifyEmergencyAccessRequest {
  token: string;
  verification_code?: string;
}

export interface GuardianPermissions {
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
}

export interface EmergencyAccessData {
  user_name: string;
  guardian_name: string;
  guardian_permissions: GuardianPermissions;
  activation_date: string;
  expires_at: string;
  survivor_manual: {
    html_content: string;
    entries_count: number;
    generated_at: string;
  };
  documents: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
    created_at: string;
    encrypted_url?: string;
  }>;
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    email: string;
    phone?: string;
    can_help_with: string[];
  }>;
}

export interface VerifyEmergencyAccessResponse {
  data: EmergencyAccessData;
}

export interface EmergencyAccessError {
  error: string;
  needs_verification?: boolean;
}

// HTTP Status Codes
export const EMERGENCY_ACCESS_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Error Messages
export const EMERGENCY_ACCESS_ERRORS = {
  TOKEN_REQUIRED: 'Token is required',
  INVALID_TOKEN: 'Invalid or expired access token',
  TOKEN_EXPIRED: 'Access token has expired',
  VERIFICATION_REQUIRED: 'Verification code required',
  INVALID_VERIFICATION: 'Invalid verification code',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to access this document category',
  DOCUMENT_NOT_FOUND: 'Document not found or access denied',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// Contract Validation
export interface ContractValidation {
  request: VerifyEmergencyAccessRequest;
  response: VerifyEmergencyAccessResponse | EmergencyAccessError;
  status: keyof typeof EMERGENCY_ACCESS_STATUS;
}

// Example Usage
export const exampleRequest: VerifyEmergencyAccessRequest = {
  token: 'abc123-def456-ghi789',
  verification_code: '123456',
};

export const exampleResponse: VerifyEmergencyAccessResponse = {
  data: {
    user_name: 'John Doe',
    guardian_name: 'Jane Smith',
    guardian_permissions: {
      can_access_health_docs: true,
      can_access_financial_docs: true,
      is_child_guardian: false,
      is_will_executor: true,
    },
    activation_date: '2024-01-15T10:30:00Z',
    expires_at: '2024-02-14T10:30:00Z',
    survivor_manual: {
      html_content: '<html><body><h1>Survivor Manual</h1>...</body></html>',
      entries_count: 15,
      generated_at: '2024-01-15T09:00:00Z',
    },
    documents: [
      {
        id: 'doc-123',
        title: 'Last Will and Testament',
        type: 'pdf',
        category: 'legal',
        created_at: '2024-01-10T14:20:00Z',
        encrypted_url: 'https://storage.example.com/documents/encrypted/doc-123.pdf',
      },
    ],
    emergency_contacts: [
      {
        name: 'Emergency Contact 1',
        relationship: 'spouse',
        email: 'spouse@example.com',
        phone: '+1-555-0123',
        can_help_with: ['medical', 'financial', 'legal'],
      },
    ],
  },
};