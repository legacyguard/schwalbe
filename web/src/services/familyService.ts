
/**
 * Family Service
 * Real database integration for family member management, invitations, and collaboration
 */

import { supabase } from '@/integrations/supabase/client';
import { familyDataCache } from '@/lib/performance/caching';
import {
  type CreateFamilyInvitationRequest,
  type CreateFamilyMemberRequest,
  type DbFamilyMember,
  type DbFamilyMemberUpdate,
  type EmergencyAccessRequest,
  type FamilyActivity,
  type FamilyCalendarEvent,
  type FamilyInvitation,
  type FamilyMember,
  type FamilyProtectionStatus,
  type FamilyStats,
  isValidAccessLevel,
  isValidFamilyRole,
  isValidRelationship,
  mapApplicationToDbFamilyMember,
  mapDbFamilyMemberToApplication,
  type UpdateFamilyMemberRequest,
} from '@/integrations/supabase/database-aligned-types';
import type { Json } from '@/integrations/supabase/types';

export class FamilyService {
  private static instance: FamilyService;

  public static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // Family Member Management with Real Database Integration

  /**
   * Get all family members for a user
   */
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const cacheKey = `family_members_${userId}`;
    const cached = familyDataCache.get(cacheKey);

    if (cached && Array.isArray(cached)) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_owner_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        return [];
      }

      const familyMembers: FamilyMember[] = (data || []).map(
        (member: DbFamilyMember) =>
          mapDbFamilyMemberToApplication(member, userId)
      );

      familyDataCache.set(cacheKey, familyMembers);
      return familyMembers;
    } catch (error) {
      console.error('Failed to fetch family members:', error);
      return [];
    }
  }

  /**
   * Add a new family member
   */
  async addFamilyMember(
    userId: string,
    memberData: CreateFamilyMemberRequest
  ): Promise<FamilyMember> {
    try {
      // Validate input data
      if (
        !memberData.email ||
        !memberData.name ||
        !memberData.role ||
        !memberData.relationship
      ) {
        throw new Error('Missing required family member data');
      }

      if (
        !isValidFamilyRole(memberData.role) ||
        !isValidRelationship(memberData.relationship)
      ) {
        throw new Error('Invalid role or relationship type');
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
      const dbMemberData = mapApplicationToDbFamilyMember(memberData, userId);

      const { data: newMember, error } = await supabase
        .from('family_members')
        .insert(dbMemberData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating family member:', error);
        throw new Error('Failed to create family member');
      }

      // Create invitation record
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { error: invitationError } = await supabase
        .from('family_invitations')
        .insert({
          sender_id: userId,
          family_member_id: newMember.id,
          email: memberData.email,
          token: invitationToken,
          status: 'pending',
          message: `Welcome to our family legacy system!`,
          expires_at: expiresAt.toISOString(),
        });

      if (invitationError) {
        console.error('Error creating invitation:', invitationError);
        // Don't throw here, member was created successfully
      }

      // Log family activity
      await this.logFamilyActivity(
        userId,
        userId,
        'member_added',
        'family_member',
        newMember.id,
        {
          memberName: memberData.name,
          memberEmail: memberData.email,
          role: memberData.role,
          relationship: memberData.relationship,
        }
      );

      // Clear cache
      familyDataCache.invalidatePattern(new RegExp(`family_.*${userId}.*`));

      return mapDbFamilyMemberToApplication(newMember, userId);
    } catch (error) {
      console.error('Failed to add family member:', error);
      throw error;
    }
  }

  /**
   * Update family member information
   */
  async updateFamilyMember(
    userId: string,
    memberId: string,
    updates: UpdateFamilyMemberRequest
  ): Promise<FamilyMember> {
    try {
      // Validate that the member exists and belongs to this user
      const { data: existingMember, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberId)
        .eq('family_owner_id', userId)
        .single();

      if (fetchError || !existingMember) {
        throw new Error('Family member not found or access denied');
      }

      // Validate role and relationship if provided
      if (updates.role && !isValidFamilyRole(updates.role)) {
        throw new Error('Invalid role type');
      }
      if (updates.relationship && !isValidRelationship(updates.relationship)) {
        throw new Error('Invalid relationship type');
      }
      if (updates.accessLevel && !isValidAccessLevel(updates.accessLevel)) {
        throw new Error('Invalid access level');
      }

      // Prepare update data
      const updateData: DbFamilyMemberUpdate = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.relationship !== undefined)
        updateData.relationship = updates.relationship;
      if (updates.permissions !== undefined)
        updateData.permissions = updates.permissions as unknown as Json;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address as unknown as Json;
      if (updates.emergencyContact !== undefined)
        updateData.emergency_contact = updates.emergencyContact;
      if (updates.accessLevel !== undefined)
        updateData.access_level = updates.accessLevel;
      if (updates.isActive !== undefined)
        updateData.is_active = updates.isActive;
      if (updates.preferences !== undefined)
        updateData.preferences = updates.preferences as unknown as Json;

      updateData.updated_at = new Date().toISOString();

      // Update the family member
      const { data: updatedMember, error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', memberId)
        .eq('family_owner_id', userId)
        .select('*')
        .single();

      if (error || !updatedMember) {
        console.error('Error updating family member:', error);
        throw new Error('Failed to update family member');
      }

      // Log family activity
      await this.logFamilyActivity(
        userId,
        userId,
        'member_updated',
        'family_member',
        memberId,
        {
          memberName: updatedMember.name,
          updates: Object.keys(updates),
          previousRole: existingMember.role,
          newRole: updatedMember.role,
        }
      );

      // Clear cache
      familyDataCache.invalidatePattern(new RegExp(`family_.*${userId}.*`));

      return mapDbFamilyMemberToApplication(updatedMember, userId);
    } catch (error) {
      console.error('Failed to update family member:', error);
      throw error;
    }
  }

  /**
   * Remove family member
   */
  async removeFamilyMember(userId: string, memberId: string): Promise<void> {
    try {
      // Validate that the member exists and belongs to this user
      const { data: existingMember, error: fetchError } = await supabase
        .from('family_members')
        .select('name')
        .eq('id', memberId)
        .eq('family_owner_id', userId)
        .single();

      if (fetchError || !existingMember) {
        throw new Error('Family member not found or access denied');
      }

      // Remove the family member (cascade should handle related records)
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)
        .eq('family_owner_id', userId);

      if (error) {
        console.error('Error removing family member:', error);
        throw new Error('Failed to remove family member');
      }

      // Log family activity
      await this.logFamilyActivity(
        userId,
        userId,
        'member_removed',
        'family_member',
        memberId,
        {
          memberName: existingMember.name,
        }
      );

      // Clear cache
      familyDataCache.invalidatePattern(new RegExp(`family_.*${userId}.*`));
    } catch (error) {
      console.error('Failed to remove family member:', error);
      throw error;
    }
  }

  // Family Invitations

  /**
   * Send family invitation
   */
  async sendInvitation(
    familyOwnerId: string,
    invitationData: CreateFamilyInvitationRequest
  ): Promise<FamilyInvitation> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      // Validate input
      if (
        !isValidFamilyRole(invitationData.role) ||
        !isValidRelationship(invitationData.relationship)
      ) {
        throw new Error('Invalid role or relationship type');
      }

      // Check if invitation already exists for this email
      const { data: existingInvitation } = await supabase
        .from('family_invitations')
        .select('status')
        .eq('sender_id', familyOwnerId)
        .eq('email', invitationData.email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        throw new Error('Pending invitation already exists for this email');
      }

      // First create the family member record
      const familyMember = await this.addFamilyMember(
        familyOwnerId,
        invitationData
      );

      // Get the newly created invitation (created by addFamilyMember)
      const { data: invitation, error: fetchError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('family_member_id', familyMember.id)
        .eq('sender_id', familyOwnerId)
        .single();

      if (fetchError || !invitation) {
        console.error('Error fetching created invitation:', fetchError);
        throw new Error('Failed to retrieve invitation');
      }

      // Return mapped invitation
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

        // Computed fields from family member
        name: invitationData.name,
        role: invitationData.role,
        relationship: invitationData.relationship,
        invitedAt: new Date(invitation.created_at),
        invitedBy: invitation.sender_id,
      };
    } catch (error) {
      console.error('Failed to send invitation:', error);
      throw error;
    }
  }

  /**
   * Get pending invitations
   */
  async getFamilyInvitations(userId: string): Promise<FamilyInvitation[]> {
    try {
      const { data: invitations, error } = await supabase
        .from('family_invitations')
        .select(
          `
          *,
          family_members:family_member_id (
            name,
            role,
            relationship
          )
        `
        )
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching family invitations:', error);
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

        // From joined family_members table
        name: invitation.family_members?.name || 'Unknown',
        role: invitation.family_members?.role || 'viewer',
        relationship: invitation.family_members?.relationship || 'other',
        invitedAt: new Date(invitation.created_at),
        invitedBy: invitation.sender_id,
      }));
    } catch (error) {
      console.error('Failed to fetch family invitations:', error);
      return [];
    }
  }

  /**
   * Accept family invitation
   */
  async acceptInvitation(
    token: string
  ): Promise<{ familyMember?: FamilyMember; success: boolean }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      // Find the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select(
          `
          *,
          family_members!family_invitations_family_member_id_fkey (
            *
          )
        `
        )
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitation) {
        console.error('Invitation not found or expired:', invitationError);
        return { success: false };
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        await supabase
          .from('family_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);
        return { success: false };
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error accepting invitation:', updateError);
        return { success: false };
      }

      // Update family member with user ID and mark as active
      const { data: updatedMember, error: memberUpdateError } = await supabase
        .from('family_members')
        .update({
          user_id: user.user.id,
          is_active: true,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', invitation.family_member_id)
        .select('*')
        .single();

      if (memberUpdateError || !updatedMember) {
        console.error('Error updating family member:', memberUpdateError);
        return { success: false };
      }

      // Log family activity
      await this.logFamilyActivity(
        updatedMember.family_owner_id,
        user.user.id,
        'invitation_accepted',
        'invitation',
        invitation.id,
        {
          memberName: updatedMember.name,
          memberEmail: updatedMember.email,
        }
      );

      // Clear cache
      familyDataCache.invalidatePattern(
        new RegExp(`family_.*${updatedMember.family_owner_id}.*`)
      );

      return {
        success: true,
        familyMember: mapDbFamilyMemberToApplication(
          updatedMember,
          updatedMember.family_owner_id
        ),
      };
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return { success: false };
    }
  }

  // Family Statistics and Protection Status

  /**
   * Get family statistics
   */
  async getFamilyStats(userId: string): Promise<FamilyStats> {
    try {
      const [members, documents, invitations, activity, events] =
        await Promise.all([
          this.getFamilyMembers(userId),
          this.getFamilyDocumentStats(userId),
          this.getFamilyInvitations(userId),
          this.getRecentFamilyActivity(userId),
          this.getFamilyCalendarEvents(userId),
        ]);

      // Calculate member contributions (placeholder - would need document sharing data)
      const memberContributions: Record<string, number> = {};
      members.forEach(member => {
        memberContributions[member.id] = 0; // TODO: Calculate actual contributions
      });

      // Calculate documents by category (placeholder - would need document category data)
      const documentsByCategory: Record<string, number> = {
        will: Math.floor(documents.total * 0.2),
        insurance: Math.floor(documents.total * 0.3),
        medical: Math.floor(documents.total * 0.2),
        financial: Math.floor(documents.total * 0.2),
        other: documents.total - Math.floor(documents.total * 0.9),
      };

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        pendingInvitations: invitations.filter(i => i.status === 'pending')
          .length,
        totalDocuments: documents.total,
        sharedDocuments: documents.shared,
        memberContributions,
        documentsByCategory,
        recentActivity: activity,
        upcomingEvents: events,
        protectionScore: this.calculateFamilyProtectionLevel(
          members,
          documents
        ),
      };
    } catch (error) {
      console.error('Failed to calculate family stats:', error);
      return this.getDefaultFamilyStats();
    }
  }

  /**
   * Get family protection status
   */
  async getFamilyProtectionStatus(
    userId: string
  ): Promise<FamilyProtectionStatus> {
    try {
      const members = await this.getFamilyMembers(userId);
      const documents = await this.getFamilyDocumentStats(userId);

      const coverage = this.calculateFamilyCoverage(members, documents);
      const gaps = this.identifyProtectionGaps(members, documents);
      const recommendations = this.generateProtectionRecommendations(gaps);

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        protectionLevel: coverage.overall,
        documentsShared: documents.shared,
        emergencyContactsSet: members.some(m => m.emergencyPriority),
        lastUpdated: new Date(),
        strengths: ['Documents secured', 'Family access configured'],
        recommendations: recommendations.map(r => r.title),
      };
    } catch (error) {
      console.error('Failed to get family protection status:', error);
      return this.getDefaultProtectionStatus();
    }
  }

  // Emergency Access

  /**
   * Request emergency access
   */
  async requestEmergencyAccess(
    requesterId: string,
    ownerId: string,
    reason: string
  ): Promise<EmergencyAccessRequest> {
    try {
      // Verify that the requester is a family member with emergency access enabled
      const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('emergency_access_enabled, name, relationship')
        .eq('family_owner_id', ownerId)
        .eq('user_id', requesterId)
        .eq('is_active', true)
        .single();

      if (
        memberError ||
        !familyMember ||
        !familyMember.emergency_access_enabled
      ) {
        throw new Error('Emergency access not authorized for this user');
      }

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
          approver_name: familyMember.name,
          approver_relation: familyMember.relationship,
        })
        .select('*')
        .single();

      if (error || !request) {
        console.error('Error creating emergency access request:', error);
        throw new Error('Failed to create emergency access request');
      }

      // Log family activity
      await this.logFamilyActivity(
        ownerId,
        requesterId,
        'emergency_access_requested',
        'emergency_request',
        request.id,
        {
          requesterName: familyMember.name,
          reason: reason,
          emergencyLevel: 'medium',
        }
      );

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

        // Computed fields
        requestedBy: request.requester_id,
        documentsRequested: [], // TODO: Add when document access tracking is implemented
        accessDuration: 24,
        verificationMethod: 'email',
        emergencyLevel: 'medium',
      };
    } catch (error) {
      console.error('Failed to request emergency access:', error);
      throw error;
    }
  }

  // Helper Methods

  /**
   * Log family activity for audit trail
   */
  private async logFamilyActivity(
    familyOwnerId: string,
    actorId: string,
    actionType: FamilyActivity['actionType'],
    targetType: FamilyActivity['targetType'],
    targetId: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const { data: actor } = await supabase
        .from('family_members')
        .select('name')
        .eq('id', actorId)
        .single();

      await (supabase as any).from('family_activity_log').insert({
        family_owner_id: familyOwnerId,
        actor_id: actorId,
        actor_name: actor?.name || 'Unknown',
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        details: details,
      });
    } catch (error) {
      console.error('Failed to log family activity:', error);
      // Don't throw here, this is just for logging
    }
  }

  /**
   * Get recent family activity for the activity timeline
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
        console.error('Error fetching family activity:', error);
        return [];
      }

      return (activities || []).map(activity => ({
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
      console.error('Failed to fetch family activity:', error);
      return [];
    }
  }

  private async getFamilyDocumentStats(
    userId: string
  ): Promise<{ shared: number; total: number }> {
    try {
      // Get total documents for user
      const { count: total, error: totalError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalError) {
        console.error('Error counting documents:', totalError);
        return { total: 0, shared: 0 };
      }

      // Get shared documents count
      const { count: shared, error: sharedError } = await supabase
        .from('document_shares')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .eq('is_active', true);

      if (sharedError) {
        console.error('Error counting shared documents:', sharedError);
        return { total: total || 0, shared: 0 };
      }

      return {
        total: total || 0,
        shared: shared || 0,
      };
    } catch (error) {
      console.error('Error getting document stats:', error);
      return { total: 0, shared: 0 };
    }
  }


  /**
   * Get family calendar events
   */
  async getFamilyCalendarEvents(
    userId: string
  ): Promise<FamilyCalendarEvent[]> {
    try {
      const { data: events, error } = await supabase
        .from('family_calendar_events')
        .select('*')
        .eq('family_owner_id', userId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }

      const mappedEvents = (events || []).map((event: any) => ({
        ...event,
        createdBy: event.created_by_id || '',
        date: new Date(event.scheduled_at),
        notifyMembers: Array.isArray(event.attendees) ? event.attendees : [],
        priority: event.priority || 'medium',
      }));

      return mappedEvents as FamilyCalendarEvent[];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

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

  private calculateFamilyCoverage(
    members: FamilyMember[],
    documents: any
  ): any {
    return {
      overall: Math.min(100, members.length * 15 + documents.total * 5),
      documentation: Math.min(100, documents.total * 10),
      accessibility: Math.min(100, documents.shared * 15),
      communication: Math.min(
        100,
        members.filter(m => m.status === 'active').length * 20
      ),
      emergency: Math.min(
        100,
        members.filter(m => m.emergencyPriority).length * 30
      ),
    };
  }

  private identifyProtectionGaps(
    members: FamilyMember[],
    documents: any
  ): string[] {
    const gaps: string[] = [];

    if (members.length === 0) {
      gaps.push('No family members added');
    }
    if (documents.total === 0) {
      gaps.push('No documents uploaded');
    }
    if (documents.shared === 0 && documents.total > 0) {
      gaps.push('Documents not shared with family');
    }
    if (!members.some(m => m.emergencyPriority)) {
      gaps.push('No emergency contacts designated');
    }

    return gaps;
  }

  private generateProtectionRecommendations(
    gaps: string[]
  ): Array<{
    description: string;
    priority: 'high' | 'low' | 'medium';
    title: string;
  }> {
    return gaps.map(gap => ({
      title: `Address: ${gap}`,
      description: `Recommended action to improve family protection`,
      priority: 'high' as const,
    }));
  }

  private getDefaultFamilyStats(): FamilyStats {
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

  private getDefaultProtectionStatus(): FamilyProtectionStatus {
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

  /**
   * Create a new family calendar event
   */
  async createCalendarEvent(
    userId: string,
    eventData: {
      attendees?: any;
      description?: string;
      durationMinutes?: number;
      eventType: 'celebration' | 'deadline' | 'meeting' | 'reminder' | 'review';
      isRecurring?: boolean;
      location?: string;
      meetingUrl?: string;
      recurrenceEndDate?: string;
      recurrencePattern?: string;
      scheduledAt: string;
      title: string;
    }
  ): Promise<FamilyCalendarEvent> {
    try {
      const { data: event, error } = await supabase
        .from('family_calendar_events')
        .insert({
          family_owner_id: userId,
          created_by_id: userId,
          title: eventData.title,
          description: eventData.description || null,
          event_type: eventData.eventType,
          scheduled_at: eventData.scheduledAt,
          duration_minutes: eventData.durationMinutes || 60,
          location: eventData.location || null,
          meeting_url: eventData.meetingUrl || null,
          attendees: eventData.attendees || {},
          is_recurring: eventData.isRecurring || false,
          recurrence_pattern: eventData.recurrencePattern || null,
          recurrence_end_date: eventData.recurrenceEndDate || null,
          status: 'scheduled',
          reminders: {},
          metadata: {},
        })
        .select('*')
        .single();

      if (error || !event) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event');
      }

      // Clear cache
      familyDataCache.invalidatePattern(new RegExp(`family_.*${userId}.*`));

      const mappedEvent = {
        ...event,
        createdBy: event.created_by_id || '',
        date: new Date(event.scheduled_at),
        notifyMembers: Array.isArray(event.attendees) ? event.attendees : [],
        priority: (event as any).priority || 'medium',
      };

      return mappedEvent as unknown as FamilyCalendarEvent;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  /**
   * Get calendar events for family
   */
  async getCalendarEvents(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FamilyCalendarEvent[]> {
    try {
      let query = supabase
        .from('family_calendar_events')
        .select('*')
        .eq('family_owner_id', userId);

      if (startDate) {
        query = query.gte('scheduled_at', startDate);
      }
      if (endDate) {
        query = query.lte('scheduled_at', endDate);
      }

      const { data: events, error } = await query.order('scheduled_at', {
        ascending: true,
      });

      if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }

      const mappedEvents = (events || []).map((event: any) => ({
        ...event,
        createdBy: event.created_by_id || '',
        date: new Date(event.scheduled_at),
        notifyMembers: Array.isArray(event.attendees) ? event.attendees : [],
        priority: event.priority || 'medium',
      }));

      return mappedEvents as FamilyCalendarEvent[];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}

export const familyService = FamilyService.getInstance();
