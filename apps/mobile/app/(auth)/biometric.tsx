import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack, H1, Text, Button } from 'tamagui';
import { Fingerprint, ArrowLeft } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

import { useAuthStore } from '@/stores/authStore';

export default function BiometricScreen() {
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { signIn } = useAuthStore();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    setIsSupported(compatible && enrolled);
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType('Fingerprint');
    } else {
      setBiometricType('Biometric');
    }
  };

  const handleBiometricAuth = async () => {
    if (!isSupported) {
      Alert.alert('Error', 'Biometric authentication is not available on this device');
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to LegacyGuard',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password instead',
      });

      if (result.success) {
        // In a real app, you'd retrieve stored credentials or tokens
        // For this demo, we'll simulate successful authentication
        router.replace('/(tabs)/home');
      } else {
        if (result.error === 'user_cancel' || result.error === 'user_fallback') {
          router.back();
        } else {
          Alert.alert('Authentication Failed', 'Please try again or use your password');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <YStack f={1} p="$4">
        <XStack ai="center" mb="$6">
          <Button
            size="$4"
            chromeless
            onPress={() => router.back()}
            mr="$3"
          >
            <ArrowLeft size={24} color="white" />
          </Button>
          <Text color="white" size="$6" fontWeight="600">
            Biometric Sign In
          </Text>
        </XStack>

        <YStack f={1} ai="center" jc="center" space="$6">
          <YStack ai="center" space="$4">
            <YStack 
              w={120} 
              h={120} 
              ai="center" 
              jc="center" 
              bc="$gray8" 
              br="$10"
            >
              <Fingerprint size={60} color="$blue10" />
            </YStack>

            <YStack ai="center" space="$2">
              <H1 color="white" ta="center" size="$8">
                {biometricType} Sign In
              </H1>
              <Text color="$gray10" ta="center" size="$5" mw={300}>
                Use your {biometricType.toLowerCase()} to securely access your account
              </Text>
            </YStack>
          </YStack>

          {isSupported ? (
            <Button
              size="$5"
              theme="blue"
              onPress={handleBiometricAuth}
              disabled={isAuthenticating}
              w="100%"
              mw={300}
            >
              <XStack ai="center" space="$2">
                <Fingerprint size={20} color="white" />
                <Text color="white" fontWeight="600">
                  {isAuthenticating ? 'Authenticating...' : `Use ${biometricType}`}
                </Text>
              </XStack>
            </Button>
          ) : (
            <YStack ai="center" space="$3">
              <Text color="$orange10" ta="center" size="$4">
                Biometric authentication is not available
              </Text>
              <Button
                size="$4"
                theme="gray"
                onPress={() => router.back()}
              >
                <Text color="white">Use Password Instead</Text>
              </Button>
            </YStack>
          )}

          <Text color="$gray11" ta="center" size="$3" mt="$6">
            Your biometric data is stored securely on your device
          </Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}