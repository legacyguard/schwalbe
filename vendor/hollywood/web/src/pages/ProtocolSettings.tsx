
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import type {
  CreateFamilyShieldSettingsRequest,
  FamilyShieldSettings,
  Guardian,
} from '@/types/guardian';

export default function ProtocolSettingsPage() {
  const { t } = useTranslation('common/page-titles');
  usePageTitle(t('familyShieldSettings'));
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();

  const [settings, setSettings] = useState<FamilyShieldSettings | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateFamilyShieldSettingsRequest>({
    inactivity_period_months: 6,
    required_guardians_for_activation: 2,
    is_shield_enabled: false,
  });

  // Fetch protocol settings and guardians
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const supabase = await createSupabaseClient();

      // Fetch Family Shield settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('family_shield_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // Not found error is OK
        throw settingsError;
      }

      if (settingsData) {
        // Map database fields to application interface
        const mappedSettings = {
          ...settingsData,
          inactivity_period_months: settingsData.inactivity_threshold || 6,
          is_shield_enabled: settingsData.is_enabled || false,
          last_activity_check: settingsData.updated_at,
          required_guardians_for_activation: 2, // Default value
          shield_status: (settingsData.is_enabled ? 'active' : 'inactive') as 'active' | 'inactive' | 'pending_verification',
        } as FamilyShieldSettings;

        setSettings(mappedSettings);
        setFormData({
          inactivity_period_months: mappedSettings.inactivity_period_months,
          required_guardians_for_activation: mappedSettings.required_guardians_for_activation,
          is_shield_enabled: mappedSettings.is_shield_enabled,
        });
      }

      // Fetch guardians
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('emergency_contact_priority', { ascending: true });

      if (guardiansError) throw guardiansError;

      const mappedGuardians = (guardiansData || []).map(guardian => ({
        ...guardian,
        can_access_financial_docs: (guardian as any).can_access_financial_docs ?? false,
        can_access_health_docs: (guardian as any).can_access_health_docs ?? false,
        can_trigger_emergency: (guardian as any).can_trigger_emergency ?? false,
        is_child_guardian: (guardian as any).is_child_guardian ?? false,
        is_will_executor: (guardian as any).is_will_executor ?? false,
        emergency_contact_priority: guardian.emergency_contact_priority ?? 1,
      }));
      setGuardians(mappedGuardians as Guardian[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [userId, createSupabaseClient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submission
  const handleSave = async () => {
    if (!userId) return;

    // Validation
    if (
      !formData.inactivity_period_months ||
      formData.inactivity_period_months < 1 ||
      formData.inactivity_period_months > 24
    ) {
      toast.error('Inactivity period must be between 1 and 24 months');
      return;
    }

    if (
      !formData.required_guardians_for_activation ||
      formData.required_guardians_for_activation < 1 ||
      formData.required_guardians_for_activation > guardians.length
    ) {
      toast.error(
        `Required guardians must be between 1 and ${guardians.length}`
      );
      return;
    }

    setIsSaving(true);

    try {
      const supabase = await createSupabaseClient();

      const settingsPayload = {
        user_id: userId,
        inactivity_period_months: formData.inactivity_period_months,
        required_guardians_for_activation:
          formData.required_guardians_for_activation,
        is_shield_enabled: formData.is_shield_enabled,
      };

      let result;
      if (settings) {
        // Update existing settings
        result = await supabase
          .from('family_shield_settings')
          .update(settingsPayload)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('family_shield_settings')
          .insert(settingsPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Map database result to application interface
      const mappedResult = {
        ...result.data,
        inactivity_period_months: result.data.inactivity_threshold || 6,
        is_shield_enabled: result.data.is_enabled || false,
        last_activity_check: result.data.updated_at,
        required_guardians_for_activation: 2,
        shield_status: (result.data.is_enabled ? 'active' : 'inactive') as 'active' | 'inactive' | 'pending_verification',
      } as FamilyShieldSettings;
      setSettings(mappedResult);
      toast.success('Family Shield settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    field: keyof CreateFamilyShieldSettingsRequest,
    value: boolean | number | string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get emergency-enabled guardians
  const emergencyGuardians = guardians.filter(g => g.can_trigger_emergency);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Icon name='loader' className='w-8 h-8 animate-spin text-primary' />
          <span className='ml-3 text-muted-foreground'>
            Loading Family Shield settings...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <header className='bg-card border-b border-card-border'>
          <div className='max-w-4xl mx-auto px-6 lg:px-8 py-8'>
            <FadeIn duration={0.5} delay={0.2}>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Icon name='shield-check' className='w-6 h-6 text-primary' />
                </div>
                <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground'>
                  Family Shield Settings
                </h1>
              </div>
            </FadeIn>
            <FadeIn duration={0.5} delay={0.4}>
              <p
                className='text-lg leading-relaxed max-w-3xl'
                style={{ color: 'hsl(var(--muted-text))' }}
              >
                Configure your comprehensive family protection system to
                activate precisely when needed, ensuring your trusted circle
                receives clear guidance.
              </p>
            </FadeIn>
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-4xl mx-auto px-6 lg:px-8 py-12'>
          <div className='space-y-8'>
            {/* Protocol Status */}
            <FadeIn duration={0.5} delay={0.6}>
              <Card className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-xl font-semibold mb-2'>
                      Family Shield Status
                    </h3>
                    <p className='text-muted-foreground'>
                      Enable or disable your Family Shield protection system
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Switch
                      checked={formData.is_shield_enabled || false}
                      onCheckedChange={value =>
                        handleInputChange('is_shield_enabled', value)
                      }
                    />
                    <span
                      className={`font-medium ${formData.is_shield_enabled ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {formData.is_shield_enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {formData.is_shield_enabled && (
                  <div className='mt-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-center gap-2 text-green-800'>
                      <Icon name='shield-check' className='w-5 h-5' />
                      <span className='font-medium'>
                        Family Shield is Active
                      </span>
                    </div>
                    <p className='text-sm text-green-700 mt-1'>
                      Your Family Shield monitors your wellbeing discreetly and
                      stands ready to protect your loved ones with precision.
                    </p>
                  </div>
                )}
              </Card>
            </FadeIn>

            {/* Inactivity Detection */}
            <FadeIn duration={0.5} delay={0.8}>
              <Card className='p-6'>
                <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  <Icon name='clock' className='w-5 h-5 text-primary' />
                  Inactivity Detection
                </h3>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='inactivity_period'>
                      How long should we wait before checking on you?
                    </Label>
                    <div className='flex items-center gap-4 mt-2'>
                      <Input
                        id='inactivity_period'
                        type='number'
                        min='1'
                        max='24'
                        value={formData.inactivity_period_months}
                        onChange={e => {
                          const value = parseInt(e.target.value);
                          handleInputChange(
                            'inactivity_period_months',
                            isNaN(value) ? 6 : value
                          );
                        }}
                        className='w-20'
                      />
                      <span className='text-muted-foreground'>
                        months of no activity
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mt-2'>
                      If you don't sign in for this period, we'll start the
                      verification process to ensure you're okay.
                    </p>
                  </div>

                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <h4 className='font-medium text-blue-800 mb-2'>
                      How it works:
                    </h4>
                    <ol className='text-sm text-blue-700 space-y-1 list-decimal list-inside'>
                      <li>
                        We notice you haven't signed in for{' '}
                        {formData.inactivity_period_months} months
                      </li>
                      <li>
                        We send you multiple emails asking you to confirm you're
                        okay
                      </li>
                      <li>
                        If you don't respond within 7 days, we notify your
                        emergency guardians
                      </li>
                      <li>
                        Your guardians can then access your family's survival
                        guide
                      </li>
                    </ol>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Guardian Activation */}
            <FadeIn duration={0.5} delay={1.0}>
              <Card className='p-6'>
                <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  <Icon name='users' className='w-5 h-5 text-primary' />
                  Trusted Circle Activation
                </h3>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='required_guardians'>
                      How many guardians needed to manually activate your Family
                      Shield?
                    </Label>
                    <div className='flex items-center gap-4 mt-2'>
                      <Input
                        id='required_guardians'
                        type='number'
                        min='1'
                        max={emergencyGuardians.length || 1}
                        value={formData.required_guardians_for_activation}
                        onChange={e =>
                          handleInputChange(
                            'required_guardians_for_activation',
                            parseInt(e.target.value) || 2
                          )
                        }
                        className='w-20'
                      />
                      <span className='text-muted-foreground'>
                        of {emergencyGuardians.length} emergency guardians
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mt-2'>
                      This prevents false alarms and ensures multiple trusted
                      people agree there's an emergency.
                    </p>
                  </div>

                  {emergencyGuardians.length === 0 && (
                    <div className='p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                      <div className='flex items-center gap-2 text-amber-800'>
                        <Icon name='alert-triangle' className='w-5 h-5' />
                        <span className='font-medium'>
                          No Emergency Guardians
                        </span>
                      </div>
                      <p className='text-sm text-amber-700 mt-1'>
                        You need to designate at least one guardian with "Can
                        Trigger Family Shield" permission.
                      </p>
                    </div>
                  )}

                  {emergencyGuardians.length > 0 && (
                    <div className='space-y-3'>
                      <h4 className='font-medium text-sm'>
                        Your Emergency Guardians:
                      </h4>
                      <div className='space-y-2'>
                        {emergencyGuardians.map(guardian => (
                          <div
                            key={guardian.id}
                            className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                          >
                            <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                              <Icon
                                name='user'
                                className='w-4 h-4 text-primary'
                              />
                            </div>
                            <div className='flex-1'>
                              <p className='font-medium text-sm'>
                                {guardian.name}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                Priority {guardian.emergency_contact_priority} •{' '}
                                {guardian.email}
                              </p>
                            </div>
                            <span className='px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'>
                              Emergency Access
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </FadeIn>

            {/* Current Status */}
            {settings && (
              <FadeIn duration={0.5} delay={1.2}>
                <Card className='p-6'>
                  <h3 className='text-xl font-semibold mb-4'>Current Status</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                    <div>
                      <Label className='text-muted-foreground'>
                        Shield Status
                      </Label>
                      <p
                        className={`font-medium ${settings.is_shield_enabled ? 'text-green-600' : 'text-gray-600'}`}
                      >
                        {settings.is_shield_enabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>
                        Last Activity Check
                      </Label>
                      <p className='font-medium'>
                        {settings.last_activity_check
                          ? new Date(
                              settings.last_activity_check
                            ).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>
                        Shield State
                      </Label>
                      <p className='font-medium capitalize'>
                        {settings.shield_status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            )}

            {/* Save Button */}
            <FadeIn duration={0.5} delay={1.4}>
              <div className='flex justify-end'>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size='lg'
                  className='bg-primary hover:bg-primary-hover'
                >
                  {isSaving ? (
                    <>
                      <Icon
                        name='loader'
                        className='w-4 h-4 mr-2 animate-spin'
                      />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Icon name='check' className='w-4 h-4 mr-2' />
                      Save Family Shield Settings
                    </>
                  )}
                </Button>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
