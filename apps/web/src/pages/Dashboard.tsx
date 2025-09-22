import React from 'react';
import { Link } from 'react-router-dom';
import { reminderService, type ReminderRule } from '@schwalbe/shared';
import { logger } from '@schwalbe/shared/lib/logger';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssetsSummaryCards } from '@/features/assets/components/AssetsSummaryCards';

function useProtectionScore(target = 78) {
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setScore(target), 400);
    return () => clearTimeout(timer);
  }, [target]);

  return score;
}

function UpcomingReminders() {
  const [reminders, setReminders] = React.useState<ReminderRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await reminderService.list();
        if (!active) return;
        setReminders(items.slice(0, 3));
      } catch (error) {
        logger.warn('Failed to load reminders snapshot', {
          action: 'dashboard_load_reminders_failed',
          metadata: { error: String(error) }
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-200">
        {loading ? (
          <div aria-busy="true">Checking your reminder schedule…</div>
        ) : reminders.length === 0 ? (
          <div>
            No reminders scheduled yet. <Link to="/reminders/new" className="underline">Create one</Link> to keep guardians and executors in the loop.
          </div>
        ) : (
          <ul className="space-y-2">
            {reminders.map((item) => (
              <li key={item.id} className="rounded border border-slate-700/60 bg-slate-900/60 p-3">
                <div className="font-medium text-slate-100">{item.title}</div>
                {item.next_execution_at ? (
                  <div className="text-xs text-slate-300">Next send: {item.next_execution_at}</div>
                ) : null}
                {Array.isArray(item.channels) && item.channels.length > 0 ? (
                  <div className="text-xs text-slate-400">Channels: {item.channels.join(', ')}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions: Array<{ label: string; to: string; description: string }> = [
    {
      label: 'Add a document',
      to: '/documents/new',
      description: 'Upload the latest copies of wills, trusts, and letters of instruction.'
    },
    {
      label: 'Record an asset',
      to: '/assets/new',
      description: 'Track financial accounts, property, and memorabilia for easy sharing.'
    },
    {
      label: 'Configure backup contacts',
      to: '/reminders/new',
      description: 'Set up check-ins so guardians know when action is required.'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div key={action.to} className="flex items-start justify-between gap-4 rounded border border-slate-700/60 bg-slate-900/60 p-3">
            <div>
              <div className="font-medium text-slate-100">{action.label}</div>
              <div className="text-xs text-slate-300">{action.description}</div>
            </div>
            <Button asChild variant="outline" className="text-sm">
              <Link to={action.to}>Open</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const protectionScore = useProtectionScore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">LegacyGuard overview</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Keep your will, guardians, and key documents in one place. Track progress and share critical information with the people you trust.
          </p>
        </section>

        <section>
          <Card className="bg-slate-900/70 border border-slate-700/60">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-slate-300">Protection score</div>
                <div className="text-4xl font-semibold">{protectionScore}%</div>
                <div className="text-xs text-slate-400 mt-1">
                  Complete key setup steps to reach 100% coverage.
                </div>
              </div>
              <Button asChild>
                <Link to="/will/wizard">Continue will wizard</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <AssetsSummaryCards />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <UpcomingReminders />
          <QuickActions />
        </section>
      </div>
    </div>
  );
}
