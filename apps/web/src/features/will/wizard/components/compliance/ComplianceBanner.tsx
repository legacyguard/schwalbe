import React from 'react'
import { useWizard } from '../../state/WizardContext'
import type { ComplianceResult } from '../../hooks/useCompliance'

export function ComplianceBanner({ compliance }: { compliance: ComplianceResult }) {
  const { goTo } = useWizard()
  const hasIssues = compliance.overall.errorCount > 0 || compliance.overall.warningCount > 0

  return (
    <section aria-live="polite" aria-label="Compliance status" className="mt-3">
      {!hasIssues && (
        <div className="bg-green-900/30 border border-green-700 rounded p-3">
          <p className="font-medium">Compliance: No issues detected</p>
        </div>
      )}

      {hasIssues && (
        <div className={(compliance.overall.errorCount > 0 ? 'bg-red-900/30 border-red-700' : 'bg-yellow-900/30 border-yellow-700') + ' border rounded p-3'}>
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              Compliance: {compliance.overall.errorCount} error{compliance.overall.errorCount === 1 ? '' : 's'}
              {compliance.overall.warningCount > 0 && `, ${compliance.overall.warningCount} warning${compliance.overall.warningCount === 1 ? '' : 's'}`}
            </p>
          </div>

          <ul className="mt-2 space-y-2">
            {compliance.items.map((it) => (
              <li key={it.code + it.step} className="flex items-start gap-2">
                <span
                  className={
                    'mt-1 inline-block h-2 w-2 rounded-full ' + (it.severity === 'error' ? 'bg-red-400' : 'bg-yellow-400')
                  }
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">[{it.step}]</span> {it.message}
                  </p>
                  <p className="text-xs text-slate-300">Remediation: {it.guidance}</p>
                </div>
                <button
                  className="text-xs bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded px-2 py-1"
                  onClick={() => goTo(it.step)}
                  aria-label={`Go to ${it.step} step to fix`}
                >
                  Fix now
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}