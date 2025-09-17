
import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export function TermsOfService() {
  const { t } = useTranslation('pages/terms-of-service');

  return (
    <LegalPageLayout
      title={t('title')}
      description={t('description')}
    >
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('acceptanceOfTerms.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('acceptanceOfTerms.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('descriptionOfService.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('descriptionOfService.content')}
        </p>
        <ul className='list-disc pl-6 mb-4'>
          {t('descriptionOfService.features', { returnObjects: true }).map((feature: string, index: number) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('userAccountsSecurity.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('userAccountsSecurity.accountability')}
        </p>
        <p className='leading-relaxed mb-4'>
          {t('userAccountsSecurity.securityMeasures')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('dataPrivacyProtection.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('dataPrivacyProtection.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('legalDisclaimers.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('legalDisclaimers.consultation')}
        </p>
        <p className='leading-relaxed mb-4'>
          <strong>{t('legalDisclaimers.important')}</strong> {t('legalDisclaimers.toolDisclaimer')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('securityData.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('securityData.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('termination.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('termination.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('limitationOfLiability.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('limitationOfLiability.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('changesToTerms.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('changesToTerms.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('governingLaw.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('governingLaw.content')}
        </p>
      </section>
    </LegalPageLayout>
  );
}
