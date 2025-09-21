import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@schwalbe/shared';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4' />
          <p className='text-muted-foreground'>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/auth/signin' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;