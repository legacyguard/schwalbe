
/**
 * Secure Storage Module
 * Handles secure storage of encryption keys and sensitive data
 */

interface StorageItem<T = any> {
  encrypted?: boolean;
  expiresAt?: number;
  value: T;
}

class SecureStorage {
  private memoryStorage: Map<string, StorageItem> = new Map();
  private readonly STORAGE_PREFIX = 'legacy_guard_secure_';

  /**
   * Store data in memory (session only)
   */
  setMemory<T>(key: string, value: T, ttlMs?: number): void {
    const item: StorageItem<T> = {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    };
    this.memoryStorage.set(key, item);
  }

  /**
   * Get data from memory storage
   */
  async getMemory<T>(key: string): Promise<null | T> {
    const item = this.memoryStorage.get(key);

    if (!item) {
      return null;
    }

    // Check expiration
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.memoryStorage.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Store data in local storage (persisted)
   */
  async set<T>(key: string, value: T, encrypt = false): Promise<void> {
    try {
      const storageKey = this.STORAGE_PREFIX + key;
      const item: StorageItem<T> = {
        value,
        encrypted: encrypt,
      };

      if (encrypt) {
        // In production, this would use actual encryption
        const encrypted = await this.encryptData(JSON.stringify(value));
        item.value = encrypted as any;
      }

      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to store data:', error);
      throw error;
    }
  }

  /**
   * Get data from local storage
   */
  async get<T>(key: string): Promise<null | T> {
    try {
      const storageKey = this.STORAGE_PREFIX + key;
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const item: StorageItem = JSON.parse(stored);

      if (item.encrypted && typeof item.value === 'string') {
        // In production, this would use actual decryption
        const decrypted = await this.decryptData(item.value);
        return JSON.parse(decrypted) as T;
      }

      return item.value as T;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Remove data from both memory and local storage
   */
  remove(key: string): void {
    this.memoryStorage.delete(key);
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  /**
   * Clear all secure storage
   */
  clear(): void {
    this.memoryStorage.clear();

    // Clear all items with our prefix from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    if (this.memoryStorage.has(key)) {
      const item = this.memoryStorage.get(key);
      if (item?.expiresAt && item.expiresAt < Date.now()) {
        this.memoryStorage.delete(key);
        return false;
      }
      return true;
    }

    return localStorage.getItem(this.STORAGE_PREFIX + key) !== null;
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    const memoryKeys = Array.from(this.memoryStorage.keys());
    const localKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        localKeys.push(key.replace(this.STORAGE_PREFIX, ''));
      }
    }

    return [...new Set([...memoryKeys, ...localKeys])];
  }

  /**
   * Encrypt data (simplified - in production use proper encryption)
   */
  private async encryptData(data: string): Promise<string> {
    // In production, use Web Crypto API or a proper encryption library
    // This is just a base64 encoding for demonstration
    return btoa(encodeURIComponent(data));
  }

  /**
   * Decrypt data (simplified - in production use proper decryption)
   */
  private async decryptData(encryptedData: string): Promise<string> {
    // In production, use Web Crypto API or a proper encryption library
    // This is just base64 decoding for demonstration
    return decodeURIComponent(atob(encryptedData));
  }

  /**
   * Store encryption key securely
   */
  async storeEncryptionKey(key: CryptoKey): Promise<void> {
    // In production, this would export the key and store it securely
    // For now, we'll store it in memory only
    this.setMemory('master_encryption_key', key, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Retrieve encryption key
   */
  async getEncryptionKey(): Promise<CryptoKey | null> {
    return this.getMemory<CryptoKey>('master_encryption_key');
  }

  /**
   * Check if encryption is initialized
   */
  async isEncryptionInitialized(): Promise<boolean> {
    return this.has('master_encryption_key');
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export types
export type { StorageItem };
