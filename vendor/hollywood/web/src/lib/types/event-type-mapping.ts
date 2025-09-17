
/**
 * Type mapping utilities for resolving frontend semantic types vs database generic types
 *
 * This file provides utilities to map between:
 * - Frontend semantic event types (birthday, anniversary, document_expiry, etc.)
 * - Database generic event types (reminder, review, meeting, deadline, celebration)
 */

// Frontend semantic event types
export type FrontendEventType =
  | 'anniversary'
  | 'appointment'
  | 'birthday'
  | 'custom'
  | 'document_expiry'
  | 'milestone';

// Database generic event types
export type DatabaseEventType =
  | 'celebration'
  | 'deadline'
  | 'meeting'
  | 'reminder'
  | 'review';

// Event metadata structure for storing frontend-specific information
export interface EventMetadata {
  category:
    | 'celebration'
    | 'family'
    | 'health'
    | 'legal'
    | 'other'
    | 'personal';
  color?: string;
  customLabel?: string;
  frontendType: FrontendEventType;
  icon?: string;
}

// Type mapping configuration
const EVENT_TYPE_MAPPING = {
  // Personal events
  birthday: {
    databaseType: 'celebration' as DatabaseEventType,
    metadata: {
      frontendType: 'birthday' as FrontendEventType,
      category: 'personal' as const,
      icon: 'Gift',
      color: 'bg-accent/10 text-accent border-accent/20',
      customLabel: 'Birthday',
    },
  },
  anniversary: {
    databaseType: 'celebration' as DatabaseEventType,
    metadata: {
      frontendType: 'anniversary' as FrontendEventType,
      category: 'family' as const,
      icon: 'Heart',
      color: 'bg-secondary/10 text-secondary border-secondary/20',
      customLabel: 'Anniversary',
    },
  },
  document_expiry: {
    databaseType: 'deadline' as DatabaseEventType,
    metadata: {
      frontendType: 'document_expiry' as FrontendEventType,
      category: 'legal' as const,
      icon: 'AlertTriangle',
      color: 'bg-warning/10 text-warning border-warning/20',
      customLabel: 'Document Expiry',
    },
  },
  appointment: {
    databaseType: 'meeting' as DatabaseEventType,
    metadata: {
      frontendType: 'appointment' as FrontendEventType,
      category: 'health' as const,
      icon: 'Clock',
      color: 'bg-primary/10 text-primary border-primary/20',
      customLabel: 'Appointment',
    },
  },
  milestone: {
    databaseType: 'celebration' as DatabaseEventType,
    metadata: {
      frontendType: 'milestone' as FrontendEventType,
      category: 'personal' as const,
      icon: 'Star',
      color: 'bg-accent/10 text-accent border-accent/20',
      customLabel: 'Milestone',
    },
  },
  custom: {
    databaseType: 'reminder' as DatabaseEventType,
    metadata: {
      frontendType: 'custom' as FrontendEventType,
      category: 'other' as const,
      icon: 'CalendarIcon',
      color: 'bg-background text-text-main border-border',
      customLabel: 'Custom Event',
    },
  },
} as const;

// Reverse mapping from database type to frontend types

/**
 * Maps frontend semantic event type to database generic event type
 */
export function mapFrontendToDatabaseType(frontendType: FrontendEventType): {
  databaseType: DatabaseEventType;
  metadata: EventMetadata;
} {
  return EVENT_TYPE_MAPPING[frontendType];
}

/**
 * Maps database generic event type to frontend semantic event type
 * Uses metadata to determine the most appropriate frontend type
 */
export function mapDatabaseToFrontendType(
  databaseType: DatabaseEventType,
  metadata?: EventMetadata
): FrontendEventType {
  if (metadata?.frontendType) {
    return metadata.frontendType;
  }

  // Fallback mapping based on database type
  const fallbackMap: Record<DatabaseEventType, FrontendEventType> = {
    reminder: 'custom',
    review: 'custom',
    meeting: 'appointment',
    deadline: 'document_expiry',
    celebration: 'milestone',
  };

  return fallbackMap[databaseType];
}

/**
 * Creates metadata object for storing in database
 */
export function createEventMetadata(
  frontendType: FrontendEventType
): EventMetadata {
  return EVENT_TYPE_MAPPING[frontendType].metadata;
}

/**
 * Extracts metadata from database record
 */
export function extractEventMetadata(
  metadataString?: string
): EventMetadata | null {
  if (!metadataString) return null;

  try {
    const metadata = JSON.parse(metadataString);
    return metadata as EventMetadata;
  } catch {
    return null;
  }
}

/**
 * Gets all frontend event types
 */
export function getFrontendEventTypes(): FrontendEventType[] {
  return Object.keys(EVENT_TYPE_MAPPING) as FrontendEventType[];
}

/**
 * Gets display configuration for frontend event type
 */
export function getEventDisplayConfig(frontendType: FrontendEventType) {
  const config = EVENT_TYPE_MAPPING[frontendType];
  return {
    icon: config.metadata.icon,
    color: config.metadata.color,
    label: config.metadata.customLabel,
  };
}
