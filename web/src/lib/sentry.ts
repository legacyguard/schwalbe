
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_APP_ENV || 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          return null;
        }
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
}
