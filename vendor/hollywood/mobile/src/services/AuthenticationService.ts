// src/services/AuthenticationService.ts
/* global __DEV__ */

import * as SecureStore from 'expo-secure-store';
// import { useSignIn, useSignUp, useAuth as useClerkAuth } from '@clerk/clerk-expo';

// Key under which we store the token in secure storage
const KEYCHAIN_TOKEN_KEY = 'legacyguard_clerk_token';

// Note: This is a simplified version that will need to be used with Clerk hooks
// For now, we'll provide a mock implementation

export const AuthenticationService = {
  // Initialize on app startup
  initialize: async () => {
    // Initialization happens in ClerkProvider
    if (__DEV__) console.log('AuthenticationService initialized');
  },

  // Login with email and password
  // Note: In real usage, this should be called from a component that has access to Clerk hooks
  loginWithEmail: async (email: string, password: string) => {
    // This is a placeholder - actual implementation needs to use useSignIn hook
    if (__DEV__) console.log('Login attempt with:', email);
    // Password will be used in actual implementation
    if (!password) throw new Error('Password is required');
    throw new Error(
      'Please use Clerk SignIn components or hooks directly for authentication'
    );
  },

  // Login with biometrics
  loginWithBiometrics: async () => {
    const token = await SecureStore.getItemAsync(KEYCHAIN_TOKEN_KEY);
    if (token) {
      // In real implementation, this would restore the session
      return { user: null };
    }
    throw new Error('No stored session token found.');
  },

  // Logout
  logout: async () => {
    // This should be called from a component with access to useClerkAuth hook
    await SecureStore.deleteItemAsync(KEYCHAIN_TOKEN_KEY);
    if (__DEV__)
      console.log('Logout called - use Clerk hooks for actual logout');
  },

  // Get current user
  getCurrentUser: () => {
    // This needs to be called from a component with useUser hook
    return null;
  },

  // Get JWT token for Supabase
  getSupabaseToken: async () => {
    // This needs to be called from a component with useAuth hook
    return null;
  },

  // Store token for biometric login
  storeToken: async (token: string) => {
    await SecureStore.setItemAsync(KEYCHAIN_TOKEN_KEY, token);
  },
};
