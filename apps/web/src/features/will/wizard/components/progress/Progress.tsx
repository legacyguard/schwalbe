import React, { memo } from 'react'

export interface StepStatus {
  errors: number
  warnings: number
}

export const Progress = memo(function Progress({ currentIndex, labels, statuses }: { currentIndex: number; labels: string[]; statuses?: StepStatus[] }) {
  const totalSteps = labels.length;
  const completedSteps = currentIndex;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <nav aria-label="Will creation wizard progress" className="mb-4" role="navigation">
      <div className="sr-only">
        <p aria-live="polite" aria-atomic="true">
          Step {currentIndex + 1} of {totalSteps}: {labels[currentIndex]}
        </p>
        <p>Progress: {Math.round(progressPercentage)}% complete</p>
      </div>

      {/* Visual progress bar for better accessibility */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>Progress</span>
          <span aria-live="polite">{Math.round(progressPercentage)}% complete</span>
        </div>
        <div
          className="w-full bg-slate-700 rounded-full h-2"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Wizard progress: ${Math.round(progressPercentage)}% complete`}
        >
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <ol className="flex flex-wrap gap-2" role="list">
        {labels.map((label, i) => {
          const s = statuses?.[i]
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const hasErrors = s && s.errors > 0;
          const hasWarnings = s && s.warnings > 0;

          const stateClass =
            hasErrors
              ? 'bg-red-900/50 border-red-700 text-red-200'
              : hasWarnings
              ? 'bg-yellow-900/40 border-yellow-700 text-yellow-200'
              : isCurrent
              ? 'bg-blue-600 border-blue-400 text-white'
              : isCompleted
              ? 'bg-green-700 border-green-600 text-green-100'
              : 'bg-slate-900 border-slate-700 text-slate-300'

          const stepStatus = isCurrent ? 'current' : isCompleted ? 'completed' : 'pending';
          const statusLabel = hasErrors ? 'with errors' : hasWarnings ? 'with warnings' : '';

          return (
            <li key={label} className="flex items-center" role="listitem">
              <div
                className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${stateClass}`}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${label} - ${stepStatus} ${statusLabel}`.trim()}
                role="button"
                tabIndex={0}
              >
                <span className="flex items-center gap-2">
                  {isCompleted && (
                    <span aria-hidden="true" className="text-green-400">✓</span>
                  )}
                  {isCurrent && (
                    <span aria-hidden="true" className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                  <span>{label}</span>
                </span>

                {s && (s.errors > 0 || s.warnings > 0) && (
                  <span className="inline-flex items-center gap-1 text-xs" role="status">
                    {s.errors > 0 && (
                      <span
                        aria-label={`${s.errors} error${s.errors > 1 ? 's' : ''}`}
                        className="bg-red-800 text-red-100 px-1 rounded min-w-[1rem] text-center"
                        title={`${s.errors} error${s.errors > 1 ? 's' : ''} in this step`}
                      >
                        {s.errors}
                      </span>
                    )}
                    {s.warnings > 0 && (
                      <span
                        aria-label={`${s.warnings} warning${s.warnings > 1 ? 's' : ''}`}
                        className="bg-yellow-800 text-yellow-100 px-1 rounded min-w-[1rem] text-center"
                        title={`${s.warnings} warning${s.warnings > 1 ? 's' : ''} in this step`}
                      >
                        {s.warnings}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {i < labels.length - 1 && (
                <span className="mx-2 text-slate-500" aria-hidden="true">→</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
