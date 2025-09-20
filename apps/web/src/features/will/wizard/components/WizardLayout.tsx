import React, { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWizard, stepsOrder } from '../state/WizardContext'
import { Progress } from './progress/Progress'
import { Button } from '@/components/ui/button'
import { useCompliance } from '../hooks/useCompliance'
import { ComplianceBanner } from './compliance/ComplianceBanner'
import { StepGuidance } from './StepGuidance'

export const WizardLayout = memo(function WizardLayout({ children }: { children: React.ReactNode }) {
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
  const index = useMemo(() => stepsOrder.indexOf(currentStep), [currentStep])
  const canBack = index > 0
  const canNext = index < stepsOrder.length - 1 && canProceedToNext

  const compliance = useCompliance()

  const stepLabels = useMemo(() => stepsOrder.map((k) => t(`steps.${k}`)), [t])
  const stepStatuses = useMemo(() => stepsOrder.map((step) => ({
    errors: compliance.stepIssues[step]?.errors.length ?? 0,
    warnings: compliance.stepIssues[step]?.warnings.length ?? 0,
  })), [compliance.stepIssues])

  const handleSaveDraft = useCallback(async () => {
    await saveDraft()
  }, [saveDraft])

  return (
    <div className="mx-auto max-w-3xl text-white p-4">
      <header className="mb-6" role="banner">
        <h1 className="text-2xl font-semibold" id="main-heading">
          {t('title')}
        </h1>
        <Progress
          currentIndex={index}
          labels={stepLabels}
          statuses={stepStatuses}
        />
        <ComplianceBanner compliance={compliance} />
      </header>

      {/* Validation Feedback */}
      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div className="mb-4 space-y-2" role="region" aria-labelledby="validation-heading">
          <h2 id="validation-heading" className="sr-only">
            Form Validation Status
          </h2>
          {validationErrors.length > 0 && (
            <div
              className="bg-red-900/50 border border-red-700 rounded-lg p-3"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <h3 className="text-red-300 font-medium text-sm mb-2" id="errors-heading">
                <span aria-hidden="true">⚠</span> Required to continue:
              </h3>
              <ul className="text-red-200 text-sm space-y-1" role="list" aria-labelledby="errors-heading">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2" role="listitem">
                    <span className="text-red-400 mt-0.5" aria-hidden="true">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div
              className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3"
              role="region"
              aria-live="polite"
              aria-atomic="true"
            >
              <h3 className="text-yellow-300 font-medium text-sm mb-2" id="warnings-heading">
                <span aria-hidden="true">ℹ</span> Recommendations:
              </h3>
              <ul className="text-yellow-200 text-sm space-y-1" role="list" aria-labelledby="warnings-heading">
                {validationWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2" role="listitem">
                    <span className="text-yellow-400 mt-0.5" aria-hidden="true">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step Guidance */}
      <div className="mb-4" role="region" aria-labelledby="guidance-heading">
        <h2 id="guidance-heading" className="sr-only">
          Step Guidance
        </h2>
        <StepGuidance />
      </div>

      <main
        className="bg-slate-800 rounded-lg border border-slate-700 p-4"
        role="main"
        aria-labelledby="main-heading"
        aria-live="polite"
        aria-atomic="false"
      >
        {children}
      </main>
      <footer className="mt-6 flex items-center gap-2 justify-between" role="contentinfo">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            aria-label="Save current progress as draft"
            aria-describedby="save-help"
          >
            {t('actions.save')}
          </Button>
          <span id="save-help" className="sr-only">
            Your progress will be automatically saved and can be resumed later
          </span>
        </div>
        <nav className="flex items-center gap-2" role="navigation" aria-label="Wizard navigation">
          {canBack && (
            <Button
              variant="outline"
              onClick={goBack}
              aria-label={`Go back to previous step: ${stepLabels[index - 1] || 'previous'}`}
            >
              <span aria-hidden="true">← </span>
              {t('actions.back')}
            </Button>
          )}
          {index < stepsOrder.length - 1 && (
            <Button
              onClick={goNext}
              disabled={!canNext}
              aria-label={`Continue to next step: ${stepLabels[index + 1] || 'next'}`}
              aria-describedby={!canProceedToNext ? 'next-help' : undefined}
            >
              {t('actions.next')}
              <span aria-hidden="true"> →</span>
            </Button>
          )}
          {!canProceedToNext && (
            <span id="next-help" className="sr-only">
              Complete all required fields to continue to the next step
            </span>
          )}
        </nav>
      </footer>
    </div>
  )
})
