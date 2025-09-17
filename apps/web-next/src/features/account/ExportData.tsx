'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';

type ExportJob = { id: string; status: 'pending' | 'processing' | 'completed' | 'failed'; url?: string };

export function ExportData() {
  const t = useTranslations('account.export');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [job, setJob] = React.useState<ExportJob | null>(null);

  const startExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('create-export-job', { body: {} });
      if (error) throw error;
      setJob(data as ExportJob);
    } catch {
      setError(t('errors.startFailed'));
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = React.useCallback(async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-export-job', { body: { jobId } });
      if (error) throw error;
      setJob(data as ExportJob);
    } catch {
      setError(t('errors.statusCheckFailed'));
    }
  }, [t]);

  // Poll for status updates while job is in progress
  React.useEffect(() => {
    if (!job?.id || job.status === 'completed' || job.status === 'failed') return;

    const interval = setInterval(() => {
      checkStatus(job.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [job, checkStatus]);

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>
      <p className="text-slate-300 mb-4">{t('description')}</p>
      
      <div className="bg-sky-500/20 border border-sky-500 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-sky-300 mb-2">{t('details.title')}</h2>
        <ul className="list-disc list-inside text-sky-200 space-y-2">
          <li>{t('details.encryption')}</li>
          <li>{t('details.expiry')}</li>
          <li>{t('details.attempts')}</li>
          <li>{t('details.history')}</li>
        </ul>
      </div>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}

      {job ? (
        <div>
          {job.status === 'pending' && (
            <p className="text-yellow-300">{t('status.pending')}</p>
          )}
          {job.status === 'processing' && (
            <p className="text-yellow-300">{t('status.processing')}</p>
          )}
          {job.status === 'failed' && (
            <p className="text-red-400">{t('status.failed')}</p>
          )}
          {job.status === 'completed' && job.url && (
            <div>
              <p className="text-green-300 mb-3">{t('status.completed')}</p>
              <a
                href={job.url}
                className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded inline-block"
                download
              >
                {t('actions.download')}
              </a>
            </div>
          )}
        </div>
      ) : (
        <button
          className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50"
          onClick={startExport}
          disabled={loading}
        >
          {loading ? t('actions.starting') : t('actions.start')}
        </button>
      )}
    </div>
  );
}