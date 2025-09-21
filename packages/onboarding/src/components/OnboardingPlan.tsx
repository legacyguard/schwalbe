import React from 'react';
import { Plan } from '../types';

interface OnboardingPlanProps {
  plan: Plan;
  onStart: () => void;
  onRestart: () => void;
  t?: (key: string, defaultValue?: string) => string;
}

export function OnboardingPlan({ plan, onStart, onRestart, t = (key, defaultValue) => defaultValue || key }: OnboardingPlanProps) {
  const { persona, milestones, nextBestAction, completionPercentage } = plan;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('plan.title', 'Your Personalized Legacy Plan')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('plan.subtitle', 'Based on your responses, here\'s your customized plan')}
        </p>
      </div>

      {/* Persona Summary */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          {t('plan.persona.title', 'Your Profile')}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">{persona.name}</h3>
            <p className="text-blue-700 text-sm mb-3">{persona.description}</p>
            <div className="space-y-1 text-sm">
              <div><strong>{t('plan.persona.familyStatus', 'Family Status')}:</strong> {persona.familyStatus}</div>
              <div><strong>{t('plan.persona.riskTolerance', 'Risk Tolerance')}:</strong> {persona.riskTolerance}</div>
              <div><strong>{t('plan.persona.experience', 'Experience Level')}:</strong> {persona.digitalLiteracy}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              {t('plan.persona.priorities', 'Key Priorities')}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {persona.priorities.map((priority, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {priority}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('plan.progress.title', 'Your Progress')}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-lg font-semibold text-gray-700">
            {completionPercentage}%
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {t('plan.progress.description', 'Complete these steps to protect your legacy')}
        </p>
      </div>

      {/* Next Best Action */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-yellow-900 mb-4">
          {t('plan.nextAction.title', 'Recommended Next Step')}
        </h2>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              {nextBestAction.title}
            </h3>
            <p className="text-yellow-800 mb-3">
              {nextBestAction.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-yellow-700">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                nextBestAction.priority === 'high' ? 'bg-red-100 text-red-800' :
                nextBestAction.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {nextBestAction.priority.toUpperCase()} PRIORITY
              </span>
              <span>⏱️ {nextBestAction.estimatedMinutes} min</span>
              <span>📁 {nextBestAction.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Milestones */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('plan.milestones.title', 'Your Complete Plan')}
        </h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`border rounded-lg p-4 transition-all ${
                milestone.completed
                  ? 'bg-green-50 border-green-200'
                  : milestone.id === nextBestAction.id
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  milestone.completed
                    ? 'bg-green-500 text-white'
                    : milestone.id === nextBestAction.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {milestone.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 ${
                    milestone.completed ? 'text-green-900' :
                    milestone.id === nextBestAction.id ? 'text-yellow-900' :
                    'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    milestone.completed ? 'text-green-700' :
                    milestone.id === nextBestAction.id ? 'text-yellow-800' :
                    'text-gray-600'
                  }`}>
                    {milestone.description}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      milestone.priority === 'high' ? 'bg-red-100 text-red-700' :
                      milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {milestone.priority}
                    </span>
                    <span>⏱️ {milestone.estimatedMinutes} min</span>
                    <span>📁 {milestone.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestart}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('plan.actions.restart', 'Retake Questionnaire')}
        </button>
        <button
          onClick={onStart}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('plan.actions.start', 'Start My Plan')}
        </button>
      </div>
    </div>
  );
}