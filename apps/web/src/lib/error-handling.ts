/**
 * Comprehensive Error Handling System
 * Centralized error types, handlers, and reporting utilities
 */

import { logger } from '@schwalbe/shared'

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  action?: string
  component?: string
  additionalData?: Record<string, any>
}

export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly code: string
  public readonly context: ErrorContext
  public readonly userMessage: string
  public readonly isRetryable: boolean
  public readonly timestamp: Date

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    context: ErrorContext = {},
    userMessage?: string,
    isRetryable = false
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.code = code || type
    this.context = context
    this.userMessage = userMessage || this.getDefaultUserMessage()
    this.isRetryable = isRetryable
    this.timestamp = new Date()

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Network connection failed. Please check your internet connection and try again.'
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.'
      case ErrorType.AUTHENTICATION:
        return 'Please sign in to continue.'
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.'
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.'
      case ErrorType.SERVER_ERROR:
        return 'A server error occurred. Please try again later.'
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.'
      case ErrorType.TIMEOUT:
        return 'Request timeout. Please try again.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      context: this.context,
      userMessage: this.userMessage,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, 'NETWORK_ERROR', context, undefined, true)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 'VALIDATION_ERROR', context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, 'AUTH_ERROR', context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorType.AUTHORIZATION, ErrorSeverity.HIGH, 'AUTHZ_ERROR', context)
  }
}

export class ServerError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorType.SERVER_ERROR, ErrorSeverity.HIGH, 'SERVER_ERROR', context, undefined, true)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, retryAfter?: number, context: ErrorContext = {}) {
    const userMessage = retryAfter
      ? `Rate limit exceeded. Please wait ${retryAfter} seconds and try again.`
      : 'Rate limit exceeded. Please wait and try again.'

    super(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 'RATE_LIMIT_ERROR',
          { ...context, retryAfter }, userMessage, true)
  }
}

/**
 * Error Handler Class for centralized error processing
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorReportingEnabled = true

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle and process errors with appropriate logging and user feedback
   */
  handle(error: Error | AppError, context: ErrorContext = {}): AppError {
    let appError: AppError

    if (error instanceof AppError) {
      appError = error
      // Merge additional context
      appError.context = { ...appError.context, ...context }
    } else {
      appError = this.convertToAppError(error, context)
    }

    // Log the error
    this.logError(appError)

    // Report critical errors
    if (appError.severity === ErrorSeverity.CRITICAL) {
      this.reportError(appError)
    }

    return appError
  }

  /**
   * Convert generic errors to AppError instances
   */
  private convertToAppError(error: Error, context: ErrorContext): AppError {
    // Try to determine error type from message/properties
    if (error.message.includes('fetch')) {
      return new NetworkError(error.message, context)
    }

    if (error.message.includes('timeout')) {
      return new AppError(error.message, ErrorType.TIMEOUT, ErrorSeverity.MEDIUM,
                         'TIMEOUT_ERROR', context, undefined, true)
    }

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new AuthenticationError(error.message, context)
    }

    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return new AuthorizationError(error.message, context)
    }

    if (error.message.includes('404') || error.message.includes('not found')) {
      return new AppError(error.message, ErrorType.NOT_FOUND, ErrorSeverity.LOW,
                         'NOT_FOUND_ERROR', context)
    }

    if (error.message.includes('5') && error.message.includes('server')) {
      return new ServerError(error.message, context)
    }

    // Default to unknown error
    return new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM,
                       'UNKNOWN_ERROR', context)
  }

  /**
   * Log errors with appropriate detail level
   */
  private logError(error: AppError): void {
    const logData = {
      error: error.toJSON(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    switch (error.severity) {
      case ErrorSeverity.LOW:
        logger.debug('Low severity error occurred', logData)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error occurred', logData)
        break
      case ErrorSeverity.HIGH:
        logger.error('High severity error occurred', logData)
        break
      case ErrorSeverity.CRITICAL:
        logger.error('CRITICAL error occurred', logData)
        break
    }
  }

  /**
   * Report critical errors to external monitoring service
   */
  private reportError(error: AppError): void {
    if (!this.errorReportingEnabled) return

    try {
      // In a real app, this would send to Sentry, DataDog, etc.
      // For now, just enhanced logging
      logger.error('CRITICAL ERROR REPORTED', {
        error: error.toJSON(),
        shouldAlert: true,
        alertChannels: ['email', 'slack']
      })
    } catch (reportingError) {
      logger.error('Failed to report critical error', { reportingError })
    }
  }

  /**
   * Create error boundary compatible error info
   */
  createErrorBoundaryInfo(error: Error, errorInfo: { componentStack: string }) {
    return {
      error: this.handle(error, {
        component: 'ErrorBoundary',
        componentStack: errorInfo.componentStack
      }),
      errorInfo
    }
  }

  /**
   * Handle async operation errors with retry logic
   */
  async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<T> {
    let lastError: AppError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.handle(error as Error, { ...context, attempt })

        // Don't retry if error is not retryable
        if (!lastError.isRetryable || attempt === maxRetries) {
          throw lastError
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }

    throw lastError!
  }

  /**
   * Disable error reporting (useful for tests)
   */
  disableReporting(): void {
    this.errorReportingEnabled = false
  }

  /**
   * Enable error reporting
   */
  enableReporting(): void {
    this.errorReportingEnabled = true
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

/**
 * Utility functions for common error handling patterns
 */

export function isRetryableError(error: unknown): boolean {
  return error instanceof AppError && error.isRetryable
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}

/**
 * React Hook for error handling
 */
export function useErrorHandler() {
  const handleError = (error: Error, context: ErrorContext = {}) => {
    return errorHandler.handle(error, context)
  }

  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T> => {
    return errorHandler.handleAsyncOperation(operation, context)
  }

  return {
    handleError,
    handleAsyncError,
    getErrorMessage,
    getErrorCode,
    isRetryableError
  }
}