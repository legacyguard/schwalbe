
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface FamilyShieldAccessData {
  activation_date: string;
  documents: Array<{
    category: string;
    created_at: string;
    id: string;
    title: string;
    type: string;
  }>;
  emergency_contacts: Array<{
    can_help_with: string[];
    email: string;
    name: string;
    phone?: string;
    relationship: string;
  }>;
  expires_at: string;
  guardian_name: string;
  guardian_permissions: {
    can_access_financial_docs: boolean;
    can_access_health_docs: boolean;
    is_child_guardian: boolean;
    is_will_executor: boolean;
  };
  survivor_manual: {
    entries_count: number;
    generated_at: string;
    html_content: string;
  };
  user_name: string;
}

export default function FamilyShieldAccessPage() {
  const { t } = useTranslation('ui/emergency-access');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const createSupabaseClient = useSupabaseWithClerk();

  const [accessData, setAccessData] = useState<FamilyShieldAccessData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const verifyToken = React.useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const supabase = await createSupabaseClient();

      // In a real implementation, this would call a secure serverless function
      // that validates the token and returns the appropriate data based on guardian permissions

      // For now, we'll simulate the response
      // console.log('Verifying emergency access token:', token);

      // Call emergency access verification function
      const { data, error } = await supabase.functions.invoke(
        'verify-emergency-access',
        {
          body: { token, verification_code: verificationCode },
        }
      );

      if (error) {
        throw new Error(error.message || t('errors.verificationFailed'));
      }

      if (!data?.data) {
        throw new Error(t('errors.noAccessData'));
      }

      setAccessData(data.data);
      toast.success(
        `Welcome, ${data.data.guardian_name}. Family Shield access granted.`
      );

      // Fallback to mock data if function call fails (development only)
      if (!data?.data) {
        const mockData: FamilyShieldAccessData = {
          user_name: t('mockData.userName'),
          guardian_name: t('mockData.guardianName'),
          guardian_permissions: {
            can_access_health_docs: true,
            can_access_financial_docs: true,
            is_child_guardian: false,
            is_will_executor: true,
          },
          activation_date: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          survivor_manual: {
            html_content:
              "<h1>Family Survivor's Manual</h1><p>This is a sample manual...</p>",
            entries_count: 8,
            generated_at: new Date().toISOString(),
          },
          documents: [
            {
              id: '1',
              title: t('mockData.documentTitle1'),
              type: 'pdf',
              category: 'legal',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              title: t('mockData.documentTitle2'),
              type: 'pdf',
              category: 'financial',
              created_at: new Date().toISOString(),
            },
          ],
          emergency_contacts: [
            {
              name: t('mockData.doctorName'),
              relationship: t('mockData.doctorRelationship'),
              email: 'dr.johnson@clinic.com',
              phone: '+1 (555) 123-4567',
              can_help_with: t('mockData.doctorHelp', { returnObjects: true }),
            },
            {
              name: t('mockData.advisorName'),
              relationship: t('mockData.advisorRelationship'),
              email: 'mchen@finance.com',
              phone: '+1 (555) 987-6543',
              can_help_with: t('mockData.advisorHelp', { returnObjects: true }),
            },
          ],
        };

        await new Promise(resolve => setTimeout(resolve, 1500));
        setAccessData(mockData);
        toast.success(
          `Welcome, ${mockData.guardian_name}. Family Shield access granted.`
        );
      }
    } catch (err: any) {
      console.error('Error verifying token:', err);
      setError(
        'Failed to verify access token. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, verificationCode, createSupabaseClient]);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('No access token provided');
      setIsLoading(false);
    }
  }, [token, verifyToken]);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (verificationCode.length >= 4) {
      setNeedsVerification(false);
      await verifyToken();
    } else {
      toast.error('Please enter a valid verification code');
    }

    setIsVerifying(false);
  };

  const downloadSurvivorManual = () => {
    if (!accessData?.survivor_manual.html_content) return;

    const blob = new Blob([accessData.survivor_manual.html_content], {
      type: 'text/html',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accessData.user_name.replace(/\s+/g, '_')}_Survivor_Manual.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Survivor manual downloaded successfully');
  };

  const handleDocumentDownload = async (
    documentId: string,
    documentTitle: string
  ) => {
    if (!token || !accessData) return;

    try {
      const supabase = await createSupabaseClient();

      const { data, error } = await supabase.functions.invoke(
        'download-emergency-document',
        {
          body: {
            token,
            document_id: documentId,
            verification_code: verificationCode,
          },
        }
      );

      if (error) {
        throw new Error(error.message || 'Document access failed');
      }

      if (!data?.data?.download_url) {
        throw new Error('No download URL provided');
      }

      // Open download URL in new tab
      window.open(data.data.download_url, '_blank');

      toast.success(`Accessing ${documentTitle}...`);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      toast.error(`Failed to access ${documentTitle}. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <Card className='p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <Icon
              name='loader'
              className='w-8 h-8 animate-spin text-primary mx-auto mb-4'
            />
            <h2 className='text-xl font-semibold mb-2'>
              Verifying Family Shield Access
            </h2>
            <p className='text-muted-foreground'>
              Please wait while we securely verify your access token...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center'>
        <Card className='p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <Icon
              name='alert-triangle'
              className='w-12 h-12 text-red-500 mx-auto mb-4'
            />
            <h2 className='text-xl font-semibold text-red-800 mb-4'>
              Access Denied
            </h2>
            <p className='text-red-700 mb-6'>{error}</p>
            <Button onClick={() => navigate('/')} variant={'outline'}>
              <Icon name='home' className='w-4 h-4 mr-2' />
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center'>
        <Card className='p-8 max-w-md w-full mx-4'>
          <form onSubmit={handleVerificationSubmit}>
            <div className='text-center mb-6'>
              <Icon
                name='shield-check'
                className='w-12 h-12 text-amber-600 mx-auto mb-4'
              />
              <h2 className='text-xl font-semibold mb-2'>
                Additional Verification Required
              </h2>
              <p className='text-muted-foreground'>
                Please enter the verification code sent to your registered
                email.
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='verification_code'>Verification Code</Label>
                <Input
                  id='verification_code'
                  type='text'
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  placeholder='Enter 6-digit code'
                  required
                  className='text-center text-lg tracking-wider'
                />
              </div>

              <Button type='submit' disabled={isVerifying} className='w-full'>
                {isVerifying ? (
                  <>
                    <Icon name='loader' className='w-4 h-4 mr-2 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Icon name={'check'} className='w-4 h-4 mr-2' />
                    Verify Access
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (!accessData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <Card className='p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <Icon
              name={'alert-circle'}
              className='w-12 h-12 text-gray-500 mx-auto mb-4'
            />
            <h2 className='text-xl font-semibold mb-2'>No Data Available</h2>
            <p className='text-muted-foreground'>
              Unable to load emergency access data. Please try again.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50'>
      {/* Header */}
      <header className='bg-white border-b shadow-sm'>
        <div className='max-w-6xl mx-auto px-6 py-6'>
          <FadeIn duration={0.5} delay={0.2}>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                    <Icon name='shield-check' className='w-6 h-6 text-white' />
                  </div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Family Shield - Guardian Access
                  </h1>
                </div>
                <p className='text-gray-600'>
                  Authorized access for{' '}
                  <strong>{accessData.guardian_name}</strong> to{' '}
                  {accessData.user_name}'s emergency information
                </p>
              </div>
              <Badge variant={'destructive'} className='text-sm'>
                Family Shield Active
              </Badge>
            </div>
          </FadeIn>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-8'>
        <div className='space-y-8'>
          {/* Access Information */}
          <FadeIn duration={0.5} delay={0.4}>
            <Alert>
              <Icon name={'info'} className='h-4 w-4' />
              <AlertDescription>
                This emergency access was activated on{' '}
                {new Date(accessData.activation_date).toLocaleDateString()}
                and will expire on{' '}
                {new Date(accessData.expires_at).toLocaleDateString()}. All
                access is logged for security purposes.
              </AlertDescription>
            </Alert>
          </FadeIn>

          {/* Your Permissions */}
          <FadeIn duration={0.5} delay={0.6}>
            <Card className='p-6'>
              <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name={'key'} className='w-5 h-5 text-primary' />
                Your Access Permissions
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {accessData.guardian_permissions.can_access_health_docs && (
                  <div className='flex items-center gap-2 text-green-700'>
                    <Icon name={'heart'} className='w-4 h-4' />
                    <span className='text-sm'>Health Information</span>
                  </div>
                )}
                {accessData.guardian_permissions.can_access_financial_docs && (
                  <div className='flex items-center gap-2 text-blue-700'>
                    <Icon name={'credit-card'} className='w-4 h-4' />
                    <span className='text-sm'>Financial Information</span>
                  </div>
                )}
                {accessData.guardian_permissions.is_child_guardian && (
                  <div className='flex items-center gap-2 text-purple-700'>
                    <Icon name={'user'} className='w-4 h-4' />
                    <span className='text-sm'>Child Guardian</span>
                  </div>
                )}
                {accessData.guardian_permissions.is_will_executor && (
                  <div className='flex items-center gap-2 text-amber-700'>
                    <Icon name={'file-text'} className='w-4 h-4' />
                    <span className='text-sm'>Will Executor</span>
                  </div>
                )}
              </div>
            </Card>
          </FadeIn>

          {/* Survivor Manual */}
          <FadeIn duration={0.5} delay={0.8}>
            <Card className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold flex items-center gap-2'>
                  <Icon name={'file-text'} className='w-5 h-5 text-primary' />
                  Family Survivor's Manual
                </h3>
                <Badge variant={'secondary'}>
                  {accessData.survivor_manual.entries_count} entries
                </Badge>
              </div>
              <p className='text-muted-foreground mb-4'>
                This comprehensive manual contains step-by-step instructions
                created by {accessData.user_name}
                to guide the family through various situations. Generated on{' '}
                {new Date(
                  accessData.survivor_manual.generated_at
                ).toLocaleDateString()}
                .
              </p>
              <div className='flex gap-3'>
                <Button
                  onClick={downloadSurvivorManual}
                  className='bg-primary hover:bg-primary-hover'
                >
                  <Icon name={'download'} className='w-4 h-4 mr-2' />
                  Download Complete Manual
                </Button>
                <Button
                  variant={'outline'}
                  onClick={() => {
                    // Open manual in new tab for viewing
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(
                        accessData.survivor_manual.html_content
                      );
                      newWindow.document.close();
                    }
                  }}
                >
                  <Icon name={'external-link'} className='w-4 h-4 mr-2' />
                  View Online
                </Button>
              </div>
            </Card>
          </FadeIn>

          {/* Emergency Contacts */}
          <FadeIn duration={0.5} delay={1.0}>
            <Card className='p-6'>
              <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name={'phone'} className='w-5 h-5 text-primary' />
                Important Contacts
              </h3>
              <div className='grid gap-4'>
                {accessData.emergency_contacts.map((contact, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h4 className='font-semibold'>{contact.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {contact.relationship}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        {contact.phone && (
                          <Button size='sm' variant='outline' asChild>
                            <a href={`tel:${contact.phone}`}>
                              <Icon name={'phone'} className='w-4 h-4 mr-1' />
                              {t('emergencyContacts.callButton')}
                            </a>
                          </Button>
                        )}
                        <Button size='sm' variant='outline' asChild>
                          <a href={`mailto:${contact.email}`}>
                            <Icon name={'mail'} className='w-4 h-4 mr-1' />
                            {t('emergencyContacts.emailButton')}
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      <p>Email: {contact.email}</p>
                      {contact.phone && <p>Phone: {contact.phone}</p>}
                      <p className='mt-1'>
                        <strong>Can help with:</strong>{' '}
                        {contact.can_help_with.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>

          {/* Available Documents */}
          <FadeIn duration={0.5} delay={1.2}>
            <Card className='p-6'>
              <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                <Icon name={'file-text'} className='w-5 h-5 text-primary' />
                Available Documents
              </h3>
              {accessData.documents.length > 0 ? (
                <div className='space-y-3'>
                  {accessData.documents.map(doc => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <Icon
                          name={'file-text'}
                          className='w-5 h-5 text-muted-foreground'
                        />
                        <div>
                          <p className='font-medium'>{doc.title}</p>
                          <p className='text-sm text-muted-foreground'>
                            {doc.category} •{' '}
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        variant={'outline'}
                        onClick={() =>
                          handleDocumentDownload(doc.id, doc.title)
                        }
                      >
                        <Icon name={'download'} className='w-4 h-4 mr-1' />
                        Access
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>
                  No documents are available for your access level.
                </p>
              )}
            </Card>
          </FadeIn>

          {/* Support Information */}
          <FadeIn duration={0.5} delay={1.4}>
            <Card className='p-6 bg-blue-50 border-blue-200'>
              <div className='flex items-start gap-3'>
                <Icon
                  name={'heart'}
                  className='w-6 h-6 text-blue-600 flex-shrink-0 mt-1'
                />
                <div>
                  <h4 className='font-semibold text-blue-800 mb-2'>
                    You're Not Alone
                  </h4>
                  <p className='text-blue-700 mb-3'>
                    This information was carefully prepared by{' '}
                    {accessData.user_name} to support you during this difficult
                    time. Remember to take things one step at a time and don't
                    hesitate to reach out for help.
                  </p>
                  <p className='text-sm text-blue-600'>
                    If you need technical support with this system, please
                    contact LegacyGuard support at support@legacyguard.com
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
