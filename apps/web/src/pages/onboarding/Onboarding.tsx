
import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import Scene1Promise from './Scene1Promise';
import Scene2Box from './Scene2Box';
import Scene3Key from './Scene3Key';
import Scene4Prepare from './Scene4Prepare';
import AIProcessingAnimation from '@/components/onboarding/AIProcessingAnimation';

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  usePageTitle('Welcome Journey');
  const [step, setStep] = useState(1);
  const [boxItems, setBoxItems] = useState('');
  const [trustedName, setTrustedName] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingContext, setProcessingContext] = useState<'box-to-key' | 'key-to-prepare'>('box-to-key');

  const goBack = () => setStep(s => Math.max(1, s - 1));

  const goNext = () => {
    const currentStep = step;

    // Show processing animation between steps 2 and 3, and 3 and 4
    if (currentStep === 2) {
      setProcessingContext('box-to-key');
      setShowProcessing(true);
    } else if (currentStep === 3) {
      setProcessingContext('key-to-prepare');
      setShowProcessing(true);
    } else {
      setStep(s => Math.min(4, s + 1));
    }
  };

  const handleProcessingComplete = () => {
    setShowProcessing(false);
    setStep(s => Math.min(4, s + 1));
  };

  // Show AI processing animation between steps
  if (showProcessing) {
    return (
      <AIProcessingAnimation
        context={processingContext}
        userData={{
          boxItems: step >= 2 ? boxItems : undefined,
          trustedName: step >= 3 ? trustedName : undefined,
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
          goNext();
        }}
        onSkip={onComplete}
      />
    );
  }
  if (step === 3) {
    return (
      <Scene3Key
        initialTrustedName={trustedName}
        onBack={goBack}
        onNext={name => {
          setTrustedName(name);
          goNext();
        }}
        onSkip={onComplete}
      />
    );
  }
  return <Scene4Prepare onBack={goBack} onComplete={onComplete} />;
}