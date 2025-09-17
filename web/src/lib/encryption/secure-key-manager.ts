
/**
 * Secure Key Manager for LegacyGuard
 * Implements WebCrypto with IndexedDB storage and proper key wrapping
 *
 * Security Features:
 * - Non-extractable keys via WebCrypto
 * - PBKDF2 key derivation from user password
 * - IndexedDB storage for wrapped key bundles
 * - No keys stored in localStorage
 * - Versioned encryption for future migrations
 */

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

// IndexedDB Schema
interface KeyStoreDB extends DBSchema {
  keystore: {
    indexes: {
      lastUsed: number;
      version: string;
    };
    key: string;
    value: {
      algorithm: string;
      createdAt: number;
      id: string;
      iv: Uint8Array;
      lastUsed: number;
      salt: Uint8Array;
      version: string;
      wrappedKeyBundle: ArrayBuffer;
    };
  };
  metadata: {
    key: string;
    value: {
      createdAt: number;
      keyVersion: string;
      securityLevel: 'premium' | 'standard';
      userId: string;
    };
  };
}

// Key types for different purposes
export type KeyPurpose = 'backup' | 'document' | 'master' | 'sharing';

// Encryption algorithm configuration
const ENCRYPTION_CONFIG = {
  version: '2.0',
  keyDerivation: {
    name: 'PBKDF2',
    hash: 'SHA-256',
    iterations: 100000, // OWASP recommended minimum
  },
  wrapping: {
    name: 'AES-KW',
    length: 256,
  },
  encryption: {
    name: 'AES-GCM',
    length: 256,
    ivLength: 12,
  },
} as const;

// Error types
export class SecureKeyError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SecureKeyError';
  }
}

export class SecureKeyManager {
  private db: IDBPDatabase<KeyStoreDB> | null = null;
  private activeKeys: Map<string, CryptoKey> = new Map();
  private userId: null | string = null;

  /**
   * Initialize the secure key manager
   */
  async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;
      this.db = await openDB<KeyStoreDB>(`legacyguard-keystore-${userId}`, 1, {
        upgrade(db) {
          // Create keystore object store
          const keystore = db.createObjectStore('keystore', { keyPath: 'id' });
          keystore.createIndex('lastUsed', 'lastUsed');
          keystore.createIndex('version', 'version');

          // Create metadata object store
          db.createObjectStore('metadata', { keyPath: 'userId' });
        },
      });

      // Clean up old keys periodically
      this.cleanupOldKeys();

      console.log('🔐 Secure Key Manager initialized successfully');
    } catch (_error) {
      throw new SecureKeyError(
        'Failed to initialize secure key manager',
        'INIT_FAILED'
      );
    }
  }

  /**
   * Generate master key from user password using PBKDF2
   */
  private async deriveKeyFromPassword(
    password: string,
    salt?: Uint8Array
  ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(32));
    }

    try {
      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // Derive wrapping key using PBKDF2
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt as unknown as ArrayBuffer,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        {
          name: 'AES-KW',
          length: 256,
        },
        false, // non-extractable
        ['wrapKey', 'unwrapKey']
      );

      return { key, salt };
    } catch (_error) {
      throw new SecureKeyError(
        'Failed to derive key from password',
        'KEY_DERIVATION_FAILED'
      );
    }
  }

  /**
   * Generate non-extractable encryption key
   */
  async generateEncryptionKey(purpose: KeyPurpose): Promise<CryptoKey> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: ENCRYPTION_CONFIG.encryption.name,
          length: ENCRYPTION_CONFIG.encryption.length,
        },
        false, // non-extractable - critical for security
        ['encrypt', 'decrypt']
      );

      return key;
    } catch (_error) {
      throw new SecureKeyError(
        `Failed to generate ${purpose} key`,
        'KEY_GENERATION_FAILED'
      );
    }
  }

  /**
   * Create and store user's master keys with password protection
   */
  async createUserKeys(password: string): Promise<void> {
    if (!this.db || !this.userId) {
      throw new SecureKeyError(
        'Key manager not initialized',
        'NOT_INITIALIZED'
      );
    }

    try {
      // Derive wrapping key from password
      const { key: wrappingKey, salt } =
        await this.deriveKeyFromPassword(password);

      // Generate master encryption key
      const masterKey = await this.generateEncryptionKey('master');

      // Generate IV for wrapping
      const iv = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONFIG.encryption.ivLength)
      );

      // Wrap the master key with the password-derived key
      const wrappedKeyBundle = await crypto.subtle.wrapKey(
        'raw',
        masterKey,
        wrappingKey,
        {
          name: ENCRYPTION_CONFIG.wrapping.name,
        }
      );

      // Store wrapped key bundle in IndexedDB
      const keyData = {
        id: 'master',
        wrappedKeyBundle,
        salt,
        iv,
        version: ENCRYPTION_CONFIG.version,
        algorithm: ENCRYPTION_CONFIG.encryption.name,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      await this.db.put('keystore', keyData);

      // Store user metadata
      await this.db.put('metadata', {
        userId: this.userId,
        keyVersion: ENCRYPTION_CONFIG.version,
        securityLevel: 'standard',
        createdAt: Date.now(),
      });

      // Keep master key in memory for this session
      this.activeKeys.set('master', masterKey);

      console.log('🔐 Master keys created and stored securely');
    } catch (_error) {
      throw new SecureKeyError(
        'Failed to create user keys',
        'KEY_CREATION_FAILED'
      );
    }
  }

  /**
   * Unlock user keys with password
   */
  async unlockKeys(password: string): Promise<boolean> {
    if (!this.db || !this.userId) {
      throw new SecureKeyError(
        'Key manager not initialized',
        'NOT_INITIALIZED'
      );
    }

    try {
      // Get wrapped key data from IndexedDB
      const keyData = await this.db.get('keystore', 'master');
      if (!keyData) {
        throw new SecureKeyError('Master key not found', 'KEY_NOT_FOUND');
      }

      // Derive wrapping key from password
      const { key: wrappingKey } = await this.deriveKeyFromPassword(
        password,
        keyData.salt
      );

      // Unwrap the master key
      const masterKey = await crypto.subtle.unwrapKey(
        'raw',
        keyData.wrappedKeyBundle,
        wrappingKey,
        {
          name: ENCRYPTION_CONFIG.wrapping.name,
        },
        {
          name: ENCRYPTION_CONFIG.encryption.name,
          length: ENCRYPTION_CONFIG.encryption.length,
        },
        false, // non-extractable
        ['encrypt', 'decrypt']
      );

      // Update last used timestamp
      keyData.lastUsed = Date.now();
      await this.db.put('keystore', keyData);

      // Store in active keys for this session
      this.activeKeys.set('master', masterKey);

      console.log('🔓 Keys unlocked successfully');
      return true;
    } catch (_error) {
      console.error('🔐 Failed to unlock keys:', error);
      return false;
    }
  }

  /**
   * Encrypt data with user's master key
   */
  async encryptData(data: BufferSource): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
    version: string;
  }> {
    const masterKey = this.activeKeys.get('master');
    if (!masterKey) {
      throw new SecureKeyError(
        'Master key not available - unlock first',
        'KEY_LOCKED'
      );
    }

    try {
      const iv = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONFIG.encryption.ivLength)
      );

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_CONFIG.encryption.name,
          iv,
        },
        masterKey,
        data
      );

      return {
        encryptedData,
        iv,
        version: ENCRYPTION_CONFIG.version,
      };
    } catch (_error) {
      throw new SecureKeyError('Failed to encrypt data', 'ENCRYPTION_FAILED');
    }
  }

  /**
   * Decrypt data with user's master key
   */
  async decryptData(
    encryptedData: ArrayBuffer,
    iv: Uint8Array
  ): Promise<ArrayBuffer> {
    const masterKey = this.activeKeys.get('master');
    if (!masterKey) {
      throw new SecureKeyError(
        'Master key not available - unlock first',
        'KEY_LOCKED'
      );
    }

    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_CONFIG.encryption.name,
          iv: iv as unknown as ArrayBuffer,
        },
        masterKey,
        encryptedData
      );

      return decryptedData;
    } catch (_error) {
      throw new SecureKeyError('Failed to decrypt data', 'DECRYPTION_FAILED');
    }
  }

  /**
   * Generate file-specific encryption key wrapped with master key
   */
  async generateFileKey(): Promise<{
    encryptedFileKey: ArrayBuffer;
    iv: Uint8Array;
    keyId: string;
  }> {
    const masterKey = this.activeKeys.get('master');
    if (!masterKey) {
      throw new SecureKeyError('Master key not available', 'KEY_LOCKED');
    }

    try {
      // Generate unique file key
      const fileKey = await this.generateEncryptionKey('document');
      const keyId = crypto.randomUUID();

      // Export file key to wrap it
      const exportedFileKey = await crypto.subtle.exportKey('raw', fileKey);

      // Encrypt file key with master key
      const result = await this.encryptData(exportedFileKey);

      return {
        encryptedFileKey: result.encryptedData,
        iv: result.iv,
        keyId,
      };
    } catch (_error) {
      throw new SecureKeyError(
        'Failed to generate file key',
        'FILE_KEY_GENERATION_FAILED'
      );
    }
  }

  /**
   * Check if keys are available and unlocked
   */
  isUnlocked(): boolean {
    return this.activeKeys.has('master');
  }

  /**
   * Lock keys (remove from memory)
   */
  lockKeys(): void {
    this.activeKeys.clear();
    console.log('🔒 Keys locked and cleared from memory');
  }

  /**
   * Clean up old keys periodically
   */
  private async cleanupOldKeys(): Promise<void> {
    if (!this.db) return;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    try {
      const tx = this.db.transaction('keystore', 'readwrite');
      const index = tx.store.index('lastUsed' as any);

      for await (const cursor of index.iterate(
        IDBKeyRange.upperBound(oneWeekAgo)
      )) {
        if (cursor.value.id !== 'master') {
          await cursor.delete();
        }
      }

      console.log('🧹 Old keys cleaned up');
    } catch (_error) {
      console.warn('Failed to cleanup old keys:', error);
    }
  }

  /**
   * Change user password (re-wrap keys)
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    if (!this.db || !this.userId) {
      throw new SecureKeyError(
        'Key manager not initialized',
        'NOT_INITIALIZED'
      );
    }

    try {
      // First, unlock with old password
      const unlocked = await this.unlockKeys(oldPassword);
      if (!unlocked) {
        throw new SecureKeyError('Invalid old password', 'INVALID_PASSWORD');
      }

      const masterKey = this.activeKeys.get('master');
      if (!masterKey) {
        throw new SecureKeyError('Master key not available', 'KEY_LOCKED');
      }

      // Derive new wrapping key from new password
      const { key: newWrappingKey, salt: newSalt } =
        await this.deriveKeyFromPassword(newPassword);

      // Re-wrap master key with new password
      const newIv = crypto.getRandomValues(
        new Uint8Array(ENCRYPTION_CONFIG.encryption.ivLength)
      );
      const newWrappedKeyBundle = await crypto.subtle.wrapKey(
        'raw',
        masterKey,
        newWrappingKey,
        {
          name: ENCRYPTION_CONFIG.wrapping.name,
        }
      );

      // Update stored key data
      const keyData = {
        id: 'master',
        wrappedKeyBundle: newWrappedKeyBundle,
        salt: newSalt,
        iv: newIv,
        version: ENCRYPTION_CONFIG.version,
        algorithm: ENCRYPTION_CONFIG.encryption.name,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      await this.db.put('keystore', keyData);

      console.log('🔑 Password changed successfully');
      return true;
    } catch (_error) {
      console.error('Failed to change password:', error);
      return false;
    }
  }

  /**
   * Export emergency recovery data (for premium users)
   */
  async exportRecoveryData(password: string): Promise<string> {
    if (!this.isUnlocked()) {
      const unlocked = await this.unlockKeys(password);
      if (!unlocked) {
        throw new SecureKeyError('Invalid password', 'INVALID_PASSWORD');
      }
    }

    // Implementation would create encrypted backup of key data
    // This is a security-critical feature for premium users
    throw new SecureKeyError(
      'Recovery export not yet implemented',
      'NOT_IMPLEMENTED'
    );
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.lockKeys();
    this.db?.close();
    this.db = null;
    this.userId = null;
  }
}

// Singleton instance
let secureKeyManager: null | SecureKeyManager = null;

/**
 * Get the singleton secure key manager instance
 */
export const getSecureKeyManager = (): SecureKeyManager => {
  if (!secureKeyManager) {
    secureKeyManager = new SecureKeyManager();
  }
  return secureKeyManager;
};

/**
 * Initialize secure key manager for a user
 */
export const initializeSecureKeys = async (
  userId: string
): Promise<SecureKeyManager> => {
  const manager = getSecureKeyManager();
  await manager.initialize(userId);
  return manager;
};
