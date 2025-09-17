
/**
 * Tests for unified encryption service (TweetNaCl)
 */
import { EncryptionService } from '../encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = EncryptionService.getInstance();
  });

  afterEach(() => {
    service.clearKey();
  });

  describe('Password-based key derivation', () => {
    it('should initialize with password and return salt', async () => {
      const result = await service.initializeWithPassword('test-password');
      expect(result.saltB64).toBeDefined();
      expect(result.saltB64.length).toBeGreaterThan(0);
      expect(service.isInitialized()).toBe(true);
    });

    it('should derive same key with same password and salt', async () => {
      const result1 = await service.initializeWithPassword('test-password');
      const salt = result1.saltB64;

      // Clear and reinitialize with same salt
      service.clearKey();
      const result2 = await service.initializeWithPassword(
        'test-password',
        salt
      );

      expect(result2.saltB64).toBe(salt);
      expect(service.isInitialized()).toBe(true);
    });
  });

  describe('Encryption and decryption', () => {
    beforeEach(async () => {
      await service.initializeWithPassword('test-password');
    });

    it('should encrypt and decrypt string data', async () => {
      const plaintext = 'Hello, LegacyGuard!';

      const encrypted = await service.encrypt(plaintext);
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('nacl.secretbox');

      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt long text', async () => {
      const plaintext = 'Lorem ipsum dolor sit amet '.repeat(100);

      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const plaintext = 'Same message';

      const encrypted1 = await service.encrypt(plaintext);
      const encrypted2 = await service.encrypt(plaintext);

      // Different nonces should produce different ciphertext
      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      // But both should decrypt to same plaintext
      const decrypted1 = await service.decrypt(encrypted1);
      const decrypted2 = await service.decrypt(encrypted2);
      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it('should fail decryption with wrong key', async () => {
      const plaintext = 'Secret message';
      const encrypted = await service.encrypt(plaintext);

      // Reinitialize with different password
      service.clearKey();
      await service.initializeWithPassword('wrong-password');

      await expect(service.decrypt(encrypted)).rejects.toThrow(
        'Decryption failed'
      );
    });

    it('should fail encryption without initialized key', async () => {
      service.clearKey();
      await expect(service.encrypt('test')).rejects.toThrow(
        'Encryption key not initialized'
      );
    });
  });

  describe('Raw key management', () => {
    it('should accept raw 32-byte key', () => {
      const key = new Uint8Array(32);
      crypto.getRandomValues(key);

      service.setKey(key);
      expect(service.isInitialized()).toBe(true);
    });

    it('should reject invalid key lengths', () => {
      const shortKey = new Uint8Array(16);
      const longKey = new Uint8Array(64);

      expect(() => service.setKey(shortKey)).toThrow('Invalid key length');
      expect(() => service.setKey(longKey)).toThrow('Invalid key length');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', async () => {
      await service.initializeWithPassword('test-password');

      const encrypted = await service.encrypt('');
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', async () => {
      await service.initializeWithPassword('test-password');

      const plaintext = '👨‍👩‍👧‍👦 émojis ñ 中文 🔐';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', async () => {
      await service.initializeWithPassword('test-password');

      const plaintext = '\\n\\r\\t\\0\\"\\\'\\\\';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });
});
