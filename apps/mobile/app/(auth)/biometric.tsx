import React, { useState, useEffect } from 'react';
import { Alert, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Biometric Sign In
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Fingerprint size={60} color="#3b82f6" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {biometricType} Sign In
              </Text>
              <Text style={styles.subtitle}>
                Use your {biometricType.toLowerCase()} to securely access your account
              </Text>
            </View>
          </View>

          {isSupported ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isAuthenticating && styles.disabledButton]}
              onPress={handleBiometricAuth}
              disabled={isAuthenticating}
            >
              <View style={styles.buttonContent}>
                <Fingerprint size={20} color="white" />
                <Text style={styles.buttonText}>
                  {isAuthenticating ? 'Authenticating...' : `Use ${biometricType}`}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Biometric authentication is not available
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Use Password Instead</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footerText}>
            Your biometric data is stored securely on your device
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 60,
    marginBottom: 16,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#f97316',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});