/**
 * Family Collaboration Service
 * Manages family member invitations, permissions, and collaboration features
 */

import { supabase } from '@/lib/supabase';

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  protection_status: 'protected' | 'partial' | 'unprotected' | 'pending';
  is_emergency_contact: boolean;
  is_guardian: boolean;
  date_of_birth?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postal_code?: string;
  };
  notes?: string;
  avatar_url?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  user_id: string;
  family_member_id: string;
  guardian_user_id?: string;
  permissions: GuardianPermission[];
  status: 'pending' | 'invited' | 'accepted' | 'active' | 'inactive' | 'declined';
  emergency_priority: number;
  can_access_documents: boolean;
  can_emergency_activate: boolean;
  can_manage_family: boolean;
  can_view_finances: boolean;
  can_make_medical_decisions: boolean;
  invitation_token?: string;
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  accepted_at?: string;
  last_contact_at?: string;
  emergency_contact_info?: {
    preferred_method?: string;
    backup_phone?: string;
    backup_email?: string;
  };
  trust_level: number;
  created_at: string;
  updated_at: string;
  family_member?: FamilyMember;
}

export interface GuardianPermission {
  id: string;
  type: 'document_access' | 'emergency_activation' | 'family_management' | 'financial_view' | 'medical_decisions';
  resource_id?: string;
  granted_at: string;
  expires_at?: string;
  granted_by: string;
}

export interface CollaborationInvitation {
  id: string;
  inviter_id: string;
  inviter_name: string;
  invitee_email: string;
  invitee_phone?: string;
  relationship: string;
  message?: string;
  permissions: {
    can_access_documents: boolean;
    can_emergency_activate: boolean;
    can_manage_family: boolean;
    can_view_finances: boolean;
    can_make_medical_decisions: boolean;
  };
  invitation_token: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  sent_at?: string;
  responded_at?: string;
  created_at: string;
}

export interface InvitationRequest {
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  message?: string;
  permissions: {
    can_access_documents: boolean;
    can_emergency_activate: boolean;
    can_manage_family: boolean;
    can_view_finances: boolean;
    can_make_medical_decisions: boolean;
  };
  emergency_priority?: number;
  trust_level?: number;
}

export class CollaborationService {
  private static instance: CollaborationService;

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Get current user's family members
   */
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        throw new Error(`Nepodarilo sa načítať členov rodiny: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      throw error;
    }
  }

  /**
   * Get guardians for current user
   */
  async getGuardians(userId: string): Promise<Guardian[]> {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select(`
          *,
          family_member:family_members(*)
        `)
        .eq('user_id', userId)
        .order('emergency_priority', { ascending: true });

      if (error) {
        console.error('Error fetching guardians:', error);
        throw new Error(`Nepodarilo sa načítať opatrovníkov: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getGuardians:', error);
      throw error;
    }
  }

  /**
   * Send collaboration invitation
   */
  async sendInvitation(userId: string, request: InvitationRequest): Promise<CollaborationInvitation> {
    try {
      // Generate unique invitation token
      const invitationToken = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Get current user info
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.warn('Could not fetch user profile, using fallback name');
      }

      const inviterName = userData?.full_name || 'Člen rodiny';

      // Create collaboration invitation
      const invitationData = {
        inviter_id: userId,
        inviter_name: inviterName,
        invitee_email: request.email,
        invitee_phone: request.phone,
        relationship: request.relationship,
        message: request.message,
        permissions: request.permissions,
        invitation_token: invitationToken,
        status: 'pending' as const,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('collaboration_invitations')
        .insert([invitationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw new Error(`Nepodarilo sa vytvoriť pozvánku: ${error.message}`);
      }

      // Create pending family member entry
      await this.createPendingFamilyMember(userId, request, data.id);

      // Send invitation email (would integrate with email service)
      await this.sendInvitationEmail(data);

      return data;
    } catch (error) {
      console.error('Error in sendInvitation:', error);
      throw error;
    }
  }

  /**
   * Accept collaboration invitation
   */
  async acceptInvitation(token: string, acceptingUserId?: string): Promise<void> {
    try {
      // Find invitation by token
      const { data: invitation, error: inviteError } = await supabase
        .from('collaboration_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Pozvánka nebola nájdená alebo už bola spracovaná');
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Pozvánka expirovala');
      }

      // Update invitation status
      await supabase
        .from('collaboration_invitations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      // Create or update family member
      await this.finalizeFamilyMemberFromInvitation(invitation, acceptingUserId);

      console.log('Invitation accepted successfully');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Decline collaboration invitation
   */
  async declineInvitation(token: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('collaboration_invitations')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString(),
          decline_reason: reason,
        })
        .eq('invitation_token', token);

      if (error) {
        throw new Error(`Nepodarilo sa odmietnuť pozvánku: ${error.message}`);
      }

      console.log('Invitation declined successfully');
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  }

  /**
   * Get pending invitations for user
   */
  async getPendingInvitations(userId: string): Promise<CollaborationInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_invitations')
        .select('*')
        .eq('inviter_id', userId)
        .in('status', ['pending', 'sent'])
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Nepodarilo sa načítať pozvánky: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting pending invitations:', error);
      throw error;
    }
  }

  /**
   * Get invitations received by email
   */
  async getReceivedInvitations(email: string): Promise<CollaborationInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_invitations')
        .select('*')
        .eq('invitee_email', email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Nepodarilo sa načítať prijaté pozvánky: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting received invitations:', error);
      throw error;
    }
  }

  /**
   * Update guardian permissions
   */
  async updateGuardianPermissions(
    guardianId: string,
    permissions: Partial<{
      can_access_documents: boolean;
      can_emergency_activate: boolean;
      can_manage_family: boolean;
      can_view_finances: boolean;
      can_make_medical_decisions: boolean;
      emergency_priority: number;
      trust_level: number;
    }>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('guardians')
        .update({
          ...permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guardianId);

      if (error) {
        throw new Error(`Nepodarilo sa aktualizovať oprávnenia: ${error.message}`);
      }

      console.log('Guardian permissions updated successfully');
    } catch (error) {
      console.error('Error updating guardian permissions:', error);
      throw error;
    }
  }

  /**
   * Remove family member and guardian relationship
   */
  async removeFamilyMember(familyMemberId: string): Promise<void> {
    try {
      // Remove guardian entries first (due to foreign key)
      await supabase
        .from('guardians')
        .delete()
        .eq('family_member_id', familyMemberId);

      // Remove family member
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', familyMemberId);

      if (error) {
        throw new Error(`Nepodarilo sa odstrániť člena rodiny: ${error.message}`);
      }

      console.log('Family member removed successfully');
    } catch (error) {
      console.error('Error removing family member:', error);
      throw error;
    }
  }

  /**
   * Generate invitation token
   */
  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  /**
   * Create pending family member entry
   */
  private async createPendingFamilyMember(
    userId: string,
    request: InvitationRequest,
    invitationId: string
  ): Promise<void> {
    try {
      const familyMemberData = {
        user_id: userId,
        name: request.name,
        email: request.email,
        phone: request.phone,
        relationship: request.relationship,
        protection_status: 'pending' as const,
        is_emergency_contact: request.permissions.can_emergency_activate,
        is_guardian: true,
        notes: `Pozvaný cez pozvánku #${invitationId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .insert([familyMemberData])
        .select()
        .single();

      if (familyError) {
        throw familyError;
      }

      // Create pending guardian entry
      const guardianData = {
        user_id: userId,
        family_member_id: familyMember.id,
        permissions: [],
        status: 'invited' as const,
        emergency_priority: request.emergency_priority || 5,
        can_access_documents: request.permissions.can_access_documents,
        can_emergency_activate: request.permissions.can_emergency_activate,
        can_manage_family: request.permissions.can_manage_family,
        can_view_finances: request.permissions.can_view_finances,
        can_make_medical_decisions: request.permissions.can_make_medical_decisions,
        invitation_token: invitationId,
        invitation_sent_at: new Date().toISOString(),
        trust_level: request.trust_level || 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: guardianError } = await supabase
        .from('guardians')
        .insert([guardianData]);

      if (guardianError) {
        throw guardianError;
      }
    } catch (error) {
      console.error('Error creating pending family member:', error);
      throw error;
    }
  }

  /**
   * Finalize family member from accepted invitation
   */
  private async finalizeFamilyMemberFromInvitation(
    invitation: CollaborationInvitation,
    acceptingUserId?: string
  ): Promise<void> {
    try {
      // Update guardian with accepting user ID and status
      const { error } = await supabase
        .from('guardians')
        .update({
          guardian_user_id: acceptingUserId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('invitation_token', invitation.id);

      if (error) {
        throw error;
      }

      // Update family member status
      const { error: familyError } = await supabase
        .from('family_members')
        .update({
          protection_status: 'partial',
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('email', invitation.invitee_email)
        .eq('user_id', invitation.inviter_id);

      if (familyError) {
        throw familyError;
      }
    } catch (error) {
      console.error('Error finalizing family member:', error);
      throw error;
    }
  }

  /**
   * Send invitation email (placeholder - would integrate with email service)
   */
  private async sendInvitationEmail(invitation: CollaborationInvitation): Promise<void> {
    try {
      // In production, this would integrate with email service like SendGrid, Mailgun, etc.
      const invitationUrl = `${window.location.origin}/invite/${invitation.invitation_token}`;

      console.log('Sending invitation email:', {
        to: invitation.invitee_email,
        from: invitation.inviter_name,
        subject: `Pozvánka do rodinnej ochrany od ${invitation.inviter_name}`,
        invitationUrl,
      });

      // For now, just update the status to indicate email was "sent"
      await supabase
        .from('collaboration_invitations')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

    } catch (error) {
      console.error('Error sending invitation email:', error);
      // Don't throw here - invitation was created successfully, email is optional
    }
  }

  /**
   * Get collaboration statistics
   */
  async getCollaborationStats(userId: string): Promise<{
    totalFamilyMembers: number;
    activeGuardians: number;
    pendingInvitations: number;
    protectionCoverage: number;
  }> {
    try {
      const [familyMembers, guardians, invitations] = await Promise.all([
        this.getFamilyMembers(userId),
        this.getGuardians(userId),
        this.getPendingInvitations(userId),
      ]);

      const protectedMembers = familyMembers.filter(
        member => member.protection_status === 'protected'
      ).length;

      return {
        totalFamilyMembers: familyMembers.length,
        activeGuardians: guardians.filter(g => g.status === 'active' || g.status === 'accepted').length,
        pendingInvitations: invitations.length,
        protectionCoverage: familyMembers.length > 0
          ? Math.round((protectedMembers / familyMembers.length) * 100)
          : 0,
      };
    } catch (error) {
      console.error('Error getting collaboration stats:', error);
      return {
        totalFamilyMembers: 0,
        activeGuardians: 0,
        pendingInvitations: 0,
        protectionCoverage: 0,
      };
    }
  }
}

export const collaborationService = CollaborationService.getInstance();