
/**
 * Encryption Hook for LegacyGuard
 * Handles client-side encryption of sensitive data
 */

import { useCallback, useEffect, useState } from 'react';
import { secureStorage } from '@/lib/security/secure-storage';
import { nanoid } from 'nanoid';

interface EncryptionState {
  hasKey: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isLocked: boolean;
  needsMigration: boolean;
  passwordPromptVisible: boolean;
}

interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
}

export function useEncryption() {
  const [state, setState] = useState<EncryptionState>({
    isInitialized: false,
    isLocked: true,
    hasKey: false,
    isLoading: false,
    passwordPromptVisible: false,
    needsMigration: false,
  });

  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  // Initialize encryption on mount
  useEffect(() => {
    checkEncryptionStatus();
  }, []);

  const checkEncryptionStatus = async () => {
    try {
      const storedKey = await secureStorage.getMemory('encryption_key');
      if (storedKey) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLocked: false,
          hasKey: true,
        }));
        setEncryptionKey(storedKey as CryptoKey);
      } else {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLocked: true,
          hasKey: false,
        }));
      }
    } catch (_error) {
      console.error('Error checking encryption status: ', error);
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLocked: true,
        hasKey: false,
      }));
    }
  };

  const generateKey = async (password: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  };

  const initializeEncryption = useCallback(async (password: string) => {
    try {
      const key = await generateKey(password);
      setEncryptionKey(key);
      secureStorage.setMemory('encryption_key', key, 30 * 60 * 1000); // 30 minutes

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLocked: false,
        hasKey: true,
      }));

      return true;
    } catch (_error) {
      console.error('Error initializing encryption:', error);
      return false;
    }
  }, []);

  const initializeKeys = useCallback(
    async (password: string) => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const success = await initializeEncryption(password);
        setState(prev => ({ ...prev, isLoading: false }));
        return success;
      } catch (_error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    [initializeEncryption]
  );

  const lockEncryption = useCallback(() => {
    setEncryptionKey(null);
    secureStorage.remove('encryption_key');
    setState(prev => ({
      ...prev,
      isLocked: true,
    }));
  }, []);

  const encryptData = useCallback(
    async (data: ArrayBuffer | string): Promise<EncryptionResult | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not available');
        return null;
      }

      try {
        const encoder = new TextEncoder();
        const dataBuffer =
          typeof data === 'string' ? encoder.encode(data) : data;

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));

        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          encryptionKey,
          dataBuffer
        );

        return {
          encrypted: btoa(
            String.fromCharCode(...new Uint8Array(encrypted as ArrayBuffer))
          ),
          iv: btoa(String.fromCharCode(...iv)),
          salt: btoa(String.fromCharCode(...salt)),
        };
      } catch (_error) {
        console.error('Encryption error:', error);
        return null;
      }
    },
    [encryptionKey]
  );

  const decryptData = useCallback(
    async (
      encryptedData: string,
      iv: string,
      _salt?: string
    ): Promise<ArrayBuffer | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not available');
        return null;
      }

      try {
        const encryptedBuffer = Uint8Array.from(atob(encryptedData), c =>
          c.charCodeAt(0)
        );
        const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ivBuffer },
          encryptionKey,
          encryptedBuffer
        );

        return decrypted;
      } catch (_error) {
        console.error('Decryption error:', error);
        return null;
      }
    },
    [encryptionKey]
  );

  const encryptFile = useCallback(
    async (
      file: File
    ): Promise<null | {
      encryptedFile: Blob;
      metadata: EncryptionResult;
    }> => {
      if (!encryptionKey) {
        console.error('Encryption key not available');
        return null;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const encryptionResult = await encryptData(arrayBuffer);

        if (!encryptionResult) {
          throw new Error('Failed to encrypt file');
        }

        const encryptedBlob = new Blob([atob(encryptionResult.encrypted)], {
          type: 'application/octet-stream',
        });

        return {
          encryptedFile: encryptedBlob,
          metadata: encryptionResult,
        };
      } catch (_error) {
        console.error('File encryption error:', error);
        return null;
      }
    },
    [encryptionKey, encryptData]
  );

  const generateSecureToken = useCallback(() => {
    return nanoid(32);
  }, []);

  const hashPassword = useCallback(
    async (password: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer as ArrayBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    []
  );

  const decryptFile = useCallback(
    async (
      encryptedFile: Blob,
      iv: string,
      salt?: string
    ): Promise<File | null> => {
      try {
        const arrayBuffer = await encryptedFile.arrayBuffer();
        const encryptedData = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer as ArrayBuffer))
        );
        const decrypted = await decryptData(encryptedData, iv, salt);

        if (!decrypted) return null;

        return new File([decrypted], 'decrypted-file', {
          type: 'application/octet-stream',
        });
      } catch (_error) {
        console.error('File decryption error:', error);
        return null;
      }
    },
    [decryptData]
  );

  const generateSecurePassword = useCallback(() => {
    return generateSecureToken();
  }, [generateSecureToken]);

  const showPasswordPrompt = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, passwordPromptVisible: true }));
    // This would typically show a modal or prompt for the password
    // For now, use browser prompt as placeholder
    const password = prompt('Enter encryption password:');
    if (password) {
      return initializeEncryption(password);
    }
    return false;
  }, [initializeEncryption]);

  const hidePasswordPrompt = useCallback(() => {
    setState(prev => ({ ...prev, passwordPromptVisible: false }));
  }, []);

  const unlockKeys = useCallback(
    async (password: string): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const success = await initializeEncryption(password);
        setState(prev => ({ ...prev, isLoading: false }));
        return success;
      } catch (_error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    [initializeEncryption]
  );

  const migrateKeys = useCallback(
    async (password: string): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        // Migrate keys with new password
        const success = await initializeEncryption(password);
        if (success) {
          // Placeholder for actual migration logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          setState(prev => ({
            ...prev,
            needsMigration: false,
            isLoading: false,
          }));
        }
        return success;
      } catch (_error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    },
    [initializeEncryption]
  );

  return {
    // State
    isInitialized: state.isInitialized,
    isLocked: state.isLocked,
    hasKey: state.hasKey,
    isUnlocked: !state.isLocked && state.hasKey,
    isLoading: state.isLoading,
    passwordPromptVisible: state.passwordPromptVisible,
    needsMigration: state.needsMigration,

    // Methods
    initializeEncryption,
    initializeKeys,
    lockEncryption,
    encryptData,
    decryptData,
    encryptFile,
    decryptFile,
    generateSecureToken,
    generateSecurePassword,
    hashPassword,
    checkEncryptionStatus,
    showPasswordPrompt,
    hidePasswordPrompt,
    unlockKeys,
    migrateKeys,
  };
}

// Export for provider pattern if needed
export { EncryptionProvider } from './encryption/EncryptionProvider';
