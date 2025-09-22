import React, { useState } from 'react';
import * as OnboardingKit from '@schwalbe/onboarding';
import type { Plan, QuestionnaireResponse } from '@schwalbe/onboarding';

const { OnboardingQuestionnaire, OnboardingPlan, generatePlan } = OnboardingKit;
import { useTranslation } from 'react-i18next';

interface QuestionnaireProps {
  onComplete?: (plan: Plan) => void;
  onCancel?: () => void;
}

export default function Questionnaire({ onComplete, onCancel }: QuestionnaireProps) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<Plan | null>(null);

  // Create a simple translation function that matches the expected interface
  const simpleT = (key: string, defaultValue?: string): string => {
    return t(key, defaultValue || key);
  };

  const handleQuestionnaireComplete = (responses: QuestionnaireResponse) => {
    const generatedPlan = generatePlan(responses);
    setPlan(generatedPlan);
  };

  const handlePlanStart = () => {
    if (plan && onComplete) {
      onComplete(plan);
    }
  };

  const handlePlanRestart = () => {
    setPlan(null);
  };

  if (plan) {
    return (
      <OnboardingPlan
        plan={plan}
        onStart={handlePlanStart}
        onRestart={handlePlanRestart}
        t={simpleT}
      />
    );
  }

  return (
    <OnboardingQuestionnaire
      onComplete={handleQuestionnaireComplete}
      onCancel={onCancel}
      t={simpleT}
    />
  );
}
