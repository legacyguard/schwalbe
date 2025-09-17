import type { ReminderChannel, ReminderStatus } from '../services/reminders/reminder.service';

export interface ReminderPayload {
  user_id: string;
  title: string;
  scheduled_at: string;
  channels: ReminderChannel[];
  status: ReminderStatus;
  description?: string | null;
  recurrence_rule?: string | null;
  recurrence_end_at?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  next_execution_at?: string | null;
  last_executed_at?: string | null;
  execution_count?: number;
  max_executions?: number | null;
}