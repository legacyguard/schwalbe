'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { reminderService } from '@schwalbe/shared';

interface Reminder {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
}
import { ReminderForm } from './ReminderForm';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';

export function RemindersDashboard() {
  const t = useTranslations('reminders');
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const data = await reminderService.list();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          {t('dashboard.title')}
        </h2>
        
        <Card className="bg-slate-800 border-slate-700">
          <ReminderForm onSubmit={() => load()} />
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          {t('dashboard.upcoming')}
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <Icon name="loader" className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-slate-400">{t('dashboard.loading')}</p>
          </div>
        ) : reminders.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <Icon name="calendar" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300">{t('dashboard.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-700 rounded p-2">
                    <Icon name="bell" className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-white mb-1">
                      {reminder.title}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {new Date(reminder.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}