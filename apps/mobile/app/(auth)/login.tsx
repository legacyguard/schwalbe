import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack, H1, Text, Button, Input, Spinner } from 'tamagui';
import { Mail, Lock, Eye, EyeOff } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(['auth', 'common']);
  
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.errors.missingCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert(t('common.error'), t('auth.errors.invalidCredentials'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.errors.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
        <YStack alignItems="center" space="$2" marginBottom="$8">
          <H1 color="white" textAlign="center">
            LegacyGuard
          </H1>
          <Text color="$gray10" textAlign="center" fontSize="$5">
            {t('auth.subtitle')}
          </Text>
        </YStack>

        <YStack width="100%" maxWidth={400} space="$4">
          <YStack space="$2">
            <Text color="white" fontSize="$4" fontWeight="500">
              {t('auth.email')}
            </Text>
            <XStack alignItems="center" backgroundColor="$gray8" borderRadius="$4" padding="$3">
              <Mail size={20} color="$gray10" />
              <Input
                flex={1}
                marginLeft="$3"
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor="$gray10"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                backgroundColor="transparent"
                borderWidth={0}
                color="white"
              />
            </XStack>
          </YStack>

          <YStack space="$2">
            <Text color="white" fontSize="$4" fontWeight="500">
              {t('auth.password')}
            </Text>
            <XStack alignItems="center" backgroundColor="$gray8" borderRadius="$4" padding="$3">
              <Lock size={20} color="$gray10" />
              <Input
                flex={1}
                marginLeft="$3"
                marginRight="$3"
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor="$gray10"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                backgroundColor="transparent"
                borderWidth={0}
                color="white"
              />
              <Button
                size="$3"
                chromeless
                onPress={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? (
                  <EyeOff size={20} color="$gray10" />
                ) : (
                  <Eye size={20} color="$gray10" />
                )}
              </Button>
            </XStack>
          </YStack>

          <Button
            size="$5"
            theme="blue"
            onPress={handleLogin}
            disabled={isLoading}
            marginTop="$4"
          >
            {isLoading ? (
              <XStack alignItems="center" space="$2">
                <Spinner size="small" color="white" />
                <Text color="white">{t('auth.signingIn')}</Text>
              </XStack>
            ) : (
              <Text color="white" fontWeight="600">
                {t('auth.signIn')}
              </Text>
            )}
          </Button>
        </YStack>

        <Text color="$gray10" fontSize="$3" textAlign="center" marginTop="$6">
          {t('auth.biometricSupport')}
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
