
/**
 * React hooks for conversion tracking and key metrics
 * Integrates with A/B testing system and analytics
 */

import { useUser } from '@clerk/clerk-react';
import { useCallback, useEffect } from 'react';
import { abTestingSystem } from '@/lib/ab-testing/ab-testing-system';

// Google Analytics gtag types
interface GtagWindow {
  gtag?: (
    command: string,
    eventName: string,
    parameters?: Record<string, any>
  ) => void;
}

declare const window: GtagWindow & Window;

/**
 * Hook for tracking onboarding flow metrics
 */
export function useOnboardingTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  const trackOnboardingStart = useCallback(() => {
    abTestingSystem.trackOnboardingMetric(userId, 'start', 'started');

    // Track in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'onboarding_started', {
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [userId]);

  const trackOnboardingStep = useCallback(
    (
      step: string,
      action: 'abandoned' | 'completed' | 'started',
      timeSpent?: number
    ) => {
      abTestingSystem.trackOnboardingMetric(userId, step, action, timeSpent);

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `onboarding_step_${action}`, {
          user_id: userId,
          step: step,
          time_spent: timeSpent,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackOnboardingComplete = useCallback(
    (totalTime?: number, completedSteps?: number) => {
      abTestingSystem.trackOnboardingMetric(
        userId,
        'complete',
        'completed',
        totalTime
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'onboarding_completed', {
          user_id: userId,
          total_time: totalTime,
          completed_steps: completedSteps,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,
  };
}

/**
 * Hook for tracking document upload and first value metrics
 */
export function useDocumentTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  const trackFirstDocumentUpload = useCallback(
    (documentType: string, timeToUpload?: number) => {
      abTestingSystem.trackConversion(
        userId,
        'first_value_v1',
        'first_document_uploaded',
        1,
        {
          documentType,
          timeToUpload,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'first_document_uploaded', {
          user_id: userId,
          document_type: documentType,
          time_to_upload: timeToUpload,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackDocumentInsightsViewed = useCallback(
    (documentId: string, insightType: string) => {
      abTestingSystem.trackConversion(
        userId,
        'instant_value_v1',
        'insights_viewed',
        1,
        {
          documentId,
          insightType,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'document_insights_viewed', {
          user_id: userId,
          document_id: documentId,
          insight_type: insightType,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackQuickActionTaken = useCallback(
    (action: string, timeSpent?: number) => {
      abTestingSystem.trackConversion(
        userId,
        'quick_actions_v1',
        'quick_action_taken',
        1,
        {
          action,
          timeSpent,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quick_action_taken', {
          user_id: userId,
          action: action,
          time_spent: timeSpent,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackFirstDocumentUpload,
    trackDocumentInsightsViewed,
    trackQuickActionTaken,
  };
}

/**
 * Hook for tracking professional review conversions
 */
export function useProfessionalReviewTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  const trackReviewButtonViewed = useCallback(
    (trustScore?: number, location?: string) => {
      abTestingSystem.trackProfessionalReviewConversion(
        userId,
        'button_viewed',
        trustScore
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'professional_review_button_viewed', {
          user_id: userId,
          trust_score: trustScore,
          location: location,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackReviewButtonClicked = useCallback(
    (trustScore?: number, variant?: string) => {
      abTestingSystem.trackProfessionalReviewConversion(
        userId,
        'button_clicked',
        trustScore
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'professional_review_button_clicked', {
          user_id: userId,
          trust_score: trustScore,
          variant: variant,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackReviewFlowStarted = useCallback(
    (reviewType?: string, estimatedCost?: number) => {
      abTestingSystem.trackProfessionalReviewConversion(userId, 'flow_started');

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'professional_review_flow_started', {
          user_id: userId,
          review_type: reviewType,
          estimated_cost: estimatedCost,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackReviewFlowCompleted = useCallback(
    (reviewType?: string, finalCost?: number) => {
      abTestingSystem.trackProfessionalReviewConversion(
        userId,
        'flow_completed'
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'professional_review_flow_completed', {
          user_id: userId,
          review_type: reviewType,
          final_cost: finalCost,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackReviewButtonViewed,
    trackReviewButtonClicked,
    trackReviewFlowStarted,
    trackReviewFlowCompleted,
  };
}

/**
 * Hook for tracking trust score interactions
 */
export function useTrustScoreTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  const trackTrustScoreViewed = useCallback(
    (currentScore: number, location?: string) => {
      abTestingSystem.trackTrustScoreInteraction(
        userId,
        'viewed',
        currentScore
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'trust_score_viewed', {
          user_id: userId,
          current_score: currentScore,
          location: location,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackTrustScoreClicked = useCallback(
    (currentScore: number, displayType?: string) => {
      abTestingSystem.trackTrustScoreInteraction(
        userId,
        'clicked',
        currentScore
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'trust_score_clicked', {
          user_id: userId,
          current_score: currentScore,
          display_type: displayType,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackTrustScoreTooltip = useCallback(
    (currentScore: number) => {
      abTestingSystem.trackTrustScoreInteraction(
        userId,
        'tooltip_opened',
        currentScore
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'trust_score_tooltip_opened', {
          user_id: userId,
          current_score: currentScore,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackTrustScoreViewed,
    trackTrustScoreClicked,
    trackTrustScoreTooltip,
  };
}

/**
 * Hook for tracking milestone celebrations
 */
export function useMilestoneTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  const trackMilestoneAchieved = useCallback(
    (
      milestoneType: string,
      milestoneName: string,
      progress: number,
      familyImpact?: string
    ) => {
      abTestingSystem.trackConversion(
        userId,
        'milestone_celebration_v1',
        'milestone_achieved',
        1,
        {
          milestoneType,
          milestoneName,
          progress,
          familyImpact,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'milestone_achieved', {
          user_id: userId,
          milestone_type: milestoneType,
          milestone_name: milestoneName,
          progress: progress,
          family_impact: familyImpact,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  const trackCelebrationInteraction = useCallback(
    (
      action: 'continue_clicked' | 'modal_dismissed' | 'modal_viewed',
      milestoneType?: string
    ) => {
      abTestingSystem.trackConversion(
        userId,
        'milestone_celebration_v1',
        `celebration_${action}`,
        1,
        {
          action,
          milestoneType,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `milestone_celebration_${action}`, {
          user_id: userId,
          milestone_type: milestoneType,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackMilestoneAchieved,
    trackCelebrationInteraction,
  };
}

/**
 * Hook for tracking retention metrics
 */
export function useRetentionTracking() {
  const { user } = useUser();
  const userId = user?.id || 'anonymous';

  // Track user return visits
  useEffect(() => {
    const trackReturn = () => {
      const lastVisit = localStorage.getItem(`last_visit_${userId}`);
      const now = new Date().toISOString();

      if (lastVisit) {
        const daysSinceLastVisit = Math.floor(
          (new Date(now).getTime() - new Date(lastVisit).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        abTestingSystem.trackConversion(
          userId,
          'retention_v1',
          'user_return',
          daysSinceLastVisit,
          {
            lastVisit,
            daysSinceLastVisit,
          }
        );

        // Track in analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'user_return', {
            user_id: userId,
            days_since_last_visit: daysSinceLastVisit,
            last_visit: lastVisit,
            timestamp: now,
          });
        }
      }

      localStorage.setItem(`last_visit_${userId}`, now);
    };

    trackReturn();
  }, [userId]);

  const trackFeatureEngagement = useCallback(
    (
      feature: string,
      engagementType: 'completed' | 'used' | 'viewed',
      timeSpent?: number
    ) => {
      abTestingSystem.trackConversion(
        userId,
        'feature_engagement_v1',
        `${feature}_${engagementType}`,
        1,
        {
          feature,
          engagementType,
          timeSpent,
        }
      );

      // Track in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'feature_engagement', {
          user_id: userId,
          feature: feature,
          engagement_type: engagementType,
          time_spent: timeSpent,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId]
  );

  return {
    trackFeatureEngagement,
  };
}
