/**
 * Family Collaboration Dashboard
 * Main interface for managing family members, guardians, and invitations
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Mail,
  Phone,
  Heart,
  Activity,
  Star,
  Settings,
  Trash2,
  Edit,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { InvitationDialog } from './InvitationDialog';
import {
  collaborationService,
  type FamilyMember,
  type Guardian,
  type CollaborationInvitation,
} from '@/services/collaborationService';

interface CollaborationDashboardProps {
  userId: string;
  className?: string;
}

export function CollaborationDashboard({
  userId,
  className,
}: CollaborationDashboardProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [invitations, setInvitations] = useState<CollaborationInvitation[]>([]);
  const [stats, setStats] = useState({
    totalFamilyMembers: 0,
    activeGuardians: 0,
    pendingInvitations: 0,
    protectionCoverage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        familyData,
        guardiansData,
        invitationsData,
        statsData,
      ] = await Promise.all([
        collaborationService.getFamilyMembers(userId),
        collaborationService.getGuardians(userId),
        collaborationService.getPendingInvitations(userId),
        collaborationService.getCollaborationStats(userId),
      ]);

      setFamilyMembers(familyData);
      setGuardians(guardiansData);
      setInvitations(invitationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      setError(error instanceof Error ? error.message : 'Nepodarilo sa načítať údaje');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleInviteSuccess = () => {
    loadData(); // Refresh data after successful invitation
  };

  const handleRemoveFamilyMember = async (memberId: string) => {
    try {
      await collaborationService.removeFamilyMember(memberId);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nepodarilo sa odstrániť člena');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'active':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'invited':
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionIcons = (guardian: Guardian) => {
    const permissions = [];
    if (guardian.can_access_documents) permissions.push({ icon: Eye, label: 'Dokumenty' });
    if (guardian.can_emergency_activate) permissions.push({ icon: AlertCircle, label: 'Núdzové' });
    if (guardian.can_manage_family) permissions.push({ icon: Users, label: 'Rodina' });
    if (guardian.can_view_finances) permissions.push({ icon: Activity, label: 'Financie' });
    if (guardian.can_make_medical_decisions) permissions.push({ icon: Heart, label: 'Zdravie' });
    return permissions;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/3'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Členovia rodiny</p>
                <p className='text-2xl font-bold'>{stats.totalFamilyMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Aktívni opatrovníci</p>
                <p className='text-2xl font-bold'>{stats.activeGuardians}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-yellow-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Čakajúce pozvánky</p>
                <p className='text-2xl font-bold'>{stats.pendingInvitations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-purple-600' />
                <p className='text-sm text-muted-foreground'>Ochrana</p>
              </div>
              <div className='space-y-1'>
                <p className='text-2xl font-bold'>{stats.protectionCoverage}%</p>
                <Progress value={stats.protectionCoverage} className='h-2' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Rodinná spolupráca</h2>
          <p className='text-muted-foreground'>
            Spravujte členov rodiny a ich oprávnenia
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Obnoviť
          </Button>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className='h-4 w-4 mr-2' />
            Pozvať člena
          </Button>
        </div>
      </div>

      <Tabs defaultValue='family' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='family'>
            Členovia rodiny ({familyMembers.length})
          </TabsTrigger>
          <TabsTrigger value='guardians'>
            Opatrovníci ({guardians.length})
          </TabsTrigger>
          <TabsTrigger value='invitations'>
            Pozvánky ({invitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value='family' className='space-y-4'>
          {familyMembers.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Zatiaľ žiadni členovia</h3>
                <p className='text-muted-foreground mb-4'>
                  Pozrite prvého člena rodiny a začnite budovať váš kruh ochrany
                </p>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Pozvať prvého člena
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                          <Users className='h-5 w-5 text-gray-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>{member.name}</h4>
                          <p className='text-sm text-muted-foreground'>
                            {getRelationshipDisplay(member.relationship)}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>
                            <Edit className='h-4 w-4 mr-2' />
                            Upraviť
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className='h-4 w-4 mr-2' />
                            Oprávnenia
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleRemoveFamilyMember(member.id)}
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            Odstrániť
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>Status:</span>
                        <Badge className={getStatusColor(member.protection_status)}>
                          {member.protection_status === 'protected' && 'Chránený'}
                          {member.protection_status === 'partial' && 'Čiastočne'}
                          {member.protection_status === 'unprotected' && 'Nechránený'}
                          {member.protection_status === 'pending' && 'Čaká'}
                        </Badge>
                      </div>

                      {member.email && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Mail className='h-3 w-3 text-muted-foreground' />
                          <span className='truncate'>{member.email}</span>
                        </div>
                      )}

                      {member.phone && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Phone className='h-3 w-3 text-muted-foreground' />
                          <span>{member.phone}</span>
                        </div>
                      )}

                      {member.is_emergency_contact && (
                        <Badge variant='outline' className='text-xs'>
                          <AlertCircle className='h-3 w-3 mr-1' />
                          Núdzový kontakt
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Guardians Tab */}
        <TabsContent value='guardians' className='space-y-4'>
          {guardians.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Shield className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Zatiaľ žiadni opatrovníci</h3>
                <p className='text-muted-foreground mb-4'>
                  Opatrovníci môžu spravovať vašu ochranu v prípade núdze
                </p>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Pozvať opatrovníka
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {guardians.map((guardian) => {
                const permissions = getPermissionIcons(guardian);
                return (
                  <Card key={guardian.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                            <Shield className='h-6 w-6 text-blue-600' />
                          </div>
                          <div>
                            <h4 className='font-semibold'>
                              {guardian.family_member?.name || 'Neznámy'}
                            </h4>
                            <p className='text-sm text-muted-foreground'>
                              {guardian.family_member ?
                                getRelationshipDisplay(guardian.family_member.relationship) :
                                'Opatrovník'
                              }
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge className={getStatusColor(guardian.status)}>
                                {guardian.status === 'active' && 'Aktívny'}
                                {guardian.status === 'accepted' && 'Prijatý'}
                                {guardian.status === 'invited' && 'Pozvaný'}
                                {guardian.status === 'pending' && 'Čaká'}
                                {guardian.status === 'inactive' && 'Neaktívny'}
                                {guardian.status === 'declined' && 'Odmietol'}
                              </Badge>
                              <div className='flex items-center gap-1'>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < guardian.trust_level
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className='text-xs text-muted-foreground ml-1'>
                                  Priorita: {guardian.emergency_priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>
                              <Settings className='h-4 w-4 mr-2' />
                              Upraviť oprávnenia
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className='h-4 w-4 mr-2' />
                              Poslať správu
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-red-600'>
                              <Trash2 className='h-4 w-4 mr-2' />
                              Odstrániť
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Contact Info */}
                      <div className='space-y-2 mb-4'>
                        {guardian.family_member?.email && (
                          <div className='flex items-center gap-2 text-sm'>
                            <Mail className='h-3 w-3 text-muted-foreground' />
                            <span>{guardian.family_member.email}</span>
                          </div>
                        )}
                        {guardian.family_member?.phone && (
                          <div className='flex items-center gap-2 text-sm'>
                            <Phone className='h-3 w-3 text-muted-foreground' />
                            <span>{guardian.family_member.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Permissions */}
                      <div>
                        <p className='text-sm font-medium mb-2'>Oprávnenia:</p>
                        <div className='flex flex-wrap gap-2'>
                          {permissions.length > 0 ? (
                            permissions.map((permission, index) => {
                              const Icon = permission.icon;
                              return (
                                <Badge key={index} variant='secondary' className='text-xs'>
                                  <Icon className='h-3 w-3 mr-1' />
                                  {permission.label}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              Žiadne špeciálne oprávnenia
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value='invitations' className='space-y-4'>
          {invitations.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <Mail className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Žiadne čakajúce pozvánky</h3>
                <p className='text-muted-foreground'>
                  Všetky pozvánky boli spracované
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {invitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <Mail className='h-5 w-5 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>{invitation.invitee_email}</h4>
                          <p className='text-sm text-muted-foreground'>
                            {getRelationshipDisplay(invitation.relationship)}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                            <Badge className={getStatusColor(invitation.status)}>
                              {invitation.status === 'pending' && 'Čaká'}
                              {invitation.status === 'sent' && 'Odoslaná'}
                              {invitation.status === 'accepted' && 'Prijatá'}
                              {invitation.status === 'declined' && 'Odmietnutá'}
                              {invitation.status === 'expired' && 'Expirovaná'}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {new Date(invitation.created_at).toLocaleDateString('sk-SK')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>
                            <Send className='h-4 w-4 mr-2' />
                            Poslať znovu
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className='h-4 w-4 mr-2' />
                            Zobraziť detaily
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-red-600'>
                            <Trash2 className='h-4 w-4 mr-2' />
                            Zrušiť pozvánku
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {invitation.message && (
                      <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                        <p className='text-sm text-gray-600'>
                          "{invitation.message}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InvitationDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={handleInviteSuccess}
        userId={userId}
      />
    </div>
  );
}