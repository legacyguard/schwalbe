
/**
 * Secure Crypto Store - Stores non-extractable CryptoKey objects in IndexedDB
 * This provides better security than localStorage by preventing key extraction
 * and using the browser's secure key storage mechanisms.
 */

interface CryptoKeyMetadata {
  algorithm: string;
  createdAt: string;
  expiresAt?: string;
  id: string;
  keyUsages: string[];
}

class SecureCryptoStore {
  private dbName = 'PhoenixCryptoStore';
  private dbVersion = 1;
  private storeName = 'cryptoKeys';
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB connection
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for crypto keys
        if (!db.objectStoreNames.contains(this.storeName)) {
          const keyStore = db.createObjectStore(this.storeName, {
            keyPath: 'id',
          });
          keyStore.createIndex('userId', 'userId', { unique: false });
          keyStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * Save a CryptoKey with metadata
   */
  async saveKey(
    keyId: string,
    key: CryptoKey,
    userId: string,
    expiresAt?: Date
  ): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const metadata: CryptoKeyMetadata = {
      id: keyId,
      algorithm: key.algorithm.name,
      keyUsages: key.usages,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt?.toISOString(),
    };

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Store the key and metadata
    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: keyId,
        userId,
        key,
        metadata,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve a CryptoKey by ID
   */
  async getKey(keyId: string): Promise<CryptoKey | null> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(keyId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.key) {
          // Check if key has expired
          if (
            result.metadata.expiresAt &&
            new Date(result.metadata.expiresAt) < new Date()
          ) {
            // Key has expired, remove it
            this.removeKey(keyId)
              .then(() => resolve(null))
              .catch(reject);
          } else {
            resolve(result.key);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all keys for a specific user
   */
  async getUserKeys(userId: string): Promise<CryptoKey[]> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = request.result;
        const keys: CryptoKey[] = [];

        const expiredKeys: string[] = [];

        for (const result of results) {
          if (result.key) {
            // Check if key has expired
            if (
              result.metadata.expiresAt &&
              new Date(result.metadata.expiresAt) < new Date()
            ) {
              // Key has expired, remove it
              expiredKeys.push(result.id);
            } else {
              keys.push(result.key);
            }
          }
        }

        // Remove expired keys asynchronously
        if (expiredKeys.length > 0) {
          Promise.all(expiredKeys.map(id => this.removeKey(id))).catch(
            console.error
          );
        }

        resolve(keys);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a specific key
   */
  async removeKey(keyId: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(keyId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove all keys for a specific user
   */
  async removeUserKeys(userId: string): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAllKeys(userId);

      request.onsuccess = () => {
        const keyIds = request.result;
        const promises = keyIds.map(id => this.removeKey(id as string));
        Promise.all(promises).then(() => resolve());
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all expired keys
   */
  async clearExpiredKeys(): Promise<void> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('expiresAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(
        IDBKeyRange.upperBound(new Date().toISOString())
      );

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value.metadata.expiresAt) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a key exists
   */
  async hasKey(keyId: string): Promise<boolean> {
    const key = await this.getKey(keyId);
    return key !== null;
  }

  /**
   * Get key metadata without the actual key
   */
  async getKeyMetadata(keyId: string): Promise<CryptoKeyMetadata | null> {
    await this.initialize();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(keyId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.metadata) {
          resolve(result.metadata);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const secureCryptoStore = new SecureCryptoStore();

// Also export the class for testing purposes
export { SecureCryptoStore };
