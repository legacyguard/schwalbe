
import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import Scene1Promise from './Scene1Promise';
import Scene2Box from './Scene2Box';
import Scene3Key from './Scene3Key';
import Scene4Prepare from './Scene4Prepare';

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  usePageTitle('Welcome Journey');
  const [step, setStep] = useState(1);
  const [boxItems, setBoxItems] = useState('');
  const [trustedName, setTrustedName] = useState('');

  const goBack = () => setStep(s => Math.max(1, s - 1));
  const goNext = () => setStep(s => Math.min(4, s + 1));

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