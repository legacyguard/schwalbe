/**
 * Emotional Onboarding Component
 * Continues the web story into mobile experience
 */

import React, { useState } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card, Progress } from 'tamagui';
import { Heart, Users, Home, ArrowRight, ArrowLeft } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EmotionalAnimationWrapper } from '../animations';
import { MobileSofiaFirefly } from '../sofia-firefly';
import { emotionalColors, getTypographyStyle } from '../../theme';
import { useHapticFeedback } from '../../hooks';

const { width: screenWidth } = Dimensions.get('window');

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  visual: React.ReactNode;
  options?: OnboardingOption[];
  canSkip?: boolean;
}

export interface OnboardingOption {
  id: string;
  icon: React.ReactNode;
  text: string;
  description: string;
  action: string;
  route?: string;
}

export interface EmotionalOnboardingProps {
  onComplete: (selectedOptions: string[]) => void;
  onSkip?: () => void;
  userName?: string;
}

export const EmotionalOnboarding: React.FC<EmotionalOnboardingProps> = ({
  onComplete,
  onSkip,
  userName = 'Guardian',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [sofiaActive, setSofiaActive] = useState(false);

  const { triggerEncouragement, triggerSuccess } = useHapticFeedback();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Your Journey Continues',
      subtitle: 'From the starry night of possibilities',
      message: `Welcome, ${userName}. The seeds you plant today will shelter your family tomorrow.`,
      visual: (
        <Text fontSize={64} textAlign="center">🌙⭐</Text>
      ),
    },
    {
      id: 'connection',
      title: 'What Matters Most?',
      subtitle: 'Building your family\'s protection',
      message: 'What would give you the most peace of mind about protecting your family?',
      visual: (
        <Text fontSize={64} textAlign="center">💝</Text>
      ),
      options: [
        {
          id: 'children_future',
          icon: <Text fontSize={32}>👶</Text>,
          text: 'Protect my children\'s future',
          description: 'Ensure your children are provided for',
          action: 'will_template',
          route: '/(tabs)/documents',
        },
        {
          id: 'family_memories',
          icon: <Text fontSize={32}>📸</Text>,
          text: 'Preserve family memories',
          description: 'Keep precious moments safe forever',
          action: 'photo_upload',
          route: '/(tabs)/documents',
        },
        {
          id: 'secure_home',
          icon: <Text fontSize={32}>🏠</Text>,
          text: 'Secure our home',
          description: 'Protect your family\'s foundation',
          action: 'property_docs',
          route: '/(tabs)/documents',
        },
      ],
    },
    {
      id: 'guardian_circle',
      title: 'Your Circle of Trust',
      subtitle: 'Who stands with your family?',
      message: 'Every strong family has guardians who care. Who would you trust to protect your family when you can\'t?',
      visual: (
        <Text fontSize={64} textAlign="center">🛡️👥</Text>
      ),
    },
    {
      id: 'ready',
      title: 'Your Garden Awaits',
      subtitle: 'Ready to plant your first seed?',
      message: 'Whatever you choose, you\'re already being the guardian your family needs.',
      visual: (
        <Text fontSize={64} textAlign="center">🌱✨</Text>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = (currentStep + 1) / steps.length;
  const isLastStep = currentStep === steps.length - 1;

  if (!currentStepData) {
    return null;
  }

  const handleNext = () => {
    triggerEncouragement();

    if (isLastStep) {
      triggerSuccess();
      onComplete(selectedOptions);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleOptionSelect = (option: OnboardingOption) => {
    triggerEncouragement();
    setSelectedOptions(prev => [...prev, option.id]);

    // Auto-advance after selection
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: emotionalColors.backgroundPrimary }}>
      {/* Sofia Firefly overlay */}
      <MobileSofiaFirefly
        isEnabled={sofiaActive}
        onInteractionStart={() => triggerEncouragement()}
        size={20}
      />

      <YStack flex={1} padding="$4">
        {/* Progress bar */}
        <XStack alignItems="center" marginBottom="$6">
          <Progress
            flex={1}
            value={progress * 100}
            backgroundColor={emotionalColors.backgroundSecondary}
          >
            <Progress.Indicator
              backgroundColor={emotionalColors.accentYellow}
              borderRadius="$2"
            />
          </Progress>
          <Text
            color={emotionalColors.textMuted}
            fontSize="$3"
            marginLeft="$3"
          >
            {currentStep + 1} of {steps.length}
          </Text>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <YStack flex={1} justifyContent="center" space="$6">
            {/* Visual element */}
            <EmotionalAnimationWrapper
              animationType="gentleEntrance"
              trigger={true}
              key={currentStep} // Re-trigger animation on step change
            >
              <YStack alignItems="center" marginBottom="$4">
                {currentStepData.visual}
              </YStack>
            </EmotionalAnimationWrapper>

            {/* Content */}
            <EmotionalAnimationWrapper
              animationType="comfortFade"
              trigger={true}
              key={`content-${currentStep}`}
            >
              <Card
                padding="$6"
                backgroundColor={emotionalColors.backgroundSecondary}
                borderRadius="$6"
                marginHorizontal="$2"
              >
                <YStack space="$4" alignItems="center">
                  {/* Title */}
                  <Text
                    style={getTypographyStyle('hero')}
                    textAlign="center"
                    maxWidth={screenWidth * 0.8}
                  >
                    {currentStepData.title}
                  </Text>

                  {/* Subtitle */}
                  <Text
                    style={getTypographyStyle('emotional')}
                    textAlign="center"
                    maxWidth={screenWidth * 0.7}
                  >
                    {currentStepData.subtitle}
                  </Text>

                  {/* Message */}
                  <Text
                    style={getTypographyStyle('body')}
                    textAlign="center"
                    maxWidth={screenWidth * 0.75}
                    lineHeight={26}
                  >
                    {currentStepData.message}
                  </Text>

                  {/* Options */}
                  {currentStepData.options && (
                    <YStack space="$3" width="100%" marginTop="$4">
                      {currentStepData.options.map((option) => (
                        <EmotionalAnimationWrapper
                          key={option.id}
                          animationType="gentleEntrance"
                          trigger={true}
                        >
                          <Button
                            size="$5"
                            backgroundColor={emotionalColors.backgroundTertiary}
                            borderColor={emotionalColors.accentYellow}
                            borderWidth={1}
                            borderRadius="$4"
                            onPress={() => handleOptionSelect(option)}
                            pressStyle={{
                              backgroundColor: emotionalColors.accentYellow,
                              borderColor: emotionalColors.accentYellowDark,
                            }}
                          >
                            <XStack
                              alignItems="center"
                              space="$3"
                              width="100%"
                              justifyContent="flex-start"
                              paddingVertical="$2"
                            >
                              {option.icon}
                              <YStack flex={1} alignItems="flex-start">
                                <Text
                                  color={emotionalColors.textPrimary}
                                  fontSize="$5"
                                  fontWeight="600"
                                >
                                  {option.text}
                                </Text>
                                <Text
                                  color={emotionalColors.textSecondary}
                                  fontSize="$3"
                                >
                                  {option.description}
                                </Text>
                              </YStack>
                            </XStack>
                          </Button>
                        </EmotionalAnimationWrapper>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </Card>
            </EmotionalAnimationWrapper>
          </YStack>
        </ScrollView>

        {/* Navigation */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$4">
          {/* Back button */}
          {currentStep > 0 ? (
            <Button
              size="$4"
              variant="outlined"
              backgroundColor="transparent"
              borderColor={emotionalColors.textMuted}
              onPress={handleBack}
            >
              <XStack alignItems="center" space="$2">
                <ArrowLeft size={16} color={emotionalColors.textMuted} />
                <Text color={emotionalColors.textMuted}>Back</Text>
              </XStack>
            </Button>
          ) : (
            <YStack />
          )}

          {/* Skip/Next buttons */}
          <XStack space="$3">
            {currentStepData.canSkip !== false && !isLastStep && (
              <Button
                size="$4"
                backgroundColor="transparent"
                onPress={handleSkip}
              >
                <Text color={emotionalColors.textMuted}>Skip</Text>
              </Button>
            )}

            {!currentStepData.options && (
              <Button
                size="$4"
                backgroundColor={emotionalColors.accentYellow}
                borderRadius="$4"
                onPress={handleNext}
                pressStyle={{
                  backgroundColor: emotionalColors.accentYellowDark,
                }}
              >
                <XStack alignItems="center" space="$2">
                  <Text
                    color={emotionalColors.backgroundPrimary}
                    fontWeight="600"
                  >
                    {isLastStep ? 'Begin Journey' : 'Continue'}
                  </Text>
                  <ArrowRight
                    size={16}
                    color={emotionalColors.backgroundPrimary}
                  />
                </XStack>
              </Button>
            )}
          </XStack>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
};