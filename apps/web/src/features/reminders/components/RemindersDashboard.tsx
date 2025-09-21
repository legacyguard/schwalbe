import React from 'react'
import { logger } from '@schwalbe/shared/lib/logger';
import { reminderService, type ReminderRule } from '@schwalbe/shared'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export function RemindersDashboard() {
  const [items, setItems] = React.useState<ReminderRule[]>([])
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await reminderService.list()
      setItems(data)
    } catch (e) {
      logger.error('Failed to load reminders', { action: 'reminders_load_failed', metadata: { error: String(e) } })
      toast({ title: 'Failed to load reminders' })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Backup Reminders</h1>
        <Button onClick={() => navigate('/reminders/new')}>New reminder</Button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No reminders yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(r => (
            <li key={r.id} className="border border-slate-700 rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.title}</div>
                  {r.description ? (
                    <div className="text-sm text-slate-300">{r.description}</div>
                  ) : null}
                  <div className="text-xs text-slate-400 mt-1">
                    Next: {r.next_execution_at || r.scheduled_at} • Channels: {Array.isArray(r.channels) ? r.channels.join(', ') : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/reminders/${r.id}/edit`)}>Edit</Button>
                  <Button onClick={async () => { await reminderService.snooze(r.id, 60); toast({ title: 'Snoozed for 60 minutes' }); load() }}>Snooze 1h</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
