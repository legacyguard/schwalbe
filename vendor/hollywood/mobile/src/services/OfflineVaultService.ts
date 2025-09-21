// src/services/OfflineVaultService.ts
/* global __DEV__ */
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Crypto from 'expo-crypto';

interface OfflineDocument {
  content: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  id: string;
  tags?: string[];
  uploadedAt?: Date;
}

const VAULT_KEY = '@legacyguard_vault';
const VAULT_METADATA_KEY = '@legacyguard_vault_metadata';

export const OfflineVaultService = {
  /**
   * Open (and create if needed) encrypted database
   * Note: encryptionKey parameter reserved for future encryption implementation
   */
  open: async (): Promise<void> => {
    try {
      // Initialize vault if it doesn't exist
      const vault = await AsyncStorage.getItem(VAULT_KEY);
      if (!vault) {
        await AsyncStorage.setItem(VAULT_KEY, JSON.stringify({}));
        await AsyncStorage.setItem(
          VAULT_METADATA_KEY,
          JSON.stringify({ initialized: new Date() })
        );
      }
      if (__DEV__) console.log('Secure offline vault opened successfully.');
    } catch (error) {
      if (__DEV__) console.error('Failed to open offline vault:', error);
      throw new Error('Failed to open secure vault');
    }
  },

  /**
   * Add document to offline vault
   */
  addDocument: async (doc: OfflineDocument): Promise<void> => {
    try {
      // Get existing vault
      const vaultData = await AsyncStorage.getItem(VAULT_KEY);
      const vault = vaultData ? JSON.parse(vaultData) : {};

      // Encrypt content before storing
      const encryptedContent = await encryptContent(doc.content);

      // Add document to vault
      vault[doc.id] = {
        _id: doc.id,
        fileName: doc.fileName,
        documentType: doc.documentType,
        encryptedContent,
        uploadedAt: doc.uploadedAt || new Date(),
        fileSize: doc.fileSize,
        tags: doc.tags || [],
        lastAccessedAt: null,
      };

      // Save updated vault
      await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(vault));
      if (__DEV__)
        console.log(`Document ${doc.fileName} added to offline vault`);
    } catch (error) {
      if (__DEV__) console.error('Failed to add document to vault:', error);
      throw error;
    }
  },

  /**
   * Get all documents from offline vault
   */
  getDocuments: async (): Promise<OfflineDocument[]> => {
    try {
      const vaultData = await AsyncStorage.getItem(VAULT_KEY);
      if (!vaultData) return [];

      const vault = JSON.parse(vaultData);
      const decryptedDocs: OfflineDocument[] = [];

      for (const docId in vault) {
        const doc = vault[docId];

        // Update last accessed time
        doc.lastAccessedAt = new Date();

        // Decrypt content before returning
        const decryptedContent = await decryptContent(doc.encryptedContent);

        decryptedDocs.push({
          id: doc._id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          content: decryptedContent,
          uploadedAt: doc.uploadedAt,
          fileSize: doc.fileSize,
          tags: doc.tags || [],
        });
      }

      // Save updated vault with last accessed times
      await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(vault));

      return decryptedDocs;
    } catch (error) {
      if (__DEV__) console.error('Failed to get documents from vault:', error);
      throw error;
    }
  },

  /**
   * Get single document by ID
   */
  getDocument: async (id: string): Promise<null | OfflineDocument> => {
    try {
      const vaultData = await AsyncStorage.getItem(VAULT_KEY);
      if (!vaultData) return null;

      const vault = JSON.parse(vaultData);
      const doc = vault[id];
      if (!doc) return null;

      // Update last accessed time
      doc.lastAccessedAt = new Date();
      await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(vault));

      // Decrypt content
      const decryptedContent = await decryptContent(doc.encryptedContent);

      return {
        id: doc._id,
        fileName: doc.fileName,
        documentType: doc.documentType,
        content: decryptedContent,
        uploadedAt: doc.uploadedAt,
        fileSize: doc.fileSize,
        tags: doc.tags || [],
      };
    } catch (error) {
      if (__DEV__) console.error('Failed to get document from vault:', error);
      throw error;
    }
  },

  /**
   * Remove document from vault
   */
  removeDocument: async (id: string): Promise<boolean> => {
    try {
      const vaultData = await AsyncStorage.getItem(VAULT_KEY);
      if (!vaultData) return false;

      const vault = JSON.parse(vaultData);
      if (!vault[id]) return false;

      delete vault[id];
      await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(vault));

      if (__DEV__) console.log(`Document ${id} removed from offline vault`);
      return true;
    } catch (error) {
      if (__DEV__)
        console.error('Failed to remove document from vault:', error);
      throw error;
    }
  },

  /**
   * Clear all documents from vault
   */
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(VAULT_KEY, JSON.stringify({}));
      if (__DEV__) console.log('All documents cleared from offline vault');
    } catch (error) {
      if (__DEV__) console.error('Failed to clear vault:', error);
      throw error;
    }
  },

  /**
   * Get vault statistics
   */
  getStats: async (): Promise<{
    documentCount: number;
    lastSync?: Date;
    totalSize: number;
  }> => {
    try {
      const vaultData = await AsyncStorage.getItem(VAULT_KEY);
      if (!vaultData) return { documentCount: 0, totalSize: 0 };

      const vault = JSON.parse(vaultData);
      let totalSize = 0;
      let documentCount = 0;

      for (const docId in vault) {
        documentCount++;
        totalSize += vault[docId].fileSize || 0;
      }

      return {
        documentCount,
        totalSize,
        lastSync: undefined, // Can be implemented with sync functionality
      };
    } catch (error) {
      if (__DEV__) console.error('Failed to get vault stats:', error);
      return { documentCount: 0, totalSize: 0 };
    }
  },

  /**
   * Close the database
   */
  close: (): void => {
    // No-op for AsyncStorage - it doesn't need to be closed
    if (__DEV__) console.log('Offline vault closed');
  },

  /**
   * Check if vault is open
   */
  isOpen: (): boolean => {
    // AsyncStorage is always available
    return true;
  },
};

// Helper functions for encryption/decryption (TweetNaCl via per-device key)
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import {
  decodeBase64,
  decodeUTF8,
  encodeBase64,
  encodeUTF8,
} from 'tweetnacl-util';

const DEVICE_KEY_NAME = 'LEGACYGUARD_VAULT_DEVICE_KEY';

async function getDeviceKey(): Promise<Uint8Array> {
  try {
    const existing = await SecureStore.getItemAsync(DEVICE_KEY_NAME);
    if (existing) {
      return decodeBase64(existing);
    }
    // Generate new 32-byte key and persist securely
    const newKey = nacl.randomBytes(nacl.secretbox.keyLength);
    await SecureStore.setItemAsync(DEVICE_KEY_NAME, encodeBase64(newKey), {
      keychainService: DEVICE_KEY_NAME,
      accessible: SecureStore.WHEN_UNLOCKED,
    } as any);
    return newKey;
  } catch (err) {
    if (__DEV__)
      console.error(
        'Failed to get device key, falling back to ephemeral key:',
        err
      );
    // Fallback to ephemeral key (will break decryption after restart, but avoids crash)
    return nacl.randomBytes(nacl.secretbox.keyLength);
  }
}

/**
 * Encrypt content using per-device symmetric key (secretbox)
 */
async function encryptContent(content: string): Promise<string> {
  const key = await getDeviceKey();
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const message = decodeUTF8(content);
  const cipher = nacl.secretbox(message, nonce, key);
  return `${encodeBase64(nonce)}:${encodeBase64(cipher)}`;
}

/**
 * Decrypt content using per-device symmetric key
 */
async function decryptContent(encryptedContent: string): Promise<string> {
  try {
    const [nonceB64, dataB64] = encryptedContent.split(':');
    if (!nonceB64 || !dataB64) return encryptedContent;
    const key = await getDeviceKey();
    const nonce = decodeBase64(nonceB64);
    const cipher = decodeBase64(dataB64);
    const plain = nacl.secretbox.open(cipher, nonce, key);
    if (!plain) return encryptedContent;
    return encodeUTF8(plain);
  } catch {
    return encryptedContent;
  }
}
