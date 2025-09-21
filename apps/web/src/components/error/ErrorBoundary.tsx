/**
 * React Error Boundary with comprehensive error handling
 * Catches JavaScript errors anywhere in the component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { errorHandler, AppError, ErrorSeverity } from '@/lib/error-handling'
import { logger } from '@schwalbe/shared/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const safeErrorInfo = {
      componentStack: errorInfo.componentStack || ''
    }
    const boundaryInfo = errorHandler.createErrorBoundaryInfo(error, safeErrorInfo)
    const appError = boundaryInfo.error

    // Generate unique event ID for tracking
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.setState({
      error: appError,
      errorInfo,
      eventId
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError, errorInfo)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      })
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  private copyErrorToClipboard = async () => {
    if (!this.state.error) return

    const errorReport = {
      eventId: this.state.eventId,
      error: this.state.error.toJSON(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      // Could show a toast notification here
    } catch (err) {
      // Use both logger and console.error as fallback for critical error reporting scenarios
      logger.error('Failed to copy error report', {
        action: 'copy_error_report_failed',
        metadata: { error: err instanceof Error ? err.message : String(err) }
      })
      console.error('Failed to copy error report:', err) // Keep as fallback
    }
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error } = this.state
      const level = this.props.level || 'component'
      const showDetails = this.props.showErrorDetails || false

      // Critical level errors get full-page treatment
      if (level === 'critical' || error.severity === ErrorSeverity.CRITICAL) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
              <Card className="border-red-200 shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-red-800">
                    Critical Error Occurred
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-center">
                    {error.userMessage}
                  </p>

                  {showDetails && (
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
                      <p><strong>Error ID:</strong> {this.state.eventId}</p>
                      <p><strong>Type:</strong> {error.type}</p>
                      <p><strong>Code:</strong> {error.code}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={this.handleReload}
                      className="w-full"
                      variant="default"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload Page
                    </Button>

                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="w-full"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Homepage
                    </Button>

                    {showDetails && (
                      <Button
                        onClick={this.copyErrorToClipboard}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        <Bug className="w-4 h-4 mr-2" />
                        Copy Error Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }

      // Component-level error display
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error.userMessage}
              </p>

              {showDetails && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Technical Details
                  </summary>
                  <div className="mt-2 text-xs font-mono text-red-600 bg-red-100 p-2 rounded">
                    <p><strong>Error ID:</strong> {this.state.eventId}</p>
                    <p><strong>Type:</strong> {error.type}</p>
                    <p><strong>Code:</strong> {error.code}</p>
                    <p><strong>Message:</strong> {error.message}</p>
                  </div>
                </details>
              )}

              <div className="flex gap-2 mt-3">
                {error.isRetryable && this.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-200 hover:bg-red-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-800"
                >
                  Reload
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
)

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
)

export const CriticalErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="critical" showErrorDetails />
)

export const FeatureErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
)