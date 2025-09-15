import React from 'react'

export function Progress({ currentIndex, labels }: { currentIndex: number; labels: string[] }) {
  return (
    <nav aria-label="Wizard steps" className="mb-4">
      <ol className="flex flex-wrap gap-2">
        {labels.map((label, i) => (
          <li key={label} className="flex items-center">
            <div
              aria-current={i === currentIndex ? 'step' : undefined}
              className={
                'px-3 py-1 rounded-full text-sm border ' +
                (i === currentIndex
                  ? 'bg-sky-600 border-sky-400'
                  : i < currentIndex
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-slate-900 border-slate-700')
              }
            >
              {label}
            </div>
            {i < labels.length - 1 && <span className="mx-2 text-slate-500">→</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}