
import React from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingText?: string;
  setLoading: (loading: boolean, text?: string) => void;
}

// This context is defined in useLoading.tsx
declare const LoadingContext: React.Context<LoadingContextType>;

export const useLoading = () => React.useContext(LoadingContext);
