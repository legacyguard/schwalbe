import React from 'react'
import { useTranslation } from 'react-i18next'
import { useWizard, stepsOrder } from '../state/WizardContext'
import { Progress } from './progress/Progress'
import { Button } from '@/components/ui/button'
import { useCompliance } from '../hooks/useCompliance'
import { ComplianceBanner } from './compliance/ComplianceBanner'

export function WizardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('will/wizard')
  const { currentStep, goBack, goNext, saveDraft } = useWizard()
  const index = stepsOrder.indexOf(currentStep)
  const canBack = index > 0
  const canNext = index < stepsOrder.length - 1

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
          {canNext && (
            <Button onClick={goNext} aria-label="Go next">
              {t('actions.next')}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
