import React from 'react';

import { Button } from '@/components/ui/button';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { UserIcon } from '@/components/ui/UserIcon';

export function TopBar() {
  // TODO: Get authentication status from your auth context/state
  const isAuthenticated = false; // This should come from your auth system
  const userName = undefined; // This should come from your auth system

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

          {/* Language Selector - predposledný */}
          <LanguageSelector />

          {/* User Icon - posledný */}
          <UserIcon isAuthenticated={isAuthenticated} userName={userName} />
        </div>
      </nav>
    </header>
  );
}
