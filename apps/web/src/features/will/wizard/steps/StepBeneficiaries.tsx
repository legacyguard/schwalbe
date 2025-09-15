import React, { useMemo, useState } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function StepBeneficiaries() {
  const { state, setState, goNext } = useWizard()
  const { t } = useTranslation('will/wizard')
  const [touched, setTouched] = useState(false)

  const errors = useMemo(() => {
    if (state.beneficiaries.length === 0) return t('errors.atLeastOneBeneficiary')
    return undefined
  }, [state.beneficiaries.length, t])

  function addRow() {
    setState((s) => ({
      ...s,
      beneficiaries: [...s.beneficiaries, { id: crypto.randomUUID(), name: '', relationship: '' }],
    }))
  }

  function removeRow(id: string) {
    setState((s) => ({ ...s, beneficiaries: s.beneficiaries.filter((b) => b.id !== id) }))
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!errors) goNext()
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-slate-300">{t('hints.beneficiaryHint')}</div>
        <Button type="button" onClick={addRow} aria-label="Add beneficiary">
          + Add
        </Button>
      </div>

      <div className="grid gap-3">
        {state.beneficiaries.map((b, idx) => (
          <div key={b.id} className="grid md:grid-cols-2 gap-3 items-end">
            <div>
              <label htmlFor={`b-name-${b.id}`} className="block mb-1">
                {t('labels.beneficiaryName')}
              </label>
              <Input
                id={`b-name-${b.id}`}
                value={b.name}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    beneficiaries: s.beneficiaries.map((x) => (x.id === b.id ? { ...x, name: e.target.value } : x)),
                  }))
                }
              />
            </div>
            <div>
              <label htmlFor={`b-rel-${b.id}`} className="block mb-1">
                {t('labels.relationship')}
              </label>
              <Input
                id={`b-rel-${b.id}`}
                value={b.relationship ?? ''}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    beneficiaries: s.beneficiaries.map((x) => (x.id === b.id ? { ...x, relationship: e.target.value } : x)),
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" variant="outline" onClick={() => removeRow(b.id)} aria-label={`Remove beneficiary ${idx + 1}`}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {errors && touched && <p className="text-red-300 text-sm">{errors}</p>}

      <div>
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2"
          onClick={() => setTouched(true)}
          aria-disabled={!!errors}
          disabled={!!errors}
        >
          {t('actions.next')}
        </button>
      </div>
    </form>
  )
}