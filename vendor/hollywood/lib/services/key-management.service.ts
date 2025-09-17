/**
 * Server-side Key Management Service
 * Handles secure key generation, storage, and retrieval
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { pbkdf2, randomBytes } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface EncryptedKeyData {
  encryptedPrivateKey: string;
  iterations: number;
  nonce: string;
  publicKey: string;
  salt: string;
}

export interface KeyMetadata {
  algorithm: string;
  createdAt: string;
  isActive: boolean;
  keyVersion: number;
  lastRotatedAt: string;
}

export class KeyManagementService {
  private supabase: SupabaseClient;
  private readonly ITERATIONS = 100000; // PBKDF2 iterations
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly SALT_LENGTH = 16; // 128 bits

  constructor(supabaseUrl?: string, supabaseServiceKey?: string) {
    const url =
      supabaseUrl ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Supabase configuration missing for key management');
    }

    this.supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Generate a new key pair for a user
   */
  public generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  /**
   * Derive encryption key from user password using PBKDF2
   */
  private async deriveKeyFromPassword(
    password: string,
    salt: Buffer
  ): Promise<Buffer> {
    return pbkdf2Async(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Encrypt private key with derived key
   */
  private encryptPrivateKey(
    privateKey: string,
    derivedKey: Buffer,
    nonce: Uint8Array
  ): string {
    const privateKeyBytes = decodeBase64(privateKey);

    // Use the derived key for symmetric encryption
    const encrypted = nacl.secretbox(
      privateKeyBytes,
      nonce,
      new Uint8Array(derivedKey)
    );

    return encodeBase64(encrypted);
  }

  /**
   * Decrypt private key with derived key
   */
  private decryptPrivateKey(
    encryptedPrivateKey: string,
    derivedKey: Buffer,
    nonce: string
  ): null | string {
    const encryptedBytes = decodeBase64(encryptedPrivateKey);
    const nonceBytes = decodeBase64(nonce);

    const decrypted = nacl.secretbox.open(
      encryptedBytes,
      nonceBytes,
      new Uint8Array(derivedKey)
    );

    if (!decrypted) {
      return null;
    }

    return encodeBase64(decrypted);
  }

  /**
   * Create and store encrypted keys for a user
   */
  public async createUserKeys(
    userId: string,
    password: string
  ): Promise<{ error?: string; publicKey?: string; success: boolean; }> {
    try {
      // Check if user already has keys
      const { data: existing } = await this.supabase
        .from('user_encryption_keys')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'User already has active encryption keys',
        };
      }

      // Generate new key pair
      const keyPair = this.generateKeyPair();

      // Generate salt and nonce
      const salt = randomBytes(this.SALT_LENGTH);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Derive key from password
      const derivedKey = await this.deriveKeyFromPassword(password, salt);

      // Encrypt private key
      const encryptedPrivateKey = this.encryptPrivateKey(
        keyPair.privateKey,
        derivedKey,
        nonce
      );

      // Store in database
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .insert({
          user_id: userId,
          encrypted_private_key: encryptedPrivateKey,
          public_key: keyPair.publicKey,
          salt: salt.toString('base64'),
          nonce: encodeBase64(nonce),
          iterations: this.ITERATIONS,
          algorithm: 'nacl.box',
          is_active: true,
        })
        .select('public_key')
        .single();

      if (error) {
        console.error('Failed to store encryption keys:', error);
        return { success: false, error: 'Failed to store keys' };
      }

      // Log key generation
      await this.logKeyAccess(userId, 'generate', true);

      return {
        success: true,
        publicKey: data.public_key,
      };
    } catch (error) {
      console.error('Key creation error:', error);
      await this.logKeyAccess(userId, 'generate', false, String(error));
      return {
        success: false,
        error: 'Failed to create encryption keys',
      };
    }
  }

  /**
   * Retrieve and decrypt user's private key
   */
  public async getUserPrivateKey(
    userId: string,
    password: string
  ): Promise<{
    error?: string;
    privateKey?: string;
    publicKey?: string;
    success: boolean;
  }> {
    try {
      // Get encrypted key data
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .select(
          'encrypted_private_key, public_key, salt, nonce, iterations, locked_until'
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_compromised', false)
        .single();

      if (error || !data) {
        await this.handleFailedAccess(userId, 'Keys not found');
        return { success: false, error: 'Keys not found' };
      }

      // Check if account is locked
      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        const minutesLeft = Math.ceil(
          (new Date(data.locked_until).getTime() - Date.now()) / 60000
        );
        return {
          success: false,
          error: `Account locked. Try again in ${minutesLeft} minutes`,
        };
      }

      // Derive key from password
      const salt = Buffer.from(data.salt, 'base64');
      const derivedKey = await this.deriveKeyFromPassword(password, salt);

      // Decrypt private key
      const privateKey = this.decryptPrivateKey(
        data.encrypted_private_key,
        derivedKey,
        data.nonce
      );

      if (!privateKey) {
        await this.handleFailedAccess(userId, 'Invalid password');
        return { success: false, error: 'Invalid password' };
      }

      // Reset failed attempts on successful access
      await this.supabase
        .from('user_encryption_keys')
        .update({
          failed_access_attempts: 0,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Log successful access
      await this.logKeyAccess(userId, 'retrieve', true);

      return {
        success: true,
        privateKey,
        publicKey: data.public_key,
      };
    } catch (error) {
      console.error('Key retrieval error:', error);
      await this.handleFailedAccess(userId, String(error));
      return {
        success: false,
        error: 'Failed to retrieve keys',
      };
    }
  }

  /**
   * Get user's public key (no password required)
   */
  public async getUserPublicKey(
    userId: string
  ): Promise<{
    error?: string;
    metadata?: KeyMetadata;
    publicKey?: string;
    success: boolean;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_encryption_keys')
        .select(
          'public_key, key_version, algorithm, created_at, last_rotated_at, is_active'
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_compromised', false)
        .single();

      if (error || !data) {
        return { success: false, error: 'Public key not found' };
      }

      return {
        success: true,
        publicKey: data.public_key,
        metadata: {
          keyVersion: data.key_version,
          algorithm: data.algorithm,
          createdAt: data.created_at,
          lastRotatedAt: data.last_rotated_at,
          isActive: data.is_active,
        },
      };
    } catch (error) {
      console.error('Public key retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve public key',
      };
    }
  }

  /**
   * Rotate user's encryption keys
   */
  public async rotateUserKeys(
    userId: string,
    currentPassword: string,
    newPassword?: string
  ): Promise<{ error?: string; newPublicKey?: string; success: boolean; }> {
    try {
      // First, verify current password and get current keys
      const currentKeys = await this.getUserPrivateKey(userId, currentPassword);
      if (!currentKeys.success || !currentKeys.privateKey) {
        return { success: false, error: 'Invalid current password' };
      }

      // Generate new key pair
      const newKeyPair = this.generateKeyPair();

      // Use new password if provided, otherwise use current
      const passwordToUse = newPassword || currentPassword;

      // Generate new salt and nonce
      const salt = randomBytes(this.SALT_LENGTH);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

      // Derive key from password
      const derivedKey = await this.deriveKeyFromPassword(passwordToUse, salt);

      // Encrypt new private key
      const encryptedPrivateKey = this.encryptPrivateKey(
        newKeyPair.privateKey,
        derivedKey,
        nonce
      );

      // Call rotation function
      const { error } = await this.supabase.rpc('rotate_user_key', {
        p_user_id: userId,
        p_new_encrypted_private_key: encryptedPrivateKey,
        p_new_public_key: newKeyPair.publicKey,
        p_new_salt: salt.toString('base64'),
        p_new_nonce: encodeBase64(nonce),
        p_reason: newPassword ? 'Password change' : 'Manual rotation',
      });

      if (error) {
        console.error('Key rotation error:', error);
        return { success: false, error: 'Failed to rotate keys' };
      }

      return {
        success: true,
        newPublicKey: newKeyPair.publicKey,
      };
    } catch (error) {
      console.error('Key rotation error:', error);
      return {
        success: false,
        error: 'Failed to rotate keys',
      };
    }
  }

  /**
   * Check if key rotation is needed
   */
  public async checkRotationNeeded(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase.rpc('check_key_rotation_needed', {
        p_user_id: userId,
      });

      return data || false;
    } catch (error) {
      console.error('Rotation check error:', error);
      return false;
    }
  }

  /**
   * Setup key recovery
   */
  public async setupRecovery(
    userId: string,
    method: 'backup_phrase' | 'guardian' | 'security_questions',
    recoveryData: Record<string, any>
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      // Update recovery settings
      const { error: updateError } = await this.supabase
        .from('user_encryption_keys')
        .update({
          recovery_enabled: true,
          recovery_method: method,
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (updateError) {
        return { success: false, error: 'Failed to enable recovery' };
      }

      // Store recovery data
      const { error: insertError } = await this.supabase
        .from('user_key_recovery')
        .upsert({
          user_id: userId,
          ...recoveryData,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        return { success: false, error: 'Failed to store recovery data' };
      }

      return { success: true };
    } catch (error) {
      console.error('Recovery setup error:', error);
      return {
        success: false,
        error: 'Failed to setup recovery',
      };
    }
  }

  /**
   * Mark keys as compromised
   */
  public async markKeysCompromised(
    userId: string,
    reason: string
  ): Promise<{ error?: string; success: boolean; }> {
    try {
      const { error } = await this.supabase
        .from('user_encryption_keys')
        .update({
          is_compromised: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        return { success: false, error: 'Failed to mark keys as compromised' };
      }

      // Log security event
      await this.logKeyAccess(
        userId,
        'delete',
        true,
        `Keys marked compromised: ${reason}`
      );

      return { success: true };
    } catch (error) {
      console.error('Compromise marking error:', error);
      return {
        success: false,
        error: 'Failed to mark keys as compromised',
      };
    }
  }

  // Private helper methods

  private async handleFailedAccess(
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      await this.supabase.rpc('handle_failed_key_access', {
        p_user_id: userId,
        p_reason: reason,
      });
    } catch (error) {
      console.error('Failed to handle failed access:', error);
    }
  }

  private async logKeyAccess(
    userId: string,
    accessType: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    try {
      await this.supabase.from('key_access_logs').insert({
        user_id: userId,
        access_type: accessType,
        success,
        failure_reason: failureReason,
        accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log key access:', error);
    }
  }

  /**
   * Validate password strength
   */
  public validatePasswordStrength(password: string): {
    errors: string[];
    isValid: boolean;
  } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
let keyManagementInstance: KeyManagementService | null = null;

export function getKeyManagementService(): KeyManagementService {
  if (!keyManagementInstance) {
    keyManagementInstance = new KeyManagementService();
  }
  return keyManagementInstance;
}
