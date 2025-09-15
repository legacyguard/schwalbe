import React from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

export function StepExecutor() {
  const { state, setState, goNext } = useWizard()
  const { t } = useTranslation('will/wizard')

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        goNext()
      }}
    >
      <div>
        <label htmlFor="executorName" className="block mb-1">
          {t('labels.executorName')}
        </label>
        <Input
          id="executorName"
          value={state.executorName ?? ''}
          onChange={(e) => setState((s) => ({ ...s, executorName: e.target.value }))}
        />
      </div>

      <div>
        <button type="submit" className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2" aria-label="Continue">
          {t('actions.next')}
        </button>
      </div>
    </form>
  )
}