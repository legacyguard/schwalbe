import { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card } from 'tamagui';
import { Bell, Plus, FileText, Shield, Users, TrendingUp } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { SofiaFirefly } from '../../src/components/sofia-firefly';
import { useHapticFeedback } from '../../src/temp-emotional-sync/hooks';
import { EmotionalMessages } from '../../src/temp-emotional-sync/components/messaging/EmotionalMessages';
import { AchievementCelebration, Achievement } from '../../src/temp-emotional-sync/components/achievements/AchievementCelebration';
import { isFeatureEnabled } from '../../src/config/featureFlags';
import { useTranslation } from 'react-i18next';

// Emotional messaging system
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const getEmotionalWelcome = (t: (k: string, o?: any) => string, timeOfDay: string, userName: string) => {
  // Use advanced emotional messages if enabled
  if (isFeatureEnabled('emotionalMessages')) {
    const timeOfDayType = timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night';
    return EmotionalMessages.getWelcomeMessage(timeOfDayType, userName).message;
  }

  return t(`screens.home.emotional.${timeOfDay}`, { userName });
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [emotionalMessage, setEmotionalMessage] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const { user } = useAuthStore();
  const { triggerEncouragement, triggerSuccess } = useHapticFeedback();
  const { t } = useTranslation(['screens', 'common']);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guardian';

  useEffect(() => {
    const timeOfDay = getTimeOfDay();
    const message = getEmotionalWelcome(t as any, timeOfDay, userName);
    setEmotionalMessage(message);
  }, [userName, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh with emotional feedback
    setTimeout(() => {
      setRefreshing(false);
      // Update emotional message on refresh
      const timeOfDay = getTimeOfDay();
      setEmotionalMessage(getEmotionalWelcome(t as any, timeOfDay, userName));

      // Trigger achievement if enabled and random chance
      if (isFeatureEnabled('achievements') && Math.random() < 0.3) {
        triggerSampleAchievement();
      }
    }, 1000);
  };

  const triggerSampleAchievement = () => {
    const achievement: Achievement = {
      id: 'daily_check',
      title: t('screens.home.achievements.dailyCheck.title'),
      description: t('screens.home.achievements.dailyCheck.description'),
      icon: '🛡️',
      shareText: t('screens.home.achievements.dailyCheck.shareText'),
      unlockedAt: new Date(),
    };

    setCurrentAchievement(achievement);
    setShowAchievement(true);
  };

  const statsData = [
    { label: t('screens.home.stats.seedsOfProtection'), value: '12', icon: FileText, color: '$legacyAccentGold' },
    { label: t('screens.home.stats.guardianCircle'), value: '3', icon: Shield, color: '$legacySuccess' },
    { label: t('screens.home.stats.familyHearts'), value: '4', icon: Users, color: '$legacyAccentGoldLight' },
    { label: t('screens.home.stats.growthThisMonth'), value: '+15%', icon: TrendingUp, color: '$legacyWarning' },
  ];

  const recentActivity = [
    { title: t('screens.home.activity.documentPlanted'), time: '2 hours ago', type: 'document' },
    { title: t('screens.home.activity.guardianJoined'), time: '1 day ago', type: 'family' },
    { title: t('screens.home.activity.shieldStrengthened'), time: '3 days ago', type: 'protection' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Full-screen Sofia Firefly overlay */}
      {isFeatureEnabled('sofiaFirefly') && (
        <SofiaFirefly
          variant="interactive"
          size="small"
          personality="empathetic"
          context="guiding"
          onTouch={() => triggerEncouragement()}
          glowIntensity={0.4}
          enableHaptics={true}
          enableAdvancedAnimations={true}
          accessibilityLabel="Sofia, your interactive guide"
          accessibilityHint="Touch and move Sofia around the screen to interact"
        />
      )}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack padding="$4" space="$4">
          {/* Emotional Welcome Message */}
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$4"
          >
            <Text
              color="$legacyAccentGold"
              fontSize="$emotionalLarge"
              fontWeight="700"
              textAlign="center"
              lineHeight={28}
            >
              {emotionalMessage}
            </Text>
          </Card>

          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <YStack>
          <Text color="$legacyTextMuted" fontSize="$4">
                {t('screens.home.sectionProtectionGarden')}
              </Text>
              <H1 color="$legacyTextPrimary" fontSize="$heroEmotional" fontWeight="800">
                {userName}
              </H1>
            </YStack>
            <XStack alignItems="center" space="$3">
              <SofiaFirefly
                size="small"
                personality="empathetic"
                context="guiding"
                message="Sofia's firefly brings hope to your family's journey ✨"
                onTouch={async () => {
                  await triggerEncouragement();
                }}
                enableHaptics={true}
                enableAdvancedAnimations={true}
                accessibilityLabel="Sofia's guiding light"
                accessibilityHint="Touch to receive Sofia's encouragement"
              />
              <Button size="$4" chromeless>
                <Bell size={24} color="$legacyAccentGold" />
              </Button>
            </XStack>
          </XStack>

          {/* Quick Actions */}
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$4"
          >
            <H2
              color="$legacyTextPrimary"
              fontSize="$emotionalMedium"
              marginBottom="$3"
              fontWeight="600"
            >
              {t('screens.home.plantSeedsTitle')}
            </H2>
            <XStack space="$3">
              <Button
                flex={1}
                size="$4"
                backgroundColor="$legacyAccentGold"
                borderRadius="$3"
                onPress={() => router.push('/(tabs)/documents')}
              >
                <XStack alignItems="center" space="$2">
                  <Plus size={16} color="$legacyBackgroundPrimary" />
                  <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                    {t('screens.home.addLegacyDoc')}
                  </Text>
                </XStack>
              </Button>
              <Button
                flex={1}
                size="$4"
                backgroundColor="$legacySuccess"
                borderRadius="$3"
                onPress={() => router.push('/(tabs)/protection')}
              >
                <XStack alignItems="center" space="$2">
                  <Shield size={16} color="white" />
                  <Text color="white" fontSize="$3" fontWeight="600">
                    {t('screens.home.strengthenShield')}
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </Card>

          {/* Stats Grid */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            {t('screens.home.gardenTitle')}
          </H2>
          <XStack flex={1} space="$3">
            {statsData.slice(0, 2).map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  flex={1}
                  padding="$3"
                  backgroundColor="$legacyBackgroundSecondary"
                  borderColor="$legacyAccentGold"
                  borderWidth={0.5}
                  borderRadius="$3"
                >
                  <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                    <IconComponent size={20} color={stat.color} />
                    <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="bold">
                      {stat.value}
                    </Text>
                  </XStack>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    {stat.label}
                  </Text>
                </Card>
              );
            })}
          </XStack>
          <XStack flex={1} space="$3">
            {statsData.slice(2, 4).map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index + 2}
                  flex={1}
                  padding="$3"
                  backgroundColor="$legacyBackgroundSecondary"
                  borderColor="$legacyAccentGold"
                  borderWidth={0.5}
                  borderRadius="$3"
                >
                  <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                    <IconComponent size={20} color={stat.color} />
                    <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="bold">
                      {stat.value}
                    </Text>
                  </XStack>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    {stat.label}
                  </Text>
                </Card>
              );
            })}
          </XStack>

          {/* Recent Activity */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            {t('screens.home.gardenGrowth')}
          </H2>
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$4"
          >
            <YStack space="$3">
              {recentActivity.map((activity, index) => (
                <XStack key={index} alignItems="center" justifyContent="space-between">
                  <YStack flex={1}>
                    <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="500">
                      {activity.title}
                    </Text>
                    <Text color="$legacyTextMuted" fontSize="$3">
                      {activity.time}
                    </Text>
                  </YStack>
                  <YStack
                    width={8}
                    height={8}
                    borderRadius="$10"
                    backgroundColor={
                      activity.type === 'document' ? '$legacyAccentGold' :
                      activity.type === 'family' ? '$legacyAccentGoldLight' : '$legacySuccess'
                    }
                  />
                </XStack>
              ))}
            </YStack>
          </Card>

          {/* Security Status */}
          <Card
            padding="$4"
            backgroundColor="$legacySuccess"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$4"
          >
            <XStack alignItems="center" space="$3">
              <Shield size={24} color="$legacyAccentGold" />
              <YStack flex={1}>
                <Text color="white" fontSize="$5" fontWeight="700">
                  {t('screens.home.securityStatus.activeTitle')}
                </Text>
                <Text color="$legacyAccentGoldLight" fontSize="$3" fontWeight="500">
                  {t('screens.home.securityStatus.activeSubtitle')}
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Achievement Celebration */}
      {isFeatureEnabled('achievements') && currentAchievement && (
        <AchievementCelebration
          achievement={currentAchievement}
          visible={showAchievement}
          onDismiss={() => {
            setShowAchievement(false);
            setCurrentAchievement(null);
          }}
          onShare={() => {
            // Handle sharing achievement
            console.log('Sharing achievement:', currentAchievement.shareText);
          }}
        />
      )}
    </SafeAreaView>
  );
}