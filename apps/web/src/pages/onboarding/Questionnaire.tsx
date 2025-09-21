import React, { useState } from 'react';
import { OnboardingQuestionnaire, OnboardingPlan, Plan } from '@schwalbe/onboarding';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

interface QuestionnaireProps {
  onComplete?: (plan: Plan) => void;
  onCancel?: () => void;
}

export default function Questionnaire({ onComplete, onCancel }: QuestionnaireProps) {
  usePageTitle('Onboarding Questionnaire');
  const { t } = useTranslation();
  const [plan, setPlan] = useState<Plan | null>(null);

  const handleQuestionnaireComplete = (generatedPlan: Plan) => {
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
        t={t}
      />
    );
  }

  return (
    <OnboardingQuestionnaire
      onComplete={handleQuestionnaireComplete}
      onCancel={onCancel}
      t={t}
    />
  );
}