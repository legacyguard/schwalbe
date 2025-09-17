'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';

export function DeleteAccount() {
  const t = useTranslations('account.delete');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [request, setRequest] = React.useState<{ id: string; url?: string } | null>(null);

  const startDeletion = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('create-account-deletion-request', { body: {} });
      if (error) throw error;
      setRequest(data as { id: string; url?: string });
    } catch {
      setError(t('errors.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>
      <p className="text-slate-300 mb-4">{t('description')}</p>
      
      <div className="bg-red-500/20 border border-red-500 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-red-300 mb-2">{t('warning.title')}</h2>
        <ul className="list-disc list-inside text-red-200 space-y-2">
          <li>{t('warning.dataErasure')}</li>
          <li>{t('warning.subscription')}</li>
          <li>{t('warning.sharedLinks')}</li>
          <li>{t('warning.irreversible')}</li>
        </ul>
      </div>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}

      {request ? (
        <div>
          <p className="text-yellow-300 mb-4">{t('status.requestCreated')}</p>
          {request.url ? (
            <p className="text-slate-300">
              {t('status.checkEmailWithAddress', { email: request.url })}
            </p>
          ) : (
            <p className="text-slate-300">{t('status.checkEmail')}</p>
          )}
        </div>
      ) : (
        <button
          className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded disabled:opacity-50"
          onClick={startDeletion}
          disabled={loading}
        >
          {loading ? t('actions.processing') : t('actions.delete')}
        </button>
      )}
    </div>
  );
}