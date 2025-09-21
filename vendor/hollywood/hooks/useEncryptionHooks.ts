import { useContext, useEffect } from 'react';

// This context is defined in useEncryption.tsx
declare const EncryptionContext: React.Context<any>;

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}

// Hook for automatic encryption unlock on certain pages
export function useAutoUnlock() {
  const { isInitialized, isUnlocked, showPasswordPrompt } = useEncryption();

  useEffect(() => {
    if (isInitialized && !isUnlocked) {
      // Show password prompt after a short delay
      const timer = setTimeout(() => {
        showPasswordPrompt();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, isUnlocked, showPasswordPrompt]);
}

// Hook for checking if encryption is ready
export function useEncryptionReady() {
  const { isInitialized, isUnlocked, isLoading } = useEncryption();
  return {
    isReady: isInitialized && isUnlocked && !isLoading,
    isLoading,
    needsSetup: !isInitialized && !isLoading,
    needsUnlock: isInitialized && !isUnlocked && !isLoading,
  };
}
