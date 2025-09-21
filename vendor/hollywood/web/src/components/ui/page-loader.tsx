
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PageLoader() {
  const { t } = useTranslation('ui/page-loader');

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <div className='flex flex-col items-center space-y-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-sm text-muted-foreground'>{t('loading')}</p>
      </div>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className='flex items-center justify-center p-8'>
      <Loader2 className='h-6 w-6 animate-spin text-primary' />
    </div>
  );
}
