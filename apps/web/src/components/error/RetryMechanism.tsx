/**
 * Comprehensive retry mechanism with exponential backoff,
 * circuit breaker pattern, and recovery strategies
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { errorReportingService } from '../../services/errorReporting.service'
import { isAppError, shouldRetry, getRetryDelay, ErrorSeverity } from '@schwalbe/shared'

interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  exponentialBackoff: boolean
  jitter: boolean
  retryCondition?: (error: unknown, attempt: number) => boolean
}

interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
}

interface RetryState {
  attempt: number
  isRetrying: boolean
  lastError: Error | null
  nextRetryAt: Date | null
  circuitOpen: boolean
  totalFailures: number
  lastSuccess: Date | null
}

interface RetryMechanismProps {
  operation: () => Promise<any>
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onStateChange?: (state: RetryState) => void
  retryConfig?: Partial<RetryConfig>
  circuitBreaker?: Partial<CircuitBreakerConfig>
  component?: string
  action?: string
  children?: (state: RetryState & { retry: () => void; reset: () => void }) => React.ReactNode
  autoRetry?: boolean
  showProgress?: boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
  jitter: true
}

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 300000 // 5 minutes
}

export function RetryMechanism({
  operation,
  onSuccess,
  onError,
  onStateChange,
  retryConfig = {},
  circuitBreaker = {},
  component = 'retry_mechanism',
  action = 'operation',
  children,
  autoRetry = false,
  showProgress = true
}: RetryMechanismProps) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  const circuitConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...circuitBreaker }

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
    nextRetryAt: null,
    circuitOpen: false,
    totalFailures: 0,
    lastSuccess: null
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const circuitTimeoutRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (circuitTimeoutRef.current) clearTimeout(circuitTimeoutRef.current)
    }
  }, [])

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state)
    }
  }, [state, onStateChange])

  // Calculate retry delay with jitter
  const calculateDelay = useCallback((attempt: number): number => {
    let delay: number

    if (config.exponentialBackoff) {
      delay = Math.min(config.baseDelay * Math.pow(2, attempt - 1), config.maxDelay)
    } else {
      delay = config.baseDelay
    }

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }

    return Math.floor(delay)
  }, [config])

  // Check if should retry based on error and config
  const shouldRetryOperation = useCallback((error: unknown, attempt: number): boolean => {
    // Check circuit breaker
    if (state.circuitOpen) {
      return false
    }

    // Check max attempts
    if (attempt >= config.maxAttempts) {
      return false
    }

    // Check custom retry condition
    if (config.retryCondition) {
      return config.retryCondition(error, attempt)
    }

    // Use default retry logic
    return shouldRetry(error)
  }, [config, state.circuitOpen])

  // Open circuit breaker
  const openCircuit = useCallback(() => {
    setState(prev => ({ ...prev, circuitOpen: true }))

    // Auto-recover after timeout
    circuitTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, circuitOpen: false, totalFailures: 0 }))
        errorReportingService.reportError(
          new Error('Circuit breaker recovered'),
          {
            component,
            action: `${action}_circuit_recovery`,
            severity: ErrorSeverity.LOW,
            metadata: { recoveryTimeout: circuitConfig.recoveryTimeout }
          }
        )
      }
    }, circuitConfig.recoveryTimeout)
  }, [circuitConfig.recoveryTimeout, component, action])

  // Execute operation with retry logic
  const executeWithRetry = useCallback(async (): Promise<void> => {
    if (state.circuitOpen) {
      const error = new Error('Circuit breaker is open')
      if (onError) onError(error)
      return
    }

    const attempt = state.attempt + 1

    setState(prev => ({
      ...prev,
      attempt,
      isRetrying: true,
      lastError: null,
      nextRetryAt: null
    }))

    try {
      const result = await operation()

      if (!mountedRef.current) return

      // Success - reset state
      setState(prev => ({
        ...prev,
        attempt: 0,
        isRetrying: false,
        lastError: null,
        nextRetryAt: null,
        totalFailures: 0,
        lastSuccess: new Date()
      }))

      if (onSuccess) {
        onSuccess(result)
      }

      // Log successful recovery if this was a retry
      if (attempt > 1) {
        errorReportingService.reportError(
          new Error('Operation recovered after retry'),
          {
            component,
            action: `${action}_recovery`,
            severity: ErrorSeverity.LOW,
            metadata: { attempt, totalAttempts: attempt }
          }
        )
      }

    } catch (error) {
      if (!mountedRef.current) return

      const errorObj = error instanceof Error ? error : new Error(String(error))

      // Update failure count
      const newTotalFailures = state.totalFailures + 1

      // Check circuit breaker threshold
      if (newTotalFailures >= circuitConfig.failureThreshold) {
        openCircuit()
        errorReportingService.reportError(
          new Error('Circuit breaker opened due to repeated failures'),
          {
            component,
            action: `${action}_circuit_open`,
            severity: ErrorSeverity.HIGH,
            metadata: {
              totalFailures: newTotalFailures,
              threshold: circuitConfig.failureThreshold
            }
          }
        )
      }

      // Check if should retry
      const shouldRetryOp = shouldRetryOperation(error, attempt)

      if (shouldRetryOp && !state.circuitOpen) {
        // Schedule retry
        const delay = calculateDelay(attempt)
        const nextRetryAt = new Date(Date.now() + delay)

        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: errorObj,
          nextRetryAt,
          totalFailures: newTotalFailures
        }))

        // Report retry attempt
        errorReportingService.reportError(errorObj, {
          component,
          action: `${action}_retry_scheduled`,
          severity: ErrorSeverity.MEDIUM,
          metadata: {
            attempt,
            maxAttempts: config.maxAttempts,
            delayMs: delay,
            nextRetryAt: nextRetryAt.toISOString()
          }
        })

        if (autoRetry) {
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              executeWithRetry()
            }
          }, delay)
        }
      } else {
        // Final failure
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: errorObj,
          nextRetryAt: null,
          totalFailures: newTotalFailures
        }))

        // Report final failure
        errorReportingService.reportError(errorObj, {
          component,
          action: `${action}_final_failure`,
          severity: state.circuitOpen ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
          metadata: {
            attempt,
            maxAttempts: config.maxAttempts,
            circuitOpen: state.circuitOpen,
            totalFailures: newTotalFailures
          }
        })

        if (onError) {
          onError(errorObj)
        }
      }
    }
  }, [
    state,
    operation,
    config,
    circuitConfig,
    shouldRetryOperation,
    calculateDelay,
    openCircuit,
    onSuccess,
    onError,
    component,
    action,
    autoRetry
  ])

  // Manual retry function
  const retry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    executeWithRetry()
  }, [executeWithRetry])

  // Reset function
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (circuitTimeoutRef.current) clearTimeout(circuitTimeoutRef.current)

    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
      nextRetryAt: null,
      circuitOpen: false,
      totalFailures: 0,
      lastSuccess: null
    })
  }, [])

  // Auto-execute on mount if configured
  useEffect(() => {
    if (autoRetry && state.attempt === 0) {
      executeWithRetry()
    }
  }, []) // Only run on mount

  // Custom render function
  if (children) {
    return <>{children({ ...state, retry, reset })}</>
  }

  // Default UI
  return (
    <RetryUI
      state={state}
      retry={retry}
      reset={reset}
      showProgress={showProgress}
      config={config}
    />
  )
}

interface RetryUIProps {
  state: RetryState
  retry: () => void
  reset: () => void
  showProgress: boolean
  config: RetryConfig
}

function RetryUI({ state, retry, reset, showProgress, config }: RetryUIProps) {
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for next retry
  useEffect(() => {
    if (!state.nextRetryAt) {
      setCountdown(0)
      return
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, state.nextRetryAt!.getTime() - Date.now())
      setCountdown(Math.ceil(remaining / 1000))

      if (remaining <= 0) {
        setCountdown(0)
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [state.nextRetryAt])

  if (state.circuitOpen) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-300 mb-2">
          <span className="text-xl">🔴</span>
          <span className="font-medium">Service Temporarily Unavailable</span>
        </div>
        <p className="text-red-200 text-sm mb-3">
          Too many failures detected. The service is temporarily disabled and will automatically recover soon.
        </p>
        <Button onClick={reset} size="sm" variant="outline">
          Reset
        </Button>
      </div>
    )
  }

  if (state.isRetrying) {
    return (
      <div className="flex items-center justify-center gap-3 p-4">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span className="text-slate-300 text-sm">
          Attempt {state.attempt} of {config.maxAttempts}...
        </span>
      </div>
    )
  }

  if (state.lastError) {
    const canRetry = state.attempt < config.maxAttempts && !state.circuitOpen
    const hasScheduledRetry = state.nextRetryAt && state.nextRetryAt > new Date()

    return (
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-400 text-xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-yellow-300 font-medium text-sm mb-1">
              Operation Failed
            </h3>
            <p className="text-yellow-200 text-sm mb-3">
              {state.lastError.message}
            </p>

            {showProgress && (
              <div className="text-yellow-300 text-xs mb-3">
                Attempt {state.attempt} of {config.maxAttempts}
                {state.totalFailures > 0 && ` • ${state.totalFailures} total failures`}
              </div>
            )}

            <div className="flex items-center gap-2">
              {canRetry && (
                <Button onClick={retry} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  {hasScheduledRetry && countdown > 0
                    ? `Retry in ${countdown}s`
                    : 'Retry Now'
                  }
                </Button>
              )}
              <Button onClick={reset} size="sm" variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state.lastSuccess) {
    return (
      <div className="bg-green-900/20 border border-green-600 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-300 text-sm">
          <span>✅</span>
          <span>Operation completed successfully</span>
          {state.attempt > 1 && (
            <span className="text-green-400">
              (recovered after {state.attempt - 1} retries)
            </span>
          )}
        </div>
      </div>
    )
  }

  return null
}