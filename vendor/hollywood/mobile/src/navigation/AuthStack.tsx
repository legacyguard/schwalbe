import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Spinner, YStack } from '@legacyguard/ui';

// Dynamic imports with React.lazy() for better performance
const WelcomeScreen = React.lazy(() =>
  import('@/screens/auth/WelcomeScreen').then(module => ({
    default: module.WelcomeScreen,
  }))
);
const LoginScreen = React.lazy(() =>
  import('@/screens/auth/LoginScreen').then(module => ({
    default: module.LoginScreen,
  }))
);
const SignInScreen = React.lazy(() =>
  import('@/screens/auth/SignInScreen').then(module => ({
    default: module.SignInScreen,
  }))
);

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

const Stack = createNativeStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name='Welcome' component={withSuspense(WelcomeScreen)} />
    <Stack.Screen name='Login' component={withSuspense(LoginScreen)} />
    <Stack.Screen name='SignIn' component={withSuspense(SignInScreen)} />
  </Stack.Navigator>
);
