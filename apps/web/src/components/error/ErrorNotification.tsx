/**
 * Global error notification system
 * Toast-like notifications for errors with auto-dismiss and retry options
 */

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppError, ErrorSeverity } from '@/lib/error-handling'
import { useErrorQueue } from '@/hooks/useErrorHandler'

export interface ErrorNotificationProps {
  error: AppError
  onDismiss: (errorId: string) => void
  onRetry?: (error: AppError) => void
  autoHide?: boolean
  hideDelay?: number
}

export function ErrorNotification({
  error,
  onDismiss,
  onRetry,
  autoHide = true,
  hideDelay = 5000
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const errorId = `${error.timestamp.getTime()}-${error.code}`

  useEffect(() => {
    if (autoHide && error.severity !== ErrorSeverity.CRITICAL) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss(errorId), 300) // Allow animation to complete
      }, hideDelay)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoHide, hideDelay, error.severity, onDismiss, errorId])

  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case ErrorSeverity.HIGH:
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case ErrorSeverity.MEDIUM:
        return <Info className="w-5 h-5 text-blue-500" />
      case ErrorSeverity.LOW:
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getColors = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          button: 'text-red-600 hover:text-red-800'
        }
      case ErrorSeverity.HIGH:
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-800',
          button: 'text-orange-600 hover:text-orange-800'
        }
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          button: 'text-blue-600 hover:text-blue-800'
        }
      case ErrorSeverity.LOW:
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          button: 'text-green-600 hover:text-green-800'
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          button: 'text-gray-600 hover:text-gray-800'
        }
    }
  }

  const colors = getColors()

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`max-w-sm w-full ${colors.bg} border rounded-lg shadow-lg p-4 pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text}`}>
            {error.userMessage}
          </p>

          {error.code !== error.type && (
            <p className="text-xs text-gray-500 mt-1">
              Error Code: {error.code}
            </p>
          )}

          {(error.isRetryable && onRetry) && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRetry(error)}
                className={`text-xs p-1 h-auto ${colors.button}`}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onDismiss(errorId), 300)
          }}
          className={`flex-shrink-0 ${colors.button} hover:bg-gray-100 rounded p-1 transition-colors`}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

/**
 * Global error notification container
 */
export function ErrorNotificationContainer() {
  const { errors, removeError, getErrorId } = useErrorQueue(3) // Show max 3 errors
  const [retryCallbacks] = useState<Map<string, (error: AppError) => void>>(new Map())

  const handleRetry = (error: AppError) => {
    const errorId = getErrorId(error)
    const retryCallback = retryCallbacks.get(errorId)

    if (retryCallback) {
      retryCallback(error)
      removeError(errorId)
    }
  }

  const registerRetryCallback = (errorId: string, callback: (error: AppError) => void) => {
    retryCallbacks.set(errorId, callback)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {errors.map(error => {
          const errorId = getErrorId(error)
          return (
            <ErrorNotification
              key={errorId}
              error={error}
              onDismiss={removeError}
              onRetry={handleRetry}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/**
 * Hook to show error notifications
 */
export function useErrorNotification() {
  const { addError, removeError, getErrorId } = useErrorQueue()

  const showError = (error: Error | AppError, retryCallback?: (error: AppError) => void) => {
    const appError = addError(error)

    if (retryCallback) {
      const errorId = getErrorId(appError)
      // Store retry callback for the notification system
      // This would typically be managed by a global state or context
    }

    return getErrorId(appError)
  }

  const hideError = (errorId: string) => {
    removeError(errorId)
  }

  return {
    showError,
    hideError
  }
}

/**
 * Error notification context for global state management
 */
export const ErrorNotificationContext = React.createContext<{
  showError: (error: Error | AppError, retryCallback?: (error: AppError) => void) => string
  hideError: (errorId: string) => void
} | null>(null)

export function ErrorNotificationProvider({ children }: { children: React.ReactNode }) {
  const { showError, hideError } = useErrorNotification()

  return (
    <ErrorNotificationContext.Provider value={{ showError, hideError }}>
      {children}
      <ErrorNotificationContainer />
    </ErrorNotificationContext.Provider>
  )
}

export function useErrorNotificationContext() {
  const context = React.useContext(ErrorNotificationContext)
  if (!context) {
    throw new Error('useErrorNotificationContext must be used within ErrorNotificationProvider')
  }
  return context
}