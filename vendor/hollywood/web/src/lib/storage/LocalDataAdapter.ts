
export interface StorageItem {
  category: string;
  data: unknown;
  id: string;
  metadata: {
    createdAt: string;
    isEncrypted: boolean;
    syncStatus?: 'local' | 'pending' | 'synced';
    updatedAt: string;
    version: number;
  };
}

export interface StorageQuery {
  category: string;
  filter?: Record<string, unknown>;
  limit?: number;
  offset?: number;
}

export type SyncMode = 'full-sync' | 'hybrid' | 'local-only';

class LocalDataAdapter {
  private static instance: LocalDataAdapter;
  private readonly DB_NAME = 'LegacyGuardLocal';
  private readonly STORE_NAME = 'encrypted_data';
  private readonly AUDIT_STORE = 'audit_log';
  private db: IDBDatabase | null = null;
  private syncMode: SyncMode = 'local-only';
  private lastActivity: number = Date.now();
  private ___lockTimer: null | ReturnType<typeof setTimeout> = null;
  private syncTimer: null | ReturnType<typeof setInterval> = null;

  private constructor() {
    this.initializeDB().catch(console.error);
    this.setupActivityMonitoring();
  }

  public static getInstance(): LocalDataAdapter {
    if (!LocalDataAdapter.instance) {
      LocalDataAdapter.instance = new LocalDataAdapter();
    }
    return LocalDataAdapter.instance;
  }

  /**
   * Initialize IndexedDB database
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Main data store
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: 'id',
          });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('syncStatus', 'metadata.syncStatus', {
            unique: false,
          });
        }

        // Audit log store
        if (!db.objectStoreNames.contains(this.AUDIT_STORE)) {
          const auditStore = db.createObjectStore(this.AUDIT_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  /**
   * Set sync mode
   */
  public async setSyncMode(mode: SyncMode): Promise<void> {
    this.syncMode = mode;
    await this.logAuditEvent('system', 'set_sync_mode', { mode });

    // Start or stop sync based on mode
    if (mode !== 'local-only') {
      this.startPeriodicSync();
    } else {
      this.stopPeriodicSync();
    }
  }

  /**
   * Store item
   */
  public async store(category: string, data: unknown): Promise<StorageItem> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const item: StorageItem = {
        id,
        category,
        data,
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: 1,
          isEncrypted: false,
          syncStatus: this.syncMode === 'local-only' ? 'local' : 'pending',
        },
      };

      const tx = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.put(item);

      request.onsuccess = async () => {
        // Log the event
        await this.logAuditEvent(category, 'create', { id });

        // Trigger sync if needed
        if (this.syncMode !== 'local-only') {
          this.triggerSync();
        }

        resolve(item);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve item
   */
  public async retrieve(id: string): Promise<null | StorageItem> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query items
   */
  public async query(params: StorageQuery): Promise<StorageItem[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const categoryIndex = store.index('category');
      const request = categoryIndex.getAll(params.category);

      request.onsuccess = () => {
        let items = request.result;

        // Apply filters if any
        if (params.filter) {
          items = items.filter(item => {
            for (const [key, value] of Object.entries(params.filter!)) {
              if (item.data[key] !== value) return false;
            }
            return true;
          });
        }

        // Apply pagination
        if (params.offset != null || params.limit != null) {
          const start = params.offset || 0;
          const end = params.limit ? start + params.limit : undefined;
          items = items.slice(start, end);
        }

        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update item
   */
  public async update(id: string, data: unknown): Promise<null | StorageItem> {
    if (!this.db) await this.initializeDB();

    // Get existing item
    const existing = await this.retrieve(id);
    if (!existing) return null;

    return new Promise((resolve, reject) => {
      const updated: StorageItem = {
        ...existing,
        data,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date().toISOString(),
          version: existing.metadata.version + 1,
          syncStatus: this.syncMode === 'local-only' ? 'local' : 'pending',
        },
      };

      const tx = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.put(updated);

      request.onsuccess = async () => {
        // Log the event
        await this.logAuditEvent(existing.category, 'update', { id });

        // Trigger sync if needed
        if (this.syncMode !== 'local-only') {
          this.triggerSync();
        }

        resolve(updated);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete item
   */
  public async delete(id: string): Promise<void> {
    if (!this.db) await this.initializeDB();

    const existing = await this.retrieve(id);
    if (!existing) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = async () => {
        // Log the event
        await this.logAuditEvent(existing.category, 'delete', { id });

        // Trigger sync if needed
        if (this.syncMode !== 'local-only') {
          this.triggerSync();
        }

        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all data
   */
  public async exportData(): Promise<null | string> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(JSON.stringify(request.result, null, 2));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Log audit event
   */
  public async logAuditEvent(
    category: string,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const event = {
        timestamp: new Date().toISOString(),
        category,
        action,
        details,
        syncMode: this.syncMode,
      };

      const tx = this.db!.transaction(this.AUDIT_STORE, 'readwrite');
      const store = tx.objectStore(this.AUDIT_STORE);
      const request = store.add(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Setup activity monitoring
   */
  private setupActivityMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Update last activity timestamp
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    // Monitor user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    // Check for inactivity every minute
    setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      const lockTimeout = 15 * 60 * 1000; // 15 minutes

      if (inactiveTime >= lockTimeout) {
        this.lock();
      }
    }, 60000);
  }

  /**
   * Lock the session
   */
  private async lock(): Promise<void> {
    // Stop sync
    this.stopPeriodicSync();

    // Log event
    await this.logAuditEvent('system', 'lock', {
      reason: 'inactivity',
      inactiveTime: Date.now() - this.lastActivity,
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(
      () => {
        this.triggerSync();
      },
      10 * 60 * 1000
    ); // 10 minutes
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Trigger sync process
   */
  private async triggerSync(): Promise<void> {
    // This will be implemented in CloudSyncAdapter
    // For now, just log the event
    await this.logAuditEvent('system', 'sync_triggered', {
      mode: this.syncMode,
    });
  }
}

export const localDataAdapter = LocalDataAdapter.getInstance();
