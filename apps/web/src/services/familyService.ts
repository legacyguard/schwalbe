/**
 * Family Service - Complete Supabase Integration
 * Replaces all mock data with real database operations
 */

import { supabaseClient as supabase } from '@schwalbe/shared/src/supabase/client';
import { logger } from '@schwalbe/shared/src/lib/logger';

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'friend' | 'other';
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
  // Joined data
  family_member?: FamilyMember;
}

export interface GuardianPermission {
  id: string;
  guardian_id: string;
  permission_type: 'document_access' | 'emergency_activation' | 'family_management' | 'financial_overview' | 'medical_decisions' | 'communication' | 'legal_actions';
  granted: boolean;
  granted_at?: string;
  granted_by?: string;
  expires_at?: string;
  conditions?: Record<string, any>;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  family_member_id?: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  priority_order: number;
  contact_method_preference: 'phone' | 'email' | 'sms' | 'both';
  notes?: string;
  is_primary: boolean;
  is_medical_contact: boolean;
  is_financial_contact: boolean;
  is_legal_contact: boolean;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyProtectionMetrics {
  id: string;
  user_id: string;
  total_family_members: number;
  protected_members: number;
  active_guardians: number;
  emergency_contacts_count: number;
  protection_score: number;
  last_family_activity_at?: string;
  completion_milestones: any[];
  risk_assessment?: Record<string, any>;
  calculated_at: string;
  created_at: string;
}

export interface FamilyInvitation {
  id: string;
  inviter_user_id: string;
  invitee_email: string;
  invitee_name?: string;
  invitation_type: 'family_member' | 'guardian' | 'emergency_contact';
  role_details?: Record<string, any>;
  invitation_token: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  sent_at?: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  reminder_count: number;
  last_reminder_at?: string;
  custom_message?: string;
  created_at: string;
}

export class FamilyService {
  /**
   * Get all family members for the current user
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      logger.info('Fetched family members', { metadata: { count: data?.length } });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch family members', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Add a new family member
   */
  static async addFamilyMember(member: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FamilyMember> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .insert({
          ...member,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Added family member', { metadata: { name: member.name, relationship: member.relationship } });
      return data;
    } catch (error) {
      logger.error('Failed to add family member', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Updated family member', { metadata: { id, updates: Object.keys(updates) } });
      return data;
    } catch (error) {
      logger.error('Failed to update family member', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Deleted family member', { metadata: { id } });
    } catch (error) {
      logger.error('Failed to delete family member', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get all guardians for the current user
   */
  static async getGuardians(): Promise<Guardian[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('guardians')
        .select(`
          *,
          family_member:family_members(*)
        `)
        .eq('user_id', user.id)
        .order('emergency_priority', { ascending: true });

      if (error) throw error;

      logger.info('Fetched guardians', { metadata: { count: data?.length } });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch guardians', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Add a new guardian
   */
  static async addGuardian(guardian: Omit<Guardian, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Guardian> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate invitation token
      const invitation_token = crypto.randomUUID();
      const invitation_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { data, error } = await supabase
        .from('guardians')
        .insert({
          ...guardian,
          user_id: user.id,
          invitation_token,
          invitation_expires_at,
          invitation_sent_at: new Date().toISOString()
        })
        .select(`
          *,
          family_member:family_members(*)
        `)
        .single();

      if (error) throw error;

      logger.info('Added guardian', { metadata: { family_member_id: guardian.family_member_id } });
      return data;
    } catch (error) {
      logger.error('Failed to add guardian', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Update guardian permissions
   */
  static async updateGuardianPermissions(guardianId: string, permissions: Partial<Guardian>): Promise<Guardian> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('guardians')
        .update(permissions)
        .eq('id', guardianId)
        .eq('user_id', user.id)
        .select(`
          *,
          family_member:family_members(*)
        `)
        .single();

      if (error) throw error;

      logger.info('Updated guardian permissions', { metadata: { guardianId, permissions: Object.keys(permissions) } });
      return data;
    } catch (error) {
      logger.error('Failed to update guardian permissions', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get emergency contacts
   */
  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_order', { ascending: true });

      if (error) throw error;

      logger.info('Fetched emergency contacts', { metadata: { count: data?.length } });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch emergency contacts', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Add emergency contact
   */
  static async addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmergencyContact> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          ...contact,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Added emergency contact', { metadata: { name: contact.name, relationship: contact.relationship } });
      return data;
    } catch (error) {
      logger.error('Failed to add emergency contact', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get family protection metrics
   */
  static async getFamilyProtectionMetrics(): Promise<FamilyProtectionMetrics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_protection_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      logger.info('Fetched family protection metrics', { metadata: { score: data?.protection_score } });
      return data;
    } catch (error) {
      logger.error('Failed to fetch family protection metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Manually trigger metrics calculation
   */
  static async updateFamilyProtectionMetrics(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .rpc('update_family_protection_metrics', { p_user_id: user.id });

      if (error) throw error;

      logger.info('Updated family protection metrics', { metadata: { user_id: user.id } });
    } catch (error) {
      logger.error('Failed to update family protection metrics', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Create family invitation
   */
  static async createFamilyInvitation(invitation: Omit<FamilyInvitation, 'id' | 'inviter_user_id' | 'invitation_token' | 'created_at'>): Promise<FamilyInvitation> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const invitation_token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('family_invitations')
        .insert({
          ...invitation,
          inviter_user_id: user.id,
          invitation_token
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Created family invitation', { metadata: { email: invitation.invitee_email, type: invitation.invitation_type } });
      return data;
    } catch (error) {
      logger.error('Failed to create family invitation', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Accept family invitation
   */
  static async acceptFamilyInvitation(token: string): Promise<FamilyInvitation> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', token)
        .eq('invitee_email', user.email)
        .select()
        .single();

      if (error) throw error;

      logger.info('Accepted family invitation', { metadata: { token, user_email: user.email } });
      return data;
    } catch (error) {
      logger.error('Failed to accept family invitation', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Get family invitations (sent by user)
   */
  static async getFamilyInvitations(): Promise<FamilyInvitation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('inviter_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.info('Fetched family invitations', { metadata: { count: data?.length } });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch family invitations', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Initialize user's family with self entry
   */
  static async initializeUserFamily(userName: string): Promise<FamilyMember> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already has family members
      const { data: existing } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('relationship', 'self')
        .single();

      if (existing) {
        return await this.getFamilyMembers().then(members => members.find(m => m.relationship === 'self')!);
      }

      // Create self entry
      const selfMember = await this.addFamilyMember({
        name: userName || user.email?.split('@')[0] || 'Me',
        email: user.email,
        relationship: 'self',
        protection_status: 'partial',
        is_emergency_contact: false,
        is_guardian: false
      });

      logger.info('Initialized user family', { metadata: { user_id: user.id, name: selfMember.name } });
      return selfMember;
    } catch (error) {
      logger.error('Failed to initialize user family', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }
}