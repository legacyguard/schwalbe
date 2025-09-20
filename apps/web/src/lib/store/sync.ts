/**
 * Cross-Tab State Synchronization
 * Manages state synchronization between browser tabs and windows
 */

import { logger } from '@schwalbe/shared'
import type { StateSyncEvent } from './types'

export interface SyncOptions {
  storeName: string
  syncFields?: string[]
  conflictResolution?: 'timestamp' | 'local' | 'remote' | 'manual'
  debounceMs?: number
  maxRetries?: number
}

export interface SyncConflict {
  field: string
  localValue: any
  remoteValue: any
  localTimestamp: number
  remoteTimestamp: number
}

export type ConflictResolver = (conflicts: SyncConflict[]) => Record<string, any>

export class TabSyncManager {
  private static instances = new Map<string, TabSyncManager>()

  private storeName: string
  private syncFields?: string[]
  private conflictResolution: SyncOptions['conflictResolution']
  private debounceMs: number
  private maxRetries: number

  private listeners = new Set<(event: StateSyncEvent) => void>()
  private pendingUpdates = new Map<string, { value: any; timestamp: number }>()
  private debounceTimers = new Map<string, number>()
  private retryCounters = new Map<string, number>()

  private constructor(options: SyncOptions) {
    this.storeName = options.storeName
    this.syncFields = options.syncFields
    this.conflictResolution = options.conflictResolution || 'timestamp'
    this.debounceMs = options.debounceMs || 500
    this.maxRetries = options.maxRetries || 3

    this.initializeStorageListener()
  }

  public static getInstance(options: SyncOptions): TabSyncManager {
    const key = options.storeName
    if (!TabSyncManager.instances.has(key)) {
      TabSyncManager.instances.set(key, new TabSyncManager(options))
    }
    return TabSyncManager.instances.get(key)!
  }

  private initializeStorageListener(): void {
    window.addEventListener('storage', this.handleStorageEvent.bind(this))

    // Handle page visibility changes to sync when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.requestFullSync()
      }
    })

    // Handle beforeunload to flush pending updates
    window.addEventListener('beforeunload', () => {
      this.flushPendingUpdates()
    })
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (!event.key?.startsWith(`${this.storeName}_sync`)) return

    try {
      const syncEvent: StateSyncEvent = JSON.parse(event.newValue || '{}')

      // Ignore events from this tab
      if (syncEvent.source === 'local') return

      // Check if we should sync this field
      if (this.syncFields && !this.syncFields.includes(syncEvent.path)) return

      // Handle conflicts
      const conflict = this.detectConflict(syncEvent)
      if (conflict) {
        this.handleConflict(conflict, syncEvent)
      } else {
        this.applyRemoteChange(syncEvent)
      }

    } catch (error) {
      logger.error('Failed to parse sync event', {
        action: 'tab_sync_parse_error',
        metadata: { error, storeName: this.storeName }
      })
    }
  }

  private detectConflict(syncEvent: StateSyncEvent): SyncConflict | null {
    const pendingUpdate = this.pendingUpdates.get(syncEvent.path)

    if (!pendingUpdate) return null

    // Check if there's a time overlap that could indicate a conflict
    const timeDiff = Math.abs(syncEvent.timestamp - pendingUpdate.timestamp)
    if (timeDiff < this.debounceMs) {
      return {
        field: syncEvent.path,
        localValue: pendingUpdate.value,
        remoteValue: syncEvent.value,
        localTimestamp: pendingUpdate.timestamp,
        remoteTimestamp: syncEvent.timestamp
      }
    }

    return null
  }

  private handleConflict(conflict: SyncConflict, syncEvent: StateSyncEvent): void {
    logger.info('Detected sync conflict', {
      action: 'tab_sync_conflict',
      metadata: {
        field: conflict.field,
        localTimestamp: conflict.localTimestamp,
        remoteTimestamp: conflict.remoteTimestamp,
        storeName: this.storeName
      }
    })

    let resolvedValue: any

    switch (this.conflictResolution) {
      case 'timestamp':
        // Use the most recent change
        resolvedValue = conflict.remoteTimestamp > conflict.localTimestamp
          ? conflict.remoteValue
          : conflict.localValue
        break

      case 'local':
        // Always prefer local changes
        resolvedValue = conflict.localValue
        break

      case 'remote':
        // Always prefer remote changes
        resolvedValue = conflict.remoteValue
        break

      case 'manual':
        // Emit conflict event for manual resolution
        this.emitConflict(conflict)
        return

      default:
        resolvedValue = conflict.remoteValue
    }

    // Apply resolved value
    const resolvedEvent: StateSyncEvent = {
      ...syncEvent,
      value: resolvedValue,
      source: 'sync'
    }

    this.applyRemoteChange(resolvedEvent)
  }

  private applyRemoteChange(syncEvent: StateSyncEvent): void {
    // Remove from pending updates since it's resolved
    this.pendingUpdates.delete(syncEvent.path)

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(syncEvent)
      } catch (error) {
        logger.error('Sync listener error', {
          action: 'tab_sync_listener_error',
          metadata: { error, path: syncEvent.path }
        })
      }
    })

    logger.debug('Applied remote change', {
      action: 'tab_sync_applied',
      metadata: {
        path: syncEvent.path,
        source: syncEvent.source,
        storeName: this.storeName
      }
    })
  }

  private emitConflict(conflict: SyncConflict): void {
    const conflictEvent: StateSyncEvent = {
      type: 'state_change',
      slice: this.storeName,
      path: `__conflict__${conflict.field}`,
      value: conflict,
      timestamp: Date.now(),
      source: 'sync'
    }

    this.listeners.forEach(listener => listener(conflictEvent))
  }

  private requestFullSync(): void {
    const syncRequest: StateSyncEvent = {
      type: 'state_change',
      slice: this.storeName,
      path: '__sync_request__',
      value: null,
      timestamp: Date.now(),
      source: 'local'
    }

    this.broadcast(syncRequest)
  }

  private flushPendingUpdates(): void {
    for (const [path, update] of this.pendingUpdates) {
      const syncEvent: StateSyncEvent = {
        type: 'state_change',
        slice: this.storeName,
        path,
        value: update.value,
        timestamp: update.timestamp,
        source: 'local'
      }

      this.broadcast(syncEvent, false) // Don't debounce on flush
    }

    this.pendingUpdates.clear()
  }

  public broadcast(syncEvent: StateSyncEvent, debounce = true): void {
    const { path } = syncEvent

    // Check if we should sync this field
    if (this.syncFields && !this.syncFields.includes(path)) return

    if (debounce) {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(path)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Store pending update
      this.pendingUpdates.set(path, {
        value: syncEvent.value,
        timestamp: syncEvent.timestamp
      })

      // Set new timer
      const timer = window.setTimeout(() => {
        this.sendBroadcast(syncEvent)
        this.pendingUpdates.delete(path)
        this.debounceTimers.delete(path)
      }, this.debounceMs)

      this.debounceTimers.set(path, timer)
    } else {
      this.sendBroadcast(syncEvent)
    }
  }

  private sendBroadcast(syncEvent: StateSyncEvent): void {
    const retryCount = this.retryCounters.get(syncEvent.path) || 0

    try {
      const key = `${this.storeName}_sync_${syncEvent.path}_${syncEvent.timestamp}`
      localStorage.setItem(key, JSON.stringify(syncEvent))

      // Clean up after a short delay
      setTimeout(() => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore cleanup errors
        }
      }, 1000)

      // Reset retry counter on success
      this.retryCounters.delete(syncEvent.path)

      logger.debug('Broadcasted state change', {
        action: 'tab_sync_broadcast',
        metadata: {
          path: syncEvent.path,
          storeName: this.storeName
        }
      })

    } catch (error) {
      logger.error('Failed to broadcast state change', {
        action: 'tab_sync_broadcast_error',
        metadata: { error, path: syncEvent.path, retryCount }
      })

      // Retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          this.retryCounters.set(syncEvent.path, retryCount + 1)
          this.sendBroadcast(syncEvent)
        }, delay)
      }
    }
  }

  public subscribe(listener: (event: StateSyncEvent) => void): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public destroy(): void {
    // Clear all timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()

    // Flush pending updates
    this.flushPendingUpdates()

    // Clear listeners
    this.listeners.clear()

    // Remove from instances
    TabSyncManager.instances.delete(this.storeName)
  }

  public getStats(): {
    pendingUpdates: number
    activeTimers: number
    listeners: number
    retryingFields: number
  } {
    return {
      pendingUpdates: this.pendingUpdates.size,
      activeTimers: this.debounceTimers.size,
      listeners: this.listeners.size,
      retryingFields: this.retryCounters.size
    }
  }
}

// Utility functions
export function createTabSync(options: SyncOptions) {
  return TabSyncManager.getInstance(options)
}

export function useTabSync(
  storeName: string,
  onSync: (event: StateSyncEvent) => void,
  options: Partial<SyncOptions> = {}
) {
  const syncManager = TabSyncManager.getInstance({
    storeName,
    ...options
  })

  // Subscribe to sync events
  React.useEffect(() => {
    return syncManager.subscribe(onSync)
  }, [syncManager, onSync])

  return {
    broadcast: (path: string, value: any) => {
      const syncEvent: StateSyncEvent = {
        type: 'state_change',
        slice: storeName,
        path,
        value,
        timestamp: Date.now(),
        source: 'local'
      }
      syncManager.broadcast(syncEvent)
    },
    getStats: () => syncManager.getStats()
  }
}

// Import React at the top for the hook
import React from 'react'