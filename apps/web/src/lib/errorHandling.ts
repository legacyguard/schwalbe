/**
 * Error Handling Integration
 * Central configuration and setup for the application's error handling system
 */

import {
  errorReportingService,
  reportError,
  reportAsyncError,
  handleApiError,
  handleValidationError,
  createErrorContext
} from '../services/errorReporting.service'

import {
  ErrorBoundary,
  GlobalErrorBoundary,
  FeatureErrorBoundary,
  ComponentErrorBoundary
} from '../components/ErrorBoundary'

import {
  NetworkErrorFallback,
  AuthErrorFallback,
  NotFoundErrorFallback,
  ValidationErrorFallback,
  LoadingErrorFallback,
  ChunkLoadErrorFallback,
  GenericErrorFallback,
  SmartErrorFallback
} from '../components/error/ErrorFallbacks'

import { RetryMechanism } from '../components/error/RetryMechanism'

import {
  useAsyncOperation,
  useApiCall,
  useFormSubmission,
  useDataFetch
} from '../hooks/useAsyncOperation'

import { logger, ErrorSeverity, AppError, ErrorCode } from '@schwalbe/shared'

/**
 * Initialize global error handling
 * Call this early in your app initialization
 */
export function initializeErrorHandling() {
  // Set up global unhandled error reporting
  // This is already handled by the errorReportingService constructor

  // Configure any additional global error handling
  logger.info('Error handling system initialized', {
    action: 'error_handling_init',
    metadata: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  })
}

/**
 * Error handling utilities for common patterns
 */
export class ErrorHandlingUtils {
  /**
   * Wrap an async function with error handling
   */
  static withErrorHandling<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: { component: string; action: string; metadata?: Record<string, unknown> }
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args)
      } catch (error) {
        reportError(error, context)
        throw error
      }
    }) as T
  }

  /**
   * Wrap a synchronous function with error handling
   */
  static withSyncErrorHandling<T extends (...args: any[]) => any>(
    fn: T,
    context: { component: string; action: string; metadata?: Record<string, unknown> }
  ): T {
    return ((...args: any[]) => {
      try {
        return fn(...args)
      } catch (error) {
        reportError(error, context)
        throw error
      }
    }) as T
  }

  /**
   * Create a safe async operation that won't throw
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    defaultValue: T,
    context?: { component: string; action: string; metadata?: Record<string, unknown> }
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (context) {
        reportError(error, {
          ...context,
          severity: ErrorSeverity.LOW,
          showUserMessage: false
        })
      }
      return defaultValue
    }
  }

  /**
   * Create a safe sync operation that won't throw
   */
  static safe<T>(
    operation: () => T,
    defaultValue: T,
    context?: { component: string; action: string; metadata?: Record<string, unknown> }
  ): T {
    try {
      return operation()
    } catch (error) {
      if (context) {
        reportError(error, {
          ...context,
          severity: ErrorSeverity.LOW,
          showUserMessage: false
        })
      }
      return defaultValue
    }
  }

  /**
   * Validate input and throw appropriate error
   */
  static validateRequired(
    value: unknown,
    fieldName: string,
    context?: { component: string; action: string }
  ): void {
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw handleValidationError(fieldName, 'This field is required', context)
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(
    email: string,
    context?: { component: string; action: string }
  ): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw handleValidationError('email', 'Please enter a valid email address', context)
    }
  }

  /**
   * Handle API response errors
   */
  static async handleApiResponse(
    response: Response,
    endpoint: string,
    context?: { component: string; action: string }
  ): Promise<any> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // Use default error message if response body is not JSON
      }

      const error = new AppError(
        errorMessage,
        response.status >= 500 ? ErrorCode.NETWORK_SERVER_ERROR : ErrorCode.NETWORK_TIMEOUT,
        response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        context
      )

      throw handleApiError(error, endpoint, context)
    }

    try {
      return await response.json()
    } catch (error) {
      throw handleApiError(
        new Error('Invalid JSON response'),
        endpoint,
        context
      )
    }
  }
}

/**
 * Error boundary configuration presets
 */
export const ErrorBoundaryPresets = {
  global: {
    level: 'global' as const,
    onError: (error: Error, errorInfo: React.ErrorInfo) => {
      logger.critical('Global error boundary triggered', {
        action: 'global_error_boundary',
        metadata: {
          error: error.message,
          componentStack: errorInfo.componentStack
        }
      })
    }
  },

  feature: {
    level: 'feature' as const,
    onError: (error: Error, errorInfo: React.ErrorInfo) => {
      logger.error('Feature error boundary triggered', {
        action: 'feature_error_boundary',
        metadata: {
          error: error.message,
          componentStack: errorInfo.componentStack
        }
      })
    }
  },

  component: {
    level: 'component' as const,
    onError: (error: Error, errorInfo: React.ErrorInfo) => {
      logger.warn('Component error boundary triggered', {
        action: 'component_error_boundary',
        metadata: {
          error: error.message,
          componentStack: errorInfo.componentStack
        }
      })
    }
  }
}

/**
 * Export all error handling components and utilities
 */
export {
  // Services
  errorReportingService,
  reportError,
  reportAsyncError,
  handleApiError,
  handleValidationError,
  createErrorContext,

  // Components
  ErrorBoundary,
  GlobalErrorBoundary,
  FeatureErrorBoundary,
  ComponentErrorBoundary,

  // Fallbacks
  NetworkErrorFallback,
  AuthErrorFallback,
  NotFoundErrorFallback,
  ValidationErrorFallback,
  LoadingErrorFallback,
  ChunkLoadErrorFallback,
  GenericErrorFallback,
  SmartErrorFallback,

  // Retry mechanism
  RetryMechanism,

  // Hooks
  useAsyncOperation,
  useApiCall,
  useFormSubmission,
  useDataFetch
}

// Initialize error handling when this module is imported
initializeErrorHandling()