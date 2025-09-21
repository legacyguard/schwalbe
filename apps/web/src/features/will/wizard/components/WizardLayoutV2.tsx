/**
 * Enhanced Wizard Layout using Centralized Store
 * Demonstrates migration from Context to centralized state management
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useWizardStore } from '../hooks/useWizardStore'
import { useCompliance } from '../hooks/useCompliance'
import { ComplianceBanner } from './compliance/ComplianceBanner'
import { StepGuidance } from './StepGuidance'
import { Progress } from './progress/Progress'

import { Button } from '@/components/ui/button'

export function WizardLayoutV2({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('will/wizard')

  // Use centralized store instead of context
  const {
    currentStep,
    canGoBack,
    canGoNext,
    canProceedToNext,
    validationErrors,
    isDirty,
    lastSaved,
    goNext,
    goBack,
    saveDraft,
    autoSave
  } = useWizardStore()

  const compliance = useCompliance()

  const stepsOrder = ['start', 'testator', 'beneficiaries', 'executor', 'witnesses', 'review']
  const index = stepsOrder.indexOf(currentStep)

  // Auto-save indicator
  const showAutoSaveIndicator = isDirty && !lastSaved
  const timeSinceLastSave = lastSaved ? Date.now() - lastSaved.getTime() : null

  return (
    <div className="mx-auto max-w-3xl text-white p-4">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>

          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm">
            {showAutoSaveIndicator && (
              <span className="text-yellow-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
            {lastSaved && (
              <span className="text-green-400 text-xs">
                Saved {timeSinceLastSave && timeSinceLastSave < 60000
                  ? 'just now'
                  : `${Math.floor((timeSinceLastSave || 0) / 60000)}m ago`
                }
              </span>
            )}
          </div>
        </div>

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

      {/* Enhanced Validation Feedback */}
      {validationErrors[currentStep] && validationErrors[currentStep].length > 0 && (
        <div className="mb-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
            <h3 className="text-red-300 font-medium text-sm mb-2">
              {t('validation.requiredToContinue', 'Required to continue:')}
            </h3>
            <ul className="text-red-200 text-sm space-y-1">
              {validationErrors[currentStep].map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Guidance */}
      <div className="mb-4">
        <StepGuidance />
      </div>

      {/* Main Content */}
      <section className="bg-slate-800 rounded-lg border border-slate-700 p-4" aria-live="polite">
        {children}
      </section>

      {/* Enhanced Footer */}
      <footer className="mt-6">
        <div className="flex items-center justify-between">
          {/* Left side - Save actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void saveDraft()}
              aria-label="Save draft"
              disabled={!isDirty}
            >
              {t('actions.save')}
            </Button>

            {/* Quick auto-save trigger */}
            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void autoSave()}
                className="text-slate-400 hover:text-slate-300"
              >
                Auto-save now
              </Button>
            )}
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center gap-2">
            {canGoBack && (
              <Button
                variant="outline"
                onClick={goBack}
                aria-label="Go back"
              >
                {t('actions.back')}
              </Button>
            )}

            {canGoNext && (
              <Button
                onClick={goNext}
                disabled={!canProceedToNext}
                aria-label="Go next"
                title={!canProceedToNext ? t('validation.completeRequired', 'Complete required fields to continue') : undefined}
                className={!canProceedToNext ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {t('actions.next')}
              </Button>
            )}

            {/* Final step action */}
            {index === stepsOrder.length - 1 && canProceedToNext && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Handle final submission
                  console.log('Submit will for generation')
                }}
              >
                {t('actions.generateWill', 'Generate Will')}
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            {t('progress.step', 'Step {{current}} of {{total}}', {
              current: index + 1,
              total: stepsOrder.length
            })}
          </p>
        </div>
      </footer>
    </div>
  )
}