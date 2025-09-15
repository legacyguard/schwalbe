import React, { useMemo, useState } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function StepWitnesses() {
  const { state, setState, goNext } = useWizard()
  const { t } = useTranslation('will/wizard')
  const [touched, setTouched] = useState(false)

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

  function addRow() {
    setState((s) => ({ ...s, witnesses: [...s.witnesses, { id: crypto.randomUUID(), fullName: '' }] }))
  }

  function removeRow(id: string) {
    setState((s) => ({ ...s, witnesses: s.witnesses.filter((w) => w.id !== id) }))
  }

  const hasErrors = errors.length > 0

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!hasErrors) goNext()
      }}
    >
      <div className="text-slate-300">{t('hints.witnessHint')}</div>

      <fieldset>
        <legend className="mb-2">Signatures</legend>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={!!state.signatures.testatorSigned}
            onChange={(e) => setState((s) => ({ ...s, signatures: { ...s.signatures, testatorSigned: e.target.checked } }))}
          />
          {t('labels.testatorSigned')}
        </label>
        {state.form === 'typed' && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!state.signatures.witnessesSigned}
              onChange={(e) =>
                setState((s) => ({ ...s, signatures: { ...s.signatures, witnessesSigned: e.target.checked } }))
              }
            />
            {t('labels.witnessesSigned')}
          </label>
        )}
      </fieldset>

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Witnesses</h3>
        <Button type="button" onClick={addRow} aria-label="Add witness">
          + Add
        </Button>
      </div>

      <div className="grid gap-3">
        {state.witnesses.map((w, idx) => (
          <div key={w.id} className="grid md:grid-cols-2 gap-3 items-end">
            <div>
              <label htmlFor={`w-name-${w.id}`} className="block mb-1">
                {t('labels.witnessName')}
              </label>
              <Input
                id={`w-name-${w.id}`}
                value={w.fullName}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    witnesses: s.witnesses.map((x) => (x.id === w.id ? { ...x, fullName: e.target.value } : x)),
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" variant="outline" onClick={() => removeRow(w.id)} aria-label={`Remove witness ${idx + 1}`}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {touched && hasErrors && (
        <ul className="text-red-300 text-sm list-disc pl-6">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <div>
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2"
          onClick={() => setTouched(true)}
          aria-disabled={hasErrors}
          disabled={hasErrors}
        >
          {t('actions.next')}
        </button>
      </div>
    </form>
  )
}