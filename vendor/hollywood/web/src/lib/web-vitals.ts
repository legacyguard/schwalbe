
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  const sendToAnalytics = (metric: any) => {
    // Send to Sentry
    if ((window as any).Sentry) {
      (window as any).Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: 'info',
        extra: {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
        },
      });
    }

    // Send to Google Analytics if available
    if ((window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
  };

  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
