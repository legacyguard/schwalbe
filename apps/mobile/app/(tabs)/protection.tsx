import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Paragraph as Text, Button, Card, Switch, Progress } from 'tamagui';
import { Shield, CheckCircle, AlertTriangle, Settings, Users, Lock, Smartphone } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProtectionScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const protectionFeatures = [
    {
      title: 'Document Encryption',
      description: 'All documents are encrypted with AES-256',
      status: 'active',
      icon: Lock,
    },
    {
      title: 'Family Access Control',
      description: '4 family members with managed permissions',
      status: 'active',
      icon: Users,
    },
    {
      title: 'Automatic Backup',
      description: 'Daily backups to secure cloud storage',
      status: 'active',
      icon: Shield,
    },
    {
      title: 'Mobile Security',
      description: 'App lock and biometric authentication',
      status: 'partial',
      icon: Smartphone,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '$green10';
      case 'partial': return '$orange10';
      case 'inactive': return '$red10';
      default: return '$gray10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'partial': return AlertTriangle;
      case 'inactive': return AlertTriangle;
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
              Family Shield 🚪️
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
                  Guardian Shield Active ✨
                </Text>
                <Text color="$legacyAccentGoldLight" fontSize="$4" fontWeight="500">
                  Your family's fortress stands strong and unbreakable
                </Text>
              </YStack>
            </XStack>
            <Progress value={85} backgroundColor="$legacyBackgroundSecondary" mb="$2" borderRadius="$2">
              <Progress.Indicator backgroundColor="$legacyAccentGold" />
            </Progress>
            <Text color="$legacyAccentGoldLight" fontSize="$3" fontWeight="500">
              85% fortress completion - your vigilance protects those you love
            </Text>
          </Card>

          {/* Protection Features */}
          <H2 color="$legacyTextPrimary" fontSize="$emotionalMedium" fontWeight="600">
            Protection Arsenal 🏰
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
            Guardian Controls ⚙️
          </H2>

          <Card p="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={0.5} borderRadius="$4">
            <YStack space="$4">
              <XStack ai="center" jc="space-between">
                <YStack f={1}>
                  <Text color="$legacyTextPrimary" fontSize="$4" fontWeight="600">
                    Guardian Alerts
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    Stay informed when your family's protection needs attention
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
                    Legacy Preservation
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    Daily safeguarding of your family's precious memories
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
                    Personal Vault Lock
                  </Text>
                  <Text color="$legacyTextMuted" fontSize="$3" fontWeight="500">
                    Your touch becomes the key to your family's treasures
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
            Guardian Duties 🛡️
          </H2>

          <YStack space="$3">
            <Button size="$4" backgroundColor="$legacyAccentGold" borderRadius="$3">
              <XStack ai="center" space="$2">
                <Users size={16} color="$legacyBackgroundPrimary" />
                <Text color="$legacyBackgroundPrimary" fontWeight="600">Manage Family Circle</Text>
              </XStack>
            </Button>

            <Button size="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={1} borderRadius="$3">
              <XStack ai="center" space="$2">
                <Shield size={16} color="$legacyAccentGold" />
                <Text color="$legacyTextPrimary" fontWeight="600">View Protection Report</Text>
              </XStack>
            </Button>

            <Button size="$4" backgroundColor="$legacyBackgroundSecondary" borderColor="$legacyAccentGold" borderWidth={1} borderRadius="$3">
              <XStack ai="center" space="$2">
                <Lock size={16} color="$legacyAccentGold" />
                <Text color="$legacyTextPrimary" fontWeight="600">Update Guardian Key</Text>
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
                  Guardian's Wisdom 🌟
                </Text>
                <Text color="$legacyTextSecondary" fontSize="$3" fontWeight="500">
                  Your fingerprint becomes a sacred key - enable biometric lock to ensure only you can access your family's most precious treasures.
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}