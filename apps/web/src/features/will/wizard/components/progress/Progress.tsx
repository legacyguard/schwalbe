import React from 'react'

export interface StepStatus {
  errors: number
  warnings: number
}

export function Progress({ currentIndex, labels, statuses }: { currentIndex: number; labels: string[]; statuses?: StepStatus[] }) {
  return (
    <nav aria-label="Wizard steps" className="mb-4">
      <ol className="flex flex-wrap gap-2">
        {labels.map((label, i) => {
          const s = statuses?.[i]
          const stateClass =
            s && s.errors > 0
              ? 'bg-red-900/50 border-red-700'
              : s && s.warnings > 0
              ? 'bg-yellow-900/40 border-yellow-700'
              : i === currentIndex
              ? 'bg-sky-600 border-sky-400'
              : i < currentIndex
              ? 'bg-slate-700 border-slate-600'
              : 'bg-slate-900 border-slate-700'

          return (
            <li key={label} className="flex items-center">
              <div
                aria-current={i === currentIndex ? 'step' : undefined}
                className={'px-3 py-1 rounded-full text-sm border flex items-center gap-2 ' + stateClass}
              >
                <span>{label}</span>
                {s && (s.errors > 0 || s.warnings > 0) && (
                  <span className="inline-flex items-center gap-1 text-xs">
                    {s.errors > 0 && (
                      <span aria-label={`${s.errors} errors`} className="bg-red-800 text-red-100 px-1 rounded">
                        {s.errors}
                      </span>
                    )}
                    {s.warnings > 0 && (
                      <span aria-label={`${s.warnings} warnings`} className="bg-yellow-800 text-yellow-100 px-1 rounded">
                        {s.warnings}
                      </span>
                    )}
                  </span>
                )}
              </div>
              {i < labels.length - 1 && <span className="mx-2 text-slate-500">→</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
