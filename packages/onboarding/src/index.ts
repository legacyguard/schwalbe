import { QuestionnaireResponse, Plan, Persona, Milestone, OnboardingProgress } from './types';
import { ONBOARDING_FLOW, generatePersona, generateMilestones, generatePlan } from './utils/questionnaire';

export { ONBOARDING_FLOW, generatePlan };

export function calculateProgress(responses: QuestionnaireResponse): OnboardingProgress {
  const answeredQuestions = responses.answers.length;
  const totalQuestions = ONBOARDING_FLOW.steps.reduce((sum, step) => sum + step.questions.length, 0);

  return {
    currentStep: Math.min(ONBOARDING_FLOW.steps.length, Math.ceil((answeredQuestions / totalQuestions) * ONBOARDING_FLOW.steps.length)),
    totalSteps: ONBOARDING_FLOW.steps.length,
    completedSteps: [], // This would be tracked separately in a real app
    responses,
    persona: answeredQuestions > 0 ? generatePersona(responses) : undefined
  };
}

export function validateQuestionnaireResponse(responses: QuestionnaireResponse): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!responses.sessionId) {
    errors.push('Session ID is required');
  }

  if (!responses.completedAt) {
    errors.push('Completion timestamp is required');
  }

  if (!responses.answers || responses.answers.length === 0) {
    errors.push('At least one answer is required');
  }

  // Validate each answer
  responses.answers.forEach((answer, index) => {
    if (!answer.questionId) {
      errors.push(`Answer ${index + 1}: Question ID is required`);
    }

    // Find the question to validate against
    const question = ONBOARDING_FLOW.steps
      .flatMap(step => step.questions)
      .find(q => q.id === answer.questionId);

    if (!question) {
      errors.push(`Answer ${index + 1}: Invalid question ID`);
      return;
    }

    if (question.required && (answer.answer === null || answer.answer === undefined || answer.answer === '')) {
      errors.push(`Question "${question.question}" is required`);
    }

    // Type-specific validation
    if (question.type === 'scale' && typeof answer.answer === 'number') {
      const { min, max } = question.validation || {};
      if (min !== undefined && answer.answer < min) {
        errors.push(`Answer for "${question.question}" must be at least ${min}`);
      }
      if (max !== undefined && answer.answer > max) {
        errors.push(`Answer for "${question.question}" must be at most ${max}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Re-export components for convenience
export { OnboardingQuestionnaire, OnboardingPlan, UserStateDetection, AdaptiveOnboardingFlow } from './components';

// Re-export types for convenience
export type { QuestionnaireResponse, Plan, Persona, Milestone, OnboardingProgress };
