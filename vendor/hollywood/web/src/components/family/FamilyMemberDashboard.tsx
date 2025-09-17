
import _React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MoreVertical,
  Phone,
  Shield,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type FamilyMember,
  type FamilyProtectionStatus,
  type FamilyStats,
  RELATIONSHIP_LABELS,
} from '@/types/family';
import { familyService } from '@/services/familyService';
import {
  adaptDbFamilyMemberToApp,
  adaptDbFamilyStatsToApp,
} from '@/lib/type-adapters';
import { FamilyInvitationFlow } from './FamilyInvitationFlow';
import { useTranslation } from 'react-i18next';

interface FamilyMemberDashboardProps {
  userId: string;
}

interface MemberAction {
  member: FamilyMember;
  type: 'edit' | 'remove' | 'resend_invitation' | 'view_activity';
}

export function FamilyMemberDashboard({ userId }: FamilyMemberDashboardProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [protectionStatus, setProtectionStatus] =
    useState<FamilyProtectionStatus | null>(null);
  const [_stats, setStats] = useState<FamilyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteFlow, setShowInviteFlow] = useState(false);
  const [_selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [actionInProgress, setActionInProgress] = useState<null | string>(null);
  const [filter, setFilter] = useState<
    'active' | 'all' | 'emergency' | 'pending'
  >('all');
  const { t } = useTranslation('ui/family-member-dashboard');

  const loadFamilyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [membersData, protectionData, statsData] = await Promise.all([
        familyService.getFamilyMembers(userId),
        familyService.getFamilyProtectionStatus(userId),
        familyService.getFamilyStats(userId),
      ]);

      setMembers(membersData.map(adaptDbFamilyMemberToApp));
      setProtectionStatus(protectionData);
      setStats(adaptDbFamilyStatsToApp(statsData));
    } catch (error) {
      console.error('Failed to load family data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFamilyData();
  }, [userId, loadFamilyData]);

  const handleMemberAction = async (action: MemberAction) => {
    setActionInProgress(action.member.id);

    try {
      switch (action.type) {
        case 'remove':
          await familyService.removeFamilyMember(userId, action.member.id);
          break;
        case 'resend_invitation':
          if (action.member.status === 'invited') {
            await familyService.sendInvitation(userId, {
              email: action.member.email,
              name: action.member.name,
              role: action.member.role || 'viewer',
              relationship: (action.member.relationship || 'other') as any,
              message: 'Resending invitation to join your family legacy',
            });
          }
          break;
        case 'edit':
          setSelectedMember(action.member);
          break;
        case 'view_activity':
          // TODO: Implement activity view
          break;
      }

      if (action.type !== 'edit' && action.type !== 'view_activity') {
        await loadFamilyData();
      }
    } catch (error) {
      console.error(`Failed to ${action.type} member:`, error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleInvitationSent = (_invitation: unknown) => {
    setShowInviteFlow(false);
    loadFamilyData();
  };

  const getStatusColor = (status: FamilyMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'invited':
        return 'bg-yellow-500';
      case 'pending_verification':
        return 'bg-blue-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: FamilyMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'co_owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'emergency_contact':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredMembers = members.filter(member => {
    switch (filter) {
      case 'active':
        return member.status === 'active';
      case 'pending':
        return (
          member.status === 'invited' ||
          member.status === 'pending_verification'
        );
      case 'emergency':
        return member.role === 'emergency_contact';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Family Protection Overview */}
      {protectionStatus && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('protectionOverview.totalMembers')}
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {protectionStatus.totalMembers}
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('protectionOverview.activeText', { count: protectionStatus.activeMembers })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('protectionOverview.protectionLevel')}
              </CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {protectionStatus.protectionLevel}%
              </div>
              <Progress
                value={protectionStatus.protectionLevel}
                className='mt-2'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('protectionOverview.documentsShared')}
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {protectionStatus.documentsShared}
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('protectionOverview.documentsSharedText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('protectionOverview.emergencyReady')}
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-center'>
                {protectionStatus.emergencyContactsSet ? (
                  <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
                ) : (
                  <AlertTriangle className='h-5 w-5 text-yellow-500 mr-2' />
                )}
                <span className='text-sm font-medium'>
                  {t(`protectionOverview.emergencyReady_${protectionStatus.emergencyContactsSet}`)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions & Insights */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5 text-yellow-500' />
              {t('strengthsCard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {protectionStatus?.strengths.map((strength, index) => (
                <div key={index} className='flex items-center gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  {strength}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-blue-500' />
              {t('recommendationsCard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {protectionStatus?.recommendations.map(
                (recommendation, index) => (
                  <div key={index} className='text-sm text-muted-foreground'>
                    • {recommendation}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Section */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>{t('membersSection.title')}</CardTitle>
              <CardDescription>
                {t('membersSection.description')}
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteFlow(true)} className='gap-2'>
              <UserPlus className='h-4 w-4' />
              {t('membersSection.inviteButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className='flex gap-2 mb-6'>
            {[
              { key: 'all', label: t('filters.all'), count: members.length },
              {
                key: 'active',
                label: t('filters.active'),
                count: members.filter(m => m.status === 'active').length,
              },
              {
                key: 'pending',
                label: t('filters.pending'),
                count: members.filter(
                  m =>
                    m.status === 'invited' ||
                    m.status === 'pending_verification'
                ).length,
              },
              {
                key: 'emergency',
                label: t('filters.emergency'),
                count: members.filter(m => m.role === 'emergency_contact')
                  .length,
              },
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter(key as typeof filter)}
                className='gap-2'
              >
                {label}
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Members List */}
          <div className='space-y-4'>
            <AnimatePresence mode='popLayout'>
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='hover:shadow-md transition-shadow'>
                    <CardContent className='p-6'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                          <div className='relative'>
                            <Avatar className='h-12 w-12'>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                            />
                          </div>

                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <h3 className='font-semibold'>{member.name}</h3>
                              <Badge
                                className={getRoleColor(member.role)}
                                variant='outline'
                              >
                                {member.role.replace('_', ' ')}
                              </Badge>
                              {member.emergencyPriority && (
                                <Badge
                                  variant='secondary'
                                  className='bg-red-50 text-red-700'
                                >
                                  Priority #{member.emergencyPriority}
                                </Badge>
                              )}
                            </div>

                            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                              <span className='flex items-center gap-1'>
                                <Mail className='h-3 w-3' />
                                {member.email}
                              </span>
                              <span>
                                {RELATIONSHIP_LABELS[member.relationship]}
                              </span>
                              {member.phone && (
                                <span className='flex items-center gap-1'>
                                  <Phone className='h-3 w-3' />
                                  {member.phone}
                                </span>
                              )}
                            </div>

                            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                              <span className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                Invited{' '}
                                {new Date(
                                  member.invitedAt
                                ).toLocaleDateString()}
                              </span>
                              {member.lastActiveAt && (
                                <span>
                                  Last active{' '}
                                  {new Date(
                                    member.lastActiveAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          {/* Permission Summary */}
                          <div className='hidden md:flex items-center gap-1 mr-4'>
                            {member.permissions.canViewDocuments && (
                              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                <FileText className='h-3 w-3' />
                                View
                              </div>
                            )}
                            {member.permissions.canEditDocuments && (
                              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                <span>Edit</span>
                              </div>
                            )}
                            {member.permissions.canAccessEmergencyInfo && (
                              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                <Shield className='h-3 w-3' />
                                Emergency
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                disabled={actionInProgress === member.id}
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMemberAction({ type: 'edit', member })
                                }
                              >
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMemberAction({
                                    type: 'view_activity',
                                    member,
                                  })
                                }
                              >
                                View Activity
                              </DropdownMenuItem>
                              {member.status === 'invited' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMemberAction({
                                      type: 'resend_invitation',
                                      member,
                                    })
                                  }
                                >
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMemberAction({ type: 'remove', member })
                                }
                                className='text-red-600 focus:text-red-600'
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredMembers.length === 0 && (
              <div className='text-center py-12'>
                <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>
                  {filter === 'all'
                    ? 'No family members yet'
                    : `No ${filter} members`}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {filter === 'all'
                    ? 'Start building your family circle by inviting your loved ones.'
                    : `No family members match the ${filter} filter.`}
                </p>
                {filter === 'all' && (
                  <Button
                    onClick={() => setShowInviteFlow(true)}
                    className='gap-2'
                  >
                    <UserPlus className='h-4 w-4' />
                    Invite Your First Family Member
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Invitation Flow Dialog */}
      <Dialog open={showInviteFlow} onOpenChange={setShowInviteFlow}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
          </DialogHeader>
          <FamilyInvitationFlow
            userId={userId}
            onComplete={handleInvitationSent}
            onCancel={() => setShowInviteFlow(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
