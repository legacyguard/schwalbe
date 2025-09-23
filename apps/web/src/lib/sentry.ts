import * as Sentry from '@sentry/react';
import { config, isProduction, isDevelopment } from './env';

// Initialize Sentry
export function initSentry(): void {
  // Only initialize if DSN is configured
  if (!config.sentry.dsn) {
    console.warn('Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: isProduction ? 'production' : 'development',

    // Performance monitoring
    integrations: [
      // Basic browser integration
    ],

    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (isDevelopment) {
        // Don't send React DevTools errors
        if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection captured')) {
          return null;
        }
      }

      // Filter out known third-party errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;

        // Filter out network errors from ad blockers
        if (message.includes('blocked by client') ||
            message.includes('Failed to fetch') ||
            message.includes('Load failed')) {
          return null;
        }

        // Filter out Chrome extension errors
        if (message.includes('Extension context invalidated') ||
            message.includes('chrome-extension://')) {
          return null;
        }
      }

      return event;
    },

    // Release tracking
    release: process.env.VITE_APP_VERSION || 'unknown',

    // User context
    initialScope: {
      tags: {
        component: 'web-app',
      },
    },
  });
}

// Error reporting utilities
export function reportError(error: Error, context?: Record<string, unknown>): void {
  console.error('Reported error:', error, context);

  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }
}

export function reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>): void {
  console[level === 'warning' ? 'warn' : level === 'error' ? 'error' : 'log']('Reported message:', message, context);

  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }
}

export function setUserContext(user: { id: string; email?: string; username?: string }): void {
  if (config.sentry.dsn) {
    Sentry.setUser(user);
  }
}

export function clearUserContext(): void {
  if (config.sentry.dsn) {
    Sentry.setUser(null);
  }
}

// Performance monitoring
export function startTransaction(name: string, op: string = 'navigation') {
  if (config.sentry.dsn) {
    return Sentry.startSpan({ name, op }, () => {
      // Return the span for the transaction
    });
  }
  return null;
}

// React Router integration (for when router is available)
export function setupReactRouterIntegration() {
  // This will be called from main.tsx after React Router is imported
  try {
    // Dynamic import for React Router integration
    // This is handled by Sentry's automatic router integration
    console.info('React Router integration available for Sentry');
  } catch (error) {
    console.warn('Failed to setup React Router integration for Sentry');
  }
}