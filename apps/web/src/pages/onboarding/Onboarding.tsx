import React from 'react';
import type { Plan } from '@schwalbe/onboarding';
import { OnboardingService } from '@schwalbe/shared';
import Questionnaire from './Questionnaire';
import IDScan from './IDScan';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface OnboardingProps {
  onComplete?: () => void;
}

type Step = 'intro' | 'questionnaire' | 'id-scan' | 'complete';

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = React.useState<Step>('intro');
  const [questionnairePlan, setQuestionnairePlan] = React.useState<Plan | null>(null);
  const startedAtRef = React.useRef(Date.now());

  const finish = React.useCallback(() => {
    const elapsed = Math.max(0, Date.now() - startedAtRef.current);
    OnboardingService.markCompleted(elapsed);
    setStep('complete');
    onComplete?.();
  }, [onComplete]);

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <Card className="w-full max-w-2xl border border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to LegacyGuard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-200">
            <p>
              We will walk through a brief questionnaire to tailor your estate plan, optionally scan your ID to pre-fill details, and highlight the next steps to protect your loved ones.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button onClick={() => setStep('questionnaire')}>Begin onboarding</Button>
              <Button variant="outline" onClick={finish}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'questionnaire') {
    return (
      <Questionnaire
        onCancel={() => setStep('intro')}
        onComplete={(plan) => {
          setQuestionnairePlan(plan);
          OnboardingService.saveProgress({ familyContext: plan });
          void OnboardingService.saveProgressRemote({ familyContext: plan });
          setStep('id-scan');
        }}
      />
    );
  }

  if (step === 'id-scan') {
    return (
      <IDScan
        onBack={() => setStep('questionnaire')}
        onNext={finish}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <Card className="w-full max-w-xl border border-slate-800 bg-slate-900/70 text-center">
        <CardHeader>
          <CardTitle className="text-2xl">You're all set</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-200">
            Your onboarding summary has been saved. Continue to the dashboard to review tasks and share information with trusted contacts.
          </p>
          <div className="flex flex-col items-center gap-3">
            {questionnairePlan ? (
              <div className="text-sm text-slate-300">
                Next milestone: <span className="font-medium text-slate-100">{questionnairePlan.nextBestAction?.title ?? 'Review plan'}</span>
              </div>
            ) : null}
            <Button asChild>
              <a href="/dashboard">Go to dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
