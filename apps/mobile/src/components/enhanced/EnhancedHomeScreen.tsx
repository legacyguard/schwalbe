/**
 * Enhanced Home Screen with Emotional Sync Integration
 * Backward compatible with feature flag controls
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card } from 'tamagui';
import { Bell, Plus, FileText, Shield, Users, TrendingUp } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '@/stores/authStore';
import { EmotionalWrapper, ConditionalEmotionalMessage, ConditionalDailyCheckIn } from '../emotional';
import { isFeatureEnabled } from '../../config/featureFlags';

// Conditional imports for emotional features
const getEmotionalFeatures = async () => {
  if (!isFeatureEnabled('emotionalMessages')) return null;

  try {
    const module = await import('../../temp-emotional-sync');
    return {
      EmotionalMessages: module.EmotionalMessages,
      useEmotionalState: module.useEmotionalState,
      useSofiaMessages: module.useSofiaMessages,
      emotionalColors: module.emotionalColors,
    };
  } catch {
    return null;
  }
};

export default function EnhancedHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<any>(null);
  const [emotionalFeatures, setEmotionalFeatures] = useState<any>(null);

  const { user } = useAuthStore();

  // Load emotional features if enabled
  useEffect(() => {
    if (isFeatureEnabled('emotionalMessages')) {
      getEmotionalFeatures().then(setEmotionalFeatures);
    }
  }, []);

  // Check if should show daily check-in
  useEffect(() => {
    if (isFeatureEnabled('dailyCheckIn') && emotionalFeatures) {
      const checkLastCheckIn = async () => {
        try {
          const lastCheckIn = await AsyncStorage.getItem('lastDailyCheckIn');
          const today = new Date().toDateString();

          if (lastCheckIn !== today) {
            // Show check-in after a delay
            setTimeout(() => setShowDailyCheckIn(true), 2000);
          }
        } catch (error) {
          console.warn('Failed to check daily check-in status:', error);
        }
      };

      checkLastCheckIn();
    }
  }, [emotionalFeatures]);

  // Generate welcome message if emotional features are enabled
  useEffect(() => {
    if (emotionalFeatures?.EmotionalMessages) {
      const timeOfDay = emotionalFeatures.EmotionalMessages.getCurrentTimeOfDay();
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guardian';
      const message = emotionalFeatures.EmotionalMessages.getWelcomeMessage(timeOfDay, userName);
      setWelcomeMessage(message);
    }
  }, [emotionalFeatures, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDailyCheckInComplete = async (response: any) => {
    console.log('Daily check-in completed:', response);
    try {
      await AsyncStorage.setItem('lastDailyCheckIn', new Date().toDateString());
    } catch (error) {
      console.warn('Failed to save daily check-in status:', error);
    }
    setShowDailyCheckIn(false);
  };

  const statsData = [
    { label: 'Documents Protected', value: '12', icon: FileText, color: '$blue10' },
    { label: 'Active Protections', value: '3', icon: Shield, color: '$green10' },
    { label: 'Family Members', value: '4', icon: Users, color: '$purple10' },
    { label: 'Monthly Activity', value: '+15%', icon: TrendingUp, color: '$orange10' },
  ];

  const recentActivity = [
    { title: 'Will document updated', time: '2 hours ago', type: 'document' },
    { title: 'New family member added', time: '1 day ago', type: 'family' },
    { title: 'Protection plan activated', time: '3 days ago', type: 'protection' },
  ];

  // Use emotional colors if available, otherwise fallback to default
  const backgroundColor = emotionalFeatures?.emotionalColors?.backgroundPrimary || '#1e293b';
  const secondaryBackground = emotionalFeatures?.emotionalColors?.backgroundSecondary || '$gray8';

  return (
    <EmotionalWrapper enableSofia={true}>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack padding="$4" space="$4">
            {/* Enhanced welcome message */}
            {welcomeMessage && (
              <ConditionalEmotionalMessage
                message={welcomeMessage}
                variant="default"
                onDismiss={() => setWelcomeMessage(null)}
              />
            )}

            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <YStack>
                <Text color="$gray10" fontSize="$4">
                  Welcome back,
                </Text>
                <H1 color="white" fontSize="$8">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </H1>
              </YStack>
              <Button size="$4" chromeless>
                <Bell size={24} color="white" />
              </Button>
            </XStack>

            {/* Quick Actions */}
            <Card padding="$4" backgroundColor={secondaryBackground}>
              <H2 color="white" fontSize="$6" marginBottom="$3">
                Quick Actions
              </H2>
              <XStack space="$3">
                <Button
                  flex={1}
                  size="$4"
                  theme="blue"
                  onPress={() => router.push('/(tabs)/documents')}
                >
                  <XStack alignItems="center" space="$2">
                    <Plus size={16} color="white" />
                    <Text color="white" fontSize="$3">Add Document</Text>
                  </XStack>
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  theme="green"
                  onPress={() => router.push('/(tabs)/protection')}
                >
                  <XStack alignItems="center" space="$2">
                    <Shield size={16} color="white" />
                    <Text color="white" fontSize="$3">Set Protection</Text>
                  </XStack>
                </Button>
              </XStack>
            </Card>

            {/* Stats Grid */}
            <H2 color="white" fontSize="$6">
              Overview
            </H2>
            <XStack flex={1} space="$3">
              {statsData.slice(0, 2).map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} flex={1} padding="$3" backgroundColor={secondaryBackground}>
                    <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                      <IconComponent size={20} color={stat.color} />
                      <Text color="white" fontSize="$7" fontWeight="bold">
                        {stat.value}
                      </Text>
                    </XStack>
                    <Text color="$gray10" fontSize="$3">
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
                  <Card key={index + 2} flex={1} padding="$3" backgroundColor={secondaryBackground}>
                    <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                      <IconComponent size={20} color={stat.color} />
                      <Text color="white" fontSize="$7" fontWeight="bold">
                        {stat.value}
                      </Text>
                    </XStack>
                    <Text color="$gray10" fontSize="$3">
                      {stat.label}
                    </Text>
                  </Card>
                );
              })}
            </XStack>

            {/* Recent Activity */}
            <H2 color="white" fontSize="$6">
              Recent Activity
            </H2>
            <Card padding="$4" backgroundColor={secondaryBackground}>
              <YStack space="$3">
                {recentActivity.map((activity, index) => (
                  <XStack key={index} alignItems="center" justifyContent="space-between">
                    <YStack flex={1}>
                      <Text color="white" fontSize="$4" fontWeight="500">
                        {activity.title}
                      </Text>
                      <Text color="$gray10" fontSize="$3">
                        {activity.time}
                      </Text>
                    </YStack>
                    <YStack
                      width={8}
                      height={8}
                      borderRadius="$10"
                      backgroundColor={
                        activity.type === 'document' ? '$blue10' :
                        activity.type === 'family' ? '$purple10' : '$green10'
                      }
                    />
                  </XStack>
                ))}
              </YStack>
            </Card>

            {/* Security Status */}
            <Card padding="$4" backgroundColor="$green8">
              <XStack alignItems="center" space="$3">
                <Shield size={24} color="$green10" />
                <YStack flex={1}>
                  <Text color="white" fontSize="$5" fontWeight="600">
                    Security Status: Active
                  </Text>
                  <Text color="$green11" fontSize="$3">
                    All your documents are protected and backed up
                  </Text>
                </YStack>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>

        {/* Daily Check-In Overlay */}
        {showDailyCheckIn && (
          <ConditionalDailyCheckIn
            onComplete={handleDailyCheckInComplete}
            onDismiss={() => setShowDailyCheckIn(false)}
            userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          />
        )}
      </SafeAreaView>
    </EmotionalWrapper>
  );
}