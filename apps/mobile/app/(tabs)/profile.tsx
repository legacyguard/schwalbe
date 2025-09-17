import { useState } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import { YStack, XStack, H1, H2, Text, Button, Card, Avatar } from 'tamagui';
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
  Calendar
} from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuthStore();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack p="$4" space="$4">
          {/* Header */}
          <H1 color="white" size="$8">
            Profile
          </H1>

          {/* User Info Card */}
          <Card p="$4" bc="$gray8">
            <XStack ai="center" space="$4">
              <Avatar circular size="$8" bc="$blue10">
                <Avatar.Image src={user?.user_metadata?.avatar_url} />
                <Avatar.Fallback bc="$blue10">
                  <User size={32} color="white" />
                </Avatar.Fallback>
              </Avatar>
              
              <YStack f={1} space="$2">
                <Text color="white" size="$6" fontWeight="600">
                  {user?.user_metadata?.full_name || 
                   user?.email?.split('@')[0] || 
                   'User'}
                </Text>
                <Text color="$gray10" size="$4">
                  LegacyGuard Member
                </Text>
                <XStack ai="center" space="$2">
                  <YStack w={6} h={6} br="$10" bc="$green10" />
                  <Text color="$green10" size="$3">
                    Account Active
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </Card>

          {/* Account Information */}
          <H2 color="white" size="$6">
            Account Information
          </H2>
          
          {userInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <Card key={index} p="$4" bc="$gray8">
                <XStack ai="center" space="$3">
                  <YStack
                    w={40}
                    h={40}
                    ai="center"
                    jc="center"
                    bc="$gray7"
                    br="$6"
                  >
                    <IconComponent size={20} color="$gray10" />
                  </YStack>
                  
                  <YStack f={1} space="$1">
                    <Text color="$gray10" size="$3">
                      {info.label}
                    </Text>
                    <Text color="white" size="$4" fontWeight="500">
                      {info.value}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            );
          })}

          {/* Menu Items */}
          <H2 color="white" size="$6">
            Settings
          </H2>
          
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} pressStyle={{ opacity: 0.8 }}>
                <Button
                  size="$4"
                  chromeless
                  onPress={item.onPress}
                  p="$4"
                  f={1}
                >
                  <XStack ai="center" space="$3" f={1}>
                    <YStack
                      w={40}
                      h={40}
                      ai="center"
                      jc="center"
                      bc="$gray7"
                      br="$6"
                    >
                      <IconComponent size={20} color="white" />
                    </YStack>
                    
                    <YStack f={1} space="$1">
                      <Text color="white" size="$4" fontWeight="500">
                        {item.title}
                      </Text>
                      <Text color="$gray10" size="$3">
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
          <Card p="$4" bc="$gray8">
            <YStack space="$2" ai="center">
              <Text color="$gray10" size="$3">
                LegacyGuard Mobile
              </Text>
              <Text color="$gray10" size="$3">
                Version 1.0.0
              </Text>
              <Text color="$gray10" size="$2" ta="center">
                Protecting your family's legacy with secure document management
              </Text>
            </YStack>
          </Card>

          {/* Sign Out Button */}
          <Button
            size="$4"
            theme="red"
            onPress={handleSignOut}
            mb="$6"
          >
            <XStack ai="center" space="$2">
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