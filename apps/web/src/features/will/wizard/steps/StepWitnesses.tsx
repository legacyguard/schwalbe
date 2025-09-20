import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { FormField, AccessibleInput, AccessibleButton } from '@/components/ui/AccessibleForm'
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export function StepWitnesses() {
  const { state, setState, goNext, validationErrors } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()
  const { announce } = useAnnouncer()
  const [touched, setTouched] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const firstCheckboxRef = useRef<HTMLInputElement>(null)

  const errors = useMemo(() => {
    const e: string[] = []
    if (state.form === 'typed' && state.witnesses.length < 2) {
      e.push(t('errors.witnessCount'))
    }
    if (!state.signatures.testatorSigned) {
      e.push(t('errors.mustSign'))
    }
    if (state.form === 'typed' && !state.signatures.witnessesSigned) {
      e.push(t('errors.witnessesMustSign'))
    }
    return e
  }, [state.form, state.signatures.testatorSigned, state.signatures.witnessesSigned, state.witnesses.length, t])

  // Set focus to first checkbox when component mounts
  useEffect(() => {
    if (firstCheckboxRef.current) {
      setFocus(firstCheckboxRef.current)
    }
  }, [setFocus])

  // Announce validation errors
  useEffect(() => {
    if (errors.length > 0 && touched) {
      announce(`Form has ${errors.length} error${errors.length > 1 ? 's' : ''}`, 'assertive')
    }
  }, [errors, touched, announce])

  function addRow() {
    setState((s) => ({ ...s, witnesses: [...s.witnesses, { id: crypto.randomUUID(), fullName: '' }] }))
    announce('Witness added', 'polite')
  }

  function removeRow(id: string) {
    setState((s) => ({ ...s, witnesses: s.witnesses.filter((w) => w.id !== id) }))
    announce('Witness removed', 'polite')
  }

  const hasErrors = errors.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

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
      aria-labelledby="wizard-witnesses-heading"
      aria-describedby="witnesses-description"
      noValidate
    >
      <div className="sr-only">
        <h2 id="wizard-witnesses-heading">
          Will Creation - Witnesses and Signatures
        </h2>
        <p id="witnesses-description">
          Please confirm signatures and add witnesses if required for your will type.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="witnesses-hint-heading">
        <h3 id="witnesses-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Witnesses and Signatures
        </h3>
        <p className="text-blue-200 text-sm">
          {t('hints.witnessHint')}
        </p>
      </div>

      <fieldset className="border border-slate-600 rounded-lg p-4">
        <legend className="text-lg font-medium px-2 mb-4">Signatures</legend>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              ref={firstCheckboxRef}
              type="checkbox"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={!!state.signatures.testatorSigned}
              onChange={(e) => setState((s) => ({ ...s, signatures: { ...s.signatures, testatorSigned: e.target.checked } }))}
              aria-describedby="testator-signature-help"
            />
            <div>
              <span className="text-sm font-medium">{t('labels.testatorSigned')}</span>
              <p id="testator-signature-help" className="text-xs text-slate-400 mt-1">
                Confirm that the person creating the will has signed the document
              </p>
            </div>
          </label>
          {state.form === 'typed' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={!!state.signatures.witnessesSigned}
                onChange={(e) =>
                  setState((s) => ({ ...s, signatures: { ...s.signatures, witnessesSigned: e.target.checked } }))
                }
                aria-describedby="witnesses-signature-help"
              />
              <div>
                <span className="text-sm font-medium">{t('labels.witnessesSigned')}</span>
                <p id="witnesses-signature-help" className="text-xs text-slate-400 mt-1">
                  Confirm that all witnesses have signed the document
                </p>
              </div>
            </label>
          )}
        </div>
      </fieldset>

      {state.form === 'typed' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Witnesses</h3>
            <AccessibleButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRow}
              aria-label="Add new witness"
            >
              + Add Witness
            </AccessibleButton>
          </div>

          <div className="space-y-4" role="region" aria-labelledby="witnesses-list-heading">
            <h4 id="witnesses-list-heading" className="sr-only">
              List of witnesses
            </h4>
            {state.witnesses.map((w, idx) => (
              <fieldset key={w.id} className="border border-slate-600 rounded-lg p-4">
                <legend className="text-sm font-medium px-2">
                  Witness {idx + 1}
                </legend>
                <div className="space-y-4">
                  <FormField
                    label={t('labels.witnessName')}
                    help="Enter the full legal name of the witness"
                    required
                  >
                    <AccessibleInput
                      value={w.fullName}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          witnesses: s.witnesses.map((x) => (x.id === w.id ? { ...x, fullName: e.target.value } : x)),
                        }))
                      }
                      aria-label={`Name of witness ${idx + 1}`}
                      placeholder="Enter witness name"
                    />
                  </FormField>

                  <div className="flex justify-end">
                    <AccessibleButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow(w.id)}
                      aria-label={`Remove witness ${idx + 1}: ${w.fullName || 'unnamed'}`}
                    >
                      Remove Witness
                    </AccessibleButton>
                  </div>
                </div>
              </fieldset>
            ))}

            {state.witnesses.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No witnesses added yet. Typed wills require at least 2 witnesses.</p>
              </div>
            )}
          </div>
        </>
      )}

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

        {touched && hasErrors && (
          <div id="submit-help" className="mt-2 text-sm text-red-300" role="alert">
            <p className="font-medium mb-1">Please fix the following errors:</p>
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  )
}