import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { UserIcon } from '@/components/ui/UserIcon';

export function TopBar() {
  const { t } = useTranslation();
  // TODO: Get authentication status from your auth context/state
  const isAuthenticated = false; // This should come from your auth system
  const userName = undefined; // This should come from your auth system

  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-b border-amber-200/50 backdrop-blur-xl bg-amber-800/90">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4" aria-label="Primary">
        <a href="/" className="flex items-center gap-2 text-white font-bold">
          <LegacyGuardLogo />
          <span className="text-2xl font-bold text-white">LegacyGuard</span>
        </a>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:text-amber-200 font-bold">
            <a href="/dashboard">{t('common:navigation.dashboard')}</a>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:text-amber-200 font-bold">
            <a href="/documents">{t('common:navigation.documents')}</a>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:text-amber-200 font-bold">
            <a href="/onboarding">{t('common:navigation.onboarding')}</a>
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
