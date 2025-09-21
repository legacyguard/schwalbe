// src/contexts/AuthProvider.tsx

import React, { type ReactNode } from 'react';
import { AuthenticationService } from '@/services/AuthenticationService';
import { useUser } from '@clerk/clerk-expo'; // Use Clerk's hook to track state
import { AuthContext, type AuthContextType } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSignedIn, isLoaded } = useUser();

  const logout = async () => {
    await AuthenticationService.logout();
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!isSignedIn,
    isLoading: !isLoaded,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
