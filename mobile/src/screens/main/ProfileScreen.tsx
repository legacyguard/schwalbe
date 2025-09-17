/* global __DEV__ */
import React from 'react';
import {
  Box,
  // CardHeader,
  // CardTitle,
  // CardDescription,
  // CardContent,
  Button,
  Card,
  Container,
  Divider,
  H1,
  H2,
  H3,
  Paragraph,
  Row,
  ScrollContainer,
  Stack,
  // CircularProgress,
} from '@legacyguard/ui';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Alert, Switch } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  Bell,
  Check,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
  User,
} from 'lucide-react-native';

interface SettingItemProps {
  description?: string;
  icon: React.ReactElement;
  onPress?: () => void;
  showArrow?: boolean;
  title: string;
  value?: React.ReactNode | string;
}

const SettingItem = ({
  icon,
  title,
  description,
  value,
  onPress,
  showArrow = true,
}: SettingItemProps) => {
  return (
    <Card variant='ghost' padding='medium' clickable={!!onPress} fullWidth>
      <Row space='medium' align='center'>
        <Box
          padding='small'
          style={{
            backgroundColor: '#e0e7ff',
            borderRadius: 10,
          }}
        >
          {icon}
        </Box>
        <Stack space='xs' style={{ flex: 1 }}>
          <Paragraph weight='medium'>{title}</Paragraph>
          {description && (
            <Paragraph size='small' color='muted'>
              {description}
            </Paragraph>
          )}
        </Stack>
        {value &&
          (typeof value === 'string' ? (
            <Paragraph size='small' color='muted'>
              {value}
            </Paragraph>
          ) : (
            value
          ))}
        {showArrow && onPress && <ChevronRight size={20} color='#9ca3af' />}
      </Row>
    </Card>
  );
};

export function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigation = useNavigation();
  const { themeMode, setThemeMode } = useAppTheme();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            if (__DEV__) console.error('Sign out error:', error);
          }
        },
      },
    ]);
  };

  const handleThemeChange = (mode: 'dark' | 'light' | 'system') => {
    setThemeMode(mode);
  };

  // Calculate profile completion
  const profileCompletion = 78; // This would be calculated based on actual profile data

  return (
    <ScrollContainer padding='none' showsScrollIndicator={false}>
      <Container padding='medium'>
        <Stack space='large'>
          {/* Header */}
          <Stack space='small'>
            <H1>Profile</H1>
            <Paragraph size='large' color='muted'>
              Manage your account and preferences
            </Paragraph>
          </Stack>

          {/* User Card */}
          <Card variant='elevated' padding='large'>
            <Stack space='medium' align='center'>
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#e0e7ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={40} color='#1e40af' />
              </Box>
              <Stack space='xs' align='center'>
                <H2>{user?.fullName || 'User'}</H2>
                <Paragraph color='muted'>
                  {user?.primaryEmailAddress?.emailAddress ?? ''}
                </Paragraph>
              </Stack>

              {/* Trust Score */}
              <Stack space='small' align='center' style={{ width: '100%' }}>
                <Row justify='between' style={{ width: '100%' }}>
                  <Paragraph weight='medium'>Trust Score</Paragraph>
                  <Paragraph color='primary' weight='bold'>
                    {profileCompletion}%
                  </Paragraph>
                </Row>
                <Box
                  style={{
                    height: 8,
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: `${profileCompletion}%`,
                      height: '100%',
                      backgroundColor: '#f59e0b',
                    }}
                  />
                </Box>
                <Button
                  variant='premium'
                  size='small'
                  fullWidth
                  onPress={() =>
                    navigation.navigate('ProfileCompletion' as never)
                  }
                >
                  Complete Profile
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Divider />

          {/* Appearance Settings */}
          <Stack space='medium'>
            <H3>Appearance</H3>
            <Stack space='small'>
              <SettingItem
                icon={<Sun size={20} color='#1e40af' />}
                title='Light'
                onPress={() => handleThemeChange('light')}
                value={
                  themeMode === 'light' ? (
                    <Check size={20} color='#16a34a' />
                  ) : null
                }
                showArrow={false}
              />
              <SettingItem
                icon={<Moon size={20} color='#1e40af' />}
                title='Dark'
                onPress={() => handleThemeChange('dark')}
                value={
                  themeMode === 'dark' ? (
                    <Check size={20} color='#16a34a' />
                  ) : null
                }
                showArrow={false}
              />
              <SettingItem
                icon={<Smartphone size={20} color='#1e40af' />}
                title='System'
                description='Follow system settings'
                onPress={() => handleThemeChange('system')}
                value={
                  themeMode === 'system' ? (
                    <Check size={20} color='#16a34a' />
                  ) : null
                }
                showArrow={false}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* Security Settings */}
          <Stack space='medium'>
            <H3>Security</H3>
            <Stack space='small'>
              <SettingItem
                icon={<Shield size={20} color='#1e40af' />}
                title='Biometric Authentication'
                description='Use Face ID or Touch ID'
                value={
                  <Switch
                    value={true}
                    onValueChange={value => {
                      if (__DEV__) console.log('Biometric:', value);
                    }}
                  />
                }
                showArrow={false}
              />
              <SettingItem
                icon={<Lock size={20} color='#1e40af' />}
                title='Change Password'
                onPress={() => navigation.navigate('ChangePassword' as never)}
              />
              <SettingItem
                icon={<Shield size={20} color='#1e40af' />}
                title='Two-Factor Authentication'
                description='Add an extra layer of security'
                value='Enabled'
                onPress={() => navigation.navigate('TwoFactor' as never)}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* Notifications */}
          <Stack space='medium'>
            <H3>Notifications</H3>
            <Stack space='small'>
              <SettingItem
                icon={<Bell size={20} color='#1e40af' />}
                title='Push Notifications'
                description='Get alerts about important updates'
                value={
                  <Switch
                    value={true}
                    onValueChange={value => {
                      if (__DEV__) console.log('Push:', value);
                    }}
                  />
                }
                showArrow={false}
              />
              <SettingItem
                icon={<Bell size={20} color='#1e40af' />}
                title='Email Notifications'
                description='Weekly summaries and updates'
                value={
                  <Switch
                    value={true}
                    onValueChange={value => {
                      if (__DEV__) console.log('Email:', value);
                    }}
                  />
                }
                showArrow={false}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* Support */}
          <Stack space='medium'>
            <H3>Support</H3>
            <Stack space='small'>
              <SettingItem
                icon={<HelpCircle size={20} color='#1e40af' />}
                title='Help Center'
                description='Get answers to common questions'
                onPress={() => navigation.navigate('HelpCenter' as never)}
              />
              <SettingItem
                icon={<HelpCircle size={20} color='#1e40af' />}
                title='Contact Support'
                description='Get help from our team'
                onPress={() => navigation.navigate('ContactSupport' as never)}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* Sign Out */}
          <Button
            variant='ghost'
            size='large'
            fullWidth
            onPress={handleSignOut}
            style={{ marginTop: 20 }}
          >
            <Row space='small' align='center'>
              <LogOut size={20} color='#dc2626' />
              <Paragraph style={{ color: '#dc2626', fontWeight: '600' }}>
                Sign Out
              </Paragraph>
            </Row>
          </Button>

          {/* Version Info */}
          <Stack align='center' style={{ marginTop: 20 }}>
            <Paragraph size='small' color='muted'>
              LegacyGuard v1.0.0
            </Paragraph>
            <Paragraph size='small' color='muted'>
              © 2024 LegacyGuard. All rights reserved.
            </Paragraph>
          </Stack>
        </Stack>
      </Container>
    </ScrollContainer>
  );
}
