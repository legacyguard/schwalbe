
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type { TimeCapsule, TimeCapsuleStats } from '@/types/timeCapsule';
import type { Guardian } from '@/types/guardian';
import { TimeCapsuleWizard } from '@/components/time-capsule/TimeCapsuleWizard';
import { TimeCapsuleList } from '@/components/time-capsule/TimeCapsuleList';
import { useTranslation } from 'react-i18next';

export default function TimeCapsulePage() {
  const { t } = useTranslation('common/toast-messages');
  const { t: tPages } = useTranslation('common/page-titles');
  usePageTitle(tPages('timeCapsule'));
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();

  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [stats, setStats] = useState<TimeCapsuleStats>({
    total: 0,
    pending: 0,
    delivered: 0,
    scheduled_for_date: 0,
    scheduled_on_death: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // Fetch user's time capsules and guardians
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const supabase = await createSupabaseClient();

      // Fetch time capsules
      const { data: capsulesData, error: capsulesError } = await supabase
        .from('time_capsules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (capsulesError) throw capsulesError;

      // Fetch guardians for recipient options
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (guardiansError) throw guardiansError;

      // Map database results to application types
      const mappedCapsules = (capsulesData || []).map(capsule => ({
        ...capsule,
        delivery_attempts: (capsule as any).delivery_attempts || 0,
        file_type: ((capsule as any).file_type || 'video') as 'audio' | 'video',
        recipient_email: (capsule as any).recipient_email || '',
        recipient_name: (capsule as any).recipient_name || '',
        status: (capsule.is_delivered ? 'DELIVERED' : 'PENDING') as 'CANCELLED' | 'DELIVERED' | 'FAILED' | 'PENDING',
        storage_path: (capsule as any).storage_path || '',
      }));

      const mappedGuardians = (guardiansData || []).map(guardian => ({
        ...guardian,
        can_access_financial_docs: (guardian as any).can_access_financial_docs ?? false,
        can_access_health_docs: (guardian as any).can_access_health_docs ?? false,
        can_trigger_emergency: (guardian as any).can_trigger_emergency ?? false,
        is_child_guardian: (guardian as any).is_child_guardian ?? false,
        is_will_executor: (guardian as any).is_will_executor ?? false,
        emergency_contact_priority: guardian.emergency_contact_priority ?? 1,
      }));

      setTimeCapsules(mappedCapsules as TimeCapsule[]);
      setGuardians(mappedGuardians as Guardian[]);

      // Calculate stats
      const newStats: TimeCapsuleStats = {
        total: mappedCapsules.length,
        pending: mappedCapsules.filter(c => c.status === 'PENDING').length,
        delivered: mappedCapsules.filter(c => c.is_delivered).length,
        scheduled_for_date: mappedCapsules.filter(
          c => c.delivery_condition === 'ON_DATE' && !c.is_delivered
        ).length,
        scheduled_on_death: mappedCapsules.filter(
          c => c.delivery_condition === 'ON_DEATH' && !c.is_delivered
        ).length,
        failed: mappedCapsules.filter(c => c.status === 'FAILED').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('errors.loadFailed', { resource: t('resources.timeCapsules') }));
    } finally {
      setIsLoading(false);
    }
  }, [userId, createSupabaseClient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle successful capsule creation
  const handleCapsuleCreated = (newCapsule: TimeCapsule) => {
    setTimeCapsules(prev => [newCapsule, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1,
      scheduled_for_date:
        newCapsule.delivery_condition === 'ON_DATE'
          ? prev.scheduled_for_date + 1
          : prev.scheduled_for_date,
      scheduled_on_death:
        newCapsule.delivery_condition === 'ON_DEATH'
          ? prev.scheduled_on_death + 1
          : prev.scheduled_on_death,
    }));
    setShowWizard(false);
    toast.success(
      `Time Capsule "${newCapsule.message_title}" has been sealed and scheduled for delivery!`
    );
  };

  // Handle test preview
  const handleTestPreview = async (capsuleId: string) => {
    try {
      const supabase = await createSupabaseClient();

      const { error } = await supabase.functions.invoke(
        'time-capsule-test-preview',
        {
          body: { capsule_id: capsuleId },
        }
      );

      if (error) {
        throw error;
      }

      toast.success('Test preview email sent!', {
        description:
          'Check your email to see how your Time Capsule will look when delivered.',
      });
    } catch (error) {
      console.error('Failed to send test preview:', error);
      toast.error(t('errors.sendFailed', { action: t('resources.testPreview') }), {
        description:
          'Please try again or contact support if the issue persists.',
      });
    }
  };

  // Handle capsule deletion
  const handleDeleteCapsule = async (capsuleId: string) => {
    if (!userId) return;

    try {
      const supabase = await createSupabaseClient();

      const { error } = await supabase
        .from('time_capsules')
        .delete()
        .eq('id', capsuleId)
        .eq('user_id', userId); // Ensure user owns this capsule

      if (error) throw error;

      // Update local state
      setTimeCapsules(prev => prev.filter(c => c.id !== capsuleId));
      fetchData(); // Refresh stats
      toast.success(t('success.deleted', { resource: t('resources.timeCapsule') }));
    } catch (error) {
      console.error('Error deleting capsule:', error);
      toast.error(t('errors.deleteFailed', { resource: 'time capsule' }));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Icon name='loader' className='w-8 h-8 animate-spin text-primary' />
          <span className='ml-3 text-muted-foreground'>
            Loading Time Capsule...
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
          <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
            <FadeIn duration={0.5} delay={0.2}>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center'>
                      <Icon name='heart' className='w-6 h-6 text-purple-600' />
                    </div>
                    <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground'>
                      Time Capsule
                    </h1>
                  </div>
                  <p
                    className='text-lg leading-relaxed max-w-3xl'
                    style={{ color: 'hsl(var(--muted-text))' }}
                  >
                    Create personal video or audio messages that will be
                    delivered to your loved ones at just the right moment.
                    Whether it's a birthday surprise or a final farewell, your
                    words will reach them when they need them most.
                  </p>
                </div>
                <Button
                  onClick={() => setShowWizard(true)}
                  size='lg'
                  className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                >
                  <Icon name='plus' className='w-5 h-5 mr-2' />
                  Create Time Capsule
                </Button>
              </div>
            </FadeIn>
          </div>
        </header>

        {/* Stats Cards */}
        <main className='max-w-7xl mx-auto px-6 lg:px-8 py-12'>
          <FadeIn duration={0.5} delay={0.4}>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Total
                    </p>
                    <p className='text-2xl font-bold'>{stats.total}</p>
                  </div>
                  <Icon
                    name='folder'
                    className='w-5 h-5 text-muted-foreground'
                  />
                </div>
              </Card>

              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Pending
                    </p>
                    <p className='text-2xl font-bold text-orange-600'>
                      {stats.pending}
                    </p>
                  </div>
                  <Icon name='clock' className='w-5 h-5 text-orange-600' />
                </div>
              </Card>

              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Delivered
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {stats.delivered}
                    </p>
                  </div>
                  <Icon
                    name='check-circle'
                    className='w-5 h-5 text-green-600'
                  />
                </div>
              </Card>

              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      By Date
                    </p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {stats.scheduled_for_date}
                    </p>
                  </div>
                  <Icon name='calendar' className='w-5 h-5 text-blue-600' />
                </div>
              </Card>

              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      On Passing
                    </p>
                    <p className='text-2xl font-bold text-purple-600'>
                      {stats.scheduled_on_death}
                    </p>
                  </div>
                  <Icon name='shield' className='w-5 h-5 text-purple-600' />
                </div>
              </Card>

              <Card className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Failed
                    </p>
                    <p className='text-2xl font-bold text-red-600'>
                      {stats.failed}
                    </p>
                  </div>
                  <Icon name='alert-circle' className='w-5 h-5 text-red-600' />
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Time Capsules List or Empty State */}
          {timeCapsules.length === 0 ? (
            <FadeIn duration={0.5} delay={0.6}>
              <Card className='p-12 text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center'>
                  <Icon name='heart' className='w-10 h-10 text-purple-600' />
                </div>
                <h3 className='text-2xl font-bold mb-4'>
                  Your Time Capsule Awaits
                </h3>
                <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
                  Create your first Time Capsule - a personal video or audio
                  message that will be delivered to someone special at exactly
                  the right moment. Whether it's a future birthday surprise or a
                  heartfelt goodbye, your words will be there when they're
                  needed most.
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button
                    onClick={() => setShowWizard(true)}
                    size='lg'
                    className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  >
                    <Icon name='plus' className='w-5 h-5 mr-2' />
                    Create Your First Time Capsule
                  </Button>
                  <Button variant='outline' size='lg'>
                    <Icon name='play' className='w-5 h-5 mr-2' />
                    Watch Demo
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ) : (
            <FadeIn duration={0.5} delay={0.6}>
              <TimeCapsuleList
                timeCapsules={timeCapsules}
                onDelete={handleDeleteCapsule}
                onTestPreview={handleTestPreview}
                onRefresh={fetchData}
              />
            </FadeIn>
          )}
        </main>

        {/* Time Capsule Creation Wizard */}
        {showWizard && (
          <TimeCapsuleWizard
            isOpen={showWizard}
            onClose={() => setShowWizard(false)}
            guardians={guardians}
            onCapsuleCreated={handleCapsuleCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
