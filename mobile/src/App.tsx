// src/App.tsx

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthProvider';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ClerkProvider } from '@clerk/clerk-expo';
import { AuthenticationService } from '@/services/AuthenticationService';
import { TamaguiProvider } from '@/providers/TamaguiProvider';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { GlobalErrorBoundary } from '@legacyguard/ui';

// Helper for token management with Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (_err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (_err) {
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file. Authentication will not work.'
  );
}

export default function App() {
  useEffect(() => {
    // Initialize our service on app startup
    AuthenticationService.initialize();
  }, []);

  return (
    <GlobalErrorBoundary>
      <TamaguiProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={CLERK_PUBLISHABLE_KEY}
        >
          <AuthProvider>
            <StatusBar style='auto' />
            <AppNavigator />
          </AuthProvider>
        </ClerkProvider>
      </TamaguiProvider>
    </GlobalErrorBoundary>
  );
}
