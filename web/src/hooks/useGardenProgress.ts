
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import {
  getSerenityMilestones,
  type SerenityMilestone,
} from '@/lib/path-of-serenity';
import type { PersonalityMode } from '@/lib/sofia-types';

export interface GardenProgressData {
  activeMilestones: SerenityMilestone[];
  adaptiveRecommendations: {
    focusArea: 'documents' | 'family' | 'guardians' | 'milestones';
    nextAction: string;
    personalizedMessage: string;
  };
  completedMilestones: number;
  documentsCount: number;
  gardenElements: {
    branches: number; // Guardians (protection)
    flowers: number; // Milestones achieved
    fruits: number; // Time capsules / legacy items
    leaves: number; // Active features
    roots: number; // Documents (foundation)
  };
  guardiansCount: number;
  overallProgress: number; // 0-100 percentage
  personalityInfluence: {
    animationIntensity: number; // How animated the garden should be
    colorPalette: 'balanced' | 'cool' | 'warm'; // Color scheme preference
    elementDensity: number; // How many garden elements to show
    growthRate: number; // How personality affects growth visualization
  };
  personalityMode: PersonalityMode;
  seedState: 'blooming' | 'dormant' | 'flourishing' | 'growing' | 'sprouting';
  timeCapsules: number;
  totalMilestones: number;
  willProgress: number;
}

export const useGardenProgress = () => {
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();
  const personalityManager = usePersonalityManager();
  const [progress, setProgress] = useState<GardenProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const calculateProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = await createSupabaseClient();

      // Get all data in parallel
      const [
        { data: documents, error: docError },
        { data: guardians, error: guardianError },
        { data: timeCapsules, error: capsulesError },
        { data: wills, error: willsError },
      ] = await Promise.all([
        (supabase as any).from('documents').select('*').eq('user_id', userId),
        supabase
          .from('guardians')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true),
        (supabase as any).from('time_capsules').select('*').eq('user_id', userId),
        (supabase as any).from('wills').select('*').eq('user_id', userId),
      ]);

      if (docError) throw docError;
      if (guardianError) throw guardianError;
      if (capsulesError) throw capsulesError;
      if (willsError) throw willsError;

      // Calculate milestones progress
      const milestones = getSerenityMilestones();
      const activeMilestones: SerenityMilestone[] = [];
      const completedCount = milestones.reduce((count, milestone) => {
        const isActive = checkMilestoneActive(milestone, {
          documents: documents || [],
          guardians: guardians || [],
          timeCapsules: timeCapsules || [],
          wills: wills || [],
        });

        if (isActive) {
          activeMilestones.push(milestone);
          return count + 1;
        }
        return count;
      }, 0);

      // Calculate component counts
      const documentsCount = documents?.length || 0;
      const guardiansCount = guardians?.length || 0;
      const timeCapsulesCount = timeCapsules?.length || 0;

      // Calculate will progress (0-100)
      const willProgress =
        wills && wills.length > 0
          ? Math.min(
              (((wills[0] as Record<string, any>)
                .completion_percentage as number) || 0) * 100,
              100
            )
          : 0;

      // Calculate overall progress with weighted components
      const weights = {
        documents: 0.25, // 25% - Foundation (documents)
        guardians: 0.25, // 25% - Protection (guardians)
        milestones: 0.3, // 30% - Growth (milestones)
        timeCapsules: 0.1, // 10% - Legacy (time capsules)
        will: 0.1, // 10% - Legal foundation
      };

      const normalizedScores = {
        documents: Math.min(documentsCount / 10, 1) * 100, // Normalize to 10 docs max
        guardians: Math.min(guardiansCount / 5, 1) * 100, // Normalize to 5 guardians max
        milestones: (completedCount / milestones.length) * 100,
        timeCapsules: Math.min(timeCapsulesCount / 3, 1) * 100, // Normalize to 3 capsules max
        will: willProgress,
      };

      const overallProgress = Object.entries(weights).reduce(
        (total, [key, weight]) => {
          return (
            total +
            normalizedScores[key as keyof typeof normalizedScores] * weight
          );
        },
        0
      );

      // Determine seed state based on overall progress
      const getSeedState = (
        progress: number
      ): GardenProgressData['seedState'] => {
        if (progress === 0) return 'dormant';
        if (progress < 20) return 'sprouting';
        if (progress < 50) return 'growing';
        if (progress < 80) return 'flourishing';
        return 'blooming';
      };

      // Get personality mode for adaptive calculations
      const personalityMode =
        personalityManager?.getCurrentStyle() || 'adaptive';
      const effectiveMode =
        personalityMode === 'balanced' ? 'adaptive' : personalityMode;

      // Calculate personality influence on garden visualization
      const personalityInfluence = {
        growthRate:
          effectiveMode === 'empathetic'
            ? 1.3
            : effectiveMode === 'pragmatic'
              ? 0.8
              : 1.0,
        elementDensity:
          effectiveMode === 'empathetic'
            ? 1.4
            : effectiveMode === 'pragmatic'
              ? 0.7
              : 1.0,
        animationIntensity:
          effectiveMode === 'empathetic'
            ? 1.5
            : effectiveMode === 'pragmatic'
              ? 0.6
              : 1.0,
        colorPalette:
          effectiveMode === 'empathetic'
            ? ('warm' as const)
            : effectiveMode === 'pragmatic'
              ? ('cool' as const)
              : ('balanced' as const),
      };

      // Calculate adaptive recommendations based on personality and progress
      const getAdaptiveRecommendations = () => {
        let nextAction = 'Upload your first document to begin';
        let focusArea: 'documents' | 'family' | 'guardians' | 'milestones' =
          'documents';
        let personalizedMessage = 'Your legacy garden is ready to grow';

        if (documentsCount === 0) {
          nextAction =
            effectiveMode === 'empathetic'
              ? 'Plant the first seed of love by uploading a cherished document'
              : effectiveMode === 'pragmatic'
                ? 'Initialize protection protocol: upload first document'
                : 'Begin your legacy journey with your first document';
          focusArea = 'documents';
        } else if (guardiansCount === 0) {
          nextAction =
            effectiveMode === 'empathetic'
              ? 'Invite a trusted friend to be your guardian'
              : effectiveMode === 'pragmatic'
                ? 'Assign guardian for system redundancy'
                : 'Add your first guardian to strengthen protection';
          focusArea = 'guardians';
        } else if (completedCount < 3) {
          nextAction = 'Complete more milestones to grow your garden';
          focusArea = 'milestones';
        }

        // Personality-specific messages
        if (effectiveMode === 'empathetic') {
          personalizedMessage =
            overallProgress < 25
              ? 'Your garden of love is just beginning to sprout 💚'
              : overallProgress < 50
                ? "Beautiful growth! Your family's protection is blossoming"
                : overallProgress < 75
                  ? 'Your caring heart has created a thriving garden'
                  : 'Magnificent! Your legacy garden flourishes with love';
        } else if (effectiveMode === 'pragmatic') {
          personalizedMessage =
            overallProgress < 25
              ? 'Protection system initialization: 25% complete'
              : overallProgress < 50
                ? 'Core protection modules: 50% operational'
                : overallProgress < 75
                  ? 'Advanced security protocols: 75% implemented'
                  : 'Full family protection matrix: operational';
        } else {
          personalizedMessage =
            overallProgress < 25
              ? 'Your legacy foundation is taking shape'
              : overallProgress < 50
                ? 'Strong progress! Your protection is growing'
                : overallProgress < 75
                  ? 'Excellent! Your legacy system is thriving'
                  : 'Outstanding! Your comprehensive protection is complete';
        }

        return { nextAction, focusArea, personalizedMessage };
      };

      // Calculate garden elements (visual representation) with personality influence
      const gardenElements = {
        roots: Math.min(
          Math.floor(documentsCount * personalityInfluence.elementDensity),
          10
        ),
        branches: Math.floor(
          guardiansCount * personalityInfluence.elementDensity
        ),
        leaves: Math.floor(
          (overallProgress / 10) * personalityInfluence.elementDensity
        ),
        flowers: Math.floor(
          completedCount * personalityInfluence.elementDensity
        ),
        fruits: Math.floor(
          timeCapsulesCount * personalityInfluence.elementDensity
        ),
      };

      const progressData: GardenProgressData = {
        overallProgress: Math.round(overallProgress),
        documentsCount,
        guardiansCount,
        completedMilestones: completedCount,
        totalMilestones: milestones.length,
        activeMilestones,
        timeCapsules: timeCapsulesCount,
        willProgress: Math.round(willProgress),
        seedState: getSeedState(overallProgress),
        personalityMode: effectiveMode,
        personalityInfluence,
        gardenElements,
        adaptiveRecommendations: getAdaptiveRecommendations(),
      };

      setProgress(progressData);
      setError(null);
    } catch (err) {
      console.error('Error calculating garden progress:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to calculate progress'
      );
    } finally {
      setLoading(false);
    }
  }, [userId, personalityManager, createSupabaseClient]);

  // Helper function to check if milestone is active
  const checkMilestoneActive = (
    milestone: SerenityMilestone,
    data: {
      documents: Record<string, any>[];
      guardians: Record<string, any>[];
      timeCapsules: Record<string, any>[];
      wills: Record<string, any>[];
    }
  ): boolean => {
    switch (milestone.id) {
      case 'foundation_stone':
        return data.documents.length >= 1;
      case 'trust_circle':
        return data.guardians.length >= 1;
      case 'digital_legacy':
        return data.timeCapsules.length >= 1;
      case 'will_creation':
        return (
          data.wills.length >= 1 &&
          (((data.wills[0] as Record<string, any>)
            .completion_percentage as number) || 0) >= 0.8
        );
      case 'guardian_network':
        return data.guardians.length >= 3;
      case 'document_vault':
        return data.documents.length >= 5;
      case 'time_capsule_collection':
        return data.timeCapsules.length >= 3;
      case 'family_shield':
        return data.guardians.some(
          (g: Record<string, any>) => g.can_trigger_emergency
        );
      default:
        return false;
    }
  };

  // Refresh progress when user data changes
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  // Listen for document/guardian updates
  useEffect(() => {
    const handleDataUpdate = () => {
      calculateProgress();
    };

    window.addEventListener('documentUploaded', handleDataUpdate);
    window.addEventListener('guardianAdded', handleDataUpdate);
    window.addEventListener('milestoneUnlocked', handleDataUpdate);
    window.addEventListener('willUpdated', handleDataUpdate);
    window.addEventListener('timeCapsuleCreated', handleDataUpdate);

    return () => {
      window.removeEventListener('documentUploaded', handleDataUpdate);
      window.removeEventListener('guardianAdded', handleDataUpdate);
      window.removeEventListener('milestoneUnlocked', handleDataUpdate);
      window.removeEventListener('willUpdated', handleDataUpdate);
      window.removeEventListener('timeCapsuleCreated', handleDataUpdate);
    };
  }, [calculateProgress]);

  return {
    progress,
    loading,
    error,
    refresh: calculateProgress,
  };
};

export default useGardenProgress;
