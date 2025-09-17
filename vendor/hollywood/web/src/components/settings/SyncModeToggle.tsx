
import _React, { useEffect, useState } from 'react';
import {
  localDataAdapter,
  type SyncMode,
} from '@/lib/storage/LocalDataAdapter';
import { cloudSyncAdapter } from '@/lib/storage/CloudSyncAdapter';
import { useTranslation } from '@/lib/i18n';

type CategorySyncInfo = {
  localCount: number;
  name: string;
  syncedCount: number;
  syncEnabled: boolean;
};

export function SyncModeToggle() {
  const { t } = useTranslation('settings');
  const [syncMode, setSyncMode] = useState<SyncMode>('local-only');
  const [categories, setCategories] = useState<CategorySyncInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current sync mode and category stats
  useEffect(() => {
    async function loadSyncState() {
      try {
        // TODO: Load actual sync mode from settings
        const mode = 'local-only' as SyncMode;
        setSyncMode(mode);

        // Load category stats
        const categoryStats = await Promise.all(
          ['tasks', 'documents', 'reminders', 'preferences'].map(
            async category => {
              const stats = await cloudSyncAdapter.getSyncStatus(category);
              return {
                name: category,
                localCount: stats.total,
                syncedCount: stats.synced,
                syncEnabled: mode !== 'local-only',
              };
            }
          )
        );

        setCategories(categoryStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load sync state:', error);
      }
    }

    loadSyncState();
  }, []);

  // Handle sync mode change
  const handleModeChange = async (mode: SyncMode) => {
    try {
      setIsLoading(true);
      await localDataAdapter.setSyncMode(mode);
      setSyncMode(mode);

      // Update category stats
      const updatedCategories = await Promise.all(
        categories.map(async cat => ({
          ...cat,
          syncEnabled: mode !== 'local-only',
        }))
      );

      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to change sync mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle individual category sync
  const toggleCategorySync = async (categoryName: string) => {
    try {
      setIsLoading(true);

      const category = categories.find(c => c.name === categoryName);
      if (!category) return;

      // Update sync mode if needed
      let newMode = syncMode;
      if (syncMode === 'local-only') {
        newMode = 'hybrid';
        await localDataAdapter.setSyncMode(newMode);
        setSyncMode(newMode);
      }

      // Toggle category sync
      const updatedCategories = categories.map(cat =>
        cat.name === categoryName
          ? { ...cat, syncEnabled: !cat.syncEnabled }
          : cat
      );

      setCategories(updatedCategories);

      // Force sync if enabling
      if (!category.syncEnabled) {
        await cloudSyncAdapter.forceSyncCategory(categoryName);
      }
    } catch (error) {
      console.error('Failed to toggle category sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 bg-gray-200 rounded w-48 mb-4' />
        <div className='space-y-3'>
          <div className='h-16 bg-gray-200 rounded' />
          <div className='h-16 bg-gray-200 rounded' />
          <div className='h-16 bg-gray-200 rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Mode Selection */}
      <div className='flex flex-col space-y-2'>
        <h3 className='text-lg font-medium'>{t('sync.mode.title')}</h3>
        <div className='flex space-x-4'>
          <button
            onClick={() => handleModeChange('local-only')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              syncMode === 'local-only'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className='mr-2'>🔒</span>
            {t('sync.mode.local')}
          </button>
          <button
            onClick={() => handleModeChange('hybrid')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              syncMode === 'hybrid'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className='mr-2'>🔄</span>
            {t('sync.mode.hybrid')}
          </button>
          <button
            onClick={() => handleModeChange('full-sync')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              syncMode === 'full-sync'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className='mr-2'>☁️</span>
            {t('sync.mode.full')}
          </button>
        </div>
        <p className='text-sm text-gray-500'>
          {t(`sync.mode.description.${syncMode}`)}
        </p>
      </div>

      {/* Category List */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>{t('sync.categories.title')}</h3>
        {categories.map(category => (
          <div
            key={category.name}
            className='flex items-center justify-between p-4 bg-white rounded-lg shadow'
          >
            <div className='flex items-center space-x-4'>
              <span className='text-xl'>
                {category.syncEnabled ? '☁️' : '🔒'}
              </span>
              <div>
                <h4 className='font-medium capitalize'>
                  {t(`sync.categories.${category.name}`)}
                </h4>
                <p className='text-sm text-gray-500'>
                  {t('sync.categories.stats', {
                    local: category.localCount,
                    synced: category.syncedCount,
                  })}
                </p>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={category.syncEnabled}
                onChange={() => toggleCategorySync(category.name)}
                disabled={syncMode === 'local-only' || syncMode === 'full-sync'}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <p className='text-sm text-gray-500'>
        {t('sync.help.text')}
        <button className='text-blue-600 hover:underline ml-1'>
          {t('sync.help.learnMore')}
        </button>
      </p>
    </div>
  );
}
