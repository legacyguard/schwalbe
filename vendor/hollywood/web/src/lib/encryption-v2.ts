
/**
 * Encryption Service V2 - LegacyGuard
 * Provides secure encryption/decryption functionality for the application
 */

import nacl from 'tweetnacl';
import {
  decodeBase64,
  decodeUTF8,
  encodeBase64,
  encodeUTF8,
} from 'tweetnacl-util';

// Import from the actual encryption service
import {
  arrayBufferToBase64,
  createEncryptedBlob,
  decryptFile,
  encryptFile,
  fileToBase64,
  generateEncryptionKeys,
  getUserEncryptionKeys,
} from './encryption';

// Create the encryption service v2 wrapper
export const encryptionServiceV2 = {
  // Key management
  generateKeys: generateEncryptionKeys,
  getUserKeys: getUserEncryptionKeys,

  // File operations
  encryptFile,
  decryptFile,
  createEncryptedBlob,
  fileToBase64,
  arrayBufferToBase64,

  // Storage operations
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const userId = 'current-user';
      const keys = getUserEncryptionKeys(userId);
      const message = decodeUTF8(value);
      const nonce = nacl.randomBytes(nacl.secretbox?.nonceLength);
      const keyBytes = decodeBase64(keys.secretKey).slice(0, 32);
      const encrypted = nacl.secretbox(message, nonce, keyBytes);
      const combined = new Uint8Array(nonce.length + encrypted.length);
      combined.set(nonce);
      combined.set(encrypted, nonce.length);
      localStorage.setItem(key, encodeBase64(combined));
    } catch (error) {
      console.error('Error setting encrypted item:', error);
      throw error;
    }
  },

  getItem: async (key: string): Promise<null | string> => {
    try {
      const userId = 'current-user';
      const keys = getUserEncryptionKeys(userId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const combined = decodeBase64(stored);
      const nonce = combined.slice(0, nacl.secretbox?.nonceLength);
      const encrypted = combined.slice(nacl.secretbox?.nonceLength);
      const keyBytes = decodeBase64(keys.secretKey).slice(0, 32);
      const decrypted = nacl.secretbox.open(encrypted, nonce, keyBytes);
      if (!decrypted) return null;
      return encodeUTF8(decrypted);
    } catch (error) {
      console.error('Error getting encrypted item:', error);
      return null;
    }
  },

  // Key management methods needed by useEncryption hook
  checkRotationNeeded: async (): Promise<boolean> => {
    // Check if keys are older than 90 days
    const userId = 'current-user';
    const keyTimestamp = localStorage.getItem(
      `encryption_keys_timestamp_${userId}`
    );
    if (!keyTimestamp) return false;
    const daysSinceCreation =
      (Date.now() - parseInt(keyTimestamp)) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 90;
  },

  areKeysUnlocked: async (): Promise<boolean> => {
    // For now, assume keys are unlocked if they exist
    // In a real implementation, this would check session state
    const userId = 'current-user';
    return !!localStorage.getItem(`encryption_keys_${userId}`);
  },

  initializeKeys: async (
    _password: string
  ): Promise<{ error?: string; success: boolean }> => {
    try {
      const userId = 'current-user';
      const keys = generateEncryptionKeys();
      localStorage.setItem(`encryption_keys_${userId}`, JSON.stringify(keys));
      localStorage.setItem(
        `encryption_keys_timestamp_${userId}`,
        Date.now().toString()
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  unlockKeys: async (
    _password: string
  ): Promise<{ error?: string; success: boolean }> => {
    try {
      // For now, just check if keys exist
      // In a real implementation, this would verify the password
      const userId = 'current-user';
      const keys = localStorage.getItem(`encryption_keys_${userId}`);
      if (!keys) {
        return { success: false, error: 'No keys found' };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  lockKeys: async (): Promise<void> => {
    // For now, this is a no-op since keys are stored in localStorage
    // In a real implementation, this would clear session keys
    // console.log('Keys locked');
  },

  migrateFromLocalStorage: async (
    _password: string
  ): Promise<{ error?: string; success: boolean }> => {
    try {
      // Check if there are legacy keys to migrate
      const userId = 'current-user';
      const legacyKeys = localStorage.getItem(`encryptionKeys_${userId}`);
      if (legacyKeys) {
        // Move legacy keys to new format
        localStorage.setItem(`encryption_keys_${userId}`, legacyKeys);
        localStorage.removeItem(`encryptionKeys_${userId}`);
        localStorage.setItem(
          `encryption_keys_timestamp_${userId}`,
          Date.now().toString()
        );
        return { success: true };
      }
      return { success: false, error: 'No legacy keys found' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  rotateKeys: async (
    _currentPassword: string,
    _newPassword?: string
  ): Promise<{ error?: string; success: boolean }> => {
    try {
      // Generate new keys
      const userId = 'current-user';
      const newKeys = generateEncryptionKeys();
      localStorage.setItem(
        `encryption_keys_${userId}`,
        JSON.stringify(newKeys)
      );
      localStorage.setItem(
        `encryption_keys_timestamp_${userId}`,
        Date.now().toString()
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Text encryption methods (aliases for backward compatibility)
  encryptText: async (text: string): Promise<string> => {
    const userId = 'current-user';
    const keys = getUserEncryptionKeys(userId);
    const message = decodeUTF8(text);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const keyBytes = decodeBase64(keys.secretKey).slice(0, 32);
    const encrypted = nacl.secretbox(message, nonce, keyBytes);
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);
    return encodeBase64(combined);
  },

  decryptText: async (encryptedText: string): Promise<string> => {
    const userId = 'current-user';
    const keys = getUserEncryptionKeys(userId);
    const combined = decodeBase64(encryptedText);
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const encrypted = combined.slice(nacl.secretbox.nonceLength);
    const keyBytes = decodeBase64(keys.secretKey).slice(0, 32);
    const decrypted = nacl.secretbox.open(encrypted, nonce, keyBytes);
    if (!decrypted) throw new Error('Failed to decrypt text');
    return encodeUTF8(decrypted);
  },
};

// Legacy compatibility exports
export const encryptionService = encryptionServiceV2;
export const SecureEncryptionService = encryptionServiceV2;
export const SecureStorage = {
  getSecureLocal: encryptionServiceV2.getItem,
  setSecureLocal: encryptionServiceV2.setItem,
};
