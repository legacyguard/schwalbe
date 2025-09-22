/**
 * Custom Zustand Middleware for State Management
 * Provides validation, synchronization, and enhanced persistence
 */

import { config } from '@/lib/env';

import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { logger } from '@schwalbe/shared'
import type { StateValidationRule, StateSyncEvent } from './types'

// State Validation Middleware
type StateValidator<T> = (
  f: StateCreator<T, [], [], T>,
  rules: StateValidationRule<T>[]
) => StateCreator<T, [], [], T>

const stateValidatorImpl: StateValidator<any> = (f, rules) => (set, get, store) => {
  const validatedSet: typeof set = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(get()) : partial
    const currentState = get()
    const mergedState = replace ? nextState : { ...currentState, ...nextState }

    // Run validations
    const errors: string[] = []
    for (const rule of rules) {
      const value = mergedState[rule.field]
      const result = rule.validator(value, mergedState)

      if (result !== true) {
        const errorMessage = typeof result === 'string' ? result : rule.message || `Validation failed for ${String(rule.field)}`
        errors.push(errorMessage)
      }
    }

    if (errors.length > 0) {
      logger.warn('State validation failed', {
        action: 'state_validation_failed',
        metadata: { errors, field: rules.map(r => r.field) }
      })

      // Optionally prevent the state update
      // For now, we'll just log and continue
    }

    set(partial, replace)
  }

  return f(validatedSet, get, store)
}

export const stateValidator = stateValidatorImpl as unknown as <T>(
  rules: StateValidationRule<T>[]
) => <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs, T>
) => StateCreator<T, Mps, Mcs, T>

// Cross-tab Synchronization Middleware
type TabSync<T> = (
  f: StateCreator<T, [], [], T>,
  options: { key: string; syncFields?: (keyof T)[] }
) => StateCreator<T, [], [], T>

const tabSyncImpl: TabSync<any> = (f, options) => (set, get, store) => {
  const { key, syncFields } = options

  // Listen for storage events from other tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === `${key}_sync` && e.newValue) {
      try {
        const syncEvent: StateSyncEvent = JSON.parse(e.newValue)

        if (syncEvent.source !== 'local') {
          const currentState = get()

          // Apply the change if we're syncing this field
          if (!syncFields || syncFields.includes(syncEvent.path as keyof typeof currentState)) {
            const updatedState = {
              ...currentState,
              [syncEvent.path]: syncEvent.value
            }

            set(updatedState, false)

            logger.debug('Applied cross-tab state sync', {
              action: 'tab_sync_applied',
              metadata: { path: syncEvent.path, source: syncEvent.source }
            })
          }
        }
      } catch (error) {
        logger.error('Failed to parse cross-tab sync event', {
          action: 'tab_sync_parse_failed',
          metadata: { error }
        })
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  const syncAwareSet: typeof set = (partial, replace) => {
    const currentState = get()
    const nextState = typeof partial === 'function' ? partial(currentState) : partial

    // Broadcast changes to other tabs
    if (typeof nextState === 'object' && nextState !== null) {
      Object.keys(nextState).forEach(path => {
        if (!syncFields || syncFields.includes(path as any)) {
          const syncEvent: StateSyncEvent = {
            type: 'state_change',
            slice: key,
            path,
            value: (nextState as any)[path],
            timestamp: Date.now(),
            source: 'local'
          }

          try {
            localStorage.setItem(`${key}_sync`, JSON.stringify(syncEvent))
            // Remove after a short delay to trigger the event
            setTimeout(() => {
              localStorage.removeItem(`${key}_sync`)
            }, 100)
          } catch (error) {
            logger.error('Failed to broadcast state change', {
              action: 'tab_sync_broadcast_failed',
              metadata: { error, path }
            })
          }
        }
      })
    }

    set(partial, replace)
  }

  // Cleanup listener when store is destroyed
  store.destroy = () => {
    window.removeEventListener('storage', handleStorageChange)
  }

  return f(syncAwareSet, get, store)
}

export const tabSync = tabSyncImpl as unknown as <T>(
  options: { key: string; syncFields?: (keyof T)[] }
) => <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs, T>
) => StateCreator<T, Mps, Mcs, T>

// Enhanced Persistence Middleware
interface PersistOptions<T> {
  name: string
  storage?: Storage
  partialize?: (state: T) => Partial<T>
  version?: number
  migrate?: (persistedState: any, version: number) => T
  merge?: (persistedState: any, currentState: T) => T
  onRehydrateStorage?: (state: T) => ((state?: T, error?: Error) => void) | void
  skipHydration?: boolean
  serialize?: {
    serialize: (state: any) => string
    deserialize: (str: string) => any
  }
}

type PersistWithEnhancements<T> = (
  f: StateCreator<T, [], [], T>,
  options: PersistOptions<T>
) => StateCreator<T, [], [], T>

const persistWithEnhancementsImpl: PersistWithEnhancements<any> = (f, options) => (set, get, store) => {
  const {
    name,
    storage = localStorage,
    partialize,
    version = 0,
    migrate,
    merge,
    onRehydrateStorage,
    skipHydration = false,
    serialize = { serialize: JSON.stringify, deserialize: JSON.parse }
  } = options

  let hasHydrated = false

  // Enhanced state setter that persists to storage
  const persistentSet: typeof set = (partial, replace) => {
    set(partial, replace)

    if (hasHydrated) {
      const state = get()
      const stateToStore = partialize ? partialize(state) : state

      try {
        const serializedState = serialize.serialize({
          state: stateToStore,
          version
        })
        storage.setItem(name, serializedState)
      } catch (error) {
        logger.error('Failed to persist state', {
          action: 'state_persist_failed',
          metadata: { error, storeName: name }
        })
      }
    }
  }

  // Hydrate from storage
  const hydrate = () => {
    if (skipHydration) {
      hasHydrated = true
      return
    }

    try {
      const item = storage.getItem(name)
      if (item) {
        const { state: persistedState, version: persistedVersion } = serialize.deserialize(item)

        let stateToMerge = persistedState

        // Run migration if needed
        if (migrate && persistedVersion !== version) {
          stateToMerge = migrate(persistedState, persistedVersion)
        }

        const currentState = get()
        const mergedState = merge ? merge(stateToMerge, currentState) : { ...currentState, ...stateToMerge }

        set(mergedState, true)

        logger.debug('State hydrated from storage', {
          action: 'state_hydrated',
          metadata: { storeName: name, version: persistedVersion }
        })
      }
    } catch (error) {
      logger.error('Failed to hydrate state', {
        action: 'state_hydrate_failed',
        metadata: { error, storeName: name }
      })
    } finally {
      hasHydrated = true
      if (onRehydrateStorage) {
        const callback = onRehydrateStorage(get())
        if (callback) {
          callback(get())
        }
      }
    }
  }

  // Initialize the store
  const storeInitializer = f(persistentSet, get, store)

  // Hydrate after initialization
  setTimeout(hydrate, 0)

  return storeInitializer
}

export const persistWithEnhancements = persistWithEnhancementsImpl as unknown as <T>(
  options: PersistOptions<T>
) => <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs, T>
) => StateCreator<T, Mps, Mcs, T>

// Devtools Enhancement
export const devtools = <T>(name: string) =>
  config.isDev
    ? (f: StateCreator<T, [], [], T>) => f
    : (f: StateCreator<T, [], [], T>) => f