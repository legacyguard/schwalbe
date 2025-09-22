import React, { useState, useEffect, useCallback } from 'react';
import { QuestionnaireResponse, OnboardingProgress, Plan } from '../types';
import { UserStateDetection } from './UserStateDetection';
import { OnboardingQuestionnaire } from './OnboardingQuestionnaire';
import { generatePlan } from '../index';
import { OnboardingService } from '@schwalbe/shared';

interface UserState {
  lifeSituation: 'single' | 'married' | 'parent' | 'retired' | '';
  confidenceLevel: 1 | 2 | 3 | 4 | 5 | null;
  goalType: 'immediate' | 'comprehensive' | '';
  pace: 'fast' | 'moderate' | 'slow' | '';
  communicationStyle: 'guided' | 'self-directed' | 'collaborative' | '';
}

interface OnboardingState {
  phase: 'user-state' | 'questionnaire' | 'scene-1' | 'scene-2' | 'scene-3' | 'scene-4' | 'completed';
  userState?: UserState;
  questionnaireResponses?: QuestionnaireResponse;
  plan?: Plan;
  canResume: boolean;
  hasSkipped: boolean;
  startedAt: string;
  lastActivityAt: string;
}

interface AdaptiveOnboardingFlowProps {
  onComplete: (plan: Plan, userState: UserState) => void;
  onSceneTransition?: (fromScene: string, toScene: string) => void;
  allowSkip?: boolean;
  autoSave?: boolean;
  t?: (key: string, defaultValue?: string) => string;
}

const SCENE_COMPONENTS = {
  'scene-1': 'SofiaIntroductionScene',
  'scene-2': 'TrustBoxScene',
  'scene-3': 'KeyGravingScene',
  'scene-4': 'JourneyPathScene'
};

export function AdaptiveOnboardingFlow({
  onComplete,
  onSceneTransition,
  allowSkip = true,
  autoSave = true,
  t = (key, defaultValue) => defaultValue || key
}: AdaptiveOnboardingFlowProps) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    phase: 'user-state',
    canResume: false,
    hasSkipped: false,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString()
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load existing progress on mount
  useEffect(() => {
    loadExistingProgress();
  }, []);

  // Auto-save progress when state changes
  useEffect(() => {
    if (autoSave && !isLoading) {
      saveProgress();
    }
  }, [onboardingState, autoSave, isLoading]);

  const loadExistingProgress = async () => {
    try {
      // Try to load from remote first
      const remoteProgress = await OnboardingService.fetchProgressRemote();
      if (remoteProgress) {
        // Convert remote progress to our state
        const state: Partial<OnboardingState> = {
          canResume: true
        };

        // Try to restore phase based on completed steps
        if (remoteProgress.completedSteps && remoteProgress.completedSteps > 0) {
          if (remoteProgress.completedSteps >= 4) {
            state.phase = 'completed';
          } else {
            state.phase = `scene-${remoteProgress.completedSteps + 1}` as OnboardingState['phase'];
          }
        }

        setOnboardingState(prev => ({ ...prev, ...state }));
      }

      // Load local progress as fallback
      const localProgress = OnboardingService.getProgress();
      if (localProgress.completedSteps > 0) {
        setOnboardingState(prev => ({
          ...prev,
          canResume: true,
          phase: localProgress.completedSteps >= 4 ? 'completed' : 'user-state'
        }));
      }
    } catch (error) {
      console.warn('Failed to load onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = useCallback(async () => {
    const progressData = {
      completedSteps: getCompletedStepsCount(),
      boxItems: onboardingState.userState?.lifeSituation || '',
      trustedName: '', // This would come from scenes
      familyContext: onboardingState.userState,
      totalTimeSpent: Math.floor((new Date().getTime() - new Date(onboardingState.startedAt).getTime()) / 1000 / 60)
    };

    OnboardingService.saveProgress(progressData);

    if (autoSave) {
      await OnboardingService.saveProgressRemote(progressData);
    }
  }, [onboardingState, autoSave]);

  const getCompletedStepsCount = () => {
    switch (onboardingState.phase) {
      case 'user-state':
      case 'questionnaire':
        return 0;
      case 'scene-1':
        return 1;
      case 'scene-2':
        return 2;
      case 'scene-3':
        return 3;
      case 'scene-4':
        return 4;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const handleUserStateComplete = (userState: UserState, responses: QuestionnaireResponse) => {
    setOnboardingState(prev => ({
      ...prev,
      userState,
      questionnaireResponses: responses,
      phase: determineNextPhase(userState),
      lastActivityAt: new Date().toISOString()
    }));
  };

  const determineNextPhase = (userState: UserState): OnboardingState['phase'] => {
    // Adaptive branching based on user preferences and confidence

    // If user prefers fast pace and high confidence, skip detailed questionnaire
    if (userState.pace === 'fast' && userState.confidenceLevel && userState.confidenceLevel >= 4) {
      return 'scene-1';
    }

    // If user is a beginner or prefers guided approach, go through questionnaire
    if (userState.confidenceLevel && userState.confidenceLevel <= 2 || userState.communicationStyle === 'guided') {
      return 'questionnaire';
    }

    // Default: proceed to questionnaire for most users
    return 'questionnaire';
  };

  const handleQuestionnaireComplete = (responses: QuestionnaireResponse) => {
    const plan = generatePlan(responses);

    setOnboardingState(prev => ({
      ...prev,
      questionnaireResponses: responses,
      plan,
      phase: 'scene-1',
      lastActivityAt: new Date().toISOString()
    }));
  };

  const handleSceneComplete = (sceneId: string, sceneData?: any) => {
    const currentSceneNumber = parseInt(sceneId.split('-')[1]);
    const nextPhase = currentSceneNumber < 4 ? `scene-${currentSceneNumber + 1}` as OnboardingState['phase'] : 'completed';

    // Trigger scene transition callback
    if (onSceneTransition && nextPhase.startsWith('scene-')) {
      onSceneTransition(sceneId, nextPhase);
    }

    setOnboardingState(prev => ({
      ...prev,
      phase: nextPhase,
      lastActivityAt: new Date().toISOString()
    }));

    // Track step completion
    OnboardingService.trackStepCompletion(
      sceneId,
      Math.floor((new Date().getTime() - new Date(onboardingState.lastActivityAt).getTime()) / 1000 / 60)
    );

    // If all scenes completed, trigger completion
    if (nextPhase === 'completed') {
      handleOnboardingComplete();
    }
  };

  const handleOnboardingComplete = () => {
    if (onboardingState.plan && onboardingState.userState) {
      // Mark as completed
      OnboardingService.markCompleted(
        Math.floor((new Date().getTime() - new Date(onboardingState.startedAt).getTime()) / 1000 / 60)
      );

      onComplete(onboardingState.plan, onboardingState.userState);
    }
  };

  const handleSkip = () => {
    if (!allowSkip) return;

    setOnboardingState(prev => ({
      ...prev,
      hasSkipped: true,
      phase: 'scene-1', // Skip to first scene
      lastActivityAt: new Date().toISOString()
    }));
  };

  const handleResume = () => {
    // Logic to resume from where user left off
    setOnboardingState(prev => ({
      ...prev,
      canResume: false,
      lastActivityAt: new Date().toISOString()
    }));
  };

  const handleRestart = () => {
    OnboardingService.clearProgress();
    setOnboardingState({
      phase: 'user-state',
      canResume: false,
      hasSkipped: false,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('onboarding.loading', 'Načítavam...')}</p>
        </div>
      </div>
    );
  }

  // Resume dialog
  if (onboardingState.canResume) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('onboarding.resume.title', 'Pokračovať v procese?')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('onboarding.resume.description', 'Našli sme váš rozpracovaný profil. Chcete pokračovať tam, kde ste skončili?')}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={handleResume}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('onboarding.resume.continue', 'Pokračovať')}
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('onboarding.resume.restart', 'Začať odznova')}
          </button>
        </div>
      </div>
    );
  }

  // Render current phase
  switch (onboardingState.phase) {
    case 'user-state':
      return (
        <UserStateDetection
          onComplete={handleUserStateComplete}
          onSkip={allowSkip ? handleSkip : undefined}
          initialState={onboardingState.userState}
          t={t}
        />
      );

    case 'questionnaire':
      return (
        <OnboardingQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onCancel={allowSkip ? handleSkip : undefined}
          initialResponses={onboardingState.questionnaireResponses}
          t={t}
        />
      );

    case 'scene-1':
    case 'scene-2':
    case 'scene-3':
    case 'scene-4':
      // Dynamic scene loading would be implemented here
      // For now, return a placeholder that shows progress
      return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t(`scene.${onboardingState.phase}.title`, `Scéna ${onboardingState.phase.split('-')[1]}`)}
            </h2>
            <p className="text-gray-600 mb-6">
              {t(`scene.${onboardingState.phase}.description`, 'Scéna sa načítava...')}
            </p>

            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4].map(sceneNum => (
                  <div
                    key={sceneNum}
                    className={`w-3 h-3 rounded-full ${
                      sceneNum <= parseInt(onboardingState.phase.split('-')[1])
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Scéna {onboardingState.phase.split('-')[1]} z 4
              </p>
            </div>

            <button
              onClick={() => handleSceneComplete(onboardingState.phase)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('scene.continue', 'Pokračovať')}
            </button>
          </div>
        </div>
      );

    case 'completed':
      return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('onboarding.completed.title', 'Vitajte v LegacyGuard!')}
            </h2>
            <p className="text-gray-600">
              {t('onboarding.completed.description', 'Váš profil je pripravený. Sofia vás teraz povedie pri vytváraní vášho odkazu.')}
            </p>
          </div>

          {onboardingState.plan && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Váš personalizovaný plán:</h3>
              <p className="text-sm text-gray-600">{onboardingState.plan.persona.description}</p>
              <p className="text-sm text-blue-600 mt-2">
                {onboardingState.plan.milestones.length} krokov na dokončenie
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}