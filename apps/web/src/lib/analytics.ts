// Analytics tracking utility for landing page events

import { config } from '@/lib/env';

export interface AnalyticsEvent {
  eventType: 'landing_view' | 'landing_section_view' | 'landing_cta_click' | 'landing_password_authenticated';
  eventData?: Record<string, any>;
}

export async function sendAnalytics(
  eventType: AnalyticsEvent['eventType'],
  eventData?: Record<string, any>
): Promise<void> {
  // In dev mode, log to console as specified in documentation
  // TODO: In production, send to external metrics service
  if (config.isDev) {
    console.log('Analytics event:', { eventType, eventData: eventData || {} });
  } else {
    // TODO: Implement production analytics sink
    console.warn('Production analytics not yet implemented');
  }
}