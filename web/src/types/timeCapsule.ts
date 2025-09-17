
export type DeliveryCondition = 'ON_DATE' | 'ON_DEATH';
export type CapsuleStatus = 'CANCELLED' | 'DELIVERED' | 'FAILED' | 'PENDING';
export type CapsuleFileType = 'audio' | 'video';

export interface TimeCapsule {
  access_token: string;
  created_at: string;
  delivered_at?: null | string;
  delivery_attempts: number;
  delivery_condition: DeliveryCondition;
  delivery_date?: null | string;
  delivery_error?: null | string;
  duration_seconds?: null | number;
  file_size_bytes?: null | number;
  file_type: CapsuleFileType;
  id: string;
  is_delivered: boolean;
  last_delivery_attempt?: null | string;
  message_preview?: null | string;
  message_title: string;
  recipient_email: string;
  recipient_id?: null | string;
  recipient_name: string;
  status: CapsuleStatus;
  storage_path: string;
  thumbnail_path?: null | string;
  updated_at: string;
  user_id: string;
}

export interface CreateTimeCapsuleRequest {
  delivery_condition: DeliveryCondition;
  delivery_date?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  file_type: CapsuleFileType;
  message_preview?: string;
  message_title: string;
  recipient_email: string;
  recipient_id?: string;
  recipient_name: string;
}

export interface UpdateTimeCapsuleRequest
  extends Partial<CreateTimeCapsuleRequest> {
  status?: CapsuleStatus;
}

export interface TimeCapsuleRecordingData {
  blob: Blob;
  duration: number;
  fileType: CapsuleFileType;
  thumbnail?: Blob; // For video recordings
}

export interface TimeCapsuleWizardStep {
  description: string;
  id: number;
  isActive: boolean;
  isComplete: boolean;
  title: string;
}

export interface RecipientOption {
  email: string;
  id?: string;
  isGuardian: boolean;
  name: string;
  relationship?: string;
}

// For the secure viewing page
export interface TimeCapsuleAccess {
  capsule: TimeCapsule;
  signed_url: string; // Pre-signed URL for video/audio file
  thumbnail_url?: string; // Pre-signed URL for thumbnail if exists
  user_name: string;
}

// For delivery system
export interface TimeCapsuleDelivery {
  access_token: string;
  capsule_id: string;
  delivery_condition: DeliveryCondition;
  message_title: string;
  recipient_email: string;
  recipient_name: string;
  user_id: string;
}

// Recording constraints for MediaRecorder
export interface RecordingConstraints {
  audio: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    sampleRate: number;
  };
  video?: {
    frameRate: { ideal: number };
    height: { ideal: number };
    width: { ideal: number };
  };
}

export const DEFAULT_RECORDING_CONSTRAINTS: RecordingConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  },
};

export const MAX_RECORDING_DURATION = 300; // 5 minutes in seconds
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

// Helper types for UI state management
export interface TimeCapsuleFormData {
  deliveryCondition: DeliveryCondition;
  deliveryDate: Date | null;
  messagePreview: string;
  messageTitle: string;
  recipient: null | RecipientOption;
  recording: null | TimeCapsuleRecordingData;
}

export interface TimeCapsuleStats {
  delivered: number;
  failed: number;
  pending: number;
  scheduled_for_date: number;
  scheduled_on_death: number;
  total: number;
}
