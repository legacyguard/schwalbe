
/**
 * Family Management Component
 * Phase 8: Social Collaboration & Family Features
 *
 * Comprehensive family group management interface with member
 * invitations, roles, permissions, and collaboration features.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  Edit,
  Eye,
  Mail,
  MoreVertical,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  type CollaborationActivity,
  collaborationService,
  type FamilyGroup,
  type FamilyRole,
} from '@/lib/social/collaborationService';
import type { FamilyMember as FamilyMemberType } from '@/types/family';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FamilyManagementProps {
  className?: string;
}

export default function FamilyManagement({ className }: FamilyManagementProps) {
  const { t } = useTranslation('ui/family-management');
  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyGroup | null>(
    null
  );
  const [members, setMembers] = useState<FamilyMemberType[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMemberType | null>(
    null
  );

  const { toast } = useToast();

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMemberTypes();
      loadFamilyActivities();
    }
  }, [selectedFamily]);

  const loadFamilies = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        const familyGroups = await collaborationService.getUserFamilies(
          user.data.user.id
        );
        setFamilies(familyGroups);
        if (familyGroups.length > 0 && !selectedFamily) {
          setSelectedFamily(familyGroups[0] || null);
        }
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: t('messages.loadFamiliesError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFamilyMemberTypes = async () => {
    if (!selectedFamily) return;

    try {
      const familyMembers = await collaborationService.getFamilyMembers(
        selectedFamily.id
      );
      setMembers(familyMembers);
    } catch (_error) {
      toast({
        title: 'Error',
        description: t('messages.loadMembersError'),
        variant: 'destructive',
      });
    }
  };

  const loadFamilyActivities = async () => {
    if (!selectedFamily) return;

    try {
      const familyActivities = await collaborationService.getFamilyActivity(
        selectedFamily.id
      );
      setActivities(familyActivities);
    } catch (_error) {
      toast({
        title: 'Error',
        description: t('messages.loadActivitiesError'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Family Management
          </h2>
          <p className='text-muted-foreground'>
            Manage your family groups and collaboration settings
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setShowCreateFamily(true)}>
            <Users className='h-4 w-4 mr-2' />
            New Family
          </Button>
          {selectedFamily && (
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className='h-4 w-4 mr-2' />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {families.length === 0 ? (
        <CreateFirstFamily onCreated={loadFamilies} />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Family Selector */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Your Families</h3>
            <div className='space-y-2'>
              {families.map(family => (
                <Card
                  key={family.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-accent',
                    selectedFamily?.id === family.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedFamily(family)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={family.avatar_url} />
                        <AvatarFallback>
                          {family.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{family.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {family.member_count} member
                          {family.member_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            {selectedFamily ? (
              <Tabs defaultValue='members' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='members'>Members</TabsTrigger>
                  <TabsTrigger value='activity'>Activity</TabsTrigger>
                  <TabsTrigger value='settings'>Settings</TabsTrigger>
                </TabsList>

                <TabsContent value='members' className='space-y-6'>
                  <FamilyMemberTypesTab
                    family={selectedFamily}
                    members={members}
                    onMemberUpdate={loadFamilyMemberTypes}
                    onRemoveMember={setMemberToRemove}
                  />
                </TabsContent>

                <TabsContent value='activity' className='space-y-6'>
                  <FamilyActivityTab activities={activities} />
                </TabsContent>

                <TabsContent value='settings' className='space-y-6'>
                  <FamilySettingsTab
                    family={selectedFamily}
                    onSettingsUpdate={loadFamilies}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className='flex items-center justify-center min-h-[400px]'>
                  <div className='text-center'>
                    <Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                    <p className='text-lg font-medium'>
                      Select a family to manage
                    </p>
                    <p className='text-muted-foreground'>
                      Choose a family group from the sidebar
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        family={selectedFamily}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInviteSent={loadFamilyMemberTypes}
      />

      {/* Create Family Dialog */}
      <CreateFamilyDialog
        open={showCreateFamily}
        onOpenChange={setShowCreateFamily}
        onFamilyCreated={loadFamilies}
      />

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the
              family? This will revoke their access to all shared documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (memberToRemove) {
                  try {
                    await collaborationService.removeFamilyMember(
                      memberToRemove.id
                    );
                    await loadFamilyMemberTypes();
                    toast({
                      title: 'Success',
                      description: t('messages.memberRemovedSuccess'),
                    });
                  } catch (_error) {
                    toast({
                      title: 'Error',
                      description: t('messages.memberRemoveError'),
                      variant: 'destructive',
                    });
                  }
                  setMemberToRemove(null);
                }
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Sub-components

function CreateFirstFamily({ onCreated }: { onCreated: () => void }) {
  return (
    <Card>
      <CardContent className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <Users className='h-16 w-16 mx-auto text-muted-foreground' />
          <div>
            <h3 className='text-xl font-semibold'>
              Create Your First Family Group
            </h3>
            <p className='text-muted-foreground mt-2'>
              Start collaborating by creating a family group to share documents
              and manage access together.
            </p>
          </div>
          <CreateFamilyDialog
            trigger={
              <Button size='lg'>
                <Users className='h-4 w-4 mr-2' />
                Create Family Group
              </Button>
            }
            onFamilyCreated={onCreated}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FamilyMemberTypesTab({
  family,
  members,
  onMemberUpdate: _onMemberUpdate,
  onRemoveMember,
}: {
  family: FamilyGroup;
  members: FamilyMemberType[];
  onMemberUpdate: () => void;
  onRemoveMember: (member: FamilyMemberType) => void;
}) {
  const getRoleIcon = (role: FamilyRole) => {
    switch (role) {
      case 'owner':
        return <Crown className='h-4 w-4 text-yellow-500' />;
      case 'co_owner':
        return <Shield className='h-4 w-4 text-blue-500' />;
      case 'emergency_contact':
        return <Shield className='h-4 w-4 text-green-500' />;
      default:
        return <Users className='h-4 w-4 text-gray-500' />;
    }
  };

  const getRoleBadgeVariant = (
    role: FamilyRole
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'co_owner':
        return 'secondary';
      case 'emergency_contact':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'invited':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'suspended':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      default:
        return <Activity className='h-4 w-4 text-gray-500' />;
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Members</CardTitle>
        <CardDescription>
          Manage roles and permissions for {family.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {members.map(member => (
            <div
              key={member.id}
              className='flex items-center justify-between p-4 border rounded-lg'
            >
              <div className='flex items-center gap-4'>
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>{member.name}</p>
                    {getRoleIcon(member.role)}
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {member.email}
                  </p>
                  {member.relationship && (
                    <p className='text-xs text-muted-foreground'>
                      {member.relationship}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {getStatusIcon(member.status)}
                <span className='text-sm text-muted-foreground capitalize'>
                  {member.status}
                </span>

                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className='h-4 w-4 mr-2' />
                        View Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onRemoveMember(member)}
                        className='text-destructive'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FamilyActivityTab({
  activities,
}: {
  activities: CollaborationActivity[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Family collaboration and document sharing activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {activities.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <Activity className='h-8 w-8 mx-auto mb-2' />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map(activity => (
              <div
                key={activity.id}
                className='flex items-start gap-3 pb-3 border-b last:border-0'
              >
                <div className='p-2 bg-muted rounded-full'>
                  <Activity className='h-3 w-3' />
                </div>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm'>{activity.message}</p>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FamilySettingsTab({
  family,
  onSettingsUpdate: _onSettingsUpdate,
}: {
  family: FamilyGroup;
  onSettingsUpdate: () => void;
}) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>
            Basic information about your family group
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='family-name'>Family Name</Label>
              <Input id='family-name' defaultValue={family.name} />
            </div>
            <div>
              <Label htmlFor='invite-code'>Invite Code</Label>
              <div className='flex gap-2'>
                <Input
                  id='invite-code'
                  value={family.invite_code || ''}
                  readOnly
                />
                <Button variant='outline' size='sm'>
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              defaultValue={family.description || ''}
              placeholder='Describe your family group...'
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            Control how your family group operates
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Require approval for new members</Label>
              <p className='text-sm text-muted-foreground'>
                New invitations require admin approval
              </p>
            </div>
            <Switch defaultChecked={family.settings.requireApproval} />
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Allow public invites</Label>
              <p className='text-sm text-muted-foreground'>
                Members can share invite codes publicly
              </p>
            </div>
            <Switch defaultChecked={family.settings.allowPublicInvites} />
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Emergency access</Label>
              <p className='text-sm text-muted-foreground'>
                Enable emergency document access protocols
              </p>
            </div>
            <Switch defaultChecked={family.settings.emergencyAccess} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InviteMemberDialog({
  family,
  open,
  onOpenChange,
  onInviteSent,
}: {
  family: FamilyGroup | null;
  onInviteSent: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { t } = useTranslation('ui/family-management');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<FamilyRole>('collaborator');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!family || !email) return;

    setIsInviting(true);
    try {
      await collaborationService.inviteFamilyMember({
        familyId: family.id,
        email,
        role,
        relationship,
        message,
      });

      toast({
        title: t('messages.invitationSent'),
        description: `Invitation sent to ${email}`,
      });

      onInviteSent();
      onOpenChange(false);

      // Reset form
      setEmail('');
      setRole('collaborator');
      setRelationship('');
      setMessage('');
    } catch (_error) {
      toast({
        title: 'Error',
        description: t('messages.invitationError'),
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Family Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join {family?.name}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='invite-email'>Email Address</Label>
            <Input
              id='invite-email'
              type='email'
              placeholder={t('placeholders.enterEmail')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor='invite-role'>Role</Label>
            <Select
              value={role}
              onValueChange={(value: FamilyRole) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='member'>Member</SelectItem>
                <SelectItem value='guardian'>Guardian</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='relationship'>Relationship (Optional)</Label>
            <Input
              id='relationship'
              placeholder='e.g., Spouse, Child, Parent'
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor='invite-message'>Personal Message (Optional)</Label>
            <Textarea
              id='invite-message'
              placeholder={t('placeholders.addPersonalMessage')}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email || isInviting}>
            {isInviting ? (
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Mail className='h-4 w-4 mr-2' />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateFamilyDialog({
  open,
  onOpenChange,
  onFamilyCreated,
  trigger,
}: {
  onFamilyCreated: () => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  const { t } = useTranslation('ui/family-management');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name) return;

    setIsCreating(true);
    try {
      await collaborationService.createFamily({
        name,
        description,
      });

      toast({
        title: t('messages.familyCreated'),
        description: `${name} has been created successfully`,
      });

      onFamilyCreated();
      onOpenChange?.(false);

      // Reset form
      setName('');
      setDescription('');
    } catch (_error) {
      toast({
        title: 'Error',
        description: t('messages.familyCreateError'),
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const dialogContent = (
    <>
      <DialogHeader>
        <DialogTitle>Create Family Group</DialogTitle>
        <DialogDescription>
          Create a new family group to start collaborating and sharing documents
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-4'>
        <div>
          <Label htmlFor='family-name'>Family Name</Label>
          <Input
            id='family-name'
            placeholder={t('placeholders.enterFamilyName')}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor='family-description'>Description (Optional)</Label>
          <Textarea
            id='family-description'
            placeholder={t('placeholders.describFamily')}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={() => onOpenChange?.(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!name || isCreating}>
          {isCreating ? (
            <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Users className='h-4 w-4 mr-2' />
          )}
          Create Family
        </Button>
      </DialogFooter>
    </>
  );

  if (trigger) {
    return (
      <Dialog open={open || false} onOpenChange={onOpenChange || (() => {})}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>{dialogContent}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open || false} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent>{dialogContent}</DialogContent>
    </Dialog>
  );
}
