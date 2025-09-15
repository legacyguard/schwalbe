import { supabase } from '../../supabase/client'
import { monitoringService } from '../monitoring.service'

export type ReminderChannel = 'email' | 'in_app'
export type ReminderStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export interface ReminderRule {
  id: string
  user_id: string
  title: string
  description?: string | null
  scheduled_at: string // ISO
  recurrence_rule?: string | null
  recurrence_end_at?: string | null
  channels: ReminderChannel[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status: ReminderStatus
  next_execution_at?: string | null
  last_executed_at?: string | null
  execution_count?: number
  max_executions?: number | null
  created_at?: string
  updated_at?: string
}

export interface NotificationLogEntry {
  id: string
  reminder_rule_id: string
  channel: ReminderChannel
  recipient: string
  status: 'sent' | 'delivered' | 'failed' | 'bounced'
  sent_at: string
  delivered_at?: string | null
  error_message?: string | null
  provider_response?: Record<string, unknown> | null
}

class ReminderService {
  async list(): Promise<ReminderRule[]> {
    const { data, error } = await supabase
      .from('reminder_rule')
      .select('*')
      .order('next_execution_at', { ascending: true })
    if (error) throw error
    return (data as any) as ReminderRule[]
  }

  async get(id: string): Promise<ReminderRule | null> {
    const { data, error } = await supabase
      .from('reminder_rule')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return (data as any) as ReminderRule | null
  }

  async create(input: Omit<ReminderRule, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderRule> {
    const { data, error } = await supabase
      .from('reminder_rule')
      .insert({ ...input })
      .select('*')
      .single()
    if (error) throw error
    await monitoringService.trackEvent('reminder_created', { channels: input.channels, title: input.title })
    return (data as any) as ReminderRule
  }

  async update(id: string, patch: Partial<ReminderRule>): Promise<ReminderRule> {
    const { data, error } = await supabase
      .from('reminder_rule')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    await monitoringService.trackEvent('reminder_updated', { id, patchKeys: Object.keys(patch) })
    return (data as any) as ReminderRule
  }

  async pause(id: string): Promise<void> {
    await this.update(id, { status: 'paused' })
    await monitoringService.trackEvent('reminder_paused', { id })
  }

  async resume(id: string): Promise<void> {
    await this.update(id, { status: 'active' })
    await monitoringService.trackEvent('reminder_resumed', { id })
  }

  async snooze(id: string, minutes: number): Promise<void> {
    const next = new Date()
    next.setMinutes(next.getMinutes() + minutes)
    await this.update(id, { next_execution_at: next.toISOString() })
    await monitoringService.trackEvent('reminder_snoozed', { id, minutes })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('reminder_rule').delete().eq('id', id)
    if (error) throw error
    await monitoringService.trackEvent('reminder_deleted', { id })
  }

  async history(reminderId: string): Promise<NotificationLogEntry[]> {
    const { data, error } = await supabase
      .from('notification_log')
      .select('*')
      .eq('reminder_rule_id', reminderId)
      .order('sent_at', { ascending: false })
    if (error) throw error
    return (data as any) as NotificationLogEntry[]
  }

  async fetchPendingInApp(): Promise<NotificationLogEntry[]> {
    const { data, error } = await supabase
      .from('notification_log')
      .select('*')
      .eq('channel', 'in_app')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return (data as any) as NotificationLogEntry[]
  }

  async markInAppDelivered(id: string): Promise<void> {
    const { error } = await supabase
      .from('notification_log')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await monitoringService.trackEvent('reminder_in_app_delivered', { id })
  }
}

export const reminderService = new ReminderService()
