
import { useState } from 'react';
import Scene1Promise from './Scene1Promise';
import Scene2Box from './Scene2Box';
import Scene3Key from './Scene3Key';
import Scene4Prepare from './Scene4Prepare';
import Questionnaire from './Questionnaire';
import IDScan from './IDScan';

import { usePageTitle } from '@/hooks/usePageTitle';
import AIProcessingAnimation from '@/components/onboarding/AIProcessingAnimation';
import { OnboardingService } from '@schwalbe/shared';

interface OnboardingProps {
  onComplete?: () => void;
  resumeStep?: number;
}

export default function Onboarding({ onComplete, resumeStep }: OnboardingProps) {
  usePageTitle('Welcome Journey');
  const [step, setStep] = useState(resumeStep && resumeStep >= 1 && resumeStep <= 6 ? resumeStep : 1);
  const [boxItems, setBoxItems] = useState('');
  const [trustedName, setTrustedName] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingContext, setProcessingContext] = useState<'box-to-key' | 'key-to-prepare'>('box-to-key');
  const [startedAt] = useState(Date.now());

  const goBack = () => setStep(s => Math.max(1, s - 1));

  const goNext = () => {
    const currentStep = step;

    // Track completion of current step
    const stepName = currentStep === 1 ? 'promise' : currentStep === 2 ? 'box' : currentStep === 3 ? 'questionnaire' : currentStep === 4 ? 'id_scan' : currentStep === 5 ? 'trusted_key' : 'prepare';
    OnboardingService.trackStepCompletion(stepName);

    // Show processing animation between key transitions
    if (currentStep === 2) {
      setProcessingContext('box-to-key');
      setShowProcessing(true);
    } else if (currentStep === 5) {
      setProcessingContext('key-to-prepare');
      setShowProcessing(true);
    } else {
      setStep(s => Math.min(6, s + 1));
    }
  };

  const handleProcessingComplete = () => {
    setShowProcessing(false);
    setStep(s => Math.min(6, s + 1));
  };

  // Show AI processing animation between steps
  if (showProcessing) {
    return (
      <AIProcessingAnimation
        context={processingContext}
        userData={{
          boxItems: step >= 2 ? boxItems : undefined,
          trustedName: step >= 5 ? trustedName : undefined,
        }}
        onComplete={handleProcessingComplete}
        duration={3000}
      />
    );
  }

  if (step === 1) {
    return <Scene1Promise onNext={goNext} onSkip={onComplete} />;
  }
  if (step === 2) {
    return (
      <Scene2Box
        initialItems={boxItems}
        onBack={goBack}
        onNext={items => {
          setBoxItems(items);
          OnboardingService.saveProgress({ boxItems: items });
          void OnboardingService.saveProgressRemote({ boxItems: items });
          setStep(3);
        }}
        onSkip={onComplete}
      />
    );
  }
  if (step === 3) {
    return (
      <Questionnaire
        onComplete={(plan) => {
          OnboardingService.saveProgress({ familyContext: plan });
          void OnboardingService.saveProgressRemote({ familyContext: plan });
          setStep(4);
        }}
        onCancel={goBack}
      />
    );
  }
  if (step === 4) {
    return (
      <IDScan
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
      />
    );
  }
  if (step === 5) {
    return (
      <Scene3Key
        initialTrustedName={trustedName}
        onBack={() => setStep(4)}
        onNext={name => {
          setTrustedName(name);
          OnboardingService.saveProgress({ trustedName: name });
          void OnboardingService.saveProgressRemote({ trustedName: name });
          goNext();
        }}
        onSkip={onComplete}
      />
    );
  }
  return <Scene4Prepare onBack={() => setStep(5)} onComplete={() => {
    const total = Math.max(0, Date.now() - startedAt);
    OnboardingService.markCompleted(total);
    onComplete?.();
  }} />;
}
