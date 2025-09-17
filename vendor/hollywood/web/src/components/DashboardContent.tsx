
import { Icon } from '@/components/ui/icon-library';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FadeIn } from '@/components/motion/FadeIn';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { PathOfSerenity } from '@/components/dashboard/PathOfSerenity';
import { AttentionSection } from '@/components/dashboard/AttentionSection';
import { LegacyOverviewSection } from '@/components/dashboard/LegacyOverviewSection';
import { useEncryptionReady } from '@/hooks/encryption/useEncryption';
import { EncryptionSetup } from '@/components/encryption/EncryptionSetup';
import { MetricsGrid } from '@/components/enhanced/MetricCard';
import {
  ActivityFeed,
  useMockActivities,
} from '@/components/enhanced/ActivityFeed';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { TrustScoreDisplay } from '@/components/trust/TrustScoreDisplay';
import { calculateUserTrustScore } from '@/lib/trust-score/trust-score-calculator';
import { EmailImportButton } from '@/components/features/EmailImportButton';
import { EnhancedGardenSection } from '@/components/dashboard/EnhancedGardenSection';
import type { BulkImportResult } from '@/types/gmail';
// import { useState } from 'react'; // Not currently used

export function DashboardContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation('ui/dashboard');
  const { needsSetup, isLoading } = useEncryptionReady();
  const mockActivities = useMockActivities();
  const personalityManager = usePersonalityManager();

  // Get current personality mode for dashboard adaptation
  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  // Mock user stats for trust score calculation
  const mockUserStats = {
    documents: Array(5).fill({}), // 5 documents uploaded
    professional_reviews: [], // No professional reviews yet
    emergency_contacts: Array(1).fill({}), // 1 emergency contact
    guardians: [], // No guardians assigned
    will_completed: false, // Will not completed
    encryption_enabled: true, // Encryption enabled
    two_factor_enabled: false, // 2FA not enabled
    family_members: Array(2).fill({}), // 2 family members
    shared_documents: Array(3).fill({}), // 3 documents shared
    last_activity_days: 2, // Active 2 days ago
    account_age_days: 45, // Account is 45 days old
    legal_compliance_score: 0, // No legal compliance score yet
  };

  const trustScore = calculateUserTrustScore(mockUserStats);

  // Handle email import completion
  const handleEmailImportComplete = (result: BulkImportResult) => {
    // In production, this would update the user's document count and trust score
    // Could also show a success toast or update the dashboard metrics
    if (result.documents.length > 0) {
      // Update dashboard metrics based on import results
    }
  };

  // Mock metrics data - in production, this would come from your API
  const metrics = [
    {
      title: t('metrics.documentsProtected'),
      value: '24',
      change: 12,
      trend: 'up' as const,
      icon: 'file-text' as const,
      color: 'primary' as const,
      onClick: () => navigate('/vault'),
    },
    {
      title: t('metrics.familyMembers'),
      value: '8',
      change: 2,
      trend: 'up' as const,
      icon: 'users' as const,
      color: 'success' as const,
      onClick: () => navigate('/family'),
    },
    {
      title: t('metrics.guardians'),
      value: '3',
      changeLabel: t('metrics.labels.active'),
      icon: 'shield' as const,
      color: 'warning' as const,
      onClick: () => navigate('/guardians'),
    },
    {
      title: t('metrics.daysProtected'),
      value: '147',
      icon: 'calendar' as const,
      color: 'info' as const,
    },
  ];

  // Show encryption setup if needed
  if (!isLoading && needsSetup) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-6'>
        <EncryptionSetup />
      </div>
    );
  }

  const handleNewInformation = () => {
    navigate('/vault');
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header - Family Shield Dashboard */}
      <header className='bg-card border-b border-card-border'>
        <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger className='lg:hidden' />
              <div>
                <FadeIn duration={0.5} delay={0.2}>
                  <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground mb-3'>
                    {user?.firstName
                      ? t('header.titleWithName', {
                          name: user.firstName,
                        })
                      : t('header.title')}
                  </h1>
                </FadeIn>
                <FadeIn duration={0.5} delay={0.4}>
                  <p className='text-lg leading-relaxed max-w-2xl text-muted-foreground'>
                    {t(`header.subtitle.${effectiveMode}`)}
                  </p>
                </FadeIn>
              </div>
            </div>
            <FadeIn duration={0.5} delay={0.6}>
              <Button
                onClick={handleNewInformation}
                className='bg-primary hover:bg-primary-hover text-primary-foreground shadow-md'
                size='lg'
              >
                <Icon name='add' className='w-5 h-5 mr-2' />
                {t('header.actions.secureNewInformation')}
              </Button>
            </FadeIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-16'>
        {/* Analytics Metrics - Personality Adapted */}
        <section>
          <FadeIn duration={0.5} delay={0.8}>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-card-foreground'>
                {t(`metrics.title.${effectiveMode}`)}
              </h2>
              {effectiveMode === 'empathetic' && (
                <span className='text-sm text-muted-foreground italic'>
                  {t('metrics.subtitle.empathetic')}
                </span>
              )}
            </div>
            <MetricsGrid metrics={metrics} columns={4} />
          </FadeIn>
        </section>

        {/* Email Import Feature */}
        <section>
          <FadeIn duration={0.5} delay={1.0}>
            <EmailImportButton onImportComplete={handleEmailImportComplete} />
          </FadeIn>
        </section>

        {/* Main Dashboard Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Path & Overview */}
          <div className='lg:col-span-2 space-y-8'>
            {/* 1. Section: Path of Serenity with Enhanced Garden */}
            <div>
              <PathOfSerenity className='w-full' />

              {/* Enhanced Garden Integration */}
              <div className='mt-8'>
                <FadeIn duration={0.5} delay={1.2}>
                  <EnhancedGardenSection
                    personalityMode={effectiveMode}
                    size='medium'
                    variant='standard'
                    showHeader={true}
                    showProgress={true}
                    showQuickActions={true}
                    className='w-full'
                  />
                </FadeIn>
              </div>
            </div>

            {/* 2. Section: Current Challenges (Dynamic action zone) */}
            <AttentionSection />

            {/* 3. Section: Shield Areas Overview (Bundle cards) */}
            <LegacyOverviewSection />
          </div>

          {/* Right Column - Trust Score & Activity Feed */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Trust Score Display */}
            <FadeIn duration={0.5} delay={1.0}>
              <TrustScoreDisplay
                trustScore={trustScore.totalScore}
                showDetails={true}
                showBoosts={true}
                userId={user?.id ?? ''}
                onImproveClick={() => {
                  // Navigate to improvement suggestions or professional review
                  if (
                    trustScore.nextMilestone?.suggestions.includes(
                      'professional'
                    )
                  ) {
                    navigate('/legacy'); // Will wizard with professional review
                  } else {
                    navigate('/vault'); // Document upload area
                  }
                }}
                className='mb-6'
              />
            </FadeIn>

            {/* Activity Feed */}
            <ActivityFeed
              activities={mockActivities}
              title={t('activity.title')}
              maxHeight='500px'
              onViewAll={() => navigate('/activity')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
