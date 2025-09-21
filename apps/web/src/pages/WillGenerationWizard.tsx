import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card, Input, TextArea, Progress, Avatar } from 'tamagui';
import { ChevronLeft, ChevronRight, FileText, Users, Heart, Shield, Sparkles, CheckCircle } from '@tamagui/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

import { SofiaFirefly } from '../components/sofia-firefly/SofiaFirefly';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { isFeatureEnabled } from '../config/flags';
import { useTranslation } from 'react-i18next';

interface WillStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<WillStepProps>;
}

interface WillStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface WillData {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    email: string;
  };
  beneficiaries: Array<{
    id: string;
    name: string;
    relationship: string;
    percentage: number;
    isPrimary: boolean;
  }>;
  executors: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  assets: Array<{
    id: string;
    type: 'real_estate' | 'bank_account' | 'investment' | 'personal_property' | 'digital';
    description: string;
    value: number;
    beneficiaries: string[];
  }>;
  guardians: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email: string;
    children: string[];
  }>;
  specialInstructions: string;
  digitalAssets: {
    socialMedia: string[];
    cryptocurrency: Array<{ platform: string; wallet: string; instructions: string }>;
    onlineAccounts: Array<{ platform: string; username: string; instructions: string }>;
  };
}

// Step Components
const PersonalInfoStep = ({ data, onUpdate, onNext, onPrevious }: WillStepProps) => {
  const { triggerSuccess } = useHapticFeedback();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <YStack space="$6" padding="$4">
        <YStack space="$3">
          <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800" textAlign="center">
            Your Personal Information
          </Text>
          <Text color="$legacyTextMuted" fontSize="$4" textAlign="center">
            Let's start with the basics. This information will be used throughout your will.
          </Text>
        </YStack>

        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius="$4"
        >
          <YStack space="$4">
            <Input
              placeholder="Full Legal Name"
              value={data.personalInfo?.fullName || ''}
              onChangeText={(value) => onUpdate({ ...data, personalInfo: { ...data.personalInfo, fullName: value } })}
              fontSize="$4"
              borderColor="$legacyAccentGold"
            />
            <Input
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={data.personalInfo?.dateOfBirth || ''}
              onChangeText={(value) => onUpdate({ ...data, personalInfo: { ...data.personalInfo, dateOfBirth: value } })}
              fontSize="$4"
              borderColor="$legacyAccentGold"
            />
            <TextArea
              placeholder="Full Address"
              value={data.personalInfo?.address || ''}
              onChangeText={(value) => onUpdate({ ...data, personalInfo: { ...data.personalInfo, address: value } })}
              fontSize="$4"
              borderColor="$legacyAccentGold"
              height={80}
            />
            <XStack space="$2">
              <Input
                flex={1}
                placeholder="Phone Number"
                value={data.personalInfo?.phone || ''}
                onChangeText={(value) => onUpdate({ ...data, personalInfo: { ...data.personalInfo, phone: value } })}
                fontSize="$4"
                borderColor="$legacyAccentGold"
              />
              <Input
                flex={1}
                placeholder="Email Address"
                value={data.personalInfo?.email || ''}
                onChangeText={(value) => onUpdate({ ...data, personalInfo: { ...data.personalInfo, email: value } })}
                fontSize="$4"
                borderColor="$legacyAccentGold"
              />
            </XStack>
          </YStack>
        </Card>

        <XStack space="$3" justifyContent="space-between">
          <Button
            size="$4"
            backgroundColor="transparent"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$3"
            onPress={onPrevious}
          >
            <XStack alignItems="center" space="$2">
              <ChevronLeft size={16} color="$legacyAccentGold" />
              <Text color="$legacyAccentGold" fontSize="$4" fontWeight="600">
                Previous
              </Text>
            </XStack>
          </Button>

          <Button
            size="$4"
            backgroundColor="$legacyAccentGold"
            borderRadius="$3"
            onPress={() => {
              triggerSuccess();
              onNext();
            }}
          >
            <XStack alignItems="center" space="$2">
              <Text color="$legacyBackgroundPrimary" fontSize="$4" fontWeight="600">
                Continue
              </Text>
              <ChevronRight size={16} color="$legacyBackgroundPrimary" />
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </motion.div>
  );
};

const BeneficiariesStep = ({ data, onUpdate, onNext, onPrevious }: WillStepProps) => {
  const { triggerSuccess } = useHapticFeedback();
  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', relationship: '', percentage: 0 });

  const addBeneficiary = () => {
    if (newBeneficiary.name && newBeneficiary.relationship) {
      const updatedBeneficiaries = [...(data.beneficiaries || []), {
        id: Date.now().toString(),
        ...newBeneficiary,
        isPrimary: true
      }];
      onUpdate({ ...data, beneficiaries: updatedBeneficiaries });
      setNewBeneficiary({ name: '', relationship: '', percentage: 0 });
    }
  };

  const removeBeneficiary = (id: string) => {
    const updatedBeneficiaries = (data.beneficiaries || []).filter((b: any) => b.id !== id);
    onUpdate({ ...data, beneficiaries: updatedBeneficiaries });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <YStack space="$6" padding="$4">
        <YStack space="$3">
          <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800" textAlign="center">
            Your Beneficiaries
          </Text>
          <Text color="$legacyTextMuted" fontSize="$4" textAlign="center">
            Who should inherit your assets? Add your loved ones and specify their shares.
          </Text>
        </YStack>

        {/* Add New Beneficiary */}
        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius="$4"
        >
          <YStack space="$3">
            <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
              Add Beneficiary
            </Text>
            <XStack space="$2">
              <Input
                flex={1}
                placeholder="Full Name"
                value={newBeneficiary.name}
                onChangeText={(value) => setNewBeneficiary({ ...newBeneficiary, name: value })}
                fontSize="$4"
                borderColor="$legacyAccentGold"
              />
              <Input
                flex={1}
                placeholder="Relationship"
                value={newBeneficiary.relationship}
                onChangeText={(value) => setNewBeneficiary({ ...newBeneficiary, relationship: value })}
                fontSize="$4"
                borderColor="$legacyAccentGold"
              />
            </XStack>
            <Input
              placeholder="Percentage (e.g., 50)"
              value={newBeneficiary.percentage.toString()}
              onChangeText={(value) => setNewBeneficiary({ ...newBeneficiary, percentage: parseInt(value) || 0 })}
              keyboardType="numeric"
              fontSize="$4"
              borderColor="$legacyAccentGold"
            />
            <Button
              size="$3"
              backgroundColor="$legacyAccentGold"
              borderRadius="$3"
              onPress={addBeneficiary}
            >
              <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                Add Beneficiary
              </Text>
            </Button>
          </YStack>
        </Card>

        {/* Existing Beneficiaries */}
        <YStack space="$3">
          <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
            Current Beneficiaries ({(data.beneficiaries || []).length})
          </Text>
          {(data.beneficiaries || []).map((beneficiary: any) => (
            <Card
              key={beneficiary.id}
              padding="$3"
              backgroundColor="$legacyBackgroundSecondary"
              borderColor="$legacyAccentGold"
              borderWidth={0.5}
              borderRadius="$3"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    {beneficiary.name}
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3">
                    {beneficiary.relationship} • {beneficiary.percentage}%
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  backgroundColor="$legacyWarning"
                  borderRadius="$2"
                  onPress={() => removeBeneficiary(beneficiary.id)}
                >
                  <Text color="white" fontSize="$2">Remove</Text>
                </Button>
              </XStack>
            </Card>
          ))}
        </YStack>

        <XStack space="$3" justifyContent="space-between">
          <Button
            size="$4"
            backgroundColor="transparent"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$3"
            onPress={onPrevious}
          >
            <XStack alignItems="center" space="$2">
              <ChevronLeft size={16} color="$legacyAccentGold" />
              <Text color="$legacyAccentGold" fontSize="$4" fontWeight="600">
                Previous
              </Text>
            </XStack>
          </Button>

          <Button
            size="$4"
            backgroundColor="$legacyAccentGold"
            borderRadius="$3"
            onPress={() => {
              triggerSuccess();
              onNext();
            }}
          >
            <XStack alignItems="center" space="$2">
              <Text color="$legacyBackgroundPrimary" fontSize="$4" fontWeight="600">
                Continue
              </Text>
              <ChevronRight size={16} color="$legacyBackgroundPrimary" />
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </motion.div>
  );
};

const AssetsStep = ({ data, onUpdate, onNext, onPrevious }: WillStepProps) => {
  const { triggerSuccess } = useHapticFeedback();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <YStack space="$6" padding="$4">
        <YStack space="$3">
          <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800" textAlign="center">
            Your Assets & Property
          </Text>
          <Text color="$legacyTextMuted" fontSize="$4" textAlign="center">
            Let's document what you own so we can ensure it's distributed according to your wishes.
          </Text>
        </YStack>

        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius="$4"
        >
          <YStack space="$4">
            <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
              Assets Overview
            </Text>
            <Text color="$legacyTextMuted" fontSize="$3">
              This section will include real estate, bank accounts, investments, personal property, and digital assets.
            </Text>
            <Button
              size="$3"
              backgroundColor="$legacyAccentGold"
              borderRadius="$3"
              onPress={() => {
                // Navigate to detailed asset management
              }}
            >
              <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                Manage Assets
              </Text>
            </Button>
          </YStack>
        </Card>

        <XStack space="$3" justifyContent="space-between">
          <Button
            size="$4"
            backgroundColor="transparent"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$3"
            onPress={onPrevious}
          >
            <XStack alignItems="center" space="$2">
              <ChevronLeft size={16} color="$legacyAccentGold" />
              <Text color="$legacyAccentGold" fontSize="$4" fontWeight="600">
                Previous
              </Text>
            </XStack>
          </Button>

          <Button
            size="$4"
            backgroundColor="$legacyAccentGold"
            borderRadius="$3"
            onPress={() => {
              triggerSuccess();
              onNext();
            }}
          >
            <XStack alignItems="center" space="$2">
              <Text color="$legacyBackgroundPrimary" fontSize="$4" fontWeight="600">
                Continue
              </Text>
              <ChevronRight size={16} color="$legacyBackgroundPrimary" />
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </motion.div>
  );
};

const ReviewStep = ({ data, onUpdate, onNext, onPrevious }: WillStepProps) => {
  const { triggerSuccess } = useHapticFeedback();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <YStack space="$6" padding="$4">
        <YStack space="$3">
          <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800" textAlign="center">
            Review Your Will
          </Text>
          <Text color="$legacyTextMuted" fontSize="$4" textAlign="center">
            Please review all the information carefully before finalizing your will.
          </Text>
        </YStack>

        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius="$4"
        >
          <YStack space="$4">
            <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
              Summary
            </Text>
            <YStack space="$2">
              <Text color="$legacyTextMuted" fontSize="$3">
                • Personal Information: Complete
              </Text>
              <Text color="$legacyTextMuted" fontSize="$3">
                • Beneficiaries: {(data.beneficiaries || []).length} designated
              </Text>
              <Text color="$legacyTextMuted" fontSize="$3">
                • Assets: Documented and assigned
              </Text>
              <Text color="$legacyTextMuted" fontSize="$3">
                • Executors: Ready to serve
              </Text>
            </YStack>
          </YStack>
        </Card>

        <XStack space="$3" justifyContent="space-between">
          <Button
            size="$4"
            backgroundColor="transparent"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$3"
            onPress={onPrevious}
          >
            <XStack alignItems="center" space="$2">
              <ChevronLeft size={16} color="$legacyAccentGold" />
              <Text color="$legacyAccentGold" fontSize="$4" fontWeight="600">
                Previous
              </Text>
            </XStack>
          </Button>

          <Button
            size="$4"
            backgroundColor="$legacySuccess"
            borderRadius="$3"
            onPress={() => {
              triggerSuccess();
              onNext();
            }}
          >
            <XStack alignItems="center" space="$2">
              <CheckCircle size={16} color="white" />
              <Text color="white" fontSize="$4" fontWeight="600">
                Finalize Will
              </Text>
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </motion.div>
  );
};

export default function WillGenerationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [willData, setWillData] = useState<WillData>({
    personalInfo: { fullName: '', dateOfBirth: '', address: '', phone: '', email: '' },
    beneficiaries: [],
    executors: [],
    assets: [],
    guardians: [],
    specialInstructions: '',
    digitalAssets: { socialMedia: [], cryptocurrency: [], onlineAccounts: [] }
  });
  const { triggerEncouragement } = useHapticFeedback();
  const { t } = useTranslation();

  const steps: WillStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Your basic details',
      description: 'Start with the foundation of your will',
      icon: <FileText size={24} color="$legacyAccentGold" />,
      component: PersonalInfoStep,
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      subtitle: 'Who inherits what',
      description: 'Designate who receives your assets',
      icon: <Users size={24} color="$legacyAccentGoldLight" />,
      component: BeneficiariesStep,
    },
    {
      id: 'assets',
      title: 'Assets & Property',
      subtitle: 'What you own',
      description: 'Document your estate and property',
      icon: <Shield size={24} color="$legacySuccess" />,
      component: AssetsStep,
    },
    {
      id: 'review',
      title: 'Review & Finalize',
      subtitle: 'Almost done',
      description: 'Review and complete your will',
      icon: <CheckCircle size={24} color="$legacyAccentGold" />,
      component: ReviewStep,
    },
  ];

  const currentStepData = steps[currentStep] ?? steps[0];
  const CurrentStepComponent = currentStepData!.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalize will
      console.log('Will finalized:', willData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (newData: any) => {
    setWillData({ ...willData, ...newData });
  };

  return (
    <YStack flex={1} backgroundColor="$legacyBackgroundPrimary">
      {/* Sofia Firefly */}
      {isFeatureEnabled('sofiaFirefly') && (
        <SofiaFirefly
          variant="interactive"
          size="medium"
          personality="empathetic"
          context="guiding"
          onTouch={() => triggerEncouragement()}
          glowIntensity={0.6}
          enableHaptics={true}
          enableAdvancedAnimations={true}
          accessibilityLabel="Sofia, your will creation guide"
          accessibilityHint="Touch Sofia for gentle guidance during will creation"
        />
      )}

      <YStack flex={1}>
        {/* Progress Header */}
        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius={0}
        >
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
            <Text color="$legacyTextPrimary" fontSize="$6" fontWeight="800">
              Create Your Will
            </Text>
            <Text color="$legacyTextMuted" fontSize="$3">
              Step {currentStep + 1} of {steps.length}
            </Text>
          </XStack>

          <Progress value={(currentStep + 1) / steps.length * 100} height={4}>
            <Progress.Indicator backgroundColor="$legacyAccentGold" />
          </Progress>
        </Card>

        {/* Step Content */}
        <YStack flex={1}>
          <AnimatePresence mode="wait">
            <CurrentStepComponent
              key={currentStep}
              data={willData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </AnimatePresence>
        </YStack>

        {/* Sofia's Guidance */}
        <Card
          padding="$4"
          backgroundColor="$legacyBackgroundSecondary"
          borderColor="$legacyAccentGold"
          borderWidth={1}
          borderRadius={0}
        >
          <XStack alignItems="center" space="$2">
            <Heart size={16} color="$legacyAccentGold" />
            <Text color="$legacyTextPrimary" fontSize="$3" fontWeight="600">
              Sofia says:
            </Text>
          </XStack>
          <Text color="$legacyTextMuted" fontSize="$3" marginTop="$2">
            "Creating a will is one of the most loving things you can do for your family. Take your time with each step - I'm here to help."
          </Text>
        </Card>
      </YStack>
    </YStack>
  );
}