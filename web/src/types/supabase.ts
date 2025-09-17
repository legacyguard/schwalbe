export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined }

export type Database = {
  graphql_public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
  }
  public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Functions: {
      extract_user_id_from_path: {
        Args: { file_path: string }
        Returns: string
      }
    }
    Tables: {
      documents: {
        Insert: {
          created_at?: null | string
          document_type?: null | string
          encrypted_at?: null | string
          expires_at?: null | string
          file_name: string
          file_path: string
          file_size?: null | number
          file_type?: null | string
          id?: string
          updated_at?: null | string
          user_id: string
        }
        Relationships: []
        Row: {
          created_at: null | string
          document_type: null | string
          encrypted_at: null | string
          expires_at: null | string
          file_name: string
          file_path: string
          file_size: null | number
          file_type: null | string
          id: string
          updated_at: null | string
          user_id: string
        }
        Update: {
          created_at?: null | string
          document_type?: null | string
          encrypted_at?: null | string
          expires_at?: null | string
          file_name?: string
          file_path?: string
          file_size?: null | number
          file_type?: null | string
          id?: string
          updated_at?: null | string
          user_id?: string
        }
      }
      legacy_items: {
        Insert: {
          category: string
          created_at?: null | string
          description?: null | string
          due_date?: null | string
          file_urls?: null | string[]
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          priority?: null | string
          status: string
          tags?: null | string[]
          title: string
          updated_at?: null | string
          user_id: string
        }
        Relationships: [
          {
            columns: ["user_id"]
            foreignKeyName: "legacy_items_user_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "profiles"
          },
        ]
        Row: {
          category: string
          created_at: null | string
          description: null | string
          due_date: null | string
          file_urls: null | string[]
          id: string
          is_public: boolean | null
          metadata: Json | null
          priority: null | string
          status: string
          tags: null | string[]
          title: string
          updated_at: null | string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: null | string
          description?: null | string
          due_date?: null | string
          file_urls?: null | string[]
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          priority?: null | string
          status?: string
          tags?: null | string[]
          title?: string
          updated_at?: null | string
          user_id?: string
        }
      }
      profiles: {
        Insert: {
          avatar_url?: null | string
          created_at?: null | string
          date_of_birth?: null | string
          email?: null | string
          emergency_contacts?: Json | null
          full_name?: null | string
          id: string
          phone?: null | string
          preferences?: Json | null
          updated_at?: null | string
        }
        Relationships: []
        Row: {
          avatar_url: null | string
          created_at: null | string
          date_of_birth: null | string
          email: null | string
          emergency_contacts: Json | null
          full_name: null | string
          id: string
          phone: null | string
          preferences: Json | null
          updated_at: null | string
        }
        Update: {
          avatar_url?: null | string
          created_at?: null | string
          date_of_birth?: null | string
          email?: null | string
          emergency_contacts?: Json | null
          full_name?: null | string
          id?: string
          phone?: null | string
          preferences?: Json | null
          updated_at?: null | string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
  storage: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      buckettype: "ANALYTICS" | "STANDARD"
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Tables: {
      buckets: {
        Insert: {
          allowed_mime_types?: null | string[]
          avif_autodetection?: boolean | null
          created_at?: null | string
          file_size_limit?: null | number
          id: string
          name: string
          owner?: null | string
          owner_id?: null | string
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: null | string
        }
        Relationships: []
        Row: {
          allowed_mime_types: null | string[]
          avif_autodetection: boolean | null
          created_at: null | string
          file_size_limit: null | number
          id: string
          name: string
          owner: null | string
          owner_id: null | string
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: null | string
        }
        Update: {
          allowed_mime_types?: null | string[]
          avif_autodetection?: boolean | null
          created_at?: null | string
          file_size_limit?: null | number
          id?: string
          name?: string
          owner?: null | string
          owner_id?: null | string
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: null | string
        }
      }
      buckets_analytics: {
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
      }
      iceberg_namespaces: {
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets_analytics"
          },
        ]
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
      }
      iceberg_tables: {
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets_analytics"
          },
          {
            columns: ["namespace_id"]
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "iceberg_namespaces"
          },
        ]
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
      }
      migrations: {
        Insert: {
          executed_at?: null | string
          hash: string
          id: number
          name: string
        }
        Relationships: []
        Row: {
          executed_at: null | string
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: null | string
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Insert: {
          bucket_id?: null | string
          created_at?: null | string
          id?: string
          last_accessed_at?: null | string
          level?: null | number
          metadata?: Json | null
          name?: null | string
          owner?: null | string
          owner_id?: null | string
          path_tokens?: null | string[]
          updated_at?: null | string
          user_metadata?: Json | null
          version?: null | string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "objects_bucketId_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets"
          },
        ]
        Row: {
          bucket_id: null | string
          created_at: null | string
          id: string
          last_accessed_at: null | string
          level: null | number
          metadata: Json | null
          name: null | string
          owner: null | string
          owner_id: null | string
          path_tokens: null | string[]
          updated_at: null | string
          user_metadata: Json | null
          version: null | string
        }
        Update: {
          bucket_id?: null | string
          created_at?: null | string
          id?: string
          last_accessed_at?: null | string
          level?: null | number
          metadata?: Json | null
          name?: null | string
          owner?: null | string
          owner_id?: null | string
          path_tokens?: null | string[]
          updated_at?: null | string
          user_metadata?: Json | null
          version?: null | string
        }
      }
      prefixes: {
        Insert: {
          bucket_id: string
          created_at?: null | string
          level?: number
          name: string
          updated_at?: null | string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "prefixes_bucketId_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets"
          },
        ]
        Row: {
          bucket_id: string
          created_at: null | string
          level: number
          name: string
          updated_at: null | string
        }
        Update: {
          bucket_id?: string
          created_at?: null | string
          level?: number
          name?: string
          updated_at?: null | string
        }
      }
      s3_multipart_uploads: {
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key: string
          owner_id?: null | string
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets"
          },
        ]
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: null | string
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: null | string
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
      }
      s3_multipart_uploads_parts: {
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: null | string
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Relationships: [
          {
            columns: ["bucket_id"]
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "buckets"
          },
          {
            columns: ["upload_id"]
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "s3_multipart_uploads"
          },
        ]
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: null | string
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: null | string
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
