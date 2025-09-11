/**
 * Family Service Contract
 * Defines the interface for family member management operations
 */

export interface FamilyServiceContract {
  // Core family member operations
  getFamilyMembers(ownerId: string): Promise<FamilyMember[]>;
  addFamilyMember(ownerId: string, memberData: FamilyMemberInput): Promise<FamilyMember>;
  updateFamilyMember(memberId: string, updates: FamilyMemberUpdate): Promise<FamilyMember>;
  removeFamilyMember(memberId: string): Promise<void>;

  // Family statistics and analytics
  getFamilyStats(ownerId: string): Promise<FamilyStats>;
  getFamilyProtectionStatus(ownerId: string): Promise<FamilyProtectionStatus>;
  calculateFamilyProtectionScore(members: FamilyMember[], documents: Document[]): Promise<number>;

  // Family relationships and hierarchy
  getFamilyTree(ownerId: string): Promise<FamilyTree>;
  addFamilyRelationship(parentId: string, childId: string, relationship: RelationshipType): Promise<FamilyRelationship>;
  updateFamilyRelationship(relationshipId: string, updates: RelationshipUpdate): Promise<FamilyRelationship>;
  removeFamilyRelationship(relationshipId: string): Promise<void>;

  // Bulk operations
  bulkUpdateFamilyMembers(memberIds: string[], updates: BulkMemberUpdate): Promise<FamilyMember[]>;
  exportFamilyData(ownerId: string, format: ExportFormat): Promise<ExportedFamilyData>;
  importFamilyData(ownerId: string, data: FamilyImportData): Promise<ImportResult>;
}

// Data structures
export interface FamilyMember {
  id: string;
  familyOwnerId: string;
  userId: string | null;
  name: string;
  email: string;
  role: FamilyRole;
  relationship: RelationshipType;
  status: MemberStatus;
  permissions: PermissionSet;
  phone?: string;
  address?: Address;
  emergencyContact: boolean;
  emergencyPriority?: number;
  accessLevel?: AccessLevel;
  lastActiveAt?: Date;
  joinedAt: Date;
  invitedAt: Date;
  invitedBy: string;
  preferences: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface FamilyMemberInput {
  name: string;
  email: string;
  role: FamilyRole;
  relationship: RelationshipType;
  message?: string;
  permissions?: Partial<PermissionSet>;
  phone?: string;
  address?: Address;
  emergencyContact?: boolean;
  emergencyPriority?: number;
  preferences?: Record<string, any>;
}

export interface FamilyMemberUpdate {
  name?: string;
  role?: FamilyRole;
  relationship?: RelationshipType;
  permissions?: Partial<PermissionSet>;
  phone?: string;
  address?: Address;
  emergencyContact?: boolean;
  emergencyPriority?: number;
  preferences?: Record<string, any>;
  status?: MemberStatus;
}

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
  familyHealthScore: number;
  lastUpdated: Date;
}

export interface FamilyProtectionStatus {
  totalMembers: number;
  activeMembers: number;
  protectionLevel: ProtectionLevel;
  protectionScore: number;
  documentsShared: number;
  emergencyContactsSet: boolean;
  lastUpdated: Date;
  strengths: string[];
  recommendations: string[];
  riskFactors: string[];
  improvementActions: ProtectionAction[];
}

export interface FamilyTree {
  owner: FamilyMember;
  members: FamilyMember[];
  relationships: FamilyRelationship[];
  hierarchy: FamilyHierarchyNode[];
  stats: FamilyTreeStats;
}

export interface FamilyRelationship {
  id: string;
  parentMemberId: string;
  childMemberId: string;
  relationshipType: RelationshipType;
  isPrimary: boolean;
  relationshipStrength?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyHierarchyNode {
  member: FamilyMember;
  children: FamilyHierarchyNode[];
  level: number;
  relationshipToOwner: RelationshipType;
}

export interface FamilyTreeStats {
  totalGenerations: number;
  maxDepth: number;
  branchCount: number;
  orphanedMembers: number;
  relationshipCompleteness: number;
}

export interface RelationshipUpdate {
  relationshipType?: RelationshipType;
  isPrimary?: boolean;
  relationshipStrength?: number;
  notes?: string;
}

export interface BulkMemberUpdate {
  role?: FamilyRole;
  permissions?: Partial<PermissionSet>;
  emergencyContact?: boolean;
  status?: MemberStatus;
}

export interface ExportedFamilyData {
  members: FamilyMember[];
  relationships: FamilyRelationship[];
  invitations: FamilyInvitation[];
  stats: FamilyStats;
  exportDate: Date;
  format: ExportFormat;
  checksum: string;
}

export interface FamilyImportData {
  members: Omit<FamilyMember, 'id' | 'familyOwnerId' | 'createdAt' | 'updatedAt'>[];
  relationships: Omit<FamilyRelationship, 'id' | 'createdAt' | 'updatedAt'>[];
  format: ImportFormat;
}

export interface ImportResult {
  success: boolean;
  importedMembers: number;
  importedRelationships: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

// Supporting types
export type FamilyRole = 'admin' | 'collaborator' | 'viewer' | 'emergency_contact';

export type RelationshipType =
  | 'spouse' | 'partner' | 'child' | 'parent' | 'sibling'
  | 'grandparent' | 'grandchild' | 'aunt_uncle' | 'cousin'
  | 'friend' | 'professional' | 'other';

export type MemberStatus = 'active' | 'pending' | 'inactive' | 'suspended';

export type ProtectionLevel = 'basic' | 'standard' | 'premium' | 'comprehensive';

export type AccessLevel = 'read' | 'write' | 'admin';

export type ExportFormat = 'json' | 'csv' | 'pdf';

export type ImportFormat = 'json' | 'csv';

export interface PermissionSet {
  view_documents: boolean;
  edit_documents: boolean;
  delete_documents: boolean;
  share_documents: boolean;
  view_will: boolean;
  edit_will: boolean;
  manage_family: boolean;
  emergency_access: boolean;
  view_activity_log: boolean;
  manage_permissions: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ProtectionAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'organization' | 'communication' | 'legal';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
}

export interface FamilyActivity {
  id: string;
  familyOwnerId: string;
  actorId: string;
  actorName: string;
  actionType: ActivityActionType;
  targetType: ActivityTargetType;
  targetId: string;
  details: Record<string, any>;
  createdAt: Date;
}

export interface FamilyCalendarEvent {
  id: string;
  familyOwnerId: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  scheduledAt: Date;
  durationMinutes: number;
  location?: string;
  meetingUrl?: string;
  attendees: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  status: EventStatus;
  reminders: EventReminder[];
  metadata: Record<string, any>;
  createdAt: Date;
  createdBy: string;
}

export type ActivityActionType =
  | 'member_added' | 'member_updated' | 'member_removed' | 'member_activated'
  | 'invitation_sent' | 'invitation_accepted' | 'invitation_declined' | 'invitation_expired'
  | 'relationship_added' | 'relationship_updated' | 'relationship_removed'
  | 'permission_changed' | 'document_shared' | 'document_accessed'
  | 'emergency_access_requested' | 'emergency_access_granted' | 'emergency_access_revoked';

export type ActivityTargetType =
  | 'family_member' | 'invitation' | 'relationship' | 'permission' | 'document'
  | 'emergency_request' | 'calendar_event';

export type CalendarEventType =
  | 'meeting' | 'reminder' | 'deadline' | 'celebration' | 'review' | 'other';

export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'postponed';

export interface EventReminder {
  id: string;
  type: 'email' | 'sms' | 'push';
  minutesBefore: number;
  sent: boolean;
  sentAt?: Date;
}

export interface ImportError {
  type: 'validation' | 'duplicate' | 'missing_reference' | 'permission_denied';
  message: string;
  data?: any;
  lineNumber?: number;
}

export interface ImportWarning {
  type: 'data_truncation' | 'relationship_conflict' | 'permission_override';
  message: string;
  data?: any;
  lineNumber?: number;
}

// Type guards and validation helpers
export const isValidFamilyRole = (role: string): role is FamilyRole => {
  return ['admin', 'collaborator', 'viewer', 'emergency_contact'].includes(role);
};

export const isValidRelationshipType = (relationship: string): relationship is RelationshipType => {
  return ['spouse', 'partner', 'child', 'parent', 'sibling', 'grandparent',
          'grandchild', 'aunt_uncle', 'cousin', 'friend', 'professional', 'other'].includes(relationship);
};

export const isValidMemberStatus = (status: string): status is MemberStatus => {
  return ['active', 'pending', 'inactive', 'suspended'].includes(status);
};

export const isValidProtectionLevel = (level: string): level is ProtectionLevel => {
  return ['basic', 'standard', 'premium', 'comprehensive'].includes(level);
};

// Contract implementation requirements
export interface FamilyServiceImplementation extends FamilyServiceContract {
  // Health check methods
  getHealthStatus(): Promise<ServiceHealth>;

  // Cache management
  invalidateCache(ownerId: string): Promise<void>;
  refreshCache(ownerId: string): Promise<void>;

  // Background job management
  queueProtectionCalculation(ownerId: string): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatus>;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration: number;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Forward declarations for related contracts
export interface FamilyInvitation {
  id: string;
  senderId: string;
  familyMemberId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  createdAt: string;
  name: string;
  role: FamilyRole;
  relationship: RelationshipType;
  invitedAt: Date;
  invitedBy: string;
}

export interface Document {
  id: string;
  category?: string;
  description?: string;
  file_size?: number;
  created_at?: string;
}