/**
 * Family Types and Interfaces
 * Core type definitions for family viral growth and gamification system
 */

// Family Roles
export type FamilyRole = 'collaborator' | 'viewer' | 'emergency_contact' | 'admin';

// Relationship Types
export type RelationshipType = 
  | 'spouse' 
  | 'partner'
  | 'child' 
  | 'parent' 
  | 'sibling' 
  | 'grandparent' 
  | 'grandchild' 
  | 'aunt_uncle' 
  | 'cousin' 
  | 'friend' 
  | 'professional' 
  | 'other';

// Relationship Labels
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
  friend: 'Friend',
  professional: 'Professional',
  other: 'Other',
};

// Family Member Interface
export interface FamilyMember {
  id: string;
  familyOwnerId: string;
  userId: string | null;
  name: string;
  email: string;
  role: FamilyRole;
  relationship: RelationshipType;
  status: 'active' | 'pending' | 'inactive';
  permissions: Record<string, boolean>;
  phone?: string;
  address?: any;
  emergencyContact: boolean;
  emergencyPriority?: number;
  accessLevel?: string;
  lastActiveAt?: string;
  joinedAt: Date;
  invitedAt: Date;
  invitedBy: string;
  preferences: Record<string, any>;
}

// Family Invitation Interface
export interface FamilyInvitation {
  id: string;
  senderId: string;
  familyMemberId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  createdAt: string;
  
  // Computed fields
  name: string;
  role: FamilyRole;
  relationship: RelationshipType;
  invitedAt: Date;
  invitedBy: string;
}

// Family Plans
export interface FamilyPlan {
  type: 'free' | 'family' | 'premium';
  maxMembers: number; // -1 for unlimited
  pricing: {
    monthly: number;
    yearly: number;
  };
  features: {
    unlimitedDocuments: boolean;
    professionalReviews: boolean;
    emergencyAccess: boolean;
    familyCalendar: boolean;
    advancedSharing: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  trialDays?: number;
}

export const FAMILY_PLANS: Record<'free' | 'family' | 'premium', FamilyPlan> = {
  free: {
    type: 'free',
    maxMembers: 2,
    pricing: { monthly: 0, yearly: 0 },
    features: {
      unlimitedDocuments: false,
      professionalReviews: false,
      emergencyAccess: true,
      familyCalendar: false,
      advancedSharing: false,
      prioritySupport: false,
      customBranding: false,
    },
  },
  family: {
    type: 'family',
    maxMembers: 8,
    pricing: { monthly: 19, yearly: 190 },
    features: {
      unlimitedDocuments: true,
      professionalReviews: true,
      emergencyAccess: true,
      familyCalendar: true,
      advancedSharing: true,
      prioritySupport: false,
      customBranding: false,
    },
    trialDays: 14,
  },
  premium: {
    type: 'premium',
    maxMembers: -1, // unlimited
    pricing: { monthly: 49, yearly: 490 },
    features: {
      unlimitedDocuments: true,
      professionalReviews: true,
      emergencyAccess: true,
      familyCalendar: true,
      advancedSharing: true,
      prioritySupport: true,
      customBranding: true,
    },
    trialDays: 30,
  },
};

// Family Statistics
export interface FamilyStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalDocuments: number;
  sharedDocuments: number;
  memberContributions: Record<string, number>;
  documentsByCategory: Record<string, number>;
  recentActivity: FamilyActivity[];
  upcomingEvents: FamilyCalendarEvent[];
  protectionScore: number;
}

// Family Protection Status
export interface FamilyProtectionStatus {
  totalMembers: number;
  activeMembers: number;
  protectionLevel: number;
  documentsShared: number;
  emergencyContactsSet: boolean;
  lastUpdated: Date;
  strengths: string[];
  recommendations: string[];
}

// Family Activity
export interface FamilyActivity {
  id: string;
  familyOwnerId: string;
  actorId: string;
  actorName: string;
  actionType: 'member_added' | 'member_updated' | 'member_removed' | 'invitation_accepted' | 'emergency_access_requested';
  targetType: 'family_member' | 'invitation' | 'emergency_request';
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

// Emergency Access Request
export interface EmergencyAccessRequest {
  id: string;
  requesterId: string;
  ownerId: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedAt: string;
  expiresAt: string;
  respondedAt?: string;
  approverName?: string;
  approverRelation?: string;
  accessGrantedUntil?: string;
  createdAt: string;
  
  // Computed fields
  requestedBy: string;
  documentsRequested: string[];
  accessDuration: number;
  verificationMethod: string;
  emergencyLevel: 'low' | 'medium' | 'high';
}

// Family Calendar Event
export interface FamilyCalendarEvent {
  id: string;
  familyOwnerId: string;
  title: string;
  description?: string;
  eventType: 'meeting' | 'reminder' | 'deadline' | 'celebration' | 'review';
  scheduledAt: string;
  durationMinutes: number;
  location?: string;
  meetingUrl?: string;
  attendees: any;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reminders: any;
  metadata: any;
  createdAt: string;
  
  // Computed fields
  createdBy: string;
  date: Date;
  notifyMembers: string[];
  priority: 'low' | 'medium' | 'high';
}

// Will Data Interface (placeholder)
export interface WillData {
  testatorInfo?: {
    fullName: string;
  };
  beneficiaries?: any[];
  executors?: any[];
  assets?: Record<string, any>;
  witnesses?: any[];
  specialProvisions?: any[];
}

// Document Interface (placeholder)
export interface Document {
  id: string;
  category?: string;
  description?: string;
  file_size?: number;
}