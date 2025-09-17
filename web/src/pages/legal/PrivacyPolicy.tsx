
import { useTranslation } from 'react-i18next';
import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export function PrivacyPolicy() {
  const { t } = useTranslation('pages/privacy-policy');

  return (
    <LegalPageLayout
      title={t('title')}
      description={t('description')}
    >
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('commitment.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('commitment.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('informationWeCollect.title')}
        </h2>
        <h3 className='text-xl font-semibold mb-3'>{t('informationWeCollect.accountInfo.title')}</h3>
        <ul className='list-disc pl-6 mb-4'>
          {t('informationWeCollect.accountInfo.items', { returnObjects: true }).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className='text-xl font-semibold mb-3'>{t('informationWeCollect.encryptedContent.title')}</h3>
        <ul className='list-disc pl-6 mb-4'>
          {t('informationWeCollect.encryptedContent.items', { returnObjects: true }).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className='text-xl font-semibold mb-3'>{t('informationWeCollect.usageData.title')}</h3>
        <ul className='list-disc pl-6 mb-4'>
          {t('informationWeCollect.usageData.items', { returnObjects: true }).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('howWeUse.title')}
        </h2>
        <ul className='list-disc pl-6 mb-4'>
          {t('howWeUse.items', { returnObjects: true }).map((item: any, index: number) => (
            <li key={index}>
              <strong>{item.title}</strong> {item.description}
            </li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('dataSecurity.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('dataSecurity.introduction')}
        </p>
        <ul className='list-disc pl-6 mb-4'>
          {t('dataSecurity.items', { returnObjects: true }).map((item: any, index: number) => (
            <li key={index}>
              <strong>{item.title}</strong> {item.description}
            </li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('dataSharing.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('dataSharing.introduction')}
        </p>
        <ul className='list-disc pl-6 mb-4'>
          {t('dataSharing.providers', { returnObjects: true }).map((provider: any, index: number) => (
            <li key={index}>
              <strong>{provider.name}</strong> {provider.purpose}
            </li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('dataRights.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('dataRights.introduction')}
        </p>
        <ul className='list-disc pl-6 mb-4'>
          {t('dataRights.rights', { returnObjects: true }).map((right: any, index: number) => (
            <li key={index}>
              <strong>{right.title}</strong> {right.description}
            </li>
          ))}
        </ul>
        <p className='leading-relaxed mb-4'>
          {t('dataRights.exerciseRights')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('zeroKnowledge.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('zeroKnowledge.introduction')}
        </p>
        <ul className='list-disc pl-6 mb-4'>
          {t('zeroKnowledge.items', { returnObjects: true }).map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>
          {t('policyChanges.title')}
        </h2>
        <p className='leading-relaxed mb-4'>
          {t('policyChanges.content')}
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('contact.title')}</h2>
        <p className='leading-relaxed mb-4'>
          {t('contact.introduction')}
        </p>
        <div className='bg-muted rounded-lg p-4'>
          <p className='text-foreground'>
            {t('contact.email')}
            <br />
            {t('contact.dpo')}
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
