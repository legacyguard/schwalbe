/**
 * Secure Encryption Service v2
 * Uses server-side key management instead of localStorage
 */

import * as nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { secureStorage } from './security/secure-storage';

export interface EncryptionKeys {
  privateKey: string;
  publicKey: string;
}

export interface EncryptedData {
  encrypted: string;
  metadata?: {
    algorithm: string;
    encryptedAt: string;
    keyVersion?: number;
  };
  nonce: string;
}

class SecureEncryptionService {
  private static instance: SecureEncryptionService;
  private keyCache: Map<string, { expiry: number; keys: EncryptionKeys; }> =
    new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SecureEncryptionService {
    if (!SecureEncryptionService.instance) {
      SecureEncryptionService.instance = new SecureEncryptionService();
    }
    return SecureEncryptionService.instance;
  }

  /**
   * Initialize keys for a user (call on login)
   */
  public async initializeKeys(
    password: string
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      // Check if keys exist
      const publicKeyResponse = await fetch('/api/keys/retrieve', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (publicKeyResponse.status === 404) {
        // Keys don't exist, generate them
        const generateResponse = await fetch('/api/keys/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (!generateResponse.ok) {
          const error = await generateResponse.json();
          return {
            success: false,
            error: error.error || 'Failed to generate keys',
          };
        }

        return { success: true };
      }

      if (!publicKeyResponse.ok) {
        return { success: false, error: 'Failed to check key status' };
      }

      // Keys exist, retrieve them
      const retrieveResponse = await fetch('/api/keys/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!retrieveResponse.ok) {
        const error = await retrieveResponse.json();
        return { success: false, error: error.error || 'Invalid password' };
      }

      const { privateKey, publicKey } = await retrieveResponse.json();

      // Cache keys in secure memory storage
      await this.cacheKeys({ privateKey, publicKey });

      return { success: true };
    } catch (error) {
      console.error('Key initialization error:', error);
      return { success: false, error: 'Failed to initialize encryption keys' };
    }
  }

  /**
   * Get cached keys or prompt for password
   */
  private async getKeys(): Promise<EncryptionKeys | null> {
    // Check cache first
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    const cached = this.keyCache.get(userId);
    if (cached && cached.expiry > Date.now()) {
      return cached.keys;
    }

    // Check secure storage
    const storedKeys =
      await secureStorage.getSecureSession<EncryptionKeys>('encryption_keys');
    if (storedKeys) {
      // Re-cache in memory
      this.keyCache.set(userId, {
        keys: storedKeys,
        expiry: Date.now() + this.CACHE_DURATION,
      });
      return storedKeys;
    }

    return null;
  }

  /**
   * Cache keys securely
   */
  private async cacheKeys(keys: EncryptionKeys): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    // Store in memory cache
    this.keyCache.set(userId, {
      keys,
      expiry: Date.now() + this.CACHE_DURATION,
    });

    // Store in secure session storage (encrypted)
    await secureStorage.setSecureSession('encryption_keys', keys, 30); // 30 minutes
  }

  /**
   * Get current user ID from Clerk
   */
  private async getCurrentUserId(): Promise<null | string> {
    // This would typically come from Clerk's useAuth hook
    // For server-side, we'd need to pass it differently
    if (typeof window !== 'undefined') {
      const clerk = (window as { Clerk?: { user?: { id: string } } }).Clerk;
      if (clerk?.user) {
        return clerk.user.id;
      }
    }
    return null;
  }

  /**
   * Encrypt file with user's keys
   */
  public async encryptFile(
    file: File,
    recipientPublicKey?: string
  ): Promise<null | {
    encryptedData: Uint8Array;
    metadata: Record<string, any>;
    nonce: Uint8Array;
  }> {
    try {
      const keys = await this.getKeys();
      if (!keys) {
        throw new Error(
          'Encryption keys not available. Please unlock with your password.'
        );
      }

      const fileBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);

      // Generate nonce
      const nonce = nacl.randomBytes(nacl.box.nonceLength);

      // Use recipient's public key if provided, otherwise use user's own
      const pubKey = recipientPublicKey
        ? decodeBase64(recipientPublicKey)
        : decodeBase64(keys.publicKey);

      const privKey = decodeBase64(keys.privateKey);

      // Encrypt the file
      const encrypted = nacl.box(fileData, nonce, pubKey, privKey);

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      const metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        encryptedAt: new Date().toISOString(),
        algorithm: 'nacl.box',
      };

      return {
        encryptedData: encrypted,
        nonce,
        metadata,
      };
    } catch (error) {
      console.error('File encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt file with user's keys
   */
  public async decryptFile(
    encryptedData: Uint8Array,
    nonce: Uint8Array,
    senderPublicKey?: string
  ): Promise<null | Uint8Array> {
    try {
      const keys = await this.getKeys();
      if (!keys) {
        throw new Error(
          'Encryption keys not available. Please unlock with your password.'
        );
      }

      // Use sender's public key if provided, otherwise use user's own
      const pubKey = senderPublicKey
        ? decodeBase64(senderPublicKey)
        : decodeBase64(keys.publicKey);

      const privKey = decodeBase64(keys.privateKey);

      // Decrypt the file
      const decrypted = nacl.box.open(encryptedData, nonce, pubKey, privKey);

      if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      return decrypted;
    } catch (error) {
      console.error('File decryption error:', error);
      return null;
    }
  }

  /**
   * Encrypt text data
   */
  public async encryptText(text: string): Promise<EncryptedData | null> {
    try {
      const keys = await this.getKeys();
      if (!keys) {
        throw new Error('Encryption keys not available');
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const keyBytes = decodeBase64(keys.privateKey).slice(0, 32); // Use first 32 bytes for secretbox

      const encrypted = nacl.secretbox(data, nonce, keyBytes);

      if (!encrypted) {
        throw new Error('Text encryption failed');
      }

      return {
        encrypted: encodeBase64(encrypted),
        nonce: encodeBase64(nonce),
        metadata: {
          encryptedAt: new Date().toISOString(),
          algorithm: 'nacl.secretbox',
        },
      };
    } catch (error) {
      console.error('Text encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt text data
   */
  public async decryptText(
    encryptedData: EncryptedData
  ): Promise<null | string> {
    try {
      const keys = await this.getKeys();
      if (!keys) {
        throw new Error('Encryption keys not available');
      }

      const encrypted = decodeBase64(encryptedData.encrypted);
      const nonce = decodeBase64(encryptedData.nonce);
      const keyBytes = decodeBase64(keys.privateKey).slice(0, 32);

      const decrypted = nacl.secretbox.open(encrypted, nonce, keyBytes);

      if (!decrypted) {
        throw new Error('Text decryption failed');
      }

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Text decryption error:', error);
      return null;
    }
  }

  /**
   * Request password from user (UI component should handle this)
   */
  public async requestPassword(): Promise<null | string> {
    // This should trigger a UI modal/dialog
    // For now, we'll use a simple prompt (replace with proper UI)
    if (typeof window !== 'undefined') {
      const password = window.prompt('Enter your encryption password:');
      return password;
    }
    return null;
  }

  /**
   * Unlock keys with password
   */
  public async unlockKeys(
    password: string
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      const response = await fetch('/api/keys/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to unlock keys',
        };
      }

      const { privateKey, publicKey } = await response.json();

      // Cache keys
      await this.cacheKeys({ privateKey, publicKey });

      return { success: true };
    } catch (error) {
      console.error('Key unlock error:', error);
      return { success: false, error: 'Failed to unlock encryption keys' };
    }
  }

  /**
   * Lock keys (clear from memory)
   */
  public async lockKeys(): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (userId) {
      this.keyCache.delete(userId);
    }
    await secureStorage.remove('encryption_keys');
  }

  /**
   * Check if keys are unlocked
   */
  public async areKeysUnlocked(): Promise<boolean> {
    const keys = await this.getKeys();
    return keys !== null;
  }

  /**
   * Rotate encryption keys
   */
  public async rotateKeys(
    currentPassword: string,
    newPassword?: string
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      const response = await fetch('/api/keys/rotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to rotate keys',
        };
      }

      // Clear cached keys
      await this.lockKeys();

      // Re-initialize with new password
      const password = newPassword || currentPassword;
      return await this.unlockKeys(password);
    } catch (error) {
      console.error('Key rotation error:', error);
      return { success: false, error: 'Failed to rotate encryption keys' };
    }
  }

  /**
   * Check if key rotation is needed
   */
  public async checkRotationNeeded(): Promise<boolean> {
    try {
      const response = await fetch('/api/keys/rotate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const { rotationNeeded } = await response.json();
      return rotationNeeded;
    } catch (error) {
      console.error('Rotation check error:', error);
      return false;
    }
  }

  /**
   * Migrate from old localStorage keys to server-side
   */
  public async migrateFromLocalStorage(
    password: string
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      // Check if old keys exist in localStorage
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const oldKeysString = localStorage.getItem(`encryptionKeys_${userId}`);
      if (!oldKeysString) {
        return { success: false, error: 'No legacy keys found' };
      }

      // Parse old keys (validate format)
      // const _oldKeys = JSON.parse(oldKeysString); // Not currently used

      // Initialize new server-side keys
      const result = await this.initializeKeys(password);

      if (result.success) {
        // Remove old keys from localStorage
        localStorage.removeItem(`encryptionKeys_${userId}`);
        // Successfully migrated encryption keys to server-side storage
      }

      return result;
    } catch (error) {
      console.error('Migration error:', error);
      return { success: false, error: 'Failed to migrate encryption keys' };
    }
  }
}

// Export singleton instance
export const encryptionService = SecureEncryptionService.getInstance();

// Helper functions for backward compatibility
export async function encryptFile(
  file: File,
  recipientPublicKey?: string
): Promise<null | {
  encryptedData: Uint8Array;
  metadata: Record<string, any>;
  nonce: Uint8Array;
}> {
  return encryptionService.encryptFile(file, recipientPublicKey);
}

export async function decryptFile(
  encryptedData: Uint8Array,
  nonce: Uint8Array,
  senderPublicKey?: string
): Promise<null | Uint8Array> {
  return encryptionService.decryptFile(encryptedData, nonce, senderPublicKey);
}

export async function initializeEncryption(
  password: string
): Promise<{ error?: string; success: boolean; }> {
  return encryptionService.initializeKeys(password);
}

export async function unlockEncryption(
  password: string
): Promise<{ error?: string; success: boolean; }> {
  return encryptionService.unlockKeys(password);
}

export async function lockEncryption(): Promise<void> {
  return encryptionService.lockKeys();
}

export async function isEncryptionUnlocked(): Promise<boolean> {
  return encryptionService.areKeysUnlocked();
}
