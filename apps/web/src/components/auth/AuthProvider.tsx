import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@schwalbe/shared';

interface AuthProviderProps {
  children: ReactNode;
}

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-slate-900">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-300 text-lg font-medium">
        Initializing your secure session...
      </p>
    </div>
  </div>
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
          console.error('Auth initialization failed:', error);
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