
import { useEffect } from 'react';
import { useEncryptionContext } from './EncryptionProvider';

// Re-export the hook from the provider for convenience
export function useEncryption() {
  return useEncryptionContext();
}

// Hook for automatic encryption unlock on certain pages
export function useAutoUnlock() {
  const { isUnlocked, unlockKeys } = useEncryption();

  useEffect(() => {
    // Auto-unlock logic can be implemented here
    // For now, just a placeholder
  }, [isUnlocked, unlockKeys]);

  return { isUnlocked, unlockKeys };
}

// Hook for checking if encryption is ready
export function useEncryptionReady() {
  const { isInitialized, isLoading } = useEncryption();
  return {
    isReady: isInitialized && !isLoading,
    needsSetup: !isInitialized && !isLoading,
    isLoading,
  };
}
