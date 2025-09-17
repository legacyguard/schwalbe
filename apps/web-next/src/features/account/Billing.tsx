'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@/lib/supabase-client';

export function Billing() {
  const t = useTranslations('account.billing');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', { body: {} });
      if (error) throw error;
      const url = (data as { url?: string } | null | undefined)?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL');
      }
    } catch {
      setError(t('error.portal_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>
      <p className="text-slate-300 mb-4">{t('description')}</p>
      {error ? <div className="text-red-400 mb-3">{error}</div> : null}
      <div className="flex items-center gap-3">
        <button
          className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50"
          onClick={openPortal}
          disabled={loading}
        >
          {loading ? t('portal.opening') : t('portal.open')}
        </button>
        <Link 
          href="/account/billing/details" 
          className="text-slate-300 hover:text-white underline"
        >
          {t('details.link')}
        </Link>
      </div>
    </div>
  );
}