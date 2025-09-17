// Small client helper to send analytics events safely
// No secrets, no PII. Uses navigator.sendBeacon when available.

export type AnalyticsEvent = {
  event: string;
  locale: string;
  meta?: Record<string, unknown>;
};

const ENDPOINT = "/api/analytics/events";

export function track(event: AnalyticsEvent) {
  try {
    const payload = JSON.stringify(event);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    // Fallback to fetch
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch (err) {
    // Swallow errors in analytics path
    console.warn("analytics:track_error", err);
  }
}
