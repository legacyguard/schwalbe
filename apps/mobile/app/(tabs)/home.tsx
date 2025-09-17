import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Text, Button, Card } from '@tamagui/core';
import { Bell, Plus, FileText, Shield, Users, TrendingUp } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack p="$4" space="$4">
          {/* Header */}
          <XStack ai="center" jc="space-between">
            <YStack>
              <Text color="$gray10" size="$4">
                Welcome back,
              </Text>
              <H1 color="white" size="$8">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </H1>
            </YStack>
            <Button size="$4" chromeless>
              <Bell size={24} color="white" />
            </Button>
          </XStack>

          {/* Quick Actions */}
          <Card p="$4" bc="$gray8">
            <H2 color="white" size="$6" mb="$3">
              Quick Actions
            </H2>
            <XStack space="$3">
              <Button
                f={1}
                size="$4"
                theme="blue"
                onPress={() => router.push('/(tabs)/documents')}
              >
                <XStack ai="center" space="$2">
                  <Plus size={16} color="white" />
                  <Text color="white" size="$3">Add Document</Text>
                </XStack>
              </Button>
              <Button
                f={1}
                size="$4"
                theme="green"
                onPress={() => router.push('/(tabs)/protection')}
              >
                <XStack ai="center" space="$2">
                  <Shield size={16} color="white" />
                  <Text color="white" size="$3">Set Protection</Text>
                </XStack>
              </Button>
            </XStack>
          </Card>

          {/* Stats Grid */}
          <H2 color="white" size="$6">
            Overview
          </H2>
          <XStack f={1} space="$3">
            {statsData.slice(0, 2).map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} f={1} p="$3" bc="$gray8">
                  <XStack ai="center" jc="space-between" mb="$2">
                    <IconComponent size={20} color={stat.color} />
                    <Text color="white" size="$7" fontWeight="bold">
                      {stat.value}
                    </Text>
                  </XStack>
                  <Text color="$gray10" size="$3">
                    {stat.label}
                  </Text>
                </Card>
              );
            })}
          </XStack>
          <XStack f={1} space="$3">
            {statsData.slice(2, 4).map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index + 2} f={1} p="$3" bc="$gray8">
                  <XStack ai="center" jc="space-between" mb="$2">
                    <IconComponent size={20} color={stat.color} />
                    <Text color="white" size="$7" fontWeight="bold">
                      {stat.value}
                    </Text>
                  </XStack>
                  <Text color="$gray10" size="$3">
                    {stat.label}
                  </Text>
                </Card>
              );
            })}
          </XStack>

          {/* Recent Activity */}
          <H2 color="white" size="$6">
            Recent Activity
          </H2>
          <Card p="$4" bc="$gray8">
            <YStack space="$3">
              {recentActivity.map((activity, index) => (
                <XStack key={index} ai="center" jc="space-between">
                  <YStack f={1}>
                    <Text color="white" size="$4" fontWeight="500">
                      {activity.title}
                    </Text>
                    <Text color="$gray10" size="$3">
                      {activity.time}
                    </Text>
                  </YStack>
                  <YStack
                    w={8}
                    h={8}
                    br="$10"
                    bc={
                      activity.type === 'document' ? '$blue10' :
                      activity.type === 'family' ? '$purple10' : '$green10'
                    }
                  />
                </XStack>
              ))}
            </YStack>
          </Card>

          {/* Security Status */}
          <Card p="$4" bc="$green8">
            <XStack ai="center" space="$3">
              <Shield size={24} color="$green10" />
              <YStack f={1}>
                <Text color="white" size="$5" fontWeight="600">
                  Security Status: Active
                </Text>
                <Text color="$green11" size="$3">
                  All your documents are protected and backed up
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}