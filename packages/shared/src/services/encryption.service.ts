
/**
 * Encryption Service (NaCl standardization)
 * Unifies encryption across codebase using TweetNaCl secretbox (XSalsa20-Poly1305)
 */
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

export interface EncryptedData {
  algorithm: string; // e.g., 'nacl.secretbox'
  data: string; // base64 ciphertext
  iv: string; // base64 nonce (kept as 'iv' for backward compatibility)
  salt?: string; // optional base64 salt when password-derived keys are used
}

export class EncryptionService {
  private static instance: EncryptionService;
  // Symmetric key used with nacl.secretbox (32 bytes)
  private key: null | Uint8Array = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize encryption with a password using PBKDF2->32 bytes.
   * Returns the salt used (base64) so callers can persist it if desired.
   */
  async initializeWithPassword(
    password: string,
    saltB64?: string
  ): Promise<{ saltB64: string }> {
    const encoder = new TextEncoder();
    const salt = saltB64 ? decodeBase64(saltB64) : nacl.randomBytes(16);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    this.key = new Uint8Array(bits as ArrayBuffer);
    return { saltB64: encodeBase64(salt) };
  }

  /**
   * Directly set a raw 32-byte key (Uint8Array)
   */
  setKey(rawKey: Uint8Array): void {
    if (rawKey.length !== nacl.secretbox.keyLength) {
      throw new Error('Invalid key length for nacl.secretbox');
    }
    this.key = new Uint8Array(rawKey);
  }

  /**
   * Encrypt a UTF-8 string with the initialized key
   */
  async encrypt(data: string): Promise<EncryptedData> {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }

    const encoder = new TextEncoder();
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const plaintext = encoder.encode(data);
    const ciphertext = nacl.secretbox(plaintext, nonce, this.key);

    return {
      data: encodeBase64(ciphertext),
      iv: encodeBase64(nonce),
      algorithm: 'nacl.secretbox',
    };
  }

  /**
   * Decrypt to UTF-8 string with the initialized key
   */
  async decrypt(encrypted: EncryptedData): Promise<string> {
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }
    const nonce = decodeBase64(encrypted.iv);
    const ciphertext = decodeBase64(encrypted.data);
    const plaintext = nacl.secretbox.open(ciphertext, nonce, this.key);
    if (!plaintext) {
      throw new Error('Decryption failed');
    }
    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  }

  isInitialized(): boolean {
    return !!this.key;
  }

  clearKey(): void {
    this.key = null;
  }
}

export const encryptionService = EncryptionService.getInstance();
