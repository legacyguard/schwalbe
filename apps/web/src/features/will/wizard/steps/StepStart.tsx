import React, { useEffect, useRef } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { FormField, AccessibleSelect, AccessibleButton } from '@/components/ui/AccessibleForm'
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export function StepStart() {
  const { state, setState, goNext, validationErrors } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()
  const { announce } = useAnnouncer()
  const formRef = useRef<HTMLFormElement>(null)
  const firstFieldRef = useRef<HTMLSelectElement>(null)

  // Set focus to first field when component mounts
  useEffect(() => {
    if (firstFieldRef.current) {
      setFocus(firstFieldRef.current)
    }
  }, [setFocus])

  // Announce validation errors
  useEffect(() => {
    if (validationErrors.length > 0) {
      announce(`Form has ${validationErrors.length} error${validationErrors.length > 1 ? 's' : ''}`, 'assertive')
    }
  }, [validationErrors, announce])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validationErrors.length === 0) {
      announce('Moving to next step', 'polite')
      goNext()
    } else {
      announce('Please fix the errors before continuing', 'assertive')
    }
  }

  const jurisdictionOptions = [
    { value: 'CZ', label: t('options.jurisdictions.CZ') },
    { value: 'SK', label: t('options.jurisdictions.SK') }
  ]

  const languageOptions = [
    { value: 'en', label: t('options.languages.en') },
    { value: 'cs', label: t('options.languages.cs') },
    { value: 'sk', label: t('options.languages.sk') }
  ]

  const formOptions = [
    { value: 'typed', label: t('options.forms.typed') },
    { value: 'holographic', label: t('options.forms.holographic') }
  ]

  return (
    <form
      ref={formRef}
      className="space-y-6"
      onSubmit={handleSubmit}
      role="form"
      aria-labelledby="wizard-start-heading"
      aria-describedby="start-description"
      noValidate
    >
      <div className="sr-only">
        <h2 id="wizard-start-heading">
          Will Creation - Basic Information
        </h2>
        <p id="start-description">
          Please provide the basic information for your will creation. All fields are required.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="start-hint-heading">
        <h3 id="start-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Getting Started
        </h3>
        <p className="text-blue-200 text-sm">
          {t('hints.startInfo')}
        </p>
      </div>

      <FormField
        label={t('labels.jurisdiction')}
        help="Select the legal jurisdiction where your will should be valid"
        required
      >
        <AccessibleSelect
          ref={firstFieldRef}
          value={state.jurisdiction}
          onChange={(e) => setState((s) => ({ ...s, jurisdiction: e.target.value as any }))}
          options={jurisdictionOptions}
          aria-label="Legal jurisdiction for your will"
        />
      </FormField>

      <FormField
        label={t('labels.language')}
        help="Choose the language for your will document"
        required
      >
        <AccessibleSelect
          value={state.language}
          onChange={(e) => setState((s) => ({ ...s, language: e.target.value as any }))}
          options={languageOptions}
          aria-label="Language for will document"
        />
      </FormField>

      <FormField
        label={t('labels.form')}
        help="Typed wills require witnesses, holographic wills are handwritten and require no witnesses"
        required
      >
        <AccessibleSelect
          value={state.form}
          onChange={(e) => setState((s) => ({ ...s, form: e.target.value as any }))}
          options={formOptions}
          aria-label="Type of will to create"
        />
      </FormField>

      <div className="pt-4">
        <AccessibleButton
          type="submit"
          variant="primary"
          size="md"
          disabled={validationErrors.length > 0}
          aria-describedby={validationErrors.length > 0 ? 'submit-help' : undefined}
        >
          {t('actions.next')}
        </AccessibleButton>

        {validationErrors.length > 0 && (
          <p id="submit-help" className="mt-2 text-sm text-red-300">
            Please complete all required fields to continue
          </p>
        )}
      </div>
    </form>
  )
}