import React, { useState, useEffect } from 'react';
import { Alert, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Fingerprint, ArrowLeft } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/authStore';

export default function BiometricScreen() {
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { t } = useTranslation(['auth', 'common']);
  
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
      setBiometricType(t('auth.faceId'));
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType(t('auth.fingerprint'));
    } else {
      setBiometricType(t('auth.biometric'));
    }
  };

  const handleBiometricAuth = async () => {
    if (!isSupported) {
      Alert.alert(t('common.error'), t('auth.errors.biometricUnavailable'));
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.biometricPrompt'),
        cancelLabel: t('common.cancel'),
        fallbackLabel: t('auth.usePassword'),
      });

      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        if (result.error === 'user_cancel' || result.error === 'user_fallback') {
          router.back();
        } else {
          Alert.alert(t('auth.errors.authFailedTitle'), t('auth.errors.authFailed'));
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.errors.biometricFailed'));
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
            {t('auth.biometricTitle')}
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Fingerprint size={60} color="#3b82f6" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {biometricType} {t('auth.signIn')}
              </Text>
              <Text style={styles.subtitle}>
                {t('auth.biometricSubtitle', { method: biometricType.toLowerCase() })}
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
                  {isAuthenticating ? t('auth.authenticating') : `${t('auth.use')} ${biometricType}`}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t('auth.errors.biometricUnavailable')}
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>{t('auth.usePassword')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footerText}>
            {t('auth.biometricFooter')}
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