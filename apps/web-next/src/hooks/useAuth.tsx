'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService, onAuthStateChange } from '@/lib/auth/supabase-auth';
import { useRouter } from 'next/navigation';
import { logger } from '@schwalbe/shared/lib/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        logger.error('Failed to initialize auth', { metadata: { error } });
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn({ email, password });
    
    if (result.user) {
      setUser(result.user);
      router.push('/dashboard');
    }
    
    setLoading(false);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    const result = await authService.signUp({ email, password, name });
    
    if (result.user) {
      setUser(result.user);
      router.push('/onboarding');
    }
    
    setLoading(false);
    return { error: result.error };
  };

  const signOut = async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    router.push('/');
    setLoading(false);
  };

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates);
    
    if (result.user) {
      setUser(result.user);
    }
    
    return { error: result.error };
  };

  const sendPasswordReset = async (email: string) => {
    return authService.sendPasswordResetEmail(email);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      sendPasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    allowedRoles?: string[];
  }
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push(options?.redirectTo || '/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}