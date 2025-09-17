
import { localDataAdapter } from '../storage/LocalDataAdapter';
import { encryptionServiceV2 } from '../encryption-v2';
import { secureStorage } from '../security/secure-storage';

interface MigrationProgress {
  errors: Array<{
    error: string;
    id: string;
  }>;
  failed: number;
  processed: number;
  status: 'completed' | 'failed' | 'pending' | 'running';
  total: number;
}

interface LegacyItem {
  category: string;
  createdAt: string;
  data: any;
  id: string;
  updatedAt: string;
}

class DataMigrationTool {
  private static instance: DataMigrationTool;
  private encryption: typeof encryptionServiceV2;
  private progress: MigrationProgress;
  private onProgressCallback?: (progress: MigrationProgress) => void;
  private readonly LEGACY_STORAGE_PREFIX = 'legacy_';
  private readonly MIGRATION_FLAG = 'migration_completed_v1';

  private constructor() {
    this.encryption = encryptionServiceV2;
    this.progress = {
      total: 0,
      processed: 0,
      failed: 0,
      status: 'pending',
      errors: [],
    };
  }

  public static getInstance(): DataMigrationTool {
    if (!DataMigrationTool.instance) {
      DataMigrationTool.instance = new DataMigrationTool();
    }
    return DataMigrationTool.instance;
  }

  /**
   * Check if migration is needed
   */
  public async isMigrationNeeded(): Promise<boolean> {
    // Check if migration was already completed
    const migrationCompleted = await secureStorage.get(this.MIGRATION_FLAG);
    if (migrationCompleted) return false;

    // Check if there's legacy data
    const legacyData = await this.scanLegacyStorage();
    return legacyData.length > 0;
  }

  /**
   * Register progress callback
   */
  public onProgress(callback: (progress: MigrationProgress) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Start migration process
   */
  public async startMigration(): Promise<MigrationProgress> {
    try {
      // Reset progress
      this.progress = {
        total: 0,
        processed: 0,
        failed: 0,
        status: 'running',
        errors: [],
      };

      // Ensure encryption is available
      if (!(await this.encryption.areKeysUnlocked())) {
        throw new Error(
          'Encryption keys must be unlocked to perform migration'
        );
      }

      // Scan legacy storage
      const legacyData = await this.scanLegacyStorage();
      this.progress.total = legacyData.length;
      this.updateProgress();

      // Process each item
      for (const item of legacyData) {
        try {
          await this.migrateItem(item);
          this.progress.processed++;
        } catch (error) {
          this.progress.failed++;
          this.progress.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        this.updateProgress();
      }

      // Mark migration as completed
      if (this.progress.failed === 0) {
        await secureStorage.set(this.MIGRATION_FLAG, {
          completedAt: new Date().toISOString(),
        });
      }

      this.progress.status =
        this.progress.failed === 0 ? 'completed' : 'failed';
      this.updateProgress();

      return this.progress;
    } catch (error) {
      this.progress.status = 'failed';
      this.progress.errors.push({
        id: 'general',
        error: error instanceof Error ? error.message : String(error),
      });
      this.updateProgress();
      throw error;
    }
  }

  /**
   * Roll back migration
   */
  public async rollback(): Promise<void> {
    // Remove migration completed flag
    await secureStorage.remove(this.MIGRATION_FLAG);

    // Note: We don't delete migrated data as it's encrypted
    // and can be safely kept as backup
  }

  /**
   * Clean up legacy data
   * Only call this after successful migration and verification
   */
  public async cleanupLegacyData(): Promise<void> {
    const legacyData = await this.scanLegacyStorage();

    for (const item of legacyData) {
      const key = `${this.LEGACY_STORAGE_PREFIX}${item.category}_${item.id}`;
      localStorage.removeItem(key);
    }
  }

  /**
   * Scan legacy storage for items to migrate
   */
  private async scanLegacyStorage(): Promise<LegacyItem[]> {
    if (typeof window === 'undefined') return [];

    const items: LegacyItem[] = [];
    const prefix = this.LEGACY_STORAGE_PREFIX;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;

          const item = JSON.parse(raw);
          const [category, id] = key.replace(prefix, '').split('_');

          items.push({
            id,
            category,
            data: item.data,
            createdAt: item.createdAt || new Date(0).toISOString(),
            updatedAt: item.updatedAt || new Date(0).toISOString(),
          });
        } catch (error) {
          console.error('Failed to parse legacy item:', key, error);
        }
      }
    }

    return items;
  }

  /**
   * Migrate single item
   */
  private async migrateItem(item: LegacyItem): Promise<void> {
    // Encrypt the data using available method
    const dataString = JSON.stringify(item.data);
    await this.encryption.setItem(`migrated_item_${item.id}`, dataString);

    // Create new storage item
    await localDataAdapter.store(item.category, {
      id: item.id, // Preserve original ID
      data: dataString,
      metadata: {
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        version: 1,
        isEncrypted: true,
        legacyMigrated: true,
      },
    });

    // Log migration event
    await localDataAdapter.logAuditEvent('migration', 'migrate_item', {
      id: item.id,
      category: item.category,
    });
  }

  /**
   * Update progress callback
   */
  private updateProgress(): void {
    if (this.onProgressCallback) {
      this.onProgressCallback(this.progress);
    }
  }
}

export const dataMigrationTool = DataMigrationTool.getInstance();
