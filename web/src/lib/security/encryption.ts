
/**
 * Advanced Encryption Service (standardized on TweetNaCl)
 * Handles field-level encryption, key rotation, and secure storage
 */
import React from 'react';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { envConfig } from './env-config';

// Encryption settings
const KEY_LENGTH_BYTES = 32; // 256-bit symmetric
const NONCE_LENGTH = nacl.secretbox.nonceLength; // 24 bytes
const ITERATIONS = 100000;

export class EncryptionService {
  private static instance: EncryptionService;
  private enabled: boolean;
  private masterKey: null | Uint8Array = null;
  private keyCache: Map<string, Uint8Array> = new Map();

  private constructor() {
    this.enabled = envConfig.getSecurityFeatures().enableEncryption;
    if (this.enabled) {
      this.initializeMasterKey();
    }
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private async initializeMasterKey(): Promise<void> {
    try {
      const keyMaterial = await this.getKeyMaterial();
      this.masterKey = await this.deriveKey(keyMaterial, 'master');
    } catch (error) {
      console.error('Failed to initialize master key:', error);
      throw new Error('Encryption service initialization failed');
    }
  }

  private async getKeyMaterial(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(
      import.meta.env.VITE_ENCRYPTION_KEY ||
        'temporary-dev-key-replace-in-production'
    );

    return await crypto.subtle.importKey('raw', keyData, 'PBKDF2', false, [
      'deriveBits',
    ]);
  }

  private async deriveKey(
    keyMaterial: CryptoKey,
    salt: string
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const saltData = encoder.encode(salt);

    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LENGTH_BYTES * 8
    );

    return new Uint8Array(bits as ArrayBuffer);
  }

  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  public async encrypt(
    data: string,
    context?: string
  ): Promise<{ encrypted: string; iv: string }> {
    if (!this.enabled) {
      return { encrypted: data, iv: '' };
    }

    if (!this.masterKey) {
      throw new Error('Encryption service not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(data);
      const iv = this.generateRandomBytes(NONCE_LENGTH);

      const key = context ? await this.getContextKey(context) : this.masterKey;
      const ciphertext = nacl.secretbox(plaintext, iv, key);

      const encrypted = encodeBase64(ciphertext);
      const ivBase64 = encodeBase64(iv);

      return { encrypted, iv: ivBase64 };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  public async decrypt(
    encryptedData: string,
    iv: string,
    context?: string
  ): Promise<string> {
    if (!this.enabled) {
      return encryptedData;
    }

    if (!this.masterKey) {
      throw new Error('Encryption service not initialized');
    }

    try {
      const ciphertext = decodeBase64(encryptedData);
      const ivData = decodeBase64(iv);

      const key = context ? await this.getContextKey(context) : this.masterKey;
      const decrypted = nacl.secretbox.open(ciphertext, ivData, key);
      if (!decrypted) {
        throw new Error('Failed to decrypt data');
      }

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private async getContextKey(context: string): Promise<Uint8Array> {
    if (this.keyCache.has(context)) {
      return this.keyCache.get(context)!;
    }

    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const keyMaterial = await this.getKeyMaterial();
    const contextKey = await this.deriveKey(keyMaterial, context);
    this.keyCache.set(context, contextKey);

    return contextKey;
  }

  public async encryptObject<T extends Record<string, unknown>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): Promise<T & { _encryption?: Record<string, unknown> }> {
    if (!this.enabled) {
      return obj;
    }

    const encrypted = { ...obj } as T & {
      _encryption?: Record<string, unknown>;
    };
    const encryptionMetadata: Record<string, unknown> = {};

    for (const field of fieldsToEncrypt) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const value = String(obj[field]);
        const { encrypted: encryptedValue, iv } = await this.encrypt(
          value,
          String(field)
        );

        encrypted[field] = encryptedValue as T[keyof T];
        encryptionMetadata[String(field)] = { iv, encrypted: true };
      }
    }

    if (Object.keys(encryptionMetadata).length > 0) {
      encrypted._encryption = encryptionMetadata;
    }

    return encrypted;
  }

  public async decryptObject<T extends Record<string, unknown>>(
    obj: T & { _encryption?: Record<string, unknown> }
  ): Promise<T> {
    if (!this.enabled || !obj._encryption) {
      const { _encryption, ...data } = obj;
      return data as T;
    }

    const decrypted = { ...obj };
    delete decrypted._encryption;

    for (const [field, metadata] of Object.entries(obj._encryption)) {
      if ((metadata as any).encrypted && (decrypted as any)[field]) {
        try {
          (decrypted as any)[field] = (await this.decrypt(
            (decrypted as any)[field],
            (metadata as any).iv,
            field
          )) as T[keyof T];
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
        }
      }
    }

    return decrypted as T;
  }

  public async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public generateSecureToken(length: number = 32): string {
    const bytes = this.generateRandomBytes(length);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public async rotateKeys(): Promise<void> {
    if (!this.enabled) return;
    console.log('Starting key rotation...');
    this.keyCache.clear();
    await this.initializeMasterKey();
    console.log('Key rotation completed');
  }

  public secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

export const encryptionService = EncryptionService.getInstance();

export class SecureStorage {
  private prefix = 'secure_';

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const { encrypted, iv } = await encryptionService.encrypt(
        serialized,
        key
      );
      const storageData = { data: encrypted, iv, timestamp: Date.now() };
      localStorage.setItem(this.prefix + key, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<null | T> {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;
      const storageData = JSON.parse(stored);
      const decrypted = await encryptionService.decrypt(
        storageData.data,
        storageData.iv,
        key
      );
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  keys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length));
  }
}

export const secureStorage = new SecureStorage();

export function useEncryptedState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>] {
  const [state, setState] = React.useState<T>(initialValue);
  const [_loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    secureStorage.getItem<T>(key).then(value => {
      if (value !== null) {
        setState(value);
      }
      setLoading(false);
    });
  }, [key]);

  const setEncryptedState = React.useCallback(
    async (value: T) => {
      setState(value);
      await secureStorage.setItem(key, value);
    },
    [key]
  );

  return [state, setEncryptedState];
}

export function EncryptParams(...paramIndices: number[]) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const encryptedArgs = [...args];
      for (const index of paramIndices) {
        if (args[index] !== undefined) {
          const { encrypted, iv } = await encryptionService.encrypt(
            JSON.stringify(args[index])
          );
          encryptedArgs[index] = { encrypted, iv };
        }
      }
      return originalMethod.apply(this, encryptedArgs);
    };
    return descriptor;
  };
}

export function EncryptResult(
  _target: unknown,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: unknown[]) {
    const result = await originalMethod.apply(this, args);
    if (result !== undefined) {
      return await encryptionService.encrypt(JSON.stringify(result));
    }
    return result;
  };
  return descriptor;
}
