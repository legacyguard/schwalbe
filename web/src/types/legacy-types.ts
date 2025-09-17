// Legacy types for backward compatibility
// This file provides backward compatibility for old type definitions

import type { LegacyItem } from './database';
import type { Json } from './supabase';

// Backward compatibility types
export interface Will {
  content: string;
  createdAt: string;
  id: string;
  metadata?: Json;
  status: 'archived' | 'completed' | 'draft' | 'pending';
  title: string;
  updatedAt: string;
  userId: string;
}

export interface Trust {
  assets: Json;
  beneficiaries: Json;
  createdAt: string;
  id: string;
  metadata?: Json;
  name: string;
  status: 'archived' | 'completed' | 'draft' | 'pending';
  type: string;
  updatedAt: string;
  userId: string;
}

export interface DocumentForAnalysis {
  category: string;
  content: string;
  createdAt: string;
  id: string;
  metadata?: Json;
  name: string;
  status: string;
  type: string;
  updatedAt: string;
  userId: string;
}

export interface QuickInsight {
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  completed: boolean;
  createdAt: string;
  description: string;
  documentId: null | string;
  familyImpact?: {
    affectedMembers: string[];
    emotionalBenefit: string;
    riskReduction: number;
  };
  id: string;
  impact: string;
  metadata?: {
    calculatedAt: string;
    category: string;
    confidence: number;
    expiresAt?: string;
    tags: string[];
  };
  priority: 'high' | 'low' | 'medium' | 'urgent';
  title: string;
  type: 'completion_gap' | 'document_analysis' | 'family_impact' | 'protection_level' | 'time_saved' | 'urgent_action';
  updatedAt: string;
  userId: string;
}

export interface LegacyMilestone {
  category: 'family' | 'foundation' | 'maintenance' | 'mastery' | 'professional' | 'protection';
  celebration: {
    color: string;
    emotionalFraming: string;
    message: string;
  };
  createdAt: string;
  criteria: {
    currentValue: number;
    threshold: number;
    type: string;
  };
  description: string;
  id: string;
  progress: number;
  status: 'completed' | 'failed' | 'in_progress' | 'not_started';
  title: string;
  updatedAt: string;
  userId: string;
}

export interface ProfessionalReviewer {
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  createdAt: string;
  credentials: string;
  email: string;
  hourlyRate: number;
  id: string;
  jurisdiction: string;
  name: string;
  profile: {
    bio: string;
    photoUrl?: string;
    verified: boolean;
  };
  rating: number;
  reviewsCompleted: number;
  specializations: string[];
  updatedAt: string;
}

export interface ReviewRequest {
  createdAt: string;
  documentId: string;
  dueDate?: string;
  estimatedCost: number;
  id: string;
  notes?: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  professionalId: string;
  reviewType: 'basic' | 'certified' | 'comprehensive';
  status: 'cancelled' | 'completed' | 'in_progress' | 'pending';
  updatedAt: string;
  userId: string;
}

export interface DocumentReview {
  completionDate?: string;
  complianceScore: number;
  createdAt: string;
  documentId: string;
  estimatedCost: number;
  findings: Json;
  id: string;
  professionalId: string;
  recommendations: Json;
  reviewDate: string;
  reviewType: 'basic' | 'certified' | 'comprehensive';
  score: number;
  updatedAt: string;
  urgencyLevel: 'high' | 'low' | 'medium' | 'urgent';
  userId: string;
}

export interface Consultation {
  consultationNotes?: string;
  consultationType: 'document_review' | 'estate_planning' | 'family_planning' | 'initial_consultation';
  cost: number;
  createdAt: string;
  durationMinutes: number;
  id: string;
  professionalId: string;
  status: 'cancelled' | 'completed' | 'in_progress' | 'scheduled';
  updatedAt: string;
  userId: string;
}

export interface FamilyMember {
  age: number;
  contactInfo: Json;
  createdAt: string;
  id: string;
  name: string;
  relationship: string;
  role: string;
  updatedAt: string;
  userId: string;
}

export interface ReviewFinding {
  description: string;
  id: string;
  location?: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  type: string;
}

export interface ReviewRecommendation {
  action: string;
  deadline?: string;
  estimatedCost?: number;
  id: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  type: string;
}

// Type conversion utilities
export function legacyItemToWill(item: LegacyItem): Will {
  return {
    id: item.id,
    userId: item.user_id,
    title: item.title,
    content: item.description || '',
    status: item.status as any,
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || new Date().toISOString(),
    metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : undefined
  };
}

export function willToLegacyItem(will: Will): LegacyItem {
  return {
    id: will.id,
    user_id: will.userId,
    title: will.title,
    description: will.content,
    category: 'will',
    status: will.status,
    created_at: will.createdAt,
    updated_at: will.updatedAt,
    metadata: will.metadata ? JSON.stringify(will.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

export function legacyItemToTrust(item: LegacyItem): Trust {
  const metadata = item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : {};
  return {
    id: item.id,
    userId: item.user_id,
    name: item.title,
    type: metadata.type || 'revocable',
    beneficiaries: metadata.beneficiaries || [],
    assets: metadata.assets || [],
    status: item.status as any,
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || new Date().toISOString(),
    metadata
  };
}

export function trustToLegacyItem(trust: Trust): LegacyItem {
  return {
    id: trust.id,
    user_id: trust.userId,
    title: trust.name,
    description: JSON.stringify({
      type: trust.type,
      beneficiaries: trust.beneficiaries,
      assets: trust.assets
    }),
    category: 'trust',
    status: trust.status,
    created_at: trust.createdAt,
    updated_at: trust.updatedAt,
    metadata: trust.metadata ? JSON.stringify(trust.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

// Document conversion utilities
export function legacyItemToDocumentForAnalysis(item: LegacyItem): DocumentForAnalysis {
  const metadata = item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : {};
  return {
    id: item.id,
    name: item.title,
    type: item.category,
    category: item.category,
    status: item.status,
    content: item.description || '',
    metadata,
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || new Date().toISOString(),
    userId: item.user_id
  };
}

export function documentForAnalysisToLegacyItem(doc: DocumentForAnalysis): LegacyItem {
  return {
    id: doc.id,
    user_id: doc.userId,
    title: doc.name,
    description: doc.content,
    category: doc.category,
    status: doc.status,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
    priority: 'medium',
    tags: [],
    file_urls: [],
    is_public: false,
    due_date: null
  };
}

// Safe JSON utilities
export function safeJsonParse<T>(json: null | string | undefined): null | T {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function safeJsonStringify(obj: any): null | string {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

// Safe date utilities
export function safeDateParse(date: null | string | undefined): Date | null {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForDatabase(date: Date): string {
  return date.toISOString();
}

// Type guards
export function isValidLegacyItemCategory(category: string): boolean {
  const validCategories = [
    'will', 'trust', 'power_of_attorney', 'healthcare_directive',
    'insurance', 'financial', 'property', 'business', 'digital',
    'personal', 'other'
  ];
  return validCategories.includes(category);
}

export function isValidLegacyItemStatus(status: string): boolean {
  const validStatuses = ['draft', 'pending', 'completed', 'archived'];
  return validStatuses.includes(status);
}

export function isValidLegacyItemPriority(priority: string): boolean {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  return validPriorities.includes(priority);
}

// Export all utilities
export const LegacyTypes = {
  legacyItemToWill,
  willToLegacyItem,
  legacyItemToTrust,
  trustToLegacyItem,
  legacyItemToDocumentForAnalysis,
  documentForAnalysisToLegacyItem,
  safeJsonParse,
  safeJsonStringify,
  safeDateParse,
  formatDateForDatabase,
  isValidLegacyItemCategory,
  isValidLegacyItemStatus,
  isValidLegacyItemPriority
};

export default LegacyTypes;
