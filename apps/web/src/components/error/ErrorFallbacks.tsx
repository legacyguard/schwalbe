/**
 * User-friendly error fallback components for different scenarios
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { isAppError, ErrorCode } from '@schwalbe/shared'

interface BaseErrorFallbackProps {
  error: Error
  reset?: () => void
  retry?: () => void
  canRetry?: boolean
  errorId?: string
  hideDetails?: boolean
}

/**
 * Network Error Fallback
 * Used when network requests fail
 */
export function NetworkErrorFallback({
  error,
  reset,
  retry,
  canRetry = false,
  errorId
}: BaseErrorFallbackProps) {
  const isOffline = !navigator.onLine
  const isTimeout = isAppError(error) && error.code === ErrorCode.NETWORK_TIMEOUT

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">
        {isOffline ? '📡' : isTimeout ? '⏱️' : '🌐'}
      </div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        {isOffline ? 'You\'re Offline' : isTimeout ? 'Request Timed Out' : 'Connection Problem'}
      </h2>

      <p className="text-slate-400 mb-6 max-w-md">
        {isOffline
          ? 'Please check your internet connection and try again.'
          : isTimeout
          ? 'The request took too long to complete. Please try again.'
          : 'Unable to connect to our servers. Please check your connection and try again.'
        }
      </p>

      <div className="flex gap-3">
        {canRetry && retry && (
          <Button onClick={retry} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        )}
        {reset && (
          <Button onClick={reset} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      {errorId && (
        <p className="text-slate-500 text-xs mt-4 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Authentication Error Fallback
 * Used when auth errors occur
 */
export function AuthErrorFallback({
  error,
  reset,
  errorId
}: BaseErrorFallbackProps) {
  const isSessionExpired = isAppError(error) && error.code === ErrorCode.AUTH_SESSION_EXPIRED
  const isUnauthorized = isAppError(error) && error.code === ErrorCode.AUTH_UNAUTHORIZED

  const handleSignIn = () => {
    window.location.href = '/auth/signin'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🔐</div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        {isSessionExpired ? 'Session Expired' : isUnauthorized ? 'Access Denied' : 'Authentication Required'}
      </h2>

      <p className="text-slate-400 mb-6 max-w-md">
        {isSessionExpired
          ? 'Your session has expired for security reasons. Please sign in again.'
          : isUnauthorized
          ? 'You don\'t have permission to access this resource.'
          : 'Please sign in to continue.'
        }
      </p>

      <div className="flex gap-3">
        <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
          Sign In
        </Button>
        {reset && (
          <Button onClick={reset} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      {errorId && (
        <p className="text-slate-500 text-xs mt-4 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Not Found Error Fallback
 * Used when resources are not found
 */
export function NotFoundErrorFallback({
  error,
  reset,
  errorId
}: BaseErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🔍</div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        Not Found
      </h2>

      <p className="text-slate-400 mb-6 max-w-md">
        The resource you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex gap-3">
        <Button onClick={handleGoHome} className="bg-blue-600 hover:bg-blue-700">
          Go Home
        </Button>
        {reset && (
          <Button onClick={reset} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      {errorId && (
        <p className="text-slate-500 text-xs mt-4 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Validation Error Fallback
 * Used for form validation errors
 */
export function ValidationErrorFallback({
  error,
  reset,
  retry,
  canRetry = false,
  errorId
}: BaseErrorFallbackProps) {
  return (
    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-yellow-400 text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-yellow-300 font-medium text-sm mb-1">
            Validation Error
          </h3>
          <p className="text-yellow-200 text-sm mb-3">
            {error.message || 'Please check your input and try again.'}
          </p>

          <div className="flex gap-2">
            {canRetry && retry && (
              <Button
                onClick={retry}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Try Again
              </Button>
            )}
            {reset && (
              <Button onClick={reset} size="sm" variant="outline">
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {errorId && (
        <p className="text-yellow-500 text-xs mt-3 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Loading Error Fallback
 * Used when data loading fails
 */
export function LoadingErrorFallback({
  error,
  reset,
  retry,
  canRetry = false,
  errorId
}: BaseErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border border-slate-600 rounded-lg bg-slate-800/50">
      <div className="text-4xl mb-3">📦</div>

      <h3 className="text-lg font-medium text-slate-200 mb-2">
        Failed to Load
      </h3>

      <p className="text-slate-400 text-sm mb-4 max-w-sm">
        We couldn't load the data you requested. Please try again.
      </p>

      <div className="flex gap-2">
        {canRetry && retry && (
          <Button onClick={retry} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Reload
          </Button>
        )}
        {reset && (
          <Button onClick={reset} size="sm" variant="outline">
            Go Back
          </Button>
        )}
      </div>

      {errorId && (
        <p className="text-slate-500 text-xs mt-3 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Chunk Loading Error Fallback
 * Used when JavaScript chunks fail to load
 */
export function ChunkLoadErrorFallback({
  error,
  errorId
}: BaseErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🔄</div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        Update Required
      </h2>

      <p className="text-slate-400 mb-6 max-w-md">
        A new version of the application is available. Please reload the page to get the latest updates.
      </p>

      <Button onClick={handleReload} className="bg-green-600 hover:bg-green-700">
        Reload Page
      </Button>

      {errorId && (
        <p className="text-slate-500 text-xs mt-4 font-mono">
          Error ID: {errorId}
        </p>
      )}
    </div>
  )
}

/**
 * Generic Error Fallback
 * Default fallback for unhandled errors
 */
export function GenericErrorFallback({
  error,
  reset,
  retry,
  canRetry = false,
  errorId,
  hideDetails = false
}: BaseErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">💥</div>

      <h2 className="text-xl font-semibold text-slate-200 mb-2">
        Something Went Wrong
      </h2>

      <p className="text-slate-400 mb-6 max-w-md">
        An unexpected error occurred. We've been notified and are working on a fix.
      </p>

      <div className="flex gap-3 mb-4">
        {canRetry && retry && (
          <Button onClick={retry} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        )}
        {reset && (
          <Button onClick={reset} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      {!hideDetails && (
        <div className="w-full max-w-md">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-400"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>

          {showDetails && (
            <div className="mt-3 p-3 bg-slate-800 rounded border text-left">
              <p className="text-slate-300 text-xs font-mono break-all">
                {error.message}
              </p>
              {errorId && (
                <p className="text-slate-500 text-xs mt-2 font-mono">
                  Error ID: {errorId}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Smart Error Fallback
 * Automatically chooses the appropriate fallback based on error type
 */
interface SmartErrorFallbackProps extends BaseErrorFallbackProps {
  level?: 'global' | 'feature' | 'component'
}

export function SmartErrorFallback({
  error,
  level = 'component',
  ...props
}: SmartErrorFallbackProps) {
  // Handle chunk loading errors
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return <ChunkLoadErrorFallback error={error} {...props} />
  }

  // Handle app errors by code
  if (isAppError(error)) {
    switch (error.code) {
      case ErrorCode.NETWORK_TIMEOUT:
      case ErrorCode.NETWORK_OFFLINE:
      case ErrorCode.NETWORK_SERVER_ERROR:
        return <NetworkErrorFallback error={error} {...props} />

      case ErrorCode.AUTH_INVALID_CREDENTIALS:
      case ErrorCode.AUTH_SESSION_EXPIRED:
      case ErrorCode.AUTH_UNAUTHORIZED:
        return <AuthErrorFallback error={error} {...props} />

      case ErrorCode.RESOURCE_NOT_FOUND:
        return <NotFoundErrorFallback error={error} {...props} />

      case ErrorCode.VALIDATION_REQUIRED:
      case ErrorCode.VALIDATION_INVALID_FORMAT:
      case ErrorCode.VALIDATION_TOO_LONG:
        return <ValidationErrorFallback error={error} {...props} />
    }
  }

  // Handle network-related errors by message
  const message = error.message.toLowerCase()
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return <NetworkErrorFallback error={error} {...props} />
  }

  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return <AuthErrorFallback error={error} {...props} />
  }

  if (message.includes('not found') || message.includes('404')) {
    return <NotFoundErrorFallback error={error} {...props} />
  }

  // For component-level errors, use a more compact fallback
  if (level === 'component') {
    return <LoadingErrorFallback error={error} {...props} />
  }

  // Default to generic fallback
  return <GenericErrorFallback error={error} {...props} />
}