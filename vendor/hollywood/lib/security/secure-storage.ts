/**
 * Secure storage utilities for sensitive data
 * Uses encryption and secure storage mechanisms
 */

import { nanoid } from 'nanoid';

// Encryption key derivation
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
async function encryptData(
  data: string,
  password: string
): Promise<{
  encrypted: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoder.encode(data)
  );

  return { encrypted, salt, iv };
}

// Decrypt data
async function decryptData(
  encrypted: ArrayBuffer,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * SecureStorage class for handling sensitive data
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private sessionKey: string;
  private memoryStore: Map<string, unknown>;
  private expiryTimers: Map<string, NodeJS.Timeout>;

  private constructor() {
    // Generate a unique session key for this instance
    this.sessionKey = nanoid(32);
    this.memoryStore = new Map();
    this.expiryTimers = new Map();

    // Clear memory on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.clearAll());
    }
  }

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Store data in memory with optional expiry
   */
  public setMemory(key: string, value: unknown, expiryMs?: number): void {
    // Clear existing timer if any
    this.clearExpiry(key);

    this.memoryStore.set(key, {
      value,
      timestamp: Date.now(),
    });

    if (expiryMs) {
      const timer = setTimeout(() => {
        this.memoryStore.delete(key);
        this.expiryTimers.delete(key);
      }, expiryMs) as any;
      this.expiryTimers.set(key, timer);
    }
  }

  /**
   * Get data from memory
   */
  public getMemory<T = unknown>(key: string): null | T {
    const item = this.memoryStore.get(key);
    return item ? (item as any).value : null;
  }

  /**
   * Store encrypted data in sessionStorage
   */
  public async setSecureSession(
    key: string,
    value: unknown,
    expiryMinutes: number = 30
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const data = JSON.stringify({
        value,
        expiry: Date.now() + expiryMinutes * 60 * 1000,
      });

      const { encrypted, salt, iv } = await encryptData(data, this.sessionKey);

      const storageData = {
        e: Array.from(new Uint8Array(encrypted)),
        s: Array.from(salt),
        i: Array.from(iv),
      };

      sessionStorage.setItem(`sec_${key}`, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to store secure session data:', error);
    }
  }

  /**
   * Get encrypted data from sessionStorage
   */
  public async getSecureSession<T = unknown>(key: string): Promise<null | T> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = sessionStorage.getItem(`sec_${key}`);
      if (!stored) return null;

      const { e, s, i } = JSON.parse(stored);
      const encrypted = new Uint8Array(e).buffer;
      const salt = new Uint8Array(s);
      const iv = new Uint8Array(i);

      const decrypted = await decryptData(encrypted, this.sessionKey, salt, iv);
      const { value, expiry } = JSON.parse(decrypted);

      // Check expiry
      if (Date.now() > expiry) {
        sessionStorage.removeItem(`sec_${key}`);
        return null;
      }

      return value;
    } catch (error) {
      console.error('Failed to retrieve secure session data:', error);
      return null;
    }
  }

  /**
   * Store data in IndexedDB with encryption
   */
  public async setSecureLocal(
    key: string,
    value: unknown,
    expiryDays: number = 7
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.openIndexedDB();
      const data = JSON.stringify({
        value,
        expiry: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
      });

      const { encrypted, salt, iv } = await encryptData(data, this.sessionKey);

      const tx = db.transaction(['secure_store'], 'readwrite');
      const store = tx.objectStore('secure_store');

      await store.put({
        key,
        encrypted: Array.from(new Uint8Array(encrypted)),
        salt: Array.from(salt),
        iv: Array.from(iv),
        timestamp: Date.now(),
      });

      await new Promise(resolve => {
        tx.oncomplete = () => resolve(undefined);
      });
    } catch (error) {
      console.error('Failed to store secure local data:', error);
    }
  }

  /**
   * Get encrypted data from IndexedDB
   */
  public async getSecureLocal<T = unknown>(key: string): Promise<null | T> {
    if (typeof window === 'undefined') return null;

    try {
      const db = await this.openIndexedDB();
      const tx = db.transaction(['secure_store'], 'readonly');
      const store = tx.objectStore('secure_store');

      const request = store.get(key);
      const data = await new Promise<null | {
        encrypted: number[];
        iv: number[];
        salt: number[];
      }>(resolve => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });

      if (!data) return null;

      const encrypted = new Uint8Array(data.encrypted).buffer;
      const salt = new Uint8Array(data.salt);
      const iv = new Uint8Array(data.iv);

      const decrypted = await decryptData(encrypted, this.sessionKey, salt, iv);
      const { value, expiry } = JSON.parse(decrypted);

      // Check expiry
      if (Date.now() > expiry) {
        await store.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('Failed to retrieve secure local data:', error);
      return null;
    }
  }

  /**
   * Remove specific item
   */
  public remove(key: string): void {
    this.memoryStore.delete(key);
    this.clearExpiry(key);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`sec_${key}`);
      this.removeFromIndexedDB(key);
    }
  }

  /**
   * Clear all stored data
   */
  public clearAll(): void {
    // Clear memory
    this.memoryStore.clear();

    // Clear all expiry timers
    this.expiryTimers.forEach(timer => clearTimeout(timer));
    this.expiryTimers.clear();

    // Clear session storage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('sec_')) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear IndexedDB
      this.clearIndexedDB();
    }
  }

  /**
   * Check if running in secure context (HTTPS)
   */
  public isSecureContext(): boolean {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  /**
   * Generate secure random token
   */
  public generateToken(length: number = 32): string {
    return nanoid(length);
  }

  /**
   * Hash sensitive data for comparison
   */
  public async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Private helper methods

  private clearExpiry(key: string): void {
    const timer = this.expiryTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.expiryTimers.delete(key);
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureStorage', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('secure_store')) {
          db.createObjectStore('secure_store', { keyPath: 'key' });
        }
      };
    });
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const tx = db.transaction(['secure_store'], 'readwrite');
      const store = tx.objectStore('secure_store');
      store.delete(key);
      await new Promise(resolve => {
        tx.oncomplete = () => resolve(undefined);
      });
    } catch (error) {
      console.error('Failed to remove from IndexedDB:', error);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const tx = db.transaction(['secure_store'], 'readwrite');
      const store = tx.objectStore('secure_store');
      store.clear();
      await new Promise(resolve => {
        tx.oncomplete = () => resolve(undefined);
      });
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
    }
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Helper functions for common use cases

/**
 * Store authentication token securely
 */
export async function storeAuthToken(token: string): Promise<void> {
  await secureStorage.setSecureSession('auth_token', token, 60); // 60 minutes expiry
}

/**
 * Retrieve authentication token
 */
export async function getAuthToken(): Promise<null | string> {
  return secureStorage.getSecureSession<string>('auth_token');
}

/**
 * Store user session data
 */
export async function storeUserSession(
  userData: Record<string, any>
): Promise<void> {
  await secureStorage.setSecureSession('user_session', userData, 120); // 2 hours expiry
}

/**
 * Get user session data
 */
export async function getUserSession(): Promise<null | Record<
  string,
  unknown
>> {
  return secureStorage.getSecureSession('user_session');
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  secureStorage.remove('auth_token');
  secureStorage.remove('user_session');
}
