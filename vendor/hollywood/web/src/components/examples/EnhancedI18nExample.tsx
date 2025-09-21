
/**
 * Enhanced I18n Example Component
 * Demonstrates plurals, date formatting, and fallback mechanism
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/enhanced-config';

const EnhancedI18nExample: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [documentCount, setDocumentCount] = useState(1);
  const [guardianCount, setGuardianCount] = useState(3);
  const [fileSize] = useState(2048576); // 2MB
  const [amount] = useState(1500);
  const [uploadDate] = useState(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)); // 3 days ago
  const [createdDate] = useState(new Date('2024-01-15'));

  // Language switcher
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-8'>
      {/* Language Switcher */}
      <div className='flex gap-2 p-4 bg-gray-100 rounded-lg'>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-4 py-2 rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('sk')}
          className={`px-4 py-2 rounded ${i18n.language === 'sk' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          Slovenčina
        </button>
        <button
          onClick={() => changeLanguage('cs')}
          className={`px-4 py-2 rounded ${i18n.language === 'cs' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          Čeština
        </button>
      </div>

      {/* Plurals Examples */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-bold'>
          {t('plurals.title', 'Plural Examples')}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Document count */}
          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>{t('vault.title')}</h3>
            <div className='flex items-center gap-2 mb-2'>
              <button
                onClick={() => setDocumentCount(Math.max(0, documentCount - 1))}
                className='px-2 py-1 bg-gray-200 rounded'
              >
                -
              </button>
              <span className='font-mono w-12 text-center'>
                {documentCount}
              </span>
              <button
                onClick={() => setDocumentCount(documentCount + 1)}
                className='px-2 py-1 bg-gray-200 rounded'
              >
                +
              </button>
            </div>
            <p className='text-lg'>
              {t('vault.documentCount', { count: documentCount })}
            </p>
            <p className='text-sm text-gray-600 mt-1'>
              {t('dashboard.metrics.documentsProtectedCount', {
                count: documentCount,
              })}
            </p>
          </div>

          {/* Guardian count */}
          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>{t('guardians.title')}</h3>
            <div className='flex items-center gap-2 mb-2'>
              <button
                onClick={() => setGuardianCount(Math.max(0, guardianCount - 1))}
                className='px-2 py-1 bg-gray-200 rounded'
              >
                -
              </button>
              <span className='font-mono w-12 text-center'>
                {guardianCount}
              </span>
              <button
                onClick={() => setGuardianCount(guardianCount + 1)}
                className='px-2 py-1 bg-gray-200 rounded'
              >
                +
              </button>
            </div>
            <p className='text-lg'>
              {t('guardians.guardianCount', { count: guardianCount })}
            </p>
            <p className='text-sm text-gray-600 mt-1'>
              {t('guardians.activeCount', { count: guardianCount })}
            </p>
          </div>
        </div>

        {/* Upload success message */}
        <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-green-800'>
            ✅ {t('vault.uploadSuccess', { count: documentCount })}
          </p>
        </div>

        {/* Delete confirmation */}
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-800'>
            ⚠️ {t('vault.deleteConfirm', { count: documentCount })}
          </p>
        </div>
      </section>

      {/* Date Formatting Examples */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-bold'>
          {t('dateFormatting.title', 'Date Formatting')}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('dateFormatting.standard', 'Standard Date')}
            </h3>
            <p>{t('common.date', { date: createdDate })}</p>
          </div>

          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('dateFormatting.short', 'Short Date')}
            </h3>
            <p>{t('common.dateShort', { date: createdDate })}</p>
          </div>

          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('dateFormatting.long', 'Long Date')}
            </h3>
            <p>{t('common.dateLong', { date: createdDate })}</p>
          </div>

          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('dateFormatting.relative', 'Relative Date')}
            </h3>
            <p>{t('common.dateRelative', { date: uploadDate })}</p>
          </div>
        </div>

        {/* Practical examples */}
        <div className='space-y-2 p-4 bg-gray-50 rounded-lg'>
          <p>{t('vault.fileInfo.uploaded', { date: uploadDate })}</p>
          <p>{t('guardians.lastActive', { date: uploadDate })}</p>
          <p>{t('will.created', { date: createdDate })}</p>
          <p>{t('auth.lastLogin', { date: uploadDate })}</p>
        </div>
      </section>

      {/* Number and Currency Formatting */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-bold'>
          {t('numberFormatting.title', 'Number Formatting')}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('numberFormatting.fileSize', 'File Size')}
            </h3>
            <p>{t('common.fileSize', { size: fileSize })}</p>
            <p className='text-sm text-gray-600 mt-2'>
              {t('vault.fileInfo.size', { size: fileSize })}
            </p>
          </div>

          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('numberFormatting.currency', 'Currency')}
            </h3>
            <p>{t('common.currency', { amount })}</p>
            <p className='text-sm text-gray-600 mt-2'>
              {t('will.totalValue', { amount })}
            </p>
          </div>

          <div className='p-4 border rounded-lg'>
            <h3 className='font-semibold mb-2'>
              {t('numberFormatting.percentage', 'Percentage')}
            </h3>
            <p>{t('common.percent', { value: 0.75 })}</p>
            <p className='text-sm text-gray-600 mt-2'>
              {t('dashboard.stats.completionRate', { rate: 0.75 })}
            </p>
          </div>
        </div>
      </section>

      {/* Fallback Mechanism Demo */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-bold'>
          {t('fallback.title', 'Fallback Mechanism')}
        </h2>

        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <p className='mb-2'>
            <strong>{t('fallback.explanation', 'How fallback works:')}</strong>
          </p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>
              {t(
                'fallback.point1',
                'If a translation is missing in Slovak, English will be shown'
              )}
            </li>
            <li>
              {t(
                'fallback.point2',
                'This ensures the app never shows technical keys to users'
              )}
            </li>
            <li>
              {t(
                'fallback.point3',
                'Missing translations are logged in development mode'
              )}
            </li>
          </ul>
        </div>

        {/* Test missing translation */}
        <div className='p-4 border rounded-lg'>
          <p className='text-sm text-gray-600 mb-2'>
            {t('fallback.testMissing', 'Testing missing translation:')}
          </p>
          <p className='font-mono'>
            {t('this.key.does.not.exist', 'Fallback text for missing key')}
          </p>
        </div>
      </section>

      {/* Combined Real-World Example */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-bold'>
          {t('realWorld.title', 'Real-World Example')}
        </h2>

        <div className='p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
          <h3 className='text-xl font-semibold mb-4'>
            {t('dashboard.header.titleWithName', { name: 'Peter' })}
          </h3>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-white p-3 rounded shadow'>
              <p className='text-sm text-gray-600'>
                {t('dashboard.metrics.documentsProtected')}
              </p>
              <p className='text-2xl font-bold'>{documentCount}</p>
              <p className='text-xs text-gray-500'>
                {t('dashboard.metrics.documentsProtectedCount', {
                  count: documentCount,
                })}
              </p>
            </div>

            <div className='bg-white p-3 rounded shadow'>
              <p className='text-sm text-gray-600'>
                {t('dashboard.metrics.guardians')}
              </p>
              <p className='text-2xl font-bold'>{guardianCount}</p>
              <p className='text-xs text-gray-500'>
                {t('dashboard.metrics.guardiansCount', {
                  count: guardianCount,
                })}
              </p>
            </div>

            <div className='bg-white p-3 rounded shadow'>
              <p className='text-sm text-gray-600'>
                {t('dashboard.metrics.daysProtected')}
              </p>
              <p className='text-2xl font-bold'>365</p>
              <p className='text-xs text-gray-500'>
                {t('dashboard.metrics.daysProtectedCount', { count: 365 })}
              </p>
            </div>

            <div className='bg-white p-3 rounded shadow'>
              <p className='text-sm text-gray-600'>
                {t('settings.storage.title', 'Storage')}
              </p>
              <p className='text-2xl font-bold'>2.5 GB</p>
              <p className='text-xs text-gray-500'>
                {t('settings.storage.used', {
                  used: 2684354560, // 2.5 GB
                  total: 5368709120, // 5 GB
                })}
              </p>
            </div>
          </div>

          <div className='mt-4 p-3 bg-white bg-opacity-70 rounded'>
            <p className='text-sm'>
              {t('dashboard.stats.lastActivity', { date: uploadDate })}
            </p>
          </div>
        </div>
      </section>

      {/* Debug Info */}
      {process.env['NODE_ENV'] === 'development' && (
        <section className='p-4 bg-gray-100 rounded-lg text-xs font-mono'>
          <h3 className='font-bold mb-2'>Debug Info:</h3>
          <p>Current Language: {i18n.language}</p>
          <p>
            Fallback Language:{' '}
            {typeof i18n.options.fallbackLng === 'string' ||
            typeof i18n.options.fallbackLng === 'boolean'
              ? String(i18n.options.fallbackLng)
              : Array.isArray(i18n.options.fallbackLng)
                ? i18n.options.fallbackLng.join(', ')
                : JSON.stringify(i18n.options.fallbackLng)}
          </p>
          <p>
            Loaded Namespaces:{' '}
            {Array.isArray(i18n.options.ns)
              ? (i18n.options.ns as string[]).join(', ')
              : String(i18n.options.ns ?? '')}
          </p>
          <p>
            Plural Rule:{' '}
            {new Intl.PluralRules(i18n.language).select(documentCount)}
          </p>
        </section>
      )}
    </div>
  );
};

export default EnhancedI18nExample;
