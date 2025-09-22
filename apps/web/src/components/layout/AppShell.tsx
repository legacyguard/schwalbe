import React from 'react';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <TopBar />
      <main className="pt-20 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
