/**
 * React hooks for error handling and state management
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { logger } from '@schwalbe/shared/lib/logger'

import {
  errorHandler,
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  NetworkError,
  ValidationError,
  getErrorMessage,
  getErrorCode,
  isRetryableError
} from '@/lib/error-handling'

export interface UseErrorHandlerOptions {
  defaultErrorMessage?: string
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  onError?: (error: AppError) => void
}

export interface ErrorState {
  error: AppError | null
  isError: boolean
  errorMessage: string
  errorCode: string
  canRetry: boolean
  retryCount: number
}

/**
 * Main error handling hook
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    defaultErrorMessage = 'An error occurred',
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: '',
    errorCode: '',
    canRetry: false,
    retryCount: 0
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  const handleError = useCallback((error: Error | AppError, context: ErrorContext = {}) => {
    const appError = errorHandler.handle(error, context)

    const newState: ErrorState = {
      error: appError,
      isError: true,
      errorMessage: appError.userMessage || defaultErrorMessage,
      errorCode: appError.code,
      canRetry: enableRetry && appError.isRetryable && errorState.retryCount < maxRetries,
      retryCount: errorState.retryCount
    }

    setErrorState(newState)

    if (onError) {
      onError(appError)
    }

    return appError
  }, [defaultErrorMessage, enableRetry, maxRetries, errorState.retryCount, onError])

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    setErrorState({
      error: null,
      isError: false,
      errorMessage: '',
      errorCode: '',
      canRetry: false,
      retryCount: 0
    })
  }, [])

  const retry = useCallback(async (operation?: () => Promise<any> | any) => {
    if (!errorState.canRetry) return

    setErrorState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      canRetry: prev.retryCount + 1 < maxRetries
    }))

    if (operation) {
      try {
        const result = await operation()
        clearError()
        return result
      } catch (error) {
        handleError(error as Error)
      }
    } else {
      // Auto-retry with delay
      retryTimeoutRef.current = setTimeout(() => {
        clearError()
      }, retryDelay * errorState.retryCount)
    }
  }, [errorState.canRetry, errorState.retryCount, maxRetries, retryDelay, clearError, handleError])

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T | null> => {
    try {
      clearError()
      return await operation()
    } catch (error) {
      handleError(error as Error, context)
      return null
    }
  }, [handleError, clearError])

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    handleAsyncOperation
  }
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const handleValidationError = useCallback((error: ValidationError | Record<string, string>) => {
    if (error instanceof ValidationError) {
      // Single field error
      if (error.context.field) {
        setFieldError(error.context.field as string, error.userMessage)
      }
    } else {
      // Multiple field errors
      setFieldErrors(error)
    }
  }, [setFieldError])

  const hasErrors = Object.keys(fieldErrors).length > 0
  const getFieldError = useCallback((field: string) => fieldErrors[field], [fieldErrors])

  return {
    fieldErrors,
    hasErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    handleValidationError
  }
}

/**
 * Hook for handling API errors with automatic retry
 */
export function useApiErrorHandler() {
  const { handleError, clearError, retry, ...errorState } = useErrorHandler({
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000
  })

  const handleApiError = useCallback((error: Error, context: ErrorContext = {}) => {
    // Convert HTTP errors to appropriate types
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return handleError(new NetworkError(error.message), { ...context, api: true })
    }

    if (message.includes('timeout')) {
      return handleError(new AppError(
        error.message,
        ErrorType.TIMEOUT,
        ErrorSeverity.MEDIUM,
        'API_TIMEOUT',
        { ...context, api: true },
        'Request timed out. Please try again.',
        true
      ))
    }

    return handleError(error, { ...context, api: true })
  }, [handleError])

  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T | null> => {
    try {
      clearError()
      return await apiCall()
    } catch (error) {
      handleApiError(error as Error, context)
      return null
    }
  }, [handleApiError, clearError])

  return {
    ...errorState,
    handleApiError,
    executeApiCall,
    clearError,
    retry
  }
}

/**
 * Hook for handling async operations with loading states
 */
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const { handleError, clearError, ...errorState } = useErrorHandler()

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      clearError()

      const result = await operation()
      setData(result)
      return result
    } catch (error) {
      handleError(error as Error, context)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError, clearError])

  const reset = useCallback(() => {
    setIsLoading(false)
    setData(null)
    clearError()
  }, [clearError])

  return {
    isLoading,
    data,
    execute,
    reset,
    ...errorState
  }
}

/**
 * Hook for tracking and displaying multiple errors
 */
export function useErrorQueue(maxErrors = 5) {
  const [errors, setErrors] = useState<AppError[]>([])

  const addError = useCallback((error: Error | AppError, context: ErrorContext = {}) => {
    const appError = errorHandler.handle(error, context)

    setErrors(prev => {
      const newErrors = [appError, ...prev].slice(0, maxErrors)
      return newErrors
    })

    return appError
  }, [maxErrors])

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error =>
      `${error.timestamp.getTime()}-${error.code}` !== errorId
    ))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getErrorId = useCallback((error: AppError) =>
    `${error.timestamp.getTime()}-${error.code}`, [])

  return {
    errors,
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    addError,
    removeError,
    clearAllErrors,
    getErrorId
  }
}

/**
 * Utility hook for error boundary fallbacks
 */
export function useErrorBoundaryFallback() {
  const goHome = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  const reload = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  const reportError = useCallback(async (error: AppError) => {
    try {
      // Report to external service
      await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error.toJSON())
      })
    } catch (reportingError) {
      // Use both logger and console.error as fallback for critical error reporting scenarios
      logger.error('Failed to report error', {
        action: 'error_reporting_failed',
        metadata: {
          originalError: error.toJSON(),
          reportingError: reportingError instanceof Error ? reportingError.message : String(reportingError)
        }
      })
      console.error('Failed to report error:', reportingError) // Keep as fallback
    }
  }, [])

  return {
    goHome,
    reload,
    reportError
  }
}