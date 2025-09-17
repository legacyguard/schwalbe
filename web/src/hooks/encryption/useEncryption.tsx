
'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from '@clerk/clerk-react';
import { encryptionService } from '../../lib/encryption-v2';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EncryptionContextType {
  checkKeyStatus: () => Promise<void>;
  decryptFile: (
    encryptedData: Uint8Array,
    nonce: Uint8Array
  ) => Promise<null | Uint8Array>;
  encryptFile: (file: File) => Promise<null | {
    encryptedData: Uint8Array;
    metadata: any;
    nonce: Uint8Array;
  }>;
  hidePasswordPrompt: () => void;
  initializeKeys: (password: string) => Promise<boolean>;
  isInitialized: boolean;
  isLoading: boolean;
  isUnlocked: boolean;
  lockKeys: () => Promise<void>;
  migrateKeys: (password: string) => Promise<boolean>;
  needsMigration: boolean;
  passwordPromptVisible: boolean;
  rotateKeys: (
    currentPassword: string,
    newPassword?: string
  ) => Promise<boolean>;
  showPasswordPrompt: () => void;
  unlockKeys: (password: string) => Promise<boolean>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(
  undefined
);

interface EncryptionProviderProps {
  children: ReactNode;
}

export function EncryptionProvider({ children }: EncryptionProviderProps) {
  const { t } = useTranslation('hooks/encryption');
  const { isSignedIn, userId } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [passwordPromptVisible, setPasswordPromptVisible] = useState(false);

  // Check key status on mount and auth change
  useEffect(() => {
    if (isSignedIn && userId) {
      checkKeyStatus();
    } else {
      setIsUnlocked(false);
      setIsInitialized(false);
      setIsLoading(false);
    }
  }, [isSignedIn, userId]);

  // Check if keys need rotation periodically
  useEffect(() => {
    if (isUnlocked) {
      const checkRotation = async () => {
        const needsRotation = await encryptionService.checkRotationNeeded();
        if (needsRotation) {
          toast.warning(
            'Your encryption keys are due for rotation. Please rotate them soon for security.'
          );
        }
    return undefined;
      };

      checkRotation();
      // Check every hour
      const interval = setInterval(checkRotation, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked]);

  const checkKeyStatus = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Check if keys are already unlocked in memory/session
      const unlocked = await encryptionService.areKeysUnlocked();
      setIsUnlocked(unlocked);

      // Check if keys exist on server
      const response = await fetch('/api/keys/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { hasKeys } = await response.json();
        setIsInitialized(hasKeys);
      } else if (response.status === 404) {
        setIsInitialized(false);
      }

      // Check for legacy keys in localStorage
      const legacyKeys = localStorage.getItem(`encryptionKeys_${userId}`);
      setNeedsMigration(!!legacyKeys && !isInitialized);
    } catch (error) {
      console.error('Failed to check key status: ', error);
      toast.error(' as constFailed to check encryption key status');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const initializeKeys = useCallback(
    async (password: string): Promise<boolean> => {
      if (!userId) {
        toast.error(t('errors.mustBeSignedIn', { action: t('actions.initializeEncryption') }));
        return false;
      }

      setIsLoading(true);
      try {
        const result = await encryptionService.initializeKeys(password);

        if (result.success) {
          setIsInitialized(true);
          setIsUnlocked(true);
          toast.success(t('success.keysInitialized'));
          return true;
        } else {
          toast.error(result.error || t('errors.initializationFailed'));
          return false;
        }
      } catch (error) {
        console.error('Key initialization error:', error);
        toast.error(t('errors.genericError', { action: 'initializing encryption' }));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const unlockKeys = useCallback(
    async (password: string): Promise<boolean> => {
      if (!userId) {
        toast.error(t('errors.mustBeSignedIn', { action: t('actions.unlockEncryption') }));
        return false;
      }

      setIsLoading(true);
      try {
        const result = await encryptionService.unlockKeys(password);

        if (result.success) {
          setIsUnlocked(true);
          toast.success(t('success.unlocked'));
          setPasswordPromptVisible(false);
          return true;
        } else {
          // Check if account is locked
          if (result.error?.includes('locked')) {
            toast.error('Too many failed attempts. Please try again later.');
          } else {
            toast.error(result.error || t('errors.incorrectPassword'));
          }
          return false;
        }
      } catch (error) {
        console.error('Key unlock error:', error);
        toast.error(t('errors.unlockFailed'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const lockKeys = useCallback(async () => {
    await encryptionService.lockKeys();
    setIsUnlocked(false);
    toast.info(t('success.locked'));
  }, []);

  const migrateKeys = useCallback(
    async (password: string): Promise<boolean> => {
      if (!userId) {
        toast.error(t('errors.mustBeSignedIn', { action: t('actions.migrateKeys') }));
        return false;
      }

      setIsLoading(true);
      try {
        const result =
          await encryptionService.migrateFromLocalStorage(password);

        if (result.success) {
          setIsInitialized(true);
          setIsUnlocked(true);
          setNeedsMigration(false);
          toast.success(t('success.keysMigrated'));
          return true;
        } else {
          toast.error(result.error || t('errors.migrationFailed'));
          return false;
        }
      } catch (error) {
        console.error('Key migration error:', error);
        toast.error(t('errors.genericError', { action: 'migrating encryption' }));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const rotateKeys = useCallback(
    async (currentPassword: string, newPassword?: string): Promise<boolean> => {
      if (!userId) {
        toast.error(t('errors.mustBeSignedIn', { action: t('actions.rotateKeys') }));
        return false;
      }

      setIsLoading(true);
      try {
        const result = await encryptionService.rotateKeys(
          currentPassword,
          newPassword
        );

        if (result.success) {
          toast.success(t('success.keysRotated'));
          return true;
        } else {
          toast.error(result.error || t('errors.rotationFailed'));
          return false;
        }
      } catch (error) {
        console.error('Key rotation error:', error);
        toast.error(t('errors.genericError', { action: 'rotating encryption keys' }));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const encryptFile = useCallback(
    async (file: File) => {
      if (!isUnlocked) {
        setPasswordPromptVisible(true);
        toast.info('Please unlock encryption to continue');
        return null;
      }

      try {
        // For now, use placeholder keys - in a real implementation, get from context
        const publicKey = 'placeholder-public-key';
        const secretKey = 'placeholder-secret-key';
        const result = await encryptionService.encryptFile(
          file,
          publicKey,
          secretKey
        );
        if (!result) {
          toast.error('Failed to encrypt file');
        }
        return result;
      } catch (error) {
        console.error('File encryption error:', error);
        toast.error('An error occurred while encrypting the file');
        return null;
      }
    },
    [isUnlocked]
  );

  const decryptFile = useCallback(
    async (encryptedData: Uint8Array, nonce: Uint8Array) => {
      if (!isUnlocked) {
        setPasswordPromptVisible(true);
        toast.info('Please unlock encryption to continue');
        return null;
      }

      try {
        // For now, use placeholder keys - in a real implementation, get from context
        const publicKey = 'placeholder-public-key';
        const secretKey = 'placeholder-secret-key';
        const result = await encryptionService.decryptFile(
          encryptedData,
          nonce,
          publicKey,
          secretKey
        );
        if (!result) {
          toast.error('Failed to decrypt file');
        }
        return result;
      } catch (error) {
        console.error('File decryption error:', error);
        toast.error('An error occurred while decrypting the file');
        return null;
      }
    },
    [isUnlocked]
  );

  const showPasswordPrompt = useCallback(() => {
    setPasswordPromptVisible(true);
  }, []);

  const hidePasswordPrompt = useCallback(() => {
    setPasswordPromptVisible(false);
  }, []);

  const value = {
    isUnlocked,
    isInitialized,
    isLoading,
    needsMigration,
    initializeKeys,
    unlockKeys,
    lockKeys,
    checkKeyStatus,
    migrateKeys,
    rotateKeys,
    encryptFile,
    decryptFile,
    showPasswordPrompt,
    hidePasswordPrompt,
    passwordPromptVisible,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

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
    return undefined;
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
