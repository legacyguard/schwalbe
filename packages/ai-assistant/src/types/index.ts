export interface UserContext {
  userId?: string;
  sessionId: string;
  onboardingCompleted?: boolean;
  currentStep?: string;
  persona?: {
    familyStatus: string;
    priorities: string[];
    riskTolerance: string;
    digitalLiteracy: string;
  };
  completedMilestones?: string[];
  preferences?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: Action[];
  };
}

export interface Action {
  id: string;
  type: 'navigate' | 'complete_milestone' | 'show_info' | 'ask_question';
  label: string;
  payload?: unknown;
  priority?: 'high' | 'medium' | 'low';
}

export interface KnowledgeBaseEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedMilestones?: string[];
}

export interface PersonalityConfig {
  name: string;
  tone: 'empathetic' | 'professional' | 'encouraging' | 'direct';
  empathy: number; // 0-1
  formality: number; // 0-1
  encouragement: number; // 0-1
  traits: string[];
}

export interface SofiaResponse {
  message: string;
  actions?: Action[];
  personality: PersonalityConfig;
  confidence: number;
  followUpQuestions?: string[];
}

export interface ContextService {
  getUserContext(sessionId: string): Promise<UserContext>;
  updateUserContext(sessionId: string, updates: Partial<UserContext>): Promise<void>;
  getRelevantKnowledge(query: string, context: UserContext): Promise<KnowledgeBaseEntry[]>;
}

export interface PersonalityService {
  generateResponse(
    userMessage: string,
    context: UserContext,
    knowledge: KnowledgeBaseEntry[]
  ): Promise<SofiaResponse>;
  adaptPersonality(context: UserContext): PersonalityConfig;
}

export interface ChatService {
  sendMessage(message: string, sessionId: string): Promise<ChatMessage>;
  getConversationHistory(sessionId: string, limit?: number): Promise<ChatMessage[]>;
  clearConversation(sessionId: string): Promise<void>;
}