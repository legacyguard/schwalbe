/**
 * Consolidated Will Wizard Store
 * Replaces the dual state management system (Zustand + React Context)
 * Follows single source of truth principle
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { supabase } from '@/lib/supabase'
import { logger } from '@schwalbe/shared'
import { willValidationService, willService, type WillFormData } from '@schwalbe/logic'

export type WizardStepKey = 'testator' | 'beneficiaries' | 'executors' | 'witnesses' | 'guardians' | 'assets' | 'review'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface WizardState {
  // Session management
  sessionId: string
  userId?: string
  currentStep: WizardStepKey

  // Form data (using standardized structure from logic package)
  formData: WillFormData

  // UI state
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  lastSaved?: string

  // Validation state
  validationErrors: Record<string, string[]>
  validationWarnings: Record<string, string[]>

  // Navigation state
  completedSteps: Set<WizardStepKey>
  availableSteps: WizardStepKey[]

  // Auto-save
  autoSaveEnabled: boolean
  lastAutoSave?: string
}

export interface WizardActions {
  // Session management
  initializeSession: (sessionId?: string) => void
  setUserId: (userId: string) => void

  // Step navigation
  goToStep: (step: WizardStepKey) => Promise<boolean>
  getCurrentStep: () => WizardStepKey
  getNextStep: () => WizardStepKey | null
  getPreviousStep: () => WizardStepKey | null

  // Form data management
  updateFormData: (updates: Partial<WillFormData>) => void
  resetFormData: () => void

  // Validation
  validateCurrentStep: () => ValidationResult
  validateAllSteps: () => ValidationResult
  clearValidationErrors: () => void

  // Persistence
  saveDraft: () => Promise<boolean>
  loadDraft: (sessionId: string) => Promise<boolean>
  deleteDraft: () => Promise<boolean>

  // Auto-save
  enableAutoSave: (enabled: boolean) => void
  triggerAutoSave: () => Promise<void>

  // Completion
  markStepCompleted: (step: WizardStepKey) => void
  isStepCompleted: (step: WizardStepKey) => boolean
  getCompletionPercentage: () => number

  // Reset
  resetWizard: () => void
}

export type WillWizardStore = WizardState & WizardActions

const initialFormData: WillFormData = {
  form: 'simple',
  testator: {
    fullName: '',
    age: 0,
    address: ''
  },
  beneficiaries: [],
  executors: [],
  witnesses: [],
  guardians: [],
  assets: []
}

const initialState: WizardState = {
  sessionId: '',
  currentStep: 'testator',
  formData: initialFormData,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  validationErrors: {},
  validationWarnings: {},
  completedSteps: new Set(),
  availableSteps: ['testator'],
  autoSaveEnabled: true
}

// Auto-save debounce timer
let autoSaveTimer: NodeJS.Timeout | null = null

export const useWillWizardStore = create<WillWizardStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Session management
      initializeSession: (sessionId?: string) => {
        const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set((state) => {
          state.sessionId = newSessionId
          state.isDirty = false
        })
        logger.info('Wizard session initialized', { sessionId: newSessionId })
      },

      setUserId: (userId: string) => {
        set((state) => {
          state.userId = userId
        })
      },

      // Step navigation
      goToStep: async (step: WizardStepKey): Promise<boolean> => {
        const state = get()

        // Validate current step before moving
        const validation = state.validateCurrentStep()
        if (!validation.isValid) {
          logger.warn('Cannot navigate: current step validation failed', {
            currentStep: state.currentStep,
            targetStep: step,
            errors: validation.errors
          })
          return false
        }

        // Mark current step as completed
        const actions = get()
        actions.markStepCompleted(state.currentStep)

        set((state) => {
          state.currentStep = step
          state.isDirty = true
        })

        // Trigger auto-save after navigation
        if (state.autoSaveEnabled) {
          get().triggerAutoSave()
        }

        return true
      },

      getCurrentStep: () => get().currentStep,

      getNextStep: (): WizardStepKey | null => {
        const steps: WizardStepKey[] = ['testator', 'beneficiaries', 'executors', 'witnesses', 'guardians', 'assets', 'review']
        const currentIndex = steps.indexOf(get().currentStep)
        return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
      },

      getPreviousStep: (): WizardStepKey | null => {
        const steps: WizardStepKey[] = ['testator', 'beneficiaries', 'executors', 'witnesses', 'guardians', 'assets', 'review']
        const currentIndex = steps.indexOf(get().currentStep)
        return currentIndex > 0 ? steps[currentIndex - 1] : null
      },

      // Form data management
      updateFormData: (updates: Partial<WillFormData>) => {
        set((state) => {
          state.formData = { ...state.formData, ...updates }
          state.isDirty = true
        })

        // Trigger auto-save
        const state = get()
        if (state.autoSaveEnabled) {
          get().triggerAutoSave()
        }
      },

      resetFormData: () => {
        set((state) => {
          state.formData = initialFormData
          state.isDirty = true
          state.completedSteps = new Set()
          state.validationErrors = {}
          state.validationWarnings = {}
        })
      },

      // Validation
      validateCurrentStep: (): ValidationResult => {
        const state = get()
        const validation = willValidationService.validateStepTransition(
          state.currentStep,
          state.currentStep,
          state.formData
        )

        set((state) => {
          if (validation.errors.length > 0) {
            state.validationErrors[state.currentStep] = validation.errors
          } else {
            delete state.validationErrors[state.currentStep]
          }

          if (validation.warnings && validation.warnings.length > 0) {
            state.validationWarnings[state.currentStep] = validation.warnings
          } else {
            delete state.validationWarnings[state.currentStep]
          }
        })

        return validation
      },

      validateAllSteps: (): ValidationResult => {
        const state = get()
        const validation = willValidationService.validateCompleteWill(state.formData)

        set((state) => {
          // Clear all validation errors first
          state.validationErrors = {}
          state.validationWarnings = {}

          // Set validation results per step
          const steps: WizardStepKey[] = ['testator', 'beneficiaries', 'executors', 'witnesses', 'guardians', 'assets']
          steps.forEach(step => {
            const stepValidation = willValidationService.validateStepTransition(step, step, state.formData)
            if (stepValidation.errors.length > 0) {
              state.validationErrors[step] = stepValidation.errors
            }
            if (stepValidation.warnings && stepValidation.warnings.length > 0) {
              state.validationWarnings[step] = stepValidation.warnings
            }
          })
        })

        return validation
      },

      clearValidationErrors: () => {
        set((state) => {
          state.validationErrors = {}
          state.validationWarnings = {}
        })
      },

      // Persistence
      saveDraft: async (): Promise<boolean> => {
        const state = get()

        if (!state.sessionId || !state.userId) {
          logger.warn('Cannot save draft: missing session or user ID')
          return false
        }

        set((state) => {
          state.isSaving = true
        })

        try {
          const saveCommand = {
            sessionId: state.sessionId,
            userId: state.userId,
            formData: state.formData,
            currentStep: state.currentStep
          }

          const prepared = willService.prepareDraftForSave(saveCommand)
          if (!prepared.isValid) {
            logger.error('Draft preparation failed', { errors: prepared.errors })
            return false
          }

          const { error } = await supabase
            .from('will_drafts')
            .upsert(prepared.draftData, {
              onConflict: 'user_id,session_id'
            })

          if (error) {
            logger.error('Failed to save will draft', { error })
            return false
          }

          set((state) => {
            state.isDirty = false
            state.lastSaved = new Date().toISOString()
            state.isSaving = false
          })

          logger.info('Will draft saved successfully', { sessionId: state.sessionId })
          return true

        } catch (error) {
          logger.error('Exception saving will draft', { error })
          set((state) => {
            state.isSaving = false
          })
          return false
        }
      },

      loadDraft: async (sessionId: string): Promise<boolean> => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const { data, error } = await supabase
            .from('will_drafts')
            .select('*')
            .eq('session_id', sessionId)
            .single()

          if (error) {
            logger.error('Failed to load will draft', { error, sessionId })
            return false
          }

          if (data) {
            set((state) => {
              state.sessionId = sessionId
              state.formData = data.form_data
              state.currentStep = data.step as WizardStepKey
              state.isDirty = false
              state.lastSaved = data.updated_at
              state.isLoading = false
            })

            logger.info('Will draft loaded successfully', { sessionId })
            return true
          }

          return false

        } catch (error) {
          logger.error('Exception loading will draft', { error })
          set((state) => {
            state.isLoading = false
          })
          return false
        }
      },

      deleteDraft: async (): Promise<boolean> => {
        const state = get()

        if (!state.sessionId) {
          return false
        }

        try {
          const { error } = await supabase
            .from('will_drafts')
            .delete()
            .eq('session_id', state.sessionId)

          if (error) {
            logger.error('Failed to delete will draft', { error })
            return false
          }

          get().resetWizard()
          return true

        } catch (error) {
          logger.error('Exception deleting will draft', { error })
          return false
        }
      },

      // Auto-save
      enableAutoSave: (enabled: boolean) => {
        set((state) => {
          state.autoSaveEnabled = enabled
        })
      },

      triggerAutoSave: async (): Promise<void> => {
        // Debounce auto-save
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer)
        }

        autoSaveTimer = setTimeout(async () => {
          const state = get()
          if (state.isDirty && state.autoSaveEnabled) {
            const success = await get().saveDraft()
            if (success) {
              set((state) => {
                state.lastAutoSave = new Date().toISOString()
              })
            }
          }
        }, 2000) // 2 second debounce
      },

      // Completion tracking
      markStepCompleted: (step: WizardStepKey) => {
        set((state) => {
          state.completedSteps.add(step)
        })
      },

      isStepCompleted: (step: WizardStepKey): boolean => {
        return get().completedSteps.has(step)
      },

      getCompletionPercentage: (): number => {
        const state = get()
        return willValidationService.getCompletionPercentage(state.formData)
      },

      // Reset
      resetWizard: () => {
        set((state) => {
          Object.assign(state, initialState)
          state.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      }
    })),
    {
      name: 'will-wizard-store',
      storage: createJSONStorage(() => sessionStorage),
      // Serialize Set objects properly
      serialize: (state) => JSON.stringify({
        ...state,
        completedSteps: Array.from(state.completedSteps)
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        return {
          ...parsed,
          completedSteps: new Set(parsed.completedSteps || [])
        }
      }
    }
  )
)