/**
 * Will Wizard Store Integration
 * Bridges the wizard with the centralized app store
 */

import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { logger } from '@schwalbe/shared'
import type { WizardState, WizardStepKey } from '../state/WizardContext'
import type { ValidationResult } from '../state/WizardContext'

import { stateValidator, wizardStateValidation } from '@/lib/store/validation'
import { useAppStore } from '@/lib/store'

export function useWizardStore() {
  const navigate = useNavigate()
  const location = useLocation()

  // Store selectors
  const currentWizard = useAppStore(state => state.currentWizard)
  const currentStep = useAppStore(state => state.currentStep)
  const validationErrors = useAppStore(state => state.validationErrors)
  const isDirty = useAppStore(state => state.isDirty)
  const lastSaved = useAppStore(state => state.lastSaved)

  // Store actions
  const setCurrentWizard = useAppStore(state => state.setCurrentWizard)
  const updateWizardState = useAppStore(state => state.updateWizardState)
  const saveWizardDraft = useAppStore(state => state.saveWizardDraft)
  const loadWizardDraft = useAppStore(state => state.loadWizardDraft)
  const setCurrentStep = useAppStore(state => state.setCurrentStep)
  const setWizardValidationErrors = useAppStore(state => state.setWizardValidationErrors)
  const clearWizardState = useAppStore(state => state.clearWizardState)

  // Derive current step from URL
  const getCurrentStepFromUrl = useCallback((): WizardStepKey => {
    const pathParts = location.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1] as WizardStepKey
    const validSteps: WizardStepKey[] = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
    return validSteps.includes(lastPart) ? lastPart : 'start'
  }, [location.pathname])

  // Session ID from URL params or generate new one
  const getSessionId = useCallback((): string => {
    const urlParams = new URLSearchParams(location.search)
    const draftId = urlParams.get('draft')
    return draftId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [location.search])

  // Step navigation with validation
  const goToStep = useCallback((step: WizardStepKey) => {
    const sessionId = getSessionId()
    const url = `/will/wizard/${step}${sessionId !== getSessionId() ? `?draft=${sessionId}` : ''}`
    navigate(url)
    setCurrentStep(step)
  }, [navigate, setCurrentStep, getSessionId])

  const goNext = useCallback(() => {
    if (!currentWizard) return

    const validation = validateCurrentStep()
    if (!validation.isValid) {
      setWizardValidationErrors({ [currentStep]: validation.errors })
      return
    }

    const stepOrder: WizardStepKey[] = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    const nextStep = stepOrder[currentIndex + 1]

    if (nextStep) {
      goToStep(nextStep)
    }
  }, [currentWizard, currentStep, setWizardValidationErrors, goToStep])

  const goBack = useCallback(() => {
    const stepOrder: WizardStepKey[] = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    const prevStep = stepOrder[currentIndex - 1]

    if (prevStep) {
      goToStep(prevStep)
    }
  }, [currentStep, goToStep])

  // Validation
  const validateCurrentStep = useCallback((): ValidationResult => {
    if (!currentWizard) {
      return { isValid: false, errors: ['No wizard state found'] }
    }

    const validation = stateValidator.validateState(currentWizard, wizardStateValidation)

    // Step-specific validation
    const stepValidation = validateStepTransition(currentStep, currentWizard)

    return {
      isValid: validation.isValid && stepValidation.isValid,
      errors: [...Object.values(validation.errors).flat(), ...stepValidation.errors],
      warnings: stepValidation.warnings
    }
  }, [currentWizard, currentStep])

  // Step transition validation (from the original implementation)
  const validateStepTransition = useCallback((step: WizardStepKey, state: WizardState): ValidationResult => {
    const validations = {
      start: () => ({
        isValid: Boolean(state.jurisdiction && state.form),
        errors: [
          ...(!state.jurisdiction ? ['Jurisdiction is required'] : []),
          ...(!state.form ? ['Will form is required'] : [])
        ]
      }),
      testator: () => {
        const errors: string[] = []
        if (!state.testator.fullName?.trim()) errors.push('Full name is required')
        if (!state.testator.address?.trim()) errors.push('Address is required')
        if (!state.testator.age || state.testator.age < (state.form === 'holographic' ? 15 : 18)) {
          errors.push(`Age must be at least ${state.form === 'holographic' ? 15 : 18} for ${state.form} will`)
        }
        return { isValid: errors.length === 0, errors }
      },
      beneficiaries: () => ({
        isValid: state.beneficiaries.length > 0,
        errors: state.beneficiaries.length === 0 ? ['At least one beneficiary is required'] : []
      }),
      executor: () => ({
        isValid: true,
        errors: [],
        warnings: !state.executorName?.trim() ? ['Consider naming an executor to manage your estate'] : []
      }),
      witnesses: () => {
        const errors: string[] = []
        const requiredWitnesses = state.form === 'holographic' ? 0 : 2

        if (state.form === 'typed') {
          if (!state.signatures.testatorSigned) errors.push('Testator signature confirmation is required')
          if (!state.signatures.witnessesSigned) errors.push('Witness signatures confirmation is required')
          if (state.witnesses.length < requiredWitnesses) {
            errors.push(`At least ${requiredWitnesses} witnesses are required for typed will`)
          }

          // Check for witness-beneficiary conflicts
          const beneficiaryNames = state.beneficiaries.map(b => b.name.toLowerCase().trim())
          const conflictingWitnesses = state.witnesses.filter(w =>
            beneficiaryNames.includes(w.fullName.toLowerCase().trim())
          )
          if (conflictingWitnesses.length > 0) {
            errors.push('Witnesses cannot be beneficiaries')
          }
        }

        return { isValid: errors.length === 0, errors }
      },
      review: () => ({ isValid: true, errors: [] })
    }

    return validations[step]()
  }, [])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!currentWizard || !isDirty) return

    try {
      const sessionId = getSessionId()
      await saveWizardDraft(sessionId)

      logger.debug('Auto-saved wizard draft', {
        action: 'wizard_auto_save',
        metadata: { sessionId, step: currentStep }
      })
    } catch (error) {
      logger.error('Auto-save failed', {
        action: 'wizard_auto_save_failed',
        metadata: { error, step: currentStep }
      })
    }
  }, [currentWizard, isDirty, saveWizardDraft, getSessionId, currentStep])

  // Initialize wizard state from URL
  useEffect(() => {
    const urlStep = getCurrentStepFromUrl()
    if (urlStep !== currentStep) {
      setCurrentStep(urlStep)
    }

    // Try to load draft if session ID is in URL
    const urlParams = new URLSearchParams(location.search)
    const draftId = urlParams.get('draft')
    if (draftId && !currentWizard) {
      loadWizardDraft(draftId).catch(error => {
        logger.error('Failed to load wizard draft from URL', {
          action: 'wizard_draft_load_url_failed',
          metadata: { error, draftId }
        })
      })
    }
  }, [location, currentStep, currentWizard, setCurrentStep, loadWizardDraft, getCurrentStepFromUrl])

  // Auto-save timer
  useEffect(() => {
    if (!currentWizard || !isDirty) return

    const timer = setTimeout(autoSave, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(timer)
  }, [currentWizard, isDirty, autoSave])

  // Validate on state changes
  useEffect(() => {
    if (currentWizard) {
      const validation = validateCurrentStep()
      if (!validation.isValid) {
        setWizardValidationErrors({ [currentStep]: validation.errors })
      } else {
        setWizardValidationErrors({})
      }
    }
  }, [currentWizard, currentStep, validateCurrentStep, setWizardValidationErrors])

  // Computed properties
  const canProceedToNext = validateCurrentStep().isValid
  const stepOrder: WizardStepKey[] = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
  const currentStepIndex = stepOrder.indexOf(currentStep)
  const canGoBack = currentStepIndex > 0
  const canGoNext = currentStepIndex < stepOrder.length - 1 && canProceedToNext

  // Convert to engine input format
  const toEngineInput = useCallback(() => {
    if (!currentWizard) {
      throw new Error('No wizard state available')
    }

    return {
      jurisdiction: currentWizard.jurisdiction,
      language: currentWizard.language,
      form: currentWizard.form,
      testator: {
        id: 'testator',
        fullName: currentWizard.testator.fullName,
        age: currentWizard.testator.age,
        address: currentWizard.testator.address,
      },
      beneficiaries: currentWizard.beneficiaries.map(b => ({
        id: b.id,
        name: b.name,
        relationship: b.relationship
      })),
      executorName: currentWizard.executorName,
      signatures: {
        testatorSigned: !!currentWizard.signatures.testatorSigned,
        witnessesSigned: !!currentWizard.signatures.witnessesSigned,
      },
      witnesses: currentWizard.witnesses.map(w => ({
        id: w.id,
        fullName: w.fullName,
        isBeneficiary: w.isBeneficiary
      })),
    }
  }, [currentWizard])

  return {
    // State
    state: currentWizard,
    currentStep,
    validationErrors,
    isDirty,
    lastSaved,
    sessionId: getSessionId(),

    // Computed
    canProceedToNext,
    canGoBack,
    canGoNext,

    // Actions
    setState: setCurrentWizard,
    updateState: updateWizardState,
    goNext,
    goBack,
    goTo: goToStep,
    saveDraft: () => saveWizardDraft(getSessionId()),
    loadDraft: loadWizardDraft,
    clearState: clearWizardState,
    validateCurrentStep,
    toEngineInput,

    // Utils
    autoSave
  }
}