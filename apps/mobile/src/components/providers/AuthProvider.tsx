import { useEffect } from 'react';
import { View } from 'react-native';
import { YStack, Spinner, Text } from 'tamagui';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <YStack
    flex={1}
    justifyContent="center"
    alignItems="center"
    backgroundColor="$legacyBackgroundPrimary"
    space="$4"
  >
    <Spinner size="large" color="$legacyAccentGold" />
    <Text color="$legacyTextSecondary" fontSize="$4" fontWeight="500">
      Initializing your secure session...
    </Text>
  </YStack>
);

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        if (isMounted) {
          console.error('Auth initialization failed');
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [initialize]);

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}