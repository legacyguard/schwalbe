// Stub implementation for NotificationAnalytics
export class NotificationAnalytics {
  trackShown(notificationId: string, context?: any, reason?: string): void {
    console.log(`Notification shown: ${notificationId}`, { context, reason });
  }

  trackViewed(notificationId?: string): void {
    console.log(`Notification viewed: ${notificationId}`);
  }

  trackEngaged(notificationId?: string, action?: string): void {
    console.log(`Notification engaged: ${notificationId}`, { action });
  }

  trackDismissed(notificationId?: string, reason?: string): void {
    console.log(`Notification dismissed: ${notificationId}`, { reason });
  }
}