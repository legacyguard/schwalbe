import React from 'react'
import { TopBar } from './TopBar'
import { InAppReminderBanner } from '@/features/reminders/components/InAppReminderBanner'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { DunningBanner } from '@/features/billing/DunningBanner'

interface AppShellProps {
  children: React.ReactNode
}

// Lightweight wrapper to host the global TopBar.
// Usage can be adopted incrementally on pages without changing routing.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <TopBar />
      <DunningBanner />
      <main className="pt-20 flex-1">{children}</main>
      <Footer />
      <InAppReminderBanner />
      <CookieBanner />
    </div>
  )
}