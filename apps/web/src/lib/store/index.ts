/**
 * Centralized Application Store
 * Unified state management using Zustand with enhanced middleware
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { logger, useAuthStore } from '@schwalbe/shared'
import { supabase } from '@/lib/supabase'
import {
  type AppStateSlice,
  type WizardStateSlice,
  type AssetsStateSlice,
  type PreferencesStateSlice,
  type NotificationItem,
  type UserPreferences,
  defaultAppState,
  defaultWizardState,
  defaultAssetsState,
  defaultPreferencesState
} from './types'
import { stateValidator, tabSync, persistWithEnhancements, devtools } from './middleware'
import type { WizardState, WizardStepKey } from '@/features/will/wizard/state/WizardContext'
import type { Asset } from '@/features/assets/state/useAssets'

// Combined App Store Interface
interface AppStore extends AppStateSlice, WizardStateSlice, AssetsStateSlice, PreferencesStateSlice {
  // App State Actions
  setSidebarOpen: (isOpen: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  setGlobalLoading: (loading: boolean) => void
  setOperationLoading: (operation: string, loading: boolean) => void

  // Wizard State Actions
  setCurrentWizard: (wizard: WizardState | null) => void
  updateWizardState: (updates: Partial<WizardState>) => void
  saveWizardDraft: (sessionId: string) => Promise<void>
  loadWizardDraft: (sessionId: string) => Promise<boolean>
  setCurrentStep: (step: WizardStepKey) => void
  setWizardValidationErrors: (errors: Record<string, string[]>) => void
  clearWizardState: () => void

  // Assets State Actions
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  removeAsset: (id: string) => void
  setSelectedAssets: (ids: string[]) => void
  setAssetsFilter: (filter: Partial<AssetsStateSlice['filters']>) => void
  refreshAssetsSummary: () => void
  syncAssets: () => Promise<void>

  // Preferences State Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void
  savePreferences: () => Promise<void>
  loadPreferences: () => Promise<void>
  resetPreferences: () => void

  // Utility Actions
  hydrate: () => Promise<void>
  reset: () => void
}

// State Validation Rules
const validationRules = [
  {
    field: 'currentStep' as keyof AppStore,
    validator: (value: WizardStepKey) => {
      const validSteps = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
      return validSteps.includes(value)
    },
    message: 'Invalid wizard step'
  },
  {
    field: 'preferences' as keyof AppStore,
    validator: (value: UserPreferences) => {
      return value && typeof value === 'object' && value.language && value.currency
    },
    message: 'Invalid preferences format'
  }
]

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    stateValidator(validationRules)(
      tabSync({
        key: 'app-store',
        syncFields: ['preferences', 'currentWizard', 'currentStep']
      })(
        persistWithEnhancements({
          name: 'schwalbe-app-storage',
          storage: localStorage,
          version: 1,
          partialize: (state) => ({
            preferences: state.preferences,
            unsavedChanges: state.unsavedChanges,
            sidebar: state.sidebar,
            currentWizard: state.currentWizard,
            savedWizards: state.savedWizards,
            currentStep: state.currentStep
          }),
          migrate: (persistedState, version) => {
            // Handle version migrations
            if (version < 1) {
              return {
                ...persistedState,
                preferences: {
                  ...defaultPreferencesState.preferences,
                  ...persistedState.preferences
                }
              }
            }
            return persistedState
          }
        })(
          devtools('AppStore')(
            (set, get) => ({
              // Initial State
              ...defaultAppState,
              ...defaultWizardState,
              ...defaultAssetsState,
              ...defaultPreferencesState,

              // App State Actions
              setSidebarOpen: (isOpen) => {
                set((state) => ({
                  sidebar: { ...state.sidebar, isOpen }
                }))
              },

              setSidebarCollapsed: (collapsed) => {
                set((state) => ({
                  sidebar: { ...state.sidebar, collapsed }
                }))
              },

              openModal: (modalId, data = {}) => {
                set({
                  modals: {
                    activeModal: modalId,
                    modalData: data
                  }
                })
              },

              closeModal: () => {
                set({
                  modals: {
                    activeModal: null,
                    modalData: {}
                  }
                })
              },

              addNotification: (notification) => {
                const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                const newNotification: NotificationItem = {
                  ...notification,
                  id,
                  timestamp: new Date(),
                  read: false
                }

                set((state) => ({
                  notifications: {
                    items: [newNotification, ...state.notifications.items],
                    unreadCount: state.notifications.unreadCount + 1
                  }
                }))

                // Auto-remove if specified
                if (notification.autoRemove) {
                  setTimeout(() => {
                    get().removeNotification(id)
                  }, notification.autoRemove)
                }
              },

              removeNotification: (id) => {
                set((state) => {
                  const notification = state.notifications.items.find(n => n.id === id)
                  const wasUnread = notification && !notification.read

                  return {
                    notifications: {
                      items: state.notifications.items.filter(n => n.id !== id),
                      unreadCount: wasUnread
                        ? Math.max(0, state.notifications.unreadCount - 1)
                        : state.notifications.unreadCount
                    }
                  }
                })
              },

              markNotificationRead: (id) => {
                set((state) => {
                  const notification = state.notifications.items.find(n => n.id === id)
                  if (!notification || notification.read) return state

                  return {
                    notifications: {
                      items: state.notifications.items.map(n =>
                        n.id === id ? { ...n, read: true } : n
                      ),
                      unreadCount: Math.max(0, state.notifications.unreadCount - 1)
                    }
                  }
                })
              },

              clearNotifications: () => {
                set({
                  notifications: {
                    items: [],
                    unreadCount: 0
                  }
                })
              },

              setGlobalLoading: (loading) => {
                set((state) => ({
                  loading: { ...state.loading, global: loading }
                }))
              },

              setOperationLoading: (operation, loading) => {
                set((state) => ({
                  loading: {
                    ...state.loading,
                    operations: {
                      ...state.loading.operations,
                      [operation]: loading
                    }
                  }
                }))
              },

              // Wizard State Actions
              setCurrentWizard: (wizard) => {
                set({ currentWizard: wizard, isDirty: true })
              },

              updateWizardState: (updates) => {
                set((state) => ({
                  currentWizard: state.currentWizard ? { ...state.currentWizard, ...updates } : null,
                  isDirty: true
                }))
              },

              saveWizardDraft: async (sessionId) => {
                const state = get()
                if (!state.currentWizard) return

                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    // Save to localStorage for unauthenticated users
                    localStorage.setItem('will_wizard_state', JSON.stringify(state.currentWizard))
                    set({ lastSaved: new Date(), isDirty: false })
                    return
                  }

                  // Save to Supabase for authenticated users
                  const payload = {
                    user_id: user.id,
                    session_id: sessionId,
                    step_number: ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review'].indexOf(state.currentStep) + 1,
                    total_steps: 6,
                    draft_data: state.currentWizard,
                    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
                  }

                  const { error } = await supabase.from('will_drafts').upsert(payload, {
                    onConflict: 'user_id,session_id'
                  })

                  if (error) throw error

                  set({
                    savedWizards: {
                      ...state.savedWizards,
                      [sessionId]: state.currentWizard
                    },
                    lastSaved: new Date(),
                    isDirty: false
                  })

                } catch (error) {
                  logger.error('Failed to save wizard draft', {
                    action: 'wizard_draft_save_failed',
                    metadata: { error, sessionId }
                  })
                  throw error
                }
              },

              loadWizardDraft: async (sessionId) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    // Load from localStorage
                    const saved = localStorage.getItem('will_wizard_state')
                    if (saved) {
                      const wizardState = JSON.parse(saved)
                      set({ currentWizard: wizardState, isDirty: false })
                      return true
                    }
                    return false
                  }

                  // Load from Supabase
                  const { data, error } = await supabase
                    .from('will_drafts')
                    .select('draft_data')
                    .eq('user_id', user.id)
                    .eq('session_id', sessionId)
                    .maybeSingle()

                  if (error) throw error

                  if (data?.draft_data) {
                    set({
                      currentWizard: data.draft_data,
                      savedWizards: {
                        ...get().savedWizards,
                        [sessionId]: data.draft_data
                      },
                      isDirty: false
                    })
                    return true
                  }

                  return false
                } catch (error) {
                  logger.error('Failed to load wizard draft', {
                    action: 'wizard_draft_load_failed',
                    metadata: { error, sessionId }
                  })
                  return false
                }
              },

              setCurrentStep: (step) => {
                set({ currentStep: step })
              },

              setWizardValidationErrors: (errors) => {
                set({ validationErrors: errors })
              },

              clearWizardState: () => {
                set({
                  currentWizard: null,
                  currentStep: 'start',
                  validationErrors: {},
                  isDirty: false
                })
              },

              // Assets State Actions
              setAssets: (assets) => {
                set({ assets, lastSynced: new Date() })
                get().refreshAssetsSummary()
              },

              addAsset: (asset) => {
                set((state) => ({
                  assets: [asset, ...state.assets]
                }))
                get().refreshAssetsSummary()
              },

              updateAsset: (id, updates) => {
                set((state) => ({
                  assets: state.assets.map(asset =>
                    asset.id === id ? { ...asset, ...updates } : asset
                  )
                }))
                get().refreshAssetsSummary()
              },

              removeAsset: (id) => {
                set((state) => ({
                  assets: state.assets.filter(asset => asset.id !== id),
                  selectedAssets: state.selectedAssets.filter(assetId => assetId !== id)
                }))
                get().refreshAssetsSummary()
              },

              setSelectedAssets: (ids) => {
                set({ selectedAssets: ids })
              },

              setAssetsFilter: (filter) => {
                set((state) => ({
                  filters: { ...state.filters, ...filter }
                }))
              },

              refreshAssetsSummary: () => {
                const { assets } = get()
                const totalValue = assets.reduce((sum, asset) => sum + (asset.estimated_value || 0), 0)
                const totalCount = assets.length

                const byCategory: Record<string, number> = {}
                assets.forEach(asset => {
                  byCategory[asset.category] = (byCategory[asset.category] || 0) + (asset.estimated_value || 0)
                })

                set({
                  summary: {
                    totalValue,
                    totalCount,
                    byCategory
                  }
                })
              },

              syncAssets: async () => {
                try {
                  const { data, error } = await supabase
                    .from('assets')
                    .select('*')
                    .order('updated_at', { ascending: false })

                  if (error) throw error

                  get().setAssets(data || [])
                } catch (error) {
                  logger.error('Failed to sync assets', {
                    action: 'assets_sync_failed',
                    metadata: { error }
                  })
                  throw error
                }
              },

              // Preferences State Actions
              updatePreferences: (updates) => {
                set((state) => ({
                  preferences: { ...state.preferences, ...updates },
                  unsavedChanges: { ...state.unsavedChanges, ...updates }
                }))
              },

              savePreferences: async () => {
                const { preferences, unsavedChanges } = get()

                if (Object.keys(unsavedChanges).length === 0) return

                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return

                  const { error } = await supabase
                    .from('user_preferences')
                    .upsert({
                      user_id: user.id,
                      preferences
                    })

                  if (error) throw error

                  set({
                    unsavedChanges: {},
                    lastSynced: new Date()
                  })

                } catch (error) {
                  logger.error('Failed to save preferences', {
                    action: 'preferences_save_failed',
                    metadata: { error }
                  })
                  throw error
                }
              },

              loadPreferences: async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return

                  const { data, error } = await supabase
                    .from('user_preferences')
                    .select('preferences')
                    .eq('user_id', user.id)
                    .maybeSingle()

                  if (error) throw error

                  if (data?.preferences) {
                    set({
                      preferences: { ...defaultPreferencesState.preferences, ...data.preferences },
                      lastSynced: new Date()
                    })
                  }
                } catch (error) {
                  logger.error('Failed to load preferences', {
                    action: 'preferences_load_failed',
                    metadata: { error }
                  })
                }
              },

              resetPreferences: () => {
                set({
                  preferences: defaultPreferencesState.preferences,
                  unsavedChanges: {}
                })
              },

              // Utility Actions
              hydrate: async () => {
                const authState = useAuthStore.getState()
                if (authState.isAuthenticated) {
                  await Promise.all([
                    get().loadPreferences(),
                    get().syncAssets()
                  ])
                }
              },

              reset: () => {
                set({
                  ...defaultAppState,
                  ...defaultWizardState,
                  ...defaultAssetsState,
                  ...defaultPreferencesState
                })
              }
            })
          )
        )
      )
    )
  )
)

// Derived selectors for performance
export const useAppStoreSelectors = () => {
  const isLoading = useAppStore(state =>
    state.loading.global || Object.values(state.loading.operations).some(Boolean)
  )

  const hasUnreadNotifications = useAppStore(state =>
    state.notifications.unreadCount > 0
  )

  const filteredAssets = useAppStore(state => {
    let filtered = state.assets

    if (state.filters.category) {
      filtered = filtered.filter(asset => asset.category === state.filters.category)
    }

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase()
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(search) ||
        asset.notes?.toLowerCase().includes(search)
      )
    }

    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = state.filters
      let aVal: any = a[sortBy as keyof Asset]
      let bVal: any = b[sortBy as keyof Asset]

      if (sortBy === 'updated_at' || sortBy === 'name') {
        aVal = aVal || ''
        bVal = bVal || ''
      } else {
        aVal = aVal || 0
        bVal = bVal || 0
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })

    return filtered
  })

  return {
    isLoading,
    hasUnreadNotifications,
    filteredAssets
  }
}