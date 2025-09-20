import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { FormField, AccessibleInput, AccessibleButton } from '@/components/ui/AccessibleForm'
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export function StepTestator() {
  const { state, setState, goNext, validationErrors } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()
  const { announce } = useAnnouncer()
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const errors = useMemo(() => {
    const e: Record<string, string | undefined> = {}
    const name = state.testator.fullName?.trim() ?? ''
    if (!name) e.fullName = t('errors.required')
    else if (name.length < 2) e.fullName = t('errors.nameLength')

    const age = state.testator.age ?? 0
    if (state.form === 'typed' && age < 18) e.age = t('errors.ageMinTyped')
    if (state.form === 'holographic' && age < 15) e.age = t('errors.ageMinHolographic')

    const address = state.testator.address?.trim() ?? ''
    if (!address) e.address = t('errors.required')

    return e
  }, [state.form, state.testator.address, state.testator.age, state.testator.fullName, t])

  const hasErrors = Object.values(errors).some(Boolean)

  // Set focus to first field when component mounts
  useEffect(() => {
    if (firstFieldRef.current) {
      setFocus(firstFieldRef.current)
    }
  }, [setFocus])

  // Announce validation errors
  useEffect(() => {
    const errorCount = Object.values(errors).filter(Boolean).length
    if (errorCount > 0 && Object.values(touched).some(Boolean)) {
      announce(`Form has ${errorCount} error${errorCount > 1 ? 's' : ''}`, 'assertive')
    }
  }, [errors, touched, announce])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasErrors) {
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
      aria-labelledby="wizard-testator-heading"
      aria-describedby="testator-description"
      noValidate
    >
      <div className="sr-only">
        <h2 id="wizard-testator-heading">
          Will Creation - Testator Information
        </h2>
        <p id="testator-description">
          Please provide information about the person creating the will (testator). All fields are required.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="testator-hint-heading">
        <h3 id="testator-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Testator Information
        </h3>
        <p className="text-blue-200 text-sm">
          {t('hints.minAge')}
        </p>
      </div>

      <FormField
        label={t('labels.fullName')}
        help="Enter the full legal name of the person creating the will"
        required
        error={touched.fullName ? errors.fullName : undefined}
      >
        <AccessibleInput
          ref={firstFieldRef}
          value={state.testator.fullName || ''}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, fullName: e.target.value } }))}
          onBlur={() => setTouched((x) => ({ ...x, fullName: true }))}
          aria-label="Full legal name of testator"
          placeholder="Enter full legal name"
        />
      </FormField>

      <FormField
        label={t('labels.age')}
        help={`Minimum age required: ${state.form === 'typed' ? '18' : '15'} years for ${state.form} will`}
        required
        error={touched.age ? errors.age : undefined}
      >
        <AccessibleInput
          type="number"
          min={0}
          max={120}
          value={state.testator.age ?? ''}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, age: Number(e.target.value) } }))}
          onBlur={() => setTouched((x) => ({ ...x, age: true }))}
          aria-label="Age of testator in years"
          placeholder="Enter age"
        />
      </FormField>

      <FormField
        label={t('labels.address')}
        help="Enter the complete residential address of the testator"
        required
        error={touched.address ? errors.address : undefined}
      >
        <AccessibleInput
          value={state.testator.address ?? ''}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, address: e.target.value } }))}
          onBlur={() => setTouched((x) => ({ ...x, address: true }))}
          aria-label="Residential address of testator"
          placeholder="Enter complete address"
        />
      </FormField>

      <div className="pt-4">
        <AccessibleButton
          type="submit"
          variant="primary"
          size="md"
          disabled={hasErrors}
          aria-describedby={hasErrors ? 'submit-help' : undefined}
        >
          {t('actions.next')}
        </AccessibleButton>

        {hasErrors && (
          <p id="submit-help" className="mt-2 text-sm text-red-300">
            Please complete all required fields to continue
          </p>
        )}
      </div>
    </form>
  )
}