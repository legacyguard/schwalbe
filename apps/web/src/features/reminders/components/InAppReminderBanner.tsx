import React from 'react'
import { reminderService, type NotificationLogEntry } from '@schwalbe/shared'
import { X } from 'lucide-react'

export function InAppReminderBanner() {
  const [items, setItems] = React.useState<NotificationLogEntry[]>([])

  const load = React.useCallback(async () => {
    try {
      const data = await reminderService.fetchPendingInApp()
      setItems(data)
    } catch {
      // no-op
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map(i => {
        const title = (i as any)?.provider_response?.title || 'Reminder'
        const body = (i as any)?.provider_response?.body || 'You have a scheduled reminder. Open reminders to review.'
        return (
          <div key={i.id} className="bg-slate-800 text-white border border-slate-700 rounded p-3 w-80 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-slate-300">{body}</div>
              </div>
              <button className="text-slate-300 hover:text-white" aria-label="Dismiss" onClick={async () => {
                await reminderService.markInAppDelivered(i.id)
                setItems(prev => prev.filter(x => x.id !== i.id))
              }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
