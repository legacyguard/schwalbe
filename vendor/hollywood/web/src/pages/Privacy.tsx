
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PrivacyPage() {
  const { t } = useTranslation('ui/privacy-page');
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-green-200/50 dark:border-green-800/50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <motion.div
              className='flex items-center gap-3 cursor-pointer'
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <LegacyGuardLogo />
              <span className='text-2xl font-bold text-green-900 dark:text-green-100 font-heading'>
                LegacyGuard
              </span>
            </motion.div>

            <Button
              variant='ghost'
              onClick={() => navigate('/')}
              className='text-green-700 hover:text-green-900'
            >
              {t('header.backToHome')}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='container mx-auto px-4 py-12 max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className='text-4xl font-bold text-green-900 dark:text-green-100 mb-8 text-center'>
            {t('title')}
          </h1>

          <Card className='p-8 bg-white/80 dark:bg-slate-800/80'>
            <CardContent className='prose dark:prose-invert max-w-none'>
              <p className='text-lg text-green-700 dark:text-green-300 mb-6'>
                {t('lastUpdated', { date: new Date().toLocaleDateString() })}
              </p>

              <h2>{t('sections.priority.title')}</h2>
              <p>
                {t('sections.priority.content')}
              </p>

              <h2>{t('sections.informationWeCollect.title')}</h2>
              <ul>
                <li>
                  <strong>{t('sections.informationWeCollect.accountInfo.title')}</strong> {t('sections.informationWeCollect.accountInfo.description')}
                </li>
                <li>
                  <strong>{t('sections.informationWeCollect.documentData.title')}</strong> {t('sections.informationWeCollect.documentData.description')}
                </li>
                <li>
                  <strong>{t('sections.informationWeCollect.usageData.title')}</strong> {t('sections.informationWeCollect.usageData.description')}
                </li>
              </ul>

              <h2>{t('sections.zeroKnowledgeArchitecture.title')}</h2>
              <p>
                {t('sections.zeroKnowledgeArchitecture.intro')}
              </p>
              <ul>
                {t('sections.zeroKnowledgeArchitecture.points', { returnObjects: true }).map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>

              <h2>{t('sections.howWeUseInformation.title')}</h2>
              <ul>
                {t('sections.howWeUseInformation.points', { returnObjects: true }).map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>

              <h2>{t('sections.dataSecurity.title')}</h2>
              <p>{t('sections.dataSecurity.intro')}</p>
              <ul>
                {t('sections.dataSecurity.points', { returnObjects: true }).map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>

              <h2>{t('sections.yourRights.title')}</h2>
              <p>{t('sections.yourRights.intro')}</p>
              <ul>
                {t('sections.yourRights.points', { returnObjects: true }).map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>

              <h2>{t('sections.contactUs.title')}</h2>
              <p>
                {t('sections.contactUs.content')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
