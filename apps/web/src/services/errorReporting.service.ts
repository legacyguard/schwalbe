/**
 * Centralized Error Reporting Service
 * Provides consistent error handling, reporting, and user feedback across the application
 */

import {
  logger,
  AppError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  getErrorMessage,
  shouldRetry,
  getRetryDelay,
  createNetworkError,
  createValidationError
} from '@schwalbe/shared'

interface ErrorReportOptions {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
  showUserMessage?: boolean
  userMessage?: string
  severity?: ErrorSeverity
}

interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  exponentialBackoff?: boolean
  retryCondition?: (error: unknown, attempt: number) => boolean
}

interface UserFeedbackOptions {
  toast?: (message: string, type: 'error' | 'warning' | 'success') => void
  showRetryOption?: boolean
  onRetry?: () => void
}

class ErrorReportingService {
  private static instance: ErrorReportingService
  private errorQueue: Array<{ error: unknown; options: ErrorReportOptions; timestamp: Date }> = []
  private isOnline = navigator.onLine

  private constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason, {
        action: 'unhandled_promise_rejection',
        component: 'global',
        severity: ErrorSeverity.HIGH,
        metadata: {
          promise: 'unhandled_rejection'
        }
      })
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        action: 'global_javascript_error',
        component: 'global',
        severity: ErrorSeverity.HIGH,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService()
    }
    return ErrorReportingService.instance
  }

  /**
   * Report an error with structured logging and user feedback
   */
  public reportError(error: unknown, options: ErrorReportOptions = {}): void {
    const errorMessage = getErrorMessage(error)
    const timestamp = new Date()

    // Determine severity
    const severity = options.severity || this.determineSeverity(error)

    // Create structured context
    const context = {
      userId: options.userId,
      component: options.component,
      action: options.action,
      metadata: {
        ...options.metadata,
        timestamp: timestamp.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        online: this.isOnline
      }
    }

    // Log based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        logger.critical(errorMessage, context)
        break
      case ErrorSeverity.HIGH:
        logger.error(errorMessage, context)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(errorMessage, context)
        break
      case ErrorSeverity.LOW:
        logger.info(errorMessage, context)
        break
    }

    // Queue for retry if offline
    if (!this.isOnline) {
      this.errorQueue.push({ error, options, timestamp })
    }

    // Show user feedback if requested
    if (options.showUserMessage !== false) {
      this.showUserFeedback(error, options, severity)
    }
  }

  /**
   * Report async operation errors with automatic retry logic
   */
  public async reportAsyncError<T>(
    operation: () => Promise<T>,
    options: ErrorReportOptions & RetryOptions = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts || 1
    const baseDelay = options.baseDelay || 1000
    const maxDelay = options.maxDelay || 30000
    const exponentialBackoff = options.exponentialBackoff !== false

    let lastError: unknown
    let attempt = 0

    while (attempt < maxAttempts) {
      attempt++

      try {
        return await operation()
      } catch (error) {
        lastError = error

        // Report the error
        this.reportError(error, {
          ...options,
          metadata: {
            ...options.metadata,
            attempt,
            maxAttempts
          },
          showUserMessage: attempt === maxAttempts // Only show message on final failure
        })

        // Check if we should retry
        const shouldRetryDefault = shouldRetry(error)
        const shouldRetryCustom = options.retryCondition?.(error, attempt) ?? true
        const canRetry = attempt < maxAttempts && shouldRetryDefault && shouldRetryCustom

        if (!canRetry) {
          break
        }

        // Calculate delay
        let delay: number
        if (exponentialBackoff) {
          delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
        } else {
          delay = getRetryDelay(error, attempt) || baseDelay
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Handle API errors with consistent patterns
   */
  public handleApiError(error: unknown, endpoint: string, options: ErrorReportOptions = {}): AppError {
    let appError: AppError

    if (isAppError(error)) {
      appError = error
    } else if (error instanceof Error) {
      // Convert generic errors to AppErrors
      if (error.message.includes('fetch')) {
        appError = createNetworkError.serverError(0, {
          component: options.component,
          action: options.action,
          metadata: { endpoint, ...options.metadata }
        })
      } else {
        appError = new AppError(
          error.message,
          ErrorCode.SYSTEM_UNKNOWN_ERROR,
          ErrorSeverity.MEDIUM,
          {
            component: options.component,
            action: options.action,
            metadata: { endpoint, originalError: error.message, ...options.metadata }
          }
        )
      }
    } else {
      appError = new AppError(
        'Unknown API error',
        ErrorCode.SYSTEM_UNKNOWN_ERROR,
        ErrorSeverity.MEDIUM,
        {
          component: options.component,
          action: options.action,
          metadata: { endpoint, ...options.metadata }
        }
      )
    }

    this.reportError(appError, options)
    return appError
  }

  /**
   * Handle validation errors with field-specific feedback
   */
  public handleValidationError(
    field: string,
    message: string,
    options: ErrorReportOptions = {}
  ): AppError {
    const validationError = createValidationError.invalidFormat(field, message, {
      component: options.component,
      action: options.action,
      metadata: options.metadata
    })

    this.reportError(validationError, {
      ...options,
      severity: ErrorSeverity.LOW,
      showUserMessage: false // Validation errors are usually handled by forms
    })

    return validationError
  }

  /**
   * Create error context for user actions
   */
  public createContext(component: string, action: string, metadata?: Record<string, unknown>) {
    return {
      component,
      action,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }
  }

  /**
   * Flush queued errors when back online
   */
  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return

    const queuedErrors = [...this.errorQueue]
    this.errorQueue = []

    for (const { error, options } of queuedErrors) {
      try {
        this.reportError(error, {
          ...options,
          metadata: {
            ...options.metadata,
            wasQueued: true
          }
        })
      } catch (flushError) {
        // Re-queue if still failing
        this.errorQueue.push({ error, options, timestamp: new Date() })
      }
    }
  }

  /**
   * Determine error severity based on error type
   */
  private determineSeverity(error: unknown): ErrorSeverity {
    if (isAppError(error)) {
      return error.severity
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      // Critical errors
      if (message.includes('out of memory') || message.includes('quota exceeded')) {
        return ErrorSeverity.CRITICAL
      }

      // High severity errors
      if (message.includes('network') || message.includes('timeout') || message.includes('unauthorized')) {
        return ErrorSeverity.HIGH
      }

      // Medium severity errors
      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorSeverity.MEDIUM
      }
    }

    return ErrorSeverity.MEDIUM
  }

  /**
   * Show appropriate user feedback based on error type and severity
   */
  private showUserFeedback(
    error: unknown,
    options: ErrorReportOptions,
    severity: ErrorSeverity
  ): void {
    const errorMessage = options.userMessage || this.getUserFriendlyMessage(error, severity)

    // For now, just log to console - this can be replaced with toast notifications
    // when a toast system is available
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      console.error('User Error Feedback:', errorMessage)
    } else {
      console.warn('User Warning Feedback:', errorMessage)
    }
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyMessage(error: unknown, severity: ErrorSeverity): string {
    if (isAppError(error)) {
      switch (error.code) {
        case ErrorCode.NETWORK_TIMEOUT:
          return 'Request timed out. Please check your internet connection and try again.'
        case ErrorCode.NETWORK_OFFLINE:
          return 'You appear to be offline. Please check your internet connection.'
        case ErrorCode.AUTH_SESSION_EXPIRED:
          return 'Your session has expired. Please sign in again.'
        case ErrorCode.AUTH_UNAUTHORIZED:
          return 'You are not authorized to perform this action.'
        case ErrorCode.VALIDATION_REQUIRED:
          return 'Please fill in all required fields.'
        case ErrorCode.RESOURCE_NOT_FOUND:
          return 'The requested resource could not be found.'
        default:
          return error.message
      }
    }

    // Generic messages based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'A critical error occurred. We have been notified and are working on a fix.'
      case ErrorSeverity.HIGH:
        return 'Something went wrong. Please try again in a moment.'
      case ErrorSeverity.MEDIUM:
        return 'There was an issue processing your request. Please try again.'
      case ErrorSeverity.LOW:
        return 'A minor issue occurred. You can continue using the application.'
      default:
        return 'An unexpected error occurred.'
    }
  }
}

// Export singleton instance
export const errorReportingService = ErrorReportingService.getInstance()

// Export convenience functions
export const reportError = (error: unknown, options?: ErrorReportOptions) =>
  errorReportingService.reportError(error, options)

export const reportAsyncError = <T>(
  operation: () => Promise<T>,
  options?: ErrorReportOptions & RetryOptions
) => errorReportingService.reportAsyncError(operation, options)

export const handleApiError = (error: unknown, endpoint: string, options?: ErrorReportOptions) =>
  errorReportingService.handleApiError(error, endpoint, options)

export const handleValidationError = (field: string, message: string, options?: ErrorReportOptions) =>
  errorReportingService.handleValidationError(field, message, options)

export const createErrorContext = (component: string, action: string, metadata?: Record<string, unknown>) =>
  errorReportingService.createContext(component, action, metadata)