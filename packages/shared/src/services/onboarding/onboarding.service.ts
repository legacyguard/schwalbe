import { logger } from '../../lib/logger';

/**
 * Onboarding Service
 * Manages onboarding flow state and completion tracking
 */

export interface OnboardingData {
  boxItems: string;
  trustedName: string;
  familyContext?: any;
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

import { supabaseClient as supabase } from '../../supabase/client';

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
      logger.error('Failed to save onboarding progress:', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
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
      logger.error('Failed to retrieve onboarding progress:', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

return {
      boxItems: '',
      trustedName: '',
      familyContext: undefined,
      completedSteps: 0,
    };
  }

  /**
   * Attempt to persist progress to Supabase (best-effort)
   */
  static async saveProgressRemote(data: Partial<OnboardingData>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return;
      const payload: any = {
        user_id: userId,
        box_items: data.boxItems ?? null,
        trusted_name: data.trustedName ?? null,
        family_context: data.familyContext ?? null,
        completed_steps: data.completedSteps ?? null,
        completed_at: data.completedAt ?? null,
        total_time_spent: data.totalTimeSpent ?? null,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('onboarding_progress').upsert(payload, { onConflict: 'user_id' });
    } catch {
      // Ignore missing table or any remote errors silently
    }
  }

  /**
   * Fetch onboarding progress from Supabase (best-effort)
   */
  static async fetchProgressRemote(): Promise<Partial<OnboardingData> | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) return null;
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('box_items, trusted_name, family_context, completed_steps, completed_at, total_time_spent')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        boxItems: (data as any).box_items ?? '',
        trustedName: (data as any).trusted_name ?? '',
        familyContext: (data as any).family_context ?? undefined,
        completedSteps: (data as any).completed_steps ?? 0,
        completedAt: (data as any).completed_at ?? undefined,
        totalTimeSpent: (data as any).total_time_spent ?? undefined,
      };
    } catch {
      return null;
    }
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
    // Best-effort remote persist
    void this.saveProgressRemote(completedData);
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
      logger.error('Failed to clear onboarding progress:', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
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