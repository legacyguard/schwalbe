import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { ArrowRight, Sparkles, Shield, Heart } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { SofiaFirefly } from '../sofia-firefly';
import { useHapticFeedback } from '../../temp-emotional-sync/hooks';
import { isFeatureEnabled } from '../../config/featureFlags';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const FloatingElement = ({ children, delay = 0 }: FloatingElementProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return <>{children}</>;
};

export default function Scene2BoxMobile() {
  const [currentStep, setCurrentStep] = useState(0);
  const { triggerSuccess, triggerEncouragement } = useHapticFeedback();

  const steps = [
    {
      title: "Plant Your First Seed",
      subtitle: "Every great legacy starts with a single document",
      description: "Begin by adding your most important document - your will, trust, or healthcare directive. Sofia will guide you through each step with care and understanding.",
      icon: <Sparkles size={32} color="$legacyAccentGold" />,
      action: "Add Your First Document",
    },
    {
      title: "Build Your Foundation",
      subtitle: "Create a strong base for your family's protection",
      description: "With your first document planted, let's add more layers of protection. Think about healthcare directives, financial accounts, and digital assets.",
      icon: <Shield size={32} color="$legacySuccess" />,
      action: "Strengthen Your Foundation",
    },
    {
      title: "Nurture Your Garden",
      subtitle: "Watch your protection grow with regular care",
      description: "Your legacy garden needs ongoing attention. Sofia will remind you when documents need updates and celebrate your progress along the way.",
      icon: <Heart size={32} color="$legacyAccentGoldLight" />,
      action: "Continue Growing",
    },
  ];

  const currentStepData = steps[Math.min(currentStep, steps.length - 1)] as typeof steps[0];

  const handleNext = () => {
    triggerSuccess();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to next scene or dashboard
      router.push('/(tabs)/documents');
    }
  };

  const handleSkip = () => {
    triggerEncouragement();
    router.push('/(tabs)/home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
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
          accessibilityLabel="Sofia, your nurturing guide"
          accessibilityHint="Touch Sofia for gentle encouragement during onboarding"
        />
      )}

      <YStack flex={1} padding="$4" justifyContent="space-between">
        {/* Progress Indicator */}
        <XStack justifyContent="center" space="$2" marginTop="$4">
          {steps.map((_, index) => (
            <YStack
              key={index}
              width={currentStep === index ? 24 : 8}
              height={8}
              backgroundColor={currentStep === index ? '$legacyAccentGold' : '$legacyTextMuted'}
              borderRadius="$10"
            />
          ))}
        </XStack>

        {/* Main Content */}
        <YStack flex={1} justifyContent="center" alignItems="center" space="$6" paddingHorizontal="$4">
          {/* Icon */}
          <FloatingElement delay={200}>
            <YStack
              width={80}
              height={80}
              borderRadius="$10"
              backgroundColor="$legacyBackgroundSecondary"
              borderColor="$legacyAccentGold"
              borderWidth={2}
              alignItems="center"
              justifyContent="center"
            >
              {currentStepData.icon}
            </YStack>
          </FloatingElement>

          {/* Text Content */}
          <YStack space="$4" alignItems="center" maxWidth={SCREEN_WIDTH * 0.8}>
            <FloatingElement delay={400}>
              <Text
                color="$legacyTextPrimary"
                fontSize="$6"
                fontWeight="800"
                textAlign="center"
                lineHeight={32}
              >
                {currentStepData.title}
              </Text>
            </FloatingElement>

            <FloatingElement delay={600}>
              <Text
                color="$legacyAccentGold"
                fontSize="$4"
                fontWeight="600"
                textAlign="center"
              >
                {currentStepData.subtitle}
              </Text>
            </FloatingElement>

            <FloatingElement delay={800}>
              <Text
                color="$legacyTextMuted"
                fontSize="$4"
                textAlign="center"
                lineHeight={24}
              >
                {currentStepData.description}
              </Text>
            </FloatingElement>
          </YStack>

          {/* Sofia's Message */}
          <FloatingElement delay={1000}>
            <Card
              padding="$4"
              backgroundColor="$legacyBackgroundSecondary"
              borderColor="$legacyAccentGold"
              borderWidth={1}
              borderRadius="$4"
              maxWidth={SCREEN_WIDTH * 0.9}
            >
              <XStack alignItems="center" space="$2">
                <Heart size={16} color="$legacyAccentGold" />
                <Text color="$legacyTextPrimary" fontSize="$3" fontWeight="600">
                  Sofia says:
                </Text>
              </XStack>
              <Text color="$legacyTextMuted" fontSize="$3" marginTop="$2" textAlign="center">
                "Every document you add is a seed of love for your family. I'm here to help you plant them with care."
              </Text>
            </Card>
          </FloatingElement>
        </YStack>

        {/* Action Buttons */}
        <YStack space="$3" marginBottom="$4">
          <Button
            size="$5"
            backgroundColor="$legacyAccentGold"
            borderRadius="$4"
            onPress={handleNext}
          >
            <XStack alignItems="center" space="$2">
              <Text color="$legacyBackgroundPrimary" fontSize="$4" fontWeight="700">
                {currentStepData.action}
              </Text>
              <ArrowRight size={20} color="$legacyBackgroundPrimary" />
            </XStack>
          </Button>

          <TouchableOpacity onPress={handleSkip}>
            <Text
              color="$legacyTextMuted"
              fontSize="$3"
              textAlign="center"
              textDecorationLine="underline"
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}