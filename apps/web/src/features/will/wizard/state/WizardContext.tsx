import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import type { JurisdictionCode, WillForm, WillInput } from '@schwalbe/logic/will/engine'

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
      const { data } = await supabase.auth.getSession()
      if (data.session) {
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

  const goNext = useCallback(() => {
    const idx = getStepIndex(currentStep)
    const next = stepsOrder[idx + 1]
    if (next) goTo(next)
  }, [currentStep, goTo])

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
      beneficiaries: state.beneficiaries.map((b) => ({ id: b.id, name: b.name, relationship: b.relationship })),
      executorName: state.executorName,
      signatures: {
        testatorSigned: !!state.signatures.testatorSigned,
        witnessesSigned: !!state.signatures.witnessesSigned,
      },
      witnesses: state.witnesses.map((w) => ({ id: w.id, fullName: w.fullName, isBeneficiary: w.isBeneficiary })),
    }
  }, [state])

  const saveDraft = useCallback(
    async (opts?: { toast?: (msg: string) => void }) => {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
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
        console.error('Failed to save draft', { error })
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
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      const sid = overrideSessionId ?? sessionId
      if (!userId) return false

      const { data, error } = await supabase
        .from('will_drafts')
        .select('draft_data')
        .eq('user_id', userId)
        .eq('session_id', sid)
        .maybeSingle()

      if (error) {
        console.error('Failed to load draft', { error })
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
  }

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}