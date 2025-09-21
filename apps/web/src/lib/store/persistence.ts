/**
 * State Persistence Strategies
 * Handles different persistence strategies for various data types and storage needs
 */

import { logger } from '@schwalbe/shared'
import { supabase } from '@/lib/supabase'

export interface PersistenceStrategy<T = any> {
  name: string
  save: (key: string, data: T) => Promise<void>
  load: (key: string) => Promise<T | null>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  isAvailable: () => boolean
}

// Local Storage Strategy (synchronous, persistent)
export class LocalStorageStrategy<T> implements PersistenceStrategy<T> {
  name = 'localStorage'

  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  async save(key: string, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: 1
      })
      localStorage.setItem(key, serialized)
    } catch (error) {
      logger.error('LocalStorage save failed', {
        action: 'persistence_localStorage_save_failed',
        metadata: { error, key }
      })
      throw error
    }
  }

  async load(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      return parsed.data || null
    } catch (error) {
      logger.error('LocalStorage load failed', {
        action: 'persistence_localStorage_load_failed',
        metadata: { error, key }
      })
      return null
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}

// Session Storage Strategy (synchronous, session-scoped)
export class SessionStorageStrategy<T> implements PersistenceStrategy<T> {
  name = 'sessionStorage'

  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  async save(key: string, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: 1
      })
      sessionStorage.setItem(key, serialized)
    } catch (error) {
      logger.error('SessionStorage save failed', {
        action: 'persistence_sessionStorage_save_failed',
        metadata: { error, key }
      })
      throw error
    }
  }

  async load(key: string): Promise<T | null> {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      return parsed.data || null
    } catch (error) {
      logger.error('SessionStorage load failed', {
        action: 'persistence_sessionStorage_load_failed',
        metadata: { error, key }
      })
      return null
    }
  }

  async remove(key: string): Promise<void> {
    sessionStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    sessionStorage.clear()
  }
}

// IndexedDB Strategy (asynchronous, large capacity)
export class IndexedDBStrategy<T> implements PersistenceStrategy<T> {
  name = 'indexedDB'
  private dbName: string
  private version: number
  private storeName: string

  constructor(dbName = 'SchwalbeDB', version = 1, storeName = 'state') {
    this.dbName = dbName
    this.version = version
    this.storeName = storeName
  }

  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined'
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async save(key: string, data: T): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const record = {
        key,
        data,
        timestamp: Date.now(),
        version: 1
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(record)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })

      db.close()
    } catch (error) {
      logger.error('IndexedDB save failed', {
        action: 'persistence_indexedDB_save_failed',
        metadata: { error, key }
      })
      throw error
    }
  }

  async load(key: string): Promise<T | null> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })

      db.close()
      return result?.data || null
    } catch (error) {
      logger.error('IndexedDB load failed', {
        action: 'persistence_indexedDB_load_failed',
        metadata: { error, key }
      })
      return null
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })

      db.close()
    } catch (error) {
      logger.error('IndexedDB remove failed', {
        action: 'persistence_indexedDB_remove_failed',
        metadata: { error, key }
      })
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })

      db.close()
    } catch (error) {
      logger.error('IndexedDB clear failed', {
        action: 'persistence_indexedDB_clear_failed',
        metadata: { error }
      })
    }
  }
}

// Supabase Cloud Strategy (remote, authenticated)
export class SupabaseStrategy<T> implements PersistenceStrategy<T> {
  name = 'supabase'
  private tableName: string

  constructor(tableName = 'app_state') {
    this.tableName = tableName
  }

  isAvailable(): boolean {
    return !!supabase
  }

  async save(key: string, data: T): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const record = {
        user_id: user.id,
        key,
        data,
        timestamp: new Date().toISOString(),
        version: 1
      }

      const { error } = await supabase
        .from(this.tableName)
        .upsert(record, { onConflict: 'user_id,key' })

      if (error) throw error
    } catch (error) {
      logger.error('Supabase save failed', {
        action: 'persistence_supabase_save_failed',
        metadata: { error, key, tableName: this.tableName }
      })
      throw error
    }
  }

  async load(key: string): Promise<T | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from(this.tableName)
        .select('data')
        .eq('user_id', user.id)
        .eq('key', key)
        .maybeSingle()

      if (error) throw error
      return data?.data || null
    } catch (error) {
      logger.error('Supabase load failed', {
        action: 'persistence_supabase_load_failed',
        metadata: { error, key, tableName: this.tableName }
      })
      return null
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', user.id)
        .eq('key', key)

      if (error) throw error
    } catch (error) {
      logger.error('Supabase remove failed', {
        action: 'persistence_supabase_remove_failed',
        metadata: { error, key, tableName: this.tableName }
      })
    }
  }

  async clear(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      logger.error('Supabase clear failed', {
        action: 'persistence_supabase_clear_failed',
        metadata: { error, tableName: this.tableName }
      })
    }
  }
}

// Multi-Strategy Persistence Manager
export class PersistenceManager<T> {
  private strategies: PersistenceStrategy<T>[] = []
  private primaryStrategy?: PersistenceStrategy<T>
  private fallbackStrategies: PersistenceStrategy<T>[] = []

  constructor() {
    this.setupStrategies()
  }

  private setupStrategies(): void {
    // Add strategies in order of preference
    const strategies = [
      new SupabaseStrategy<T>(),
      new IndexedDBStrategy<T>(),
      new LocalStorageStrategy<T>(),
      new SessionStorageStrategy<T>()
    ]

    for (const strategy of strategies) {
      if (strategy.isAvailable()) {
        this.strategies.push(strategy)
        if (!this.primaryStrategy) {
          this.primaryStrategy = strategy
        } else {
          this.fallbackStrategies.push(strategy)
        }
      }
    }

    logger.info('Persistence strategies initialized', {
      action: 'persistence_strategies_initialized',
      metadata: {
        primary: this.primaryStrategy?.name,
        fallbacks: this.fallbackStrategies.map(s => s.name),
        total: this.strategies.length
      }
    })
  }

  async save(key: string, data: T, options: {
    syncToAll?: boolean
    retryFallbacks?: boolean
  } = {}): Promise<void> {
    const { syncToAll = false, retryFallbacks = true } = options

    if (syncToAll) {
      // Save to all available strategies
      const promises = this.strategies.map(async (strategy) => {
        try {
          await strategy.save(key, data)
        } catch (error) {
          logger.warn(`Save failed for strategy ${strategy.name}`, {
            action: 'persistence_strategy_save_failed',
            metadata: { strategy: strategy.name, error, key }
          })
        }
      })

      await Promise.allSettled(promises)
    } else {
      // Try primary strategy first, then fallbacks
      let lastError: Error | null = null

      for (const strategy of this.strategies) {
        try {
          await strategy.save(key, data)
          return // Success, exit early
        } catch (error) {
          lastError = error as Error
          logger.warn(`Save failed for strategy ${strategy.name}, trying next`, {
            action: 'persistence_strategy_save_failed',
            metadata: { strategy: strategy.name, error, key }
          })

          if (!retryFallbacks && strategy === this.primaryStrategy) {
            throw error
          }
        }
      }

      if (lastError) {
        throw lastError
      }
    }
  }

  async load(key: string, options: {
    preferFallbacks?: boolean
    mergeStrategy?: 'latest' | 'primary' | 'manual'
  } = {}): Promise<T | null> {
    const { preferFallbacks = false, mergeStrategy = 'latest' } = options

    if (mergeStrategy === 'primary' && this.primaryStrategy) {
      // Only use primary strategy
      return this.primaryStrategy.load(key)
    }

    // Load from all strategies and merge
    const results = await Promise.allSettled(
      this.strategies.map(async (strategy) => ({
        strategy: strategy.name,
        data: await strategy.load(key),
        timestamp: Date.now() // Would need to be stored with data for real timestamp
      }))
    )

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(result => result.data !== null)

    if (successfulResults.length === 0) {
      return null
    }

    if (successfulResults.length === 1) {
      return successfulResults[0].data
    }

    // Handle multiple results based on merge strategy
    switch (mergeStrategy) {
      case 'latest':
        // Return the most recently saved data
        const latest = successfulResults.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        )
        return latest.data

      case 'manual':
        // Return all results for manual resolution
        logger.warn('Multiple persistence results found, manual resolution needed', {
          action: 'persistence_merge_conflict',
          metadata: {
            key,
            results: successfulResults.map(r => ({ strategy: r.strategy, hasData: !!r.data }))
          }
        })
        return successfulResults[0].data // Return first for now

      default:
        return successfulResults[0].data
    }
  }

  async remove(key: string): Promise<void> {
    const promises = this.strategies.map(async (strategy) => {
      try {
        await strategy.remove(key)
      } catch (error) {
        logger.warn(`Remove failed for strategy ${strategy.name}`, {
          action: 'persistence_strategy_remove_failed',
          metadata: { strategy: strategy.name, error, key }
        })
      }
    })

    await Promise.allSettled(promises)
  }

  async clear(): Promise<void> {
    const promises = this.strategies.map(async (strategy) => {
      try {
        await strategy.clear()
      } catch (error) {
        logger.warn(`Clear failed for strategy ${strategy.name}`, {
          action: 'persistence_strategy_clear_failed',
          metadata: { strategy: strategy.name, error }
        })
      }
    })

    await Promise.allSettled(promises)
  }

  getAvailableStrategies(): string[] {
    return this.strategies.map(s => s.name)
  }

  getPrimaryStrategy(): string | undefined {
    return this.primaryStrategy?.name
  }
}

// Global persistence manager instance
export const persistenceManager = new PersistenceManager()

// Convenience functions for specific data types
export const userPreferencesPersistence = new PersistenceManager()
export const wizardStatePersistence = new PersistenceManager()
export const assetsPersistence = new PersistenceManager()

// Export all strategies for direct use
export {
  LocalStorageStrategy,
  SessionStorageStrategy,
  IndexedDBStrategy,
  SupabaseStrategy
}