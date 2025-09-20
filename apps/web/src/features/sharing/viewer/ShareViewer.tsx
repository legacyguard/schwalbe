import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sharingService } from '@schwalbe/shared';
import { MetaTags } from '@/components/common/MetaTags';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export function ShareViewer() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [status, setStatus] = useState<'loading' | 'ok' | 'password_required' | 'password_incorrect' | 'expired' | 'invalid'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  // Password state not needed for rendering; handled via status
  const [password, setPassword] = useState('');
  const [resource, setResource] = useState<{ type?: string; id?: string; permissions?: any } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!shareId) return;
      try {
        const res = await sharingService.verifyShareAccess(shareId);
        if (!mounted) return;
        setExpiresAt(res.expiresAt ?? null);
        if (res.status === 'ok') {
          setStatus('ok');
          setResource({ type: res.resourceType, id: res.resourceId, permissions: res.permissions });
        } else if (res.status === 'password_required') {
          setStatus('password_required');
        } else if (res.status === 'password_incorrect') {
          setStatus('password_incorrect');
          setError(t('sharing/viewer.incorrectPassword'));
        } else if (res.status === 'expired') {
          setStatus('expired');
          setError(t('sharing/viewer.expiredMessage'));
        } else {
          setStatus('invalid');
          setError(t('sharing/viewer.invalidMessage'));
        }
      } catch {
        setStatus('invalid');
        setError(t('sharing/viewer.unableToVerify'));
      }
    }
    run();
    return () => { mounted = false; };
  }, [shareId]);

  const title = useMemo(() => {
    if (status === 'ok') return t('sharing/viewer.sharedViewer');
    if (status === 'password_required' || status === 'password_incorrect') return t('sharing/viewer.enterPassword');
    if (status === 'expired') return t('sharing/viewer.linkExpired');
    return t('sharing/viewer.invalidLink');
  }, [status, t]);

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!shareId) return;
    try {
      const res = await sharingService.verifyShareAccess(shareId, password);
      setExpiresAt(res.expiresAt ?? null);
      if (res.status === 'ok') {
        setStatus('ok');
        setResource({ type: res.resourceType, id: res.resourceId, permissions: res.permissions });
        setError(null);
      } else if (res.status === 'password_incorrect') {
        setStatus('password_incorrect');
        setError(t('sharing/viewer.incorrectPassword'));
      } else if (res.status === 'expired') {
        setStatus('expired');
        setError(t('sharing/viewer.expiredMessage'));
      } else {
        setStatus('invalid');
        setError(t('sharing/viewer.invalidMessage'));
      }
    } catch {
      setStatus('invalid');
      setError(t('sharing/viewer.unableToVerify'));
    }
  }

  function onPrint() {
    window.print();
  }

  return (
    <div className="min-h-[60vh] text-white p-6">
      <MetaTags title={title} description={t('sharing/viewer.metaDescription')} />
      {/* Override robots for viewer pages (no public indexing) */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {status === 'loading' && (
        <div className="max-w-xl mx-auto text-center opacity-80">{t('sharing/viewer.loading')}</div>
      )}

      {(status === 'password_required' || status === 'password_incorrect') && (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow">
          <h1 className="text-xl font-semibold mb-4">{t('sharing/viewer.protectedTitle')}</h1>
          <p className="mb-4 text-slate-300">{t('sharing/viewer.protectedPrompt')}</p>
          {error && <div className="mb-4 text-red-400">{error}</div>}
          <form onSubmit={onSubmitPassword} className="space-y-4">
            <label className="block">
              <span className="block mb-1">{t('sharing/viewer.passwordLabel')}</span>
              <input
                type="password"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </label>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded"
              aria-label={t('sharing/viewer.unlockAria')}
            >
              {t('sharing/viewer.unlock')}
            </button>
          </form>
        </div>
      )}

      {status === 'expired' && (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold mb-2">{t('sharing/viewer.linkExpired')}</h1>
          <p className="text-slate-300">{t('sharing/viewer.expiredMessage')}</p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-semibold mb-2">{t('sharing/viewer.invalidLink')}</h1>
          <p className="text-slate-300">{t('sharing/viewer.invalidMessage')}</p>
        </div>
      )}

      {status === 'ok' && resource && (
        <div className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">{t('sharing/viewer.sharedViewer')}</h1>
            <div className="flex gap-2">
              <button
                className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded"
                onClick={() => navigate('/assets')}
              >
                {t('sharing/viewer.back')}
              </button>
              <button
                className="bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded"
                onClick={onPrint}
              >
                {t('sharing/viewer.exportPdf')}
              </button>
            </div>
          </div>
          <div className="text-slate-300 mb-4">
            <div>
              <span className="text-slate-400">{t('sharing/viewer.type')}:</span> {resource.type}
            </div>
            <div>
              <span className="text-slate-400">{t('sharing/viewer.resourceId')}:</span> {resource.id}
            </div>
            {expiresAt && (
              <div>
                <span className="text-slate-400">{t('sharing/viewer.expires')}:</span> {new Date(expiresAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Placeholder content; integrate actual rendering based on resource type */}
          <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
            <p>{t('sharing/viewer.contentPlaceholder')}</p>
            <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(resource.permissions, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareViewer;
