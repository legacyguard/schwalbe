import React, { useMemo, useState, useEffect, useRef, useCallback, memo } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'

import { FormField, AccessibleInput, AccessibleButton } from '@/components/ui/AccessibleForm'
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export const StepBeneficiaries = memo(function StepBeneficiaries() {
  const { state, setState, goNext, validationErrors } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()

  // Memoized callback for updating beneficiary data
  const updateBeneficiary = useCallback((id: string, field: string, value: any) => {
    setState((s) => ({
      ...s,
      beneficiaries: s.beneficiaries.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    }))
  }, [setState])

  // Memoized callback for adding beneficiary
  const addBeneficiary = useCallback(() => {
    setState((s) => ({
      ...s,
      beneficiaries: [
        ...s.beneficiaries,
        {
          id: `beneficiary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          relationship: ''
        }
      ]
    }))
  }, [setState])

  // Memoized callback for removing beneficiary
  const removeBeneficiary = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      beneficiaries: s.beneficiaries.filter((x) => x.id !== id)
    }))
  }, [setState])
  const { announce } = useAnnouncer()
  const [touched, setTouched] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const errors = useMemo(() => {
    if (state.beneficiaries.length === 0) return t('errors.atLeastOneBeneficiary')
    return undefined
  }, [state.beneficiaries.length, t])

  // Set focus to add button when component mounts (if no beneficiaries exist)
  useEffect(() => {
    if (state.beneficiaries.length === 0 && addButtonRef.current) {
      setFocus(addButtonRef.current)
    }
  }, [setFocus, state.beneficiaries.length])

  // Announce validation errors
  useEffect(() => {
    if (errors && touched) {
      announce('Form has 1 error', 'assertive')
    }
  }, [errors, touched, announce])

  function addRow() {
    const newBeneficiary = { id: crypto.randomUUID(), name: '', relationship: '' }
    setState((s) => ({
      ...s,
      beneficiaries: [...s.beneficiaries, newBeneficiary],
    }))
    announce('Beneficiary added', 'polite')
  }

  const removeRow = useCallback((id: string) => {
    removeBeneficiary(id)
    announce('Beneficiary removed', 'polite')
  }, [removeBeneficiary, announce])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    if (!errors) {
      announce('Moving to next step', 'polite')
      goNext()
    } else {
      announce('Please fix the errors before continuing', 'assertive')
    }
  }

  return (
    <form
      ref={formRef}
      className="space-y-6"
      onSubmit={handleSubmit}
      role="form"
      aria-labelledby="wizard-beneficiaries-heading"
      aria-describedby="beneficiaries-description"
      noValidate
    >
      <div className="sr-only">
        <h2 id="wizard-beneficiaries-heading">
          Will Creation - Beneficiaries
        </h2>
        <p id="beneficiaries-description">
          Please add at least one beneficiary who will inherit from the will. You can add multiple beneficiaries.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="beneficiaries-hint-heading">
        <h3 id="beneficiaries-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Beneficiaries Information
        </h3>
        <p className="text-blue-200 text-sm">
          {t('hints.beneficiaryHint')}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Beneficiaries</h3>
        <AccessibleButton
          ref={addButtonRef}
          type="button"
          variant="secondary"
          size="sm"
          onClick={addRow}
          aria-label="Add new beneficiary"
        >
          + Add Beneficiary
        </AccessibleButton>
      </div>

      <div className="space-y-4" role="region" aria-labelledby="beneficiaries-list-heading">
        <h4 id="beneficiaries-list-heading" className="sr-only">
          List of beneficiaries
        </h4>
        {state.beneficiaries.map((b, idx) => (
          <fieldset key={b.id} className="border border-slate-600 rounded-lg p-4">
            <legend className="text-sm font-medium px-2">
              Beneficiary {idx + 1}
            </legend>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label={t('labels.beneficiaryName')}
                help="Enter the full legal name of the beneficiary"
                required
              >
                <AccessibleInput
                  value={b.name}
                  onChange={(e) => updateBeneficiary(b.id, 'name', e.target.value)}
                  aria-label={`Name of beneficiary ${idx + 1}`}
                  placeholder="Enter beneficiary name"
                />
              </FormField>

              <FormField
                label={t('labels.relationship')}
                help="Describe the relationship to the testator (e.g., spouse, child, friend)"
              >
                <AccessibleInput
                  value={b.relationship ?? ''}
                  onChange={(e) => updateBeneficiary(b.id, 'relationship', e.target.value)}
                  aria-label={`Relationship of beneficiary ${idx + 1} to testator`}
                  placeholder="Enter relationship"
                />
              </FormField>
            </div>

            <div className="mt-4 flex justify-end">
              <AccessibleButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRow(b.id)}
                aria-label={`Remove beneficiary ${idx + 1}: ${b.name || 'unnamed'}`}
              >
                Remove Beneficiary
              </AccessibleButton>
            </div>
          </fieldset>
        ))}
      </div>

      {state.beneficiaries.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No beneficiaries added yet. Click "Add Beneficiary" to get started.</p>
        </div>
      )}

      <div className="pt-4">
        <AccessibleButton
          type="submit"
          variant="primary"
          size="md"
          disabled={!!errors}
          aria-describedby={errors ? 'submit-help' : undefined}
        >
          {t('actions.next')}
        </AccessibleButton>

        {errors && touched && (
          <div id="submit-help" className="mt-2 text-sm text-red-300" role="alert">
            {errors}
          </div>
        )}
      </div>
    </form>
  )
})