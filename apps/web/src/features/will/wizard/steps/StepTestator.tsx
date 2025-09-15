import React, { useMemo, useState } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

export function StepTestator() {
  const { state, setState, goNext } = useWizard()
  const { t } = useTranslation('will/wizard')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!hasErrors) goNext()
      }}
    >
      <p className="text-slate-300">{t('hints.minAge')}</p>

      <div>
        <label htmlFor="fullName" className="block mb-1">
          {t('labels.fullName')}
        </label>
        <Input
          id="fullName"
          value={state.testator.fullName}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, fullName: e.target.value } }))}
          onBlur={() => setTouched((x) => ({ ...x, fullName: true }))}
          aria-invalid={!!errors.fullName && touched.fullName}
          aria-describedby={errors.fullName && touched.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && touched.fullName && (
          <p id="fullName-error" className="text-red-300 text-sm mt-1">
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="age" className="block mb-1">
          {t('labels.age')}
        </label>
        <Input
          id="age"
          type="number"
          min={0}
          value={state.testator.age ?? ''}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, age: Number(e.target.value) } }))}
          onBlur={() => setTouched((x) => ({ ...x, age: true }))}
          aria-invalid={!!errors.age && touched.age}
          aria-describedby={errors.age && touched.age ? 'age-error' : undefined}
        />
        {errors.age && touched.age && (
          <p id="age-error" className="text-red-300 text-sm mt-1">
            {errors.age}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block mb-1">
          {t('labels.address')}
        </label>
        <Input
          id="address"
          value={state.testator.address ?? ''}
          onChange={(e) => setState((s) => ({ ...s, testator: { ...s.testator, address: e.target.value } }))}
          onBlur={() => setTouched((x) => ({ ...x, address: true }))}
          aria-invalid={!!errors.address && touched.address}
          aria-describedby={errors.address && touched.address ? 'address-error' : undefined}
        />
        {errors.address && touched.address && (
          <p id="address-error" className="text-red-300 text-sm mt-1">
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2 disabled:opacity-60"
          disabled={hasErrors}
          aria-disabled={hasErrors}
        >
          {t('actions.next')}
        </button>
      </div>
    </form>
  )
}