/**
 * Tests for Encryption Service
 */

import { EncryptionService } from '@/packages/shared/src/services/encryption.service';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = EncryptionService.getInstance();
    service.clearKey();
  });

  describe('Initialization', () => {
    test('should initialize with password', async () => {
      const password = 'test-password-123';
      const result = await service.initializeWithPassword(password);

      expect(result.saltB64).toBeDefined();
      expect(service.isInitialized()).toBe(true);
    });

    test('should initialize with password and existing salt', async () => {
      const password = 'test-password-123';
      const { saltB64: firstSalt } =
        await service.initializeWithPassword(password);

      service.clearKey();
      const { saltB64: secondSalt } = await service.initializeWithPassword(
        password,
        firstSalt
      );

      expect(secondSalt).toBe(firstSalt);
      expect(service.isInitialized()).toBe(true);
    });

    test('should set raw key directly', () => {
      const key = nacl.randomBytes(32);
      service.setKey(key);

      expect(service.isInitialized()).toBe(true);
    });

    test('should throw error for invalid key length', () => {
      const invalidKey = nacl.randomBytes(16); // Wrong size

      expect(() => service.setKey(invalidKey)).toThrow('Invalid key length');
    });
  });

  describe('Encryption & Decryption', () => {
    beforeEach(async () => {
      await service.initializeWithPassword('test-password');
    });

    test('should encrypt and decrypt string data', async () => {
      const plaintext = 'Hello, World! This is a test message.';

      const encrypted = await service.encrypt(plaintext);
      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('nacl.secretbox');

      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt empty string', async () => {
      const plaintext = '';

      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt long string', async () => {
      const plaintext = 'A'.repeat(10000);

      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt unicode characters', async () => {
      const plaintext = '🔐 Šifrovaný text s diakritikau 你好 مرحبا';

      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should produce different ciphertext for same plaintext', async () => {
      const plaintext = 'Test message';

      const encrypted1 = await service.encrypt(plaintext);
      const encrypted2 = await service.encrypt(plaintext);

      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      // But both should decrypt to same plaintext
      const decrypted1 = await service.decrypt(encrypted1);
      const decrypted2 = await service.decrypt(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    test('should fail decryption with wrong key', async () => {
      const plaintext = 'Secret message';
      const encrypted = await service.encrypt(plaintext);

      // Reinitialize with different password
      await service.initializeWithPassword('wrong-password');

      await expect(service.decrypt(encrypted)).rejects.toThrow(
        'Decryption failed'
      );
    });

    test('should fail decryption with tampered data', async () => {
      const plaintext = 'Secret message';
      const encrypted = await service.encrypt(plaintext);

      // Tamper with the encrypted data
      encrypted.data = encodeBase64(nacl.randomBytes(32));

      await expect(service.decrypt(encrypted)).rejects.toThrow(
        'Decryption failed'
      );
    });

    test('should throw error when encrypting without key', async () => {
      service.clearKey();

      await expect(service.encrypt('test')).rejects.toThrow(
        'Encryption key not initialized'
      );
    });

    test('should throw error when decrypting without key', async () => {
      const encrypted = await service.encrypt('test');
      service.clearKey();

      await expect(service.decrypt(encrypted)).rejects.toThrow(
        'Encryption key not initialized'
      );
    });
  });

  describe('Key Management', () => {
    test('should clear key', async () => {
      await service.initializeWithPassword('test-password');
      expect(service.isInitialized()).toBe(true);

      service.clearKey();
      expect(service.isInitialized()).toBe(false);
    });

    test('should maintain same instance (singleton)', () => {
      const instance1 = EncryptionService.getInstance();
      const instance2 = EncryptionService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Cross-compatibility', () => {
    test('should decrypt data encrypted with same key derivation', async () => {
      const password = 'shared-password';
      const salt = encodeBase64(nacl.randomBytes(16));

      // Initialize first instance
      const service1 = EncryptionService.getInstance();
      await service1.initializeWithPassword(password, salt);

      const plaintext = 'Cross-compatible message';
      const encrypted = await service1.encrypt(plaintext);

      // Clear and reinitialize with same password and salt
      service1.clearKey();
      await service1.initializeWithPassword(password, salt);

      const decrypted = await service1.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      await service.initializeWithPassword(password);

      const plaintext = 'Test with special password';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should handle very long password', async () => {
      const password = 'x'.repeat(1000);
      await service.initializeWithPassword(password);

      const plaintext = 'Test with long password';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should handle JSON data', async () => {
      await service.initializeWithPassword('test-password');

      const data = {
        user: 'test',
        data: [1, 2, 3],
        nested: { key: 'value' },
      };

      const plaintext = JSON.stringify(data);
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(JSON.parse(decrypted)).toEqual(data);
    });
  });
});
