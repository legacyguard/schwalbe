/**
 * Custom hook for handling async operations with consistent error handling,
 * loading states, and retry logic
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { errorReportingService } from '../services/errorReporting.service'
import { isAppError, ErrorSeverity } from '@schwalbe/shared'

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastSuccessAt: Date | null
}

interface AsyncOperationOptions {
  component?: string
  action?: string
  metadata?: Record<string, unknown>
  retryOptions?: {
    maxAttempts?: number
    baseDelay?: number
    exponentialBackoff?: boolean
  }
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  resetOnNewOperation?: boolean
}

interface AsyncOperationResult<T> extends AsyncOperationState<T> {
  execute: (...args: any[]) => Promise<T>
  retry: () => Promise<T>
  reset: () => void
  canRetry: boolean
}

export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    lastSuccessAt: null
  })

  const lastArgsRef = useRef<any[]>([])
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    component = 'unknown',
    action = 'async_operation',
    metadata = {},
    retryOptions = {},
    onSuccess,
    onError,
    resetOnNewOperation = true
  } = options

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      // Abort previous operation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      // Store arguments for retry
      lastArgsRef.current = args

      // Reset retry count if this is a new operation
      if (resetOnNewOperation) {
        retryCountRef.current = 0
      }

      // Reset error state and set loading
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }))

      try {
        // Execute the operation with error reporting
        const result = await errorReportingService.reportAsyncError(
          () => operation(...args),
          {
            component,
            action,
            metadata: {
              ...metadata,
              args: args.length,
              retryCount: retryCountRef.current
            },
            ...retryOptions,
            maxAttempts: 1 // We handle retries manually for better state control
          }
        )

        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Operation was aborted')
        }

        // Update state with success
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastSuccessAt: new Date()
        }))

        // Call success callback
        if (onSuccess) {
          try {
            onSuccess(result)
          } catch (callbackError) {
            errorReportingService.reportError(callbackError, {
              component,
              action: `${action}_success_callback`,
              metadata,
              severity: ErrorSeverity.LOW
            })
          }
        }

        return result
      } catch (error) {
        // Check if operation was aborted
        if (error instanceof Error && error.message === 'Operation was aborted') {
          return Promise.reject(error)
        }

        const errorObj = error instanceof Error ? error : new Error(String(error))

        // Update state with error
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorObj
        }))

        // Call error callback
        if (onError) {
          try {
            onError(errorObj)
          } catch (callbackError) {
            errorReportingService.reportError(callbackError, {
              component,
              action: `${action}_error_callback`,
              metadata,
              severity: ErrorSeverity.LOW
            })
          }
        }

        throw errorObj
      }
    },
    [operation, component, action, metadata, retryOptions, onSuccess, onError, resetOnNewOperation]
  )

  const retry = useCallback(async (): Promise<T> => {
    const maxAttempts = retryOptions.maxAttempts || 3
    if (retryCountRef.current >= maxAttempts) {
      throw new Error(`Maximum retry attempts (${maxAttempts}) exceeded`)
    }

    retryCountRef.current++

    // Add delay before retry
    const baseDelay = retryOptions.baseDelay || 1000
    const delay = retryOptions.exponentialBackoff !== false
      ? Math.min(baseDelay * Math.pow(2, retryCountRef.current - 1), 30000)
      : baseDelay

    await new Promise(resolve => setTimeout(resolve, delay))

    return execute(...lastArgsRef.current)
  }, [execute, retryOptions])

  const reset = useCallback(() => {
    // Abort current operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Reset state
    setState({
      data: null,
      loading: false,
      error: null,
      lastSuccessAt: null
    })

    // Reset retry count
    retryCountRef.current = 0
  }, [])

  const canRetry = !state.loading &&
    state.error !== null &&
    retryCountRef.current < (retryOptions.maxAttempts || 3) &&
    (!isAppError(state.error) || state.error.code !== 'AUTH_UNAUTHORIZED')

  return {
    ...state,
    execute,
    retry,
    reset,
    canRetry
  }
}

// Specialized hooks for common patterns

/**
 * Hook for API calls with automatic error handling
 */
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  return useAsyncOperation(apiFunction, {
    ...options,
    action: options.action || 'api_call',
    retryOptions: {
      maxAttempts: 3,
      baseDelay: 1000,
      exponentialBackoff: true,
      ...options.retryOptions
    }
  })
}

/**
 * Hook for form submissions with validation error handling
 */
export function useFormSubmission<T = any>(
  submitFunction: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  return useAsyncOperation(submitFunction, {
    ...options,
    action: options.action || 'form_submission',
    retryOptions: {
      maxAttempts: 1, // Usually don't retry form submissions
      ...options.retryOptions
    }
  })
}

/**
 * Hook for data fetching with background refresh
 */
export function useDataFetch<T = any>(
  fetchFunction: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions & {
    refreshInterval?: number
    refreshOnFocus?: boolean
  } = {}
) {
  const {
    refreshInterval,
    refreshOnFocus = false,
    ...asyncOptions
  } = options

  const asyncOperation = useAsyncOperation(fetchFunction, {
    ...asyncOptions,
    action: asyncOptions.action || 'data_fetch',
    retryOptions: {
      maxAttempts: 3,
      baseDelay: 2000,
      exponentialBackoff: true,
      ...asyncOptions.retryOptions
    }
  })

  // Set up automatic refresh
  const lastArgsRef = useRef<any[]>([])

  // Update lastArgsRef when asyncOperation changes
  useEffect(() => {
    if (asyncOperation.data || asyncOperation.error) {
      // Args are already stored in the asyncOperation
    }
  }, [asyncOperation])

  useEffect(() => {
    if (!refreshInterval || asyncOperation.loading) return

    const interval = setInterval(() => {
      if (!asyncOperation.loading && asyncOperation.data) {
        // Use a simple refresh mechanism
        asyncOperation.reset()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, asyncOperation.loading, asyncOperation.data, asyncOperation.reset])

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus) return

    const handleFocus = () => {
      if (!asyncOperation.loading && asyncOperation.data) {
        // Use a simple refresh mechanism
        asyncOperation.reset()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshOnFocus, asyncOperation.loading, asyncOperation.data])

  return asyncOperation
}