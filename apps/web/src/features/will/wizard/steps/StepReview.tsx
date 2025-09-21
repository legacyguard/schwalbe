import React, { useEffect, useRef } from 'react'
import { useWizard } from '../state/WizardContext'
import { useTranslation } from 'react-i18next'
import { useEngineDraft } from '../hooks/useEngineValidation'

import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility'

export function StepReview() {
  const { toEngineInput } = useWizard()
  const { t } = useTranslation('will/wizard')
  const { setFocus } = useFocusManagement()
  const { announce } = useAnnouncer()
  const mainContentRef = useRef<HTMLDivElement>(null)

  const input = toEngineInput()
  const draft = useEngineDraft(input)

  // Set focus to main content when component mounts
  useEffect(() => {
    if (mainContentRef.current) {
      setFocus(mainContentRef.current)
    }
  }, [setFocus])

  // Announce validation status when draft changes
  useEffect(() => {
    if (draft.validation.isValid) {
      announce('Will is valid and ready for review', 'polite')
    } else if (draft.validation.errors.length > 0) {
      announce(`Will has ${draft.validation.errors.length} validation error${draft.validation.errors.length > 1 ? 's' : ''}`, 'assertive')
    }
  }, [draft.validation, announce])

  return (
    <div
      ref={mainContentRef}
      className="space-y-6"
      role="main"
      aria-labelledby="review-heading"
      aria-describedby="review-description"
      tabIndex={-1}
    >
      <div className="sr-only">
        <h1 id="review-heading">
          Will Creation - Review and Final Check
        </h1>
        <p id="review-description">
          Review your will document for accuracy and completeness. Check for any validation errors or warnings before finalizing.
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4" role="region" aria-labelledby="review-hint-heading">
        <h2 id="review-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Document Review
        </h2>
        <p className="text-blue-200 text-sm">
          Please carefully review your will document below. Check all information for accuracy and completeness.
        </p>
      </div>

      {!draft.validation.isValid && (
        <div
          className="bg-red-900/30 border border-red-700 rounded-lg p-4"
          role="alert"
          aria-labelledby="validation-errors-heading"
        >
          <h3 id="validation-errors-heading" className="font-semibold mb-3 text-red-200">
            {t('review.validationErrors')}
          </h3>
          <ul className="space-y-2" role="list">
            {draft.validation.errors.map((e, idx) => (
              <li key={e.code} className="text-red-200 flex items-start gap-2">
                <span className="text-red-400 font-bold min-w-[1rem] mt-0.5">•</span>
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft.validation.warnings.length > 0 && (
        <div
          className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4"
          role="region"
          aria-labelledby="validation-warnings-heading"
        >
          <h3 id="validation-warnings-heading" className="font-semibold mb-3 text-yellow-200">
            {t('review.validationWarnings')}
          </h3>
          <ul className="space-y-2" role="list">
            {draft.validation.warnings.map((w, i) => (
              <li key={w.code + i} className="text-yellow-200 flex items-start gap-2">
                <span className="text-yellow-400 font-bold min-w-[1rem] mt-0.5">⚠</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="bg-slate-900 border border-slate-700 rounded-lg p-4"
        role="region"
        aria-labelledby="document-preview-heading"
      >
        <h3 id="document-preview-heading" className="font-semibold mb-4 text-slate-200">
          {t('review.previewTitle')}
        </h3>
        <article
          className="prose prose-invert max-w-none whitespace-pre-wrap"
          role="document"
          aria-label="Will document preview"
          tabIndex={0}
        >
          {draft.content}
        </article>
      </div>

      {draft.validation.isValid && (
        <div
          className="bg-green-900/30 border border-green-700 rounded-lg p-4"
          role="status"
          aria-labelledby="validation-success-heading"
        >
          <h3 id="validation-success-heading" className="font-semibold mb-2 text-green-200">
            ✓ Will is Valid
          </h3>
          <p className="text-green-200 text-sm">
            Your will document has passed all validation checks and is ready for finalization.
          </p>
        </div>
      )}
    </div>
  )
}