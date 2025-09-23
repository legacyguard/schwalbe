import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card, Switch, Progress } from 'tamagui';
import { Shield, CheckCircle, AlertTriangle, Settings, Users, Lock, Smartphone } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function ProtectionScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  const { t } = useTranslation('screens');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const protectionFeatures = [
    {
      title: t('screens.protection.features.documentEncryption.title'),
      description: t('screens.protection.features.documentEncryption.description'),
      status: 'active',
      icon: Lock,
    },
    {
      title: t('screens.protection.features.familyAccessControl.title'),
      description: t('screens.protection.features.familyAccessControl.description'),
      status: 'active',
      icon: Users,
    },
    {
      title: t('screens.protection.features.automaticBackup.title'),
      description: t('screens.protection.features.automaticBackup.description'),
      status: 'active',
      icon: Shield,
    },
    {
      title: t('screens.protection.features.mobileSecurity.title'),
      description: t('screens.protection.features.mobileSecurity.description'),
      status: 'partial',
      icon: Smartphone,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('screens.protection.statusTypes.active'): return '$green10';
      case t('screens.protection.statusTypes.partial'): return '$orange10';
      case t('screens.protection.statusTypes.inactive'): return '$red10';
      default: return '$gray10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t('screens.protection.statusTypes.active'): return CheckCircle;
      case t('screens.protection.statusTypes.partial'): return AlertTriangle;
      case t('screens.protection.statusTypes.inactive'): return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack p="$4" space="$4">
          {/* Header */}
          <XStack ai="center" jc="space-between">
            <H1 color="$legacyTextPrimary" fontSize="$heroEmotional" fontWeight="800">
              {t('screens.protection.title')}
            </H1>
            <Button size="$4" chromeless>
              <Settings size={24} color="$legacyAccentGold" />
            </Button>
          </XStack>

          {/* Protection Status */}
          <Card
            p="$4"
            backgroundColor="$legacySuccess"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$4"
          >
            <XStack ai="center" space="$3" mb="$3">
              <Shield size={32} color="$legacyAccentGold" />
              <YStack f={1}>
                <Text color="white" fontSize="$6" fontWeight="700">
                  {t('screens.protection.status.activeTitle')}
                </Text>
                <Text color="$legacyAccentGoldLight" fontSize="$4" fontWeight="500">
                  {t('screens.protection.status.activeSubtitle')}
                </Text>
              </YStack>
            </XStack>
            <Progress value={85} backgroundColor="$legacyBackgroundSecondary" mb="$2" borderRadius="$2">
              <Progress.Indicator backgroundColor="$legacyAccentGold" />
            </Progress>
            <Text color="$legacyAccentGoldLight" fontSize="$3" fontWeight="500">
              {t('screens.protection.status.completion')}
            </Text>
          </Card>

          {/* Protection Features */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            {t('screens.protection.arsenal')}
          </H2>
          
          {protectionFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const StatusIcon = getStatusIcon(feature.status);
            return (
              <Card key={index} p="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4">
                <XStack ai="center" space="$3">
                  <YStack
                    w={40}
                    h={40}
                    ai="center"
                    jc="center"
                    backgroundColor="$legacyBackgroundTertiary"
                    br="$6"
                  >
                    <IconComponent size={20} color="$legacyAccentGold" />
                  </YStack>
                  
                  <YStack f={1} space="$1">
                    <Text color="$legacyTextPrimary" fontSize="$5" fontWeight="600">
                      {feature.title}
                    </Text>
                    <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                      {feature.description}
                    </Text>
                  </YStack>

                  <StatusIcon 
                    size={20} 
                    color={getStatusColor(feature.status)} 
                  />
                </XStack>
              </Card>
            );
          })}

          {/* Settings */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            {t('screens.protection.controls')}
          </H2>

          <Card p="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4">
            <YStack space="$4">
              <XStack ai="center" jc="space-between">
                <YStack f={1}>
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    {t('screens.protection.labels.alerts')}
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    {t('screens.protection.labels.alertsDesc')}
                  </Text>
                </YStack>
                <Switch
                  size="$3"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>

              <XStack ai="center" jc="space-between">
                <YStack f={1}>
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    {t('screens.protection.labels.preservation')}
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    {t('screens.protection.labels.preservationDesc')}
                  </Text>
                </YStack>
                <Switch
                  size="$3"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>

              <XStack ai="center" jc="space-between">
                <YStack f={1}>
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    {t('screens.protection.labels.vaultLock')}
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    {t('screens.protection.labels.vaultLockDesc')}
                  </Text>
                </YStack>
                <Switch
                  size="$3"
                  checked={biometricLock}
                  onCheckedChange={setBiometricLock}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>
            </YStack>
          </Card>

          {/* Quick Actions */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            {t('screens.protection.controls')}
          </H2>

          <YStack space="$3">
            <Button size="$4" backgroundColor="$legacyAccentGold" borderRadius="$3">
              <XStack ai="center" space="$2">
                <Users size={16} color="$legacyBackgroundPrimary" />
                <Text color="$legacyBackgroundPrimary" fontWeight="600">{t('screens.protection.actions.manageFamilyCircle')}</Text>
              </XStack>
            </Button>

            <Button size="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={1} borderRadius="$3">
              <XStack ai="center" space="$2">
                <Shield size={16} color="$legacyAccentGold" />
                <Text color="$legacyTextPrimary" fontWeight="600">{t('screens.protection.actions.viewProtectionReport')}</Text>
              </XStack>
            </Button>

            <Button size="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={1} borderRadius="$3">
              <XStack ai="center" space="$2">
                <Lock size={16} color="$legacyAccentGold" />
                <Text color="$legacyTextPrimary" fontWeight="600">{t('screens.protection.actions.updateGuardianKey')}</Text>
              </XStack>
            </Button>
          </YStack>

          {/* Guardian Wisdom */}
          <Card
            p="$4"
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$4"
          >
            <XStack ai="center" space="$3">
              <Shield size={24} color="$legacyAccentGold" />
              <YStack f={1}>
                <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="700">
                  {t('screens.protection.wisdom.title')}
                </Text>
                <Text color="$legacyTextSecondary" fontSize="$3" textAlign="center" lineHeight={18}>
                  {t('screens.protection.wisdom.tip')}
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}