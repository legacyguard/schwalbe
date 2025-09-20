import React from 'react'
import { useTranslation } from 'react-i18next'
import { useWizard, stepsOrder } from '../state/WizardContext'
import { Progress } from './progress/Progress'
import { Button } from '@/components/ui/button'
import { useCompliance } from '../hooks/useCompliance'
import { ComplianceBanner } from './compliance/ComplianceBanner'
import { StepGuidance } from './StepGuidance'

export function WizardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('will/wizard')
  const {
    currentStep,
    goBack,
    goNext,
    saveDraft,
    canProceedToNext,
    validationErrors,
    validationWarnings
  } = useWizard()
  const index = stepsOrder.indexOf(currentStep)
  const canBack = index > 0
  const canNext = index < stepsOrder.length - 1 && canProceedToNext

  const compliance = useCompliance()

  return (
    <div className="mx-auto max-w-3xl text-white p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <Progress
          currentIndex={index}
          labels={stepsOrder.map((k) => t(`steps.${k}`))}
          statuses={stepsOrder.map((step) => ({
            errors: compliance.stepIssues[step]?.errors.length ?? 0,
            warnings: compliance.stepIssues[step]?.warnings.length ?? 0,
          }))}
        />
        <ComplianceBanner compliance={compliance} />
      </header>

      {/* Validation Feedback */}
      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div className="mb-4 space-y-2">
          {validationErrors.length > 0 && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
              <h3 className="text-red-300 font-medium text-sm mb-2">Required to continue:</h3>
              <ul className="text-red-200 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3">
              <h3 className="text-yellow-300 font-medium text-sm mb-2">Recommendations:</h3>
              <ul className="text-yellow-200 text-sm space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step Guidance */}
      <div className="mb-4">
        <StepGuidance />
      </div>

      <section className="bg-slate-800 rounded-lg border border-slate-700 p-4" aria-live="polite">
        {children}
      </section>
      <footer className="mt-6 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void saveDraft()} aria-label="Save draft">
            {t('actions.save')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {canBack && (
            <Button variant="outline" onClick={goBack} aria-label="Go back">
              {t('actions.back')}
            </Button>
          )}
          {index < stepsOrder.length - 1 && (
            <Button
              onClick={goNext}
              disabled={!canNext}
              aria-label="Go next"
              title={!canProceedToNext ? 'Complete required fields to continue' : undefined}
            >
              {t('actions.next')}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
