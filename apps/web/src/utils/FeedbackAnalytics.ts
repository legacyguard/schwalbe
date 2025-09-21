// Stub implementation for FeedbackAnalytics
import { logger } from '@schwalbe/shared/lib/logger';
export class FeedbackAnalytics {
  trackAdaptation(sequenceId: string, adaptations: string[]): void {
    logger.info('Feedback adaptation tracked', {
      action: 'feedback_adaptation',
      metadata: { sequenceId, adaptations }
    });
  }

  trackStageComplete(
    sequenceId: string,
    stageId: string,
    result: 'success' | 'skip' | 'fail',
    emotionalState: string
  ): void {
    logger.info('Stage completion tracked', {
      action: 'stage_completion',
      metadata: { sequenceId, stageId, result, emotionalState }
    });
  }
}