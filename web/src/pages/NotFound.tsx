
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MetaTags } from '@/components/common/MetaTags';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation('ui/not-found');
  usePageTitle(t('pageTitle'));
  const location = useLocation();

  useEffect(() => {
    console.error(
      t('consoleError'),
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <MetaTags
        title={t('pageTitle')}
        description={t('metaDescription')}
        robots='noindex, nofollow'
      />
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold mb-4'>{t('heading')}</h1>
          <p className='text-xl text-gray-600 mb-4'>{t('message')}</p>
          <a href='/' className='text-blue-500 hover:text-blue-700 underline'>
            {t('returnHome')}
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
