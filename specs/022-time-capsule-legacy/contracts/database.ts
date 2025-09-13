// Time Capsule Legacy System - Database Contracts
// Based on Hollywood database schema with Schwalbe adaptations

// Database Schema Definitions
export interface DatabaseSchema {
  time_capsules: TimeCapsuleTable;
  storage: {
    buckets: StorageBucketTable;
    objects: StorageObjectTable;
  };
}

// Main Time Capsules Table Schema
export interface TimeCapsuleTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: string; // UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  recipient_id?: string; // UUID REFERENCES guardians(id) ON DELETE SET NULL
  recipient_name: string; // TEXT NOT NULL
  recipient_email: string; // TEXT NOT NULL
  delivery_condition: 'ON_DATE' | 'ON_DEATH'; // delivery_condition NOT NULL
  delivery_date?: string; // TIMESTAMP WITH TIME ZONE
  message_title: string; // TEXT NOT NULL
  message_preview?: string; // TEXT
  storage_path: string; // TEXT NOT NULL
  file_type: 'audio' | 'video'; // VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio'))
  file_size_bytes?: number; // BIGINT
  duration_seconds?: number; // INTEGER
  thumbnail_path?: string; // TEXT
  access_token: string; // UUID DEFAULT gen_random_uuid()
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED'; // capsule_status DEFAULT 'PENDING'
  is_delivered: boolean; // BOOLEAN DEFAULT false
  delivered_at?: string; // TIMESTAMP WITH TIME ZONE
  delivery_attempts: number; // INTEGER DEFAULT 0
  last_delivery_attempt?: string; // TIMESTAMP WITH TIME ZONE
  delivery_error?: string; // TEXT
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}

// Storage Bucket Schema
export interface StorageBucketTable {
  id: string; // TEXT PRIMARY KEY
  name: string; // TEXT
  public: boolean; // BOOLEAN DEFAULT false
  file_size_limit?: number; // BIGINT
  allowed_mime_types?: string[]; // TEXT[]
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}

// Storage Objects Schema
export interface StorageObjectTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  bucket_id: string; // TEXT NOT NULL REFERENCES storage.buckets(id)
  name: string; // TEXT NOT NULL
  owner?: string; // UUID REFERENCES auth.users(id)
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  last_accessed_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  metadata: Record<string, any>; // JSONB
  path_tokens?: string[]; // TEXT[]
}

// Row Level Security Policies
export interface RLSPolicies {
  time_capsules: {
    // Users can view their own time capsules
    user_view_own: {
      table: 'time_capsules';
      command: 'SELECT';
      using: 'auth.uid() = user_id';
    };

    // Users can insert their own time capsules
    user_insert_own: {
      table: 'time_capsules';
      command: 'INSERT';
      check: 'auth.uid() = user_id';
    };

    // Users can update their own time capsules (before delivery)
    user_update_own: {
      table: 'time_capsules';
      command: 'UPDATE';
      using: 'auth.uid() = user_id AND is_delivered = false';
    };

    // Users can delete their own time capsules (before delivery)
    user_delete_own: {
      table: 'time_capsules';
      command: 'DELETE';
      using: 'auth.uid() = user_id AND is_delivered = false';
    };

    // Public access for delivered capsules (controlled by application logic)
    public_view_delivered: {
      table: 'time_capsules';
      command: 'SELECT';
      using: 'true'; // Restricted by access_token in application logic
    };
  };

  storage: {
    // Users can upload their own time capsule files
    user_upload_own: {
      table: 'storage.objects';
      command: 'INSERT';
      check: "bucket_id = 'time-capsules' AND auth.uid()::text = (storage.foldername(name))[1]";
    };

    // Users can view their own time capsule files
    user_view_own: {
      table: 'storage.objects';
      command: 'SELECT';
      using: "bucket_id = 'time-capsules' AND auth.uid()::text = (storage.foldername(name))[1]";
    };

    // Users can update their own time capsule files
    user_update_own: {
      table: 'storage.objects';
      command: 'UPDATE';
      using: "bucket_id = 'time-capsules' AND auth.uid()::text = (storage.foldername(name))[1]";
    };

    // Users can delete their own time capsule files
    user_delete_own: {
      table: 'storage.objects';
      command: 'DELETE';
      using: "bucket_id = 'time-capsules' AND auth.uid()::text = (storage.foldername(name))[1]";
    };

    // Public access to delivered time capsule files
    public_view_delivered: {
      table: 'storage.objects';
      command: 'SELECT';
      using: "bucket_id = 'time-capsules' AND EXISTS (SELECT 1 FROM time_capsules tc WHERE tc.storage_path = name AND tc.is_delivered = true AND tc.access_token = $1)";
    };
  };
}

// Database Functions
export interface DatabaseFunctions {
  // Get capsules ready for delivery
  get_time_capsules_ready_for_delivery: {
    name: 'get_time_capsules_ready_for_delivery';
    returns: {
      capsule_id: string;
      user_id: string;
      recipient_name: string;
      recipient_email: string;
      message_title: string;
      access_token: string;
      delivery_condition: 'ON_DATE' | 'ON_DEATH';
    }[];
    sql: `
      SELECT
        tc.id as capsule_id,
        tc.user_id,
        tc.recipient_name,
        tc.recipient_email,
        tc.message_title,
        tc.access_token,
        tc.delivery_condition
      FROM time_capsules tc
      WHERE
        tc.status = 'PENDING'
        AND tc.is_delivered = false
        AND (
          (tc.delivery_condition = 'ON_DATE' AND tc.delivery_date <= NOW())
          OR
          (tc.delivery_condition = 'ON_DEATH' AND $1 = true)
        )
      ORDER BY tc.created_at ASC;
    `;
  };

  // Mark capsule as delivered
  mark_capsule_delivered: {
    name: 'mark_capsule_delivered';
    parameters: { capsule_uuid: string };
    returns: boolean;
    sql: `
      UPDATE time_capsules
      SET
        status = 'DELIVERED',
        is_delivered = true,
        delivered_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND status = 'PENDING'
      RETURNING true;
    `;
  };

  // Increment delivery attempts
  increment_delivery_attempt: {
    name: 'increment_delivery_attempt';
    parameters: { capsule_uuid: string; error_message: string };
    returns: void;
    sql: `
      UPDATE time_capsules
      SET
        delivery_attempts = delivery_attempts + 1,
        last_delivery_attempt = NOW(),
        delivery_error = $2,
        status = CASE
          WHEN delivery_attempts >= 3 THEN 'FAILED'
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = $1;
    `;
  };

  // Generate signed URL for media access
  get_time_capsule_signed_url: {
    name: 'get_time_capsule_signed_url';
    parameters: { capsule_token: string; expires_in?: number };
    returns: string;
    sql: `
      -- Implementation would use Supabase Storage signed URL generation
      -- This is a placeholder for the actual implementation
      SELECT '/api/time-capsule-media/' || $1;
    `;
  };

  // Cleanup orphaned files
  cleanup_orphaned_time_capsule_files: {
    name: 'cleanup_orphaned_time_capsule_files';
    returns: number;
    sql: `
      WITH orphaned_files AS (
        SELECT so.name
        FROM storage.objects so
        WHERE so.bucket_id = 'time-capsules'
        AND NOT EXISTS (
          SELECT 1 FROM time_capsules tc
          WHERE tc.storage_path = so.name
        )
      )
      DELETE FROM storage.objects
      WHERE bucket_id = 'time-capsules'
      AND name IN (SELECT name FROM orphaned_files)
      RETURNING 1;
    `;
  };
}

// Indexes for Performance
export interface DatabaseIndexes {
  time_capsules: {
    // Primary key index (automatically created)
    primary_key: 'time_capsules_pkey ON time_capsules(id)';

    // User-based indexes
    user_id: 'idx_time_capsules_user_id ON time_capsules(user_id)';
    recipient: 'idx_time_capsules_recipient ON time_capsules(recipient_email, is_delivered)';

    // Delivery-based indexes
    delivery_date: 'idx_time_capsules_delivery_date ON time_capsules(delivery_date) WHERE delivery_condition = \'ON_DATE\' AND is_delivered = false';
    death_condition: 'idx_time_capsules_death_condition ON time_capsules(user_id, delivery_condition) WHERE delivery_condition = \'ON_DEATH\' AND is_delivered = false';

    // Access token index
    access_token: 'idx_time_capsules_access_token ON time_capsules(access_token) WHERE is_delivered = true';

    // Status and creation indexes
    status: 'idx_time_capsules_status ON time_capsules(status, created_at)';
  };

  storage: {
    // Primary key index (automatically created)
    primary_key: 'storage.objects_pkey ON storage.objects(id)';

    // Bucket-based indexes
    bucket_name: 'idx_storage_objects_bucket_name ON storage.objects(bucket_id, name)';
    bucket_owner: 'idx_storage_objects_bucket_owner ON storage.objects(bucket_id, owner)';
  };
}

// Migration Scripts
export interface MigrationScripts {
  create_time_capsules_table: {
    version: '20250825170000';
    name: 'create_time_capsules';
    up: `
      CREATE TABLE time_capsules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        recipient_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
        recipient_name TEXT NOT NULL,
        recipient_email TEXT NOT NULL,
        delivery_condition delivery_condition NOT NULL,
        delivery_date TIMESTAMP WITH TIME ZONE,
        message_title TEXT NOT NULL,
        message_preview TEXT,
        storage_path TEXT NOT NULL,
        file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('video', 'audio')),
        file_size_bytes BIGINT,
        duration_seconds INTEGER,
        thumbnail_path TEXT,
        access_token UUID DEFAULT gen_random_uuid(),
        status capsule_status DEFAULT 'PENDING',
        is_delivered BOOLEAN DEFAULT false,
        delivered_at TIMESTAMP WITH TIME ZONE,
        delivery_attempts INTEGER DEFAULT 0,
        last_delivery_attempt TIMESTAMP WITH TIME ZONE,
        delivery_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Add RLS
      ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

      -- Add indexes
      CREATE INDEX idx_time_capsules_user_id ON time_capsules(user_id);
      CREATE INDEX idx_time_capsules_delivery_date ON time_capsules(delivery_date)
        WHERE delivery_condition = 'ON_DATE' AND is_delivered = false;
      CREATE INDEX idx_time_capsules_death_condition ON time_capsules(user_id, delivery_condition)
        WHERE delivery_condition = 'ON_DEATH' AND is_delivered = false;
      CREATE INDEX idx_time_capsules_access_token ON time_capsules(access_token)
        WHERE is_delivered = true;
      CREATE INDEX idx_time_capsules_status ON time_capsules(status, created_at);
      CREATE INDEX idx_time_capsules_recipient ON time_capsules(recipient_email, is_delivered);

      -- Add updated_at trigger
      CREATE TRIGGER update_time_capsules_updated_at
        BEFORE UPDATE ON time_capsules
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    down: `
      DROP TABLE IF EXISTS time_capsules CASCADE;
    `;
  };

  create_time_capsule_storage: {
    version: '20250825171000';
    name: 'create_time_capsule_storage';
    up: `
      -- Create storage bucket for time capsules
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'time-capsules',
        'time-capsules',
        false,
        104857600, -- 100MB
        ARRAY['video/webm', 'video/mp4', 'audio/ogg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png']
      );

      -- RLS policies for time-capsules bucket
      CREATE POLICY "Users can upload their own time capsule files"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'time-capsules'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Users can view their own time capsule files"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'time-capsules'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Users can update their own time capsule files"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'time-capsules'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

      CREATE POLICY "Users can delete their own time capsule files"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'time-capsules'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

      -- Policy for public access to delivered time capsules
      CREATE POLICY "Public access to delivered time capsule files"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'time-capsules'
        AND EXISTS (
          SELECT 1 FROM time_capsules tc
          WHERE tc.storage_path = name
          AND tc.is_delivered = true
        )
      );
    `;
    down: `
      DELETE FROM storage.buckets WHERE id = 'time-capsules';
      DROP POLICY IF EXISTS "Users can upload their own time capsule files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view their own time capsule files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update their own time capsule files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete their own time capsule files" ON storage.objects;
      DROP POLICY IF EXISTS "Public access to delivered time capsule files" ON storage.objects;
    `;
  };
}

// Type Definitions for Custom PostgreSQL Types
export interface CustomTypes {
  delivery_condition: 'ON_DATE' | 'ON_DEATH';
  capsule_status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  capsule_file_type: 'audio' | 'video';
}

// Query Builders for Complex Operations
export interface QueryBuilders {
  // Get user's capsules with filtering
  getUserCapsules: (userId: string, filters?: {
    status?: string[];
    deliveryCondition?: string[];
    limit?: number;
    offset?: number;
  }) => string;

  // Get capsules ready for delivery
  getReadyForDelivery: (familyShieldActivated?: boolean) => string;

  // Search capsules by content
  searchCapsules: (userId: string, query: string) => string;
}

// Implementation of query builders
export const queryBuilders: QueryBuilders = {
  getUserCapsules: (userId, filters = {}) => {
    let sql = `
      SELECT * FROM time_capsules
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.status?.length) {
      sql += ` AND status = ANY($${paramIndex})`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.deliveryCondition?.length) {
      sql += ` AND delivery_condition = ANY($${paramIndex})`;
      params.push(filters.deliveryCondition);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    return sql;
  },

  getReadyForDelivery: (familyShieldActivated = false) => `
    SELECT
      id as capsule_id,
      user_id,
      recipient_name,
      recipient_email,
      message_title,
      access_token,
      delivery_condition
    FROM time_capsules
    WHERE status = 'PENDING'
      AND is_delivered = false
      AND (
        (delivery_condition = 'ON_DATE' AND delivery_date <= NOW())
        OR
        (delivery_condition = 'ON_DEATH' AND ${familyShieldActivated})
      )
    ORDER BY created_at ASC
  `,

  searchCapsules: (userId, query) => `
    SELECT * FROM time_capsules
    WHERE user_id = $1
      AND (
        message_title ILIKE $2
        OR message_preview ILIKE $2
        OR recipient_name ILIKE $2
        OR recipient_email ILIKE $2
      )
    ORDER BY created_at DESC
  `,
};