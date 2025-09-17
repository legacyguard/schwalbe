/**
 * Offline-First Capabilities
 * Enhanced offline functionality with intelligent caching and sync
 */

interface OfflineFirstConfig {
  enableBackgroundSync: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  maxCacheAge: number; // milliseconds
  syncInterval: number; // milliseconds
}

interface SyncQueueItem {
  id: string;
  type: 'document' | 'guardian' | 'settings';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineFirstManager {
  private config: OfflineFirstConfig;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor(config: OfflineFirstConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    // Monitor network status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Setup background sync
    if (this.config.enableBackgroundSync && 'serviceWorker' in navigator) {
      this.setupBackgroundSync();
    }

    // Start periodic sync
    this.startPeriodicSync();
  }

  private handleOnline(): void {
    this.isOnline = true;
    console.log('📡 Back online - starting sync');
    this.processSyncQueue();
  }

  private handleOffline(): void {
    this.isOnline = false;
    console.log('📴 Gone offline - switching to offline mode');
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Register background sync for offline operations
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          (registration as any).sync.register('offline-sync').catch(console.error);
        }
      });
    }
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processSyncQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Queue data for sync when back online
   */
  public queueForSync(type: SyncQueueItem['type'], data: any): void {
    const item: SyncQueueItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.syncQueue.push(item);
    this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) return;

    this.syncInProgress = true;
    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
        
        // Retry logic
        if (item.retries < 3) {
          item.retries++;
          this.syncQueue.push(item);
        } else {
          // Max retries reached - log and discard
          console.warn(`Max retries reached for ${item.type} sync, discarding item`);
        }
      }
    }

    this.saveSyncQueue();
    this.syncInProgress = false;
  }

  /**
   * Sync individual item based on type
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'document':
        await this.syncDocument(item.data);
        break;
      case 'guardian':
        await this.syncGuardian(item.data);
        break;
      case 'settings':
        await this.syncSettings(item.data);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  private async syncDocument(data: any): Promise<void> {
    // Sync document to server
    const response = await fetch('/api/documents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Document sync failed: ${response.statusText}`);
    }
  }

  private async syncGuardian(data: any): Promise<void> {
    // Sync guardian to server
    const response = await fetch('/api/guardians/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Guardian sync failed: ${response.statusText}`);
    }
  }

  private async syncSettings(data: any): Promise<void> {
    // Sync settings to server
    const response = await fetch('/api/settings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Settings sync failed: ${response.statusText}`);
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('offline-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const saved = localStorage.getItem('offline-sync-queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  /**
   * Get offline status
   */
  public isOffline(): boolean {
    return !this.isOnline;
  }

  /**
   * Get sync queue status
   */
  public getSyncStatus(): {
    queueSize: number;
    isSyncing: boolean;
    lastSync: number | null;
  } {
    return {
      queueSize: this.syncQueue.length,
      isSyncing: this.syncInProgress,
      lastSync: this.getLastSyncTime(),
    };
  }

  private getLastSyncTime(): number | null {
    const lastSync = localStorage.getItem('last-sync-time');
    return lastSync ? parseInt(lastSync, 10) : null;
  }

  private updateLastSyncTime(): void {
    localStorage.setItem('last-sync-time', Date.now().toString());
  }
}

// Enhanced offline storage with versioning and conflict resolution
export class EnhancedOfflineStorage {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, version: number = 1) {
    this.dbName = dbName;
    this.version = version;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('userId', 'userId', { unique: false });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('guardians')) {
          const guardianStore = db.createObjectStore('guardians', { keyPath: 'id' });
          guardianStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  public async storeDocument(doc: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    
    await store.put({
      ...doc,
      updatedAt: Date.now(),
      offline: true,
    });
  }

  public async getDocuments(userId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async clearUserData(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['documents', 'guardians', 'settings'], 'readwrite');
    
    // Clear documents
    const docStore = transaction.objectStore('documents');
    const docIndex = docStore.index('userId');
    const docs = await new Promise<any[]>((resolve, reject) => {
      const request = docIndex.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const doc of docs) {
      docStore.delete(doc.id);
    }
    
    // Clear guardians
    const guardianStore = transaction.objectStore('guardians');
    const guardianIndex = guardianStore.index('userId');
    const guardians = await new Promise<any[]>((resolve, reject) => {
      const request = guardianIndex.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const guardian of guardians) {
      guardianStore.delete(guardian.id);
    }
    
    // Clear settings
    const settingsStore = transaction.objectStore('settings');
    settingsStore.delete(`user-${userId}`);
  }
}

// Export singleton instances
export const offlineFirstManager = new OfflineFirstManager({
  enableBackgroundSync: true,
  cacheStrategy: 'stale-while-revalidate',
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
  syncInterval: 5 * 60 * 1000, // 5 minutes
});

export const enhancedOfflineStorage = new EnhancedOfflineStorage('legacyguard-offline', 1);

// Initialize offline-first on app load
export function initializeOfflineFirst(): void {
  (offlineFirstManager as any).loadSyncQueue();
  console.log('🔄 Offline-first capabilities initialized');
}