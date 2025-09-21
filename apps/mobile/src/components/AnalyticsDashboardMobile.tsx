import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { TrendingUp, Shield, Users, FileText, Heart, AlertCircle, CheckCircle, Clock } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { SofiaFirefly } from './sofia-firefly';
import { useHapticFeedback } from '../temp-emotional-sync/hooks';
import { isFeatureEnabled } from '../config/featureFlags';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

const MetricCard = ({ title, value, change, changeType, icon, description }: MetricCardProps) => {
  const { triggerSuccess } = useHapticFeedback();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return '$legacySuccess';
      case 'negative': return '$legacyWarning';
      default: return '$legacyTextMuted';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => triggerSuccess()}
      activeOpacity={0.8}
    >
      <Card
        padding="$4"
        backgroundColor="$legacyBackgroundSecondary"
        borderColor="$legacyAccentGold"
        borderWidth={0.5}
        borderRadius="$4"
        marginBottom="$3"
      >
        <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
          <XStack alignItems="center" space="$2">
            {icon}
            <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
              {title}
            </Text>
          </XStack>
          <Text
            color={getChangeColor()}
            fontSize="$3"
            fontWeight="600"
          >
            {change}
          </Text>
        </XStack>

        <Text
          color="$legacyTextPrimary"
          fontSize="$6"
          fontWeight="800"
          marginBottom="$1"
        >
          {value}
        </Text>

        <Text color="$legacyTextMuted" fontSize="$2">
          {description}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'document' | 'guardian' | 'milestone' | 'alert';
  priority: 'high' | 'medium' | 'low';
}

const ActivityItem = ({ item }: { item: ActivityItem }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'document': return <FileText size={16} color="$legacyAccentGold" />;
      case 'guardian': return <Users size={16} color="$legacySuccess" />;
      case 'milestone': return <Heart size={16} color="$legacyAccentGoldLight" />;
      case 'alert': return <AlertCircle size={16} color="$legacyWarning" />;
      default: return <CheckCircle size={16} color="$legacySuccess" />;
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high': return '$legacyWarning';
      case 'medium': return '$legacyAccentGold';
      case 'low': return '$legacySuccess';
      default: return '$legacyTextMuted';
    }
  };

  return (
    <XStack
      padding="$3"
      backgroundColor="$legacyBackgroundSecondary"
      borderColor="$legacyAccentGold"
      borderWidth={0.5}
      borderRadius="$3"
      marginBottom="$2"
      alignItems="center"
      space="$3"
    >
      {getIcon()}
      <YStack flex={1}>
        <Text color="$legacyTextPrimary" fontSize="$3" fontWeight="600">
          {item.title}
        </Text>
        <Text color="$legacyTextMuted" fontSize="$2">
          {item.description}
        </Text>
      </YStack>
      <XStack alignItems="center" space="$2">
        <Text color="$legacyTextMuted" fontSize="$2">
          {item.time}
        </Text>
        <YStack
          width={8}
          height={8}
          borderRadius="$10"
          backgroundColor={getPriorityColor()}
        />
      </XStack>
    </XStack>
  );
};

export default function AnalyticsDashboardMobile() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { triggerEncouragement } = useHapticFeedback();
  const { t } = useTranslation();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const metrics = [
    {
      title: 'Family Protection Score',
      value: '94%',
      change: '+2.3%',
      changeType: 'positive' as const,
      icon: <Shield size={20} color="$legacySuccess" />,
      description: 'Overall family protection health',
    },
    {
      title: 'Documents Secured',
      value: '12',
      change: '+3',
      changeType: 'positive' as const,
      icon: <FileText size={20} color="$legacyAccentGold" />,
      description: 'Legacy documents in your garden',
    },
    {
      title: 'Guardian Network',
      value: '8',
      change: '+1',
      changeType: 'positive' as const,
      icon: <Users size={20} color="$legacyAccentGoldLight" />,
      description: 'Active family guardians',
    },
    {
      title: 'Milestones Achieved',
      value: '23',
      change: '+5',
      changeType: 'positive' as const,
      icon: <Heart size={20} color="$legacyAccentGold" />,
      description: 'Family protection milestones',
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      title: 'New Guardian Added',
      description: 'Sarah joined your family protection circle',
      time: '2h ago',
      type: 'guardian',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Document Updated',
      description: 'Last Will & Testament revision completed',
      time: '1d ago',
      type: 'document',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Milestone Reached',
      description: 'Family protection score reached 90%+',
      time: '2d ago',
      type: 'milestone',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Security Check',
      description: 'All guardian access permissions verified',
      time: '3d ago',
      type: 'alert',
      priority: 'low',
    },
  ];

  const insights = [
    {
      title: 'Protection Strength',
      description: 'Your family protection score is excellent! Consider adding one more guardian for optimal coverage.',
      action: 'Add Guardian',
      type: 'success',
    },
    {
      title: 'Document Health',
      description: 'All documents are up to date. Your digital estate planning is comprehensive.',
      action: 'View Documents',
      type: 'info',
    },
    {
      title: 'Family Engagement',
      description: 'Great family participation! 85% of family members are actively engaged.',
      action: 'View Family',
      type: 'success',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Sofia Firefly */}
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
          accessibilityLabel="Sofia, your analytics guide"
          accessibilityHint="Touch to get personalized insights about your family's protection"
        />
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack padding="$4" space="$4">
          {/* Header */}
          <YStack space="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <YStack>
                <Text color="$legacyTextMuted" fontSize="$4">
                  Analytics Dashboard
                </Text>
                <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800">
                  Family Protection Overview
                </Text>
              </YStack>
              <SofiaFirefly
                size="small"
                personality="empathetic"
                context="guiding"
                message="Sofia helps you understand your family's protection journey ✨"
                onTouch={async () => {
                  await triggerEncouragement();
                }}
                enableHaptics={true}
                enableAdvancedAnimations={true}
                accessibilityLabel="Sofia's guiding light"
                accessibilityHint="Touch for personalized analytics insights"
              />
            </XStack>

            <Text color="$legacyTextMuted" fontSize="$3" textAlign="center">
              Real-time insights into your family's legacy protection and guardian network health
            </Text>
          </YStack>

          {/* Time Period Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" paddingHorizontal="$1">
              {[
                { key: '24h', label: '24 Hours' },
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
              ].map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key)}
                >
                  <Text
                    backgroundColor={selectedPeriod === period.key ? '$legacyAccentGold' : 'transparent'}
                    color={selectedPeriod === period.key ? '$legacyBackgroundPrimary' : '$legacyAccentGold'}
                    borderColor="$legacyAccentGold"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$2"
                    fontSize="$3"
                    fontWeight="600"
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </XStack>
          </ScrollView>

          {/* Metrics Grid */}
          <YStack space="$2">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </YStack>

          {/* Sofia's Insights */}
          <YStack space="$3">
            <XStack alignItems="center" space="$2">
              <Heart size={20} color="$legacyAccentGold" />
              <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="700">
                Sofia's Insights
              </Text>
            </XStack>

            {insights.map((insight, index) => (
              <Card
                key={index}
                padding="$4"
                backgroundColor="$legacyBackgroundSecondary"
                borderColor="$legacyAccentGold"
                borderWidth={0.5}
                borderRadius="$4"
              >
                <YStack space="$2">
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    {insight.title}
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3">
                    {insight.description}
                  </Text>
                  <Button
                    size="$3"
                    backgroundColor="transparent"
                    borderColor="$legacyAccentGold"
                    borderWidth={1}
                    borderRadius="$3"
                    alignSelf="flex-start"
                  >
                    <Text color="$legacyAccentGold" fontSize="$3" fontWeight="600">
                      {insight.action}
                    </Text>
                  </Button>
                </YStack>
              </Card>
            ))}
          </YStack>

          {/* Recent Activity */}
          <YStack space="$3">
            <XStack alignItems="center" space="$2">
              <Clock size={20} color="$legacyAccentGold" />
              <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="700">
                Recent Activity
              </Text>
            </XStack>

            <YStack space="$2">
              {recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </YStack>
          </YStack>

          {/* Quick Actions */}
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$4"
          >
            <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600" marginBottom="$3">
              Quick Actions
            </Text>
            <XStack space="$2">
              <Button
                flex={1}
                size="$3"
                backgroundColor="$legacyAccentGold"
                borderRadius="$3"
                onPress={() => router.push('/(tabs)/documents')}
              >
                <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                  Add Document
                </Text>
              </Button>
              <Button
                flex={1}
                size="$3"
                backgroundColor="$legacySuccess"
                borderRadius="$3"
                onPress={() => router.push('/(tabs)/protection')}
              >
                <Text color="white" fontSize="$3" fontWeight="600">
                  Add Guardian
                </Text>
              </Button>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}