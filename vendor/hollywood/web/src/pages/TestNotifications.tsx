
import _React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon-library';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

interface TestResult {
  emailId?: string;
  message: string;
  success: boolean;
}

export function TestNotifications() {
  const { t } = useTranslation('common/toast-messages');
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress || ''
  );
  const [documentName, setDocumentName] = useState('Test Document.pdf');
  const [daysUntil, setDaysUntil] = useState(7);
  const [testResult, setTestResult] = useState<null | TestResult>(null);

  const sendTestNotification = async () => {
    if (!email) {
      toast.error(t('errors.validationRequired', { field: t('fields.email') }));
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          documentName,
          daysUntil,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message,
          emailId: result.emailId,
        });
        toast.success('Test notification sent successfully!');
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Failed to send test notification',
        });
        toast.error(result.message || t('errors.sendFailed', { action: t('resources.notification') }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.networkError');
      setTestResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testCronJob = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-expirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-cron-secret': 'test-secret', // This will fail, but we can see the endpoint works
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        toast.success('Cron job endpoint is secure (401 as expected)');
      } else if (response.ok) {
        toast.success(`Cron job test: ${result.message}`);
      } else {
        toast.error(`Cron job test failed: ${result.message}`);
      }
    } catch (_error) {
      toast.error('Cron job endpoint test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-2xl mx-auto space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold mb-2'>Notification System Test</h1>
          <p className='text-muted-foreground'>
            Test the LegacyGuard proactive notification system
          </p>
        </div>

        {/* Test Email Notification */}
        <Card className='p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Icon name="mail" className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>Test Email Notification</h2>
              <p className='text-sm text-muted-foreground'>
                Send a test document expiration notification
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter email to test'
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='documentName'>Document Name</Label>
              <Input
                id='documentName'
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                placeholder='Test Document.pdf'
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='daysUntil'>Days Until Expiration</Label>
              <Input
                id='daysUntil'
                type='number'
                value={daysUntil}
                onChange={e => setDaysUntil(Number(e.target.value))}
                min='1'
                max='30'
                className='mt-1'
              />
            </div>

            <Button
              onClick={sendTestNotification}
              disabled={isLoading || !email}
              className='w-full'
            >
              {isLoading ? (
                <>
                  <Icon
                    name="loader"
                    className='w-4 h-4 mr-2 animate-spin'
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Icon name="send" className='w-4 h-4 mr-2' />
                  Send Test Notification
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Test Cron Job */}
        <Card className='p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center'>
              <Icon name="clock" className='w-5 h-5 text-secondary' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>Test Cron Job Security</h2>
              <p className='text-sm text-muted-foreground'>
                Verify that the cron job endpoint is properly secured
              </p>
            </div>
          </div>

          <Button
            onClick={testCronJob}
            disabled={isLoading}
            variant="outline"
            className='w-full'
          >
            {isLoading ? (
              <>
                <Icon
                  name="loader"
                  className='w-4 h-4 mr-2 animate-spin'
                />
                Testing...
              </>
            ) : (
              <>
                <Icon name="shield" className='w-4 h-4 mr-2' />
                Test Cron Security
              </>
            )}
          </Button>
        </Card>

        {/* Test Result */}
        {testResult && (
          <Card
            className={`p-6 ${testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <div className='flex items-center gap-3 mb-4'>
              <Icon
                name={testResult.success ? 'check-circle' : 'alert-circle'}
                className={`w-6 h-6 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}
              />
              <h3
                className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}
              >
                {testResult.success ? 'Success!' : 'Error'}
              </h3>
            </div>
            <p
              className={`${testResult.success ? 'text-green-800' : 'text-red-800'}`}
            >
              {testResult.message}
            </p>
            {testResult.emailId && (
              <p className='text-sm text-green-700 mt-2'>
                Email ID: {testResult.emailId}
              </p>
            )}
          </Card>
        )}

        {/* Configuration Status */}
        <Card className='p-6'>
          <h3 className='font-semibold mb-4 flex items-center gap-2'>
            <Icon name="settings" className='w-5 h-5' />
            Configuration Status
          </h3>

          <div className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span>Supabase URL</span>
              <span
                className={
                  import.meta.env.VITE_SUPABASE_URL
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {import.meta.env.VITE_SUPABASE_URL
                  ? '✓ Configured'
                  : '✗ Missing'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span>App URL</span>
              <span className='text-blue-600'>
                {import.meta.env.VITE_APP_URL || window.location.origin}
              </span>
            </div>
          </div>

          <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>New Features:</strong> The notification system has been
              improved with:
            </p>
            <ul className='text-sm text-blue-700 mt-2 space-y-1'>
              <li>• Smart date range queries (not just exact dates)</li>
              <li>• Prevents duplicate notifications (20-day cooldown)</li>
              <li>• Better error handling for missing user emails</li>
              <li>• Flexible threshold matching (±1 day tolerance)</li>
            </ul>
          </div>

          <div className='mt-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-sm text-green-800'>
              <strong>Database Migration Required:</strong> Run the migration to
              add notification tracking:
            </p>
            <code className='text-sm text-green-700 block mt-2 bg-green-100 p-2 rounded'>
              supabase migration up
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TestNotifications;
