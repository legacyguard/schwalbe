
export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };

export interface Database {
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Tables: {
      consultations: {
        Insert: {
          consultation_notes?: null | string;
          consultation_type?:
            | 'document_review'
            | 'follow_up'
            | 'initial'
            | 'urgent';
          cost?: null | number;
          created_at?: string;
          duration_minutes?: number;
          follow_up_date?: null | string;
          follow_up_required?: boolean;
          id?: string;
          payment_status?: 'disputed' | 'paid' | 'pending' | 'refunded';
          professional_id: string;
          scheduled_time?: string;
          status?:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'no_show'
            | 'scheduled';
          updated_at?: string;
          user_id: string;
        };
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'consultations_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'profiles';
          },
          {
            columns: ['professional_id'];
            foreignKeyName: 'consultations_professional_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'professional_reviewers';
          },
        ];
        Row: {
          consultation_notes: null | string;
          consultation_type:
            | 'document_review'
            | 'follow_up'
            | 'initial'
            | 'urgent';
          cost: null | number;
          created_at: string;
          duration_minutes: number;
          follow_up_date: null | string;
          follow_up_required: boolean;
          id: string;
          payment_status: 'disputed' | 'paid' | 'pending' | 'refunded';
          professional_id: string;
          scheduled_time: string;
          status:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'no_show'
            | 'scheduled';
          updated_at: string;
          user_id: string;
        };
        Update: {
          consultation_notes?: null | string;
          consultation_type?:
            | 'document_review'
            | 'follow_up'
            | 'initial'
            | 'urgent';
          cost?: null | number;
          created_at?: string;
          duration_minutes?: number;
          follow_up_date?: null | string;
          follow_up_required?: boolean;
          id?: string;
          payment_status?: 'disputed' | 'paid' | 'pending' | 'refunded';
          professional_id?: string;
          scheduled_time?: string;
          status?:
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'no_show'
            | 'scheduled';
          updated_at?: string;
          user_id?: string;
        };
      };
      document_reviews: {
        Insert: {
          completion_date?: null | string;
          compliance_score?: null | number;
          created_at?: string;
          document_id: string;
          findings?: Json | null;
          id?: string;
          recommendations?: Json | null;
          review_date?: string;
          review_type: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id: string;
          risk_level?: 'critical' | 'high' | 'low' | 'medium';
          status?: 'completed' | 'in_progress' | 'needs_revision' | 'pending';
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ['reviewer_id'];
            foreignKeyName: 'document_reviews_reviewer_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'professional_reviewers';
          },
        ];
        Row: {
          completion_date: null | string;
          compliance_score: null | number;
          created_at: string;
          document_id: string;
          findings: Json | null;
          id: string;
          recommendations: Json | null;
          review_date: string;
          review_type: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id: string;
          risk_level: 'critical' | 'high' | 'low' | 'medium';
          status: 'completed' | 'in_progress' | 'needs_revision' | 'pending';
          updated_at: string;
        };
        Update: {
          completion_date?: null | string;
          compliance_score?: null | number;
          created_at?: string;
          document_id?: string;
          findings?: Json | null;
          id?: string;
          recommendations?: Json | null;
          review_date?: string;
          review_type?: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id?: string;
          risk_level?: 'critical' | 'high' | 'low' | 'medium';
          status?: 'completed' | 'in_progress' | 'needs_revision' | 'pending';
          updated_at?: string;
        };
      };
      document_shares: {
        Insert: {
          access_count?: number;
          created_at?: string;
          document_id: string;
          expires_at?: null | string;
          family_member_id?: null | string;
          id?: string;
          is_active?: boolean;
          last_accessed_at?: null | string;
          owner_id: string;
          permission_level?: 'admin' | 'edit' | 'view';
          shared_at?: string;
          shared_with_email?: null | string;
          shared_with_id?: null | string;
        };
        Relationships: [];
        Row: {
          access_count: number;
          created_at: string;
          document_id: string;
          expires_at: null | string;
          family_member_id: null | string;
          id: string;
          is_active: boolean;
          last_accessed_at: null | string;
          owner_id: string;
          permission_level: 'admin' | 'edit' | 'view';
          shared_at: string;
          shared_with_email: null | string;
          shared_with_id: null | string;
        };
        Update: {
          access_count?: number;
          created_at?: string;
          document_id?: string;
          expires_at?: null | string;
          family_member_id?: null | string;
          id?: string;
          is_active?: boolean;
          last_accessed_at?: null | string;
          owner_id?: string;
          permission_level?: 'admin' | 'edit' | 'view';
          shared_at?: string;
          shared_with_email?: null | string;
          shared_with_id?: null | string;
        };
      };
      documents: {
        Insert: {
          // New OCR and AI fields
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
          // Professional review fields
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
        Relationships: [];
        Row: {
          // New OCR and AI fields
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
          // New OCR and AI fields
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
          // Professional review fields
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
      emergency_access_requests: {
        Insert: {
          access_granted_until?: null | string;
          approver_name?: null | string;
          approver_relation?: null | string;
          created_at?: string;
          expires_at: string;
          id?: string;
          owner_id: string;
          reason: string;
          requested_at?: string;
          requester_id: string;
          responded_at?: null | string;
          status?: 'approved' | 'denied' | 'expired' | 'pending';
        };
        Relationships: [];
        Row: {
          access_granted_until: null | string;
          approver_name: null | string;
          approver_relation: null | string;
          created_at: string;
          expires_at: string;
          id: string;
          owner_id: string;
          reason: string;
          requested_at: string;
          requester_id: string;
          responded_at: null | string;
          status: 'approved' | 'denied' | 'expired' | 'pending';
        };
        Update: {
          access_granted_until?: null | string;
          approver_name?: null | string;
          approver_relation?: null | string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          owner_id?: string;
          reason?: string;
          requested_at?: string;
          requester_id?: string;
          responded_at?: null | string;
          status?: 'approved' | 'denied' | 'expired' | 'pending';
        };
      };
      family_activity_log: {
        Insert: {
          action_type:
            | 'document_accessed'
            | 'document_shared'
            | 'emergency_access_granted'
            | 'emergency_access_requested'
            | 'invitation_accepted'
            | 'invitation_sent'
            | 'member_added'
            | 'member_removed'
            | 'member_updated'
            | 'role_changed';
          actor_id?: null | string;
          actor_name?: null | string;
          created_at?: string;
          details?: Json;
          family_owner_id: string;
          id?: string;
          target_id?: null | string;
          target_type?:
            | 'document'
            | 'emergency_request'
            | 'family_member'
            | 'invitation'
            | null;
        };
        Relationships: [];
        Row: {
          action_type:
            | 'document_accessed'
            | 'document_shared'
            | 'emergency_access_granted'
            | 'emergency_access_requested'
            | 'invitation_accepted'
            | 'invitation_sent'
            | 'member_added'
            | 'member_removed'
            | 'member_updated'
            | 'role_changed';
          actor_id: null | string;
          actor_name: null | string;
          created_at: string;
          details: Json;
          family_owner_id: string;
          id: string;
          target_id: null | string;
          target_type:
            | 'document'
            | 'emergency_request'
            | 'family_member'
            | 'invitation'
            | null;
        };
        Update: {
          action_type?:
            | 'document_accessed'
            | 'document_shared'
            | 'emergency_access_granted'
            | 'emergency_access_requested'
            | 'invitation_accepted'
            | 'invitation_sent'
            | 'member_added'
            | 'member_removed'
            | 'member_updated'
            | 'role_changed';
          actor_id?: null | string;
          actor_name?: null | string;
          created_at?: string;
          details?: Json;
          family_owner_id?: string;
          id?: string;
          target_id?: null | string;
          target_type?:
            | 'document'
            | 'emergency_request'
            | 'family_member'
            | 'invitation'
            | null;
        };
      };
      family_calendar_events: {
        Insert: {
          attendees?: Json;
          created_at?: string;
          created_by_id?: null | string;
          description?: null | string;
          duration_minutes?: number;
          event_type?:
            | 'celebration'
            | 'deadline'
            | 'meeting'
            | 'reminder'
            | 'review';
          family_owner_id: string;
          id?: string;
          is_recurring?: boolean;
          location?: null | string;
          meeting_url?: null | string;
          metadata?: Json;
          recurrence_end_date?: null | string;
          recurrence_pattern?: null | string;
          reminders?: Json;
          scheduled_at: string;
          status?: 'cancelled' | 'completed' | 'rescheduled' | 'scheduled';
          title: string;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          attendees: Json;
          created_at: string;
          created_by_id: null | string;
          description: null | string;
          duration_minutes: number;
          event_type:
            | 'celebration'
            | 'deadline'
            | 'meeting'
            | 'reminder'
            | 'review';
          family_owner_id: string;
          id: string;
          is_recurring: boolean;
          location: null | string;
          meeting_url: null | string;
          metadata: Json;
          recurrence_end_date: null | string;
          recurrence_pattern: null | string;
          reminders: Json;
          scheduled_at: string;
          status: 'cancelled' | 'completed' | 'rescheduled' | 'scheduled';
          title: string;
          updated_at: string;
        };
        Update: {
          attendees?: Json;
          created_at?: string;
          created_by_id?: null | string;
          description?: null | string;
          duration_minutes?: number;
          event_type?:
            | 'celebration'
            | 'deadline'
            | 'meeting'
            | 'reminder'
            | 'review';
          family_owner_id?: string;
          id?: string;
          is_recurring?: boolean;
          location?: null | string;
          meeting_url?: null | string;
          metadata?: Json;
          recurrence_end_date?: null | string;
          recurrence_pattern?: null | string;
          reminders?: Json;
          scheduled_at?: string;
          status?: 'cancelled' | 'completed' | 'rescheduled' | 'scheduled';
          title?: string;
          updated_at?: string;
        };
      };
      family_guidance_entries: {
        Insert: {
          content: string;
          created_at?: string;
          entry_type: string;
          id?: string;
          is_completed?: boolean;
          priority?: number;
          related_document_ids?: null | string[];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          content: string;
          created_at: string;
          entry_type: string;
          id: string;
          is_completed: boolean;
          priority: number;
          related_document_ids: null | string[];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          entry_type?: string;
          id?: string;
          is_completed?: boolean;
          priority?: number;
          related_document_ids?: null | string[];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      family_invitations: {
        Insert: {
          accepted_at?: null | string;
          created_at?: string;
          declined_at?: null | string;
          email: string;
          expires_at: string;
          family_member_id: string;
          id?: string;
          message?: null | string;
          sender_id: string;
          status?: 'accepted' | 'declined' | 'expired' | 'pending';
          token: string;
        };
        Relationships: [];
        Row: {
          accepted_at: null | string;
          created_at: string;
          declined_at: null | string;
          email: string;
          expires_at: string;
          family_member_id: string;
          id: string;
          message: null | string;
          sender_id: string;
          status: 'accepted' | 'declined' | 'expired' | 'pending';
          token: string;
        };
        Update: {
          accepted_at?: null | string;
          created_at?: string;
          declined_at?: null | string;
          email?: string;
          expires_at?: string;
          family_member_id?: string;
          id?: string;
          message?: null | string;
          sender_id?: string;
          status?: 'accepted' | 'declined' | 'expired' | 'pending';
          token?: string;
        };
      };
      // Family System Tables
      family_members: {
        Insert: {
          access_level?: 'admin' | 'edit' | 'view';
          address?: Json;
          avatar_url?: null | string;
          created_at?: string;
          date_of_birth?: null | string;
          email: string;
          emergency_access_enabled?: boolean;
          emergency_contact?: boolean;
          family_owner_id: string;
          id?: string;
          is_active?: boolean;
          last_active_at?: null | string;
          name: string;
          permissions?: Json;
          phone?: null | string;
          preferences?: Json;
          relationship:
            | 'aunt_uncle'
            | 'child'
            | 'cousin'
            | 'friend'
            | 'grandchild'
            | 'grandparent'
            | 'other'
            | 'parent'
            | 'professional'
            | 'sibling'
            | 'spouse';
          role:
            | 'co_owner'
            | 'collaborator'
            | 'emergency_contact'
            | 'owner'
            | 'viewer';
          trusted_devices?: Json;
          updated_at?: string;
          user_id?: null | string;
        };
        Relationships: [];
        Row: {
          access_level: 'admin' | 'edit' | 'view';
          address: Json;
          avatar_url: null | string;
          created_at: string;
          date_of_birth: null | string;
          email: string;
          emergency_access_enabled: boolean;
          emergency_contact: boolean;
          family_owner_id: string;
          id: string;
          is_active: boolean;
          last_active_at: null | string;
          name: string;
          permissions: Json;
          phone: null | string;
          preferences: Json;
          relationship:
            | 'aunt_uncle'
            | 'child'
            | 'cousin'
            | 'friend'
            | 'grandchild'
            | 'grandparent'
            | 'other'
            | 'parent'
            | 'professional'
            | 'sibling'
            | 'spouse';
          role:
            | 'co_owner'
            | 'collaborator'
            | 'emergency_contact'
            | 'owner'
            | 'viewer';
          trusted_devices: Json;
          updated_at: string;
          user_id: null | string;
        };
        Update: {
          access_level?: 'admin' | 'edit' | 'view';
          address?: Json;
          avatar_url?: null | string;
          created_at?: string;
          date_of_birth?: null | string;
          email?: string;
          emergency_access_enabled?: boolean;
          emergency_contact?: boolean;
          family_owner_id?: string;
          id?: string;
          is_active?: boolean;
          last_active_at?: null | string;
          name?: string;
          permissions?: Json;
          phone?: null | string;
          preferences?: Json;
          relationship?:
            | 'aunt_uncle'
            | 'child'
            | 'cousin'
            | 'friend'
            | 'grandchild'
            | 'grandparent'
            | 'other'
            | 'parent'
            | 'professional'
            | 'sibling'
            | 'spouse';
          role?:
            | 'co_owner'
            | 'collaborator'
            | 'emergency_contact'
            | 'owner'
            | 'viewer';
          trusted_devices?: Json;
          updated_at?: string;
          user_id?: null | string;
        };
      };
      family_shield_activation_log: {
        Insert: {
          confirmed_at?: null | string;
          created_at?: string;
          expired_at?: null | string;
          guardian_email?: null | string;
          guardian_id?: null | string;
          guardian_name?: null | string;
          id?: string;
          ip_address?: null | string;
          notes?: null | string;
          status?: string;
          token_expires_at?: null | string;
          trigger_type: string;
          updated_at?: string;
          user_agent?: null | string;
          user_id: string;
          verification_token?: null | string;
        };
        Relationships: [];
        Row: {
          confirmed_at: null | string;
          created_at: string;
          expired_at: null | string;
          guardian_email: null | string;
          guardian_id: null | string;
          guardian_name: null | string;
          id: string;
          ip_address: null | string;
          notes: null | string;
          status: string;
          token_expires_at: null | string;
          trigger_type: string;
          updated_at: string;
          user_agent: null | string;
          user_id: string;
          verification_token: null | string;
        };
        Update: {
          confirmed_at?: null | string;
          created_at?: string;
          expired_at?: null | string;
          guardian_email?: null | string;
          guardian_id?: null | string;
          guardian_name?: null | string;
          id?: string;
          ip_address?: null | string;
          notes?: null | string;
          status?: string;
          token_expires_at?: null | string;
          trigger_type?: string;
          updated_at?: string;
          user_agent?: null | string;
          user_id?: string;
          verification_token?: null | string;
        };
      };
      family_shield_settings: {
        Insert: {
          created_at?: string;
          emergency_access_level?: string;
          id?: string;
          inactivity_threshold?: number;
          is_enabled?: boolean;
          notification_frequency?: number;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          created_at: string;
          emergency_access_level: string;
          id: string;
          inactivity_threshold: number;
          is_enabled: boolean;
          notification_frequency: number;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emergency_access_level?: string;
          id?: string;
          inactivity_threshold?: number;
          is_enabled?: boolean;
          notification_frequency?: number;
          updated_at?: string;
          user_id?: string;
        };
      };
      guardian_notifications: {
        Insert: {
          created_at?: string;
          guardian_id: string;
          id?: string;
          notification_type: string;
          responded_at?: null | string;
          sent_at?: null | string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          created_at: string;
          guardian_id: string;
          id: string;
          notification_type: string;
          responded_at: null | string;
          sent_at: null | string;
          status: string;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          guardian_id?: string;
          id?: string;
          notification_type?: string;
          responded_at?: null | string;
          sent_at?: null | string;
          status?: string;
          updated_at?: string;
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
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'guardians_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
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
      // Aggregated Analytics Tables
      insight_analytics: {
        Insert: {
          actionable_insights?: number;
          average_protection_level?: number;
          completed_actions?: number;
          created_at?: string;
          id?: string;
          timeframe_end: string;
          timeframe_start: string;
          top_categories?: Json;
          total_insights?: number;
          total_time_saved?: number;
          trend_data?: Json;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          actionable_insights: number;
          average_protection_level: number;
          completed_actions: number;
          created_at: string;
          id: string;
          timeframe_end: string;
          timeframe_start: string;
          top_categories: Json;
          total_insights: number;
          total_time_saved: number;
          trend_data: Json;
          updated_at: string;
          user_id: string;
        };
        Update: {
          actionable_insights?: number;
          average_protection_level?: number;
          completed_actions?: number;
          created_at?: string;
          id?: string;
          timeframe_end?: string;
          timeframe_start?: string;
          top_categories?: Json;
          total_insights?: number;
          total_time_saved?: number;
          trend_data?: Json;
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
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'legacy_items_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'profiles';
          },
        ];
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
          category:
            | 'family'
            | 'foundation'
            | 'maintenance'
            | 'mastery'
            | 'professional'
            | 'protection';
          celebration_color?: null | string;
          celebration_emotional_framing?: null | string;
          celebration_family_impact_message?: null | string;
          celebration_icon?: null | string;
          celebration_should_show?: boolean;
          celebration_text?: null | string;
          completed_at?: null | string;
          created_at?: string;
          criteria_current_value: string;
          criteria_is_complete?: boolean;
          criteria_threshold: string;
          criteria_type:
            | 'action_completed'
            | 'document_count'
            | 'family_members'
            | 'protection_percentage'
            | 'review_score'
            | 'time_based';
          description: string;
          id?: string;
          last_checked_at?: null | string;
          metadata?: Json;
          progress_next_action?: null | string;
          progress_next_action_url?: null | string;
          progress_percentage?: number;
          progress_steps_completed?: number;
          progress_total_steps?: number;
          rewards?: Json;
          title: string;
          triggers?: Json;
          type:
            | 'annual_update'
            | 'family_complete'
            | 'first_document'
            | 'legacy_complete'
            | 'professional_review'
            | 'protection_threshold';
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          category:
            | 'family'
            | 'foundation'
            | 'maintenance'
            | 'mastery'
            | 'professional'
            | 'protection';
          celebration_color: null | string;
          celebration_emotional_framing: null | string;
          celebration_family_impact_message: null | string;
          celebration_icon: null | string;
          celebration_should_show: boolean;
          celebration_text: null | string;
          completed_at: null | string;
          created_at: string;
          criteria_current_value: string;
          criteria_is_complete: boolean;
          criteria_threshold: string;
          criteria_type:
            | 'action_completed'
            | 'document_count'
            | 'family_members'
            | 'protection_percentage'
            | 'review_score'
            | 'time_based';
          description: string;
          id: string;
          last_checked_at: null | string;
          metadata: Json;
          progress_next_action: null | string;
          progress_next_action_url: null | string;
          progress_percentage: number;
          progress_steps_completed: number;
          progress_total_steps: number;
          rewards: Json;
          title: string;
          triggers: Json;
          type:
            | 'annual_update'
            | 'family_complete'
            | 'first_document'
            | 'legacy_complete'
            | 'professional_review'
            | 'protection_threshold';
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?:
            | 'family'
            | 'foundation'
            | 'maintenance'
            | 'mastery'
            | 'professional'
            | 'protection';
          celebration_color?: null | string;
          celebration_emotional_framing?: null | string;
          celebration_family_impact_message?: null | string;
          celebration_icon?: null | string;
          celebration_should_show?: boolean;
          celebration_text?: null | string;
          completed_at?: null | string;
          created_at?: string;
          criteria_current_value?: string;
          criteria_is_complete?: boolean;
          criteria_threshold?: string;
          criteria_type?:
            | 'action_completed'
            | 'document_count'
            | 'family_members'
            | 'protection_percentage'
            | 'review_score'
            | 'time_based';
          description?: string;
          id?: string;
          last_checked_at?: null | string;
          metadata?: Json;
          progress_next_action?: null | string;
          progress_next_action_url?: null | string;
          progress_percentage?: number;
          progress_steps_completed?: number;
          progress_total_steps?: number;
          rewards?: Json;
          title?: string;
          triggers?: Json;
          type?:
            | 'annual_update'
            | 'family_complete'
            | 'first_document'
            | 'legacy_complete'
            | 'professional_review'
            | 'protection_threshold';
          updated_at?: string;
          user_id?: string;
        };
      };
      milestone_analytics: {
        Insert: {
          average_completion_time_hours?: number;
          celebration_engagement?: number;
          completion_rate?: number;
          completion_trend?: 'declining' | 'improving' | 'stable' | null;
          created_at?: string;
          features_unlocked?: Json;
          id?: string;
          milestones_completed?: number;
          most_active_category?: null | string;
          preferred_difficulty?: null | string;
          recommendation_follow_rate?: number;
          timeframe_end: string;
          timeframe_start: string;
          total_protection_increase?: number;
          total_time_saved?: number;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          average_completion_time_hours: number;
          celebration_engagement: number;
          completion_rate: number;
          completion_trend: 'declining' | 'improving' | 'stable' | null;
          created_at: string;
          features_unlocked: Json;
          id: string;
          milestones_completed: number;
          most_active_category: null | string;
          preferred_difficulty: null | string;
          recommendation_follow_rate: number;
          timeframe_end: string;
          timeframe_start: string;
          total_protection_increase: number;
          total_time_saved: number;
          updated_at: string;
          user_id: string;
        };
        Update: {
          average_completion_time_hours?: number;
          celebration_engagement?: number;
          completion_rate?: number;
          completion_trend?: 'declining' | 'improving' | 'stable' | null;
          created_at?: string;
          features_unlocked?: Json;
          id?: string;
          milestones_completed?: number;
          most_active_category?: null | string;
          preferred_difficulty?: null | string;
          recommendation_follow_rate?: number;
          timeframe_end?: string;
          timeframe_start?: string;
          total_protection_increase?: number;
          total_time_saved?: number;
          updated_at?: string;
          user_id?: string;
        };
      };
      notifications: {
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          message: string;
          read?: boolean;
          title: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          created_at: string;
          data: Json | null;
          id: string;
          message: string;
          read: boolean;
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          message?: string;
          read?: boolean;
          title?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      professional_onboarding: {
        Insert: {
          background_check_status?: 'failed' | 'passed' | 'pending';
          completed_steps?: string[];
          created_at?: string;
          credentials?: Json;
          documents_uploaded?: Json;
          id?: string;
          onboarding_step?: string;
          professional_type:
            | 'attorney'
            | 'estate_planner'
            | 'financial_advisor'
            | 'notary'
            | 'tax_specialist';
          updated_at?: string;
          user_id: string;
          verification_status?: 'pending' | 'rejected' | 'verified';
        };
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'professional_onboarding_user_id_fkey';
            isOneToOne: true;
            referencedColumns: ['id'];
            referencedRelation: 'profiles';
          },
        ];
        Row: {
          background_check_status: 'failed' | 'passed' | 'pending';
          completed_steps: string[];
          created_at: string;
          credentials: Json;
          documents_uploaded: Json;
          id: string;
          onboarding_step: string;
          professional_type:
            | 'attorney'
            | 'estate_planner'
            | 'financial_advisor'
            | 'notary'
            | 'tax_specialist';
          updated_at: string;
          user_id: string;
          verification_status: 'pending' | 'rejected' | 'verified';
        };
        Update: {
          background_check_status?: 'failed' | 'passed' | 'pending';
          completed_steps?: string[];
          created_at?: string;
          credentials?: Json;
          documents_uploaded?: Json;
          id?: string;
          onboarding_step?: string;
          professional_type?:
            | 'attorney'
            | 'estate_planner'
            | 'financial_advisor'
            | 'notary'
            | 'tax_specialist';
          updated_at?: string;
          user_id?: string;
          verification_status?: 'pending' | 'rejected' | 'verified';
        };
      };
      professional_partnerships: {
        Insert: {
          agreement_details?: Json;
          commission_structure?: Json;
          created_at?: string;
          id?: string;
          partner_contact?: Json;
          partner_name: string;
          partner_type:
            | 'accounting_firm'
            | 'estate_service'
            | 'financial_institution'
            | 'insurance_company'
            | 'law_firm';
          partnership_status?:
            | 'active'
            | 'pending'
            | 'suspended'
            | 'terminated';
          professional_id: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ['professional_id'];
            foreignKeyName: 'professional_partnerships_professional_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'professional_reviewers';
          },
        ];
        Row: {
          agreement_details: Json;
          commission_structure: Json;
          created_at: string;
          id: string;
          partner_contact: Json;
          partner_name: string;
          partner_type:
            | 'accounting_firm'
            | 'estate_service'
            | 'financial_institution'
            | 'insurance_company'
            | 'law_firm';
          partnership_status: 'active' | 'pending' | 'suspended' | 'terminated';
          professional_id: string;
          updated_at: string;
        };
        Update: {
          agreement_details?: Json;
          commission_structure?: Json;
          created_at?: string;
          id?: string;
          partner_contact?: Json;
          partner_name?: string;
          partner_type?:
            | 'accounting_firm'
            | 'estate_service'
            | 'financial_institution'
            | 'insurance_company'
            | 'law_firm';
          partnership_status?:
            | 'active'
            | 'pending'
            | 'suspended'
            | 'terminated';
          professional_id?: string;
          updated_at?: string;
        };
      };
      professional_reviewers: {
        Insert: {
          average_turnaround_hours?: number;
          bar_number?: null | string;
          contact_email: string;
          created_at?: string;
          credentials: string;
          id?: string;
          jurisdiction: string;
          name: string;
          profile_verified?: boolean;
          rating?: number;
          reviews_completed?: number;
          specializations?: string[];
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          average_turnaround_hours: number;
          bar_number: null | string;
          contact_email: string;
          created_at: string;
          credentials: string;
          id: string;
          jurisdiction: string;
          name: string;
          profile_verified: boolean;
          rating: number;
          reviews_completed: number;
          specializations: string[];
          updated_at: string;
        };
        Update: {
          average_turnaround_hours?: number;
          bar_number?: null | string;
          contact_email?: string;
          created_at?: string;
          credentials?: string;
          id?: string;
          jurisdiction?: string;
          name?: string;
          profile_verified?: boolean;
          rating?: number;
          reviews_completed?: number;
          specializations?: string[];
          updated_at?: string;
        };
      };
      professional_reviews: {
        Insert: {
          certification_level?: 'basic' | 'legal_certified' | 'premium';
          completion_date?: null | string;
          created_at?: string;
          document_id: string;
          family_protection_score?: number;
          id?: string;
          legal_compliance_score?: number;
          recommended_changes?: null | string[];
          review_date?: string;
          review_fee?: null | number;
          review_notes?: null | string;
          reviewer_id: string;
          status?:
            | 'approved'
            | 'in_review'
            | 'needs_revision'
            | 'pending'
            | 'rejected';
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ['reviewer_id'];
            foreignKeyName: 'professional_reviews_reviewer_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'professional_reviewers';
          },
        ];
        Row: {
          certification_level: 'basic' | 'legal_certified' | 'premium';
          completion_date: null | string;
          created_at: string;
          document_id: string;
          family_protection_score: number;
          id: string;
          legal_compliance_score: number;
          recommended_changes: null | string[];
          review_date: string;
          review_fee: null | number;
          review_notes: null | string;
          reviewer_id: string;
          status:
            | 'approved'
            | 'in_review'
            | 'needs_revision'
            | 'pending'
            | 'rejected';
          updated_at: string;
        };
        Update: {
          certification_level?: 'basic' | 'legal_certified' | 'premium';
          completion_date?: null | string;
          created_at?: string;
          document_id?: string;
          family_protection_score?: number;
          id?: string;
          legal_compliance_score?: number;
          recommended_changes?: null | string[];
          review_date?: string;
          review_fee?: null | number;
          review_notes?: null | string;
          reviewer_id?: string;
          status?:
            | 'approved'
            | 'in_review'
            | 'needs_revision'
            | 'pending'
            | 'rejected';
          updated_at?: string;
        };
      };
      // New professional network tables
      professional_specializations: {
        Insert: {
          category: string;
          created_at?: string;
          description?: null | string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          category: string;
          created_at: string;
          description: null | string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: null | string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
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
        Relationships: [
          {
            columns: ['id'];
            foreignKeyName: 'profiles_id_fkey';
            isOneToOne: true;
            referencedColumns: ['id'];
            referencedRelation: 'users';
          },
        ];
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
      // New Analytics and Insights Tables
      quick_insights: {
        Insert: {
          action_text?: null | string;
          action_url?: null | string;
          actionable?: boolean;
          created_at?: string;
          description: string;
          document_id?: null | string;
          family_impact?: Json;
          id?: string;
          impact: 'high' | 'low' | 'medium';
          metadata?: Json;
          priority: 'important' | 'nice_to_have' | 'urgent';
          title: string;
          type:
            | 'completion_gap'
            | 'document_analysis'
            | 'family_impact'
            | 'protection_level'
            | 'time_saved'
            | 'urgent_action';
          updated_at?: string;
          user_id: string;
          value?: null | string;
        };
        Relationships: [];
        Row: {
          action_text: null | string;
          action_url: null | string;
          actionable: boolean;
          created_at: string;
          description: string;
          document_id: null | string;
          family_impact: Json;
          id: string;
          impact: 'high' | 'low' | 'medium';
          metadata: Json;
          priority: 'important' | 'nice_to_have' | 'urgent';
          title: string;
          type:
            | 'completion_gap'
            | 'document_analysis'
            | 'family_impact'
            | 'protection_level'
            | 'time_saved'
            | 'urgent_action';
          updated_at: string;
          user_id: string;
          value: null | string;
        };
        Update: {
          action_text?: null | string;
          action_url?: null | string;
          actionable?: boolean;
          created_at?: string;
          description?: string;
          document_id?: null | string;
          family_impact?: Json;
          id?: string;
          impact?: 'high' | 'low' | 'medium';
          metadata?: Json;
          priority?: 'important' | 'nice_to_have' | 'urgent';
          title?: string;
          type?:
            | 'completion_gap'
            | 'document_analysis'
            | 'family_impact'
            | 'protection_level'
            | 'time_saved'
            | 'urgent_action';
          updated_at?: string;
          user_id?: string;
          value?: null | string;
        };
      };
      review_requests: {
        Insert: {
          completion_date?: null | string;
          created_at?: string;
          document_id: string;
          due_date?: null | string;
          estimated_cost?: null | number;
          id?: string;
          notes?: null | string;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          requested_date?: string;
          review_type?: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id?: null | string;
          status?:
            | 'assigned'
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'pending';
          updated_at?: string;
          urgency_level?: 'high' | 'low' | 'medium' | 'urgent';
          user_id: string;
        };
        Relationships: [
          {
            columns: ['user_id'];
            foreignKeyName: 'review_requests_user_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'profiles';
          },
          {
            columns: ['reviewer_id'];
            foreignKeyName: 'review_requests_reviewer_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'professional_reviewers';
          },
        ];
        Row: {
          completion_date: null | string;
          created_at: string;
          document_id: string;
          due_date: null | string;
          estimated_cost: null | number;
          id: string;
          notes: null | string;
          priority: 'high' | 'low' | 'medium' | 'urgent';
          requested_date: string;
          review_type: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id: null | string;
          status:
            | 'assigned'
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'pending';
          updated_at: string;
          urgency_level: 'high' | 'low' | 'medium' | 'urgent';
          user_id: string;
        };
        Update: {
          completion_date?: null | string;
          created_at?: string;
          document_id?: string;
          due_date?: null | string;
          estimated_cost?: null | number;
          id?: string;
          notes?: null | string;
          priority?: 'high' | 'low' | 'medium' | 'urgent';
          requested_date?: string;
          review_type?: 'financial' | 'general' | 'legal' | 'medical';
          reviewer_id?: null | string;
          status?:
            | 'assigned'
            | 'cancelled'
            | 'completed'
            | 'in_progress'
            | 'pending';
          updated_at?: string;
          urgency_level?: 'high' | 'low' | 'medium' | 'urgent';
          user_id?: string;
        };
      };
      review_results: {
        Insert: {
          action_items?: Json;
          created_at?: string;
          detailed_findings?: Json;
          id?: string;
          legal_references?: null | string[];
          next_steps?: null | string[];
          result_type:
            | 'approval'
            | 'conditional_approval'
            | 'rejection'
            | 'revision_required';
          review_id: string;
          summary: string;
          updated_at?: string;
          validity_period?: null | string;
        };
        Relationships: [
          {
            columns: ['review_id'];
            foreignKeyName: 'review_results_review_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'document_reviews';
          },
        ];
        Row: {
          action_items: Json;
          created_at: string;
          detailed_findings: Json;
          id: string;
          legal_references: null | string[];
          next_steps: null | string[];
          result_type:
            | 'approval'
            | 'conditional_approval'
            | 'rejection'
            | 'revision_required';
          review_id: string;
          summary: string;
          updated_at: string;
          validity_period: null | string;
        };
        Update: {
          action_items?: Json;
          created_at?: string;
          detailed_findings?: Json;
          id?: string;
          legal_references?: null | string[];
          next_steps?: null | string[];
          result_type?:
            | 'approval'
            | 'conditional_approval'
            | 'rejection'
            | 'revision_required';
          review_id?: string;
          summary?: string;
          updated_at?: string;
          validity_period?: null | string;
        };
      };
      survivor_access_requests: {
        Insert: {
          access_token: string;
          created_at?: string;
          guardian_id?: null | string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
        Row: {
          access_token: string;
          created_at: string;
          guardian_id: null | string;
          id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          guardian_id?: null | string;
          id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      time_capsules: {
        Insert: {
          access_token?: null | string;
          created_at?: string;
          delivered_at?: null | string;
          delivery_condition: string;
          delivery_date?: null | string;
          id?: string;
          is_delivered?: boolean;
          message_content: string;
          message_preview?: null | string;
          message_title: string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          access_token: null | string;
          created_at: string;
          delivered_at: null | string;
          delivery_condition: string;
          delivery_date: null | string;
          id: string;
          is_delivered: boolean;
          message_content: string;
          message_preview: null | string;
          message_title: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          access_token?: null | string;
          created_at?: string;
          delivered_at?: null | string;
          delivery_condition?: string;
          delivery_date?: null | string;
          id?: string;
          is_delivered?: boolean;
          message_content?: string;
          message_preview?: null | string;
          message_title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      user_subscriptions: {
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: null | string;
          current_period_start?: null | string;
          id?: string;
          plan?: string;
          status?: string;
          stripe_subscription_id?: null | string;
          updated_at?: string;
          user_id: string;
        };
        Relationships: [];
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: null | string;
          current_period_start: null | string;
          id: string;
          plan: string;
          status: string;
          stripe_subscription_id: null | string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: null | string;
          current_period_start?: null | string;
          id?: string;
          plan?: string;
          status?: string;
          stripe_subscription_id?: null | string;
          updated_at?: string;
          user_id?: string;
        };
      };
      wills: {
        Insert: {
          ai_suggestions?: Json;
          assets?: Json;
          beneficiaries?: Json;
          created_at?: string;
          executors?: Json;
          id?: string;
          jurisdiction?: string;
          special_instructions?: Json;
          status?: string;
          testator_data?: Json;
          updated_at?: string;
          user_id: string;
          version?: number;
          will_type?: string;
        };
        Relationships: [];
        Row: {
          ai_suggestions: Json;
          assets: Json;
          beneficiaries: Json;
          created_at: string;
          executors: Json;
          id: string;
          jurisdiction: string;
          special_instructions: Json;
          status: string;
          testator_data: Json;
          updated_at: string;
          user_id: string;
          version: number;
          will_type: string;
        };
        Update: {
          ai_suggestions?: Json;
          assets?: Json;
          beneficiaries?: Json;
          created_at?: string;
          executors?: Json;
          id?: string;
          jurisdiction?: string;
          special_instructions?: Json;
          status?: string;
          testator_data?: Json;
          updated_at?: string;
          user_id?: string;
          version?: number;
          will_type?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
}

// Type helpers for better developer experience
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

// Type helpers for better developer experience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type LegacyItem = Database['public']['Tables']['legacy_items']['Row'];
export type LegacyItemInsert =
  Database['public']['Tables']['legacy_items']['Insert'];
export type LegacyItemUpdate =
  Database['public']['Tables']['legacy_items']['Update'];

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

// New professional network types
export type ProfessionalReviewer =
  Database['public']['Tables']['professional_reviewers']['Row'];
export type ProfessionalReviewerInsert =
  Database['public']['Tables']['professional_reviewers']['Insert'];
export type ProfessionalReviewerUpdate =
  Database['public']['Tables']['professional_reviewers']['Update'];

export type ProfessionalReview =
  Database['public']['Tables']['professional_reviews']['Row'];
export type ProfessionalReviewInsert =
  Database['public']['Tables']['professional_reviews']['Insert'];
export type ProfessionalReviewUpdate =
  Database['public']['Tables']['professional_reviews']['Update'];

export type ProfessionalSpecialization =
  Database['public']['Tables']['professional_specializations']['Row'];
export type ProfessionalSpecializationInsert =
  Database['public']['Tables']['professional_specializations']['Insert'];
export type ProfessionalSpecializationUpdate =
  Database['public']['Tables']['professional_specializations']['Update'];

export type ProfessionalOnboarding =
  Database['public']['Tables']['professional_onboarding']['Row'];
export type ProfessionalOnboardingInsert =
  Database['public']['Tables']['professional_onboarding']['Insert'];
export type ProfessionalOnboardingUpdate =
  Database['public']['Tables']['professional_onboarding']['Update'];

export type ReviewRequest =
  Database['public']['Tables']['review_requests']['Row'];
export type ReviewRequestInsert =
  Database['public']['Tables']['review_requests']['Insert'];
export type ReviewRequestUpdate =
  Database['public']['Tables']['review_requests']['Update'];

export type DocumentReview =
  Database['public']['Tables']['document_reviews']['Row'];
export type DocumentReviewInsert =
  Database['public']['Tables']['document_reviews']['Insert'];
export type DocumentReviewUpdate =
  Database['public']['Tables']['document_reviews']['Update'];

export type ReviewResult =
  Database['public']['Tables']['review_results']['Row'];
export type ReviewResultInsert =
  Database['public']['Tables']['review_results']['Insert'];
export type ReviewResultUpdate =
  Database['public']['Tables']['review_results']['Update'];

export type ProfessionalPartnership =
  Database['public']['Tables']['professional_partnerships']['Row'];
export type ProfessionalPartnershipInsert =
  Database['public']['Tables']['professional_partnerships']['Insert'];
export type ProfessionalPartnershipUpdate =
  Database['public']['Tables']['professional_partnerships']['Update'];

export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type ConsultationInsert =
  Database['public']['Tables']['consultations']['Insert'];
export type ConsultationUpdate =
  Database['public']['Tables']['consultations']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate =
  Database['public']['Tables']['notifications']['Update'];

export type Will = Database['public']['Tables']['wills']['Row'];
export type WillInsert = Database['public']['Tables']['wills']['Insert'];
export type WillUpdate = Database['public']['Tables']['wills']['Update'];

export type UserSubscription =
  Database['public']['Tables']['user_subscriptions']['Row'];
export type UserSubscriptionInsert =
  Database['public']['Tables']['user_subscriptions']['Insert'];
export type UserSubscriptionUpdate =
  Database['public']['Tables']['user_subscriptions']['Update'];

// Category and status types for better type safety
export type LegacyItemCategory = LegacyItem['category'];
export type LegacyItemStatus = LegacyItem['status'];
export type LegacyItemPriority = LegacyItem['priority'];

// Professional types
export type ProfessionalType =
  | 'attorney'
  | 'estate_planner'
  | 'financial_advisor'
  | 'notary'
  | 'tax_specialist';
export type ReviewStatus =
  | 'approved'
  | 'in_review'
  | 'needs_revision'
  | 'pending'
  | 'rejected';
export type ConsultationStatus =
  | 'cancelled'
  | 'completed'
  | 'in_progress'
  | 'no_show'
  | 'scheduled';
export type ConsultationType =
  | 'document_review'
  | 'follow_up'
  | 'initial'
  | 'urgent';

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

// Professional network metadata types
export interface ProfessionalCredentials {
  bar_number?: string;
  certification_body?: string;
  education?: string[];
  jurisdictions?: string[];
  languages?: string[];
  license_number?: string;
  specializations?: string[];
  years_experience?: number;
}

export interface PartnershipDetails {
  agreement_type?: string;
  commission_rate?: number;
  exclusivity?: boolean;
  services?: string[];
  territory?: string;
}

export interface ReviewFindings {
  best_practices?: string[];
  compliance_gaps?: string[];
  legal_issues?: string[];
  recommendations?: string[];
  risk_factors?: string[];
}
