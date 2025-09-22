import React from 'react';
import { Button } from '@/components/ui/button';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';

export function TopBar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-b border-slate-800/40 bg-slate-900/40 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4" aria-label="Primary">
        <a href="/" className="flex items-center gap-2 text-white">
          <LegacyGuardLogo />
          <span className="text-2xl font-semibold">LegacyGuard</span>
        </a>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-slate-200 hover:text-white">
            <a href="/dashboard">Dashboard</a>
          </Button>
          <Button asChild variant="ghost" className="text-slate-200 hover:text-white">
            <a href="/documents">Documents</a>
          </Button>
          <Button asChild variant="ghost" className="text-slate-200 hover:text-white">
            <a href="/onboarding">Onboarding</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/auth/signout">Sign out</a>
          </Button>
        </div>
      </nav>
    </header>
  );
}
