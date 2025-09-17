
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localDataAdapter, type StorageItem } from './LocalDataAdapter';
import { SecureEncryptionService } from '../encryption-v2';
import { secureStorage } from '../security/secure-storage';

interface SyncQueueItem {
  category: string;
  id: string;
  operation: 'create' | 'delete' | 'update';
  retryCount: number;
  timestamp: string;
}

interface SyncStats {
  categories: Record<
    string,
    {
      failed: number;
      pending: number;
      synced: number;
    }
  >;
  failedItems: number;
  lastSync: string;
  syncedItems: number;
}

class CloudSyncAdapter {
  private static instance: CloudSyncAdapter;
  private supabase: SupabaseClient;
  private encryption: typeof SecureEncryptionService;
  private syncQueue: Map<string, SyncQueueItem>;
  private isSyncing: boolean = false;
  private readonly RETRY_LIMIT = 3;
  private readonly BATCH_SIZE = 50;

  private constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );

    this.encryption = SecureEncryptionService;
    this.syncQueue = new Map();

    // Start processing queue periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.processQueue(), 60000); // Every minute
    }
  }

  public static getInstance(): CloudSyncAdapter {
    if (!CloudSyncAdapter.instance) {
      CloudSyncAdapter.instance = new CloudSyncAdapter();
    }
    return CloudSyncAdapter.instance;
  }

  /**
   * Queue item for sync
   */
  public async queueForSync(
    item: StorageItem,
    operation: 'create' | 'delete' | 'update'
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: item.id,
      operation,
      category: item.category,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.syncQueue.set(item.id, queueItem);
    await this.logSyncEvent('queue', { item: item.id, operation });

    // Try immediate sync if queue is small
    if (this.syncQueue.size <= this.BATCH_SIZE) {
      this.processQueue().catch(console.error);
    }
  }

  /**
   * Process sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.size === 0) return;
    if (!(await this.encryption.areKeysUnlocked())) return;

    this.isSyncing = true;
    const stats: SyncStats = {
      lastSync: new Date().toISOString(),
      syncedItems: 0,
      failedItems: 0,
      categories: {},
    };

    try {
      // Process in batches
      const items = Array.from(this.syncQueue.values())
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .slice(0, this.BATCH_SIZE);

      for (const queueItem of items) {
        try {
          const item = await localDataAdapter.retrieve(queueItem.id);
          if (!item) {
            this.syncQueue.delete(queueItem.id);
            continue;
          }

          // Initialize category stats if needed
          if (!stats.categories[item.category]) {
            stats.categories[item.category] = {
              pending: 0,
              synced: 0,
              failed: 0,
            };
          }

          // Process based on operation
          switch (queueItem.operation) {
            case 'create':
            case 'update':
              await this.syncItemToCloud(item);
              stats.syncedItems++;
              stats.categories[item.category].synced++;
              break;

            case 'delete':
              await this.deleteFromCloud(item.id);
              stats.syncedItems++;
              stats.categories[item.category].synced++;
              break;
          }

          // Remove from queue if successful
          this.syncQueue.delete(queueItem.id);
          await this.logSyncEvent('success', {
            item: item.id,
            operation: queueItem.operation,
          });
        } catch (error) {
          console.error('Sync error for item:', queueItem.id, error);

          queueItem.retryCount++;
          if (queueItem.retryCount >= this.RETRY_LIMIT) {
            this.syncQueue.delete(queueItem.id);
            stats.failedItems++;
            stats.categories[queueItem.category].failed++;

            await this.logSyncEvent('error', {
              item: queueItem.id,
              operation: queueItem.operation,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } finally {
      this.isSyncing = false;
      await this.updateSyncStats(stats);
    }
  }

  /**
   * Sync single item to cloud
   */
  private async syncItemToCloud(item: StorageItem): Promise<void> {
    // Ensure item is encrypted
    if (!item.metadata.isEncrypted) {
      const encrypted = await this.encryption.encryptText(
        JSON.stringify(item.data)
      );
      if (!encrypted) {
        throw new Error('Failed to encrypt item data');
      }
      item.data = encrypted;
      item.metadata.isEncrypted = true;
    }

    // Add additional encryption layer for cloud storage
    const cloudEncrypted = await this.encryption.encryptText(
      JSON.stringify({
        data: item.data,
        metadata: {
          ...item.metadata,
          cloudEncrypted: true,
        },
      })
    );

    if (!cloudEncrypted) {
      throw new Error('Failed to encrypt for cloud storage');
    }

    // Store in Supabase encrypted_items table
    const { error } = await (this.supabase as any).from('encrypted_items').upsert({
      id: item.id,
      category: item.category,
      encrypted_data: cloudEncrypted,
      user_id: await this.getCurrentUserId(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Update local item status
    await localDataAdapter.update(item.id, {
      ...item,
      metadata: {
        ...item.metadata,
        syncStatus: 'synced',
      },
    });
  }

  /**
   * Delete item from cloud
   */
  private async deleteFromCloud(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('encrypted_items')
      .delete()
      .match({ id: itemId });

    if (error) throw error;
  }

  /**
   * Pull changes from cloud
   */
  public async pullFromCloud(): Promise<void> {
    if (!(await this.encryption.areKeysUnlocked())) {
      throw new Error('Encryption keys must be unlocked to sync');
    }

    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Get last sync timestamp
    const lastSync = await this.getLastSyncTimestamp();

    // Fetch changes since last sync
    const { data, error } = await this.supabase
      .from('encrypted_items')
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', lastSync);

    if (error) throw error;
    if (!data?.length) return;

    // Process changes
    for (const item of data) {
      try {
        // Decrypt cloud layer
        const decrypted = await this.encryption.decryptText(
          item.encrypted_data
        );
        if (!decrypted) {
          console.error('Failed to decrypt cloud item:', item.id);
          continue;
        }

        const { data, metadata } = JSON.parse(decrypted);

        // Store locally
        await localDataAdapter.update(item.id, {
          id: item.id,
          category: item.category,
          data,
          metadata: {
            ...metadata,
            syncStatus: 'synced',
          },
        });

        await this.logSyncEvent('pull_success', { item: item.id });
      } catch (error) {
        console.error('Error processing cloud item:', item.id, error);
        await this.logSyncEvent('pull_error', {
          item: item.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    await this.updateLastSyncTimestamp();
  }

  /**
   * Get sync status for category
   */
  public async getSyncStatus(category: string): Promise<{
    failed: number;
    pending: number;
    synced: number;
    total: number;
  }> {
    const items = await localDataAdapter.query({ category });

    return items.reduce(
      (acc, item) => {
        acc.total++;
        if (item.metadata.syncStatus === 'synced') acc.synced++;
        else if (item.metadata.syncStatus === 'pending') acc.pending++;
        else acc.failed++;
        return acc;
      },
      { total: 0, synced: 0, pending: 0, failed: 0 }
    );
  }

  /**
   * Force sync for category
   */
  public async forceSyncCategory(category: string): Promise<void> {
    const items = await localDataAdapter.query({ category });

    for (const item of items) {
      if (item.metadata.syncStatus !== 'synced') {
        await this.queueForSync(item, 'update');
      }
    }

    await this.processQueue();
  }

  /**
   * Get last sync timestamp
   */
  private async getLastSyncTimestamp(): Promise<string> {
    const timestamp = await secureStorage.get<string>('last_sync');
    return timestamp || new Date(0).toISOString();
  }

  /**
   * Update last sync timestamp
   */
  private async updateLastSyncTimestamp(): Promise<void> {
    await secureStorage.set(
      'last_sync',
      new Date().toISOString(),
      false // No need to encrypt timestamps
    );
  }

  /**
   * Update sync statistics
   */
  private async updateSyncStats(stats: SyncStats): Promise<void> {
    await secureStorage.set('sync_stats', stats, false); // No need to encrypt stats
  }

  /**
   * Log sync event
   */
  private async logSyncEvent(
    event: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await localDataAdapter.logAuditEvent('sync', event, details);
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<null | string> {
    const session = await this.supabase.auth.getSession();
    return session?.data?.session?.user?.id || null;
  }
}

export const cloudSyncAdapter = CloudSyncAdapter.getInstance();
