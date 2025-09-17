
/**
 * Sentry Error Reporting Configuration
 * Centralized error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration({
        // Set tracing origins to track performance of API calls
      }),
    ],

    // Performance sampling
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session tracking
    // autoSessionTracking: true, // Not available in current Sentry version

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Error filtering
    beforeSend(event) {
      // Filter out known non-critical errors
      if (
        event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')
      ) {
        return null;
      }
      if (
        event.exception?.values?.[0]?.value?.includes('Non-serializable values')
      ) {
        return null;
      }
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
        return null;
      }
      return event;
    },

    // User context
    initialScope: {
      tags: {
        component: 'web-app',
        platform: 'react',
      },
    },

    // Debug mode in development
    debug: import.meta.env.DEV,

    // Enable user feedback dialog
    // showReportDialog: false, // Not available in current Sentry version
  });
};

// Custom error boundary wrapper
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring helpers
export const addBreadcrumb = (
  message: string,
  category = 'user-action',
  level = 'info'
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: level as any,
    timestamp: Date.now() / 1000,
  });
};

export const setUserContext = (user: {
  email?: string;
  id?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

export const captureException = (
  error: Error,
  context?: Record<string, any>
) => {
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

// Alias for backward compatibility
export const captureError = captureException;

export const captureMessage = (
  message: string,
  level: 'error' | 'info' | 'warning' = 'info'
) => {
  Sentry.captureMessage(message, level);
};

// Transaction tracking for performance
export const startTransaction = (name: string, operation = 'navigation') => {
  return Sentry.startSpan({ name, op: operation }, () => {
    // Transaction wrapper
  });
};

export default Sentry;
