/**
 * Daily Check-In Component
 * Personal emotional connection feature
 */

import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Card, Slider } from 'tamagui';
import { Heart, Shield, Smile, Frown, Meh } from '@tamagui/lucide-icons';
import { EmotionalAnimationWrapper } from '../animations';
import { EmotionalMessageCard } from '../messaging';
import { emotionalColors, getTypographyStyle } from '../../theme';
import { useHapticFeedback, useEmotionalState } from '../../hooks';

export interface DailyCheckInResponse {
  mood: 'confident' | 'worried' | 'motivated' | 'overwhelmed' | 'neutral';
  protectionFeeling: number; // 1-10 scale
  priorityToday: string;
  notes?: string;
  timestamp: Date;
}

export interface DailyCheckInProps {
  onComplete: (response: DailyCheckInResponse) => void;
  onDismiss?: () => void;
  userName?: string;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  onComplete,
  onDismiss,
  userName = 'Guardian',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [response, setResponse] = useState<Partial<DailyCheckInResponse>>({
    protectionFeeling: 5,
  });

  const { triggerEncouragement, triggerSuccess } = useHapticFeedback();
  const { trackAction } = useEmotionalState();

  const steps = [
    {
      id: 'mood',
      question: `How are you feeling about your family's protection today, ${userName}?`,
      type: 'mood' as const,
    },
    {
      id: 'protection',
      question: 'On a scale of 1-10, how protected does your family feel right now?',
      type: 'scale' as const,
    },
    {
      id: 'priority',
      question: 'What would give you the most peace of mind today?',
      type: 'priority' as const,
    },
  ];

  const moodOptions = [
    {
      id: 'confident' as const,
      icon: <Smile size={32} color={emotionalColors.success} />,
      label: 'Confident',
      description: 'Feeling secure and in control',
      color: emotionalColors.success,
    },
    {
      id: 'motivated' as const,
      icon: <Heart size={32} color={emotionalColors.accentYellow} />,
      label: 'Motivated',
      description: 'Ready to take action',
      color: emotionalColors.accentYellow,
    },
    {
      id: 'neutral' as const,
      icon: <Meh size={32} color={emotionalColors.textSecondary} />,
      label: 'Neutral',
      description: 'Feeling steady and calm',
      color: emotionalColors.textSecondary,
    },
    {
      id: 'worried' as const,
      icon: <Frown size={32} color={emotionalColors.warning} />,
      label: 'Worried',
      description: 'Feeling some concerns',
      color: emotionalColors.warning,
    },
    {
      id: 'overwhelmed' as const,
      icon: <Shield size={32} color={emotionalColors.error} />,
      label: 'Overwhelmed',
      description: 'Need support and guidance',
      color: emotionalColors.error,
    },
  ];

  const priorityOptions = [
    {
      id: 'documents',
      label: 'Add important documents',
      description: 'Secure essential paperwork',
      action: 'Add Document',
    },
    {
      id: 'guardians',
      label: 'Set up guardian circle',
      description: 'Choose trusted family protectors',
      action: 'Add Guardian',
    },
    {
      id: 'memories',
      label: 'Preserve family memories',
      description: 'Save precious photos and videos',
      action: 'Add Photos',
    },
    {
      id: 'planning',
      label: 'Financial planning',
      description: 'Plan for family\'s future security',
      action: 'Start Planning',
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!currentStepData) {
    return null;
  }

  const handleMoodSelect = (mood: DailyCheckInResponse['mood']) => {
    triggerEncouragement();
    setResponse(prev => ({ ...prev, mood }));
    setTimeout(() => handleNext(), 500);
  };

  const handleScaleChange = (value: number) => {
    setResponse(prev => ({ ...prev, protectionFeeling: value }));
  };

  const handlePrioritySelect = (priority: string) => {
    triggerEncouragement();
    setResponse(prev => ({ ...prev, priorityToday: priority }));
    setTimeout(() => handleNext(), 500);
  };

  const handleNext = () => {
    if (isLastStep) {
      // Complete check-in
      const finalResponse: DailyCheckInResponse = {
        mood: response.mood || 'neutral',
        protectionFeeling: response.protectionFeeling || 5,
        priorityToday: response.priorityToday || 'documents',
        timestamp: new Date(),
      };

      triggerSuccess();
      trackAction({
        type: 'app_opened',
        context: 'daily_checkin_completed',
        impact: 'positive',
      });

      onComplete(finalResponse);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    trackAction({
      type: 'app_opened',
      context: 'daily_checkin_skipped',
      impact: 'neutral',
    });
    onDismiss?.();
  };

  const getProtectionMessage = () => {
    const feeling = response.protectionFeeling || 5;
    if (feeling >= 8) {
      return {
        message: "Your family is in great hands with you as their guardian. Your dedication shows.",
        variant: 'success' as const,
      };
    } else if (feeling >= 6) {
      return {
        message: "You're building solid protection for your family. Every step forward matters.",
        variant: 'default' as const,
      };
    } else if (feeling >= 4) {
      return {
        message: "It's okay to feel uncertain. Taking small steps today will build your confidence.",
        variant: 'comfort' as const,
      };
    } else {
      return {
        message: "Your awareness is the first step to better protection. Let's take this journey together.",
        variant: 'comfort' as const,
      };
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'mood':
        return (
          <YStack space="$3">
            {moodOptions.map((option) => (
              <EmotionalAnimationWrapper
                key={option.id}
                animationType="gentleEntrance"
                trigger={true}
              >
                <Button
                  size="$5"
                  backgroundColor={emotionalColors.backgroundSecondary}
                  borderColor={option.color}
                  borderWidth={1}
                  borderRadius="$4"
                  onPress={() => handleMoodSelect(option.id)}
                  pressStyle={{
                    backgroundColor: option.color,
                    borderColor: option.color,
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
                        {option.label}
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
        );

      case 'scale':
        return (
          <YStack space="$4" alignItems="center">
            <Text
              fontSize="$8"
              fontWeight="800"
              color={emotionalColors.accentYellow}
            >
              {response.protectionFeeling}
            </Text>

            <Slider
              width="80%"
              value={[response.protectionFeeling || 5]}
              onValueChange={(value) => handleScaleChange(value[0] || 5)}
              min={1}
              max={10}
              step={1}
            >
              <Slider.Track backgroundColor={emotionalColors.backgroundTertiary}>
                <Slider.TrackActive backgroundColor={emotionalColors.accentYellow} />
              </Slider.Track>
              <Slider.Thumb
                index={0}
                size="$2"
                backgroundColor={emotionalColors.accentYellow}
              />
            </Slider>

            <XStack justifyContent="space-between" width="80%">
              <Text color={emotionalColors.textMuted} fontSize="$3">
                Not protected
              </Text>
              <Text color={emotionalColors.textMuted} fontSize="$3">
                Very protected
              </Text>
            </XStack>

            <EmotionalMessageCard
              message={getProtectionMessage()}
              variant={getProtectionMessage().variant}
              compactMode={true}
              showAnimation={false}
            />

            <Button
              size="$4"
              backgroundColor={emotionalColors.accentYellow}
              borderRadius="$4"
              onPress={handleNext}
              marginTop="$3"
            >
              <Text color={emotionalColors.backgroundPrimary} fontWeight="600">
                Continue
              </Text>
            </Button>
          </YStack>
        );

      case 'priority':
        return (
          <YStack space="$3">
            {priorityOptions.map((option) => (
              <EmotionalAnimationWrapper
                key={option.id}
                animationType="gentleEntrance"
                trigger={true}
              >
                <Button
                  size="$5"
                  backgroundColor={emotionalColors.backgroundSecondary}
                  borderColor={emotionalColors.accentYellow}
                  borderWidth={1}
                  borderRadius="$4"
                  onPress={() => handlePrioritySelect(option.id)}
                  pressStyle={{
                    backgroundColor: emotionalColors.accentYellow,
                    borderColor: emotionalColors.accentYellowDark,
                  }}
                >
                  <XStack
                    alignItems="center"
                    space="$3"
                    width="100%"
                    justifyContent="space-between"
                    paddingVertical="$2"
                  >
                    <YStack flex={1} alignItems="flex-start">
                      <Text
                        color={emotionalColors.textPrimary}
                        fontSize="$5"
                        fontWeight="600"
                      >
                        {option.label}
                      </Text>
                      <Text
                        color={emotionalColors.textSecondary}
                        fontSize="$3"
                      >
                        {option.description}
                      </Text>
                    </YStack>
                    <Text
                      color={emotionalColors.accentYellow}
                      fontSize="$4"
                      fontWeight="600"
                    >
                      {option.action}
                    </Text>
                  </XStack>
                </Button>
              </EmotionalAnimationWrapper>
            ))}
          </YStack>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      padding="$6"
      backgroundColor={emotionalColors.backgroundSecondary}
      borderRadius="$6"
      borderColor={emotionalColors.accentYellow}
      borderWidth={1}
      margin="$4"
    >
      <YStack space="$4">
        {/* Header */}
        <YStack space="$2" alignItems="center">
          <Text fontSize={32}>💙</Text>
          <Text style={getTypographyStyle('emotional')} textAlign="center">
            Daily Check-In
          </Text>
          <Text style={getTypographyStyle('body')} textAlign="center">
            {currentStepData.question}
          </Text>
        </YStack>

        {/* Progress */}
        <XStack space="$2" justifyContent="center">
          {steps.map((_, index) => (
            <YStack
              key={index}
              width={8}
              height={8}
              borderRadius="$10"
              backgroundColor={
                index <= currentStep
                  ? emotionalColors.accentYellow
                  : emotionalColors.backgroundTertiary
              }
            />
          ))}
        </XStack>

        {/* Content */}
        <EmotionalAnimationWrapper
          animationType="comfortFade"
          trigger={true}
          key={currentStep}
        >
          {renderStepContent()}
        </EmotionalAnimationWrapper>

        {/* Skip option */}
        <XStack justifyContent="center" marginTop="$3">
          <Button
            size="$3"
            backgroundColor="transparent"
            onPress={handleSkip}
          >
            <Text color={emotionalColors.textMuted} fontSize="$3">
              Maybe later
            </Text>
          </Button>
        </XStack>
      </YStack>
    </Card>
  );
};