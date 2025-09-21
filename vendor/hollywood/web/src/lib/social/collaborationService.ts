
/**
 * Collaboration Service
 * Phase 8: Social Collaboration & Family Features
 *
 * Handles family member management, document sharing, permissions,
 * collaboration workflows, and family group management.
 */

import { supabase } from '@/integrations/supabase/client';
import { captureError } from '@/lib/monitoring/sentry';
import type {
  FamilyMember as FamilyMemberType,
  FamilyRole as FamilyRoleType,
} from '@/types/family';

// Re-export for backward compatibility
export type { FamilyMember as FamilyMemberType } from '@/types/family';
export type FamilyMember = FamilyMemberRecord;

export interface FamilyMemberRecord {
  avatar_url?: string;
  bio?: string;
  email: string;
  emergency_contact: boolean;
  family_id: string;
  id: string;
  invited_at: string;
  joined_at?: string;
  last_active?: string;
  name: string;
  permissions: FamilyPermissions;
  phone_number?: string;
  relationship?: string;
  role: FamilyRole;
  status: MemberStatus;
  user_id: string;
}

export interface FamilyGroup {
  avatar_url?: string;
  created_at: string;
  description?: string;
  id: string;
  invite_code?: string;
  member_count: number;
  name: string;
  owner_id: string;
  settings: FamilySettings;
  updated_at: string;
}

export interface DocumentShare {
  created_at: string;
  document_id: string;
  expires_at?: string;
  family_id?: string;
  id: string;
  message?: string;
  permissions: SharePermissions;
  shared_by: string;
  shared_with: string;
  status: ShareStatus;
  viewed_at?: string;
}

export interface CollaborationActivity {
  created_at: string;
  family_id: string;
  id: string;
  message: string;
  metadata: Record<string, any>;
  read_by: string[];
  target_id: string;
  target_type: 'document' | 'family' | 'member';
  type: ActivityType;
  user_id: string;
}

export type FamilyRole = FamilyRoleType;
export type MemberStatus = 'active' | 'invited' | 'left' | 'suspended';
export type ShareStatus =
  | 'accepted'
  | 'expired'
  | 'pending'
  | 'rejected'
  | 'revoked';
export type ActivityType =
  | 'backup_created'
  | 'document_accessed'
  | 'document_shared'
  | 'emergency_activated'
  | 'member_invited'
  | 'member_joined'
  | 'member_left'
  | 'role_changed'
  | 'settings_changed';

export interface FamilyPermissions {
  canAccessEmergency: boolean;
  canDeleteDocuments: boolean;
  canManageMembers: boolean;
  canModifySettings: boolean;
  canShareDocuments: boolean;
  canUploadDocuments: boolean;
  canViewAnalytics: boolean;
  canViewDocuments: boolean;
  documentCategories: string[];
}

export interface SharePermissions {
  accessLimit?: number;
  canComment: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canReshare: boolean;
  canView: boolean;
  expiresAt?: string;
}

export interface FamilySettings {
  activityNotifications: boolean;
  allowPublicInvites: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'monthly' | 'weekly';
  defaultPermissions: FamilyPermissions;
  emergencyAccess: boolean;
  inviteExpiration: number; // hours
  requireApproval: boolean;
  shareNotifications: boolean;
}

export interface FamilyInvite {
  created_at: string;
  email: string;
  expires_at: string;
  family_id: string;
  id: string;
  invited_by: string;
  message?: string;
  permissions: FamilyPermissions;
  role: FamilyRole;
  token: string;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private currentFamilyId: null | string = null;
  private activityListeners: Array<(activity: CollaborationActivity) => void> =
    [];

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Initialize collaboration service
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Get user's family groups
      const families = await this.getUserFamilies(userId);

      if (families.length > 0) {
        this.currentFamilyId = families[0].id;
      }

      // Setup real-time subscriptions
      this.setupRealtimeSubscriptions();

      console.log('Collaboration service initialized');
    } catch (_error) {
      console.error('Collaboration service initialization failed:', error);
      captureError(error instanceof Error ? error : new Error(String(error)), {
        tags: { source: 'collaboration_service_init' },
      });
    }
  }

  /**
   * Create a new family group
   */
  async createFamily(data: {
    description?: string;
    name: string;
    settings?: Partial<FamilySettings>;
  }): Promise<FamilyGroup> {
    try {
      const defaultSettings: FamilySettings = {
        requireApproval: false,
        allowPublicInvites: false,
        emergencyAccess: true,
        activityNotifications: true,
        shareNotifications: true,
        autoBackup: true,
        backupFrequency: 'weekly',
        inviteExpiration: 168, // 7 days
        defaultPermissions: {
          canViewDocuments: true,
          canUploadDocuments: true,
          canShareDocuments: true,
          canManageMembers: false,
          canAccessEmergency: false,
          canViewAnalytics: false,
          canModifySettings: false,
          canDeleteDocuments: false,
          documentCategories: ['personal', 'financial', 'medical', 'legal'],
        },
      };

      const familyData = {
        name: data.name,
        description: data.description,
        settings: { ...defaultSettings, ...data.settings },
        member_count: 1,
        invite_code: this.generateInviteCode(),
      };

      const { data: family, error } = await (supabase as any)
        .from('families')
        .insert([familyData])
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await this.addFamilyMember(family.id, {
        role: 'owner',
        permissions: this.getFullPermissions(),
        emergency_contact: true,
      });

      this.currentFamilyId = family.id;

      // Log activity
      await this.logActivity({
        type: 'settings_changed',
        family_id: family.id,
        target_id: family.id,
        target_type: 'family',
        message: 'Family group created',
        metadata: { action: 'create', name: (family as any)?.name || 'Family' },
      });

      return family as FamilyGroup;
    } catch (_error) {
      console.error('Failed to create family:', error);
      throw error;
    }
  }

  /**
   * Get user's family groups
   */
  async getUserFamilies(userId: string): Promise<FamilyGroup[]> {
    try {
      const { data: memberships, error } = await supabase
        .from('family_members')
        .select(
          `
          family_owner_id,
          role,
          is_active,
          id,
          name,
          email,
          permissions,
          phone,
          relationship,
          access_level,
          created_at,
          updated_at
        `
        )
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return (
        memberships?.map(
          m =>
            ({
              id: m.family_owner_id,
              name: (m as any).name || 'Family Group',
              description: 'Family collaboration space',
              owner_id: m.family_owner_id,
              created_at: m.created_at,
              updated_at: m.updated_at,
              member_count: 1,
              settings: {
                requireApproval: false,
                allowPublicInvites: false,
                emergencyAccess: true,
                activityNotifications: true,
                shareNotifications: true,
                autoBackup: true,
                backupFrequency: 'weekly',
                inviteExpiration: 168,
                defaultPermissions: {
                  canViewDocuments: true,
                  canUploadDocuments: true,
                  canShareDocuments: true,
                  canManageMembers: false,
                  canAccessEmergency: false,
                  canViewAnalytics: false,
                  canModifySettings: false,
                  canDeleteDocuments: false,
                  documentCategories: [
                    'personal',
                    'financial',
                    'medical',
                    'legal',
                  ],
                },
              },
              invite_code: '',
              avatar_url: null,
            }) as unknown as FamilyGroup
        ) || []
      );
    } catch (_error) {
      console.error('Failed to get user families:', error);
      return [];
    }
  }

  /**
   * Get family members
   */
  async getFamilyMembers(familyId: string): Promise<FamilyMemberType[]> {
    try {
      const { data: members, error } = await supabase
        .from('family_members')
        .select(
          `
          *,
          users (
            email,
            name,
            avatar_url
          )
        `
        )
        .eq('family_id', familyId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Database query error:', error);
        return [];
      }

      return (
        members?.map(
          member =>
            ({
              id: member.id,
              email:
                (member as any).users?.email || (member as any).email || '',
              name: (member as any).users?.name || (member as any).name || '',
              role: member.role,
              relationship: member.relationship,
              status: 'active',
              avatar: (member as any).users?.avatar_url || undefined,
              phone: (member as any).users?.phone || null,
            }) as FamilyMemberType
        ) || []
      );
    } catch (_error) {
      console.error('Failed to get family members:', error);
      return [];
    }
  }

  /**
   * Invite family member
   */
  async inviteFamilyMember(data: {
    email: string;
    familyId: string;
    message?: string;
    permissions?: Partial<FamilyPermissions>;
    relationship?: string;
    role: FamilyRole;
  }): Promise<FamilyInvite> {
    try {
      const family = await this.getFamily(data.familyId);
      if (!family) throw new Error('Family not found');

      // Check if user is already a member
      const existingMember = await this.findMemberByEmail(
        data.familyId,
        data.email
      );
      if (existingMember) {
        throw new Error('User is already a family member');
      }

      const defaultPermissions = family.settings.defaultPermissions;
      const inviteData: Omit<FamilyInvite, 'id'> = {
        family_id: data.familyId,
        invited_by: (await supabase.auth.getUser()).data.user?.id || '',
        email: data.email,
        role: data.role,
        permissions: { ...defaultPermissions, ...data.permissions },
        expires_at: new Date(
          Date.now() + family.settings.inviteExpiration * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
        message: data.message,
        token: this.generateInviteToken(),
      };

      const { data: invite, error } = await (supabase as any)
        .from('family_invitations')
        .insert([inviteData])
        .select()
        .single();

      if (error) throw error;

      // Send invitation email (implement email service)
      await this.sendInvitationEmail(invite as any, family);

      // Log activity
      await this.logActivity({
        type: 'member_invited',
        family_id: data.familyId,
        target_id: invite.id,
        target_type: 'member',
        message: `Invited ${data.email} as ${data.role}`,
        metadata: {
          email: data.email,
          role: data.role,
          relationship: data.relationship,
        },
      });

      return invite as any;
    } catch (_error) {
      console.error('Failed to invite family member:', error);
      throw error;
    }
  }

  /**
   * Accept family invitation
   */
  async acceptInvitation(token: string): Promise<FamilyMemberType> {
    try {
      // Get invitation
      const { data: invite, error: inviteError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError || !invite) {
        throw new Error('Invalid or expired invitation');
      }

      // Check expiration
      if (new Date(invite.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      // Create family member
      const memberData = {
        user_id: userId,
        family_id: (invite as any).family_id || invite.id,
        email: (invite as any).email || '',
        name: (invite as any).name || (invite as any).email || '',
        role: (invite as any).role || 'viewer',
        permissions: (invite as any).permissions || {},
        status: 'active',
        invited_at: (invite as any).created_at || new Date().toISOString(),
        joined_at: new Date().toISOString(),
        emergency_contact: false,
      };

      const { data: member, error: memberError } = await (supabase as any)
        .from('family_members')
        .insert([memberData])
        .select(
          `
          *,
          users (
            email,
            name,
            avatar_url
          )
        `
        )
        .single();

      if (memberError) throw memberError;

      // Delete used invitation
      await (supabase as any).from('family_invitations').delete().eq('id', invite.id);

      // Update family member count
      await this.updateFamilyMemberCount(
        (invite as any).family_id || (invite as any).family_member_id
      );

      // Log activity
      await this.logActivity({
        type: 'member_joined',
        family_id:
          (invite as any).family_id || (invite as any).family_member_id,
        target_id: member.id,
        target_type: 'member',
        message: `${member.users?.name || member.users?.email} joined the family`,
        metadata: { role: member.role },
      });

      return {
        id: member.id,
        email: member.users?.email || '',
        name: member.users?.name || '',
        role: member.role,
        relationship: member.relationship,
        status: 'active',
        avatar: member.users?.avatar_url || undefined,
        phone: member.users?.phone || null,
      } as FamilyMemberType;
    } catch (_error) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Share document with family members
   */
  async shareDocument(data: {
    documentId: string;
    expiresAt?: string;
    message?: string;
    permissions: SharePermissions;
    recipients: string[]; // member IDs
  }): Promise<DocumentShare[]> {
    try {
      const shares: DocumentShare[] = [];
      const userId = (await supabase.auth.getUser()).data.user?.id;

      for (const recipientId of data.recipients) {
        const shareData = {
          document_id: data.documentId,
          shared_by: userId,
          shared_with: recipientId,
          family_id: this.currentFamilyId,
          permissions: data.permissions,
          expires_at: data.expiresAt,
          message: data.message,
          status: 'pending' as ShareStatus,
          created_at: new Date().toISOString(),
        };

        const { data: share, error } = await (supabase as any)
          .from('document_shares')
          .insert([shareData])
          .select()
          .single();

        if (error) throw error;
        shares.push(share as any);

        // Send notification
        await this.sendShareNotification(share, data.documentId);
      }

      // Log activity
      await this.logActivity({
        type: 'document_shared',
        family_id: this.currentFamilyId!,
        target_id: data.documentId,
        target_type: 'document',
        message: `Shared document with ${data.recipients.length} member(s)`,
        metadata: {
          recipients: data.recipients.length,
          permissions: data.permissions,
        },
      });

      return shares;
    } catch (_error) {
      console.error('Failed to share document:', error);
      throw error;
    }
  }

  /**
   * Get shared documents
   */
  async getSharedDocuments(
    userId: string,
    type: 'shared_by_me' | 'shared_with_me' = 'shared_with_me'
  ): Promise<DocumentShare[]> {
    try {
      const column = type === 'shared_by_me' ? 'shared_by' : 'shared_with';

      const { data: shares, error } = await supabase
        .from('document_shares')
        .select(
          `
          *,
          documents (
            id,
            name,
            type,
            category,
            size,
            created_at
          ),
          shared_by_user:users!shared_by (
            name,
            email,
            avatar_url
          ),
          shared_with_user:users!shared_with (
            name,
            email,
            avatar_url
          )
        `
        )
        .eq(column, userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (shares || []) as any[];
    } catch (_error) {
      console.error('Failed to get shared documents:', error);
      return [];
    }
  }

  /**
   * Update member role and permissions
   */
  async updateMemberRole(
    memberId: string,
    role: FamilyRole,
    permissions?: Partial<FamilyPermissions>
  ): Promise<void> {
    try {
      const updateData: any = { role };

      if (permissions) {
        const { data: currentMember } = await supabase
          .from('family_members')
          .select('permissions')
          .eq('id', memberId)
          .single();

        updateData.permissions = {
          ...(currentMember as any)?.permissions,
          ...permissions,
        };
      }

      const { error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', memberId);

      if (error) throw error;

      // Log activity
      await this.logActivity({
        type: 'role_changed',
        family_id: this.currentFamilyId!,
        target_id: memberId,
        target_type: 'member',
        message: `Member role updated to ${role}`,
        metadata: { role, permissions },
      });
    } catch (_error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  /**
   * Remove family member
   */
  async removeFamilyMember(memberId: string): Promise<void> {
    try {
      // Update status to left instead of deleting
      const { error } = await (supabase as any)
        .from('family_members')
        .update({
          status: 'inactive',
          left_at: new Date().toISOString(),
        } as any)
        .eq('id', memberId);

      if (error) throw error;

      // Update family member count
      if (this.currentFamilyId) {
        await this.updateFamilyMemberCount(this.currentFamilyId);
      }

      // Log activity
      await this.logActivity({
        type: 'member_left',
        family_id: this.currentFamilyId!,
        target_id: memberId,
        target_type: 'member',
        message: 'Member removed from family',
        metadata: { action: 'removed' },
      });
    } catch (_error) {
      console.error('Failed to remove family member:', error);
      throw error;
    }
  }

  /**
   * Get family activity feed
   */
  async getFamilyActivity(
    familyId: string,
    limit: number = 50
  ): Promise<CollaborationActivity[]> {
    try {
      const { data: activities, error } = await (supabase as any)
        .from('collaboration_activities')
        .select(
          `
          *,
          users (
            name,
            email,
            avatar_url
          )
        `
        )
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (activities || []) as any[];
    } catch (_error) {
      console.error('Failed to get family activity:', error);
      return [];
    }
  }

  /**
   * Update family settings
   */
  async updateFamilySettings(
    familyId: string,
    settings: Partial<FamilySettings>
  ): Promise<void> {
    try {
      const { data: family } = await (supabase as any)
        .from('families')
        .select('settings')
        .eq('id', familyId)
        .single();

      const updatedSettings = { ...(family as any)?.settings, ...settings };

      const { error } = await (supabase as any)
        .from('families')
        .update({ settings: updatedSettings } as any)
        .eq('id', familyId);

      if (error) throw error;

      // Log activity
      await this.logActivity({
        type: 'settings_changed',
        family_id: familyId,
        target_id: familyId,
        target_type: 'family',
        message: 'Family settings updated',
        metadata: { changes: Object.keys(settings) },
      });
    } catch (_error) {
      console.error('Failed to update family settings:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getFamily(familyId: string): Promise<FamilyGroup | null> {
    try {
      const { data: family, error } = await (supabase as any)
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (error) return null;
      return family as any;
    } catch (_error) {
      return null;
    }
  }

  private async findMemberByEmail(
    familyId: string,
    email: string
  ): Promise<FamilyMemberRecord | null> {
    try {
      const { data: member, error } = await supabase
        .from('family_members')
        .select(
          `
          *,
          users (
            email,
            name,
            avatar_url
          )
        `
        )
        .eq('family_id', familyId)
        .eq('users.email', email)
        .single();

      if (error) return null;
      return {
        ...(member as any),
        family_id: familyId,
        status: 'active',
        invited_at: new Date().toISOString(),
        email: (member as any).users?.email || '',
        name: (member as any).users?.name || '',
        avatar_url: (member as any).users?.avatar_url,
      } as any;
    } catch (_error) {
      return null;
    }
  }

  private async addFamilyMember(
    familyId: string,
    data: Partial<FamilyMemberRecord>
  ): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const memberData = {
      user_id: userId,
      family_id: familyId,
      status: 'active',
      joined_at: new Date().toISOString(),
      ...data,
    };

    await (supabase as any).from('family_members').insert([memberData]);
  }

  private async updateFamilyMemberCount(familyId: string): Promise<void> {
    const { count } = await (supabase as any)
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('status', 'active');

    await (supabase as any)
      .from('families')
      .update({ member_count: count || 0 } as any)
      .eq('id', familyId);
  }

  private async logActivity(
    data: Omit<
      CollaborationActivity,
      'created_at' | 'id' | 'read_by' | 'user_id'
    >
  ): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const activityData = {
        ...data,
        user_id: userId,
        created_at: new Date().toISOString(),
        read_by: [],
      };

      const { data: activity, error } = await (supabase as any)
        .from('collaboration_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;

      // Notify listeners
      this.notifyActivityListeners(activity as any);
    } catch (_error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async sendInvitationEmail(
    invite: FamilyInvite,
    family: FamilyGroup
  ): Promise<void> {
    // Implement email service integration
    console.log('Sending invitation email:', invite.email, family.name);
  }

  private async sendShareNotification(
    share: DocumentShare,
    documentId: string
  ): Promise<void> {
    // Implement push notification service
    console.log('Sending share notification:', share.shared_with, documentId);
  }

  private setupRealtimeSubscriptions(): void {
    if (!this.currentFamilyId) return;

    // Subscribe to family activities
    supabase
      .channel('family_activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_activities',
          filter: `family_id=eq.${this.currentFamilyId}`,
        },
        payload => {
          this.notifyActivityListeners(payload.new as CollaborationActivity);
        }
      )
      .subscribe();
  }

  private notifyActivityListeners(activity: CollaborationActivity): void {
    this.activityListeners.forEach(listener => {
      try {
        listener(activity);
      } catch (_error) {
        console.error('Activity listener error:', error);
      }
    });
  }

  private generateInviteCode(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private generateInviteToken(): string {
    return crypto
      .getRandomValues(new Uint8Array(32))
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
  }

  private getFullPermissions(): FamilyPermissions {
    return {
      canViewDocuments: true,
      canUploadDocuments: true,
      canShareDocuments: true,
      canManageMembers: true,
      canAccessEmergency: true,
      canViewAnalytics: true,
      canModifySettings: true,
      canDeleteDocuments: true,
      documentCategories: [
        'personal',
        'financial',
        'medical',
        'legal',
        'insurance',
        'property',
      ],
    };
  }

  /**
   * Add activity listener
   */
  addActivityListener(
    callback: (activity: CollaborationActivity) => void
  ): void {
    this.activityListeners.push(callback);
  }

  /**
   * Remove activity listener
   */
  removeActivityListener(
    callback: (activity: CollaborationActivity) => void
  ): void {
    const index = this.activityListeners.indexOf(callback);
    if (index > -1) {
      this.activityListeners.splice(index, 1);
    }
  }

  /**
   * Get current family ID
   */
  getCurrentFamilyId(): null | string {
    return this.currentFamilyId;
  }

  /**
   * Set current family ID
   */
  setCurrentFamilyId(familyId: string): void {
    this.currentFamilyId = familyId;
    this.setupRealtimeSubscriptions();
  }
}

export const collaborationService = CollaborationService.getInstance();
