import React, { useState, useCallback } from 'react';
import type { QuestionnaireResponse, OnboardingProgress } from '../types';
import { ONBOARDING_FLOW } from '../utils/questionnaire';

interface OnboardingQuestionnaireProps {
  onComplete: (responses: QuestionnaireResponse) => void;
  onCancel?: () => void;
  initialResponses?: Partial<QuestionnaireResponse>;
  t?: (key: string, defaultValue?: string) => string;
}

export function OnboardingQuestionnaire({
  onComplete,
  onCancel,
  initialResponses,
  t = (key, defaultValue) => defaultValue || key
}: OnboardingQuestionnaireProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse>({
    answers: initialResponses?.answers || [],
    completedAt: '',
    sessionId: initialResponses?.sessionId || `session_${Date.now()}`
  });

  const currentStep = ONBOARDING_FLOW.steps[currentStepIndex];
  const progress: OnboardingProgress = {
    currentStep: currentStepIndex + 1,
    totalSteps: ONBOARDING_FLOW.steps.length,
    completedSteps: Array.from({ length: currentStepIndex }, (_, i) => i),
    responses
  };

  const handleAnswer = useCallback((questionId: string, answer: string | string[] | number) => {
    setResponses(prev => ({
      ...prev,
      answers: prev.answers.filter(a => a.questionId !== questionId).concat({
        questionId,
        answer,
        metadata: { timestamp: new Date().toISOString() }
      })
    }));
  }, []);

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_FLOW.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete the questionnaire
      const completedResponses: QuestionnaireResponse = {
        ...responses,
        completedAt: new Date().toISOString()
      };
      onComplete(completedResponses);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const canProceed = () => {
    const currentAnswers = responses.answers.filter(a =>
      currentStep.questions.some(q => q.id === a.questionId)
    );
    return currentStep.questions.every(question => {
      if (!question.required) return true;
      const answer = currentAnswers.find(a => a.questionId === question.id);
      return answer && answer.answer !== null && answer.answer !== undefined && answer.answer !== '';
    });
  };

  const getCurrentAnswer = (questionId: string) => {
    return responses.answers.find(a => a.questionId === questionId)?.answer;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('onboarding.title', 'Legacy Planning Questionnaire')}
          </h1>
          <span className="text-sm text-gray-500">
            {progress.currentStep} of {progress.totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.currentStep / progress.totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {currentStep.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {currentStep.description}
        </p>

        {/* Questions */}
        <div className="space-y-6">
          {currentStep.questions.map(question => (
            <div key={question.id} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {question.type === 'single-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={getCurrentAnswer(question.id) === option.value}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map(option => {
                    const currentAnswer = getCurrentAnswer(question.id) as string[] || [];
                    return (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={currentAnswer.includes(option.value)}
                          onChange={(e) => {
                            const newAnswer = e.target.checked
                              ? [...currentAnswer, option.value]
                              : currentAnswer.filter(v => v !== option.value);
                            handleAnswer(question.id, newAnswer);
                          }}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  value={getCurrentAnswer(question.id) || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={question.description}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {t('common.cancel', 'Cancel')}
        </button>

        <div className="flex space-x-3">
          {currentStepIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('common.previous', 'Previous')}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {currentStepIndex === ONBOARDING_FLOW.steps.length - 1
              ? t('onboarding.complete', 'Complete')
              : t('common.next', 'Next')
            }
          </button>
        </div>
      </div>
    </div>
  );
}