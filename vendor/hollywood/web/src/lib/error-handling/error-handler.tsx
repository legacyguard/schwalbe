
/**
 * Comprehensive Error Handling System
 * Provides centralized error management, logging, and recovery
 */

import { envConfig } from '../security/env-config';
import React from 'react';
import i18next from 'i18next';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  ENCRYPTION = 'encryption',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

// Custom error interface
export interface AppError extends Error {
  category: ErrorCategory;
  code: string;
  context?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
  sessionId?: string;
  severity: ErrorSeverity;
  statusCode?: number;
  technicalDetails?: string;
  timestamp: Date;
  userId?: string;
  userMessage?: string;
}

/**
 * Base class for application errors
 */
export class BaseError extends Error implements AppError {
  public code: string;
  public category: ErrorCategory;
  public severity: ErrorSeverity;
  public timestamp: Date;
  public statusCode?: number;
  public context?: Record<string, any>;
  public userId?: string;
  public sessionId?: string;
  public recoverable: boolean;
  public retryable: boolean;
  public userMessage?: string;
  public technicalDetails?: string;

  constructor(
    message: string,
    code: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date();
    this.recoverable = true;
    this.retryable = false;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      userId: this.userId,
      sessionId: this.sessionId,
      recoverable: this.recoverable,
      retryable: this.retryable,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
      stack: envConfig.isDevelopment() ? this.stack : undefined,
    };
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends BaseError {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message, code, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH);
    this.recoverable = true;
    this.retryable = true;
    this.userMessage = i18next.t('ui/error-handler:userMessages.authenticationFailed');
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends BaseError {
  constructor(message: string, code = 'AUTHZ_ERROR') {
    super(message, code, ErrorCategory.AUTHORIZATION, ErrorSeverity.HIGH);
    this.recoverable = false;
    this.retryable = false;
    this.userMessage = i18next.t('ui/error-handler:userMessages.noPermission');
  }
}

/**
 * Validation Error
 */
export class ValidationError extends BaseError {
  public validationErrors?: Record<string, string[]>;

  constructor(message: string, validationErrors?: Record<string, string[]>) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW
    );
    this.validationErrors = validationErrors;
    this.recoverable = true;
    this.retryable = false;
    this.userMessage = i18next.t('ui/error-handler:userMessages.checkInput');
  }
}

/**
 * Network Error
 */
export class NetworkError extends BaseError {
  constructor(message: string, code = 'NETWORK_ERROR') {
    super(message, code, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM);
    this.recoverable = true;
    this.retryable = true;
    this.userMessage = i18next.t('ui/error-handler:userMessages.networkError');
  }
}

/**
 * Database Error
 */
export class DatabaseError extends BaseError {
  constructor(message: string, code = 'DB_ERROR') {
    super(message, code, ErrorCategory.DATABASE, ErrorSeverity.HIGH);
    this.recoverable = true;
    this.retryable = true;
    this.userMessage = i18next.t('ui/error-handler:userMessages.databaseError');
  }
}

/**
 * Encryption Error
 */
export class EncryptionError extends BaseError {
  constructor(message: string, code = 'ENCRYPTION_ERROR') {
    super(message, code, ErrorCategory.ENCRYPTION, ErrorSeverity.CRITICAL);
    this.recoverable = false;
    this.retryable = false;
    this.userMessage = i18next.t('ui/error-handler:userMessages.encryptionError');
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends BaseError {
  public retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, 'RATE_LIMIT_ERROR', ErrorCategory.SYSTEM, ErrorSeverity.LOW);
    this.retryAfter = retryAfter;
    this.recoverable = true;
    this.retryable = true;
    this.userMessage = i18next.t('ui/error-handler:userMessages.rateLimitError', { seconds: retryAfter });
  }
}

/**
 * Global Error Handler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private errorListeners: ((error: AppError) => void)[] = [];
  private maxQueueSize = 100;

  private constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', event => {
        console.error('Unhandled promise rejection:', event.reason);
        this.handleError(
          new BaseError(
            event.reason?.message || 'Unhandled promise rejection',
            'UNHANDLED_REJECTION',
            ErrorCategory.SYSTEM,
            ErrorSeverity.HIGH
          )
        );
        event.preventDefault();
      });

      // Handle global errors
      window.addEventListener('error', event => {
        console.error('Global error:', event.error);
        this.handleError(
          new BaseError(
            event.error?.message || event.message || 'Unknown error',
            'GLOBAL_ERROR',
            ErrorCategory.SYSTEM,
            ErrorSeverity.HIGH
          )
        );
        event.preventDefault();
      });
    }
  }

  /**
   * Handle an error
   */
  public handleError(error: AppError | Error): void {
    const appError = this.normalizeError(error);

    // Add to queue
    this.addToQueue(appError);

    // Log error
    this.logError(appError);

    // Notify listeners
    this.notifyListeners(appError);

    // Send to monitoring service
    if (
      appError.severity === ErrorSeverity.HIGH ||
      appError.severity === ErrorSeverity.CRITICAL
    ) {
      this.sendToMonitoring(appError);
    }

    // Take action based on severity
    this.takeAction(appError);
  }

  /**
   * Normalize error to AppError
   */
  private normalizeError(error: AppError | Error): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    // Convert standard Error to AppError
    const appError = new BaseError(
      error.message,
      'UNKNOWN_ERROR',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM
    );

    appError.stack = error.stack;
    return appError;
  }

  /**
   * Check if error is AppError
   */
  private isAppError(error: any): error is AppError {
    return (
      error &&
      typeof error.code === 'string' &&
      typeof error.category === 'string' &&
      typeof error.severity === 'string'
    );
  }

  /**
   * Add error to queue
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Log error
   */
  private logError(error: AppError): void {
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context: error.context,
      environment: envConfig.get('VITE_APP_ENV'),
      version: envConfig.get('VITE_APP_VERSION'),
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(i18next.t('ui/error-handler:logMessages.criticalError'), logData);
        break;
      case ErrorSeverity.HIGH:
        console.error(i18next.t('ui/error-handler:logMessages.highSeverityError'), logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(i18next.t('ui/error-handler:logMessages.mediumSeverityError'), logData);
        break;
      case ErrorSeverity.LOW:
        console.log(i18next.t('ui/error-handler:logMessages.lowSeverityError'), logData);
        break;
    }
  }

  /**
   * Send error to monitoring service (e.g., Sentry)
   */
  private sendToMonitoring(error: AppError): void {
    if (envConfig.get('VITE_SENTRY_DSN')) {
      // Send to Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          level: this.mapSeverityToSentryLevel(error.severity),
          tags: {
            category: error.category,
            code: error.code,
          },
          contexts: {
            app: {
              environment: envConfig.get('VITE_APP_ENV'),
              version: envConfig.get('VITE_APP_VERSION'),
            },
          },
          extra: error.context,
        });
      }
    }
  }

  /**
   * Map error severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Take action based on error severity
   */
  private takeAction(error: AppError): void {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        // Critical errors might require immediate action
        if (error.category === ErrorCategory.ENCRYPTION) {
          // Clear sensitive data from memory
          this.clearSensitiveData();
        }
        if (error.category === ErrorCategory.AUTHENTICATION) {
          // Force re-authentication
          this.forceReauthentication();
        }
        break;

      case ErrorSeverity.HIGH:
        // High severity errors might require user notification
        if (error.userMessage) {
          this.showErrorNotification(error.userMessage);
        }
        break;

      default:
        // Lower severity errors are logged but no immediate action
        break;
    }
  }

  /**
   * Clear sensitive data from memory
   */
  private clearSensitiveData(): void {
    // Clear encryption keys, tokens, etc.
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      // Notify app to clear sensitive state
      window.dispatchEvent(new CustomEvent('clearSensitiveData'));
    }
  }

  /**
   * Force re-authentication
   */
  private forceReauthentication(): void {
    if (typeof window !== 'undefined') {
      // Redirect to login
      window.location.href = '/sign-in';
    }
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(message: string): void {
    if (typeof window !== 'undefined') {
      // Dispatch event for UI to show notification
      window.dispatchEvent(new CustomEvent('showError', { detail: message }));
    }
  }

  /**
   * Register error listener
   */
  public addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, any> {
    const stats: Record<string, any> = {
      total: this.errorQueue.length,
      byCategory: {},
      bySeverity: {},
      recent: this.errorQueue.slice(-10),
    };

    this.errorQueue.forEach(error => {
      // Count by category
      stats.byCategory[error.category] =
        (stats.byCategory[error.category] || 0) + 1;

      // Count by severity
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  public clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Create error boundary wrapper
   */
  public createErrorBoundary(
    component: React.ComponentType
  ): React.ComponentType {
    return class ErrorBoundary extends React.Component<
      any,
      { hasError: boolean }
    > {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(_error: Error) {
        return { hasError: true };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const appError = new BaseError(
          error.message,
          'REACT_ERROR',
          ErrorCategory.SYSTEM,
          ErrorSeverity.HIGH
        );
        appError.context = { errorInfo };
        ErrorHandler.getInstance().handleError(appError);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className='error-boundary-fallback'>
              <h2>{i18next.t('ui/error-handler:errorBoundary.title')}</h2>
              <p>
                {i18next.t('ui/error-handler:errorBoundary.description')}
              </p>
              <button onClick={() => window.location.reload()}>
                {i18next.t('ui/error-handler:errorBoundary.refreshButton')}
              </button>
            </div>
          );
        }

        const Component = component;
        return <Component {...this.props} />;
      }
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export error types for convenience
export {
  AuthenticationError as AuthError,
  AuthorizationError as AuthzError,
  EncryptionError as CryptoError,
  DatabaseError as DbError,
  NetworkError as NetError,
  ValidationError as ValidError,
};

// React import moved to top of file
