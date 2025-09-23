import React from 'react';

import { sendAnalytics } from '@/lib/analytics';
import { PasswordWall } from '@/components/auth/PasswordWall';

export default function LandingV2() {
  React.useEffect(() => {
    sendAnalytics('landing_view');
  }, []);

  return (
    <PasswordWall onAuthenticated={() => sendAnalytics('landing_password_authenticated')}>
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <section className="px-6 py-24 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold">
              Secure your legacy in one trusted place
            </h1>
            <p className="text-lg text-slate-300">
              LegacyGuard keeps your documents, guardians, and emergency plans organized so the people you trust can act when it matters.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button className="rounded bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
                Open dashboard
              </button>
              <button className="rounded border border-slate-700 px-6 py-3 font-medium hover:bg-slate-800">
                Learn more
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
            {[
              {
                emoji: '📄',
                title: 'All documents ready',
                description: 'Upload wills, letters, and instructions with automatic expiry reminders.'
              },
              {
                emoji: '🛡️',
                title: 'Trusted guardians',
                description: 'Invite the people who should take point and share only what they need.'
              },
              {
                emoji: '🚨',
                title: 'Emergency playbook',
                description: 'Define what happens if you go quiet so nothing is left to chance.'
              }
            ].map((feature) => (
              <article key={feature.title} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left">
                <div className="text-2xl" aria-hidden="true">{feature.emoji}</div>
                <h2 className="mt-3 text-lg font-semibold text-slate-100">{feature.title}</h2>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PasswordWall>
  );
}
