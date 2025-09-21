

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
