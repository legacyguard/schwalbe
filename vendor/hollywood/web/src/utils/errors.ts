
/**
 * Custom Error Classes for LegacyGuard
 * Provides structured error handling across the application
 */

export class LegacyGuardError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'LegacyGuardError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends LegacyGuardError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends LegacyGuardError {
  constructor(
    message: string = 'Authentication required',
    details?: Record<string, any>
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends LegacyGuardError {
  constructor(
    message: string = 'Access denied',
    details?: Record<string, any>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends LegacyGuardError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends LegacyGuardError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends LegacyGuardError {
  constructor(retryAfter?: number) {
    super('Too many requests', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends LegacyGuardError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends LegacyGuardError {
  constructor(
    service: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(
      `External service ${service} error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service, details }
    );
    this.name = 'ExternalServiceError';
  }
}

export class EncryptionError extends LegacyGuardError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'ENCRYPTION_ERROR', 500, details);
    this.name = 'EncryptionError';
  }
}

// Error handling utilities
export function isLegacyGuardError(error: any): error is LegacyGuardError {
  return error instanceof LegacyGuardError;
}

export function createErrorFromUnknown(error: any): LegacyGuardError {
  if (error instanceof LegacyGuardError) {
    return error;
  }

  if (error instanceof Error) {
    return new LegacyGuardError(error.message, 'UNKNOWN_ERROR', 500, {
      originalError: error.name,
    });
  }

  return new LegacyGuardError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { error }
  );
}

// Error codes mapping
export const ErrorCodes = {
  // Validation errors (400-499)
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  // Authentication errors (401)
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  PROFESSIONAL_NOT_VERIFIED: 'PROFESSIONAL_NOT_VERIFIED',
  // Not found errors (404)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ESTATE_PLAN_NOT_FOUND: 'ESTATE_PLAN_NOT_FOUND',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',
  BENEFICIARY_NOT_FOUND: 'BENEFICIARY_NOT_FOUND',
  // Conflict errors (409)
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
  // Rate limiting (429)
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  UPLOAD_RATE_LIMIT: 'UPLOAD_RATE_LIMIT',
  // Server errors (500)
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Error response formatter
export function formatErrorResponse(error: LegacyGuardError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp.toISOString(),
    },
  };
}

// Retry configuration
export interface RetryConfig {
  backoff: 'exponential' | 'linear';
  delay: number;
  maxAttempts: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
};

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  getRetryDelay: (attempt: number, config: RetryConfig) => number;
  shouldRetry: (error: LegacyGuardError) => boolean;
}

export const defaultRecoveryStrategy: ErrorRecoveryStrategy = {
  shouldRetry: error => {
    return error.statusCode >= 500 || error.code === 'RATE_LIMIT';
  },
  getRetryDelay: (attempt, config) => {
    const baseDelay = config.delay;
    if (config.backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempt - 1);
    }
    return baseDelay * attempt;
  },
};
