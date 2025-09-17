
/**
 * Database-Aligned Types
 * TypeScript interfaces that exactly match Supabase database schemas
 */

import type { Database } from './types';

type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };

// Direct database types - these exactly match the schema
export type DbFamilyMember =
  Database['public']['Tables']['family_members']['Row'];
export type DbFamilyMemberInsert =
  Database['public']['Tables']['family_members']['Insert'];
export type DbFamilyMemberUpdate =
  Database['public']['Tables']['family_members']['Update'];

export type DbFamilyInvitation =
  Database['public']['Tables']['family_invitations']['Row'];
export type DbFamilyInvitationInsert =
  Database['public']['Tables']['family_invitations']['Insert'];
export type DbFamilyInvitationUpdate =
  Database['public']['Tables']['family_invitations']['Update'];

export type DbEmergencyAccessRequest =
  Database['public']['Tables']['emergency_access_requests']['Row'];
export type DbEmergencyAccessRequestInsert =
  Database['public']['Tables']['emergency_access_requests']['Insert'];

export type DbDocumentShare =
  Database['public']['Tables']['document_shares']['Row'];
export type DbDocumentShareInsert =
  Database['public']['Tables']['document_shares']['Insert'];

export type DbFamilyActivityLog =
  Database['public']['Tables']['family_activity_log']['Row'];
export type DbFamilyActivityLogInsert =
  Database['public']['Tables']['family_activity_log']['Insert'];

export type DbFamilyCalendarEvent =
  Database['public']['Tables']['family_calendar_events']['Row'];
export type DbFamilyCalendarEventInsert =
  Database['public']['Tables']['family_calendar_events']['Insert'];

// Properly typed nested objects based on database JSON fields
export interface FamilyMemberPermissions {
  canAccessEmergencyInfo: boolean;
  canDeleteDocuments: boolean;
  canEditDocuments: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canReceiveNotifications: boolean;
  canViewDocuments: boolean;
  canViewFinancials: boolean;
  documentCategories: string[];
}

export interface FamilyMemberAddress {
  city: string;
  country: string;
  postalCode: string;
  state?: string;
  street: string;
}

export interface FamilyMemberPreferences {
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme?: 'auto' | 'dark' | 'light';
  timezone?: string;
}

export interface TrustedDevice {
  fingerprint: string;
  id: string;
  lastUsed: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
}

// Application-layer types that map from database to business logic
export interface FamilyMember {
  accessLevel: DbFamilyMember['access_level'];
  address: FamilyMemberAddress | null;
  // Legacy compatibility fields
  avatar?: string;
  avatarUrl: null | string;
  createdAt: string;
  dateOfBirth: null | string;
  email: string;
  emergencyAccessEnabled: boolean;
  emergencyContact: boolean;
  emergencyPriority?: number;
  familyOwnerId: string;
  // Direct mappings from database
  id: string;
  invitedAt: Date;
  invitedBy: string;
  isActive: boolean;
  joinedAt?: Date;
  lastActiveAt: Date | null;
  name: string;
  notes?: string;
  permissions: FamilyMemberPermissions;
  phone: null | string;

  preferences: FamilyMemberPreferences;
  relationship: DbFamilyMember['relationship'];
  role: DbFamilyMember['role'];
  // Computed/derived fields for application logic
  status: 'active' | 'inactive' | 'pending';
  trustedDevices: TrustedDevice[];

  updatedAt: string;
  userId: null | string;
}

export interface FamilyInvitation {
  acceptedAt: null | string;
  createdAt: string;
  declinedAt: null | string;
  email: string;
  expiresAt: string;
  familyMemberId: string;
  // Direct mappings from database
  id: string;
  invitedAt: Date;
  invitedBy: string;
  message: null | string;
  // Computed/derived fields
  name: string; // Will need to be fetched from family_members table

  relationship: DbFamilyMember['relationship']; // Will need to be fetched from family_members table
  role: DbFamilyMember['role']; // Will need to be fetched from family_members table
  senderId: string;
  status: DbFamilyInvitation['status'];
  token: string;
}

export interface EmergencyAccessRequest {
  accessDuration: number; // computed from expiry
  accessGrantedUntil: null | string;
  approverName: null | string;
  approverRelation: null | string;
  createdAt: string;
  documentsRequested: string[];
  emergencyLevel: 'critical' | 'high' | 'low' | 'medium';
  expiresAt: string;
  // Direct mappings from database
  id: string;
  ownerId: string;
  reason: string;
  requestedAt: string;

  // Computed/derived fields
  requestedBy: string;
  requesterId: string;
  respondedAt: null | string;
  status: DbEmergencyAccessRequest['status'];
  verificationMethod: 'email' | 'sms' | 'voice_call';
}

// Service layer interfaces for better type safety
export interface CreateFamilyMemberRequest {
  accessLevel?: DbFamilyMember['access_level'];
  address?: FamilyMemberAddress;
  dateOfBirth?: string;
  email: string;
  emergencyContact?: boolean;
  name: string;
  permissions?: FamilyMemberPermissions;
  phone?: string;
  preferences?: FamilyMemberPreferences;
  relationship: DbFamilyMember['relationship'];
  role: DbFamilyMember['role'];
}

export interface UpdateFamilyMemberRequest {
  accessLevel?: DbFamilyMember['access_level'];
  address?: FamilyMemberAddress;
  emergencyContact?: boolean;
  isActive?: boolean;
  name?: string;
  permissions?: FamilyMemberPermissions;
  phone?: string;
  preferences?: FamilyMemberPreferences;
  relationship?: DbFamilyMember['relationship'];
  role?: DbFamilyMember['role'];
}

export interface CreateFamilyInvitationRequest {
  accessLevel?: DbFamilyMember['access_level'];
  address?: FamilyMemberAddress;
  email: string;
  message?: string;
  name: string;
  permissions?: FamilyMemberPermissions;
  phone?: string;
  relationship: DbFamilyMember['relationship'];
  role: DbFamilyMember['role'];
}

// Family statistics and analytics types
export interface FamilyStats {
  activeMembers: number;
  documentsByCategory: Record<string, number>;
  memberContributions: Record<string, number>;
  pendingInvitations: number;
  protectionScore: number;
  recentActivity: FamilyActivity[];
  sharedDocuments: number;
  totalDocuments: number;
  totalMembers: number;
  upcomingEvents: FamilyCalendarEvent[];
}

export interface FamilyProtectionStatus {
  activeMembers: number;
  documentsShared: number;
  emergencyContactsSet: boolean;
  lastUpdated: Date;
  protectionLevel: number; // 0-100 percentage
  recommendations: string[];
  strengths: string[];
  totalMembers: number;
}

export interface FamilyActivity {
  actionType: DbFamilyActivityLog['action_type'];
  actorId: null | string;
  actorName: null | string;
  createdAt: string;
  details: Record<string, any>;
  familyOwnerId: string;
  id: string;
  targetId: null | string;
  targetType: DbFamilyActivityLog['target_type'];
}

export interface FamilyCalendarEvent {
  attendees: Record<string, any>;
  createdAt: string;
  createdBy: string;
  createdById: null | string;
  // Legacy compatibility fields
  date: Date;
  description: null | string;
  durationMinutes: number;
  eventType: DbFamilyCalendarEvent['event_type'];
  familyOwnerId: string;
  id: string;
  isRecurring: boolean;
  location: null | string;
  meetingUrl: null | string;
  metadata: Record<string, any>;
  notifyMembers: string[];
  priority: 'high' | 'low' | 'medium';
  recurrenceEndDate: null | string;
  recurrencePattern: null | string;
  reminders: Record<string, any>;

  scheduledAt: string;
  status: DbFamilyCalendarEvent['status'];
  title: string;
  type:
    | 'anniversary'
    | 'appointment'
    | 'birthday'
    | 'custom'
    | 'document_expiry'
    | 'milestone';
  updatedAt: string;
}

// Type guards for runtime type checking
export function isValidFamilyRole(
  role: string
): role is DbFamilyMember['role'] {
  return [
    'owner',
    'co_owner',
    'collaborator',
    'viewer',
    'emergency_contact',
  ].includes(role);
}

export function isValidRelationship(
  relationship: string
): relationship is DbFamilyMember['relationship'] {
  return [
    'spouse',
    'parent',
    'child',
    'sibling',
    'grandparent',
    'grandchild',
    'aunt_uncle',
    'cousin',
    'friend',
    'professional',
    'other',
  ].includes(relationship);
}

export function isValidAccessLevel(
  level: string
): level is DbFamilyMember['access_level'] {
  return ['view', 'edit', 'admin'].includes(level);
}

// Default permission templates
export const DEFAULT_PERMISSIONS: Record<
  DbFamilyMember['role'],
  FamilyMemberPermissions
> = {
  owner: {
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: true,
    canInviteMembers: true,
    canManageMembers: true,
    canAccessEmergencyInfo: true,
    canViewFinancials: true,
    canReceiveNotifications: true,
    documentCategories: ['all'],
  },
  co_owner: {
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: true,
    canInviteMembers: true,
    canManageMembers: true,
    canAccessEmergencyInfo: true,
    canViewFinancials: true,
    canReceiveNotifications: true,
    documentCategories: ['all'],
  },
  collaborator: {
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: false,
    canInviteMembers: false,
    canManageMembers: false,
    canAccessEmergencyInfo: false,
    canViewFinancials: false,
    canReceiveNotifications: true,
    documentCategories: ['will', 'insurance', 'medical'],
  },
  viewer: {
    canViewDocuments: true,
    canEditDocuments: false,
    canDeleteDocuments: false,
    canInviteMembers: false,
    canManageMembers: false,
    canAccessEmergencyInfo: false,
    canViewFinancials: false,
    canReceiveNotifications: true,
    documentCategories: ['will', 'medical'],
  },
  emergency_contact: {
    canViewDocuments: false,
    canEditDocuments: false,
    canDeleteDocuments: false,
    canInviteMembers: false,
    canManageMembers: false,
    canAccessEmergencyInfo: true,
    canViewFinancials: false,
    canReceiveNotifications: true,
    documentCategories: ['emergency'],
  },
};

// Utility functions for type conversion
export function mapDbFamilyMemberToApplication(
  dbMember: DbFamilyMember,
  familyOwnerId: string
): FamilyMember {
  return {
    // Direct mappings
    id: dbMember.id,
    familyOwnerId: dbMember.family_owner_id,
    userId: dbMember.user_id,
    email: dbMember.email,
    name: dbMember.name,
    role: dbMember.role,
    relationship: dbMember.relationship,
    permissions:
      (dbMember.permissions as unknown as FamilyMemberPermissions) ||
      DEFAULT_PERMISSIONS[dbMember.role],
    isActive: dbMember.is_active,
    phone: dbMember.phone,
    address: dbMember.address as unknown as FamilyMemberAddress,
    dateOfBirth: dbMember.date_of_birth,
    emergencyContact: dbMember.emergency_contact,
    accessLevel: dbMember.access_level,
    preferences:
      (dbMember.preferences as unknown as FamilyMemberPreferences) || {},
    trustedDevices:
      (dbMember.trusted_devices as unknown as TrustedDevice[]) || [],
    emergencyAccessEnabled: dbMember.emergency_access_enabled,
    avatarUrl: dbMember.avatar_url,
    lastActiveAt: dbMember.last_active_at
      ? new Date(dbMember.last_active_at)
      : null,
    createdAt: dbMember.created_at,
    updatedAt: dbMember.updated_at,

    // Computed fields
    status: dbMember.is_active ? 'active' : 'inactive',
    invitedAt: new Date(dbMember.created_at),
    joinedAt: dbMember.last_active_at
      ? new Date(dbMember.last_active_at)
      : undefined,
    invitedBy: familyOwnerId, // The family owner who added them
    emergencyPriority: dbMember.emergency_contact ? 1 : undefined,

    // Legacy compatibility
    avatar: dbMember.avatar_url || undefined,
    notes: undefined, // No notes field in database yet
  };
}

export function mapApplicationToDbFamilyMember(
  familyMember: CreateFamilyMemberRequest,
  familyOwnerId: string
): DbFamilyMemberInsert {
  return {
    family_owner_id: familyOwnerId,
    email: familyMember.email,
    name: familyMember.name,
    role: familyMember.role,
    relationship: familyMember.relationship,
    permissions: (familyMember.permissions ||
      DEFAULT_PERMISSIONS[familyMember.role]) as unknown as Json,
    phone: familyMember.phone || null,
    address: (familyMember.address || null) as unknown as Json,
    date_of_birth: familyMember.dateOfBirth || null,
    emergency_contact: familyMember.emergencyContact || false,
    access_level: familyMember.accessLevel || 'view',
    preferences: (familyMember.preferences || {}) as unknown as Json,
    is_active: true,
    emergency_access_enabled: false,
    trusted_devices: [],
  };
}
