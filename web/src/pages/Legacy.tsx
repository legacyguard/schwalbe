
import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { EnhancedWillWizard } from '@/components/legacy/EnhancedWillWizard';
import type { WillData } from '@/components/legacy/WillWizard';
import type { WillType } from '@/components/legacy/WillTypeSelector';
import { useTranslation } from 'react-i18next';

export default function LegacyPage() {
  const { t } = useTranslation('ui/legacy-page');
  usePageTitle(t('header.title'));
  useAuth();
  const { user } = useUser();
  const [showWillWizard, setShowWillWizard] = useState(false);

  // Get user's first name from Clerk
  const firstName =
    user?.firstName || user?.fullName?.split(' ')[0] || 'Friend';

  const handleStartWillCreator = () => {
    setShowWillWizard(true);
  };

  const handleWillComplete = (_willData: WillData & { willType: WillType }) => {
    // TODO: Save will to database
    // console.log('Will completed:', willData);
    toast.success(
      t('toastMessages.willCreatedSuccess')
    );
    setShowWillWizard(false);
  };

  const handleCloseWizard = () => {
    setShowWillWizard(false);
  };

  // Show Will Wizard if activated
  if (showWillWizard) {
    return (
      <EnhancedWillWizard
        onClose={handleCloseWizard}
        onComplete={handleWillComplete}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Hero Section */}
        <header className='bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b border-card-border'>
          <div className='max-w-4xl mx-auto px-6 lg:px-8 py-16 text-center'>
            <FadeIn duration={0.8} delay={0.2}>
              <div className='w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center'>
                <Icon
                  name="wishes"
                  className='w-10 h-10 text-primary'
                />
              </div>
            </FadeIn>

            <FadeIn duration={0.8} delay={0.4}>
              <h1 className='text-4xl lg:text-5xl font-bold font-heading text-card-foreground mb-6'>
                {t('header.title')}
              </h1>
            </FadeIn>

            <FadeIn duration={0.8} delay={0.6}>
              <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed'>
                {t('header.personalMessage', { firstName })}
              </p>
            </FadeIn>

            <FadeIn duration={0.8} delay={0.8}>
              <Button
                onClick={handleStartWillCreator}
                size='lg'
                className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
              >
                <Icon name="documents" className='w-5 h-5 mr-2' />
                {t('buttons.createWillNow')}
              </Button>
            </FadeIn>
          </div>
        </header>

        <main className='max-w-6xl mx-auto px-6 lg:px-8 py-16'>
          {/* What's Coming */}
          <FadeIn duration={0.6} delay={1.0}>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-bold mb-4'>
                {t('sections.whatsComing.title')}
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                {t('sections.whatsComing.subtitle')}
              </p>
            </div>
          </FadeIn>

          {/* Feature Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
            <FadeIn duration={0.6} delay={1.2}>
              <Card
                className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-primary/20 bg-primary/5'
                onClick={handleStartWillCreator}
              >
                <div className='w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300'>
                  <Icon
                    name="documents"
                    className='w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <div className='flex items-center justify-center gap-2 mb-4'>
                  <h3 className='text-xl font-semibold'>
                    {t('features.digitalWillCreator.title')}
                  </h3>
                  <div className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-xs font-medium text-green-700 dark:text-green-300'>
                      {t('features.digitalWillCreator.statusLabel')}
                    </span>
                  </div>
                </div>
                <p className='text-muted-foreground leading-relaxed mb-4'>
                  {t('features.digitalWillCreator.description')}
                </p>
                <Button className='bg-primary hover:bg-primary-hover text-primary-foreground'>
                  <Icon name="arrow-right" className='w-4 h-4 mr-2' />
                  {t('buttons.startCreatingWill')}
                </Button>
              </Card>
            </FadeIn>

            <FadeIn duration={0.6} delay={1.4}>
              <Card className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group'>
                <div className='w-16 h-16 mx-auto mb-6 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300'>
                  <Icon
                    name="video"
                    className='w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-xl font-semibold mb-4'>
                  {t('features.timeCapsuleMessages.title')}
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {t('features.timeCapsuleMessages.description')}
                </p>
              </Card>
            </FadeIn>

            <FadeIn duration={0.6} delay={1.6}>
              <Card className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group'>
                <div className='w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300'>
                  <Icon
                    name="protection"
                    className='w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-xl font-semibold mb-4'>
                  {t('features.healthcareDirectives.title')}
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {t('features.healthcareDirectives.description')}
                </p>
              </Card>
            </FadeIn>

            <FadeIn duration={0.6} delay={1.8}>
              <Card className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group'>
                <div className='w-16 h-16 mx-auto mb-6 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500/20 transition-colors duration-300'>
                  <Icon
                    name="financial"
                    className='w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-xl font-semibold mb-4'>
                  {t('features.assetDistribution.title')}
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {t('features.assetDistribution.description')}
                </p>
              </Card>
            </FadeIn>

            <FadeIn duration={0.6} delay={2.0}>
              <Card className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group'>
                <div className='w-16 h-16 mx-auto mb-6 bg-rose-500/10 rounded-full flex items-center justify-center group-hover:bg-rose-500/20 transition-colors duration-300'>
                  <Icon
                    name="wishes"
                    className='w-8 h-8 text-rose-600 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-xl font-semibold mb-4'>{t('features.finalWishes.title')}</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {t('features.finalWishes.description')}
                </p>
              </Card>
            </FadeIn>

            <FadeIn duration={0.6} delay={2.2}>
              <Card className='p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group'>
                <div className='w-16 h-16 mx-auto mb-6 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors duration-300'>
                  <Icon
                    name="users"
                    className='w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-xl font-semibold mb-4'>
                  {t('features.guardianIntegration.title')}
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  {t('features.guardianIntegration.description')}
                </p>
              </Card>
            </FadeIn>
          </div>

          {/* Why It Matters Section */}
          <FadeIn duration={0.6} delay={2.4}>
            <Card className='p-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 mb-16'>
              <div className='max-w-4xl mx-auto text-center'>
                <Icon
                  name="heart"
                  className='w-12 h-12 text-primary mx-auto mb-6'
                />
                <h3 className='text-2xl font-bold mb-6'>
                  {t('sections.whyItMatters.title')}
                </h3>
                <p className='text-lg text-muted-foreground leading-relaxed mb-8'>
                  {t('sections.whyItMatters.content', { firstName })}
                </p>
                <div className='grid md:grid-cols-3 gap-8 text-left'>
                  <div className='flex gap-4'>
                    <Icon
                      name="shield-check"
                      className='w-6 h-6 text-primary flex-shrink-0 mt-1'
                    />
                    <div>
                      <h4 className='font-semibold mb-2'>{t('sections.whyItMatters.benefits.peaceOfMind.title')}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {t('sections.whyItMatters.benefits.peaceOfMind.description')}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-4'>
                    <Icon
                      name="heart"
                      className='w-6 h-6 text-primary flex-shrink-0 mt-1'
                    />
                    <div>
                      <h4 className='font-semibold mb-2'>{t('sections.whyItMatters.benefits.familyHarmony.title')}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {t('sections.whyItMatters.benefits.familyHarmony.description')}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-4'>
                    <Icon
                      name="clock"
                      className='w-6 h-6 text-primary flex-shrink-0 mt-1'
                    />
                    <div>
                      <h4 className='font-semibold mb-2'>{t('sections.whyItMatters.benefits.timeToConnect.title')}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {t('sections.whyItMatters.benefits.timeToConnect.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Action Section */}
          <FadeIn duration={0.6} delay={2.6}>
            <Card className='p-10 text-center max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
              <Icon
                name="sparkles"
                className='w-12 h-12 text-primary mx-auto mb-6'
              />
              <h3 className='text-2xl font-bold mb-4'>
                {t('sections.readyToSecure.title')}
              </h3>
              <p className='text-muted-foreground mb-8'>
                {t('sections.readyToSecure.subtitle')}
              </p>

              <Button
                onClick={handleStartWillCreator}
                size='lg'
                className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
              >
                <Icon name="documents" className='w-5 h-5 mr-2' />
                {t('buttons.startWillNow')}
              </Button>

              <p className='text-xs text-muted-foreground mt-4'>
                {t('sections.readyToSecure.disclaimer')}
              </p>
            </Card>
          </FadeIn>

          {/* Legal Disclaimer */}
          <FadeIn duration={0.6} delay={2.8}>
            <Card className='mt-12 p-6 bg-muted/30 border-muted'>
              <div className='flex gap-3'>
                <Icon
                  name="info"
                  className='w-5 h-5 text-muted-foreground flex-shrink-0 mt-1'
                />
                <div>
                  <h4 className='font-semibold mb-2'>{t('sections.legalNotice.title')}</h4>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {t('sections.legalNotice.content')}
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        </main>
      </div>
    </DashboardLayout>
  );
}
