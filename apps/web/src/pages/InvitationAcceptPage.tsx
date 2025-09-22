/**
 * Invitation Accept Page
 * Public page for accepting family collaboration invitations
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  FileText,
  CreditCard,
  Activity,
  Mail,
  Clock,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import {
  collaborationService,
  type CollaborationInvitation,
} from '@/services/collaborationService';

export function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<CollaborationInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [status, setStatus] = useState<'loading' | 'found' | 'accepted' | 'declined' | 'error'>('loading');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Neplatný token pozvánky');
        setStatus('error');
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, we would have an API endpoint to get invitation by token
        // For now, we'll simulate getting invitation data
        setIsLoading(false);
        setStatus('found');

        // Mock invitation data - in real app this would come from API
        const mockInvitation: CollaborationInvitation = {
          id: '1',
          inviter_id: 'user-1',
          inviter_name: 'Mária Nováková',
          invitee_email: 'jan.novak@example.com',
          relationship: 'spouse',
          message: 'Ahoj, rád by som ťa pozval do našej rodinnej ochrany. Budeš môcť pomôcť spravovať naše dôležité dokumenty a byť mojím kontaktom v núdzových situáciách.',
          permissions: {
            can_access_documents: true,
            can_emergency_activate: true,
            can_manage_family: true,
            can_view_finances: false,
            can_make_medical_decisions: true,
          },
          invitation_token: token,
          status: 'sent',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        };

        setInvitation(mockInvitation);
      } catch (error) {
        console.error('Error loading invitation:', error);
        setError('Nepodarilo sa načítať pozvánku');
        setStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      await collaborationService.acceptInvitation(token);
      setStatus('accepted');

      // Redirect to login or dashboard after a delay
      setTimeout(() => {
        navigate('/auth/login?message=invitation-accepted');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nepodarilo sa prijať pozvánku');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      await collaborationService.declineInvitation(token, declineReason);
      setStatus('declined');

      // Redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nepodarilo sa odmietnuť pozvánku');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRelationshipDisplay = (relationship: string) => {
    const relationships: Record<string, string> = {
      spouse: 'Manžel/ka',
      child: 'Dieťa',
      parent: 'Rodič',
      sibling: 'Súrodenec',
      guardian: 'Opatrovník',
      friend: 'Priateľ',
      other: 'Iný',
    };
    return relationships[relationship] || relationship;
  };

  const getPermissionInfo = () => {
    if (!invitation) return [];

    const permissions = [];

    if (invitation.permissions.can_access_documents) {
      permissions.push({
        icon: FileText,
        label: 'Prístup k dokumentom',
        description: 'Môžete prezerať a stiahnuť dôležité dokumenty',
        risk: 'medium',
      });
    }

    if (invitation.permissions.can_emergency_activate) {
      permissions.push({
        icon: AlertCircle,
        label: 'Núdzová aktivácia',
        description: 'Môžete aktivovať núdzové protokoly',
        risk: 'high',
      });
    }

    if (invitation.permissions.can_manage_family) {
      permissions.push({
        icon: Users,
        label: 'Správa rodiny',
        description: 'Môžete pridávať a upravovať údaje členov rodiny',
        risk: 'medium',
      });
    }

    if (invitation.permissions.can_view_finances) {
      permissions.push({
        icon: CreditCard,
        label: 'Finančné údaje',
        description: 'Môžete prezerať finančné dokumenty a informácie',
        risk: 'high',
      });
    }

    if (invitation.permissions.can_make_medical_decisions) {
      permissions.push({
        icon: Activity,
        label: 'Zdravotné rozhodnutia',
        description: 'Môžete robiť rozhodnutia o zdravotnej starostlivosti',
        risk: 'high',
      });
    }

    return permissions;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Načítavam pozvánku...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>Pozvánka prijatá!</h2>
            <p className='text-muted-foreground mb-4'>
              Úspešne ste sa pripojili do rodinnej ochrany používateľa {invitation?.inviter_name}.
            </p>
            <p className='text-sm text-muted-foreground'>
              Presmerováváme vás na prihlásenie...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='h-8 w-8 text-gray-600' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>Pozvánka odmietnutá</h2>
            <p className='text-muted-foreground mb-4'>
              Pozvánka od používateľa {invitation?.inviter_name} bola odmietnutá.
            </p>
            <p className='text-sm text-muted-foreground'>
              Presmerováváme vás späť...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error' || !invitation) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='h-8 w-8 text-red-600' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>Pozvánka nenájdená</h2>
            <p className='text-muted-foreground mb-4'>
              {error || 'Pozvánka nebola nájdená alebo už expirovala.'}
            </p>
            <Button onClick={() => navigate('/')}>
              Späť na hlavnú stránku
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const permissions = getPermissionInfo();
  const isExpired = new Date(invitation.expires_at) < new Date();

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-2xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Users className='h-10 w-10 text-blue-600' />
          </div>
          <h1 className='text-3xl font-bold'>Pozvánka do rodinnej ochrany</h1>
          <p className='text-muted-foreground mt-2'>
            Boli ste pozvaní pripojiť sa k rodinnému kruhu ochrany
          </p>
        </div>

        {/* Expiration Warning */}
        {isExpired && (
          <Alert variant='destructive'>
            <Clock className='h-4 w-4' />
            <AlertDescription>
              Táto pozvánka expirovala. Požiadajte o novú pozvánku.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Invitation Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Heart className='h-5 w-5 text-red-500' />
              Pozvánka od {invitation.inviter_name}
            </CardTitle>
            <CardDescription>
              Pozícia: {getRelationshipDisplay(invitation.relationship)}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span>Pre: {invitation.invitee_email}</span>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span>
                Platná do: {new Date(invitation.expires_at).toLocaleDateString('sk-SK')}
              </span>
            </div>

            {invitation.message && (
              <>
                <Separator />
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium mb-2'>Osobná správa:</h4>
                  <p className='text-sm text-gray-700'>"{invitation.message}"</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-600' />
              Oprávnenia a prístup
            </CardTitle>
            <CardDescription>
              Tieto oprávnenia budete mať po prijatí pozvánky
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {permissions.length > 0 ? (
              permissions.map((permission, index) => {
                const Icon = permission.icon;
                return (
                  <div key={index} className='flex items-start gap-3 p-3 border rounded-lg'>
                    <div className={`p-2 rounded-full ${
                      permission.risk === 'high' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        permission.risk === 'high' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium text-sm'>{permission.label}</h4>
                        {permission.risk === 'high' && (
                          <Badge variant='destructive' className='text-xs'>
                            Vysoké riziko
                          </Badge>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {permission.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='text-sm text-muted-foreground text-center py-4'>
                Žiadne špeciálne oprávnenia nie sú priradené
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!isExpired && !showDeclineForm && (
          <div className='flex gap-4'>
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className='flex-1 bg-green-600 hover:bg-green-700'
            >
              {isProcessing ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Spracováva sa...
                </>
              ) : (
                <>
                  <UserCheck className='h-4 w-4 mr-2' />
                  Prijať pozvánku
                </>
              )}
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowDeclineForm(true)}
              disabled={isProcessing}
              className='flex-1'
            >
              <UserX className='h-4 w-4 mr-2' />
              Odmietnuť
            </Button>
          </div>
        )}

        {/* Decline Form */}
        {showDeclineForm && (
          <Card>
            <CardHeader>
              <CardTitle className='text-red-600'>Odmietnutie pozvánky</CardTitle>
              <CardDescription>
                Môžete uviesť dôvod odmietnutia (voliteľné)
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Textarea
                placeholder='Dôvod odmietnutia (voliteľný)...'
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className='resize-none'
              />
              <div className='flex gap-4'>
                <Button
                  variant='destructive'
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className='flex-1'
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Odmietam...
                    </>
                  ) : (
                    <>
                      <UserX className='h-4 w-4 mr-2' />
                      Potvrdiť odmietnutie
                    </>
                  )}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowDeclineForm(false)}
                  disabled={isProcessing}
                >
                  Späť
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className='text-center text-sm text-muted-foreground'>
          <p>
            Táto pozvánka je súčasťou systému rodinnej ochrany.
            <br />
            Všetky údaje sú šifrované a zabezpečené.
          </p>
        </div>
      </div>
    </div>
  );
}