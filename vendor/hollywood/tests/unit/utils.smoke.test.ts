import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import {
  decryptData,
  encryptData,
  generateSecureToken,
  hashPassword,
  verifyPassword,
} from '@/lib/secure-storage';

describe('Smoke Tests - Core Utilities', () => {
  describe('cn utility (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', 'visible')).toBe('base visible');
    });

    it('should override Tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });
  });

  describe('Encryption utilities', () => {
    const testPassword = 'test-password-123';
    const testData = { message: 'Secret data', id: 123 };

    it('should encrypt and decrypt data successfully', async () => {
      const encrypted = await encryptData(testData, testPassword);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');

      const decrypted = await decryptData(encrypted, testPassword);
      expect(decrypted).toEqual(testData);
    });

    it('should fail decryption with wrong password', async () => {
      const encrypted = await encryptData(testData, testPassword);

      await expect(decryptData(encrypted, 'wrong-password')).rejects.toThrow();
    });

    it('should generate different encrypted outputs for same data', async () => {
      const encrypted1 = await encryptData(testData, testPassword);
      const encrypted2 = await encryptData(testData, testPassword);

      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same data
      const decrypted1 = await decryptData(encrypted1, testPassword);
      const decrypted2 = await decryptData(encrypted2, testPassword);
      expect(decrypted1).toEqual(decrypted2);
    });
  });

  describe('Password hashing utilities', () => {
    const testPassword = 'MySecurePassword123!';

    it('should hash password and verify correctly', async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword);

      const isValid = await verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);

      // But both should verify with original password
      expect(await verifyPassword(testPassword, hash1)).toBe(true);
      expect(await verifyPassword(testPassword, hash2)).toBe(true);
    });
  });

  describe('Token generation', () => {
    it('should generate secure token', () => {
      const token = generateSecureToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken());
      }
      // All 100 tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it('should generate token with custom length', () => {
      const token = generateSecureToken(64);
      // Base64 encoding increases length
      expect(token.length).toBeGreaterThanOrEqual(64);
    });
  });

  describe('Date utilities', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      // These functions would need to be imported from your date utils
      // This is a placeholder for your actual date formatting functions
      expect(date.toISOString()).toContain('2024-01-15');
    });
  });

  describe('Validation utilities', () => {
    it('should validate email format', () => {
      // Placeholder - implement based on your validation utils
      const validEmails = [
        'test@example.com',
        'user.name@company.co.uk',
        'first+last@domain.org',
      ];

      const invalidEmails = [
        'not-an-email',
        '@missing-local.com',
        'missing-at-sign.com',
        'missing-domain@',
        'spaces in@email.com',
      ];

      // Basic regex for demonstration
      const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});
