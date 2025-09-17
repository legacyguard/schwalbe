
import nacl from 'tweetnacl';
import {
  decodeBase64,
  encodeBase64,
} from 'tweetnacl-util';
import CryptoJS from 'crypto-js';

export interface EncryptionKeyPair {
  encryptedPrivateKey: string; // Private key encrypted with master password
  keyDerivationIterations: number;
  keyDerivationSalt: string;
  publicKey: string;
}

export interface ZeroKnowledgeSession {
  autoLockTimeout?: number;
  ephemeralKeyPair: nacl.BoxKeyPair;
  isUnlocked: boolean;
  keyDerivationSalt: string;
  publicKey: string;
  sessionId: string;
  unlockTimestamp?: number;
}

export interface EncryptedDocument {
  createdAt: string;
  documentSalt: string; // Unique salt for this document
  encryptedData: string; // Base64 encrypted file content
  encryptedMetadata: string; // Base64 encrypted metadata
  id: string;
  modifiedAt: string;
  nonce: string; // Base64 nonce for encryption
  version: number; // Encryption version for future migrations
}

export interface DocumentAccess {
  createdAt: string;
  documentId: string;
  encryptedDocumentKey: string; // Document key encrypted with recipient's public key
  expiresAt?: string;
  permissions: AccessPermissions;
  recipientPublicKey: string;
}

export interface AccessPermissions {
  canDownload: boolean;
  canModify: boolean;
  canShare: boolean;
  canView: boolean;
  timeLimit?: number; // Minutes
  viewCount?: number; // Max views allowed
  watermark?: boolean;
}

class ZeroKnowledgeEncryptionService {
  private readonly ENCRYPTION_VERSION = 1;
  private readonly KEY_DERIVATION_ITERATIONS = 100000;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private currentSession: null | ZeroKnowledgeSession = null;

  /**
   * Initialize user encryption keys with master password
   * The server never sees the master password or private keys
   */
  async initializeUserKeys(
    masterPassword: string,
    _userId: string
  ): Promise<EncryptionKeyPair> {
    // Generate salt for key derivation
    const keyDerivationSalt = encodeBase64(nacl.randomBytes(32));

    // Generate encryption key pair
    const keyPair = nacl.box.keyPair();

    // Derive encryption key from master password
    const derivedKey = CryptoJS.PBKDF2(masterPassword, keyDerivationSalt, {
      keySize: 32,
      iterations: this.KEY_DERIVATION_ITERATIONS,
    });

    // Encrypt private key with derived key
    const encryptedPrivateKey = CryptoJS.AES.encrypt(
      encodeBase64(keyPair.secretKey),
      derivedKey.toString()
    ).toString();

    const keyData: EncryptionKeyPair = {
      publicKey: encodeBase64(keyPair.publicKey),
      encryptedPrivateKey,
      keyDerivationSalt,
      keyDerivationIterations: this.KEY_DERIVATION_ITERATIONS,
    };

    return keyData;
  }

  /**
   * Unlock user session with master password
   * Private key is decrypted client-side only
   */
  async unlockSession(
    masterPassword: string,
    userKeys: EncryptionKeyPair,
    _userId: string
  ): Promise<ZeroKnowledgeSession> {
    // Derive decryption key from master password
    const derivedKey = CryptoJS.PBKDF2(
      masterPassword,
      userKeys.keyDerivationSalt,
      {
        keySize: 32,
        iterations: userKeys.keyDerivationIterations,
      }
    );

    try {
      // Decrypt private key
      const decryptedPrivateKeyBase64 = CryptoJS.AES.decrypt(
        userKeys.encryptedPrivateKey,
        derivedKey.toString()
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedPrivateKeyBase64) {
        throw new Error('Invalid master password');
      }

  // const __privateKey = decodeBase64(decryptedPrivateKeyBase64); // Unused
  // const __publicKey = decodeBase64(userKeys.publicKey); // Unused

      // Create ephemeral key pair for this session
      const ephemeralKeyPair = nacl.box.keyPair();

      const session: ZeroKnowledgeSession = {
        sessionId: encodeBase64(nacl.randomBytes(16)),
        publicKey: userKeys.publicKey,
        ephemeralKeyPair,
        keyDerivationSalt: userKeys.keyDerivationSalt,
        isUnlocked: true,
        unlockTimestamp: Date.now(),
        autoLockTimeout: this.SESSION_TIMEOUT,
      };

      this.currentSession = session;

      // Auto-lock session after timeout
      setTimeout(() => {
        this.lockSession();
      }, this.SESSION_TIMEOUT);

      return session;
    } catch (_error) {
      throw new Error('Failed to unlock session: Invalid credentials');
    }
  }

  /**
   * Lock the current session and clear sensitive data
   */
  lockSession(): void {
    if (this.currentSession) {
      // Clear sensitive data
      this.currentSession.ephemeralKeyPair = null as any;
      this.currentSession.isUnlocked = false;
      this.currentSession = null;
    }
  }

  /**
   * Encrypt document with zero-knowledge architecture
   * Each document gets a unique encryption key
   */
  async encryptDocument(
    file: File,
    metadata: Record<string, any> = {}
  ): Promise<EncryptedDocument> {
    if (!this.currentSession?.isUnlocked) {
      throw new Error('Session not unlocked');
    }

    // Generate unique document encryption key
    const documentKey = nacl.randomBytes(nacl.secretbox.keyLength);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const documentSalt = encodeBase64(nacl.randomBytes(32));

    // Read file data
    const fileData = new Uint8Array(await file.arrayBuffer());

    // Encrypt file with document key
    const encryptedFileData = nacl.secretbox(fileData, nonce, documentKey);

    // Prepare metadata
    const documentMetadata = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      originalName: file.name,
      encryptedAt: new Date().toISOString(),
      version: this.ENCRYPTION_VERSION,
      ...metadata,
    };

    // Encrypt metadata with document key
    const metadataNonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encryptedMetadata = nacl.secretbox(
      new TextEncoder().encode(JSON.stringify(documentMetadata)),
      metadataNonce,
      documentKey
    );

    const encryptedDoc: EncryptedDocument = {
      id: encodeBase64(nacl.randomBytes(16)),
      encryptedData: encodeBase64(encryptedFileData),
      encryptedMetadata:
        encodeBase64(encryptedMetadata) + ':' + encodeBase64(metadataNonce),
      documentSalt,
      nonce: encodeBase64(nonce),
      version: this.ENCRYPTION_VERSION,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    // Store document key encrypted with user's public key for later retrieval
    await this.storeDocumentAccess(encryptedDoc.id, documentKey);

    return encryptedDoc;
  }

  /**
   * Store document access key encrypted with user's public key
   */
  private async storeDocumentAccess(
    documentId: string,
    documentKey: Uint8Array
  ): Promise<void> {
    if (!this.currentSession?.isUnlocked) {
      throw new Error('Session not unlocked');
    }

    // Encrypt document key with user's public key for storage
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedDocumentKey = nacl.box(
      documentKey,
      nonce,
      decodeBase64(this.currentSession.publicKey),
      this.currentSession.ephemeralKeyPair.secretKey
    );

    const access: DocumentAccess = {
      documentId,
      recipientPublicKey: this.currentSession.publicKey,
      encryptedDocumentKey:
        encodeBase64(encryptedDocumentKey) + ':' + encodeBase64(nonce),
      permissions: {
        canView: true,
        canDownload: true,
        canShare: true,
        canModify: true,
      },
      createdAt: new Date().toISOString(),
    };

    // Store in IndexedDB for client-side management
    await this.storeInIndexedDB('document_access', access);
  }

  /**
   * Decrypt document
   */
  async decryptDocument(encryptedDoc: EncryptedDocument): Promise<{
    fileData: Uint8Array;
    metadata: Record<string, any>;
  }> {
    if (!this.currentSession?.isUnlocked) {
      throw new Error('Session not unlocked');
    }

    // Retrieve document access key
    const documentKey = await this.getDocumentKey(encryptedDoc.id);
    if (!documentKey) {
      throw new Error('Access denied: Document key not found');
    }

    // Decrypt file data
    const encryptedData = decodeBase64(encryptedDoc.encryptedData);
    const nonce = decodeBase64(encryptedDoc.nonce);
    const decryptedFileData = nacl.secretbox.open(
      encryptedData,
      nonce,
      documentKey
    );

    if (!decryptedFileData) {
      throw new Error('Failed to decrypt document data');
    }

    // Decrypt metadata
    const [encryptedMetadataBase64, metadataNonceBase64] =
      encryptedDoc.encryptedMetadata.split(':');
    const encryptedMetadata = decodeBase64(encryptedMetadataBase64);
    const metadataNonce = decodeBase64(metadataNonceBase64);
    const decryptedMetadata = nacl.secretbox.open(
      encryptedMetadata,
      metadataNonce,
      documentKey
    );

    if (!decryptedMetadata) {
      throw new Error('Failed to decrypt document metadata');
    }

    const metadata = JSON.parse(new TextDecoder().decode(decryptedMetadata));

    return {
      fileData: decryptedFileData,
      metadata,
    };
  }

  /**
   * Share document with another user
   */
  async shareDocument(
    documentId: string,
    recipientPublicKey: string,
    permissions: AccessPermissions
  ): Promise<DocumentAccess> {
    if (!this.currentSession?.isUnlocked) {
      throw new Error('Session not unlocked');
    }

    // Get document key
    const documentKey = await this.getDocumentKey(documentId);
    if (!documentKey) {
      throw new Error('Document key not found');
    }

    // Encrypt document key with recipient's public key
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedDocumentKey = nacl.box(
      documentKey,
      nonce,
      decodeBase64(recipientPublicKey),
      this.currentSession.ephemeralKeyPair.secretKey
    );

    const access: DocumentAccess = {
      documentId,
      recipientPublicKey,
      encryptedDocumentKey:
        encodeBase64(encryptedDocumentKey) + ':' + encodeBase64(nonce),
      permissions,
      expiresAt: permissions.timeLimit
        ? new Date(Date.now() + permissions.timeLimit * 60000).toISOString()
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Store document access
    await this.storeInIndexedDB('document_access', access);

    return access;
  }

  /**
   * Get document key from storage
   */
  private async getDocumentKey(documentId: string): Promise<null | Uint8Array> {
    if (!this.currentSession?.isUnlocked) {
      return null;
    }

    try {
      const access = (await this.getFromIndexedDB(
        'document_access',
        documentId
      )) as DocumentAccess;
      if (!access) {
        return null;
      }

      // Check if access has expired
      if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
        await this.removeFromIndexedDB('document_access', documentId);
        return null;
      }

      // Decrypt document key
      const [encryptedKeyBase64, nonceBase64] =
        access.encryptedDocumentKey.split(':');
      const encryptedKey = decodeBase64(encryptedKeyBase64);
      const nonce = decodeBase64(nonceBase64);

      const decryptedKey = nacl.box.open(
        encryptedKey,
        nonce,
        this.currentSession.ephemeralKeyPair.publicKey,
        this.currentSession.ephemeralKeyPair.secretKey
      );

      return decryptedKey;
    } catch (error) {
      console.error('Failed to get document key:', error);
      return null;
    }
  }

  /**
   * IndexedDB operations for client-side key storage
   */
  private async storeInIndexedDB(
    storeName: string,
    data: unknown
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardSecure', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const putRequest = store.put(
          data,
          (data as any).documentId || (data as any).id
        );
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  }

  private async getFromIndexedDB(
    storeName: string,
    key: string
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardSecure', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  }

  private async removeFromIndexedDB(
    storeName: string,
    key: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardSecure', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  /**
   * Get current session status
   */
  getSessionStatus(): { isUnlocked: boolean; timeRemaining?: number } {
    if (!this.currentSession?.isUnlocked) {
      return { isUnlocked: false };
    }

    const timeRemaining = this.currentSession.autoLockTimeout
      ? this.currentSession.autoLockTimeout -
        (Date.now() - (this.currentSession.unlockTimestamp || 0))
      : undefined;

    return {
      isUnlocked: true,
      timeRemaining: Math.max(0, timeRemaining || 0),
    };
  }

  /**
   * Export user keys for backup (encrypted)
   */
  async exportUserKeys(
    masterPassword: string,
    userKeys: EncryptionKeyPair
  ): Promise<string> {
    // Re-encrypt keys with additional layer for backup
    const backupSalt = encodeBase64(nacl.randomBytes(32));
    const backupKey = CryptoJS.PBKDF2(masterPassword + backupSalt, backupSalt, {
      keySize: 32,
      iterations: this.KEY_DERIVATION_ITERATIONS * 2,
    });

    const backupData = {
      keys: userKeys,
      backupSalt,
      exportedAt: new Date().toISOString(),
      version: this.ENCRYPTION_VERSION,
    };

    const encryptedBackup = CryptoJS.AES.encrypt(
      JSON.stringify(backupData),
      backupKey.toString()
    ).toString();

    return encryptedBackup;
  }

  /**
   * Import user keys from backup
   */
  async importUserKeys(
    encryptedBackup: string,
    masterPassword: string
  ): Promise<EncryptionKeyPair> {
    try {
      // First, try to decrypt the backup
      const decryptedData = CryptoJS.AES.decrypt(
        encryptedBackup,
        masterPassword
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Invalid backup or password');
      }

      const backupData = JSON.parse(decryptedData);

      // Verify the backup contains valid keys
      if (
        !backupData.keys ||
        !backupData.keys.publicKey ||
        !backupData.keys.encryptedPrivateKey
      ) {
        throw new Error('Invalid backup format');
      }

      return backupData.keys;
    } catch (_error) {
      throw new Error('Failed to import keys: Invalid backup or password');
    }
  }
}

// Export singleton instance
export const zeroKnowledgeEncryption = new ZeroKnowledgeEncryptionService();
export default zeroKnowledgeEncryption;
