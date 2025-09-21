import React, { useEffect, useRef } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'

import { FormField, AccessibleInput, AccessibleButton } from '@/components/ui/AccessibleForm'
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export function StepExecutor() {
  const { state, setState, goNext, validationErrors } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()
  const { announce } = useAnnouncer()
  const formRef = useRef<HTMLFormElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Set focus to first field when component mounts
  useEffect(() => {
    if (firstFieldRef.current) {
      setFocus(firstFieldRef.current)
    }
  }, [setFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    announce('Moving to next step', 'polite')
    goNext()
  }

  return (
    <form
      ref={formRef}
      className="space-y-6"
      onSubmit={handleSubmit}
      role="form"
      aria-labelledby="wizard-executor-heading"
      aria-describedby="executor-description"
      noValidate
    >
      <div className="sr-only">
        <h2 id="wizard-executor-heading">
          Will Creation - Executor Information
        </h2>
        <p id="executor-description">
          Please specify who will be responsible for executing the will. This field is optional.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="executor-hint-heading">
        <h3 id="executor-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Executor Information
        </h3>
        <p className="text-blue-200 text-sm">
          The executor is responsible for carrying out the instructions in your will. This is typically a trusted family member or friend.
        </p>
      </div>

      <FormField
        label={t('labels.executorName')}
        help="Enter the name of the person who will execute your will (optional)"
      >
        <AccessibleInput
          ref={firstFieldRef}
          value={state.executorName ?? ''}
          onChange={(e) => setState((s) => ({ ...s, executorName: e.target.value }))}
          aria-label="Name of will executor"
          placeholder="Enter executor name (optional)"
        />
      </FormField>

      <div className="pt-4">
        <AccessibleButton
          type="submit"
          variant="primary"
          size="md"
        >
          {t('actions.next')}
        </AccessibleButton>
      </div>
    </form>
  )
}