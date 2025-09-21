// Stub implementation for FeedbackAnalytics
export class FeedbackAnalytics {
  trackAdaptation(sequenceId: string, adaptations: string[]): void {
    console.log(`Feedback adaptation: ${sequenceId}`, { adaptations });
  }

  trackStageComplete(
    sequenceId: string,
    stageId: string,
    result: 'success' | 'skip' | 'fail',
    emotionalState: string
  ): void {
    console.log(`Stage completed: ${sequenceId}/${stageId}`, { result, emotionalState });
  }
}