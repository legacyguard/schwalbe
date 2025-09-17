
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { EnhancedCountrySelector } from './EnhancedCountrySelector';
import { type WillType, WillTypeSelector } from './WillTypeSelector';
import { type WillData, WillWizard } from './WillWizard';
import { IntelligentWillDraftGenerator } from './IntelligentWillDraftGenerator';
import { showMilestoneRecognition } from '@/components/dashboard/milestoneUtils';
import { SERENITY_MILESTONES } from '@/lib/path-of-serenity';
import { FocusModeProvider } from '@/contexts/FocusModeContext';

interface EnhancedWillWizardProps {
  onClose: () => void;
  onComplete: (willData: WillData & { willType: WillType }) => void;
}

type WizardStep = 'country' | 'draft_choice' | 'will_type' | 'wizard';

export const EnhancedWillWizard: React.FC<EnhancedWillWizardProps> = ({
  onClose,
  onComplete,
}) => {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('country');
  const [selectedWillType, setSelectedWillType] = useState<null | WillType>(
    null
  );
  const [draftData, setDraftData] = useState<null | WillData>(null);

  const handleSelectionConfirmed = () => {
    setCurrentStep('will_type');
  };

  const handleWillTypeSelected = (type: WillType) => {
    setSelectedWillType(type);
    setCurrentStep('draft_choice');
  };

  const handleDraftAccepted = (intelligentDraftData: WillData) => {
    setDraftData(intelligentDraftData);
    setCurrentStep('wizard');
  };

  const handleStartFromScratch = () => {
    setDraftData(null);
    setCurrentStep('wizard');
  };

  const handleBackToCountry = () => {
    setCurrentStep('country');
  };

  // const __handleBackToWillType = () => { // Unused
  // setCurrentStep('will_type');
  // }; // Unused

  const handleBackToDraftChoice = () => {
    setCurrentStep('draft_choice');
  };

  const handleWillComplete = (willData: WillData) => {
    // Add the will type to the data
    const enhancedWillData = {
      ...willData,
      willType: selectedWillType!,
    };

    // Trigger milestone recognition for Legacy Foundation
    setTimeout(() => {
      const legacyMilestone = SERENITY_MILESTONES.find(
        m => m.id === 'legacy_foundation'
      );
      if (legacyMilestone) {
        showMilestoneRecognition(
          {
            ...legacyMilestone,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          },
          userId || undefined
        );
      }
    }, 1500); // Delay to show after success message

    onComplete(enhancedWillData);
  };

  return (
    <FocusModeProvider>
      {(() => {
        switch (currentStep) {
          case 'country':
            return (
              <EnhancedCountrySelector onSelectionConfirmed={handleSelectionConfirmed} />
            );

          case 'will_type':
            return (
              <WillTypeSelector
                onWillTypeSelected={handleWillTypeSelected}
                onBack={handleBackToCountry}
              />
            );

          case 'draft_choice':
            return (
              <IntelligentWillDraftGenerator
                onDraftAccepted={handleDraftAccepted}
                onStartFromScratch={handleStartFromScratch}
                willType={selectedWillType!}
              />
            );

          case 'wizard':
            return (
              <WillWizard
                onClose={onClose}
                onComplete={handleWillComplete}
                onBack={handleBackToDraftChoice}
                willType={selectedWillType!}
                initialData={draftData}
              />
            );

          default:
            return null;
        }
      })()}
    </FocusModeProvider>
  );
};
