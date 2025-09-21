// Stub implementation for CelebrationAnalytics
export class CelebrationAnalytics {
  trackCelebrationStart(celebrationId: string, context: any): void {
    console.log(`Celebration started: ${celebrationId}`, { context });
  }

  trackInteraction(celebrationId: string, interactionType: string): void {
    console.log(`Celebration interaction: ${celebrationId}`, { interactionType });
  }

  trackLayerComplete(celebrationId: string, layerId: string, duration: number): void {
    console.log(`Celebration layer completed: ${celebrationId}/${layerId}`, { duration });
  }
}