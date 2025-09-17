import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, H1, H2, Text, Button, Card, Switch, Progress } from '@tamagui/core';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack p="$4" space="$4">
          {/* Header */}
          <XStack ai="center" jc="space-between">
            <H1 color="white" size="$8">
              Protection
            </H1>
            <Button size="$4" chromeless>
              <Settings size={24} color="white" />
            </Button>
          </XStack>

          {/* Protection Status */}
          <Card p="$4" bc="$green8">
            <XStack ai="center" space="$3" mb="$3">
              <Shield size={32} color="$green10" />
              <YStack f={1}>
                <Text color="white" size="$6" fontWeight="600">
                  Protection Active
                </Text>
                <Text color="$green11" size="$4">
                  Your family legacy is secure
                </Text>
              </YStack>
            </XStack>
            <Progress value={85} bc="$green7" mb="$2">
              <Progress.Indicator bc="$green10" />
            </Progress>
            <Text color="$green11" size="$3">
              85% protection coverage
            </Text>
          </Card>

          {/* Protection Features */}
          <H2 color="white" size="$6">
            Security Features
          </H2>
          
          {protectionFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const StatusIcon = getStatusIcon(feature.status);
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
                    <IconComponent size={20} color="white" />
                  </YStack>
                  
                  <YStack f={1} space="$1">
                    <Text color="white" size="$5" fontWeight="600">
                      {feature.title}
                    </Text>
                    <Text color="$gray10" size="$3">
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
          <H2 color="white" size="$6">
            Security Settings
          </H2>

          <Card p="$4" bc="$gray8">
            <YStack space="$4">
              <XStack ai="center" jc="space-between">
                <YStack f={1}>
                  <Text color="white" size="$4" fontWeight="500">
                    Push Notifications
                  </Text>
                  <Text color="$gray10" size="$3">
                    Get notified about security events
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
                  <Text color="white" size="$4" fontWeight="500">
                    Automatic Backup
                  </Text>
                  <Text color="$gray10" size="$3">
                    Daily backup of all documents
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
                  <Text color="white" size="$4" fontWeight="500">
                    Biometric App Lock
                  </Text>
                  <Text color="$gray10" size="$3">
                    Require biometric to open app
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
          <H2 color="white" size="$6">
            Security Actions
          </H2>

          <YStack space="$3">
            <Button size="$4" theme="blue">
              <XStack ai="center" space="$2">
                <Users size={16} color="white" />
                <Text color="white">Manage Family Access</Text>
              </XStack>
            </Button>

            <Button size="$4" theme="gray">
              <XStack ai="center" space="$2">
                <Shield size={16} color="white" />
                <Text color="white">View Security Report</Text>
              </XStack>
            </Button>

            <Button size="$4" theme="gray">
              <XStack ai="center" space="$2">
                <Lock size={16} color="white" />
                <Text color="white">Update Master Password</Text>
              </XStack>
            </Button>
          </YStack>

          {/* Security Tip */}
          <Card p="$4" bc="$blue8">
            <XStack ai="center" space="$3">
              <Shield size={24} color="$blue10" />
              <YStack f={1}>
                <Text color="white" size="$4" fontWeight="600">
                  Security Tip
                </Text>
                <Text color="$blue11" size="$3">
                  Enable biometric app lock for an extra layer of security when accessing your sensitive documents.
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}