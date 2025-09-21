import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWizard, InitialWizardState } from '../state/WizardContext'

import { Button } from '@/components/ui/button'

interface ErrorRecoveryProps {
  error?: Error
  onRetry?: () => void
}

export function ErrorRecovery({ error, onRetry }: ErrorRecoveryProps) {
  const { t } = useTranslation('will/wizard')
  const { setState, loadDraft, sessionId } = useWizard()
  const [isRecovering, setIsRecovering] = useState(false)

  const handleReset = useCallback(() => {
    setState(InitialWizardState)
    localStorage.removeItem('will_wizard_state')
  }, [setState])

  const handleRestoreFromLocal = useCallback(() => {
    try {
      const local = localStorage.getItem('will_wizard_state')
      if (local) {
        const state = JSON.parse(local)
        setState(state)
      }
    } catch (err) {
      console.error('Failed to restore from local storage:', err)
    }
  }, [setState])

  const handleRestoreFromDraft = useCallback(async () => {
    setIsRecovering(true)
    try {
      const success = await loadDraft(sessionId)
      if (!success) {
        throw new Error('No draft found')
      }
    } catch (err) {
      console.error('Failed to restore from draft:', err)
    } finally {
      setIsRecovering(false)
    }
  }, [loadDraft, sessionId])

  return (
    <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 text-center">
      <h2 className="text-red-300 text-lg font-semibold mb-3">
        {t('errors.recoveryTitle', 'Something went wrong')}
      </h2>

      {error && (
        <p className="text-red-200 text-sm mb-4 font-mono bg-red-900/30 p-2 rounded">
          {error.message}
        </p>
      )}

      <p className="text-red-200 text-sm mb-6">
        {t('errors.recoveryMessage', 'We can help you recover your progress using one of the options below:')}
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full border-red-600 text-red-300 hover:bg-red-900/50"
          >
            {t('errors.retry', 'Try Again')}
          </Button>
        )}

        <Button
          onClick={handleRestoreFromDraft}
          disabled={isRecovering}
          variant="outline"
          className="w-full border-yellow-600 text-yellow-300 hover:bg-yellow-900/50"
        >
          {isRecovering
            ? t('errors.restoring', 'Restoring...')
            : t('errors.restoreFromDraft', 'Restore from Cloud Draft')
          }
        </Button>

        <Button
          onClick={handleRestoreFromLocal}
          variant="outline"
          className="w-full border-blue-600 text-blue-300 hover:bg-blue-900/50"
        >
          {t('errors.restoreFromLocal', 'Restore from Local Storage')}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-900/50"
        >
          {t('errors.startFresh', 'Start Fresh')}
        </Button>
      </div>

      <p className="text-gray-400 text-xs mt-4">
        {t('errors.contactSupport', 'If problems persist, please contact support.')}
      </p>
    </div>
  )
}