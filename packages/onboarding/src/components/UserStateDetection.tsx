import React, { useState, useCallback } from 'react';
import { QuestionnaireResponse } from '../types';
import type { QuestionnaireAnswer } from '../types';

interface UserState {
  lifeSituation: 'single' | 'married' | 'parent' | 'retired' | '';
  confidenceLevel: 1 | 2 | 3 | 4 | 5 | null;
  goalType: 'immediate' | 'comprehensive' | '';
  pace: 'fast' | 'moderate' | 'slow' | '';
  communicationStyle: 'guided' | 'self-directed' | 'collaborative' | '';
}

interface UserStateDetectionProps {
  onComplete: (userState: UserState, responses: QuestionnaireResponse) => void;
  onSkip?: () => void;
  initialState?: Partial<UserState>;
  t?: (key: string, defaultValue?: string) => string;
}

const USER_STATE_QUESTIONS = [
  {
    id: 'life_situation',
    type: 'single-choice' as const,
    category: 'lifestyle',
    question: 'Aká je vaša súčasná životná situácia?',
    description: 'Pomôže nám to prispôsobiť odporúčania pre vaše potreby',
    required: true,
    options: [
      {
        value: 'single',
        label: 'Slobodný/á, bez detí',
        description: 'Živím sa sám/sama, nemám závislé osoby'
      },
      {
        value: 'married',
        label: 'Ženatý/vydatá, bez detí',
        description: 'Žijem s partnerom/partnerkou'
      },
      {
        value: 'parent',
        label: 'Rodič s deťmi',
        description: 'Mám deti, ktoré sú na mne závislé'
      },
      {
        value: 'retired',
        label: 'Dôchodca',
        description: 'Som v dôchodku a plánujem pre rodinu'
      }
    ]
  },
  {
    id: 'confidence_level',
    type: 'scale' as const,
    category: 'experience',
    question: 'Ako dobre sa orientujete v právnych a finančných záležitostiach?',
    description: 'Pomôže nám prispôsobiť jazyk a tempo vysvetlení',
    required: true,
    validation: { min: 1, max: 5 },
    scaleLabels: {
      1: 'Úplný začiatočník',
      2: 'Základné znalosti',
      3: 'Priemerné znalosti',
      4: 'Pokročilé znalosti',
      5: 'Expert'
    }
  },
  {
    id: 'goal_type',
    type: 'single-choice' as const,
    category: 'objectives',
    question: 'Čo je vaším hlavným cieľom?',
    description: 'Pomôže nám navrhnúť správny plán pre vás',
    required: true,
    options: [
      {
        value: 'immediate',
        label: 'Okamžitá ochrana',
        description: 'Chcem mať základné veci vyriešené čo najskôr'
      },
      {
        value: 'comprehensive',
        label: 'Komplexný plán',
        description: 'Chcem vytvoriť podrobný a kompletný plán'
      }
    ]
  },
  {
    id: 'pace_preference',
    type: 'single-choice' as const,
    category: 'preferences',
    question: 'Akým tempom by ste chceli postupovať?',
    description: 'Prispôsobíme proces vašim preferenciám',
    required: true,
    options: [
      {
        value: 'fast',
        label: 'Rýchlo a efektívne',
        description: 'Chcem dokončiť všetko čo najskôr'
      },
      {
        value: 'moderate',
        label: 'Postupne krok za krokom',
        description: 'Chcem si všetko dobre premyslieť'
      },
      {
        value: 'slow',
        label: 'Pomaly a dôkladne',
        description: 'Potrebujem čas na rozmyslenie'
      }
    ]
  },
  {
    id: 'communication_style',
    type: 'single-choice' as const,
    category: 'preferences',
    question: 'Aký štýl komunikácie vám vyhovuje?',
    description: 'Sofia sa prispôsobí vašému štýlu',
    required: true,
    options: [
      {
        value: 'guided',
        label: 'Vedený rozhovor',
        description: 'Sofia ma bude viesť krok za krokom'
      },
      {
        value: 'self-directed',
        label: 'Samostatný prístup',
        description: 'Chcem si vybrať, čo budem robiť'
      },
      {
        value: 'collaborative',
        label: 'Spolupráca',
        description: 'Chcem diskutovať a hľadať riešenia spoločne'
      }
    ]
  }
];

export function UserStateDetection({
  onComplete,
  onSkip,
  initialState,
  t = (key, defaultValue) => defaultValue || key
}: UserStateDetectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userState, setUserState] = useState<UserState>({
    lifeSituation: initialState?.lifeSituation || '',
    confidenceLevel: initialState?.confidenceLevel || null,
    goalType: initialState?.goalType || '',
    pace: initialState?.pace || '',
    communicationStyle: initialState?.communicationStyle || ''
  });
  const [responses, setResponses] = useState<QuestionnaireAnswer[]>([]);

  const currentQuestion = USER_STATE_QUESTIONS[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / USER_STATE_QUESTIONS.length) * 100);

  const handleAnswer = useCallback((questionId: string, answer: string | string[] | number) => {
    // Update user state
    const stateUpdate: Partial<UserState> = {};
    switch (questionId) {
      case 'life_situation':
        stateUpdate.lifeSituation = answer as UserState['lifeSituation'];
        break;
      case 'confidence_level':
        stateUpdate.confidenceLevel = answer as UserState['confidenceLevel'];
        break;
      case 'goal_type':
        stateUpdate.goalType = answer as UserState['goalType'];
        break;
      case 'pace_preference':
        stateUpdate.pace = answer as UserState['pace'];
        break;
      case 'communication_style':
        stateUpdate.communicationStyle = answer as UserState['communicationStyle'];
        break;
    }

    setUserState(prev => ({ ...prev, ...stateUpdate }));

    // Update responses
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, {
        questionId,
        answer,
        metadata: {
          timestamp: new Date().toISOString(),
          category: currentQuestion.category
        }
      }];
    });
  }, [currentQuestion]);

  const handleNext = () => {
    if (currentQuestionIndex < USER_STATE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the user state detection
      const questionnaireResponse: QuestionnaireResponse = {
        answers: responses,
        completedAt: new Date().toISOString(),
        sessionId: `user_state_${Date.now()}`
      };
      onComplete(userState, questionnaireResponse);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getCurrentAnswer = () => {
    const answer = responses.find(r => r.questionId === currentQuestion.id);
    return answer?.answer;
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = getCurrentAnswer();
    return answer !== null && answer !== undefined && answer !== '';
  };

  const getConfidenceDescription = (level: number) => {
    const descriptions = {
      1: 'Potrebujem jednoduché vysvetlenia a kroky',
      2: 'Oceňujem jasné inštrukcie s príkladmi',
      3: 'Rozumiem základom, ale potrebujem sprevádzanie',
      4: 'Rozumiem komplexnejším konceptom',
      5: 'Môžem pracovať samostatne s technickými detailmi'
    };
    return descriptions[level as keyof typeof descriptions];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('userState.title', 'Spoznajme sa bližšie')}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} z {USER_STATE_QUESTIONS.length}
            </span>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t('common.skip', 'Preskočiť')}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {t('userState.subtitle', 'Pomôžte Sofii lepšie pochopiť vaše potreby')}
        </p>
      </div>

      {/* Current Question */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">
                {currentQuestionIndex + 1}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentQuestion.question}
            </h2>
          </div>
          <p className="text-gray-600 ml-11">
            {currentQuestion.description}
          </p>
        </div>

        {/* Question Content */}
        <div className="ml-11">
          {currentQuestion.type === 'single-choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map(option => (
                <label
                  key={option.value}
                  className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={getCurrentAnswer() === option.value}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'scale' && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => handleAnswer(currentQuestion.id, level)}
                    className={`p-3 text-center rounded-lg border transition-all ${
                      getCurrentAnswer() === level
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold">{level}</div>
                    <div className="text-xs mt-1">
                      {currentQuestion.scaleLabels?.[level as keyof typeof currentQuestion.scaleLabels]}
                    </div>
                  </button>
                ))}
              </div>
              {getCurrentAnswer() && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {getConfidenceDescription(getCurrentAnswer() as number)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.previous', 'Späť')}
        </button>

        <div className="flex items-center space-x-3">
          {currentQuestionIndex === USER_STATE_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('userState.complete', 'Dokončiť')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.next', 'Ďalej')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}