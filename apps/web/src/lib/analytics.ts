/**
 * Analytics utility for tracking user events
 * Integrates with Google Analytics using react-ga4
 */
import ReactGA from 'react-ga4';

import { config, isProduction } from '@/lib/env';

// NOTE: This implementation requires adding the `react-ga4` package.
// Run `npm install react-ga4` in the `apps/web` workspace.

let isInitialized = false;

if (config.analytics.gaTrackingId && config.analytics.gaTrackingId.startsWith('G-')) {
  ReactGA.initialize(config.analytics.gaTrackingId, {
    testMode: !isProduction,
  });
  isInitialized = true;
  console.log('Google Analytics initialized.');
} else {
  console.warn('Google Analytics Tracking ID is not configured or is invalid. Analytics will be disabled.');
}
/**
 * Send analytics event
 * @param event - Event name
 * @param properties - Additional event properties
 */
export function sendAnalytics(event: string, properties?: Record<string, any>): void {
  if (!isInitialized) return;

  try {
    ReactGA.event(event, properties);
  } catch (error) {
    // Silently fail analytics to avoid breaking the app
    console.warn('Analytics error:', error);
  }
}
/**
 * Track page view
 * @param page - Page name or path
 */
export function trackPageView(page: string): void {
  if (!isInitialized) return;

  try {
    ReactGA.send({ hitType: 'pageview', page });
  } catch (error) {
    console.warn('Analytics pageview error:', error);
  }
}
/**
 * Track user interaction
 * @param action - Action name
 * @param category - Category (optional)
 * @param label - Label (optional)
 */
export function trackInteraction(action: string, category?: string, label?: string): void {
  if (!isInitialized) return;

  sendAnalytics('interaction', {
    category: category || 'UserInteraction',
    action,
    label,
  });
}