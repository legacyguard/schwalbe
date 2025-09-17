/**
 * Real-time Synchronization Service
 * Manages real-time data sync between web and mobile applications
 */

/* global __DEV__ */
import {
  createClient,
  type RealtimeChannel,
  type RealtimePostgresChangesPayload,
  type SupabaseClient,
} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Document {
  category: string;
  content?: string;
  created_at: string;
  id: string;
  metadata?: Record<string, any>;
  sync_status: 'offline' | 'pending' | 'synced';
  title: string;
  updated_at: string;
  user_id: string;
}

export interface SyncEvent {
  document: Document;
  timestamp: string;
  type: 'DELETE' | 'INSERT' | 'UPDATE';
}

export class RealtimeSync {
  private supabase: SupabaseClient;
  private channel: null | RealtimeChannel = null;
  private userId: null | string = null;
  private syncQueue: SyncEvent[] = [];
  private isOnline: boolean = true;
  private listeners: Map<string, (event: SyncEvent) => void> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    this.initializeNetworkListener();
  }

  /**
   * Initialize network state listener
   */
  private initializeNetworkListener() {
    // React Native network detection
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Handle online state
   */
  private async handleOnline() {
    this.isOnline = true;
    if (__DEV__)
      console.log('RealtimeSync: Network online, processing sync queue');
    await this.processSyncQueue();
  }

  /**
   * Handle offline state
   */
  private handleOffline() {
    this.isOnline = false;
    if (__DEV__) console.log('RealtimeSync: Network offline, queueing changes');
  }

  /**
   * Setup real-time document synchronization
   */
  async setupDocumentSync(userId: string): Promise<void> {
    this.userId = userId;

    // Clean up existing subscription
    if (this.channel) {
      await this.channel.unsubscribe();
    }

    // Create new channel for user-specific documents
    this.channel = this.supabase
      .channel(`documents:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          this.handleRealtimeChange(payload);
        }
      )
      .subscribe(status => {
        if (__DEV__)
          console.log(`RealtimeSync: Subscription status - ${status}`);
      });
  }

  /**
   * Handle real-time database changes
   */
  private handleRealtimeChange(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) {
    const event: SyncEvent = {
      type: payload.eventType as 'DELETE' | 'INSERT' | 'UPDATE',
      // payload.new exists on INSERT/UPDATE, payload.old on DELETE
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document: (payload.new || payload.old) as any,
      timestamp: new Date().toISOString(),
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener(event);
    });

    // Update local cache
    this.updateLocalCache(event);

    // Trigger UI updates
    this.updateGardenVisualization(event.document);
  }

  /**
   * Update garden visualization (for web dashboard)
   */
  private updateGardenVisualization(document: Document) {
    // Emit event for garden update
    const gardenEvent = new CustomEvent('garden-update', {
      detail: {
        type: 'new-leaf',
        category: document.category,
        documentId: document.id,
      },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(gardenEvent);
    }
  }

  /**
   * Update local cache
   */
  private async updateLocalCache(event: SyncEvent) {
    const cacheKey = `documents_${this.userId}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    let documents: Document[] = cachedData ? JSON.parse(cachedData) : [];

    switch (event.type) {
      case 'INSERT':
        documents.push(event.document);
        break;
      case 'UPDATE':
        documents = documents.map(doc =>
          doc.id === event.document.id ? event.document : doc
        );
        break;
      case 'DELETE':
        documents = documents.filter(doc => doc.id !== event.document.id);
        break;
    }

    await AsyncStorage.setItem(cacheKey, JSON.stringify(documents));
  }

  /**
   * Upload document with sync support
   */
  async uploadDocument(
    document: Omit<Document, 'created_at' | 'id' | 'updated_at'>
  ): Promise<Document | null> {
    if (!this.isOnline) {
      // Queue for later sync
      const queuedDoc: Document = {
        ...document,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'pending',
      };

      this.syncQueue.push({
        type: 'INSERT',
        document: queuedDoc,
        timestamp: new Date().toISOString(),
      });

      await this.saveQueueToStorage();
      return queuedDoc;
    }

    // Online upload
    const { data, error } = await this.supabase
      .from('documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      if (__DEV__) console.error('RealtimeSync: Upload error', error);
      return null;
    }

    return data;
  }

  /**
   * Process sync queue when online
   */
  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const event of queue) {
      try {
        switch (event.type) {
          case 'INSERT':
            await this.supabase.from('documents').insert([event.document]);
            break;
          case 'UPDATE':
            await this.supabase
              .from('documents')
              .update(event.document)
              .eq('id', event.document.id);
            break;
          case 'DELETE':
            await this.supabase
              .from('documents')
              .delete()
              .eq('id', event.document.id);
            break;
        }
      } catch (error) {
        if (__DEV__) console.error('RealtimeSync: Sync error', error);
        // Re-queue failed items
        this.syncQueue.push(event);
      }
    }

    if (this.syncQueue.length > 0) {
      await this.saveQueueToStorage();
    } else {
      await AsyncStorage.removeItem('sync_queue');
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveQueueToStorage() {
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Load sync queue from storage
   */
  async loadQueueFromStorage() {
    const queue = await AsyncStorage.getItem('sync_queue');
    if (queue) {
      this.syncQueue = JSON.parse(queue);
    }
  }

  /**
   * Subscribe to sync events
   */
  subscribe(id: string, callback: (event: SyncEvent) => void) {
    this.listeners.set(id, callback);
  }

  /**
   * Unsubscribe from sync events
   */
  unsubscribe(id: string) {
    this.listeners.delete(id);
  }

  /**
   * Clean up subscriptions
   */
  async cleanup() {
    if (this.channel) {
      await this.channel.unsubscribe();
    }
    this.listeners.clear();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { isOnline: boolean; queueLength: number } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
    };
  }
}
