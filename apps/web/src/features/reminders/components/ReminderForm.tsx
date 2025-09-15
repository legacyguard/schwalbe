import React from 'react'
import { reminderService, type ReminderRule } from '@schwalbe/shared'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

export function ReminderForm() {
  const navigate = useNavigate()
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [scheduledAt, setScheduledAt] = React.useState(() => new Date().toISOString().slice(0,16)) // yyyy-MM-ddTHH:mm
  const [channels, setChannels] = React.useState<string[]>(['email'])
  const [recurrence, setRecurrence] = React.useState('') // e.g., FREQ=WEEKLY;INTERVAL=1
  const [saving, setSaving] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const rule: Omit<ReminderRule,'id'|'created_at'|'updated_at'> = {
        user_id: (await (await import('@schwalbe/shared')).supabase.auth.getUser()).data.user?.id as string,
        title,
        description,
        scheduled_at: new Date(scheduledAt).toISOString(),
        recurrence_rule: recurrence || null,
        channels: channels as any,
        status: 'active',
        priority: 'medium',
        next_execution_at: new Date(scheduledAt).toISOString(),
        last_executed_at: null,
        execution_count: 0,
        max_executions: null,
      }
      await reminderService.create(rule as any)
      toast({ title: 'Reminder created' })
      navigate('/reminders')
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to create reminder' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">New Reminder</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 p-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 p-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm mb-1">Scheduled at</label>
          <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 p-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Channels</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={channels.includes('email')} onChange={e=> setChannels(c => e.target.checked ? Array.from(new Set([...c,'email'])) : c.filter(x=>x!=='email'))} /> Email
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={channels.includes('in_app')} onChange={e=> setChannels(c => e.target.checked ? Array.from(new Set([...c,'in_app'])) : c.filter(x=>x!=='in_app'))} /> In-app
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Recurrence (RRULE)</label>
          <input value={recurrence} placeholder="e.g., FREQ=WEEKLY;INTERVAL=1" onChange={e=>setRecurrence(e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 p-2" />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
          <Button type="button" onClick={()=>navigate('/reminders')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
