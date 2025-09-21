
/**
 * Analytics and Performance Monitoring
 * Google Analytics 4 + Web Vitals + Custom Metrics
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Google Analytics 4 Configuration
interface GtagEvent {
  [key: string]: unknown;
  event_category?: string;
  event_label?: string;
  value?: number;
}

interface GtagConfig {
  [key: string]: unknown;
  page_location?: string;
  page_title?: string;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: string,
      targetId: string,
      config?: GtagConfig | GtagEvent
    ) => void;
  }
}

export const initAnalytics = () => {
  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!GA_ID || import.meta.env.DEV) {
    console.log('Analytics disabled in development');
    return;
  }

  // Load Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date().toISOString());
  window.gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
    anonymize_ip: true,
    allow_google_signals: false,
    send_page_view: false, // We'll send manually
  });
};

// Web Vitals Monitoring
export const initWebVitals = () => {
  const sendToAnalytics = (metric: {
    id: string;
    name: string;
    value: number;
  }) => {
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      non_interaction: true,
      custom_map: {
        metric_id: 'dimension1',
        metric_value: 'dimension2',
        metric_delta: 'dimension3',
      },
    });

    // Send to performance API for monitoring
    if ('PerformanceObserver' in window) {
      performance.mark(`vitals-${metric.name}-${metric.value}`);
    }
  };

  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};

// Custom Event Tracking
export const trackEvent = (
  action: string,
  category = 'User Interaction',
  label?: string,
  value?: number
) => {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value,
  });

  // Also log for development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', { action, category, label, value });
  }
};

// Page View Tracking
export const trackPageView = (page_title?: string, page_location?: string) => {
  window.gtag?.('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    page_title: page_title || document.title,
    page_location: page_location || window.location.href,
  });
};

// User Properties
export const setUserProperties = (properties: Record<string, any>) => {
  window.gtag?.('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    user_properties: properties,
  });
};

// E-commerce Tracking
interface PurchaseItem {
  category: string;
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

export const trackPurchase = (transactionId: string, items: PurchaseItem[]) => {
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    value: items.reduce((sum, item) => sum + item.price, 0),
    currency: 'EUR',
    items,
  });
};

// Application-specific Events
export const trackUserJourney = {
  onboardingStart: () => trackEvent('onboarding_start', 'User Journey'),
  onboardingComplete: () => trackEvent('onboarding_complete', 'User Journey'),
  documentUpload: (type: string) =>
    trackEvent('document_upload', 'Documents', type),
  willCreated: (jurisdiction: string) =>
    trackEvent('will_created', 'Legal', jurisdiction),
  guardianAdded: () => trackEvent('guardian_added', 'Family'),
  emergencyAccess: () => trackEvent('emergency_access', 'Security'),
  subscriptionUpgrade: (plan: string) =>
    trackEvent('subscription_upgrade', 'Conversion', plan),
};

// Performance Monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static startTiming(label: string) {
    const startTime = performance.now();
    this.metrics.set(label, startTime);
    performance.mark(`${label}-start`);
  }

  static endTiming(label: string, category = 'Performance') {
    const startTime = this.metrics.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      trackEvent(`timing_${label}`, category, label, Math.round(duration));
      this.metrics.delete(label);

      return duration;
    }
    return null;
  }

  static measureApiCall(
    url: string,
    method: string,
    duration: number,
    status: number
  ) {
    trackEvent('api_call', 'API', `${method} ${url}`, Math.round(duration));

    if (status >= 400) {
      trackEvent(
        'api_error',
        'API Error',
        `${status} ${method} ${url}`,
        status
      );
    }
  }

  static measureComponentRender(componentName: string, renderTime: number) {
    trackEvent(
      'component_render',
      'Performance',
      componentName,
      Math.round(renderTime)
    );
  }
}

// Error Tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  window.gtag?.('event', 'exception', {
    description: error.message,
    fatal: false,
    ...context,
  });
};

// A/B Testing Support
export const trackExperiment = (experimentId: string, variant: string) => {
  window.gtag?.('event', 'experiment_impression', {
    event_category: 'A/B Testing',
    event_label: experimentId,
    custom_parameter_1: variant,
  });
};

// Default export for compatibility
const analyticsService = {
  initAnalytics,
  initWebVitals,
  trackEvent,
  trackPageView,
  setUserProperties,
  trackPurchase,
  trackUserJourney,
  trackError,
  trackExperiment,
  PerformanceMonitor,
};

export { analyticsService };

export default analyticsService;
