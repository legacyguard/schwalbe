// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Camera, Home, Shield, User } from 'lucide-react-native';
import { Spinner, useTheme, YStack } from '@legacyguard/ui';
import { useTranslation } from 'react-i18next';

// Dynamic imports with React.lazy() for better performance
const DashboardScreenV2 = React.lazy(() =>
  import('@/screens/main/DashboardScreenV2').then(module => ({
    default: module.DashboardScreenV2,
  }))
);
const VaultScreenV2 = React.lazy(() =>
  import('@/screens/main/VaultScreenV2').then(module => ({
    default: module.VaultScreenV2,
  }))
);
const ScannerScreen = React.lazy(() =>
  import('@/screens/main/ScannerScreen').then(module => ({
    default: module.ScannerScreen,
  }))
);
const ProfileScreen = React.lazy(() =>
  import('@/screens/main/ProfileScreen').then(module => ({
    default: module.ProfileScreen,
  }))
);

const Tab = createBottomTabNavigator();

// Loading fallback component
const LoadingFallback = () => (
  <YStack
    flex={1}
    justifyContent='center'
    alignItems='center'
    backgroundColor='$background'
  >
    <Spinner size='large' color='$blue9' />
  </YStack>
);

// Higher-order component to wrap screens with Suspense
const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  const SuspenseWrapper = (props: P) => (
    <React.Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </React.Suspense>
  );
  SuspenseWrapper.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return SuspenseWrapper;
};

export const MainTabs = () => {
  const theme = useTheme();
  const { t } = useTranslation('mobile.native.screens');

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primaryBlue.val,
        tabBarInactiveTintColor: theme.gray5.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: theme.shadowColor.val,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter',
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          shadowColor: theme.shadowColor.val,
        },
        headerTintColor: theme.color.val,
        headerTitleStyle: {
          fontFamily: 'Inter',
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name='Dashboard'
        component={withSuspense(DashboardScreenV2)}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: t('navigation.tabs.dashboard'),
        }}
      />
      <Tab.Screen
        name='Scan'
        component={withSuspense(ScannerScreen)}
        options={{
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
          tabBarLabel: t('navigation.tabs.scan'),
          headerShown: false, // Hide header for full-screen scanner
        }}
      />
      <Tab.Screen
        name='Vault'
        component={withSuspense(VaultScreenV2)}
        options={{
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
          tabBarLabel: t('navigation.tabs.vault'),
        }}
      />
      <Tab.Screen
        name='Profile'
        component={withSuspense(ProfileScreen)}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarLabel: t('navigation.tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
};
