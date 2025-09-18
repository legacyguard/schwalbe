export function sendAnalytics(eventType: string, eventData?: Record<string, any>): void {
  try {
    const payload = { eventType, eventData: eventData || {} };
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      (navigator as any).sendBeacon('/api/analytics/events', blob);
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // noop
  }
}