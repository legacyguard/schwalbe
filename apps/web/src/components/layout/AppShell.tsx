import React from 'react'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
}

// Lightweight wrapper to host the global TopBar.
// Usage can be adopted incrementally on pages without changing routing.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <TopBar />
      <main className="pt-20">{children}</main>
    </div>
  )
}