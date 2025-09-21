/**
 * Centralized State Management Types
 * Defines all state interfaces and types for the application
 */

import type { User } from '@supabase/supabase-js'

import type { WizardState, WizardStepKey } from '@/features/will/wizard/state/WizardContext'
import type { Asset } from '@/features/assets/state/useAssets'

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'cs' | 'sk'
  currency: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    reminders: boolean
    marketing: boolean
  }
  privacy: {
    analytics: boolean
    errorReporting: boolean
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}

// Application State Slices
export interface AppStateSlice {
  // UI State
  sidebar: {
    isOpen: boolean
    collapsed: boolean
  }
  modals: {
    activeModal: string | null
    modalData: Record<string, unknown>
  }
  notifications: {
    items: NotificationItem[]
    unreadCount: number
  }
  loading: {
    global: boolean
    operations: Record<string, boolean>
  }
}

export interface WizardStateSlice {
  // Will Wizard State
  currentWizard: WizardState | null
  savedWizards: Record<string, WizardState>
  currentStep: WizardStepKey
  validationErrors: Record<string, string[]>
  isDirty: boolean
  lastSaved: Date | null
}

export interface AssetsStateSlice {
  // Assets State
  assets: Asset[]
  selectedAssets: string[]
  filters: {
    category: string | null
    search: string
    sortBy: 'name' | 'value' | 'updated_at'
    sortOrder: 'asc' | 'desc'
  }
  summary: {
    totalValue: number
    totalCount: number
    byCategory: Record<string, number>
  }
  lastSynced: Date | null
}

export interface PreferencesStateSlice {
  // User Preferences
  preferences: UserPreferences
  unsavedChanges: Partial<UserPreferences>
  lastSynced: Date | null
}

// Notification Item
export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  autoRemove?: number // ms after which to auto-remove
}

// State Validation Rules
export interface StateValidationRule<T = any> {
  field: keyof T
  validator: (value: any, state: T) => boolean | string
  message?: string
}

// State Synchronization Events
export interface StateSyncEvent {
  type: 'state_change'
  slice: string
  path: string
  value: any
  timestamp: number
  source: 'local' | 'remote' | 'sync'
}

// Persistence Configuration
export interface PersistenceConfig {
  key: string
  storage: Storage
  partialize?: (state: any) => any
  version?: number
  migrate?: (persistedState: any, version: number) => any
  merge?: (persistedState: any, currentState: any) => any
  skipHydration?: boolean
}

// Default Values
export const defaultUserPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    reminders: true,
    marketing: false
  },
  privacy: {
    analytics: true,
    errorReporting: true
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  }
}

export const defaultAppState: AppStateSlice = {
  sidebar: {
    isOpen: true,
    collapsed: false
  },
  modals: {
    activeModal: null,
    modalData: {}
  },
  notifications: {
    items: [],
    unreadCount: 0
  },
  loading: {
    global: false,
    operations: {}
  }
}

export const defaultWizardState: WizardStateSlice = {
  currentWizard: null,
  savedWizards: {},
  currentStep: 'start',
  validationErrors: {},
  isDirty: false,
  lastSaved: null
}

export const defaultAssetsState: AssetsStateSlice = {
  assets: [],
  selectedAssets: [],
  filters: {
    category: null,
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  },
  summary: {
    totalValue: 0,
    totalCount: 0,
    byCategory: {}
  },
  lastSynced: null
}

export const defaultPreferencesState: PreferencesStateSlice = {
  preferences: defaultUserPreferences,
  unsavedChanges: {},
  lastSynced: null
}