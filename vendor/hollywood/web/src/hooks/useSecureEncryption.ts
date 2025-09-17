
/**
 * Secure Encryption Hook for LegacyGuard
 * Replaces localStorage-based key storage with secure WebCrypto + IndexedDB
 */

import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  getSecureKeyManager,
  initializeSecureKeys,
  type KeyPurpose,
  SecureKeyError,
} from '@/lib/encryption/secure-key-manager';
import { toast } from 'sonner';

interface SecureEncryptionState {
  error: null | string;
  isInitialized: boolean;
  isLoading: boolean;
  isUnlocked: boolean;
}

interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  version: string;
}

// @ts-ignore - Unused interface
interface _FileEncryptionResult {
  encryptedData: ArrayBuffer;
  encryptedFileKey: ArrayBuffer;
  iv: Uint8Array;
  keyId: string;
  keyIv: Uint8Array;
  version: string;
}

export const useSecureEncryption = () => {
  const { user } = useUser();
  const [state, setState] = useState<SecureEncryptionState>({
    isInitialized: false,
    isUnlocked: false,
    isLoading: false,
    error: null,
  });

  const keyManager = getSecureKeyManager();

  /**
   * Initialize encryption system for current user
   */
  const initialize = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await initializeSecureKeys(user.id);
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));

      // console.log('🔐 Secure encryption initialized');
      return true;
    } catch (_error) {
      const errorMessage =
        error instanceof SecureKeyError
          ? error.message
          : 'Failed to initialize encryption system';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Encryption initialization failed');
      return false;
    }
  }, [user?.id]);

  /**
   * Create new encryption keys for first-time users
   */
  const createKeys = useCallback(
    async (password: string): Promise<boolean> => {
      if (!state.isInitialized) {
        setState(prev => ({
          ...prev,
          error: 'Encryption system not initialized',
        }));
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await keyManager.createUserKeys(password);
        setState(prev => ({
          ...prev,
          isUnlocked: true,
          isLoading: false,
        }));

        toast.success('Encryption keys created successfully', {
          description:
            'Your documents are now secured with end-to-end encryption',
        });

        return true;
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError
            ? error.message
            : 'Failed to create encryption keys';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast.error('Failed to create encryption keys');
        return false;
      }
    },
    [state.isInitialized, keyManager]
  );

  /**
   * Unlock existing encryption keys with password
   */
  const unlockKeys = useCallback(
    async (password: string): Promise<boolean> => {
      if (!state.isInitialized) {
        setState(prev => ({
          ...prev,
          error: 'Encryption system not initialized',
        }));
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const success = await keyManager.unlockKeys(password);

        if (success) {
          setState(prev => ({
            ...prev,
            isUnlocked: true,
            isLoading: false,
          }));

          toast.success('Keys unlocked successfully');
          return true;
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Invalid password',
          }));

          toast.error('Invalid password');
          return false;
        }
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError
            ? error.message
            : 'Failed to unlock keys';

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast.error('Failed to unlock encryption keys');
        return false;
      }
    },
    [state.isInitialized, keyManager]
  );

  /**
   * Lock encryption keys (remove from memory)
   */
  const lockKeys = useCallback(() => {
    keyManager.lockKeys();
    setState(prev => ({ ...prev, isUnlocked: false }));
    toast.info('Encryption keys locked for security');
  }, [keyManager]);

  /**
   * Encrypt data using master key
   */
  const encryptData = useCallback(
    async (data: ArrayBuffer | Uint8Array): Promise<EncryptionResult> => {
      if (!state.isUnlocked) {
        throw new SecureKeyError('Keys not unlocked', 'KEYS_LOCKED');
      }

      try {
        // Convert Uint8Array to ArrayBuffer if needed for BufferSource compatibility
        const bufferData =
          data instanceof Uint8Array
            ? (data.buffer.slice(
                data.byteOffset,
                data.byteOffset + data.byteLength
              ) as ArrayBuffer)
            : data instanceof SharedArrayBuffer
              ? new ArrayBuffer((data as any).byteLength)
              : (data as ArrayBuffer);
        return await keyManager.encryptData(bufferData);
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError ? error.message : 'Encryption failed';

        toast.error('Failed to encrypt data');
        throw new SecureKeyError(errorMessage, 'ENCRYPTION_FAILED');
      }
    },
    [state.isUnlocked, keyManager]
  );

  /**
   * Decrypt data using master key
   */
  const decryptData = useCallback(
    async (
      encryptedData: ArrayBuffer,
      iv: Uint8Array,
      _version?: string // @ts-ignore
    ): Promise<ArrayBuffer> => {
      if (!state.isUnlocked) {
        throw new SecureKeyError('Keys not unlocked', 'KEYS_LOCKED');
      }

      try {
        return await keyManager.decryptData(encryptedData, iv);
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError ? error.message : 'Decryption failed';

        toast.error('Failed to decrypt data');
        throw new SecureKeyError(errorMessage, 'DECRYPTION_FAILED');
      }
    },
    [state.isUnlocked, keyManager]
  );

  /**
   * Encrypt file with unique file key (compatible with DocumentUploader)
   */
  const encryptFile = useCallback(
    async (
      file: File
    ): Promise<{
      encryptedFile: Blob;
      metadata: {
        iv: string;
        mimeType: string;
        originalName: string;
        originalSize: number;
        timestamp: number;
        version: string;
      };
    }> => {
      if (!state.isUnlocked) {
        throw new SecureKeyError('Keys not unlocked', 'KEYS_LOCKED');
      }

      try {
        // Read file as ArrayBuffer
        const fileData = await file.arrayBuffer();

        // Encrypt the file data
        const encryptionResult = await keyManager.encryptData(fileData);

        // Create encrypted blob
        const encryptedFile = new Blob([encryptionResult.encryptedData], {
          type: 'application/octet-stream',
        });

        // Create metadata
        const metadata = {
          originalName: file.name,
          originalSize: file.size,
          mimeType: file.type,
          iv: Array.from(encryptionResult.iv).join(','), // Convert to string for storage
          version: encryptionResult.version,
          timestamp: Date.now(),
        };

        return {
          encryptedFile,
          metadata,
        };
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError
            ? error.message
            : 'File encryption failed';

        toast.error('Failed to encrypt file');
        throw new SecureKeyError(errorMessage, 'FILE_ENCRYPTION_FAILED');
      }
    },
    [state.isUnlocked, keyManager]
  );

  /**
   * Decrypt file data
   */
  const decryptFile = useCallback(
    async (
      encryptedBlob: Blob,
      ivString: string,
      _version?: string
    ): Promise<ArrayBuffer> => {
      if (!state.isUnlocked) {
        throw new SecureKeyError('Keys not unlocked', 'KEYS_LOCKED');
      }

      try {
        // Convert blob to ArrayBuffer
        const encryptedData = await encryptedBlob.arrayBuffer();

        // Convert IV string back to Uint8Array
        const iv = new Uint8Array(ivString.split(',').map(Number));

        // Decrypt the data
        return await keyManager.decryptData(encryptedData, iv);
      } catch (_error) {
        const errorMessage =
          error instanceof SecureKeyError
            ? error.message
            : 'File decryption failed';

        toast.error('Failed to decrypt file');
        throw new SecureKeyError(errorMessage, 'FILE_DECRYPTION_FAILED');
      }
    },
    [state.isUnlocked, keyManager]
  );

  /**
   * Change user password
   */
  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<boolean> => {
      if (!state.isInitialized) {
        setState(prev => ({
          ...prev,
          error: 'Encryption system not initialized',
        }));
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const success = await keyManager.changePassword(
          oldPassword,
          newPassword
        );

        setState(prev => ({ ...prev, isLoading: false }));

        if (success) {
          toast.success('Password changed successfully', {
            description: 'Your encryption keys have been re-secured',
          });
          return true;
        } else {
          toast.error('Failed to change password');
          return false;
        }
      } catch (_error) {
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Password change failed');
        return false;
      }
    },
    [state.isInitialized, keyManager]
  );

  /**
   * Check if first-time setup is needed
   */
  const needsSetup = useCallback(async (): Promise<boolean> => {
    if (!state.isInitialized) return false;

    try {
      // Try to unlock with empty password to see if keys exist
      const hasKeys = keyManager.isUnlocked();
      return !hasKeys;
    } catch {
      return true; // Assume setup needed if check fails
    }
  }, [state.isInitialized, keyManager]);

  // Initialize when user is available
  useEffect(() => {
    if (user?.id && !state.isInitialized) {
      initialize();
    }
  }, [user?.id, state.isInitialized, initialize]);

  // Auto-lock keys after inactivity (30 minutes)
  useEffect(() => {
    if (!state.isUnlocked) return;

    const timeout = setTimeout(
      () => {
        lockKeys();
      },
      30 * 60 * 1000
    ); // 30 minutes

    return () => clearTimeout(timeout);
  }, [state.isUnlocked, lockKeys]);

  return {
    // State
    ...state,

    // Actions
    initialize,
    createKeys,
    unlockKeys,
    lockKeys,
    changePassword,
    needsSetup,

    // Encryption operations
    encryptData,
    decryptData,
    encryptFile,
    decryptFile,

    // Utilities
    isReady: state.isInitialized && state.isUnlocked,
  };
};
