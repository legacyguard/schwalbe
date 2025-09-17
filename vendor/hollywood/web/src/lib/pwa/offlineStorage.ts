
/**
 * Offline Storage Service
 * Phase 7: Mobile & PWA Capabilities
 *
 * Handles offline data storage using IndexedDB for documents,
 * analytics, and user preferences with automatic sync.
 */

interface StoredDocument {
  category: string;
  created_at: string;
  encryptedData: ArrayBuffer;
  id: string;
  lastModified: number;
  metadata: Record<string, any>;
  name: string;
  size: number;
  syncStatus: 'failed' | 'pending' | 'synced';
  type: string;
  updated_at: string;
}

interface AnalyticsEvent {
  data: Record<string, any>;
  id: string;
  syncStatus: 'failed' | 'pending' | 'synced';
  timestamp: number;
  type: string;
}

interface UserPreference {
  key: string;
  lastModified: number;
  syncStatus: 'failed' | 'pending' | 'synced';
  value: any;
}

interface OfflineQueueItem {
  data: any;
  id: string;
  maxRetries: number;
  retryCount: number;
  timestamp: number;
  type: 'analytics' | 'delete' | 'update' | 'upload';
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'LegacyGuardOffline';
  private readonly DB_VERSION = 1;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores for different data types
   */
  private createObjectStores(db: IDBDatabase): void {
    // Documents store
    if (!db.objectStoreNames.contains('documents')) {
      const documentsStore = db.createObjectStore('documents', {
        keyPath: 'id',
      });
      documentsStore.createIndex('category', 'category', { unique: false });
      documentsStore.createIndex('type', 'type', { unique: false });
      documentsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      documentsStore.createIndex('lastModified', 'lastModified', {
        unique: false,
      });
    }

    // Analytics events store
    if (!db.objectStoreNames.contains('analytics')) {
      const analyticsStore = db.createObjectStore('analytics', {
        keyPath: 'id',
      });
      analyticsStore.createIndex('type', 'type', { unique: false });
      analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
      analyticsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
    }

    // User preferences store
    if (!db.objectStoreNames.contains('preferences')) {
      const preferencesStore = db.createObjectStore('preferences', {
        keyPath: 'key',
      });
      preferencesStore.createIndex('lastModified', 'lastModified', {
        unique: false,
      });
      preferencesStore.createIndex('syncStatus', 'syncStatus', {
        unique: false,
      });
    }

    // Offline queue store
    if (!db.objectStoreNames.contains('offlineQueue')) {
      const queueStore = db.createObjectStore('offlineQueue', {
        keyPath: 'id',
      });
      queueStore.createIndex('type', 'type', { unique: false });
      queueStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Cache metadata store
    if (!db.objectStoreNames.contains('cacheMetadata')) {
      const cacheStore = db.createObjectStore('cacheMetadata', {
        keyPath: 'key',
      });
      cacheStore.createIndex('expiry', 'expiry', { unique: false });
    }
  }

  /**
   * Store document offline
   */
  async storeDocument(
    document: Omit<StoredDocument, 'lastModified' | 'syncStatus'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const storedDoc: StoredDocument = {
      ...document,
      syncStatus: 'pending',
      lastModified: Date.now(),
    };

    const transaction = this.db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(storedDoc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Document stored offline:', document.id);
  }

  /**
   * Get documents from offline storage
   */
  async getDocuments(filter?: {
    category?: string;
    limit?: number;
    type?: string;
  }): Promise<StoredDocument[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');

    return new Promise<StoredDocument[]>((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        let documents = request.result;

        // Apply filters
        if (filter?.category) {
          documents = documents.filter(doc => doc.category === filter.category);
        }

        if (filter?.type) {
          documents = documents.filter(doc => doc.type === filter.type);
        }

        // Sort by last modified (newest first)
        documents.sort((a, b) => b.lastModified - a.lastModified);

        // Apply limit
        if (filter?.limit) {
          documents = documents.slice(0, filter.limit);
        }

        resolve(documents);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<null | StoredDocument> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');

    return new Promise<null | StoredDocument>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update document sync status
   */
  async updateDocumentSyncStatus(
    id: string,
    status: 'failed' | 'pending' | 'synced'
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');

    const document = await new Promise<StoredDocument>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (document) {
      document.syncStatus = status;
      document.lastModified = Date.now();

      await new Promise<void>((resolve, reject) => {
        const request = store.put(document);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Store analytics event offline
   */
  async storeAnalyticsEvent(
    event: Omit<AnalyticsEvent, 'id' | 'syncStatus'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const storedEvent: AnalyticsEvent = {
      ...event,
      id: `${event.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      syncStatus: 'pending',
    };

    const transaction = this.db.transaction(['analytics'], 'readwrite');
    const store = transaction.objectStore('analytics');

    await new Promise<void>((resolve, reject) => {
      const request = store.add(storedEvent);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending analytics events
   */
  async getPendingAnalyticsEvents(): Promise<AnalyticsEvent[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['analytics'], 'readonly');
    const store = transaction.objectStore('analytics');
    const index = store.index('syncStatus');

    return new Promise<AnalyticsEvent[]>((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear synced analytics events
   */
  async clearSyncedAnalyticsEvents(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['analytics'], 'readwrite');
    const store = transaction.objectStore('analytics');
    const index = store.index('syncStatus');

    return new Promise<void>((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only('synced'));

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store user preference
   */
  async storePreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const preference: UserPreference = {
      key,
      value,
      lastModified: Date.now(),
      syncStatus: 'pending',
    };

    const transaction = this.db.transaction(['preferences'], 'readwrite');
    const store = transaction.objectStore('preferences');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(preference);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user preference
   */
  async getPreference(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['preferences'], 'readonly');
    const store = transaction.objectStore('preferences');

    return new Promise<any>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add item to offline queue
   */
  async addToOfflineQueue(
    item: Omit<OfflineQueueItem, 'id' | 'retryCount'>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    };

    const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('Added to offline queue:', queueItem.type, queueItem.id);
  }

  /**
   * Get offline queue items
   */
  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');

    return new Promise<OfflineQueueItem[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result;
        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from offline queue
   */
  async removeFromOfflineQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update retry count for queue item
   */
  async updateQueueItemRetryCount(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');

    const item = await new Promise<OfflineQueueItem>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (item) {
      item.retryCount++;

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Store cache data with expiry
   */
  async storeCacheData(
    key: string,
    data: any,
    ttl: number = 3600000
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cacheItem = {
      key,
      data,
      expiry: Date.now() + ttl,
      stored: Date.now(),
    };

    const transaction = this.db.transaction(['cacheMetadata'], 'readwrite');
    const store = transaction.objectStore('cacheMetadata');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache data if not expired
   */
  async getCacheData(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cacheMetadata'], 'readonly');
    const store = transaction.objectStore('cacheMetadata');

    return new Promise<any>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > result.expiry) {
          // Clean up expired cache
          this.deleteCacheData(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cache data
   */
  async deleteCacheData(key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cacheMetadata'], 'readwrite');
    const store = transaction.objectStore('cacheMetadata');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up expired cache data
   */
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cacheMetadata'], 'readwrite');
    const store = transaction.objectStore('cacheMetadata');
    const index = store.index('expiry');

    return new Promise<void>((resolve, reject) => {
      const now = Date.now();
      const request = index.openCursor(IDBKeyRange.upperBound(now));

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    analyticsCount: number;
    cacheCount: number;
    documentsCount: number;
    preferencesCount: number;
    queueCount: number;
    totalSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [
      documentsCount,
      analyticsCount,
      preferencesCount,
      queueCount,
      cacheCount,
    ] = await Promise.all([
      this.getStoreCount('documents'),
      this.getStoreCount('analytics'),
      this.getStoreCount('preferences'),
      this.getStoreCount('offlineQueue'),
      this.getStoreCount('cacheMetadata'),
    ]);

    // Get storage size estimate
    let totalSize = 0;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        totalSize = estimate.usage || 0;
      } catch (error) {
        console.warn('Could not estimate storage usage:', error);
      }
    }

    return {
      documentsCount,
      analyticsCount,
      preferencesCount,
      queueCount,
      cacheCount,
      totalSize,
    };
  }

  /**
   * Get count of items in a store
   */
  private async getStoreCount(storeName: string): Promise<number> {
    if (!this.db) return 0;

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise<number>((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = [
      'documents',
      'analytics',
      'preferences',
      'offlineQueue',
      'cacheMetadata',
    ];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('All offline data cleared');
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const offlineStorageService = OfflineStorageService.getInstance();
