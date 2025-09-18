import { useState } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card, Avatar } from 'tamagui';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Heart,
  Star
} from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { SofiaFirefly } from '../../src/components/SofiaFirefly';
import { useHapticFeedback } from '../../src/hooks/useHapticFeedback';

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuthStore();
  const { sofiaFireflyHaptic } = useHapticFeedback();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Account Settings',
      subtitle: 'Manage your personal information',
      icon: Settings,
      onPress: () => {},
    },
    {
      title: 'Notifications',
      subtitle: 'Configure alerts and updates',
      icon: Bell,
      onPress: () => {},
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage security settings',
      icon: Shield,
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      onPress: () => {},
    },
  ];

  const userInfo = [
    {
      label: 'Email',
      value: user?.email || 'No email provided',
      icon: Mail,
    },
    {
      label: 'Phone',
      value: user?.phone || 'No phone provided',
      icon: Phone,
    },
    {
      label: 'Member Since',
      value: user?.created_at 
        ? new Date(user.created_at).toLocaleDateString()
        : 'Unknown',
      icon: Calendar,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack padding="$4" space="$4">
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <H1 color="$legacyTextPrimary" fontSize="$heroEmotional" fontWeight="800">
              Guardian Profile 👤
            </H1>
            <SofiaFirefly
              size="small"
              message="Sofia's light guides your personal journey ✨"
              onTouch={async () => {
                await sofiaFireflyHaptic();
              }}
            />
          </XStack>

          {/* User Info Card */}
          <Card padding="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={1} borderRadius="$4">
            <XStack alignItems="center" space="$4">
              <Avatar circular size="$8" backgroundColor="$legacyAccentGold">
                <Avatar.Image src={user?.user_metadata?.avatar_url} />
                <Avatar.Fallback backgroundColor="$legacyAccentGold">
                  <Heart size={32} color="$legacyBackgroundPrimary" />
                </Avatar.Fallback>
              </Avatar>

              <YStack flex={1} space="$2">
                <Text color="$legacyTextPrimary" fontSize="$emotionalLarge" fontWeight="700">
                  {user?.user_metadata?.full_name ||
                   user?.email?.split('@')[0] ||
                   'Guardian'}
                </Text>
                <Text color="$legacyTextMuted" fontSize="$4" fontWeight="500">
                  Family Legacy Protector 🛡️
                </Text>
                <XStack alignItems="center" space="$2">
                  <YStack width={6} height={6} borderRadius="$10" backgroundColor="$legacySuccess" />
                  <Text color="$legacySuccess" fontSize="$3" fontWeight="600">
                    Guardian Active ✨
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </Card>

          {/* Account Information */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            Guardian Credentials 📋
          </H2>
          
          {userInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <Card key={index} padding="$4" backgroundColor="$gray8">
                <XStack alignItems="center" space="$3">
                  <YStack
                    width={40}
                    height={40}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$legacyBackgroundTertiary"
                    borderRadius="$6"
                  >
                    <IconComponent size={20} color="$gray10" />
                  </YStack>

                  <YStack flex={1} space="$1">
                    <Text color="$gray10" fontSize="$3">
                      {info.label}
                    </Text>
                    <Text color="white" fontSize="$4" fontWeight="500">
                      {info.value}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            );
          })}

          {/* Menu Items */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            Guardian Settings ⚙️
          </H2>
          
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} pressStyle={{ opacity: 0.8 }}>
                <Button
                  size="$4"
                  chromeless
                  onPress={item.onPress}
                  padding="$4"
                  flex={1}
                >
                  <XStack alignItems="center" space="$3" flex={1}>
                    <YStack
                      width={40}
                      height={40}
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="$gray7"
                      borderRadius="$6"
                    >
                      <IconComponent size={20} color="white" />
                    </YStack>

                    <YStack flex={1} space="$1">
                      <Text color="white" fontSize="$4" fontWeight="500">
                        {item.title}
                      </Text>
                      <Text color="$gray10" fontSize="$3">
                        {item.subtitle}
                      </Text>
                    </YStack>

                    <ChevronRight size={20} color="$gray10" />
                  </XStack>
                </Button>
              </Card>
            );
          })}

          {/* App Information */}
          <Card padding="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4">
            <YStack space="$2" alignItems="center">
              <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                LegacyGuard Mobile ✨
              </Text>
              <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                Version 1.0.0
              </Text>
              <Text color="$legacyTextSecondary" fontSize="$3" textAlign="center" lineHeight={18}>
                Protecting your family's legacy with love, security, and peace of mind
              </Text>
            </YStack>
          </Card>

          {/* Sign Out Button */}
          <Button
            size="$4"
            theme="red"
            onPress={handleSignOut}
            marginBottom="$6"
          >
            <XStack alignItems="center" space="$2">
              <LogOut size={16} color="white" />
              <Text color="white" fontWeight="600">
                Sign Out
              </Text>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}