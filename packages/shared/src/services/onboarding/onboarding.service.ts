import { logger } from '../../lib/logger';

/**
 * Onboarding Service
 * Manages onboarding flow state and completion tracking
 */

export interface OnboardingData {
  boxItems: string;
  trustedName: string;
  completedAt?: string;
  completedSteps: number;
  totalTimeSpent?: number;
}

export interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number;
}

export class OnboardingService {
  private static STORAGE_KEY = 'schwalbe_onboarding';

  /**
   * Save onboarding progress to localStorage
   */
  static saveProgress(data: Partial<OnboardingData>): void {
    try {
      const existing = this.getProgress();
      const updated = { ...existing, ...data };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to save onboarding progress:', error);
    }
  }

  /**
   * Get onboarding progress from localStorage
   */
  static getProgress(): OnboardingData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to retrieve onboarding progress:', error);
    }

    return {
      boxItems: '',
      trustedName: '',
      completedSteps: 0,
    };
  }

  /**
   * Mark onboarding as completed
   */
  static markCompleted(totalTimeSpent?: number): void {
    const completedData: Partial<OnboardingData> = {
      completedAt: new Date().toISOString(),
      completedSteps: 4, // All 4 scenes
      totalTimeSpent,
    };

    this.saveProgress(completedData);
  }

  /**
   * Check if onboarding is completed
   */
  static isCompleted(): boolean {
    const progress = this.getProgress();
    return !!progress.completedAt;
  }

  /**
   * Clear onboarding data (for testing or reset)
   */
  static clearProgress(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear onboarding progress:', error);
    }
  }

  /**
   * Get completion percentage (0-100)
   */
  static getCompletionPercentage(): number {
    const progress = this.getProgress();
    return Math.round((progress.completedSteps / 4) * 100);
  }

  /**
   * Track step completion
   */
  static trackStepCompletion(stepName: string, timeSpent?: number): void {
    const progress = this.getProgress();
    const updatedSteps = Math.min(progress.completedSteps + 1, 4);
    
    this.saveProgress({
      completedSteps: updatedSteps,
    });

    // Track analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_completed', {
        step_name: stepName,
        step_number: updatedSteps,
        time_spent: timeSpent,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Generate onboarding summary for analytics
   */
  static getOnboardingSummary(): {
    isCompleted: boolean;
    completionPercentage: number;
    hasBoxItems: boolean;
    hasTrustedName: boolean;
    completedAt?: string;
    totalTimeSpent?: number;
  } {
    const progress = this.getProgress();
    
    return {
      isCompleted: this.isCompleted(),
      completionPercentage: this.getCompletionPercentage(),
      hasBoxItems: !!progress.boxItems.trim(),
      hasTrustedName: !!progress.trustedName.trim(),
      completedAt: progress.completedAt,
      totalTimeSpent: progress.totalTimeSpent,
    };
  }
}