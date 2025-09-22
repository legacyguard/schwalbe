import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'phone';
  lastValidated: string;
}

const seedContacts: Contact[] = [
  { id: '1', name: 'Alex Rivera', channel: 'email', lastValidated: '2024-11-05' },
  { id: '2', name: 'Morgan Lee', channel: 'sms', lastValidated: '2024-10-18' }
];

const triggers = [
  { id: 'weekly-check', label: 'Weekly check-in', threshold: '7 days', status: 'Active' },
  { id: 'travel-mode', label: 'Travel mode', threshold: '24 hours', status: 'Paused' }
];

export default function EmergencyCenter() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Emergency center</h1>
          <p className="text-slate-300 max-w-2xl">
            Configure who LegacyGuard should notify when something happens, review your backup triggers, and keep contact details validated.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              {triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-start justify-between gap-3 rounded border border-slate-800 bg-slate-900/60 p-3">
                  <div>
                    <div className="font-medium text-slate-100">{trigger.label}</div>
                    <div className="text-xs text-slate-300">Escalates after {trigger.threshold}</div>
                    <div className="text-xs text-slate-400">Status: {trigger.status}</div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
              <Button variant="secondary" className="w-full">New trigger</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trusted contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              {seedContacts.map((contact) => (
                <div key={contact.id} className="rounded border border-slate-800 bg-slate-900/60 p-3">
                  <div className="font-medium text-slate-100">{contact.name}</div>
                  <div className="text-xs text-slate-300">Channel: {contact.channel.toUpperCase()}</div>
                  <div className="text-xs text-slate-400">Last validated: {contact.lastValidated}</div>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm">Validate now</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
              <Button className="w-full">Add emergency contact</Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Notification log</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>No emergency notifications have been sent yet. When a trigger fires, you will see a timeline of email and SMS delivery attempts here.</p>
              <Button variant="outline" size="sm">Send test notification</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
