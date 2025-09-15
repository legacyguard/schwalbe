import React from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { useEngineDraft } from '../hooks/useEngineValidation'

export function StepReview() {
  const { toEngineInput } = useWizard()
  const { t } = useTranslation('will/wizard')

  const input = toEngineInput()
  const draft = useEngineDraft(input)

  return (
    <div className="grid gap-4">
      {!draft.validation.isValid && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3">
          <h3 className="font-semibold mb-2">{t('review.validationErrors')}</h3>
          <ul className="list-disc pl-6">
            {draft.validation.errors.map((e) => (
              <li key={e.code} className="text-red-200">
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft.validation.warnings.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3">
          <h3 className="font-semibold mb-2">{t('review.validationWarnings')}</h3>
          <ul className="list-disc pl-6">
            {draft.validation.warnings.map((w, i) => (
              <li key={w.code + i} className="text-yellow-200">
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-700 rounded p-3">
        <h3 className="font-semibold mb-2">{t('review.previewTitle')}</h3>
        <article className="prose prose-invert max-w-none whitespace-pre-wrap">
          {draft.content}
        </article>
      </div>
    </div>
  )
}