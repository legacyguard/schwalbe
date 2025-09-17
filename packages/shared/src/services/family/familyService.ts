/**
 * Family Service
 * Database integration for family member management, invitations, and collaboration
 */

import { supabase } from '@schwalbe/shared';

import { logger } from '../../lib/logger';
// Temporary type definitions until they're properly defined
type FamilyInvitation = any;
type FamilyMember = any;
type FamilyStats = any;
type FamilyProtectionStatus = any;
type EmergencyAccessRequest = any;
type FamilyActivity = any;
type FamilyRole = any;
type RelationshipType = any;

export class FamilyService {
  private static instance: FamilyService;

  public static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // Family Member Management

  /**
   * Get all family members for a user
   */
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_owner_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching family members:', error);
        return [];
      }

      return (data || []).map((member: any) => ({
        id: member.id,
        familyOwnerId: member.family_owner_id,
        userId: member.user_id,
        name: member.name,
        email: member.email,
        role: member.role,
        relationship: member.relationship,
        status: member.is_active ? 'active' : 'inactive',
        permissions: member.permissions || {},
        phone: member.phone,
        address: member.address,
        emergencyContact: member.emergency_contact,
        emergencyPriority: member.emergency_priority,
        accessLevel: member.access_level,
        lastActiveAt: member.last_active_at,
        joinedAt: new Date(member.created_at),
        invitedAt: new Date(member.created_at),
        invitedBy: member.family_owner_id,
        preferences: member.preferences || {},
      }));
    } catch (error) {
      logger.error('Failed to fetch family members:', error);
      return [];
    }
  }

  /**
   * Add a new family member
   */
  async addFamilyMember(
    userId: string,
    memberData: {
      email: string;
      name: string;
      role: FamilyRole;
      relationship: RelationshipType;
      message?: string;
    }
  ): Promise<FamilyMember> {
    try {
      // Validate input data
      if (!memberData.email || !memberData.name || !memberData.role || !memberData.relationship) {
        throw new Error('Missing required family member data');
      }

      // Check if family member with this email already exists
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('email')
        .eq('family_owner_id', userId)
        .eq('email', memberData.email)
        .single();

      if (existingMember) {
        throw new Error('Family member with this email already exists');
      }

      // Create family member record
      const { data: newMember, error } = await supabase
        .from('family_members')
        .insert({
          family_owner_id: userId,
          name: memberData.name,
          email: memberData.email,
          role: memberData.role,
          relationship: memberData.relationship,
          is_active: false, // Will be activated when they accept invitation
          permissions: {},
          preferences: {},
        })
        .select('*')
        .single();

      if (error) {
        logger.error('Error creating family member:', error);
        throw new Error('Failed to create family member');
      }

      // Create invitation record
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await supabase.from('family_invitations').insert({
        sender_id: userId,
        family_member_id: newMember.id,
        email: memberData.email,
        token: invitationToken,
        status: 'pending',
        message: memberData.message || 'Welcome to our family legacy system!',
        expires_at: expiresAt.toISOString(),
      });

      return {
        id: newMember.id,
        familyOwnerId: newMember.family_owner_id,
        userId: newMember.user_id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        relationship: newMember.relationship,
        status: 'pending',
        permissions: newMember.permissions || {},
        phone: newMember.phone,
        address: newMember.address,
        emergencyContact: newMember.emergency_contact,
        emergencyPriority: newMember.emergency_priority,
        accessLevel: newMember.access_level,
        lastActiveAt: newMember.last_active_at,
        joinedAt: new Date(newMember.created_at),
        invitedAt: new Date(newMember.created_at),
        invitedBy: userId,
        preferences: newMember.preferences || {},
      };
    } catch (error) {
      logger.error('Failed to add family member:', error);
      throw error;
    }
  }

  /**
   * Send family invitation
   */
  async sendInvitation(
    familyOwnerId: string,
    invitationData: {
      email: string;
      name: string;
      role: FamilyRole;
      relationship: RelationshipType;
      message?: string;
    }
  ): Promise<FamilyInvitation> {
    try {
      // Create the family member record and invitation
      const familyMember = await this.addFamilyMember(familyOwnerId, invitationData);

      // Get the created invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('family_member_id', familyMember.id)
        .eq('sender_id', familyOwnerId)
        .single();

      if (fetchError || !invitation) {
        logger.error('Error fetching created invitation:', fetchError);
        throw new Error('Failed to retrieve invitation');
      }

      return {
        id: invitation.id,
        senderId: invitation.sender_id,
        familyMemberId: invitation.family_member_id,
        email: invitation.email,
        token: invitation.token,
        status: invitation.status,
        message: invitation.message,
        expiresAt: invitation.expires_at,
        acceptedAt: invitation.accepted_at,
        declinedAt: invitation.declined_at,
        createdAt: invitation.created_at,
        name: invitationData.name,
        role: invitationData.role,
        relationship: invitationData.relationship,
        invitedAt: new Date(invitation.created_at),
        invitedBy: invitation.sender_id,
      };
    } catch (error) {
      logger.error('Failed to send invitation:', error);
      throw error;
    }
  }

  /**
   * Get family statistics
   */
  async getFamilyStats(userId: string): Promise<FamilyStats> {
    try {
      const members = await this.getFamilyMembers(userId);
      const invitations = await this.getFamilyInvitations(userId);
      const activity = await this.getRecentFamilyActivity(userId);

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        pendingInvitations: invitations.filter(i => i.status === 'pending').length,
        totalDocuments: 0, // TODO: Implement document counting
        sharedDocuments: 0, // TODO: Implement shared document counting
        memberContributions: {},
        documentsByCategory: {},
        recentActivity: activity,
        upcomingEvents: [],
        protectionScore: this.calculateFamilyProtectionLevel(members, { total: 0, shared: 0 }),
      };
    } catch (error) {
      logger.error('Failed to calculate family stats:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvitations: 0,
        totalDocuments: 0,
        sharedDocuments: 0,
        memberContributions: {},
        documentsByCategory: {},
        recentActivity: [],
        upcomingEvents: [],
        protectionScore: 0,
      };
    }
  }

  /**
   * Get family protection status
   */
  async getFamilyProtectionStatus(userId: string): Promise<FamilyProtectionStatus> {
    try {
      const members = await this.getFamilyMembers(userId);
      const documents = { total: 0, shared: 0 }; // TODO: Implement actual document stats

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        protectionLevel: this.calculateFamilyProtectionLevel(members, documents),
        documentsShared: documents.shared,
        emergencyContactsSet: members.some(m => m.emergencyPriority),
        lastUpdated: new Date(),
        strengths: ['Documents secured', 'Family access configured'],
        recommendations: ['Add more family members', 'Set up emergency contacts'],
      };
    } catch (error) {
      logger.error('Failed to get family protection status:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        protectionLevel: 0,
        documentsShared: 0,
        emergencyContactsSet: false,
        lastUpdated: new Date(),
        strengths: [],
        recommendations: [],
      };
    }
  }

  /**
   * Get pending invitations
   */
  async getFamilyInvitations(userId: string): Promise<FamilyInvitation[]> {
    try {
      const { data: invitations, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          family_members:family_member_id (
            name,
            role,
            relationship
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching family invitations:', error);
        return [];
      }

      return (invitations || []).map((invitation: any) => ({
        id: invitation.id,
        senderId: invitation.sender_id,
        familyMemberId: invitation.family_member_id,
        email: invitation.email,
        token: invitation.token,
        status: invitation.status,
        message: invitation.message,
        expiresAt: invitation.expires_at,
        acceptedAt: invitation.accepted_at,
        declinedAt: invitation.declined_at,
        createdAt: invitation.created_at,
        name: invitation.family_members?.name || 'Unknown',
        role: invitation.family_members?.role || 'viewer',
        relationship: invitation.family_members?.relationship || 'other',
        invitedAt: new Date(invitation.created_at),
        invitedBy: invitation.sender_id,
      }));
    } catch (error) {
      logger.error('Failed to fetch family invitations:', error);
      return [];
    }
  }

  /**
   * Get recent family activity
   */
  async getRecentFamilyActivity(userId: string): Promise<FamilyActivity[]> {
    try {
      const { data: activities, error } = await supabase
        .from('family_activity_log')
        .select('*')
        .eq('family_owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error fetching family activity:', error);
        return [];
      }

      return (activities || []).map((activity: any) => ({
        id: activity.id,
        familyOwnerId: activity.family_owner_id,
        actorId: activity.actor_id,
        actorName: activity.actor_name,
        actionType: activity.action_type,
        targetType: activity.target_type,
        targetId: activity.target_id,
        details: activity.details as Record<string, any>,
        createdAt: activity.created_at,
      }));
    } catch (error) {
      logger.error('Failed to fetch family activity:', error);
      return [];
    }
  }

  /**
   * Request emergency access
   */
  async requestEmergencyAccess(
    requesterId: string,
    ownerId: string,
    reason: string
  ): Promise<EmergencyAccessRequest> {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create emergency access request
      const { data: request, error } = await supabase
        .from('emergency_access_requests')
        .insert({
          requester_id: requesterId,
          owner_id: ownerId,
          reason,
          status: 'pending',
          requested_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select('*')
        .single();

      if (error || !request) {
        logger.error('Error creating emergency access request:', error);
        throw new Error('Failed to create emergency access request');
      }

      return {
        id: request.id,
        requesterId: request.requester_id,
        ownerId: request.owner_id,
        reason: request.reason,
        status: request.status,
        requestedAt: request.requested_at,
        expiresAt: request.expires_at,
        respondedAt: request.responded_at,
        approverName: request.approver_name,
        approverRelation: request.approver_relation,
        accessGrantedUntil: request.access_granted_until,
        createdAt: request.created_at,
        requestedBy: request.requester_id,
        documentsRequested: [],
        accessDuration: 24,
        verificationMethod: 'email',
        emergencyLevel: 'medium',
      };
    } catch (error) {
      logger.error('Failed to request emergency access:', error);
      throw error;
    }
  }

  // Helper Methods

  private calculateFamilyProtectionLevel(
    members: FamilyMember[],
    documents: { shared: number; total: number }
  ): number {
    const memberScore = Math.min(100, members.length * 20);
    const documentScore = Math.min(100, documents.total * 10);
    const sharingScore =
      documents.total > 0
        ? Math.min(100, (documents.shared / documents.total) * 100)
        : 0;

    return Math.round((memberScore + documentScore + sharingScore) / 3);
  }
}

export const familyService = FamilyService.getInstance();