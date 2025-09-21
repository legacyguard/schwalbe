
/**
 * Interactive Family Timeline Visualization for LegacyGuard
 * Provides comprehensive family history and document association visualization
 */

export interface FamilyTimeline {
  createdAt: string;
  description: string;
  documentAssociations: DocumentAssociation[];
  events: TimelineEvent[];
  familyId: string;
  generations: FamilyGeneration[];
  id: string;
  lastUpdated: string;
  milestones: FamilyMilestone[];
  privacy: TimelinePrivacy;
  sharing: TimelineSharing[];
  timespan: TimeSpan;
  title: string;
  version: number;
}

export interface TimelineEvent {
  category: EventCategory;
  date: string;
  description: string;
  documents: string[]; // Document IDs
  endDate?: string; // For events with duration
  id: string;
  location?: EventLocation;
  media: MediaAttachment[];
  metadata: Record<string, any>;
  participants: EventParticipant[];
  privacy: EventPrivacy;
  significance: EventSignificance;
  source: EventSource;
  tags: string[];
  title: string;
  type: EventType;
  verified: boolean;
}

export interface FamilyMilestone {
  achievedBy: string[]; // Family member IDs
  celebration?: CelebrationDetails;
  date: string;
  description: string;
  documents: string[];
  id: string;
  legacy: LegacyImpact;
  significance: 'family' | 'generational' | 'personal';
  title: string;
  type: MilestoneType;
}

export interface FamilyGeneration {
  achievements: string[];
  challenges: string[];
  characteristics: string[];
  documents: string[];
  generationNumber: number;
  id: string;
  keyMembers: GenerationMember[];
  legacy: GenerationLegacy;
  name: string; // e.g., "The Founders", "Second Generation"
  timeframe: TimeSpan;
}

export interface DocumentAssociation {
  accessControls: DocumentAccessControl[];
  associationType: AssociationType;
  documentId: string;
  documentTitle: string;
  documentType: string;
  importance: 'critical' | 'high' | 'low' | 'medium';
  relevantEvents: string[]; // Event IDs
  relevantPeople: string[]; // Family member IDs
  timeRelevance: TimeRelevance;
}

export interface EventParticipant {
  memberId: string;
  name: string;
  relationship: string;
  role: ParticipantRole;
  significance: 'primary' | 'secondary' | 'supporter' | 'witness';
}

export interface EventLocation {
  address?: string;
  coordinates?: { lat: number; lng: number };
  name: string;
  significance?: string;
  stillExists: boolean;
}

export interface MediaAttachment {
  description?: string;
  id: string;
  metadata: MediaMetadata;
  thumbnail?: string;
  title: string;
  type: 'audio' | 'document' | 'photo' | 'video';
  url: string;
}

export interface TimelineVisualization {
  dateRange: TimeSpan;
  displayOptions: VisualizationOptions;
  filters: TimelineFilter[];
  focusElements: string[]; // Event or person IDs to highlight
  grouping: TimelineGrouping;
  id: string;
  viewType: ViewType;
}

export interface TimelineFilter {
  enabled: boolean;
  field: string;
  operator: 'between' | 'contains' | 'equals' | 'greater_than' | 'less_than';
  type: FilterType;
  value: any;
}

export interface FamilyRelationshipMap {
  connectionStrength: ConnectionMatrix;
  generationalFlow: GenerationFlow[];
  influenceNetwork: InfluenceEdge[];
  relationships: FamilyRelationship[];
}

export type EventType =
  | 'achievement'
  | 'birth'
  | 'career_milestone'
  | 'celebration'
  | 'crisis'
  | 'death'
  | 'divorce'
  | 'family_gathering'
  | 'financial_event'
  | 'graduation'
  | 'health_event'
  | 'legal_event'
  | 'marriage'
  | 'relocation';

export type EventCategory =
  | 'achievement'
  | 'family'
  | 'financial'
  | 'health'
  | 'legal'
  | 'milestone'
  | 'personal'
  | 'professional'
  | 'social';

export type MilestoneType =
  | 'business_success'
  | 'community_impact'
  | 'crisis_overcome'
  | 'educational_achievement'
  | 'family_founding'
  | 'generational_achievement'
  | 'legacy_creation'
  | 'major_acquisition'
  | 'tradition_establishment';

export type AssociationType =
  | 'commemorates'
  | 'created_during'
  | 'financial_for'
  | 'inherited_from'
  | 'legal_for'
  | 'prepared_for'
  | 'proves'
  | 'relates_to';

export type ViewType =
  | 'chronological'
  | 'document_focused'
  | 'generational'
  | 'milestone_focused'
  | 'person_focused'
  | 'relationship'
  | 'theme_focused';

export type FilterType =
  | 'date_range'
  | 'document_type'
  | 'event_type'
  | 'location'
  | 'person'
  | 'privacy_level'
  | 'significance';

export type ParticipantRole =
  | 'beneficiary'
  | 'child'
  | 'officiant'
  | 'parent'
  | 'sibling'
  | 'spouse'
  | 'subject'
  | 'supporter'
  | 'witness';

export type EventSignificance =
  | 'commemorative'
  | 'life_changing'
  | 'major'
  | 'minor'
  | 'moderate';

export type EventPrivacy =
  | 'family_only'
  | 'immediate_family'
  | 'private'
  | 'public'
  | 'restricted';

interface TimeSpan {
  description?: string;
  endDate: string;
  era?: string;
  startDate: string;
}

interface EventSource {
  reference: string;
  reliability: 'possible' | 'probable' | 'speculative' | 'verified';
  type: 'document' | 'inference' | 'photo' | 'record' | 'testimony';
}

interface MediaMetadata {
  dateCreated?: string;
  dimensions?: { height: number; width: number };
  duration?: number;
  format: string;
  quality: 'high' | 'low' | 'medium';
  size?: number;
}

interface GenerationMember {
  birthYear?: number;
  deathYear?: number;
  keyContributions: string[];
  memberId: string;
  name: string;
  primaryRole: string;
}

interface GenerationLegacy {
  achievements: string[];
  continuations: string[];
  lessons: string[];
  traditions: string[];
  values: string[];
}

interface LegacyImpact {
  beneficiaries: string[];
  continuingEffects: string[];
  description: string;
  traditions: string[];
  values: string[];
}

interface CelebrationDetails {
  attendees: string[];
  documentation: string[];
  location: string;
  traditions: string[];
  type: string;
}

interface TimeRelevance {
  context: string;
  period: TimeSpan;
  significance: string;
}

interface DocumentAccessControl {
  conditions?: string[];
  expiry?: string;
  grantedTo: string[];
  level: 'edit' | 'share' | 'view';
}

interface TimelinePrivacy {
  defaultLevel: EventPrivacy;
  exceptions: PrivacyException[];
  inheritanceRules: PrivacyRule[];
}

interface TimelineSharing {
  message?: string;
  permissions: string[];
  sharedAt: string;
  sharedWith: string;
}

interface PrivacyRule {
  action: EventPrivacy;
  condition: string;
  priority: number;
}

interface PrivacyException {
  authorizedBy: string;
  eventId: string;
  overrideLevel: EventPrivacy;
  reason: string;
}

interface TimelineGrouping {
  primaryBy: 'date' | 'event_type' | 'generation' | 'person' | 'theme';
  secondaryBy?: 'date' | 'event_type' | 'person' | 'significance';
  showRelationships: boolean;
}

interface VisualizationOptions {
  animations: boolean;
  layout: 'horizontal' | 'network' | 'spiral' | 'vertical';
  showDocuments: boolean;
  showMedia: boolean;
  showRelationships: boolean;
  showTimescale: boolean;
  theme: 'classic' | 'elegant' | 'minimal' | 'modern';
  zoomLevel: number;
}

interface FamilyRelationship {
  fromMember: string;
  relationshipType: string;
  strength: number;
  timeframe: TimeSpan;
  toMember: string;
  verified: boolean;
}

interface ConnectionMatrix {
  [memberId: string]: {
    [otherMemberId: string]: {
      interactions: number;
      relationshipType: string;
      strength: number;
    };
  };
}

interface InfluenceEdge {
  evidence: string[];
  fromMember: string;
  influenceType: 'example' | 'guidance' | 'inspiration' | 'mentor' | 'support';
  strength: number;
  timeframe: TimeSpan;
  toMember: string;
}

interface GenerationFlow {
  adaptations: string[];
  continuity: number; // 0-1 scale
  fromGeneration: number;
  inheritanceType: 'assets' | 'responsibilities' | 'traditions' | 'values';
  toGeneration: number;
}

class FamilyTimelineService {
  private readonly TIMELINE_VERSION = 1;
  private timelines: Map<string, FamilyTimeline> = new Map();
  private visualizations: Map<string, TimelineVisualization> = new Map();

  /**
   * Create a new family timeline
   */
  async createTimeline(
    familyId: string,
    title: string,
    description: string,
    timespan: TimeSpan
  ): Promise<FamilyTimeline> {
    const timeline: FamilyTimeline = {
      id: this.generateId(),
      familyId,
      title,
      description,
      timespan,
      events: [],
      milestones: [],
      generations: [],
      documentAssociations: [],
      privacy: {
        defaultLevel: 'family_only',
        inheritanceRules: [],
        exceptions: [],
      },
      sharing: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: this.TIMELINE_VERSION,
    };

    this.timelines.set(timeline.id, timeline);
    await this.saveTimeline(timeline);

    return timeline;
  }

  /**
   * Add event to timeline
   */
  async addEvent(
    timelineId: string,
    eventData: Omit<TimelineEvent, 'id'>
  ): Promise<TimelineEvent> {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const event: TimelineEvent = {
      id: this.generateId(),
      ...eventData,
    };

    // Validate event data
    await this.validateEvent(event);

    // Add to timeline
    timeline.events.push(event);
    timeline.lastUpdated = new Date().toISOString();

    // Auto-detect document associations
    const associations = await this.detectDocumentAssociations(event);
    timeline.documentAssociations.push(...associations);

    // Update relationships
    await this.updateRelationships(timeline, event);

    // Save changes
    await this.saveTimeline(timeline);

    return event;
  }

  /**
   * Create milestone from significant events
   */
  async createMilestone(
    timelineId: string,
    milestoneData: Omit<FamilyMilestone, 'id'>
  ): Promise<FamilyMilestone> {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const milestone: FamilyMilestone = {
      id: this.generateId(),
      ...milestoneData,
    };

    timeline.milestones.push(milestone);
    timeline.lastUpdated = new Date().toISOString();

    await this.saveTimeline(timeline);

    return milestone;
  }

  /**
   * Generate timeline visualization
   */
  async createVisualization(
    timelineId: string,
    options: Partial<TimelineVisualization>
  ): Promise<TimelineVisualization> {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const visualization: TimelineVisualization = {
      id: this.generateId(),
      viewType: 'chronological',
      filters: [],
      grouping: {
        primaryBy: 'date',
        showRelationships: true,
      },
      dateRange: timeline.timespan,
      focusElements: [],
      displayOptions: {
        showDocuments: true,
        showMedia: true,
        showRelationships: true,
        showTimescale: true,
        theme: 'modern',
        layout: 'vertical',
        zoomLevel: 1,
        animations: true,
      },
      ...options,
    };

    this.visualizations.set(visualization.id, visualization);

    return visualization;
  }

  /**
   * Generate family relationship map
   */
  async generateRelationshipMap(
    timelineId: string
  ): Promise<FamilyRelationshipMap> {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    // Extract relationships from events
    const relationships = await this.extractRelationships(timeline.events);

    // Calculate connection strengths
    const connectionStrength =
      await this.calculateConnectionStrength(relationships);

    // Identify influence patterns
    const influenceNetwork = await this.identifyInfluencePatterns(
      timeline.events,
      relationships
    );

    // Analyze generational flow
    const generationalFlow = await this.analyzeGenerationalFlow(
      timeline.generations
    );

    return {
      relationships,
      connectionStrength,
      influenceNetwork,
      generationalFlow,
    };
  }

  /**
   * Auto-detect significant events from documents
   */
  async detectEventsFromDocuments(
    _timelineId: string,
    documentIds: string[]
  ): Promise<TimelineEvent[]> {
    const detectedEvents: TimelineEvent[] = [];

    for (const documentId of documentIds) {
      const events = await this.analyzeDocumentForEvents(documentId);
      detectedEvents.push(...events);
    }

    // Remove duplicates and validate
    const uniqueEvents = await this.deduplicateEvents(detectedEvents);

    return uniqueEvents;
  }

  /**
   * Generate family legacy report
   */
  async generateLegacyReport(timelineId: string): Promise<{
    continuingTraditions: string[];
    documentHighlights: string[];
    generationalThemes: string[];
    keyMilestones: FamilyMilestone[];
    overview: string;
    recommendations: string[];
  }> {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error('Timeline not found');
    }

    // Analyze patterns and themes
    const overview = await this.generateLegacyOverview(timeline);
    const keyMilestones = this.identifyKeyMilestones(timeline.milestones);
    const generationalThemes = await this.extractGenerationalThemes(
      timeline.generations
    );
    const continuingTraditions = await this.identifyContinuingTraditions(
      timeline.events
    );
    const documentHighlights = await this.identifyDocumentHighlights(
      timeline.documentAssociations
    );
    const recommendations = await this.generateLegacyRecommendations(timeline);

    return {
      overview,
      keyMilestones,
      generationalThemes,
      continuingTraditions,
      documentHighlights,
      recommendations,
    };
  }

  /**
   * Helper methods for event analysis and processing
   */
  private async validateEvent(event: TimelineEvent): Promise<void> {
    // Validate required fields
    if (!event.title || !event.date) {
      throw new Error('Event title and date are required');
    }

    // Validate date format
    if (!this.isValidDate(event.date)) {
      throw new Error('Invalid date format');
    }

    // Validate participants
    for (const participant of event.participants) {
      if (!participant.memberId || !participant.name) {
        throw new Error('Participant must have ID and name');
      }
    }
  }

  private async detectDocumentAssociations(
    event: TimelineEvent
  ): Promise<DocumentAssociation[]> {
    const associations: DocumentAssociation[] = [];

    // Check for document references in event description
    const documentReferences = this.extractDocumentReferences(
      event.description
    );

    for (const reference of documentReferences) {
      associations.push({
        documentId: reference.id,
        documentTitle: reference.title,
        documentType: reference.type,
        associationType: this.determineAssociationType(event, reference),
        relevantEvents: [event.id],
        relevantPeople: event.participants.map(p => p.memberId),
        importance: this.assessDocumentImportance(event, reference),
        timeRelevance: {
          period: {
            startDate: event.date,
            endDate: event.endDate || event.date,
          },
          context: event.title,
          significance: event.significance,
        },
        accessControls: [],
      });
    }

    return associations;
  }

  private async updateRelationships(
    _timeline: FamilyTimeline,
    event: TimelineEvent
  ): Promise<void> {
    // Update family relationships based on event type
    if (event.type === 'marriage') {
      await this.recordMarriageRelationship(event);
    } else if (event.type === 'birth') {
      await this.recordParentChildRelationship(event);
    } else if (event.type === 'death') {
      await this.updateDeathRecord(event);
    }
  }

  private async extractRelationships(
    events: TimelineEvent[]
  ): Promise<FamilyRelationship[]> {
    const relationships: FamilyRelationship[] = [];

    for (const event of events) {
      if (event.participants.length >= 2) {
        const eventRelationships = this.extractRelationshipsFromEvent(event);
        relationships.push(...eventRelationships);
      }
    }

    return this.deduplicateRelationships(relationships);
  }

  private async calculateConnectionStrength(
    relationships: FamilyRelationship[]
  ): Promise<ConnectionMatrix> {
    const matrix: ConnectionMatrix = {};

    for (const relationship of relationships) {
      if (!matrix[relationship.fromMember]) {
        matrix[relationship.fromMember] = {};
      }

      matrix[relationship.fromMember][relationship.toMember] = {
        strength: relationship.strength,
        relationshipType: relationship.relationshipType,
        interactions: 1, // Would count actual interactions
      };
    }

    return matrix;
  }

  private async identifyInfluencePatterns(
    events: TimelineEvent[],
    _relationships: FamilyRelationship[]
  ): Promise<InfluenceEdge[]> {
    const influences: InfluenceEdge[] = [];

    // Look for mentor-mentee patterns in events
    const mentorshipEvents = events.filter(
      e => e.category === 'achievement' || e.category === 'professional'
    );

    for (const event of mentorshipEvents) {
      const influences_found = this.extractInfluenceFromEvent(event);
      influences.push(...influences_found);
    }

    return influences;
  }

  private async analyzeGenerationalFlow(
    generations: FamilyGeneration[]
  ): Promise<GenerationFlow[]> {
    const flows: GenerationFlow[] = [];

    for (let i = 0; i < generations.length - 1; i++) {
      const currentGen = generations[i];
      const nextGen = generations[i + 1];

      flows.push({
        fromGeneration: currentGen.generationNumber,
        toGeneration: nextGen.generationNumber,
        inheritanceType: 'values',
        continuity: this.calculateContinuity(currentGen, nextGen),
        adaptations: this.identifyAdaptations(currentGen, nextGen),
      });
    }

    return flows;
  }

  // Placeholder implementations for complex analysis methods
  private async analyzeDocumentForEvents(
    _documentId: string
  ): Promise<TimelineEvent[]> {
    // Would analyze document content for dates, names, events
    return [];
  }

  private async deduplicateEvents(
    events: TimelineEvent[]
  ): Promise<TimelineEvent[]> {
    // Remove duplicate events based on date, title, participants
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.date}_${event.title}_${event.participants.map(p => p.memberId).join(',')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async generateLegacyOverview(
    timeline: FamilyTimeline
  ): Promise<string> {
    const totalEvents = timeline.events.length;
    const generations = timeline.generations.length;
    const keyMilestones = timeline.milestones.filter(
      m => m.significance === 'generational'
    ).length;

    return `This family timeline spans ${generations} generations with ${totalEvents} documented events and ${keyMilestones} major milestones. The family's journey reflects themes of ${this.extractMainThemes(timeline).join(', ')}.`;
  }

  private identifyKeyMilestones(
    milestones: FamilyMilestone[]
  ): FamilyMilestone[] {
    return milestones
      .filter(
        m => m.significance === 'generational' || m.significance === 'family'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private async extractGenerationalThemes(
    generations: FamilyGeneration[]
  ): Promise<string[]> {
    const themes = new Set<string>();

    generations.forEach(gen => {
      gen.characteristics.forEach(char => themes.add(char));
      gen.legacy.values.forEach(value => themes.add(value));
    });

    return Array.from(themes);
  }

  private async identifyContinuingTraditions(
    events: TimelineEvent[]
  ): Promise<string[]> {
    // Look for recurring event patterns that indicate traditions
    const traditions: string[] = [];
    const eventTypes = events.reduce(
      (acc, event) => {
        const key = `${event.type}_${event.category}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    Object.entries(eventTypes).forEach(([eventType, count]) => {
      if (count >= 3) {
        // Recurring events might be traditions
        traditions.push(`Regular ${eventType.replace('_', ' ')} celebrations`);
      }
    });

    return traditions;
  }

  private async identifyDocumentHighlights(
    associations: DocumentAssociation[]
  ): Promise<string[]> {
    return associations
      .filter(
        assoc => assoc.importance === 'critical' || assoc.importance === 'high'
      )
      .map(assoc => `${assoc.documentTitle} (${assoc.associationType})`)
      .slice(0, 10);
  }

  private async generateLegacyRecommendations(
    timeline: FamilyTimeline
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Check for gaps
    if (timeline.events.length < 10) {
      recommendations.push(
        'Consider adding more family events and milestones to create a richer timeline'
      );
    }

    if (timeline.documentAssociations.length === 0) {
      recommendations.push(
        'Link relevant documents to timeline events for better context'
      );
    }

    if (timeline.generations.length === 0) {
      recommendations.push(
        'Define family generations to better understand legacy patterns'
      );
    }

    return recommendations;
  }

  // Utility methods
  private generateId(): string {
    return crypto.randomUUID();
  }

  private isValidDate(dateStr: string): boolean {
    return !isNaN(Date.parse(dateStr));
  }

  private extractDocumentReferences(
    _text: string
  ): Array<{ id: string; title: string; type: string }> {
    // Extract document references from text (placeholder)
    return [];
  }

  private determineAssociationType(
    event: TimelineEvent,
    _reference: any
  ): AssociationType {
    if (event.type === 'birth') return 'created_during';
    if (event.type === 'marriage') return 'legal_for';
    if (event.type === 'death') return 'relates_to';
    return 'relates_to';
  }

  private assessDocumentImportance(
    event: TimelineEvent,
    _reference: any
  ): DocumentAssociation['importance'] {
    if (event.significance === 'life_changing') return 'critical';
    if (event.significance === 'major') return 'high';
    return 'medium';
  }

  private async recordMarriageRelationship(
    _event: TimelineEvent
  ): Promise<void> {
    // Record marriage relationship between participants
  }

  private async recordParentChildRelationship(
    _event: TimelineEvent
  ): Promise<void> {
    // Record parent-child relationship from birth event
  }

  private async updateDeathRecord(_event: TimelineEvent): Promise<void> {
    // Update family member death record
  }

  private extractRelationshipsFromEvent(
    event: TimelineEvent
  ): FamilyRelationship[] {
    const relationships: FamilyRelationship[] = [];

    // Extract relationships based on participant roles
    for (let i = 0; i < event.participants.length; i++) {
      for (let j = i + 1; j < event.participants.length; j++) {
        const participant1 = event.participants[i];
        const participant2 = event.participants[j];

        relationships.push({
          fromMember: participant1.memberId,
          toMember: participant2.memberId,
          relationshipType: this.inferRelationshipType(
            participant1.role,
            participant2.role
          ),
          strength: this.calculateRelationshipStrength(
            event,
            participant1,
            participant2
          ),
          verified: event.verified,
          timeframe: {
            startDate: event.date,
            endDate: event.endDate || event.date,
          },
        });
      }
    }

    return relationships;
  }

  private deduplicateRelationships(
    relationships: FamilyRelationship[]
  ): FamilyRelationship[] {
    const seen = new Set<string>();
    return relationships.filter(rel => {
      const key = `${rel.fromMember}_${rel.toMember}_${rel.relationshipType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private extractInfluenceFromEvent(_event: TimelineEvent): InfluenceEdge[] {
    // Extract influence patterns from achievement events
    return [];
  }

  private calculateContinuity(
    currentGen: FamilyGeneration,
    nextGen: FamilyGeneration
  ): number {
    // Calculate how much of current generation's values/traditions continue
    const currentValues = new Set(currentGen.legacy.values);
    const nextValues = new Set(nextGen.legacy.values);
    const overlap = new Set([...currentValues].filter(v => nextValues.has(v)));

    return overlap.size / currentValues.size;
  }

  private identifyAdaptations(
    _currentGen: FamilyGeneration,
    _nextGen: FamilyGeneration
  ): string[] {
    // Identify how values/traditions were adapted between generations
    return ['Modern interpretations of traditional values'];
  }

  private extractMainThemes(timeline: FamilyTimeline): string[] {
    // Extract main themes from events and milestones
    const themes = new Set<string>();

    timeline.events.forEach(event => {
      event.tags.forEach(tag => themes.add(tag));
    });

    return Array.from(themes).slice(0, 5);
  }

  private inferRelationshipType(
    role1: ParticipantRole,
    role2: ParticipantRole
  ): string {
    if (role1 === 'spouse' && role2 === 'spouse') return 'married';
    if (role1 === 'parent' && role2 === 'child') return 'parent-child';
    if (role1 === 'sibling' && role2 === 'sibling') return 'siblings';
    return 'family';
  }

  private calculateRelationshipStrength(
    event: TimelineEvent,
    p1: EventParticipant,
    p2: EventParticipant
  ): number {
    let strength = 0.5; // Base strength

    if (event.significance === 'life_changing') strength += 0.3;
    if (p1.significance === 'primary' || p2.significance === 'primary')
      strength += 0.2;

    return Math.min(1, strength);
  }

  private async saveTimeline(timeline: FamilyTimeline): Promise<void> {
    // Save to persistent storage
    console.log(`Saving timeline: ${timeline.id}`);
  }
}

// Export singleton instance
export const familyTimeline = new FamilyTimelineService();
export default familyTimeline;
