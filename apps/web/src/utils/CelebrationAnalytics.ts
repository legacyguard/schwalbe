// Stub implementation for CelebrationAnalytics
import { logger } from '@schwalbe/shared/lib/logger';
export class CelebrationAnalytics {
  trackCelebrationStart(celebrationId: string, context: any): void {
    logger.info('Celebration started', {
      action: 'celebration_start',
      metadata: { celebrationId, context }
    });
  }

  trackInteraction(celebrationId: string, interactionType: string): void {
    logger.info('Celebration interaction', {
      action: 'celebration_interaction',
      metadata: { celebrationId, interactionType }
    });
  }

  trackLayerComplete(celebrationId: string, layerId: string, duration: number): void {
    logger.info('Celebration layer completed', {
      action: 'celebration_layer_complete',
      metadata: { celebrationId, layerId, duration }
    });
  }
}