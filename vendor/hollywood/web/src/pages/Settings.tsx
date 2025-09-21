
/**
 * Settings Page - Application settings and preferences
 * Includes backup/restore functionality
 */

import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FadeIn } from '@/components/motion/FadeIn';
import { usePageTitle } from '@/hooks/usePageTitle';
import { BackupRestore } from '@/components/features/BackupRestore';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type CommunicationStyle,
  defaultUserPreferences,
  type UserPreferences,
} from '@/types/user-preferences';
import { textManager } from '@/lib/text-manager';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';

export default function SettingsPage() {
  const { t } = useTranslation('pages/settings');
  usePageTitle(t('pageTitle'));
  const { userId } = useAuth();
  const { user } = useUser();
  const personalityManager = usePersonalityManager();
  const [preferences, setPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const [isSaving, setIsSaving] = useState(false);
  const [personalityInsight, setPersonalityInsight] = useState<string>('');

  // Load preferences from localStorage
  useEffect(() => {
    if (userId) {
      const savedPrefs = localStorage.getItem(`preferences_${userId}`);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (error) {
          console.error('Error loading preferences:', error);
        }
      }
    }
  }, [userId]);

  // Load personality insights when personality manager is available
  useEffect(() => {
    if (personalityManager) {
      const insight = personalityManager.getPersonalityInsight();
      setPersonalityInsight(insight);

      // Sync personality settings with preferences
      const personality = personalityManager.getPersonality();
      const currentMode = personality.mode;

      // Map personality mode to legacy communication style
      let legacyStyle: CommunicationStyle = 'default';
      if (currentMode === 'empathetic') {
        legacyStyle = 'empathetic';
      } else if (currentMode === 'pragmatic') {
        legacyStyle = 'pragmatic';
      } else if (personality.userPreferences.manualOverride) {
        legacyStyle =
          personality.userPreferences.manualOverride === 'empathetic'
            ? 'empathetic'
            : 'pragmatic';
      }

      setPreferences(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          style: legacyStyle,
          autoDetection: personality.userPreferences.adaptationEnabled,
        },
      }));
    }
  }, [personalityManager]);

  // Save preferences to localStorage and update Sofia's text manager
  const savePreferences = async () => {
    if (!userId || !personalityManager || !user) return;

    setIsSaving(true);
    try {
      localStorage.setItem(
        `preferences_${userId}`,
        JSON.stringify(preferences)
      );

      // Update Sofia's text manager with the new communication style
      if (preferences.communication.style !== 'default') {
        textManager.setUserStyle(userId, preferences.communication.style);
      }

      // Update the personality manager with new settings
      if (preferences.communication.style === 'default') {
        // Adaptive mode - let Sofia learn automatically
        personalityManager.setMode('adaptive');
        personalityManager.setManualOverride(undefined);
      } else {
        // Manual override mode
        const manualStyle =
          preferences.communication.style === 'empathetic'
            ? 'empathetic'
            : 'pragmatic';
        personalityManager.setManualOverride(manualStyle);
      }

      // Update adaptation setting
      personalityManager.enableAdaptation(
        preferences.communication.autoDetection
      );

      // Refresh personality insight after changes
      const newInsight = personalityManager.getPersonalityInsight();
      setPersonalityInsight(newInsight);

      // Update Clerk user metadata with communication style
      try {
        // Use unsafeMetadata instead of publicMetadata for user preferences
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            communicationStyle: preferences.communication.style,
            sofiaAdaptationEnabled: preferences.communication.autoDetection,
            sofiaLastStyleUpdate: new Date().toISOString(),
          },
        });
      } catch (clerkError) {
        console.error('Failed to update Clerk metadata:', clerkError);
        // Continue even if Clerk update fails - local storage is still updated
      }

      toast.success(t('messages.savedSuccessfully'));
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('messages.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (
    category: keyof UserPreferences,
    key: string,
    value: boolean | string
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateCommunicationStyle = (style: CommunicationStyle) => {
    setPreferences(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        style: style,
        lastDetectionUpdate:
          style === 'default' ? null : new Date().toISOString(),
      },
    }));
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <header className='border-b border-card-border bg-card/50 backdrop-blur-sm'>
          <div className='max-w-7xl mx-auto px-6 lg:px-8 py-6'>
            <FadeIn duration={0.5} delay={0.1}>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold flex items-center gap-3'>
                    <Icon name='settings' className='w-8 h-8 text-primary' />
                    {t('header.title')}
                  </h1>
                  <p className='text-muted-foreground mt-1'>
                    {t('header.description')}
                  </p>
                </div>
                <Button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className='bg-primary hover:bg-primary-hover'
                >
                  {isSaving ? (
                    <>
                      <Icon
                        name='upload'
                        className='w-4 h-4 mr-2 animate-pulse'
                      />
                      {t('buttons.saving')}
                    </>
                  ) : (
                    <>
                      <Icon name='check' className='w-4 h-4 mr-2' />
                      {t('buttons.saveChanges')}
                    </>
                  )}
                </Button>
              </div>
            </FadeIn>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8'>
          {/* Account Information */}
          <FadeIn duration={0.5} delay={0.2}>
            <Card className='p-6 bg-card border-card-border'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name='user' className='w-5 h-5 text-primary' />
                {t('accountInformation.title')}
              </h2>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between py-2 border-b border-card-border'>
                  <span className='text-muted-foreground'>{t('accountInformation.name')}</span>
                  <span className='font-medium'>
                    {user?.fullName || t('accountInformation.notSet')}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-card-border'>
                  <span className='text-muted-foreground'>{t('accountInformation.email')}</span>
                  <span className='font-medium'>
                    {user?.primaryEmailAddress?.emailAddress || t('accountInformation.notSet')}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-card-border'>
                  <span className='text-muted-foreground'>{t('accountInformation.userId')}</span>
                  <span className='font-mono text-xs bg-muted px-2 py-1 rounded'>
                    {userId}
                  </span>
                </div>
                <div className='flex justify-between py-2'>
                  <span className='text-muted-foreground'>{t('accountInformation.memberSince')}</span>
                  <span className='font-medium'>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : t('accountInformation.unknown')}
                  </span>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Notification Preferences */}
          <FadeIn duration={0.5} delay={0.3}>
            <Card className='p-6 bg-card border-card-border'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name='mail' className='w-5 h-5 text-primary' />
                {t('notifications.title')}
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='email-notifications'>
                      {t('notifications.email.label')}
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('notifications.email.description')}
                    </p>
                  </div>
                  <Switch
                    id='email-notifications'
                    checked={preferences.notifications.email}
                    onCheckedChange={checked =>
                      updatePreference('notifications', 'email', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='push-notifications'>
                      {t('notifications.push.label')}
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('notifications.push.description')}
                    </p>
                  </div>
                  <Switch
                    id='push-notifications'
                    checked={preferences.notifications.push}
                    onCheckedChange={checked =>
                      updatePreference('notifications', 'push', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='reminders'>{t('notifications.reminders.label')}</Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('notifications.reminders.description')}
                    </p>
                  </div>
                  <Switch
                    id='reminders'
                    checked={preferences.notifications.reminders}
                    onCheckedChange={checked =>
                      updatePreference('notifications', 'reminders', checked)
                    }
                  />
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Privacy Settings */}
          <FadeIn duration={0.5} delay={0.4}>
            <Card className='p-6 bg-card border-card-border'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name='protection' className='w-5 h-5 text-primary' />
                {t('privacy.title')}
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='analytics'>{t('privacy.analytics.label')}</Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('privacy.analytics.description')}
                    </p>
                  </div>
                  <Switch
                    id='analytics'
                    checked={preferences.privacy.shareAnalytics}
                    onCheckedChange={checked =>
                      updatePreference('privacy', 'shareAnalytics', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='auto-backup'>{t('privacy.autoBackup.label')}</Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('privacy.autoBackup.description')}
                    </p>
                  </div>
                  <Switch
                    id='auto-backup'
                    checked={preferences.privacy.autoBackup}
                    onCheckedChange={checked =>
                      updatePreference('privacy', 'autoBackup', checked)
                    }
                  />
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Sofia Adaptive Personality */}
          <FadeIn duration={0.5} delay={0.5}>
            <Card className='p-6 bg-card border-card-border'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name='bot' className='w-5 h-5 text-primary' />
                {t('sofia.title')}
              </h2>

              {/* Personality Insights */}
              {personalityInsight && (
                <div className='mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <Icon
                      name='sparkles'
                      className='w-5 h-5 text-primary mt-0.5'
                    />
                    <div>
                      <h3 className='font-medium text-sm mb-1'>
                        {t('sofia.analysis')}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {personalityInsight}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className='space-y-4'>
                <div>
                  <Label>{t('sofia.communicationStyle.label')}</Label>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {t('sofia.communicationStyle.description')}
                  </p>
                  <RadioGroup
                    value={preferences.communication.style}
                    onValueChange={value =>
                      updateCommunicationStyle(value as CommunicationStyle)
                    }
                    className='space-y-3'
                  >
                    <div className='flex items-center space-x-3 p-3 border border-card-border rounded-lg hover:bg-muted/30 transition-colors'>
                      <RadioGroupItem value='default' id='style-default' />
                      <div className='flex-1'>
                        <Label htmlFor='style-default' className='font-medium'>
                          {t('sofia.communicationStyle.options.default.title')}
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          {t('sofia.communicationStyle.options.default.description')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3 p-3 border border-card-border rounded-lg hover:bg-muted/30 transition-colors'>
                      <RadioGroupItem
                        value='empathetic'
                        id='style-empathetic'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor='style-empathetic'
                          className='font-medium'
                        >
                          {t('sofia.communicationStyle.options.empathetic.title')}
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          {t('sofia.communicationStyle.options.empathetic.description')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3 p-3 border border-card-border rounded-lg hover:bg-muted/30 transition-colors'>
                      <RadioGroupItem value='pragmatic' id='style-pragmatic' />
                      <div className='flex-1'>
                        <Label
                          htmlFor='style-pragmatic'
                          className='font-medium'
                        >
                          {t('sofia.communicationStyle.options.pragmatic.title')}
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          {t('sofia.communicationStyle.options.pragmatic.description')}
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className='flex items-center justify-between p-3 border border-card-border rounded-lg'>
                  <div className='space-y-0.5'>
                    <Label
                      htmlFor='auto-detection'
                      className='flex items-center gap-2'
                    >
                      <Icon name='brain' className='w-4 h-4 text-primary' />
                      {t('sofia.learningMode.label')}
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('sofia.learningMode.description')}
                    </p>
                  </div>
                  <Switch
                    id='auto-detection'
                    checked={preferences.communication.autoDetection}
                    onCheckedChange={checked =>
                      updatePreference(
                        'communication',
                        'autoDetection',
                        checked
                      )
                    }
                  />
                </div>

                {personalityManager && (
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        {t('sofia.confidenceLevel')}
                      </span>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            personalityManager.getConfidenceLevel() === 'high'
                              ? 'bg-green-500'
                              : personalityManager.getConfidenceLevel() ===
                                  'medium'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                          }`}
                        />
                        <span className='capitalize'>
                          {personalityManager.getConfidenceLevel()}
                        </span>
                      </div>
                    </div>

                    {personalityManager.shouldShowPersonalityHint() && (
                      <div className='text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200'>
                        <Icon
                          name='lightbulb'
                          className='w-3 h-3 inline mr-2'
                        />
                        {t('sofia.hint')}
                      </div>
                    )}
                  </div>
                )}

                {preferences.communication.lastDetectionUpdate && (
                  <div className='text-xs text-muted-foreground bg-muted p-2 rounded flex items-center gap-2'>
                    <Icon name='info' className='w-3 h-3' />
                    {t('sofia.lastUpdate', {
                      date: new Date(
                        preferences.communication.lastDetectionUpdate
                      ).toLocaleDateString()
                    })}
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>

          {/* Display Preferences */}
          <FadeIn duration={0.5} delay={0.6}>
            <Card className='p-6 bg-card border-card-border'>
              <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name='settings' className='w-5 h-5 text-primary' />
                {t('display.title')}
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='compact-mode'>{t('display.compactMode.label')}</Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('display.compactMode.description')}
                    </p>
                  </div>
                  <Switch
                    id='compact-mode'
                    checked={preferences.display.compactMode}
                    onCheckedChange={checked =>
                      updatePreference('display', 'compactMode', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='show-tips'>{t('display.showTips.label')}</Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('display.showTips.description')}
                    </p>
                  </div>
                  <Switch
                    id='show-tips'
                    checked={preferences.display.showTips}
                    onCheckedChange={checked =>
                      updatePreference('display', 'showTips', checked)
                    }
                  />
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Security Dashboard */}
          <FadeIn duration={0.5} delay={0.7}>
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold flex items-center gap-3'>
                <Icon name='shield-check' className='w-7 h-7 text-primary' />
                {t('securityCenter.title')}
              </h2>
              <SecurityDashboard />
            </div>
          </FadeIn>

          {/* Backup & Restore Section */}
          <FadeIn duration={0.5} delay={0.8}>
            <BackupRestore />
          </FadeIn>
        </main>
      </div>
    </DashboardLayout>
  );
}
