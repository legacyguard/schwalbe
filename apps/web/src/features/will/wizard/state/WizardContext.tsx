import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { logger } from '@schwalbe/shared';
import { supabase } from '../../../../lib/supabase.js'
import { useNavigate, useLocation } from 'react-router-dom'
import type { JurisdictionCode, WillForm, WillInput } from '@schwalbe/logic'

export type WizardStepKey = 'start' | 'testator' | 'beneficiaries' | 'executor' | 'witnesses' | 'review'

export interface BeneficiaryItem {
  id: string
  name: string
  relationship?: string
}

export interface WitnessItem {
  id: string
  fullName: string
  isBeneficiary?: boolean
}

export interface WizardState {
  jurisdiction: JurisdictionCode
  language: 'en' | 'cs' | 'sk'
  form: WillForm
  testator: { fullName: string; age?: number; address?: string }
  beneficiaries: BeneficiaryItem[]
  executorName?: string
  signatures: { testatorSigned: boolean; witnessesSigned?: boolean }
  witnesses: WitnessItem[]
}

export const InitialWizardState: WizardState = {
  jurisdiction: 'CZ',
  language: 'en',
  form: 'typed',
  testator: { fullName: '', age: undefined, address: '' },
  beneficiaries: [],
  executorName: '',
  signatures: { testatorSigned: false, witnessesSigned: false },
  witnesses: [],
}

export const stepsOrder: WizardStepKey[] = [
  'start',
  'testator',
  'beneficiaries',
  'executor',
  'witnesses',
  'review',
]

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export const validateStepTransition = (currentStep: WizardStepKey, nextStep: WizardStepKey, state: WizardState): ValidationResult => {
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

  return validations[currentStep]()
}

interface WizardContextValue {
  state: WizardState
  setState: React.Dispatch<React.SetStateAction<WizardState>>
  sessionId: string
  currentStep: WizardStepKey
  goNext: () => void
  goBack: () => void
  goTo: (step: WizardStepKey) => void
  saveDraft: (opts?: { toast?: (msg: string) => void }) => Promise<void>
  loadDraft: (sessionId?: string) => Promise<boolean>
  toEngineInput: () => WillInput
  validateCurrentStep: () => ValidationResult
  canProceedToNext: boolean
  validationErrors: string[]
  validationWarnings: string[]
}

const WizardContext = createContext<WizardContextValue | null>(null)

function getStepIndex(step: WizardStepKey) {
  return stepsOrder.indexOf(step)
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  // derive step from URL
  const currentStep = useMemo<WizardStepKey>(() => {
    const parts = location.pathname.split('/')
    const last = parts[parts.length - 1] as WizardStepKey
    return stepsOrder.includes(last) ? last : 'start'
  }, [location.pathname])

  const [state, setState] = useState<WizardState>(() => {
    const local = localStorage.getItem('will_wizard_state')
    return local ? (JSON.parse(local) as WizardState) : InitialWizardState
  })

  const [sessionId, setSessionId] = useState<string>(() => {
    const url = new URL(window.location.href)
    const qs = url.searchParams.get('draft')
    return qs ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
  })

  useEffect(() => {
    localStorage.setItem('will_wizard_state', JSON.stringify(state))
  }, [state])

  // Auto-save timer when authenticated
  useEffect(() => {
    let timer: number | undefined
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        timer = window.setInterval(() => {
          void saveDraft()
        }, 30000)
      }
    })()
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [state])

  const goTo = useCallback(
    (step: WizardStepKey) => {
      navigate(`/will/wizard/${step}${sessionId ? `?draft=${sessionId}` : ''}`)
    },
    [navigate, sessionId]
  )

  const validateCurrentStep = useCallback((): ValidationResult => {
    const nextStepIndex = getStepIndex(currentStep) + 1
    const nextStep = stepsOrder[nextStepIndex]
    if (!nextStep) return { isValid: true, errors: [] }

    return validateStepTransition(currentStep, nextStep, state)
  }, [currentStep, state])

  const validation = validateCurrentStep()

  const goNext = useCallback(() => {
    const validation = validateCurrentStep()
    if (!validation.isValid) {
      return
    }

    const idx = getStepIndex(currentStep)
    const next = stepsOrder[idx + 1]
    if (next) goTo(next)
  }, [currentStep, goTo, validateCurrentStep])

  const goBack = useCallback(() => {
    const idx = getStepIndex(currentStep)
    const prev = stepsOrder[idx - 1]
    if (prev) goTo(prev)
  }, [currentStep, goTo])

  const toEngineInput = useCallback((): WillInput => {
    return {
      jurisdiction: state.jurisdiction,
      language: state.language,
      form: state.form,
      testator: {
        id: 'testator',
        fullName: state.testator.fullName,
        age: state.testator.age,
        address: state.testator.address,
      },
      beneficiaries: state.beneficiaries.map((b: BeneficiaryItem) => ({ id: b.id, name: b.name, relationship: b.relationship })),
      executorName: state.executorName,
      signatures: {
        testatorSigned: !!state.signatures.testatorSigned,
        witnessesSigned: !!state.signatures.witnessesSigned,
      },
      witnesses: state.witnesses.map((w: WitnessItem) => ({ id: w.id, fullName: w.fullName, isBeneficiary: w.isBeneficiary })),
    }
  }, [state])

  const saveDraft = useCallback(
    async (opts?: { toast?: (msg: string) => void }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      if (!userId) {
        // not signed in - save to local only
        localStorage.setItem('will_wizard_state', JSON.stringify(state))
        if (opts?.toast) opts.toast('Draft saved locally')
        return
      }

      // upsert into will_drafts
      const payload = {
        user_id: userId,
        will_id: null as unknown as string | null,
        session_id: sessionId,
        step_number: getStepIndex(currentStep) + 1,
        total_steps: stepsOrder.length,
        draft_data: state,
        // expires_at: now + 7 days
        expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      }

      const { error } = await supabase.from('will_drafts').upsert(payload, {
        onConflict: 'user_id,session_id',
      })

      if (error) {
        logger.error('Failed to save draft', { action: 'draft_save_failed', metadata: { error: error.message } })
        // Fallback to local
        localStorage.setItem('will_wizard_state', JSON.stringify(state))
        if (opts?.toast) opts.toast('Draft saved locally (offline mode)')
        return
      }

      if (opts?.toast) opts.toast('Draft saved')
    },
    [currentStep, sessionId, state]
  )

  const loadDraft = useCallback(
    async (overrideSessionId?: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      const sid = overrideSessionId ?? sessionId
      if (!userId) return false

      const { data, error } = await supabase
        .from('will_drafts')
        .select('draft_data')
        .eq('user_id', userId)
        .eq('session_id', sid)
        .maybeSingle()

      if (error) {
        logger.error('Failed to load draft', { action: 'draft_load_failed', metadata: { error: error.message } })
        return false
      }

      if (data?.draft_data) {
        setState(data.draft_data as WizardState)
        setSessionId(sid)
        return true
      }

      return false
    },
    [sessionId]
  )

  // If a draft session id is present in URL and user is authenticated, try to load it
  useEffect(() => {
    const url = new URL(window.location.href)
    const qs = url.searchParams.get('draft')
    if (qs) {
      void loadDraft(qs)
    }
  }, [loadDraft])

  const value: WizardContextValue = {
    state,
    setState,
    sessionId,
    currentStep,
    goNext,
    goBack,
    goTo,
    saveDraft,
    loadDraft,
    toEngineInput,
    validateCurrentStep,
    canProceedToNext: validation.isValid,
    validationErrors: validation.errors,
    validationWarnings: validation.warnings || [],
  }

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}