import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { Spinner, useTheme, YStack } from '@legacyguard/ui';

// Dynamic imports with React.lazy() for better performance
const DocumentsScreen = React.lazy(() =>
  import('@/screens/main/DocumentsScreen').then(module => ({
    default: module.DocumentsScreen,
  }))
);
const PeopleScreen = React.lazy(() =>
  import('@/screens/main/PeopleScreen').then(module => ({
    default: module.PeopleScreen,
  }))
);
const WillScreen = React.lazy(() =>
  import('@/screens/main/WillScreen').then(module => ({
    default: module.WillScreen,
  }))
);

const Stack = createNativeStackNavigator();

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

export const MainStack = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color.val,
        headerTitleStyle: {
          fontFamily: 'Inter',
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name='MainTabs'
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Documents'
        component={withSuspense(DocumentsScreen)}
        options={{ title: 'Documents' }}
      />
      <Stack.Screen
        name='People'
        component={withSuspense(PeopleScreen)}
        options={{ title: 'Trusted Circle' }}
      />
      <Stack.Screen
        name='Will'
        component={withSuspense(WillScreen)}
        options={{ title: 'Will Generator' }}
      />
    </Stack.Navigator>
  );
};
