/**
 * Store Provider Component
 * Initializes and manages the centralized application state
 */

import { config } from '@/lib/env';

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@schwalbe/shared'
import { useAppStore } from './index'
import { createTabSync } from './sync'
import { logger } from '@schwalbe/shared'

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Auth store state
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()

  // App store actions
  const hydrate = useAppStore(state => state.hydrate)
  const loadPreferences = useAppStore(state => state.loadPreferences)
  const syncAssets = useAppStore(state => state.syncAssets)
  const addNotification = useAppStore(state => state.addNotification)

  // Initialize store when auth state is ready
  useEffect(() => {
    if (authLoading) return

    const initializeStore = async () => {
      try {
        logger.info('Initializing application store', {
          action: 'store_initialization_start',
          metadata: { isAuthenticated, userId: user?.id }
        })

        // Initialize cross-tab synchronization
        const tabSync = createTabSync({
          storeName: 'schwalbe-app',
          syncFields: ['preferences', 'currentWizard', 'currentStep'],
          conflictResolution: 'timestamp',
          debounceMs: 300
        })

        // Hydrate store with persisted data
        await hydrate()

        if (isAuthenticated) {
          // Load user-specific data
          await Promise.all([
            loadPreferences(),
            syncAssets()
          ])

          addNotification({
            type: 'success',
            title: 'Welcome back!',
            message: 'Your data has been synchronized.',
            autoRemove: 5000
          })
        } else {
          // For unauthenticated users, show helpful message
          addNotification({
            type: 'info',
            title: 'Welcome to Schwalbe',
            message: 'Sign in to sync your data across devices.',
            autoRemove: 8000
          })
        }

        setIsInitialized(true)
        setInitError(null)

        logger.info('Application store initialized successfully', {
          action: 'store_initialization_success',
          metadata: { isAuthenticated, userId: user?.id }
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setInitError(errorMessage)

        logger.error('Store initialization failed', {
          action: 'store_initialization_failed',
          metadata: { error: errorMessage, isAuthenticated }
        })

        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Some features may not work properly. Please refresh the page.',
          autoRemove: 10000
        })
      }
    }

    initializeStore()
  }, [authLoading, isAuthenticated, user?.id, hydrate, loadPreferences, syncAssets, addNotification])

  // Handle auth state changes
  useEffect(() => {
    if (!isInitialized) return

    if (isAuthenticated && user) {
      // User signed in - sync their data
      const syncUserData = async () => {
        try {
          await Promise.all([
            loadPreferences(),
            syncAssets()
          ])

          addNotification({
            type: 'success',
            title: 'Signed in successfully',
            message: 'Your data has been synchronized.',
            autoRemove: 5000
          })
        } catch (error) {
          logger.error('Failed to sync user data after sign in', {
            action: 'user_data_sync_failed',
            metadata: { error, userId: user.id }
          })
        }
      }

      syncUserData()
    } else if (!isAuthenticated) {
      // User signed out - show message
      addNotification({
        type: 'info',
        title: 'Signed out',
        message: 'Your local changes are still saved.',
        autoRemove: 5000
      })
    }
  }, [isAuthenticated, user?.id, isInitialized, loadPreferences, syncAssets, addNotification])

  // Auto-sync for authenticated users every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return

    const syncInterval = setInterval(async () => {
      try {
        await syncAssets()
        logger.debug('Background sync completed', {
          action: 'background_sync_completed'
        })
      } catch (error) {
        logger.warn('Background sync failed', {
          action: 'background_sync_failed',
          metadata: { error }
        })
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(syncInterval)
  }, [isAuthenticated, isInitialized, syncAssets])

  // Show loading state during initialization
  if (authLoading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <div className="space-y-2">
            <p className="text-slate-300 text-lg font-medium">
              {authLoading ? 'Authenticating...' : 'Initializing application...'}
            </p>
            {initError && (
              <p className="text-red-400 text-sm">
                Error: {initError}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook to check store initialization status
export function useStoreStatus() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isAuthLoading = useAuthStore(state => state.isLoading)
  const lastSynced = useAppStore(state => state.lastSynced)
  const hasUnreadNotifications = useAppStore(state => state.notifications.unreadCount > 0)

  return {
    isAuthenticated,
    isAuthLoading,
    lastSynced,
    hasUnreadNotifications,
    isOnline: navigator.onLine
  }
}

// Hook for store debugging in development
export function useStoreDebug() {
  const store = useAppStore()

  if (!config.isDev) {
    return null
  }

  return {
    state: store,
    actions: {
      reset: store.reset,
      clearNotifications: store.clearNotifications,
      clearWizardState: store.clearWizardState
    },
    stats: {
      assetsCount: store.assets.length,
      notificationsCount: store.notifications.items.length,
      hasWizardState: !!store.currentWizard,
      isDirty: store.isDirty
    }
  }
}