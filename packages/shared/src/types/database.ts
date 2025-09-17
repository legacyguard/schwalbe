

// Generated Database Types
export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined }

export interface Database {
  public: {
    Enums: {
      document_category: 'financial' | 'insurance' | 'medical' | 'other' | 'personal' | 'property' | 'trust' | 'will'
      share_type: 'private' | 'public' | 'restricted'
    }
    Tables: {
      documents: {
        Insert: Partial<Database['public']['Tables']['documents']['Row']>
        Row: {
          ai_suggestions?: AISuggestions
          category: string
          created_at: string
          description?: string
          file_size: number
          id: string
          is_archived?: boolean
          metadata: Json
          mime_type: string
          original_filename: string
          scenario_id?: string
          share_expires_at?: string
          share_link?: string
          share_type?: 'private' | 'public' | 'restricted'
          storage_path: string
          tags?: string[]
          updated_at: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['documents']['Row']>
      }
      assets: {
        Row: {
          id: string
          user_id: string
          category: 'property' | 'vehicle' | 'financial' | 'business' | 'personal'
          name?: string | null
          estimated_value?: number | null
          currency?: string | null
          acquired_at?: string | null
          notes?: string | null
          metadata?: Json
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['assets']['Row']>
        Update: Partial<Database['public']['Tables']['assets']['Row']>
      }
      scenarios: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata?: Json
          updated_at: string
        }
      }
      wills: {
        Row: {
          content: Json
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
      }
    }
  }
}

export interface AISuggestions {
  category?: string
  confidence?: number
  key_points?: string[]
  related_documents?: string[]
  subcategory?: string
  summary?: string
  tags?: string[]
}

export type DocumentUploadRequest = {
  category: string
  description?: string
  file: File
  metadata?: Json
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Professional reviewer types for B2B2C marketplace
export interface ProfessionalReviewerDTO {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  professional_title: string;
  bar_number?: string;
  licensed_states: string[];
  specializations: string[];
  experience_years: number;
  hourly_rate?: number;
  law_firm_name?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  verification_status: 'pending' | 'verified' | 'rejected';
  trust_score: number;
  total_reviews: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}
