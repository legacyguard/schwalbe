/**
 * Analytics utility for tracking user events
 * Currently a stub implementation - can be extended with actual analytics service
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

/**
 * Send analytics event
 * @param event - Event name or event object
 * @param properties - Additional event properties
 */
export function sendAnalytics(event: string | AnalyticsEvent, properties?: Record<string, any>): void {
  try {
    const eventData: AnalyticsEvent = typeof event === 'string'
      ? { event, properties, timestamp: Date.now() }
      : { ...event, timestamp: event.timestamp || Date.now() };

    // For now, just log to console in development
    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', eventData);
    }

    // TODO: Implement actual analytics service integration
    // e.g., Google Analytics, Mixpanel, etc.
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
  sendAnalytics('page_view', { page });
}

/**
 * Track user interaction
 * @param action - Action name
 * @param category - Category (optional)
 * @param label - Label (optional)
 */
export function trackInteraction(action: string, category?: string, label?: string): void {
  sendAnalytics('interaction', { action, category, label });
}