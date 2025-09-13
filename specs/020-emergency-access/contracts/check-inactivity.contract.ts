// Check Inactivity API Contract
// POST /api/emergency/check-inactivity

export interface InactivityCheckResult {
  userId: string;
  lastSignIn: string;
  daysSinceLastSignIn: number;
  inactivityPeriodMonths: number;
  shouldNotify: boolean;
  guardianEmails?: string[];
}

export interface InactivityCheckResponse {
  success: boolean;
  checked: number;
  notificationsTriggered: number;
  results: InactivityCheckResult[];
}

export interface InactivityCheckError {
  error: string;
  success: boolean;
}

// HTTP Status Codes
export const INACTIVITY_CHECK_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
} as const;

// Error Messages
export const INACTIVITY_CHECK_ERRORS = {
  SETTINGS_ERROR: 'Failed to fetch shield settings',
  USER_ERROR: 'Failed to fetch user data',
  INTERNAL_ERROR: 'Error in check-inactivity function',
} as const;

// Contract Validation
export interface ContractValidation {
  response: InactivityCheckResponse | InactivityCheckError;
  status: keyof typeof INACTIVITY_CHECK_STATUS;
}

// Example Response
export const exampleResponse: InactivityCheckResponse = {
  success: true,
  checked: 5,
  notificationsTriggered: 2,
  results: [
    {
      userId: 'user-123',
      lastSignIn: '2024-01-01T10:00:00Z',
      daysSinceLastSignIn: 45,
      inactivityPeriodMonths: 3,
      shouldNotify: true,
      guardianEmails: ['guardian1@example.com', 'guardian2@example.com'],
    },
  ],
};