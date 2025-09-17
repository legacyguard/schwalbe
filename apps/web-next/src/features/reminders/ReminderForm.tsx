'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { reminderService, type ReminderPayload } from '@schwalbe/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon-library';

interface ReminderFormProps {
  className?: string;
  onSubmit?: (reminder: ReminderPayload) => void;
}

export function ReminderForm({ className = '', onSubmit }: ReminderFormProps) {
  const t = useTranslations('reminders');
  const [title, setTitle] = React.useState('');
  const [when, setWhen] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !when) return;
    
    setSaving(true);
    try {
      const reminder: ReminderPayload = {
        title,
        date: when,
        type: 'event',
        channel: 'inapp',
        notificationStrategy: 'fixed',
      };

      await reminderService.createReminder(reminder);
      
      setTitle('');
      setWhen('');
      onSubmit?.(reminder);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="title" className="block mb-2 text-sm font-medium text-white">
          {t('form.title.label')}
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('form.title.placeholder')}
          className="bg-slate-800 border-slate-700 text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="when" className="block mb-2 text-sm font-medium text-white">
          {t('form.when.label')}
        </label>
        <Input
          id="when"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
          required
        />
      </div>

      <div>
        <Button
          type="submit"
          disabled={saving || !title || !when}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Icon name="loader" className="w-5 h-5 animate-spin" />
              {t('form.saving')}
            </>
          ) : (
            <>
              <Icon name="plus" className="w-5 h-5" />
              {t('form.create')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}