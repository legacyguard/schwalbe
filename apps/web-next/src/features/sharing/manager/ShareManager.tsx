'use client';

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { sharingService, type CreateShareLinkInput, type SharePermissions } from '@schwalbe/shared'

interface ShareManagerProps {
  resourceType: 'document' | 'will' | 'vault' | 'family'
  resourceId: string
  resourceTitle?: string
  onClose?: () => void
}

export function ShareManager({ resourceType, resourceId, resourceTitle, onClose }: ShareManagerProps) {
  const t = useTranslations('sharing.manager')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [permissions, setPermissions] = useState<Partial<SharePermissions>>({
    read: true,
    download: false,
    comment: false,
    share: false
  })
  const [hasPassword, setHasPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [hasExpiry, setHasExpiry] = useState(false)
  const [expiryDays, setExpiryDays] = useState(7)
  const [hasAccessLimit, setHasAccessLimit] = useState(false)
  const [maxAccesses, setMaxAccesses] = useState(10)

  const createShareLink = async () => {
    setLoading(true)
    setError(null)

    try {
      const input: CreateShareLinkInput = {
        resourceType,
        resourceId,
        permissions,
        password: hasPassword && password ? password : undefined,
        expiresAt: hasExpiry ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
        maxAccessCount: hasAccessLimit ? maxAccesses : undefined
      }

      const result = await sharingService.createShareLink(input)
      const fullUrl = `${window.location.origin}/share/${result.shareId}`
      setShareLink(fullUrl)
    } catch (err: any) {
      if (err.message === 'insufficient_plan') {
        setError(t('errors.insufficientPlan'))
      } else {
        setError(t('errors.createFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!shareLink) return
    
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePermissionChange = (key: keyof SharePermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {t('title')} {resourceTitle && `- ${resourceTitle}`}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label={t('close')}
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      {shareLink ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('shareUrl')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <button
                onClick={copyToClipboard}
                className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded text-white"
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            {t('linkCreated')}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShareLink(null)}
              className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-white"
            >
              {t('createAnother')}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
              >
                {t('done')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); createShareLink(); }} className="space-y-6">
          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {t('permissions.title')}
            </label>
            <div className="space-y-2">
              {(['read', 'download', 'comment', 'share'] as const).map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={permissions[perm] || false}
                    onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                    className="rounded"
                  />
                  {t(`permissions.${perm}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Password protection */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <input
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.target.checked)}
                className="rounded"
              />
              {t('password.enable')}
            </label>
            {hasPassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password.placeholder')}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                required={hasPassword}
              />
            )}
          </div>

          {/* Expiry */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="rounded"
              />
              {t('expiry.enable')}
            </label>
            {hasExpiry && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
                <span className="text-slate-300">{t('expiry.days')}</span>
              </div>
            )}
          </div>

          {/* Access limit */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <input
                type="checkbox"
                checked={hasAccessLimit}
                onChange={(e) => setHasAccessLimit(e.target.checked)}
                className="rounded"
              />
              {t('accessLimit.enable')}
            </label>
            {hasAccessLimit && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={maxAccesses}
                  onChange={(e) => setMaxAccesses(Number(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
                <span className="text-slate-300">{t('accessLimit.accesses')}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 px-4 py-2 rounded text-white"
            >
              {loading ? t('creating') : t('createLink')}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-white"
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}