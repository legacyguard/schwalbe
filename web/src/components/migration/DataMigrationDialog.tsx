
import _React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { dataMigrationTool } from '@/lib/migration/DataMigrationTool';

interface MigrationProgress {
  errors: Array<{
    error: string;
    id: string;
  }>;
  failed: number;
  processed: number;
  status: 'completed' | 'failed' | 'pending' | 'running';
  total: number;
}

export function DataMigrationDialog({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation('migration');
  const [progress, setProgress] = useState<MigrationProgress>({
    total: 0,
    processed: 0,
    failed: 0,
    status: 'pending',
    errors: [],
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Register progress callback
    dataMigrationTool.onProgress(setProgress);

    // Check if migration is needed
    dataMigrationTool.isMigrationNeeded().then(needed => {
      if (!needed) {
        onClose();
      }
    });
  }, [onClose]);

  const handleStart = async () => {
    try {
      await dataMigrationTool.startMigration();
      if (progress.status === 'completed') {
        // Clean up legacy data after successful migration
        await dataMigrationTool.cleanupLegacyData();
        onComplete();
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const handleRetry = () => {
    dataMigrationTool.rollback().then(handleStart);
  };

  const progressPercentage =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <h2 className='text-xl font-bold mb-4'>{t('title')}</h2>

        <p className='text-gray-600 mb-6'>{t('description')}</p>

        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='h-2 bg-gray-200 rounded-full'>
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                progress.status === 'failed'
                  ? 'bg-red-500'
                  : progress.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}}%` }}
            />
          </div>
          <div className='flex justify-between mt-2 text-sm text-gray-500'>
            <span>
              {progress.processed} / {progress.total} {t('items')}
            </span>
            <span>{progressPercentage}%</span>
          </div>
        </div>

        {/* Status Message */}
        <div className='mb-6'>
          <p
            className={`text-center ${
              progress.status === 'failed'
                ? 'text-red-600'
                : progress.status === 'completed'
                  ? 'text-green-600'
                  : 'text-blue-600'
            }`}
          >
            {t(`status.${progress.status}`)}
          </p>
        </div>

        {/* Error Details */}
        {progress.errors.length > 0 && (
          <div className='mb-6'>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='text-red-600 hover:underline text-sm flex items-center'
            >
              <span className='mr-1'>{showDetails ? '▼' : '▶'}</span>
              {t('showErrors', { count: progress.errors.length })}
            </button>
            {showDetails && (
              <div className='mt-2 text-sm bg-red-50 p-3 rounded'>
                {progress.errors.map(error => (
                  <p key={error.id} className='text-red-600'>
                    {error.id}: {error.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex justify-end space-x-3'>
          {progress.status === 'pending' && (
            <>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                {t('later')}
              </button>
              <button
                onClick={handleStart}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                {t('start')}
              </button>
            </>
          )}

          {progress.status === 'failed' && (
            <>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                {t('close')}
              </button>
              <button
                onClick={handleRetry}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                {t('retry')}
              </button>
            </>
          )}

          {progress.status === 'completed' && (
            <button
              onClick={onClose}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            >
              {t('done')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
