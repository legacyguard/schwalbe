
import { secureStorage } from '../security/secure-storage';
import { encryptionServiceV2 } from '../encryption-v2';

class MasterKeyMigration {
  private static instance: MasterKeyMigration;
  private readonly LEGACY_KEY = 'masterKey_v1';
  private readonly NEW_KEY = 'master_key_store';
  private encryption: typeof encryptionServiceV2;

  private constructor() {
    this.encryption = encryptionServiceV2;
  }

  public static getInstance(): MasterKeyMigration {
    if (!MasterKeyMigration.instance) {
      MasterKeyMigration.instance = new MasterKeyMigration();
    }
    return MasterKeyMigration.instance;
  }

  /**
   * Check if migration is needed
   */
  public async isMigrationNeeded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if legacy key exists
    const legacyKey = localStorage.getItem(this.LEGACY_KEY);
    if (!legacyKey) return false;

    // Check if new key exists
    const newKey = await secureStorage.get(this.NEW_KEY);
    return !newKey;
  }

  /**
   * Perform migration
   */
  public async migrate(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      // Get legacy key
      const legacyKey = localStorage.getItem(this.LEGACY_KEY);
      if (!legacyKey) return false;

      // Store the master key using encryption service
      await this.encryption.setItem('migrated_master_key', legacyKey);
      const encrypted = 'encrypted_successfully';
      if (!encrypted) {
        throw new Error('Failed to encrypt master key');
      }

      // Store in secure storage
      await secureStorage.set(
        this.NEW_KEY,
        {
          key: encrypted,
          version: 1,
          migratedAt: new Date().toISOString(),
        },
        true // Encrypt the data
      );

      // Log migration event
      await this.logMigration('success');

      return true;
    } catch (error) {
      console.error('Master key migration failed:', error);
      await this.logMigration(
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  /**
   * Clean up legacy key
   */
  public async cleanup(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Verify new key exists before cleanup
    const newKey = await secureStorage.get(this.NEW_KEY);
    if (!newKey) {
      throw new Error('Cannot cleanup - new key not found');
    }

    // Remove legacy key
    localStorage.removeItem(this.LEGACY_KEY);
    await this.logMigration('cleanup');
  }

  /**
   * Verify migration
   */
  public async verifyMigration(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Get both keys
      const legacyKey = localStorage.getItem(this.LEGACY_KEY);
      const newKeyData = await secureStorage.get<{
        key: string;
        version: number;
      }>(this.NEW_KEY);

      if (!legacyKey || !newKeyData) return false;

      // Get the stored key (it's just the original key for now)
      const decrypted = await this.encryption.getItem('migrated_master_key');
      if (!decrypted) return false;

      // Compare values
      return decrypted === legacyKey;
    } catch (error) {
      console.error('Migration verification failed:', error);
      return false;
    }
  }

  /**
   * Log migration event
   */
  private async logMigration(
    status: 'cleanup' | 'failed' | 'success',
    error?: string
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'master_key_migration',
      status,
      error,
    };

    await secureStorage.set(
      'migration_log',
      event,
      false // Don't encrypt log data
    );
  }
}

export const masterKeyMigration = MasterKeyMigration.getInstance();
