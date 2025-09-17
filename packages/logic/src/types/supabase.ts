// Supabase types for LegacyGuard - copied from main project types
export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };

// Main database interface structure
export interface Database {
  public: {
    Tables: {
      documents: {
        Insert: {
          category?: null | string;
          classification_confidence?: null | number;
          completion_percentage?: null | number;
          created_at?: string;
          description?: null | string;
          document_type?: string;
          encrypted_at?: null | string;
          expires_at?: null | string;
          extracted_entities?: Json | null;
          extracted_metadata?: Json | null;
          file_name: string;
          file_path: string;
          file_size?: null | number;
          file_type?: null | string;
          id?: string;
          is_important?: boolean;
          last_notification_sent_at?: null | string;
          ocr_confidence?: null | number;
          ocr_text?: null | string;
          processing_status?:
            | 'completed'
            | 'failed'
            | 'manual'
            | 'pending'
            | 'processing';
          professional_review_date?: null | string;
          professional_review_score?: null | number;
          professional_review_status?:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'none'
            | 'requested'
            | null;
          professional_reviewer_id?: null | string;
          review_findings?: Json | null;
          review_recommendations?: Json | null;
          tags?: null | string[];
          title?: null | string;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          // OCR and AI fields
          category: null | string;
          classification_confidence: null | number;
          completion_percentage: null | number;
          created_at: string;
          description: null | string;
          document_type: string;
          encrypted_at: null | string;
          expires_at: null | string;
          extracted_entities: Json | null;
          extracted_metadata: Json | null;
          file_name: string;
          file_path: string;
          file_size: null | number;
          file_type: null | string;
          id: string;
          is_important: boolean;
          last_notification_sent_at: null | string;
          ocr_confidence: null | number;
          ocr_text: null | string;
          processing_status:
            | 'completed'
            | 'failed'
            | 'manual'
            | 'pending'
            | 'processing';
          professional_review_date: null | string;
          professional_review_score: null | number;
          // Professional review fields
          professional_review_status:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'none'
            | 'requested'
            | null;
          professional_reviewer_id: null | string;
          review_findings: Json | null;
          review_recommendations: Json | null;
          tags: null | string[];
          title: null | string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?: null | string;
          classification_confidence?: null | number;
          completion_percentage?: null | number;
          created_at?: string;
          description?: null | string;
          document_type?: string;
          encrypted_at?: null | string;
          expires_at?: null | string;
          extracted_entities?: Json | null;
          extracted_metadata?: Json | null;
          file_name?: string;
          file_path?: string;
          file_size?: null | number;
          file_type?: null | string;
          id?: string;
          is_important?: boolean;
          last_notification_sent_at?: null | string;
          ocr_confidence?: null | number;
          ocr_text?: null | string;
          processing_status?:
            | 'completed'
            | 'failed'
            | 'manual'
            | 'pending'
            | 'processing';
          professional_review_date?: null | string;
          professional_review_score?: null | number;
          professional_review_status?:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'none'
            | 'requested'
            | null;
          professional_reviewer_id?: null | string;
          review_findings?: Json | null;
          review_recommendations?: Json | null;
          tags?: null | string[];
          title?: null | string;
          updated_at?: string;
          user_id?: string;
        };
      };
      guardians: {
        Insert: {
          created_at?: string;
          email: string;
          emergency_contact_priority?: null | number;
          id?: string;
          is_active?: boolean;
          memorial_message?: null | string;
          name: string;
          notes?: null | string;
          phone?: null | string;
          relationship?: null | string;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          created_at: string;
          email: string;
          emergency_contact_priority?: null | number;
          id: string;
          is_active: boolean;
          memorial_message?: null | string;
          name: string;
          notes: null | string;
          phone: null | string;
          relationship: null | string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          emergency_contact_priority?: null | number;
          id?: string;
          is_active?: boolean;
          memorial_message?: null | string;
          name?: string;
          notes?: null | string;
          phone?: null | string;
          relationship?: null | string;
          updated_at?: string;
          user_id?: string;
        };
      };
      legacy_items: {
        Insert: {
          category: 'asset' | 'document' | 'instruction' | 'memory' | 'wish';
          created_at?: string;
          description?: null | string;
          due_date?: null | string;
          file_urls?: null | string[];
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          status?: 'archived' | 'completed' | 'draft' | 'in_progress';
          tags?: null | string[];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          category: 'asset' | 'document' | 'instruction' | 'memory' | 'wish';
          created_at: string;
          description: null | string;
          due_date: null | string;
          file_urls: null | string[];
          id: string;
          is_public: boolean;
          metadata: Json | null;
          priority: 'high' | 'low' | 'medium' | 'urgent';
          status: 'archived' | 'completed' | 'draft' | 'in_progress';
          tags: null | string[];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?: 'asset' | 'document' | 'instruction' | 'memory' | 'wish';
          created_at?: string;
          description?: null | string;
          due_date?: null | string;
          file_urls?: null | string[];
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          status?: 'archived' | 'completed' | 'draft' | 'in_progress';
          tags?: null | string[];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      legacy_milestones: {
        Insert: {
          category: string;
          completed_at?: null | string;
          completion_percentage?: number;
          created_at?: string;
          criteria_completed?: number;
          criteria_is_complete?: boolean;
          criteria_total: number;
          description: string;
          due_date?: null | string;
          estimated_time_minutes?: null | number;
          id?: string;
          milestone_type:
            | 'asset_inventory'
            | 'digital_estate'
            | 'document_review'
            | 'emergency_contacts'
            | 'essential_documents'
            | 'financial_planning'
            | 'guardian_setup'
            | 'healthcare_directives'
            | 'legacy_messages'
            | 'will_creation';
          next_steps?: null | string[];
          priority?: 'critical' | 'high' | 'low' | 'medium';
          related_documents?: null | string[];
          reward_points?: null | number;
          title: string;
          unlock_criteria?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Row: {
          category: string;
          completed_at: null | string;
          completion_percentage: number;
          created_at: string;
          criteria_completed: number;
          criteria_is_complete: boolean;
          criteria_total: number;
          description: string;
          due_date: null | string;
          estimated_time_minutes: null | number;
          id: string;
          milestone_type:
            | 'asset_inventory'
            | 'digital_estate'
            | 'document_review'
            | 'emergency_contacts'
            | 'essential_documents'
            | 'financial_planning'
            | 'guardian_setup'
            | 'healthcare_directives'
            | 'legacy_messages'
            | 'will_creation';
          next_steps: null | string[];
          priority: 'critical' | 'high' | 'low' | 'medium';
          related_documents: null | string[];
          reward_points: null | number;
          title: string;
          unlock_criteria: Json | null;
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?: string;
          completed_at?: null | string;
          completion_percentage?: number;
          created_at?: string;
          criteria_completed?: number;
          criteria_is_complete?: boolean;
          criteria_total?: number;
          description?: string;
          due_date?: null | string;
          estimated_time_minutes?: null | number;
          id?: string;
          milestone_type?:
            | 'asset_inventory'
            | 'digital_estate'
            | 'document_review'
            | 'emergency_contacts'
            | 'essential_documents'
            | 'financial_planning'
            | 'guardian_setup'
            | 'healthcare_directives'
            | 'legacy_messages'
            | 'will_creation';
          next_steps?: null | string[];
          priority?: 'critical' | 'high' | 'low' | 'medium';
          related_documents?: null | string[];
          reward_points?: null | number;
          title?: string;
          unlock_criteria?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Insert: {
          avatar_url?: null | string;
          created_at?: string;
          date_of_birth?: null | string;
          email?: null | string;
          emergency_contacts?: Json | null;
          full_name?: null | string;
          id: string;
          memorial_message?: null | string;
          phone?: null | string;
          preferences?: Json | null;
          updated_at?: string;
          user_id?: null | string;
        };
        Row: {
          avatar_url: null | string;
          created_at: string;
          date_of_birth: null | string;
          email: null | string;
          emergency_contacts: Json | null;
          full_name: null | string;
          id: string;
          memorial_message: null | string;
          phone: null | string;
          preferences: Json | null;
          updated_at: string;
          user_id: null | string;
        };
        Update: {
          avatar_url?: null | string;
          created_at?: string;
          date_of_birth?: null | string;
          email?: null | string;
          emergency_contacts?: Json | null;
          full_name?: null | string;
          id?: string;
          memorial_message?: null | string;
          phone?: null | string;
          preferences?: Json | null;
          updated_at?: string;
          user_id?: null | string;
        };
      };
      quick_insights: {
        Insert: {
          action_required?: boolean;
          action_url?: null | string;
          category?: null | string;
          created_at?: string;
          dismissed_at?: null | string;
          expires_at?: null | string;
          id?: string;
          message: string;
          metadata?: Json | null;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          title: string;
          type: 'achievement' | 'insight' | 'reminder' | 'tip' | 'warning';
          updated_at?: string;
          user_id: string;
        };
        Row: {
          action_required: boolean;
          action_url: null | string;
          category: null | string;
          created_at: string;
          dismissed_at: null | string;
          expires_at: null | string;
          id: string;
          message: string;
          metadata: Json | null;
          priority: 'high' | 'low' | 'medium' | 'urgent';
          title: string;
          type: 'achievement' | 'insight' | 'reminder' | 'tip' | 'warning';
          updated_at: string;
          user_id: string;
        };
        Update: {
          action_required?: boolean;
          action_url?: null | string;
          category?: null | string;
          created_at?: string;
          dismissed_at?: null | string;
          expires_at?: null | string;
          id?: string;
          message?: string;
          metadata?: Json | null;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          title?: string;
          type?: 'achievement' | 'insight' | 'reminder' | 'tip' | 'warning';
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}

// Type helpers for better developer experience - exactly matching main project
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert =
  Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate =
  Database['public']['Tables']['documents']['Update'];

export type Guardian = Database['public']['Tables']['guardians']['Row'];
export type GuardianInsert =
  Database['public']['Tables']['guardians']['Insert'];
export type GuardianUpdate =
  Database['public']['Tables']['guardians']['Update'];

export type LegacyItem = Database['public']['Tables']['legacy_items']['Row'];
export type LegacyItemInsert =
  Database['public']['Tables']['legacy_items']['Insert'];
export type LegacyItemUpdate =
  Database['public']['Tables']['legacy_items']['Update'];

export type QuickInsight =
  Database['public']['Tables']['quick_insights']['Row'];
export type QuickInsightInsert =
  Database['public']['Tables']['quick_insights']['Insert'];
export type QuickInsightUpdate =
  Database['public']['Tables']['quick_insights']['Update'];

export type LegacyMilestone =
  Database['public']['Tables']['legacy_milestones']['Row'];
export type LegacyMilestoneInsert =
  Database['public']['Tables']['legacy_milestones']['Insert'];
export type LegacyMilestoneUpdate =
  Database['public']['Tables']['legacy_milestones']['Update'];

// Category and status types for better type safety
export type LegacyItemCategory = LegacyItem['category'];
export type LegacyItemStatus = LegacyItem['status'];
export type LegacyItemPriority = LegacyItem['priority'];

// Emergency contact type
export interface EmergencyContact {
  address?: string;
  email?: string;
  name: string;
  phone: string;
  relationship: string;
}

// User preferences type
export interface UserPreferences {
  currency?: string;
  language: string;
  notifications: boolean;
  theme: 'auto' | 'dark' | 'light';
  timezone?: string;
}

// Legacy item metadata type
export interface LegacyItemMetadata {
  [key: string]: unknown;
  backup_status?: string;
  completed_recipes?: number;
  dni_status?: boolean;
  estimated_size?: string;
  format?: string;
  healthcare_proxy?: string;
  insurance_info?: string;
  lawyer_contact?: string;
  location?: string;
  maintenance_schedule?: string;
  next_review?: string;
  organ_donation?: boolean;
  property_address?: string;
  review_frequency?: string;
  total_recipes?: number;
}
