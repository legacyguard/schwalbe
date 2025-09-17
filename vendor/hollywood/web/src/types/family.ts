
/**
 * Family Collaboration System Types
 * Comprehensive types for family member management and collaboration
 */

export type FamilyRole =
  | 'co_owner'
  | 'collaborator'
  | 'emergency_contact'
  | 'owner'
  | 'viewer';

export type FamilyMemberStatus =
  | 'active'
  | 'inactive'
  | 'invited'
  | 'pending'
  | 'pending_verification';

export type RelationshipType =
  | 'aunt_uncle'
  | 'child'
  | 'cousin'
  | 'friend'
  | 'grandchild'
  | 'grandparent'
  | 'other'
  | 'parent'
  | 'partner'
  | 'professional'
  | 'sibling'
  | 'spouse';

export interface FamilyMember {
  address?: null | {
    city: string;
    country: string;
    postalCode: string;
    state?: string;
    street: string;
  };
  avatar?: string;
  email: string;
  emergencyPriority?: number; // For emergency contacts (1 = highest priority)
  id: string;
  invitedAt: Date;
  invitedBy: string; // User ID who sent the invitation
  joinedAt?: Date;
  lastActiveAt?: Date;
  name: string;
  notes?: string;
  permissions: FamilyPermissions;
  phone?: null | string;
  relationship: RelationshipType;
  role: FamilyRole;
  status: FamilyMemberStatus;
}

export interface FamilyPermissions {
  canAccessEmergencyInfo: boolean;
  canDeleteDocuments: boolean;
  canEditDocuments: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canReceiveNotifications: boolean;
  canViewDocuments: boolean;
  canViewFinancials: boolean;
  documentCategories: string[]; // Which document types they can access
}

export interface FamilyInvitation {
  acceptedAt: null | string;
  declinedAt?: null | string;
  email: string;
  expiresAt: string;
  familyMemberId: string;
  id: string;
  invitedAt?: Date;
  invitedBy?: string;
  message: null | string;
  name?: string;
  relationship: RelationshipType;
  role: FamilyRole;
  senderId: string;
  status: 'accepted' | 'declined' | 'expired' | 'pending';
  token: string;
}

export interface FamilyCalendarEvent {
  createdBy: string;
  date: Date;
  description?: string;
  id: string;
  notifyMembers: string[]; // Array of member IDs to notify
  priority: 'high' | 'low' | 'medium';
  recurring?: {
    endDate?: Date;
    frequency: 'monthly' | 'weekly' | 'yearly';
  };
  relatedDocumentId?: string;
  relatedMemberId?: string;
  title: string;
  type:
    | 'anniversary'
    | 'appointment'
    | 'birthday'
    | 'custom'
    | 'document_expiry'
    | 'milestone';
}

export interface FamilyTimeline {
  affectedMembers: string[]; // Array of member IDs
  date: Date;
  description: string;
  id: string;
  initiatedBy: string; // Member ID
  metadata?: Record<string, any>;
  relatedDocumentId?: string;
  relatedEventId?: string;
  title: string;
  type:
    | 'calendar_event'
    | 'document_added'
    | 'document_shared'
    | 'emergency_access'
    | 'member_joined'
    | 'milestone_reached';
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
  actionType: string;
  actorId: null | string;
  actorName: null | string;
  createdAt: string;
  details: Record<string, any>;
  familyOwnerId: string;
  id: string;
  targetId: null | string;
  targetType: null | string;
}

export interface FamilyStats {
  activeMembers: number;
  documentsByCategory: Record<string, number>;
  memberContributions: Record<string, number>; // Member ID -> document count
  pendingInvitations: number;
  protectionScore: number;
  recentActivity: FamilyActivity[];
  sharedDocuments: number;
  totalDocuments: number;
  totalMembers: number;
  upcomingEvents: FamilyCalendarEvent[];
}

export interface FamilyNotificationSettings {
  emailNotifications: boolean;
  notificationTypes: {
    calendarReminders: boolean;
    documentUpdates: boolean;
    emergencyAlerts: boolean;
    memberActivity: boolean;
    milestoneAchievements: boolean;
    newDocuments: boolean;
  };
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    endTime: string; // "07:00"
    startTime: string; // "22:00"
  };
  smsNotifications: boolean;
}

export interface EmergencyAccessRequest {
  accessDuration: number; // in hours
  approvedAt?: Date;
  approvedBy?: string;
  documentsRequested: string[];
  emergencyLevel: 'critical' | 'high' | 'low' | 'medium';
  expiresAt: Date;
  id: string;
  reason: string;
  requestedAt: Date;
  requestedBy: string; // Member ID
  status: 'approved' | 'denied' | 'expired' | 'pending';
  verificationMethod: 'email' | 'sms' | 'voice_call';
}

export interface FamilyPlan {
  features: {
    advancedSharing: boolean;
    customBranding: boolean;
    emergencyAccess: boolean;
    familyCalendar: boolean;
    prioritySupport: boolean;
    professionalReviews: boolean;
    unlimitedDocuments: boolean;
  };
  maxMembers: number;
  pricing: {
    monthly: number;
    yearly: number;
  };
  trialDays?: number;
  type: 'family' | 'free' | 'premium';
}

export interface FamilyMemberActivity {
  action: string;
  details: string;
  id: string;
  ipAddress?: string;
  memberId: string;
  timestamp: Date;
  userAgent?: string;
}

// Helper functions and constants
export const FAMILY_ROLE_PERMISSIONS: Record<FamilyRole, FamilyPermissions> = {
  owner: {
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: true,
    canInviteMembers: true,
    canManageMembers: true,
    canAccessEmergencyInfo: true,
    canViewFinancials: true,
    canReceiveNotifications: true,
    documentCategories: ['*'], // All categories
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
    documentCategories: ['*'], // All categories
  },
  collaborator: {
    canViewDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: false,
    canInviteMembers: true,
    canManageMembers: false,
    canAccessEmergencyInfo: true,
    canViewFinancials: true,
    canReceiveNotifications: true,
    documentCategories: [
      'will',
      'trust',
      'insurance',
      'medical',
      'identification',
    ],
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
    documentCategories: ['will', 'trust', 'medical'],
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
    documentCategories: ['medical', 'emergency'],
  },
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  spouse: 'Spouse',
  partner: 'Partner',
  child: 'Child',
  parent: 'Parent',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  grandchild: 'Grandchild',
  aunt_uncle: 'Aunt/Uncle',
  cousin: 'Cousin',
  friend: 'Trusted Friend',
  professional: 'Professional',
  other: 'Other',
};

export const FAMILY_PLANS: Record<string, FamilyPlan> = {
  free: {
    type: 'free',
    maxMembers: 2,
    features: {
      unlimitedDocuments: false,
      professionalReviews: false,
      emergencyAccess: true,
      familyCalendar: false,
      advancedSharing: false,
      prioritySupport: false,
      customBranding: false,
    },
    pricing: { monthly: 0, yearly: 0 },
  },
  family: {
    type: 'family',
    maxMembers: 8,
    features: {
      unlimitedDocuments: true,
      professionalReviews: true,
      emergencyAccess: true,
      familyCalendar: true,
      advancedSharing: true,
      prioritySupport: false,
      customBranding: false,
    },
    pricing: { monthly: 19.99, yearly: 199.99 },
    trialDays: 14,
  },
  premium: {
    type: 'premium',
    maxMembers: -1, // Unlimited
    features: {
      unlimitedDocuments: true,
      professionalReviews: true,
      emergencyAccess: true,
      familyCalendar: true,
      advancedSharing: true,
      prioritySupport: true,
      customBranding: true,
    },
    pricing: { monthly: 39.99, yearly: 399.99 },
    trialDays: 30,
  },
};
