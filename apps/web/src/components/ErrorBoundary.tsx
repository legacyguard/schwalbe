import React, { Component, ReactNode } from 'react'
import { logger, AppError, ErrorCode, ErrorSeverity, isAppError, getErrorMessage, useAuthStore } from '@schwalbe/shared'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  level?: 'global' | 'feature' | 'component'
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = 'component', onError } = this.props

    // Get user context if available
    let userId: string | undefined
    try {
      const authState = useAuthStore.getState()
      userId = authState.user?.id
    } catch {
      // Ignore auth store errors during error handling
    }

    // Create structured error context
    const context = {
      userId,
      component: errorInfo.componentStack?.split('\n')[1]?.trim(),
      action: 'component_render',
      metadata: {
        errorId: this.state.errorId,
        level,
        retryCount: this.retryCount,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        timestamp: new Date().toISOString()
      },
      stack: error.stack
    }

    // Log error with appropriate severity
    const severity = this.getErrorSeverity(error, level)
    if (severity === ErrorSeverity.CRITICAL) {
      logger.critical(`React Error Boundary (${level}): ${error.message}`, context)
    } else {
      logger.error(`React Error Boundary (${level}): ${error.message}`, context)
    }

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo)
      } catch (handlerError) {
        logger.error('Error in custom error handler', {
          ...context,
          metadata: { ...context.metadata, handlerError: getErrorMessage(handlerError) }
        })
      }
    }
  }

  private getErrorSeverity(error: Error, level: string): ErrorSeverity {
    // App errors already have severity
    if (isAppError(error)) {
      return error.severity
    }

    // Determine severity based on error type and boundary level
    if (level === 'global') {
      return ErrorSeverity.CRITICAL
    }

    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return ErrorSeverity.MEDIUM
    }

    if (level === 'feature') {
      return ErrorSeverity.HIGH
    }

    return ErrorSeverity.MEDIUM
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      logger.info('Error boundary retry attempt', {
        metadata: {
          errorId: this.state.errorId,
          retryCount: this.retryCount,
          maxRetries: this.maxRetries
        }
      })
      this.setState({ hasError: false, error: undefined, errorId: undefined })
    }
  }

  private handleReset = () => {
    this.retryCount = 0
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const { fallback: FallbackComponent } = this.props

      // Use custom fallback if provided
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.handleReset} />
      }

      // Use default fallback based on boundary level
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          level={this.props.level}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error
  errorId?: string
  level?: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onReset: () => void
}

function DefaultErrorFallback({
  error,
  errorId,
  level = 'component',
  retryCount,
  maxRetries,
  onRetry,
  onReset
}: DefaultErrorFallbackProps) {
  const canRetry = retryCount < maxRetries
  const isChunkError = error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')

  // Different UI based on error level
  if (level === 'global') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Application Error
          </h1>
          <p className="text-slate-300 text-sm mb-4">
            Something went wrong. We've been notified and are working on a fix.
          </p>
          {errorId && (
            <p className="text-slate-400 text-xs mb-4 font-mono">
              Error ID: {errorId}
            </p>
          )}
          <div className="space-y-2">
            {isChunkError && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Reload Page
              </button>
            )}
            {canRetry && !isChunkError && (
              <button
                onClick={onRetry}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Try Again ({retryCount}/{maxRetries})
              </button>
            )}
            <button
              onClick={onReset}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (level === 'feature') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 m-4">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-red-300 font-medium text-sm mb-1">
              Feature Unavailable
            </h3>
            <p className="text-red-200 text-sm mb-3">
              This feature is temporarily unavailable. Please try again.
            </p>
            {errorId && (
              <p className="text-red-400 text-xs mb-3 font-mono">
                Error ID: {errorId}
              </p>
            )}
            <div className="flex gap-2">
              {canRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                >
                  Retry ({retryCount}/{maxRetries})
                </button>
              )}
              <button
                onClick={onReset}
                className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Component level error
  return (
    <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3 m-2">
      <div className="flex items-center gap-2 text-yellow-300 text-sm">
        <span>⚠️</span>
        <span>Component Error</span>
        {canRetry && (
          <button
            onClick={onRetry}
            className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

// Convenience components for different levels
export const GlobalErrorBoundary = (props: Omit<ErrorBoundaryProps, 'level'>) => (
  <ErrorBoundary {...props} level="global" />
)

export const FeatureErrorBoundary = (props: Omit<ErrorBoundaryProps, 'level'>) => (
  <ErrorBoundary {...props} level="feature" />
)

export const ComponentErrorBoundary = (props: Omit<ErrorBoundaryProps, 'level'>) => (
  <ErrorBoundary {...props} level="component" />
)