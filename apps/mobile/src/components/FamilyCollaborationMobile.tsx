import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card, Avatar } from 'tamagui';
import { Users, MessageCircle, Heart, Shield, Plus, Settings, Phone, Video, FileText } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { SofiaFirefly } from './sofia-firefly';
import { useHapticFeedback } from '../temp-emotional-sync/hooks';
import { isFeatureEnabled } from '../config/featureFlags';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  protectionScore: number;
  documentsShared: number;
  trustLevel: 'high' | 'medium' | 'low';
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'high' | 'medium' | 'low';
  participants: string[];
}

const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    role: 'Daughter',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    lastActive: 'now',
    protectionScore: 92,
    documentsShared: 8,
    trustLevel: 'high',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Son',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'away',
    lastActive: '2h ago',
    protectionScore: 87,
    documentsShared: 5,
    trustLevel: 'high',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Granddaughter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    lastActive: '1d ago',
    protectionScore: 78,
    documentsShared: 3,
    trustLevel: 'medium',
  },
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Family Legacy Planning',
    lastMessage: 'Sarah: I think we should review the trust documents this weekend',
    lastMessageTime: '2h ago',
    unreadCount: 3,
    priority: 'high',
    participants: ['Sarah', 'Michael', 'You'],
  },
  {
    id: '2',
    title: 'Grandchildren Updates',
    lastMessage: 'Emily: Thank you for sharing the family photos! ❤️',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    priority: 'medium',
    participants: ['Emily', 'You'],
  },
];

const FamilyMemberCard = ({ member, onPress }: { member: FamilyMember; onPress: () => void }) => {
  const { triggerSuccess } = useHapticFeedback();

  const getStatusColor = () => {
    switch (member.status) {
      case 'online': return '$legacySuccess';
      case 'away': return '$legacyWarning';
      default: return '$legacyTextMuted';
    }
  };

  const getTrustColor = () => {
    switch (member.trustLevel) {
      case 'high': return '$legacySuccess';
      case 'medium': return '$legacyAccentGold';
      case 'low': return '$legacyWarning';
      default: return '$legacyTextMuted';
    }
  };

  const handlePress = () => {
    triggerSuccess();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Card
        padding="$4"
        marginBottom="$3"
        backgroundColor="$legacyBackgroundSecondary"
        borderColor="$legacyAccentGold"
        borderWidth={0.5}
        borderRadius="$4"
      >
        <XStack space="$3" alignItems="center">
          <XStack alignItems="center" space="$2" flex={1}>
            <YStack
              width={12}
              height={12}
              borderRadius="$10"
              backgroundColor={getStatusColor()}
              borderWidth={2}
              borderColor="$legacyBackgroundPrimary"
            />
            <Avatar size="$5" circular>
              <Avatar.Image src={member.avatar} />
              <Avatar.Fallback backgroundColor="$legacyAccentGold" />
            </Avatar>
          </XStack>

          <YStack flex={1}>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="700">
                  {member.name}
                </Text>
                <Text color="$legacyTextMuted" fontSize="$2">
                  {member.role}
                </Text>
              </YStack>

              <YStack alignItems="flex-end" space="$1">
                <Text color="$legacyTextMuted" fontSize="$2">
                  {member.lastActive}
                </Text>
                <YStack
                  width={8}
                  height={8}
                  borderRadius="$10"
                  backgroundColor={getTrustColor()}
                />
              </YStack>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
              <XStack alignItems="center" space="$3">
                <XStack alignItems="center" space="$1">
                  <Shield size={12} color="$legacySuccess" />
                  <Text color="$legacyTextMuted" fontSize="$2">
                    {member.protectionScore}%
                  </Text>
                </XStack>
                <XStack alignItems="center" space="$1">
                  <FileText size={12} color="$legacyAccentGold" />
                  <Text color="$legacyTextMuted" fontSize="$2">
                    {member.documentsShared} docs
                  </Text>
                </XStack>
              </XStack>

              <Button
                size="$2"
                backgroundColor="transparent"
                borderColor="$legacyAccentGold"
                borderWidth={1}
                borderRadius="$2"
                onPress={handlePress}
              >
                <MessageCircle size={14} color="$legacyAccentGold" />
              </Button>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </TouchableOpacity>
  );
};

const ConversationCard = ({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) => {
  const { triggerSuccess } = useHapticFeedback();

  const getPriorityColor = () => {
    switch (conversation.priority) {
      case 'high': return '$legacyWarning';
      case 'medium': return '$legacyAccentGold';
      case 'low': return '$legacySuccess';
      default: return '$legacyTextMuted';
    }
  };

  const handlePress = () => {
    triggerSuccess();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Card
        padding="$4"
        marginBottom="$3"
        backgroundColor="$legacyBackgroundSecondary"
        borderColor="$legacyAccentGold"
        borderWidth={0.5}
        borderRadius="$4"
      >
        <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$2">
          <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="700" flex={1}>
            {conversation.title}
          </Text>
          <YStack
            width={8}
            height={8}
            borderRadius="$10"
            backgroundColor={getPriorityColor()}
          />
        </XStack>

        <Text color="$legacyTextMuted" fontSize="$3" marginBottom="$2" numberOfLines={2}>
          {conversation.lastMessage}
        </Text>

        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$legacyTextMuted" fontSize="$2">
            {conversation.lastMessageTime}
          </Text>

          {conversation.unreadCount > 0 && (
            <YStack
              backgroundColor="$legacyWarning"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              minWidth={20}
              alignItems="center"
            >
              <Text color="white" fontSize="$2" fontWeight="700">
                {conversation.unreadCount}
              </Text>
            </YStack>
          )}
        </XStack>
      </Card>
    </TouchableOpacity>
  );
};

export default function FamilyCollaborationMobile() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'conversations'>('members');
  const { triggerEncouragement } = useHapticFeedback();
  const { t } = useTranslation();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const familyStats = {
    totalMembers: 8,
    activeToday: 5,
    protectionAverage: 89,
    sharedDocuments: 24,
  };

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
          accessibilityLabel="Sofia, your family collaboration guide"
          accessibilityHint="Touch to get help with family communication and planning"
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
                  Family Collaboration
                </Text>
                <Text color="$legacyTextPrimary" fontSize="$7" fontWeight="800">
                  Your Family Circle
                </Text>
              </YStack>
              <SofiaFirefly
                size="small"
                personality="empathetic"
                context="guiding"
                message="Sofia helps nurture your family's protective bonds ✨"
                onTouch={async () => {
                  await triggerEncouragement();
                }}
                enableHaptics={true}
                enableAdvancedAnimations={true}
                accessibilityLabel="Sofia's guiding light"
                accessibilityHint="Touch for family harmony tips"
              />
            </XStack>

            <Text color="$legacyTextMuted" fontSize="$3" textAlign="center">
              Connect, share, and protect together with your loved ones in a safe, private space
            </Text>
          </YStack>

          {/* Family Stats */}
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$4"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$3">
                <Users size={24} color="$legacyAccentGold" />
                <YStack>
                  <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="700">
                    {familyStats.totalMembers} Family Members
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3">
                    {familyStats.activeToday} active today
                  </Text>
                </YStack>
              </XStack>

              <YStack alignItems="flex-end">
                <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="700">
                  {familyStats.protectionAverage}%
                </Text>
                <Text color="$legacyTextMuted" fontSize="$2">
                  Avg Protection
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Tab Selector */}
          <XStack space="$2">
            <TouchableOpacity
              onPress={() => setActiveTab('members')}
              style={{ flex: 1 }}
            >
              <Text
                backgroundColor={activeTab === 'members' ? '$legacyAccentGold' : 'transparent'}
                color={activeTab === 'members' ? '$legacyBackgroundPrimary' : '$legacyAccentGold'}
                borderColor="$legacyAccentGold"
                borderWidth={1}
                paddingHorizontal="$4"
                paddingVertical="$3"
                borderRadius="$3"
                fontSize="$4"
                fontWeight="600"
                textAlign="center"
              >
                Family Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('conversations')}
              style={{ flex: 1 }}
            >
              <Text
                backgroundColor={activeTab === 'conversations' ? '$legacyAccentGold' : 'transparent'}
                color={activeTab === 'conversations' ? '$legacyBackgroundPrimary' : '$legacyAccentGold'}
                borderColor="$legacyAccentGold"
                borderWidth={1}
                paddingHorizontal="$4"
                paddingVertical="$3"
                borderRadius="$3"
                fontSize="$4"
                fontWeight="600"
                textAlign="center"
              >
                Conversations
              </Text>
            </TouchableOpacity>
          </XStack>

          {/* Content */}
          {activeTab === 'members' ? (
            <YStack space="$2">
              {mockFamilyMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onPress={() => {
                    // Navigate to member detail
                    router.push(`/family/${member.id}`);
                  }}
                />
              ))}
            </YStack>
          ) : (
            <YStack space="$2">
              {mockConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onPress={() => {
                    // Navigate to conversation
                    router.push(`/conversation/${conversation.id}`);
                  }}
                />
              ))}
            </YStack>
          )}

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
                onPress={() => {
                  // Handle add family member
                }}
              >
                <XStack alignItems="center" space="$2">
                  <Plus size={16} color="$legacyBackgroundPrimary" />
                  <Text color="$legacyBackgroundPrimary" fontSize="$3" fontWeight="600">
                    Add Member
                  </Text>
                </XStack>
              </Button>
              <Button
                flex={1}
                size="$3"
                backgroundColor="$legacySuccess"
                borderRadius="$3"
                onPress={() => {
                  // Handle start video call
                }}
              >
                <XStack alignItems="center" space="$2">
                  <Video size={16} color="white" />
                  <Text color="white" fontSize="$3" fontWeight="600">
                    Video Call
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </Card>

          {/* Sofia's Family Tips */}
          <Card
            padding="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={0.5}
            borderRadius="$4"
          >
            <XStack alignItems="center" space="$2" marginBottom="$2">
              <Heart size={20} color="$legacyAccentGold" />
              <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                Sofia's Family Tip
              </Text>
            </XStack>
            <Text color="$legacyTextMuted" fontSize="$3" marginBottom="$3">
              Regular family check-ins strengthen your protective bonds. Consider scheduling a monthly family meeting to discuss everyone's needs and concerns.
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
                Schedule Family Meeting
              </Text>
            </Button>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}