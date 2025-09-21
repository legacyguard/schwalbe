import React from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui'
import { Button } from '@/components/ui/button'
import type { RedirectSimulationTarget } from '@/lib/utils/redirect-guard'

interface RedirectSimulationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targets: RedirectSimulationTarget[]
}

export function RedirectSimulationModal({ open, onOpenChange, targets }: RedirectSimulationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 text-slate-100 border border-slate-700">
        <DialogHeader>
          <DialogTitle>Redirect simulation</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm">
            {/* Czech simulation message as per rules; UI labels remain English */}
            Prostředí není produkční. Probíhá simulace přesměrování — žádná navigace nebude provedena.
          </p>
          <div>
            <div className="text-sm font-semibold mb-2">Target URLs for domains:</div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {targets.map((t) => (
                <li key={t.code}>
                  <span className="font-mono uppercase mr-2">{t.code}</span>
                  <span className="mr-2 text-slate-300">{t.host}</span>
                  <a
                    href={t.url}
                    onClick={(e) => e.preventDefault()}
                    className="text-blue-400 hover:underline"
                    aria-label={`Simulated target for ${t.code}`}
                  >
                    {t.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}