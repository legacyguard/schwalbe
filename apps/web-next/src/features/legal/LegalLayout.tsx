'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, children }: LegalPageProps) {
  const t = useTranslations('legal');

  return (
    <div className="container mx-auto px-4 py-10 text-slate-200">
      <h1 className="text-3xl font-semibold mb-4">{title}</h1>
      <div className="prose prose-invert max-w-none">
        {children}
      </div>
      <div className="mt-8 text-xs opacity-60">
        <p>{t('disclaimer')}</p>
      </div>
    </div>
  );
}