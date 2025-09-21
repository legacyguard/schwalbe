/**
 * Unified Error Handling System
 * Provides consistent error types and handling across the application
 */

export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_SERVER_ERROR = 'NETWORK_SERVER_ERROR',

  // Validation errors
  VALIDATION_REQUIRED = 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_TOO_LONG = 'VALIDATION_TOO_LONG',

  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // System errors
  SYSTEM_DATABASE_ERROR = 'SYSTEM_DATABASE_ERROR',
  SYSTEM_ENCRYPTION_ERROR = 'SYSTEM_ENCRYPTION_ERROR',
  SYSTEM_UNKNOWN_ERROR = 'SYSTEM_UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}

// Specific error classes for different domains
export class AuthError extends AppError {
  constructor(message: string, code: ErrorCode, context?: ErrorContext) {
    super(message, code, ErrorSeverity.HIGH, context);
    this.name = 'AuthError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code: ErrorCode, context?: ErrorContext) {
    super(message, code, ErrorSeverity.MEDIUM, context);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string, context?: ErrorContext) {
    super(message, ErrorCode.VALIDATION_INVALID_FORMAT, ErrorSeverity.LOW, context);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class BusinessError extends AppError {
  constructor(message: string, code: ErrorCode, context?: ErrorContext) {
    super(message, code, ErrorSeverity.MEDIUM, context);
    this.name = 'BusinessError';
  }
}

// Error factory functions for common scenarios
export const createAuthError = {
  invalidCredentials: (context?: ErrorContext) =>
    new AuthError('Invalid email or password', ErrorCode.AUTH_INVALID_CREDENTIALS, context),

  sessionExpired: (context?: ErrorContext) =>
    new AuthError('Session has expired', ErrorCode.AUTH_SESSION_EXPIRED, context),

  unauthorized: (context?: ErrorContext) =>
    new AuthError('Unauthorized access', ErrorCode.AUTH_UNAUTHORIZED, context)
};

export const createNetworkError = {
  timeout: (context?: ErrorContext) =>
    new NetworkError('Request timeout', ErrorCode.NETWORK_TIMEOUT, context),

  offline: (context?: ErrorContext) =>
    new NetworkError('No internet connection', ErrorCode.NETWORK_OFFLINE, context),

  serverError: (statusCode: number, context?: ErrorContext) =>
    new NetworkError(`Server error: ${statusCode}`, ErrorCode.NETWORK_SERVER_ERROR, context)
};

export const createValidationError = {
  required: (field: string, context?: ErrorContext) =>
    new ValidationError(`${field} is required`, field, context),

  invalidFormat: (field: string, expectedFormat: string, context?: ErrorContext) =>
    new ValidationError(`${field} must be in ${expectedFormat} format`, field, context),

  tooLong: (field: string, maxLength: number, context?: ErrorContext) =>
    new ValidationError(`${field} must be less than ${maxLength} characters`, field, context)
};

// Error handling utilities
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function getErrorCode(error: unknown): ErrorCode | undefined {
  if (isAppError(error)) {
    return error.code;
  }
  return undefined;
}

export function shouldRetry(error: unknown): boolean {
  if (!isAppError(error)) return false;

  // Retry network errors and timeouts
  return [
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.NETWORK_SERVER_ERROR
  ].includes(error.code);
}

export function getRetryDelay(error: unknown, attempt: number): number {
  if (!shouldRetry(error)) return 0;

  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

  return delay;
}