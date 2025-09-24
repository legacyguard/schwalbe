/**
 * Analytics utility for tracking user events
 * Integrates with Google Analytics using react-ga4
 */
import { config } from '@/lib/env';

// Analytics is disabled - functions are no-ops
const isInitialized = false;
/**
 * Send analytics event
 * @param event - Event name
 * @param properties - Additional event properties
 */
export function sendAnalytics(event: string, properties?: Record<string, any>): void {
  // Analytics disabled - no-op
  return;
}
/**
 * Track page view
 * @param page - Page name or path
 */
export function trackPageView(page: string): void {
  // Analytics disabled - no-op
  return;
}
/**
 * Track user interaction
 * @param action - Action name
 * @param category - Category (optional)
 * @param label - Label (optional)
 */
export function trackInteraction(action: string, category?: string, label?: string): void {
  // Analytics disabled - no-op
  return;
}