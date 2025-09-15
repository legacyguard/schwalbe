import React from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'

export function StepStart() {
  const { state, setState, goNext } = useWizard()
  const { t } = useTranslation('will/wizard')

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        goNext()
      }}
      aria-describedby="start-hint"
    >
      <p id="start-hint" className="text-slate-300">
        {t('hints.startInfo')}
      </p>

      <div>
        <label htmlFor="jurisdiction" className="block mb-1">
          {t('labels.jurisdiction')}
        </label>
        <select
          id="jurisdiction"
          className="w-full bg-slate-900 border border-slate-600 rounded p-2"
          value={state.jurisdiction}
          onChange={(e) => setState((s) => ({ ...s, jurisdiction: e.target.value as any }))}
        >
          <option value="CZ">Czech Republic (CZ)</option>
          <option value="SK">Slovakia (SK)</option>
        </select>
      </div>

      <div>
        <label htmlFor="language" className="block mb-1">
          {t('labels.language')}
        </label>
        <select
          id="language"
          className="w-full bg-slate-900 border border-slate-600 rounded p-2"
          value={state.language}
          onChange={(e) => setState((s) => ({ ...s, language: e.target.value as any }))}
        >
          <option value="en">English</option>
          <option value="cs">Czech</option>
          <option value="sk">Slovak</option>
        </select>
      </div>

      <div>
        <label htmlFor="form" className="block mb-1">
          {t('labels.form')}
        </label>
        <select
          id="form"
          className="w-full bg-slate-900 border border-slate-600 rounded p-2"
          value={state.form}
          onChange={(e) => setState((s) => ({ ...s, form: e.target.value as any }))}
        >
          <option value="typed">Typed</option>
          <option value="holographic">Holographic</option>
        </select>
      </div>

      <div>
        <button type="submit" className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2" aria-label="Continue">
          {t('actions.next')}
        </button>
      </div>
    </form>
  )
}