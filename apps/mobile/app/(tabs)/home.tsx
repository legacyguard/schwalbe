import { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card } from 'tamagui';
import { Bell, Plus, FileText, Shield, Users, TrendingUp } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { SofiaFirefly } from '../../src/components/SofiaFirefly';
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback';

// Emotional messaging system
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const getEmotionalWelcome = (timeOfDay: string, userName: string) => {
  const messages = {
    morning: `Good morning, ${userName}! Your family is a little safer today because of you.`,
    afternoon: `Every step you take today, ${userName}, protects your family's tomorrow.`,
    evening: `Rest easy, ${userName}. You've built a fortress of protection today.`,
    night: `Good night, ${userName}. Your vigilance keeps your loved ones safe while they sleep.`,
  };
  return messages[timeOfDay as keyof typeof messages] || messages.morning;
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [emotionalMessage, setEmotionalMessage] = useState('');
  const { user } = useAuthStore();
  const { sofiaFireflyHaptic, touchHaptic } = useHapticFeedback();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guardian';

  useEffect(() => {
    const timeOfDay = getTimeOfDay();
    const message = getEmotionalWelcome(timeOfDay, userName);
    setEmotionalMessage(message);
  }, [userName]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh with emotional feedback
    setTimeout(() => {
      setRefreshing(false);
      // Update emotional message on refresh
      const timeOfDay = getTimeOfDay();
      setEmotionalMessage(getEmotionalWelcome(timeOfDay, userName));
    }, 1000);
  };

  const statsData = [
    { label: 'Seeds of Protection', value: '12', icon: FileText, color: '$legacyAccentGold' },
    { label: 'Guardian Circle', value: '3', icon: Shield, color: '$legacySuccess' },
    { label: 'Family Hearts', value: '4', icon: Users, color: '$legacyAccentGoldLight' },
    { label: 'Growth This Month', value: '+15%', icon: TrendingUp, color: '$legacyWarning' },
  ];

  const recentActivity = [
    { title: '🌱 Will document planted in your garden', time: '2 hours ago', type: 'document' },
    { title: '💝 New guardian joined your circle', time: '1 day ago', type: 'family' },
    { title: '🛡️ Protection shield strengthened', time: '3 days ago', type: 'protection' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
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
                Your Protection Garden
              </Text>
              <H1 color="$legacyTextPrimary" fontSize="$heroEmotional" fontWeight="800">
                {userName}
              </H1>
            </YStack>
            <XStack alignItems="center" space="$3">
              <SofiaFirefly
                size="small"
                message="Sofia's firefly brings hope to your family's journey ✨"
                onTouch={async () => {
                  await sofiaFireflyHaptic();
                }}
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
              Plant New Seeds 🌱
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
                    Add Legacy Document
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
                    Strengthen Shield
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </Card>

          {/* Stats Grid */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            Your Protection Garden 🌟
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
            Garden Growth 📈
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
                  Protection Shield: Active ✨
                </Text>
                <Text color="$legacyAccentGoldLight" fontSize="$3" fontWeight="500">
                  Your legacy is safe and your family's future is secure
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}