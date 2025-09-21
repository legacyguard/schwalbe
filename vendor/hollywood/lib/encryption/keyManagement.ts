/**
 * Key Management Service
 * Handles secure generation, storage, retrieval, and rotation of encryption keys
 */

import * as nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
// TODO: Refactor to use proper Clerk-based Supabase client
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Password strength validation
interface PasswordStrength {
  feedback: {
    suggestions: string[];
    warning?: string;
  };
  score: number; // 0-4
}

export class KeyManagementService {
  // TODO: Properly integrate with Clerk-based Supabase client
  // private supabase = createClientComponentClient();
  private readonly PBKDF2_ITERATIONS = 100000;
  private readonly MIN_PASSWORD_SCORE = 3;

  /**
   * Generate a new keypair for encryption
   */
  generateKeyPair(): { publicKey: string; secretKey: string } {
    // For symmetric encryption, generate a single key
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    return {
      publicKey: '', // Not applicable for symmetric encryption
      secretKey: encodeBase64(key),
    };
  }

  /**
   * Derive an encryption key from a password using PBKDF2
   */
  async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256 // 32 bytes
    );

    return new Uint8Array(key);
  }

  /**
   * Encrypt the private key for storage
   */
  async encryptPrivateKey(
    privateKey: string,
    password: string,
    salt: Uint8Array
  ): Promise<{ encryptedKey: string; nonce: string }> {
    const derivedKey = await this.deriveKeyFromPassword(password, salt);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

    const privateKeyBytes = decodeBase64(privateKey);
    const encrypted = nacl.secretbox(privateKeyBytes, nonce, derivedKey);

    return {
      encryptedKey: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypt the private key from storage
   */
  async decryptPrivateKey(
    encryptedKey: string,
    password: string,
    salt: string,
    nonce: string
  ): Promise<null | string> {
    try {
      const saltBytes = decodeBase64(salt);
      const derivedKey = await this.deriveKeyFromPassword(password, saltBytes);
      const nonceBytes = decodeBase64(nonce);
      const encryptedBytes = decodeBase64(encryptedKey);

      const decrypted = nacl.secretbox.open(
        encryptedBytes,
        nonceBytes,
        derivedKey
      );

      if (!decrypted) {
        return null;
      }

      return encodeBase64(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Store user keys in the database
   */
  async storeUserKeys(
    userId: string,
    publicKey: string,
    encryptedPrivateKey: string,
    salt: string,
    nonce: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_encryption_keys')
        .insert({
          user_id: userId,
          public_key: publicKey,
          encrypted_private_key: encryptedPrivateKey,
          salt,
          nonce,
          is_active: true,
          created_at: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Failed to store keys:', error);
      return false;
    }
  }

  /**
   * Retrieve user keys from the database
   */
  async retrieveUserKeys(userId: string): Promise<null | {
    encryptedPrivateKey: string;
    nonce: string;
    publicKey: string;
    salt: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .select('public_key, encrypted_private_key, salt, nonce')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        publicKey: data.public_key,
        encryptedPrivateKey: data.encrypted_private_key,
        salt: data.salt,
        nonce: data.nonce,
      };
    } catch (error) {
      console.error('Failed to retrieve keys:', error);
      return null;
    }
  }

  /**
   * Rotate encryption keys
   */
  async rotateKeys(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Retrieve current keys
      const currentKeys = await this.retrieveUserKeys(userId);
      if (!currentKeys) {
        return false;
      }

      // Decrypt old private key
      const privateKey = await this.decryptPrivateKey(
        currentKeys.encryptedPrivateKey,
        oldPassword,
        currentKeys.salt,
        currentKeys.nonce
      );

      if (!privateKey) {
        return false;
      }

      // Generate new salt and encrypt with new password
      const newSalt = nacl.randomBytes(16);
      const { encryptedKey, nonce } = await this.encryptPrivateKey(
        privateKey,
        newPassword,
        newSalt
      );

      // Start transaction to update keys
      const { error: deactivateError } = await this.supabase
        .from('user_encryption_keys')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (deactivateError) {
        return false;
      }

      // Store new keys
      const success = await this.storeUserKeys(
        userId,
        currentKeys.publicKey,
        encryptedKey,
        encodeBase64(newSalt),
        nonce
      );

      // Log rotation in history
      if (success) {
        await this.supabase.from('key_rotation_history').insert({
          user_id: userId,
          rotation_reason: 'Password change',
          rotation_method: 'Manual',
          rotated_at: new Date().toISOString(),
        });
      }

      return success;
    } catch (error) {
      console.error('Key rotation failed:', error);
      return false;
    }
  }

  /**
   * Mark a key as compromised
   */
  async markKeyCompromised(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_encryption_keys')
        .update({
          is_compromised: true,
          is_active: false,
          compromised_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!error) {
        // Log the compromise
        await this.supabase.from('key_access_logs').insert({
          user_id: userId,
          operation: 'compromise',
          success: true,
          timestamp: new Date().toISOString(),
          details: 'Key marked as compromised by user',
        });
      }

      return !error;
    } catch (error) {
      console.error('Failed to mark key as compromised:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  async validatePasswordStrength(password: string): Promise<PasswordStrength> {
    // Basic password strength check
    // In production, use a library like zxcvbn
    const score = this.calculatePasswordScore(password);
    const feedback = this.getPasswordFeedback(password, score);

    return { score, feedback };
  }

  private calculatePasswordScore(password: string): number {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return Math.min(score, 4);
  }

  private getPasswordFeedback(
    password: string,
    score: number
  ): PasswordStrength['feedback'] {
    const suggestions: string[] = [];

    if (password.length < 8) {
      suggestions.push('Use at least 8 characters');
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      suggestions.push('Use both uppercase and lowercase letters');
    }
    if (!/\d/.test(password)) {
      suggestions.push('Include at least one number');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      suggestions.push('Include at least one special character');
    }

    const warning =
      score < this.MIN_PASSWORD_SCORE
        ? 'Password is too weak. Please choose a stronger password.'
        : undefined;

    return { warning, suggestions };
  }

  /**
   * Generate recovery codes
   */
  generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const bytes = nacl.randomBytes(6);
      const code =
        Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()
          .match(/.{4}/g)
          ?.join('-') || '';
      codes.push(code);
    }
    return codes;
  }

  /**
   * Check if key rotation is needed
   */
  async checkKeyRotationNeeded(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .select('created_at, rotation_count')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if key is older than 90 days
      const keyAge = Date.now() - new Date(data.created_at).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;

      return keyAge > ninetyDays;
    } catch (error) {
      console.error('Failed to check key rotation:', error);
      return false;
    }
  }

  /**
   * Handle failed key access attempt
   */
  async handleFailedKeyAccess(userId: string, reason: string): Promise<void> {
    try {
      // Log the failed attempt
      await this.supabase.from('key_access_logs').insert({
        user_id: userId,
        operation: 'retrieve',
        success: false,
        timestamp: new Date().toISOString(),
        failure_reason: reason,
      });

      // Update failed attempts counter
      const { data } = await this.supabase
        .from('user_encryption_keys')
        .select('failed_attempts')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (data) {
        const newAttempts = (data.failed_attempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          await this.supabase
            .from('user_encryption_keys')
            .update({
              failed_attempts: newAttempts,
              locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
            })
            .eq('user_id', userId)
            .eq('is_active', true);
        } else {
          await this.supabase
            .from('user_encryption_keys')
            .update({ failed_attempts: newAttempts })
            .eq('user_id', userId)
            .eq('is_active', true);
        }
      }
    } catch (error) {
      console.error('Failed to handle failed access:', error);
    }
  }

  /**
   * Reset failed attempts after successful access
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_encryption_keys')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_accessed: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_active', true);
    } catch (error) {
      console.error('Failed to reset attempts:', error);
    }
  }
}

// Export singleton instance
export const keyManagementService = new KeyManagementService();
